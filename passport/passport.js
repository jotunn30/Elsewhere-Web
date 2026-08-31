import { supabase } from './supabase.js';

const book = document.querySelector('#passport-book');
const cover = document.querySelector('#passport-cover');
const spread = document.querySelector('#passport-spread');
const previousButton = document.querySelector('#passport-previous');
const nextButton = document.querySelector('#passport-next');
const status = document.querySelector('#passport-status');
const progress = [...document.querySelectorAll('.passport-progress span')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const signInForm = document.querySelector('#passport-signin-form');
const memberPanel = document.querySelector('#passport-member');
const memberEmail = document.querySelector('#passport-member-email');
const signOutButton = document.querySelector('#passport-signout');
const profileForm = document.querySelector('#passport-profile-form');
const profileNameInput = document.querySelector('#profile-name');
const profileHomeBaseInput = document.querySelector('#profile-home-base');
const authFeedback = document.querySelector('#passport-auth-feedback');
const accountDescription = document.querySelector('#account-description');
const syncNote = document.querySelector('#passport-sync-note');

const signedOutProfile = {
  name: 'SIGN IN TO COMPLETE',
  homeBase: '—',
  memberSince: '—',
  passportNumber: 'PENDING',
};

let profile = signedOutProfile;
let passportStamps = [];
let currentUser = null;
const totalSpreads = 3;
let currentPosition = 0;
let isTurning = false;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stampSpaces(start, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const earnedStamp = passportStamps[start + index - 1];

    if (earnedStamp) {
      const detourName = earnedStamp.detour_id.replaceAll('-', ' ').toUpperCase();
      const awardedDate = new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(earnedStamp.awarded_at));
      return `<div class="stamp-space is-earned" aria-label="${escapeHtml(detourName)}, earned ${escapeHtml(awardedDate)}"><span>${escapeHtml(detourName)}</span></div>`;
    }

    return '<div class="stamp-space" aria-hidden="true"></div>';
  }).join('');
}

function register(title, number) {
  return `<div class="page-register"><span>${title}</span><span>${number}</span></div>`;
}

function stampPage(position, pageNumber, firstStamp) {
  return `
    <section class="passport-page passport-page--${position} stamp-page" aria-label="Stamp page ${pageNumber}">
      ${register(`COMPLETED DETOURS / ${pageNumber}`, pageNumber)}
      <div class="stamp-grid" aria-label="Stamp page">${stampSpaces(firstStamp)}</div>
    </section>`;
}

function identitySpread() {
  return {
    upper: `
      <section class="passport-page passport-page--upper identity-page" aria-label="Identity page">
      ${register('ELSEWHERE / IDENTITY', 'P')}
      <div class="identity-layout">
        <div class="passport-portrait" aria-label="Profile image placeholder">
          <span class="portrait-head" aria-hidden="true"></span>
          <span class="portrait-shoulders" aria-hidden="true"></span>
          <small>PHOTO</small>
        </div>
        <dl class="identity-fields">
          <div class="identity-field identity-field--wide"><dt>Name</dt><dd>${escapeHtml(profile.name)}</dd></div>
          <div class="identity-field"><dt>Home base</dt><dd>${escapeHtml(profile.homeBase)}</dd></div>
          <div class="identity-field"><dt>Member since</dt><dd>${escapeHtml(profile.memberSince)}</dd></div>
          <div class="identity-field identity-field--wide"><dt>Passport no.</dt><dd>${escapeHtml(profile.passportNumber)}</dd></div>
        </dl>
      </div>
      <div class="identity-machine-line" aria-hidden="true">P&lt;ELSEWHERE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </section>`,
    lower: stampPage('lower', '01', 1),
  };
}

function stampSpread(spreadNumber, firstStamp) {
  const upperPage = String(spreadNumber * 2).padStart(2, '0');
  const lowerPage = String(spreadNumber * 2 + 1).padStart(2, '0');
  return {
    upper: stampPage('upper', upperPage, firstStamp),
    lower: stampPage('lower', lowerPage, firstStamp + 6),
  };
}

