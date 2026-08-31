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
-- They cannot create runs or award stamps directly; a verified Edge Function will do that.
