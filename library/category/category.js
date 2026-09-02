import { supabase } from '../../passport/supabase.js';

const categories = {
  free: {
    number: '01',
    title: 'FREE',
    description: 'For an escape that costs nothing but attention.',
    image: '/images/library/free.webp',
  },
  solo: {
    number: '02',
    title: 'SOLO',
    description: 'For wandering at your own pace.',
    image: '/images/library/solo.webp',
  },
  'with-a-friend': {
    number: '03',
    title: 'WITH A FRIEND',
    description: 'For two people willing to take the long way.',
    image: '/images/library/with-a-friend.webp',
  },
  outdoors: {
    number: '04',
    title: 'OUTDOORS',
    description: 'For fresh air and beautifully wrong turns.',
    image: '/images/library/outdoors.webp',
  },
  'weather-dependent': {
    number: '05',
    title: 'WEATHER DEPENDENT',
    description: 'For plans shaped by whatever the sky is doing.',
    image: '/images/library/weather-dependent.webp',
  },
  indoors: {
    number: '06',
    title: 'INDOORS',
    description: 'For small escapes without stepping outside.',
    image: '/images/library/indoors.webp',
  },
  creative: {
    number: '07',
    title: 'CREATIVE',
    description: 'For making something out of an ordinary day.',
    image: '/images/library/creative.webp',
  },
  'under-30-min': {
    number: '08',
    title: '0–30 MIN',
    description: 'For a quick escape that fits into a spare half hour.',
    image: '/images/library/under-30-min.webp',
  },
  'under-60-min': {
    number: '09',
    title: '31–60 MIN',
    description: 'For giving an ordinary hour somewhere better to go.',
    image: '/images/library/under-60-min.webp',
  },
  'over-60-min': {
    number: '10',
    title: '60+ MIN',
    description: 'For taking the long way without watching the clock.',
    image: '/images/library/over-60-min.webp',
  },
};

const detours = [
  {
    id: 'free-detour-01',
    eyebrow: 'Detour no. 01',
    title: 'Follow the color yellow',
    instructions: 'Leave with no destination. Take the first yellow thing you see as a sign, then the next. Stop after seven signs.',
    time: '34 minutes',
    durationSeconds: 34 * 60,
    take: 'One small coin',
    rule: 'No maps allowed',
    reward: 'A new shortcut home',
    accent: '#ff5b35',
    image: '/detours/yellow-trail.webp',
    imageAlt: 'A yellow bicycle, flowers, umbrella, and doorway form a trail through a quiet street.',
  },
  {
    id: 'free-detour-02',
    eyebrow: 'Detour no. 02',
    title: 'Find the quietest table',
    instructions: 'Enter the third café you pass. Order something you have never tried and write down the best sentence you overhear.',
    time: '51 minutes',
    durationSeconds: 51 * 60,
    take: 'A blunt pencil',
    rule: 'Keep your phone away',
    reward: 'One borrowed story',
    accent: '#2254f4',
    image: '/detours/quiet-table.webp',
    imageAlt: 'A quiet café table with a warm drink, an unfamiliar pastry, a blunt pencil, and a blank notebook.',
  },
  {
    id: 'free-detour-03',
    eyebrow: 'Detour no. 03',
    title: 'Collect five tiny wonders',
    instructions: 'Walk one familiar street very slowly. Photograph only details smaller than your palm. Give the collection a grand title.',
    time: '27 minutes',
    durationSeconds: 27 * 60,
    take: 'Your sharpest eyes',
    rule: 'Nothing expensive counts',
    reward: 'Proof the day was here',
    accent: '#d448a8',
    image: '/detours/tiny-wonders.webp',
    imageAlt: 'Five tiny found objects resting on a sunlit stone ledge.',
  },
  {
    id: 'free-detour-04',
    eyebrow: 'Detour no. 04',
    title: 'Ask a stranger for a song',
    instructions: 'Find someone who looks unhurried. Ask what they would play on a long train ride. Listen to it while walking nowhere useful.',
    time: '42 minutes',
    durationSeconds: 42 * 60,
    take: 'A little courage',
    rule: 'Accept the first answer',
    reward: 'A borrowed soundtrack',
    accent: '#16836d',
    image: '/detours/borrowed-song.webp',
    imageAlt: 'Two people exchange a pair of wired headphones beside a waiting train.',
  },
  {
    id: 'free-detour-05',
    eyebrow: 'Detour no. 05',
    title: 'Visit a future memory',
    instructions: 'Choose a nearby place you have never entered. Sit for ten minutes and imagine telling someone about this exact afternoon in ten years.',
    time: '63 minutes',
    durationSeconds: 63 * 60,
    take: 'Something to drink',
    rule: 'Do not rush the ending',
    reward: 'A memory in advance',
    accent: '#8652cc',
    image: '/detours/future-memory.webp',
    imageAlt: 'A person sits with a drink in a sunlit glasshouse, looking out through the plants.',
  },
  {
    id: 'free-detour-06',
    eyebrow: 'Detour no. 06',
    title: 'Let a coin plan the route',
    instructions: 'At every corner, flip: heads means left, tails means right. Continue until you meet a door you wish you could open.',
    time: '39 minutes',
    durationSeconds: 39 * 60,
    take: 'One decisive coin',
    rule: 'Turn back only once',
    reward: 'A beautifully wrong turn',
    accent: '#e78d10',
    image: '/detours/coin-route.webp',
    imageAlt: 'A hand flips a coin where two old city streets split left and right.',
  },
];