function spreadPages(position) {
  return position === 1
    ? identitySpread()
    : stampSpread(position - 1, position === 2 ? 7 : 19);
}

function renderSpread(position) {
  const pages = spreadPages(position);
  spread.innerHTML = pages.upper + pages.lower;
}

function updateControls() {
  const isCover = currentPosition === 0;
  book.classList.toggle('is-open', !isCover);
  book.dataset.state = isCover ? 'cover' : 'open';
  spread.setAttribute('aria-hidden', String(isCover));
  cover.setAttribute('aria-hidden', String(!isCover));
  cover.tabIndex = isCover ? 0 : -1;

  previousButton.disabled = isCover;
  nextButton.disabled = currentPosition === totalSpreads;
  nextButton.setAttribute('aria-label', isCover ? 'Open passport' : 'Next passport page');
  previousButton.setAttribute('aria-label', currentPosition === 1 ? 'Close passport' : 'Previous passport page');

  status.textContent = isCover
    ? 'Cover — use the right arrow to open'
    : `Spread ${String(currentPosition).padStart(2, '0')} of ${String(totalSpreads).padStart(2, '0')}`;

  progress.forEach((item, index) => item.classList.toggle('is-current', index === currentPosition));
}

function goTo(position) {
  if (isTurning || position < 0 || position > totalSpreads || position === currentPosition) return;

  const wasCover = currentPosition === 0;
  const willBeCover = position === 0;
  const direction = position > currentPosition ? 'forward' : 'backward';

  if (wasCover || willBeCover) {
    currentPosition = position;
    if (!willBeCover) renderSpread(currentPosition);
    updateControls();

    isTurning = true;
    book.classList.add('is-turning');
    previousButton.disabled = true;
    nextButton.disabled = true;
    window.setTimeout(() => {
      book.classList.remove('is-turning');
      isTurning = false;
      updateControls();
    }, reduceMotion ? 620 : 920);
    return;
  }

  isTurning = true;
  book.classList.add('is-turning');
  previousButton.disabled = true;
  nextButton.disabled = true;
  status.textContent = direction === 'forward' ? 'Turning forward…' : 'Turning back…';

  const fromPages = spreadPages(currentPosition);
  const toPages = spreadPages(position);
  const underlyingUpper = direction === 'forward' ? fromPages.upper : toPages.upper;
  const underlyingLower = direction === 'forward' ? toPages.lower : fromPages.lower;
  const sheetFront = direction === 'forward' ? fromPages.lower : toPages.lower;
  const sheetBack = direction === 'forward' ? toPages.upper : fromPages.upper;

  spread.innerHTML = underlyingUpper + underlyingLower;

  const turningSheet = document.createElement('div');
  turningSheet.className = `passport-turn-sheet passport-turn-sheet--${direction}`;
  turningSheet.setAttribute('aria-hidden', 'true');
  turningSheet.innerHTML = `
    <div class="passport-turn-face passport-turn-face--front">${sheetFront}</div>
    <div class="passport-turn-face passport-turn-face--back">${sheetBack}</div>`;
  spread.append(turningSheet);

  let turnFinished = false;
  const finishTurn = () => {
    if (turnFinished) return;
    turnFinished = true;
    currentPosition = position;
    renderSpread(currentPosition);
    book.classList.remove('is-turning');
    isTurning = false;
    updateControls();
  };

  turningSheet.addEventListener('animationend', finishTurn, { once: true });
  window.setTimeout(finishTurn, reduceMotion ? 780 : 1100);
}

function formatMemberSince(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })
    .format(new Date(value))
    .toUpperCase();
}

function setFeedback(message = '', isError = false) {
  authFeedback.textContent = message;
  authFeedback.classList.toggle('is-error', isError);
}

function refreshVisibleSpread() {
  if (currentPosition > 0 && !isTurning) renderSpread(currentPosition);
}

