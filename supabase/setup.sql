-- Elsewhere Passport database setup
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  home_base text not null default '' check (char_length(home_base) <= 80),
  passport_number text not null unique default (
    'ELW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.detour_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  detour_id text not null check (char_length(detour_id) <= 120),
  status text not null default 'started' check (status in ('started', 'completed', 'rejected')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  detour_id text not null check (char_length(detour_id) <= 120),
  run_id uuid not null unique references public.detour_runs(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, detour_id)
);

create index if not exists detour_runs_user_started_idx
  on public.detour_runs (user_id, started_at desc);

create index if not exists stamps_user_awarded_idx
  on public.stamps (user_id, awarded_at asc);

alter table public.profiles enable row level security;
alter table public.detour_runs enable row level security;
alter table public.stamps enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.detour_runs from anon, authenticated;
revoke all on table public.stamps from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, home_base, updated_at) on table public.profiles to authenticated;
grant select on table public.detour_runs to authenticated;
grant select on table public.stamps to authenticated;
grant all on table public.profiles, public.detour_runs, public.stamps to service_role;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own detour runs" on public.detour_runs;
create policy "Users can read their own detour runs"
  on public.detour_runs for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own stamps" on public.stamps;
create policy "Users can read their own stamps"
  on public.stamps for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.handle_new_elsewhere_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'TRAVELER'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_elsewhere_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_elsewhere on auth.users;
create trigger on_auth_user_created_elsewhere
  after insert on auth.users
  for each row execute procedure public.handle_new_elsewhere_user();

-- Backfill a profile if a test user was created before this script was run.
insert into public.profiles (id, display_name)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(coalesce(email, ''), '@', 1), ''),
    'TRAVELER'
  )
from auth.users
on conflict (id) do nothing;

-- Security model:
-- Signed-in users may read only their own profile, runs, and stamps.
-- They may edit only display_name, home_base, and updated_at on their profile.
-- They cannot create runs or award stamps directly; verified database functions do that.

-- Free Journey progression ---------------------------------------------------
-- Re-run this whole file after pulling the Journey Mode update. These objects
-- are idempotent, and all timing and stamp-award decisions stay in Supabase.

alter table public.stamps
  add column if not exists stamp_code text,
  add column if not exists discount_percent smallint not null default 0
    check (discount_percent between 0 and 100),
  add column if not exists prize_entries integer not null default 0
    check (prize_entries >= 0);

create unique index if not exists stamps_stamp_code_idx
  on public.stamps (stamp_code)
  where stamp_code is not null;

create table if not exists public.journey_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journey_id text not null check (char_length(journey_id) <= 120),
  status text not null default 'ready'
    check (status in ('ready', 'active', 'paused', 'completed')),
  current_step smallint not null default 0 check (current_step between 0 and 6),
  active_seconds bigint not null default 0 check (active_seconds >= 0),
  segment_started_at timestamptz,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, journey_id)
);

create table if not exists public.journey_step_completions (
  id uuid primary key default gen_random_uuid(),
  journey_run_id uuid not null references public.journey_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  journey_id text not null check (char_length(journey_id) <= 120),
  detour_id text not null check (char_length(detour_id) <= 120),
  step_index smallint not null check (step_index between 0 and 5),
  required_seconds integer not null check (required_seconds > 0),
  elapsed_seconds bigint not null check (elapsed_seconds >= required_seconds),
  completed_at timestamptz not null default now(),
  unique (journey_run_id, step_index)
);

create index if not exists journey_runs_user_updated_idx
  on public.journey_runs (user_id, updated_at desc);

create index if not exists journey_step_completions_user_idx
  on public.journey_step_completions (user_id, completed_at asc);

alter table public.journey_runs enable row level security;
alter table public.journey_step_completions enable row level security;

revoke all on table public.journey_runs from anon, authenticated;
revoke all on table public.journey_step_completions from anon, authenticated;
grant select on table public.journey_runs to authenticated;
grant select on table public.journey_step_completions to authenticated;
grant all on table public.journey_runs, public.journey_step_completions to service_role;

drop policy if exists "Users can read their own journey runs" on public.journey_runs;
create policy "Users can read their own journey runs"
  on public.journey_runs for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own journey completions" on public.journey_step_completions;