const souvenirPrompts = [
  'What was the seventh yellow sign that brought you here?',
  'Save the best sentence you overheard — or the one you imagined hearing.',
  'What grand title did you give your collection of tiny wonders?',
  'Which song did the stranger choose for the long train ride?',
  'Write one sentence your future self might remember about this place.',
  'Describe the door you reached and why you wished you could open it.',
];

const nextClues = [
  'Next card: somewhere quiet, with one borrowed sentence.',
  'Next card: five things smaller than your palm.',
  'Next card: a soundtrack that belongs to someone else.',
  'Next card: a memory that has not happened yet.',
  'Final card: one coin, two directions, no useful destination.',
  'The complete passport stamp is waiting on the other side.',
];

const requestedCategory = new URLSearchParams(window.location.search).get('category');
const categoryKey = Object.hasOwn(categories, requestedCategory) ? requestedCategory : 'free';
const category = categories[categoryKey];

const elements = {
  openFolder: document.querySelector('#open-folder'),
  folderNumber: document.querySelector('#folder-number'),
  folderLabel: document.querySelector('#folder-label'),
  folderCount: document.querySelector('#folder-count'),
  folderLead: document.querySelector('#folder-lead'),
  folderTitle: document.querySelector('#folder-title'),
  folderDescription: document.querySelector('#folder-description'),
  folderImage: document.querySelector('#folder-image'),
  gallery: document.querySelector('#detour-gallery'),
  summary: document.querySelector('#folder-summary'),
  summaryMark: document.querySelector('#folder-summary-mark'),
  summaryKicker: document.querySelector('#folder-summary-kicker'),
  summaryTitle: document.querySelector('#folder-summary-title'),
  summaryDescription: document.querySelector('#folder-summary-description'),
  memberPreview: document.querySelector('#member-preview'),
  memberPreviewSignin: document.querySelector('#member-preview-signin'),
  journeyConsole: document.querySelector('#journey-console'),
  journeyAccountState: document.querySelector('#journey-account-state'),
  journeyProgress: document.querySelector('#journey-progress'),
  journeySetup: document.querySelector('#journey-setup'),
  journeyStampBuild: document.querySelector('#journey-stamp-build'),
  journeyStampCount: document.querySelector('#journey-stamp-count'),
  journeyCurrent: document.querySelector('#journey-current'),
  journeyCurrentLabel: document.querySelector('#journey-current-label'),
  journeyCurrentTitle: document.querySelector('#journey-current-title'),
  journeyCurrentImage: document.querySelector('#journey-current-image'),
  journeyCurrentInstructions: document.querySelector('#journey-current-instructions'),
  journeyCardOpen: document.querySelector('#journey-card-open'),
  journeyTimerLabel: document.querySelector('#journey-timer-label'),
  journeyTimer: document.querySelector('#journey-timer'),
  journeyTimeTrack: document.querySelector('#journey-time-track'),
  journeyTimeBar: document.querySelector('#journey-time-bar'),
  journeyNextClue: document.querySelector('#journey-next-clue'),
  journeySouvenir: document.querySelector('#journey-souvenir'),
  journeySouvenirPrompt: document.querySelector('#journey-souvenir-prompt'),
  journeyMemoryState: document.querySelector('#journey-memory-state'),
  journeyMemoryNote: document.querySelector('#journey-memory-note'),
  journeyMemoryPhoto: document.querySelector('#journey-memory-photo'),
  journeyMemoryPreview: document.querySelector('#journey-memory-preview'),
  journeyMemorySave: document.querySelector('#journey-memory-save'),
  journeyStart: document.querySelector('#journey-start'),
  journeyBegin: document.querySelector('#journey-begin'),
  journeyPause: document.querySelector('#journey-pause'),
  journeyFinish: document.querySelector('#journey-finish'),
  journeySignin: document.querySelector('#journey-signin'),
  journeyOpenPassport: document.querySelector('#journey-open-passport'),
  journeyOpenReport: document.querySelector('#journey-open-report'),
  journeyFeedback: document.querySelector('#journey-feedback'),
  reader: document.querySelector('#detour-reader'),
  readerClose: document.querySelector('#detour-reader-close'),
  readerStage: document.querySelector('#detour-reader-stage'),
  stampAward: document.querySelector('#stamp-award'),
  stampAwardClose: document.querySelector('#stamp-award-close'),
  stampAwardCode: document.querySelector('#stamp-award-code'),
};

elements.folderNumber.textContent = category.number;
elements.folderLabel.textContent = `Category ${category.number}`;
elements.folderCount.textContent = categoryKey === 'free' ? `${detours.length} detours` : '0 detours';
elements.folderTitle.textContent = category.title;
elements.folderDescription.textContent = category.description;
elements.folderImage.src = category.image;
document.title = `${category.title} Detours — Elsewhere`;