function showSignedOut() {
  currentUser = null;
  profile = signedOutProfile;
  passportStamps = [];
  signInForm.hidden = false;
  memberPanel.hidden = true;
  accountDescription.textContent = 'Use a private email link to open your passport on any device.';
  syncNote.textContent = 'Sign in to sync your identity. Stamps appear only after verified completions.';
  refreshVisibleSpread();
}

async function loadPassportData(user) {
  const [profileResult, stampsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, home_base, passport_number, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('stamps')
      .select('detour_id, awarded_at')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: true }),
  ]);

  if (profileResult.error) {
    profile = {
      name: user.email?.split('@')[0]?.toUpperCase() || 'TRAVELER',
      homeBase: '—',
      memberSince: '—',
      passportNumber: 'SETUP REQUIRED',
    };
    passportStamps = [];
    setFeedback('Connected. Run the Elsewhere setup SQL in Supabase to activate profiles and stamps.', true);
    syncNote.textContent = 'Account connected — passport database setup is still required.';
    refreshVisibleSpread();
    return;
  }

  const profileRow = profileResult.data;
  profile = {
    name: profileRow.display_name?.trim()?.toUpperCase() || 'TRAVELER',
    homeBase: profileRow.home_base?.trim()?.toUpperCase() || 'NOT SET',
    memberSince: formatMemberSince(profileRow.created_at),
    passportNumber: profileRow.passport_number,
  };
  passportStamps = stampsResult.error ? [] : (stampsResult.data ?? []);
  profileNameInput.value = profileRow.display_name ?? '';
  profileHomeBaseInput.value = profileRow.home_base ?? '';
  setFeedback(stampsResult.error ? 'Profile loaded, but stamps could not be retrieved.' : 'Passport synced.', Boolean(stampsResult.error));
  syncNote.textContent = stampsResult.error
    ? 'Identity synced — stamp records are temporarily unavailable.'
    : `Signed in — ${passportStamps.length} earned ${passportStamps.length === 1 ? 'stamp' : 'stamps'} synced securely.`;
  refreshVisibleSpread();
}

async function syncAccount(session) {
  const user = session?.user;
  if (!user) {
    showSignedOut();
    return;
  }

  currentUser = user;
  signInForm.hidden = true;
  memberPanel.hidden = false;
  memberEmail.textContent = user.email ?? 'Elsewhere traveler';
  accountDescription.textContent = 'Your identity and earned stamps travel with this account.';
  setFeedback('Loading your passport…');
  await loadPassportData(user);
}

signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = signInForm.querySelector('button[type="submit"]');
  const email = new FormData(signInForm).get('email')?.toString().trim();
  if (!email) return;

  submitButton.disabled = true;
  setFeedback('Sending your private sign-in link…');
  const redirectUrl = new URL('.', window.location.href);
  redirectUrl.search = '';
  redirectUrl.hash = '';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl.href },
  });

  submitButton.disabled = false;
  setFeedback(
    error ? error.message : 'Link sent. Check your email, then return here to open your passport.',
    Boolean(error),
  );
});

signOutButton.addEventListener('click', async () => {
  signOutButton.disabled = true;
  const { error } = await supabase.auth.signOut();
  signOutButton.disabled = false;
  if (error) setFeedback(error.message, true);
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const submitButton = profileForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setFeedback('Saving your passport details…');

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profileNameInput.value.trim(),
      home_base: profileHomeBaseInput.value.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentUser.id);

  submitButton.disabled = false;
  if (error) {
    setFeedback(error.message, true);
    return;
  }

  await loadPassportData(currentUser);
  setFeedback('Details saved. Your passport is up to date.');
});

cover.addEventListener('click', () => goTo(1));
previousButton.addEventListener('click', () => goTo(currentPosition - 1));
nextButton.addEventListener('click', () => goTo(currentPosition + 1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goTo(currentPosition - 1);
  if (event.key === 'ArrowRight') goTo(currentPosition + 1);
});

renderSpread(1);
updateControls();

const { data: initialSessionData } = await supabase.auth.getSession();
await syncAccount(initialSessionData.session);

supabase.auth.onAuthStateChange((_event, session) => {
  window.setTimeout(() => syncAccount(session), 0);
});