create policy "Users can read their own journey completions"
  on public.journey_step_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.free_journey_required_seconds(step_number integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case step_number
    when 0 then 2040 -- 34 minutes
    when 1 then 3060 -- 51 minutes
    when 2 then 1620 -- 27 minutes
    when 3 then 2520 -- 42 minutes
    when 4 then 3780 -- 63 minutes
    when 5 then 2340 -- 39 minutes
    else 0
  end;
$$;

revoke execute on function public.free_journey_required_seconds(integer)
  from public, anon, authenticated;

create or replace function public.get_free_journey_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  traveler_id uuid := auth.uid();
  journey public.journey_runs%rowtype;
  elapsed bigint := 0;
  required integer := 0;
begin
  if traveler_id is null then
    raise exception using errcode = '42501', message = 'Sign in before starting the journey.';
  end if;

  select * into journey
  from public.journey_runs
  where user_id = traveler_id and journey_id = 'free'
  limit 1;

  if not found then
    return jsonb_build_object(
      'ok', true,
      'status', 'not_started',
      'current_step', 0,
      'elapsed_seconds', 0,
      'required_seconds', public.free_journey_required_seconds(0),
      'remaining_seconds', public.free_journey_required_seconds(0),
      'stamp_awarded', false,
      'server_now', clock_timestamp()
    );
  end if;

  if journey.current_step < 6 then
    required := public.free_journey_required_seconds(journey.current_step);
  end if;

  elapsed := journey.active_seconds;
  if journey.status = 'active' and journey.segment_started_at is not null then
    elapsed := elapsed + greatest(
      0,
      floor(extract(epoch from (clock_timestamp() - journey.segment_started_at)))::bigint
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'run_id', journey.id,
    'status', journey.status,
    'current_step', journey.current_step,
    'elapsed_seconds', elapsed,
    'required_seconds', required,
    'remaining_seconds', greatest(required - elapsed, 0),
    'started_at', journey.started_at,
    'completed_at', journey.completed_at,
    'stamp_awarded', exists (
      select 1 from public.stamps
      where user_id = traveler_id and detour_id = 'free-journey'
    ),
    'stamp_code', (
      select stamp_code from public.stamps
      where user_id = traveler_id and detour_id = 'free-journey'
      limit 1
    ),
    'discount_percent', coalesce((
      select discount_percent from public.stamps
      where user_id = traveler_id and detour_id = 'free-journey'
      limit 1
    ), 0),
    'prize_entries', coalesce((
      select prize_entries from public.stamps
      where user_id = traveler_id and detour_id = 'free-journey'
      limit 1
    ), 0),
    'server_now', clock_timestamp()
  );
end;
$$;

create or replace function public.start_free_journey()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  traveler_id uuid := auth.uid();
begin
  if traveler_id is null then
    raise exception using errcode = '42501', message = 'Sign in before starting the journey.';
  end if;

  insert into public.journey_runs (user_id, journey_id)
  values (traveler_id, 'free')
  on conflict (user_id, journey_id) do nothing;

  return public.get_free_journey_status();
end;
$$;

create or replace function public.begin_free_journey_step()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  traveler_id uuid := auth.uid();
  journey public.journey_runs%rowtype;
begin
  if traveler_id is null then
    raise exception using errcode = '42501', message = 'Sign in before starting the journey.';
  end if;

  select * into journey
  from public.journey_runs
  where user_id = traveler_id and journey_id = 'free'
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Start the Free Journey first.';
  end if;

  if journey.status in ('ready', 'paused') and journey.current_step < 6 then
    update public.journey_runs
    set status = 'active',
        segment_started_at = clock_timestamp(),
        updated_at = clock_timestamp()
    where id = journey.id;
  end if;

  return public.get_free_journey_status();
end;
$$;

create or replace function public.pause_free_journey_step()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  traveler_id uuid := auth.uid();
  journey public.journey_runs%rowtype;
  elapsed bigint;
begin
  if traveler_id is null then
    raise exception using errcode = '42501', message = 'Sign in before starting the journey.';
  end if;

  select * into journey
  from public.journey_runs
  where user_id = traveler_id and journey_id = 'free'
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Start the Free Journey first.';
  end if;

  if journey.status = 'active' and journey.segment_started_at is not null then
    elapsed := journey.active_seconds + greatest(
      0,
      floor(extract(epoch from (clock_timestamp() - journey.segment_started_at)))::bigint
    );

    update public.journey_runs
    set status = 'paused',
        active_seconds = elapsed,
        segment_started_at = null,
        updated_at = clock_timestamp()
    where id = journey.id;
  end if;

  return public.get_free_journey_status();
end;
$$;

create or replace function public.finish_free_journey_step()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  traveler_id uuid := auth.uid();
  journey public.journey_runs%rowtype;
  elapsed bigint;
  required integer;
  reward_run_id uuid;
  result jsonb;
begin
  if traveler_id is null then
    raise exception using errcode = '42501', message = 'Sign in before starting the journey.';
  end if;

  select * into journey
  from public.journey_runs
  where user_id = traveler_id and journey_id = 'free'
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Start the Free Journey first.';
  end if;

  if journey.status <> 'active' or journey.current_step >= 6 or journey.segment_started_at is null then
    result := public.get_free_journey_status();
    return result || jsonb_build_object('ok', false, 'code', 'detour_not_active');
  end if;

  required := public.free_journey_required_seconds(journey.current_step);
  elapsed := journey.active_seconds + greatest(
    0,
    floor(extract(epoch from (clock_timestamp() - journey.segment_started_at)))::bigint
  );

  if elapsed < required then
    result := public.get_free_journey_status();
    return result || jsonb_build_object('ok', false, 'code', 'time_remaining');
  end if;

  insert into public.journey_step_completions (
    journey_run_id,
    user_id,
    journey_id,
    detour_id,
    step_index,
    required_seconds,
    elapsed_seconds
  ) values (
    journey.id,
    traveler_id,
    'free',
    'free-detour-' || lpad((journey.current_step + 1)::text, 2, '0'),
    journey.current_step,
    required,
    elapsed
  )
  on conflict (journey_run_id, step_index) do nothing;

  if journey.current_step = 5 then
    insert into public.detour_runs (user_id, detour_id, status, started_at, completed_at)
    values (traveler_id, 'free-journey', 'completed', journey.started_at, clock_timestamp())
    returning id into reward_run_id;

    insert into public.stamps (
      user_id,
      detour_id,
      run_id,
      stamp_code,
      discount_percent,
      prize_entries
    ) values (
      traveler_id,
      'free-journey',
      reward_run_id,
      'FREE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
      10,
      1
    )
    on conflict (user_id, detour_id) do update
    set stamp_code = coalesce(stamps.stamp_code, excluded.stamp_code),
        discount_percent = greatest(stamps.discount_percent, excluded.discount_percent),
        prize_entries = greatest(stamps.prize_entries, excluded.prize_entries);

    update public.journey_runs
    set status = 'completed',
        current_step = 6,
        active_seconds = 0,
        segment_started_at = null,
        completed_at = clock_timestamp(),
        updated_at = clock_timestamp()
    where id = journey.id;
  else
    update public.journey_runs
    set status = 'ready',
        current_step = current_step + 1,
        active_seconds = 0,
        segment_started_at = null,
        updated_at = clock_timestamp()
    where id = journey.id;
  end if;

  result := public.get_free_journey_status();
  return result || jsonb_build_object(
    'ok', true,
    'just_completed', true,
    'stamp_just_awarded', journey.current_step = 5
  );
end;
$$;

revoke execute on function public.get_free_journey_status() from public, anon;
revoke execute on function public.start_free_journey() from public, anon;
revoke execute on function public.begin_free_journey_step() from public, anon;
revoke execute on function public.pause_free_journey_step() from public, anon;
revoke execute on function public.finish_free_journey_step() from public, anon;

grant execute on function public.get_free_journey_status() to authenticated;
grant execute on function public.start_free_journey() to authenticated;
grant execute on function public.begin_free_journey_step() to authenticated;
grant execute on function public.pause_free_journey_step() to authenticated;
grant execute on function public.finish_free_journey_step() to authenticated;

-- Journey security model:
-- Authenticated users can read only their own journey state. They cannot write
-- progression, elapsed time, completion rows, reward codes, or stamps directly.
-- The security-definer RPC functions use Supabase server time, enforce the six
-- detours in order, and award the Free Journey stamp only after all six timers.