function galleryCardMarkup(detour, index) {
  return `
    <button class="library-detour-thumb" type="button" data-detour-index="${index}" aria-label="Open ${detour.eyebrow}: ${detour.title}">
      <span class="gallery-detour-card" style="--detour-accent: ${detour.accent}">
        <span class="gallery-detour-visual">
          <img src="${detour.image}" alt="${detour.imageAlt}" loading="lazy" decoding="async" />
        </span>
        <span class="gallery-card-topline"><span>${detour.eyebrow}</span><span>Valid today only</span></span>
        <span class="gallery-card-body">
          <span class="gallery-card-label">Today, you will</span>
          <span class="gallery-card-title">${detour.title}</span>
          <span class="gallery-card-instructions">${detour.instructions}</span>
        </span>
        <span class="gallery-trip-details">
          <span><b>Time</b><i>${detour.time}</i></span>
          <span><b>Take</b><i>${detour.take}</i></span>
          <span><b>One rule</b><i>${detour.rule}</i></span>
          <span><b>Reward</b><i>${detour.reward}</i></span>
        </span>
        <span class="gallery-card-stamp" aria-hidden="true">Go<br />now</span>
      </span>
    </button>`;
}

function readerCardMarkup(detour) {
  return `
    <article class="detour-card library-reader-card" style="--accent: ${detour.accent}">
      <figure class="detour-visual">
        <img src="${detour.image}" alt="${detour.imageAlt}" />
      </figure>
      <div class="card-topline">
        <span>${detour.eyebrow}</span><span>VALID TODAY ONLY</span>
      </div>
      <div class="card-body">
        <p class="card-label">TODAY, YOU WILL</p>
        <h2>${detour.title}</h2>
        <p class="instructions">${detour.instructions}</p>
      </div>
      <dl class="trip-details">
        <div><dt>TIME</dt><dd>${detour.time}</dd></div>
        <div><dt>TAKE</dt><dd>${detour.take}</dd></div>
        <div><dt>ONE RULE</dt><dd>${detour.rule}</dd></div>
        <div><dt>REWARD</dt><dd>${detour.reward}</dd></div>
      </dl>
      <div class="card-stamp" aria-hidden="true">GO<br />NOW</div>
    </article>`;
}

if (categoryKey === 'free') {
  elements.openFolder.classList.add('open-folder--populated');
  elements.openFolder.setAttribute('aria-labelledby', 'folder-summary-title');
  elements.folderLead.hidden = true;
  elements.journeyConsole.hidden = false;
  elements.gallery.hidden = false;
  elements.gallery.innerHTML = detours.map(galleryCardMarkup).join('');
  elements.journeyProgress.innerHTML = detours.map((detour, index) => `
    <li data-journey-step="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${detour.title}</strong>
      <small>${detour.time}</small>
    </li>`).join('');
  elements.summary.removeAttribute('role');
  elements.summaryMark.hidden = true;
  elements.summaryKicker.textContent = `Filed collection · ${detours.length} detours`;
  elements.summaryTitle.textContent = category.title;
  elements.summaryDescription.textContent = category.description;
}

let currentUser = null;
let journeyState = null;
let journeyError = '';
let journeyBusy = false;
let journeyPendingMessage = '';
let journeyRemainingSeconds = 0;
let journeyTicker = null;
let journeyMemories = new Map();
let memorySyncAvailable = true;
let selectedMemoryBlob = null;
let selectedMemoryPreviewUrl = '';
let renderedMemoryStep = -1;

function formatJourneyTime(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function stopJourneyTicker() {
  if (journeyTicker) window.clearInterval(journeyTicker);
  journeyTicker = null;
}

function journeyPreferenceKey() {
  return currentUser ? `elsewhere-journey-options-${currentUser.id}` : '';
}

function journeyMemoryKey() {
  return currentUser ? `elsewhere-journey-memories-${currentUser.id}` : '';
}

function readJourneyOptions() {
  const fallback = { pace: 'one-sitting', company: 'solo' };
  try {
    return { ...fallback, ...JSON.parse(window.localStorage.getItem(journeyPreferenceKey()) || '{}') };
  } catch {
    return fallback;
  }
}

function selectedJourneyOptions() {
  const pace = elements.journeySetup.querySelector('input[name="journey-pace"]:checked')?.value || 'one-sitting';
  const company = elements.journeySetup.querySelector('input[name="journey-company"]:checked')?.value || 'solo';
  return { pace, company };
}

function applyJourneyOptions(options = readJourneyOptions()) {
  const pace = elements.journeySetup.querySelector(`input[name="journey-pace"][value="${options.pace}"]`);
  const company = elements.journeySetup.querySelector(`input[name="journey-company"][value="${options.company}"]`);
  if (pace) pace.checked = true;
  if (company) company.checked = true;
}

function storeJourneyOptions(options) {
  try {
    window.localStorage.setItem(journeyPreferenceKey(), JSON.stringify(options));
  } catch {
    // The database remains authoritative even if local preferences are unavailable.
  }
}

function loadLocalJourneyMemories() {
  if (!currentUser) return new Map();
  try {
    const stored = JSON.parse(window.localStorage.getItem(journeyMemoryKey()) || '{}');
    return new Map(Object.entries(stored).map(([key, value]) => [Number(key), value]));
  } catch {
    return new Map();
  }
}

function storeLocalJourneyMemories() {
  if (!currentUser) return;
  try {
    window.localStorage.setItem(journeyMemoryKey(), JSON.stringify(Object.fromEntries(journeyMemories)));
  } catch {
    // A large image can exceed browser draft storage; the Supabase copy is still kept.
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

async function compressJourneyPhoto(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose a JPEG, PNG, or WebP image.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB.');

  const bitmap = await createImageBitmap(file);
  const maxSide = 960;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('That photo could not be prepared.')), 'image/jpeg', 0.76);
  });
}

function renderStampProgress(currentStep, status) {
  const completed = status === 'completed' ? detours.length : Math.max(0, Math.min(currentStep, detours.length));
  const progress = `${Math.round((completed / detours.length) * 100)}%`;
  elements.journeyStampBuild.style.setProperty('--stamp-progress', progress);
  elements.journeyStampCount.textContent = completed === detours.length
    ? 'Stamp complete'
    : `${completed} of ${detours.length} impressions`;
}

function renderCurrentMemory(stepIndex, status) {
  const shouldShow = stepIndex < detours.length && status !== 'not_started' && status !== 'completed';
  elements.journeySouvenir.hidden = !shouldShow;
  if (!shouldShow) return;

  const memory = journeyMemories.get(stepIndex) || {};
  elements.journeySouvenirPrompt.textContent = souvenirPrompts[stepIndex];
  elements.journeyMemoryState.textContent = memory.savedRemotely
    ? 'Saved to your passport'
    : (memory.note || memory.previewUrl ? 'Draft saved on this device' : 'Private to your passport');

  if (renderedMemoryStep !== stepIndex) {
    renderedMemoryStep = stepIndex;
    elements.journeyMemoryNote.value = memory.note || '';
    selectedMemoryBlob = null;
    if (selectedMemoryPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(selectedMemoryPreviewUrl);
    selectedMemoryPreviewUrl = memory.previewUrl || memory.photoDataUrl || '';
    elements.journeyMemoryPreview.src = selectedMemoryPreviewUrl;
    elements.journeyMemoryPreview.hidden = !selectedMemoryPreviewUrl;
    elements.journeyMemoryPhoto.value = '';
  }
}

function updateJourneyTimerDisplay() {
  if (categoryKey !== 'free' || !journeyState || journeyState.status === 'not_started') return;

  const requiredSeconds = Number(journeyState.required_seconds) || 0;
  const elapsedSeconds = Math.max(0, requiredSeconds - journeyRemainingSeconds);
  const percentage = requiredSeconds > 0
    ? Math.min(100, Math.round((elapsedSeconds / requiredSeconds) * 100))
    : 100;

  const checkInReady = journeyState.status === 'active' && journeyRemainingSeconds <= 0;
  elements.journeyTimer.textContent = checkInReady ? 'CHECK IN' : (journeyState.status === 'active' ? 'IN THE FIELD' : 'READY');
  elements.journeyTimeTrack.style.setProperty('--journey-progress', `${percentage}%`);
  elements.journeyTimeTrack.setAttribute('aria-valuenow', String(percentage));
  elements.journeyTimeTrack.setAttribute('aria-valuetext', checkInReady ? 'Required active time complete' : `${percentage}% of the required active time completed`);
  elements.journeyFinish.disabled = journeyBusy || journeyRemainingSeconds > 0;

  if (checkInReady) {
    elements.journeyTimerLabel.textContent = 'Your check-in is open';
    elements.journeyFeedback.textContent = Number(journeyState.current_step) === detours.length - 1
      ? 'Return when you are ready. Your final check-in completes the stamp and field report.'
      : 'Return when you are ready. Check in to reveal the next detour.';
  }
}

function startJourneyTicker() {
  stopJourneyTicker();
  if (journeyState?.status !== 'active') return;

  const startingRemaining = Number(journeyState.remaining_seconds) || 0;
  const startedAt = performance.now();
  journeyTicker = window.setInterval(() => {
    const elapsedSinceSync = (performance.now() - startedAt) / 1000;
    journeyRemainingSeconds = Math.max(0, startingRemaining - elapsedSinceSync);
    updateJourneyTimerDisplay();
    if (journeyRemainingSeconds <= 0) stopJourneyTicker();
  }, 250);
}

function updateJourneyCards(currentStep, status) {
  const steps = [...elements.journeyProgress.querySelectorAll('li')];
  steps.forEach((step, index) => {
    const isComplete = status === 'completed' || index < currentStep;
    const isCurrent = status !== 'not_started' && status !== 'completed' && index === currentStep;
    step.classList.toggle('is-complete', isComplete);
    step.classList.toggle('is-current', isCurrent);
    step.classList.toggle('is-locked', !isComplete && !isCurrent);
  });

  [...elements.gallery.querySelectorAll('.library-detour-thumb')].forEach((thumbnail, index) => {
    const isComplete = status === 'completed' || index < currentStep;
    const isCurrent = status !== 'not_started' && status !== 'completed' && index === currentStep;
    thumbnail.classList.toggle('is-journey-complete', isComplete);
    thumbnail.classList.toggle('is-journey-current', isCurrent);
    if (isCurrent) thumbnail.setAttribute('aria-current', 'step');
    else thumbnail.removeAttribute('aria-current');
  });
}

function renderMemberPreview() {
  if (categoryKey === 'free') {
    elements.memberPreview.hidden = true;
    return;
  }

  const signedOut = !currentUser;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  elements.memberPreviewSignin.href = `/passport/?returnTo=${encodeURIComponent(returnTo)}`;
  elements.memberPreview.hidden = !signedOut;
  elements.summary.hidden = signedOut;
}

function renderJourney() {
  if (categoryKey !== 'free') return;

  stopJourneyTicker();
  elements.journeyStart.hidden = false;
  elements.journeyBegin.hidden = true;
  elements.journeyPause.hidden = true;
  elements.journeyFinish.hidden = true;
  elements.journeySignin.hidden = true;
  elements.journeyOpenPassport.hidden = true;
  elements.journeyOpenReport.hidden = true;
  elements.journeySetup.hidden = true;
  elements.journeyCurrent.hidden = true;
  elements.journeyConsole.classList.remove('is-complete');

  if (!currentUser) {
    elements.journeyAccountState.textContent = 'Passport required';
    elements.journeyStart.disabled = true;
    elements.journeySignin.hidden = false;
    elements.journeyFeedback.textContent = 'Sign in before starting. Free detour previews stay open to everyone.';
    updateJourneyCards(0, 'not_started');
    renderStampProgress(0, 'not_started');
    return;
  }

  elements.journeyAccountState.textContent = currentUser.email ?? 'Signed in';

  if (journeyError) {
    elements.journeyStart.disabled = true;
    elements.journeyFeedback.textContent = journeyError;
    updateJourneyCards(0, 'not_started');
    renderStampProgress(0, 'not_started');
    return;
  }

  if (!journeyState) {
    elements.journeyStart.disabled = true;
    elements.journeyFeedback.textContent = journeyBusy ? journeyPendingMessage : 'Loading Journey Mode…';
    updateJourneyCards(0, 'not_started');
    renderStampProgress(0, 'not_started');
    return;
  }

  const status = journeyState.status;
  const currentStep = Math.min(Number(journeyState.current_step) || 0, detours.length);
  updateJourneyCards(currentStep, status);
  renderStampProgress(currentStep, status);

  if (status === 'not_started') {
    elements.journeySetup.hidden = false;
    applyJourneyOptions();
    elements.journeyStart.disabled = journeyBusy;
    elements.journeyFeedback.textContent = journeyBusy
      ? journeyPendingMessage
      : 'Choose a pace and company. Your first detour will be revealed after you start.';
    return;
  }

  elements.journeyStart.hidden = true;

  if (status === 'completed') {
    elements.journeyConsole.classList.add('is-complete');
    elements.journeyOpenPassport.hidden = false;
    elements.journeyOpenReport.hidden = false;
    elements.journeyFeedback.textContent = journeyState.stamp_code
      ? `Free Journey completed. Stamp ${journeyState.stamp_code} and your field report are filed in your Passport.`
      : 'Free Journey completed. Your stamp and field report are filed in your Passport.';
    return;
  }

  const detour = detours[currentStep];
  elements.journeyCurrent.hidden = false;
  elements.journeyCurrentLabel.textContent = `Detour ${String(currentStep + 1).padStart(2, '0')} of ${detours.length}`;
  elements.journeyCurrentTitle.textContent = detour.title;
  elements.journeyCurrentImage.src = detour.image;
  elements.journeyCurrentImage.alt = detour.imageAlt;
  elements.journeyCurrentInstructions.textContent = detour.instructions;
  elements.journeyNextClue.textContent = nextClues[currentStep];
  journeyRemainingSeconds = Number(journeyState.remaining_seconds ?? detour.durationSeconds);
  renderCurrentMemory(currentStep, status);

  if (status === 'ready' || status === 'paused') {
    elements.journeyBegin.hidden = false;
    elements.journeyBegin.disabled = journeyBusy;
    elements.journeyBegin.textContent = status === 'paused' ? 'Resume' : 'Begin';
    elements.journeyTimerLabel.textContent = status === 'paused' ? 'Your detour is safely paused' : 'Ready to leave';
    elements.journeyFeedback.textContent = journeyBusy
      ? journeyPendingMessage
      : (status === 'paused'
        ? 'Resume whenever you are ready. Your active time has been kept.'
        : 'Begin when you are actually leaving. We will quietly open check-in when the detour has had enough time.');
  }

  if (status === 'active') {
    elements.journeyPause.hidden = false;
    elements.journeyFinish.hidden = false;
    elements.journeyPause.disabled = journeyBusy;
    elements.journeyFinish.textContent = currentStep === detours.length - 1
      ? 'Complete Journey & Stamp Passport'
      : 'Check in & Reveal Next';
    elements.journeyTimerLabel.textContent = 'Detour in progress';
    elements.journeyFeedback.textContent = journeyBusy
      ? journeyPendingMessage
      : 'Go do the detour — you can put your phone away. Return when something catches your attention or you are ready to check in.';
  }

  updateJourneyTimerDisplay();
  if (!journeyBusy) startJourneyTicker();
}

function journeyErrorMessage(error) {
  const message = error?.message ?? 'Journey Mode could not connect to Supabase.';
  if (/schema cache|could not find the function|journey_runs|free_journey/i.test(message)) {
    return 'Journey database update required. Run the latest supabase/setup.sql in the Supabase SQL Editor.';
  }
  return message;
}

function isMissingJourneyFunction(error) {
  return /schema cache|could not find the function|PGRST202/i.test(error?.message || '');
}

async function callJourneyRpc(functionName, pendingMessage, rpcArgs, fallbackFunctionName = '') {
  if (!currentUser || categoryKey !== 'free' || journeyBusy) return null;

  journeyBusy = true;
  journeyPendingMessage = pendingMessage;
  renderJourney();
  let { data, error } = await supabase.rpc(functionName, rpcArgs);
  if (error && fallbackFunctionName && isMissingJourneyFunction(error)) {
    ({ data, error } = await supabase.rpc(fallbackFunctionName));
  }
  journeyBusy = false;

  if (error) {
    journeyError = journeyErrorMessage(error);
    renderJourney();
    return null;
  }

  journeyError = '';
  journeyState = data;
  renderJourney();

  if (data?.ok === false && data.code === 'time_remaining') {
    elements.journeyFeedback.textContent = 'Your check-in is not open yet. Keep exploring — we will let you know when it is ready.';
  } else if (data?.ok === false && data.code === 'detour_not_active') {
    elements.journeyFeedback.textContent = 'Begin or resume the current detour before finishing it.';
  }

  if (data?.stamp_just_awarded) {
    elements.stampAwardCode.textContent = data.stamp_code ?? 'FILED';
    elements.stampAward.showModal();
  }

  return data;
}

async function loadJourneyMemories() {
  if (!currentUser || categoryKey !== 'free') return;
  journeyMemories = loadLocalJourneyMemories();
  renderedMemoryStep = -1;
  memorySyncAvailable = true;

  const { data, error } = await supabase
    .from('journey_memories')
    .select('step_index, prompt, note, photo_path, updated_at')
    .eq('user_id', currentUser.id)
    .eq('journey_id', 'free')
    .order('step_index', { ascending: true });

  if (error) {
    memorySyncAvailable = false;
    return;
  }

  for (const row of data || []) {
    let previewUrl = '';
    if (row.photo_path) {
      const signed = await supabase.storage.from('journey-souvenirs').createSignedUrl(row.photo_path, 60 * 60);
      previewUrl = signed.data?.signedUrl || '';
    }
    journeyMemories.set(Number(row.step_index), {
      prompt: row.prompt,
      note: row.note || '',
      photoPath: row.photo_path || '',
      previewUrl,
      updatedAt: row.updated_at,
      savedRemotely: true,
    });
  }
  storeLocalJourneyMemories();
}

async function loadJourneyState() {
  if (!currentUser || categoryKey !== 'free') return;
  journeyBusy = true;
  journeyPendingMessage = 'Syncing your private journey record…';
  renderJourney();
  const { data, error } = await supabase.rpc('get_free_journey_status');
  journeyBusy = false;

  if (error) {
    journeyError = journeyErrorMessage(error);
    journeyState = null;
  } else {
    journeyError = '';
    journeyState = data;
    if (journeyState.pace || journeyState.company) {
      storeJourneyOptions({
        pace: journeyState.pace || 'one-sitting',
        company: journeyState.company || 'solo',
      });
    }
  }
  await loadJourneyMemories();
  renderJourney();
}

async function syncLibrarySession(session) {
  currentUser = session?.user ?? null;
  journeyState = null;
  journeyError = '';
  journeyMemories = new Map();
  renderedMemoryStep = -1;
  renderMemberPreview();
  renderJourney();
  if (currentUser) await loadJourneyState();
}

async function saveJourneyMemory({ quiet = false } = {}) {
  const stepIndex = Number(journeyState?.current_step);
  if (!currentUser || !Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= detours.length) return false;

  const note = elements.journeyMemoryNote.value.trim();
  const existing = journeyMemories.get(stepIndex) || {};
  if (!note && !selectedMemoryBlob && !existing.photoPath && !existing.photoDataUrl) {
    if (!quiet) elements.journeyMemoryState.textContent = 'Add a note or photo first';
    return false;
  }

  elements.journeyMemorySave.disabled = true;
  elements.journeyMemoryState.textContent = 'Saving your souvenir…';
  let photoDataUrl = existing.photoDataUrl || '';
  if (selectedMemoryBlob) {
    try {
      photoDataUrl = await blobToDataUrl(selectedMemoryBlob);
    } catch {
      photoDataUrl = '';
    }
  }

  const localMemory = {
    ...existing,
    prompt: souvenirPrompts[stepIndex],
    note,
    photoDataUrl,
    previewUrl: selectedMemoryPreviewUrl || existing.previewUrl || photoDataUrl,
    updatedAt: new Date().toISOString(),
    savedRemotely: false,
  };
  journeyMemories.set(stepIndex, localMemory);
  storeLocalJourneyMemories();

  let photoPath = existing.photoPath || '';
  let remoteSaved = memorySyncAvailable;
  if (remoteSaved && selectedMemoryBlob) {
    photoPath = `${currentUser.id}/free/${journeyState.run_id || 'journey'}/detour-${stepIndex + 1}.jpg`;
    const upload = await supabase.storage
      .from('journey-souvenirs')
      .upload(photoPath, selectedMemoryBlob, { contentType: 'image/jpeg', upsert: true });
    remoteSaved = !upload.error;
  }

  if (remoteSaved) {
    const saved = await supabase.rpc('save_free_journey_memory', {
      p_step_index: stepIndex,
      p_prompt: souvenirPrompts[stepIndex],
      p_note: note,
      p_photo_path: photoPath || null,
    });
    remoteSaved = !saved.error;
  }

  if (remoteSaved) {
    journeyMemories.set(stepIndex, {
      ...localMemory,
      photoPath,
      savedRemotely: true,
    });
    storeLocalJourneyMemories();
    elements.journeyMemoryState.textContent = 'Saved to your passport';
  } else {
    memorySyncAvailable = false;
    elements.journeyMemoryState.textContent = 'Saved on this device';
    if (!quiet) {
      elements.journeyFeedback.textContent = 'Souvenir kept safely on this device. Run the latest setup.sql once to sync it across devices.';
    }
  }

  selectedMemoryBlob = null;
  elements.journeyMemoryPhoto.value = '';
  elements.journeyMemorySave.disabled = false;
  return true;
}

elements.journeyStart.addEventListener('click', () => {
  const options = selectedJourneyOptions();
  storeJourneyOptions(options);
  callJourneyRpc(
    'start_free_journey_with_options',
    'Registering your route in the passport…',
    {
      p_pace: options.pace,
      p_company: options.company,
      p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    'start_free_journey',
  );
});
elements.journeyBegin.addEventListener('click', () => {
  callJourneyRpc('begin_free_journey_step', 'Opening this detour…');
});
elements.journeyPause.addEventListener('click', () => {
  callJourneyRpc('pause_free_journey_step', 'Saving your active time…');
});
elements.journeyFinish.addEventListener('click', async () => {
  await saveJourneyMemory({ quiet: true });
  callJourneyRpc('finish_free_journey_step', 'Checking in and revealing what comes next…');
});

elements.journeyMemorySave.addEventListener('click', () => saveJourneyMemory());
elements.journeyMemoryPhoto.addEventListener('change', async () => {
  const file = elements.journeyMemoryPhoto.files?.[0];
  if (!file) return;
  elements.journeyMemoryState.textContent = 'Preparing photo…';
  try {
    selectedMemoryBlob = await compressJourneyPhoto(file);
    if (selectedMemoryPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(selectedMemoryPreviewUrl);
    selectedMemoryPreviewUrl = URL.createObjectURL(selectedMemoryBlob);
    elements.journeyMemoryPreview.src = selectedMemoryPreviewUrl;
    elements.journeyMemoryPreview.hidden = false;
    elements.journeyMemoryState.textContent = 'Photo ready to save';
  } catch (error) {
    selectedMemoryBlob = null;
    elements.journeyMemoryPhoto.value = '';
    elements.journeyMemoryState.textContent = error.message;
  }
});

elements.journeyCardOpen.addEventListener('click', () => {
  const stepIndex = Number(journeyState?.current_step);
  const thumbnail = elements.gallery.querySelector(`[data-detour-index="${stepIndex}"]`);
  if (thumbnail) openReader(thumbnail);
});

function closeStampAward() {
  if (!elements.stampAward.open) return;
  elements.stampAward.close();
}

elements.stampAwardClose.addEventListener('click', closeStampAward);
elements.stampAward.addEventListener('click', (event) => {
  if (event.target === elements.stampAward) closeStampAward();
});
elements.stampAward.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeStampAward();
});

const { data: librarySessionData } = await supabase.auth.getSession();
await syncLibrarySession(librarySessionData.session);

supabase.auth.onAuthStateChange((_event, session) => {
  window.setTimeout(() => syncLibrarySession(session), 0);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser && journeyState?.status === 'active' && !journeyBusy) {
    loadJourneyState();
  }
});

let activeThumbnail = null;
let isReaderClosing = false;
let readerAnimations = [];

function cancelReaderAnimations() {
  readerAnimations.forEach((animation) => {
    try {
      animation?.cancel?.();
    } catch {
      // The dialog state is still restored below if a browser cannot cancel an animation.
    }
  });
  readerAnimations = [];
}

function waitForReaderAnimations(animations, fallbackDuration) {
  if (animations.length === 0) return Promise.resolve();

  const finishedPromises = animations
    .map((animation) => animation?.finished)
    .filter((finished) => finished && typeof finished.then === 'function');
  const animationFinished = finishedPromises.length === animations.length
    ? Promise.allSettled(finishedPromises)
    : new Promise((resolve) => window.setTimeout(resolve, fallbackDuration));
  const fallbackFinished = new Promise((resolve) => window.setTimeout(resolve, fallbackDuration + 100));

  return Promise.race([animationFinished, fallbackFinished]);
}

function animateReaderElement(element, keyframes, options) {
  return typeof element?.animate === 'function' ? element.animate(keyframes, options) : null;
}

function getReaderMotion(sourceRect, destinationRect, reverse = false) {
  const translateX = sourceRect.left + sourceRect.width / 2 - (destinationRect.left + destinationRect.width / 2);
  const translateY = sourceRect.top + sourceRect.height / 2 - (destinationRect.top + destinationRect.height / 2);
  const scaleX = sourceRect.width / destinationRect.width;
  const scaleY = sourceRect.height / destinationRect.height;
  const compact = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(1.25deg)`;
  const expanded = 'translate(0, 0) scale(1, 1) rotate(1.25deg)';
  return reverse ? [expanded, compact] : [compact, expanded];
}

function openReader(thumbnail) {
  if (elements.reader.open || isReaderClosing) return;

  const detour = detours[Number(thumbnail.dataset.detourIndex)];
  const sourceCard = thumbnail.querySelector('.gallery-detour-card');
  const sourceRect = sourceCard.getBoundingClientRect();

  activeThumbnail = thumbnail;
  elements.readerStage.innerHTML = readerCardMarkup(detour);
  elements.reader.setAttribute('aria-label', `${detour.eyebrow}: ${detour.title}`);
  elements.reader.showModal();
  document.body.classList.add('detour-reader-open');

  const readerCard = elements.readerStage.querySelector('.library-reader-card');
  const destinationRect = readerCard.getBoundingClientRect();
  readerAnimations = [
    animateReaderElement(
      readerCard,
      getReaderMotion(sourceRect, destinationRect),
      { duration: 560, easing: 'cubic-bezier(.2,.82,.2,1)', fill: 'forwards' },
    ),
    animateReaderElement(
      elements.reader,
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 360, easing: 'ease-out', fill: 'forwards' },
    ),
  ].filter(Boolean);

  waitForReaderAnimations(readerAnimations, 560).then(() => {
    if (!elements.reader.open || isReaderClosing || activeThumbnail !== thumbnail) return;
    cancelReaderAnimations();
    elements.readerClose.focus({ preventScroll: true });
  });
}

function closeReader() {
  if (!elements.reader.open || isReaderClosing) return;

  isReaderClosing = true;
  cancelReaderAnimations();

  try {
    elements.reader.close();
  } catch {
    elements.reader.removeAttribute('open');
  }
  if (elements.reader.open) elements.reader.removeAttribute('open');

  document.body.classList.remove('detour-reader-open');
  elements.readerStage.innerHTML = '';
  activeThumbnail?.focus({ preventScroll: true });
  activeThumbnail = null;
  isReaderClosing = false;
}

elements.gallery.addEventListener('click', (event) => {
  const thumbnail = event.target.closest('.library-detour-thumb');
  if (thumbnail) openReader(thumbnail);
});

elements.readerClose.addEventListener('click', closeReader);
elements.reader.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeReader();
});
elements.reader.addEventListener('click', (event) => {
  if (!event.target.closest('.library-reader-card')) closeReader();
});

const closeLinks = document.querySelectorAll('.folder-back, .site-nav a[href="/library/"]');
let isClosing = false;

function resetCategoryPageState() {
  isClosing = false;
  isReaderClosing = false;
  cancelReaderAnimations();
  document.body.classList.remove('folder-transition-active', 'detour-reader-open');
  elements.openFolder.classList.remove('open-folder--source-hidden');
  document.querySelectorAll('.folder-transition-backdrop, .open-folder--route-clone').forEach((element) => {
    element.getAnimations?.().forEach((animation) => animation.cancel());
    element.remove();
  });

  if (elements.reader.open) elements.reader.close();
  elements.readerStage.innerHTML = '';
  activeThumbnail = null;
}

function isPlainNavigation(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function closeFolder(event) {
  if (!isPlainNavigation(event) || isClosing) return;

  const destination = event.currentTarget.href;
  const folder = document.querySelector('#open-folder');

  if (typeof folder.animate !== 'function') return;

  event.preventDefault();
  isClosing = true;

  const start = folder.getBoundingClientRect();
  const targetWidth = Math.min(window.innerWidth - 40, 250);
  const targetHeight = Math.min(window.innerHeight - 40, 220);
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;
  const translateX = targetLeft - start.left;
  const translateY = targetTop - start.top;
  const scaleX = targetWidth / start.width;
  const scaleY = targetHeight / start.height;
  const clone = folder.cloneNode(true);
  const backdrop = document.createElement('div');

  backdrop.className = 'folder-transition-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('open-folder--route-clone');
  Object.assign(clone.style, {
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
  });

  folder.classList.add('open-folder--source-hidden');
  document.body.classList.add('folder-transition-active');
  document.body.append(backdrop, clone);

  backdrop.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 460, easing: 'ease-out', fill: 'forwards' },
  );

  const motion = clone.animate(
    [
      {
        transform: 'rotate(0deg)',
      },
      {
        transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(1deg)`,
      },
    ],
    { duration: 520, easing: 'cubic-bezier(.55,.02,.35,1)', fill: 'forwards' },
  );

  motion.finished
    .catch(() => undefined)
    .finally(() => window.location.assign(destination));
}

closeLinks.forEach((link) => link.addEventListener('click', closeFolder));
window.addEventListener('pagehide', resetCategoryPageState);
window.addEventListener('pageshow', resetCategoryPageState);
