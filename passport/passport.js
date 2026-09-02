import { supabase } from './supabase.js';

const book = document.querySelector('#passport-book');
const cover = document.querySelector('#passport-cover');
const backCover = document.querySelector('#passport-back-cover');
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
const stampBenefits = document.querySelector('#passport-benefits');
const stampBenefitsList = document.querySelector('#passport-benefits-list');
const passportQuery = new URLSearchParams(window.location.search);
const requestedReturnTo = passportQuery.get('returnTo');
const requestedOpen = passportQuery.get('open');
let rememberedReturnTo = '';
try {
  rememberedReturnTo = window.localStorage.getItem('elsewhere-return-to') ?? '';
} catch {
  rememberedReturnTo = '';
}
const returnToCandidate = requestedReturnTo || rememberedReturnTo;
const safeReturnTo = returnToCandidate?.startsWith('/') && !returnToCandidate.startsWith('//')
  ? returnToCandidate
  : '';
if (requestedReturnTo && safeReturnTo) {
  try {
    window.localStorage.setItem('elsewhere-return-to', safeReturnTo);
  } catch {
    // Returning is optional; authentication still works without browser storage.
  }
}

const signedOutProfile = {
  name: 'SIGN IN TO COMPLETE',
  homeBase: '—',
  memberSince: '—',
  passportNumber: 'PENDING',
};

let profile = signedOutProfile;
let passportStamps = [];
let passportJourney = null;
let journeyCompletions = [];
let journeyMemories = [];
let currentUser = null;
const totalSpreads = 5;
const backCoverPosition = totalSpreads + 1;
let currentPosition = 0;
let isTurning = false;
let isReturningToJourney = false;
let openedRequestedReport = false;

const freeJourneyDetours = [
  { title: 'Follow the color yellow', prompt: 'The seventh yellow sign' },
  { title: 'Find the quietest table', prompt: 'One borrowed sentence' },
  { title: 'Collect five tiny wonders', prompt: 'A grand title for small things' },
  { title: 'Ask a stranger for a song', prompt: 'A borrowed soundtrack' },
  { title: 'Visit a future memory', prompt: 'One sentence for your future self' },
  { title: 'Let a coin plan the route', prompt: 'The door at the end of the route' },
];

const stampCatalog = {
  'free-journey': {
    name: 'FREE JOURNEY',
    image: '/stamps/free-journey.png',
    fallbackBenefit: '10% OFF · 1 DRAW',
  },
};

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
      const categoryStamp = stampCatalog[earnedStamp.detour_id];
      const awardedDate = new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(earnedStamp.awarded_at));

      if (categoryStamp) {
        const discount = Number(earnedStamp.discount_percent) || 0;
        const entries = Number(earnedStamp.prize_entries) || 0;
        const benefit = discount || entries
          ? `${discount}% OFF · ${entries} ${entries === 1 ? 'DRAW' : 'DRAWS'}`
          : categoryStamp.fallbackBenefit;
        const rewardCode = earnedStamp.stamp_code ? ` · CODE ${earnedStamp.stamp_code}` : '';
        return `
          <div class="stamp-space is-earned is-category-stamp" aria-label="${escapeHtml(categoryStamp.name)}, earned ${escapeHtml(awardedDate)}. ${escapeHtml(benefit)}${escapeHtml(rewardCode)}">
            <img class="passport-stamp-image" src="${categoryStamp.image}" alt="" />
            <span class="passport-stamp-meta"><b>${escapeHtml(awardedDate)}</b><small>${escapeHtml(benefit)}</small></span>
          </div>`;
      }

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

function formatFieldDate(value, fallback = 'NOT YET') {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value)).toUpperCase();
}

function journeyOptions() {
  const fallback = { pace: 'one-sitting', company: 'solo' };
  if (!currentUser) return fallback;
  try {
    const local = JSON.parse(window.localStorage.getItem(`elsewhere-journey-options-${currentUser.id}`) || '{}');
    return {
      pace: passportJourney?.pace || local.pace || fallback.pace,
      company: passportJourney?.company || local.company || fallback.company,
    };
  } catch {
    return {
      pace: passportJourney?.pace || fallback.pace,
      company: passportJourney?.company || fallback.company,
    };
  }
}

function fieldReportSpread() {
  const completedCount = passportJourney?.status === 'completed'
    ? freeJourneyDetours.length
    : Math.max(journeyCompletions.length, Number(passportJourney?.current_step) || 0);
  const isComplete = completedCount >= freeJourneyDetours.length;
  const options = journeyOptions();
  const pace = options.pace === 'take-your-time' ? 'TAKE YOUR TIME' : 'ONE SITTING';
  const company = options.company === 'with-a-friend' ? 'WITH A FRIEND' : 'SOLO';
  const memoryByStep = new Map(journeyMemories.map((memory) => [Number(memory.step_index), memory]));

  const memoryCards = freeJourneyDetours.map((detour, index) => {
    const memory = memoryByStep.get(index);
    const completed = isComplete || journeyCompletions.some((item) => Number(item.step_index) === index);
    const image = memory?.signedUrl
      ? `<img src="${escapeHtml(memory.signedUrl)}" alt="Souvenir from ${escapeHtml(detour.title)}" />`
      : '';
    const copy = memory?.note?.trim() || (completed ? detour.prompt : 'Waiting for this detour');
    return `
      <article class="field-memory ${completed ? 'is-complete' : ''} ${image ? 'has-photo' : ''}">
        ${image}
        <span>${String(index + 1).padStart(2, '0')}</span>
        <strong>${escapeHtml(detour.title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </article>`;
  }).join('');

  return {
    upper: `
      <section class="passport-page passport-page--upper field-report-page field-report-page--summary" aria-label="Free Journey field report summary">
        ${register('FREE JOURNEY / FIELD REPORT', '02')}
        <div class="field-report-summary">
          <div class="field-report-stamp ${isComplete ? 'is-complete' : ''}" style="--report-progress: ${Math.round((completedCount / freeJourneyDetours.length) * 100)}%">
            <img src="/stamps/free-journey.png" alt="" />
          </div>
          <div class="field-report-copy">
            <span>${isComplete ? 'Route complete' : 'Route in progress'} · ${completedCount} / ${freeJourneyDetours.length}</span>
            <h2>${isComplete ? 'A day worth keeping.' : 'The story so far.'}</h2>
            <dl>
              <div><dt>Started</dt><dd>${formatFieldDate(passportJourney?.started_at, 'NOT STARTED')}</dd></div>
              <div><dt>Finished</dt><dd>${formatFieldDate(passportJourney?.completed_at)}</dd></div>
              <div><dt>Pace</dt><dd>${pace}</dd></div>
              <div><dt>Company</dt><dd>${company}</dd></div>
            </dl>
            ${isComplete ? '<button class="field-report-download" type="button" data-download-field-report>Save field report</button>' : '<a class="field-report-continue" href="/library/category/?category=free">Continue journey →</a>'}
          </div>
        </div>
      </section>`,
    lower: `
      <section class="passport-page passport-page--lower field-report-page" aria-label="Free Journey souvenirs">
        ${register('SOUVENIRS / SIX SMALL PROOFS', '03')}
        <div class="field-memory-grid">${memoryCards}</div>
      </section>`,
  };
}

function spreadPages(position) {
  if (position === 1) return identitySpread();
  if (position === 2) return fieldReportSpread();
  return stampSpread(position - 1, 7 + ((position - 3) * 12));
}

function renderSpread(position) {
  const pages = spreadPages(position);
  spread.innerHTML = pages.upper + pages.lower;
}

function updateControls() {
  const isFrontCover = currentPosition === 0;
  const isBackCover = currentPosition === backCoverPosition;
  book.classList.toggle('is-open', !isFrontCover);
  book.classList.toggle('is-back-closed', isBackCover);
  book.dataset.state = isFrontCover ? 'cover' : (isBackCover ? 'back-cover' : 'open');
  spread.setAttribute('aria-hidden', String(isFrontCover || isBackCover));
  cover.setAttribute('aria-hidden', String(!isFrontCover));
  cover.tabIndex = isFrontCover ? 0 : -1;

  previousButton.disabled = isFrontCover || isTurning;
  nextButton.disabled = isBackCover || isTurning;
  nextButton.setAttribute('aria-label', isFrontCover
    ? 'Open passport'
    : (currentPosition === totalSpreads ? 'Close passport to the back cover' : 'Next passport page'));
  previousButton.setAttribute('aria-label', isBackCover
    ? 'Reopen passport to the last page'
    : (currentPosition === 1 ? 'Close passport to the front cover' : 'Previous passport page'));

  status.textContent = isFrontCover
    ? 'Cover — use the right arrow to open'
    : (isBackCover
      ? 'Back cover — use the left arrow to reopen'
      : (currentPosition === 2
        ? 'Field report — your six small proofs'
        : `Spread ${String(currentPosition).padStart(2, '0')} of ${String(totalSpreads).padStart(2, '0')}`));

  progress.forEach((item, index) => item.classList.toggle('is-current', index === currentPosition));
}

function backCoverSurface() {
  return `
    <div class="passport-back-cover-surface">
      <span class="back-cover-rule back-cover-rule--outer"></span>
      <span class="back-cover-rule back-cover-rule--inner"></span>
    </div>`;
}

function createBackCoverTurn(direction) {
  const lastPages = spreadPages(totalSpreads);
  spread.innerHTML = lastPages.upper + lastPages.lower;

  const turningSheet = document.createElement('div');
  turningSheet.className = `passport-turn-sheet passport-turn-sheet--${direction} passport-turn-sheet--back-cover`;
  turningSheet.setAttribute('aria-hidden', 'true');
  turningSheet.innerHTML = `
    <div class="passport-turn-face passport-turn-face--front">${lastPages.lower}</div>
    <div class="passport-turn-face passport-turn-face--back">${backCoverSurface()}</div>`;
  spread.append(turningSheet);
  return turningSheet;
}

function closeToBackCover() {
  isTurning = true;
  book.classList.add('is-turning');
  updateControls();
  status.textContent = 'Closing the back cover…';

  const turningSheet = createBackCoverTurn('forward');
  let sheetFinished = false;
  const finishSheet = () => {
    if (sheetFinished) return;
    sheetFinished = true;
    turningSheet.remove();
    book.classList.add('is-back-cover-visible');
    void backCover.offsetWidth;
    currentPosition = backCoverPosition;
    updateControls();
    status.textContent = 'Rotating passport closed…';

    window.setTimeout(() => {
      book.classList.remove('is-turning');
      isTurning = false;
      updateControls();
    }, reduceMotion ? 580 : 820);
  };

  turningSheet.addEventListener('animationend', finishSheet, { once: true });
  window.setTimeout(finishSheet, reduceMotion ? 780 : 1100);
}

function reopenFromBackCover() {
  isTurning = true;
  book.classList.add('is-turning');
  previousButton.disabled = true;
  nextButton.disabled = true;
  status.textContent = 'Rotating passport open…';
  book.classList.remove('is-back-closed');

  window.setTimeout(() => {
    status.textContent = 'Opening the back cover…';
    const turningSheet = createBackCoverTurn('backward');
    book.classList.remove('is-back-cover-visible');

    let turnFinished = false;
    const finishTurn = () => {
      if (turnFinished) return;
      turnFinished = true;
      currentPosition = totalSpreads;
      renderSpread(currentPosition);
      book.classList.remove('is-turning');
      isTurning = false;
      updateControls();
    };

    turningSheet.addEventListener('animationend', finishTurn, { once: true });
    window.setTimeout(finishTurn, reduceMotion ? 780 : 1100);
  }, reduceMotion ? 580 : 820);
}

function goTo(position) {
  if (isTurning || position < 0 || position > backCoverPosition || position === currentPosition) return;

  const wasCover = currentPosition === 0;
  const willBeCover = position === 0;
  const direction = position > currentPosition ? 'forward' : 'backward';

  if (currentPosition === totalSpreads && position === backCoverPosition) {
    closeToBackCover();
    return;
  }

  if (currentPosition === backCoverPosition && position === totalSpreads) {
    reopenFromBackCover();
    return;
  }

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
    }, reduceMotion ? 780 : 1280);
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
  if (currentPosition > 0 && currentPosition <= totalSpreads && !isTurning) renderSpread(currentPosition);
}

function renderStampBenefits() {
  const benefitStamps = passportStamps.filter((stamp) => stampCatalog[stamp.detour_id]);
  stampBenefits.hidden = benefitStamps.length === 0;
  stampBenefitsList.innerHTML = benefitStamps.map((stamp) => {
    const catalog = stampCatalog[stamp.detour_id];
    const discount = Number(stamp.discount_percent) || 0;
    const entries = Number(stamp.prize_entries) || 0;
    return `
      <article class="passport-benefit-row">
        <img src="${catalog.image}" alt="" />
        <div><strong>${escapeHtml(catalog.name)}</strong><span>${discount}% off first paid journey · ${entries} ${entries === 1 ? 'Field Kit draw entry' : 'Field Kit draw entries'}</span></div>
        <code>${escapeHtml(stamp.stamp_code || 'FILED')}</code>
      </article>`;
  }).join('');
}

async function loadReportImage(source) {
  if (!source) return null;
  try {
    const response = await fetch(source);
    if (!response.ok) return null;
    return await createImageBitmap(await response.blob());
  } catch {
    return null;
  }
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.join(' ').length < String(text).length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, '')}…`;
  }
  lines.forEach((item, index) => context.fillText(item, x, y + (index * lineHeight)));
  return y + (lines.length * lineHeight);
}

async function createFieldReportBlob() {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 1000;
  const context = canvas.getContext('2d');
  const memoryByStep = new Map(journeyMemories.map((memory) => [Number(memory.step_index), memory]));
  const options = journeyOptions();

  context.fillStyle = '#f3efdf';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#191816';
  context.lineWidth = 5;
  context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
  context.fillStyle = '#ccff00';
  context.fillRect(28, 28, canvas.width - 56, 68);

  context.fillStyle = '#191816';
  context.font = '900 28px Arial';
  context.fillText('ELSEWHERE®', 58, 73);
  context.textAlign = 'right';
  context.fillText('FIELD REPORT 001', 1342, 73);
  context.textAlign = 'left';

  context.font = '78px Georgia';
  context.fillText('The Free Journey', 58, 176);
  context.font = '900 18px Arial';
  const byline = `${profile.name} · ${formatFieldDate(passportJourney?.completed_at, 'IN PROGRESS')} · ${options.company === 'with-a-friend' ? 'WITH A FRIEND' : 'SOLO'}`;
  context.fillText(byline, 62, 215);
  context.font = '24px Georgia';
  context.fillText('Six oddly specific reasons to leave the ordinary.', 62, 254);

  const stamp = await loadReportImage('/stamps/free-journey.png');
  if (stamp) {
    context.save();
    context.globalAlpha = 0.92;
    context.translate(1215, 178);
    context.rotate(-0.08);
    context.drawImage(stamp, -108, -108, 216, 216);
    context.restore();
    stamp.close?.();
  }

  const imageResults = await Promise.all(freeJourneyDetours.map((_, index) => loadReportImage(memoryByStep.get(index)?.signedUrl)));
  const gridTop = 310;
  const cardWidth = 410;
  const cardHeight = 292;
  const gapX = 28;
  const gapY = 28;

  freeJourneyDetours.forEach((detour, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 58 + (column * (cardWidth + gapX));
    const y = gridTop + (row * (cardHeight + gapY));
    const memory = memoryByStep.get(index);
    const photo = imageResults[index];

    context.fillStyle = index % 2 ? '#dceff4' : '#faf8ed';
    context.fillRect(x, y, cardWidth, cardHeight);
    context.strokeStyle = '#191816';
    context.lineWidth = 2;
    context.strokeRect(x, y, cardWidth, cardHeight);

    if (photo) {
      const photoHeight = 116;
      const scale = Math.max(cardWidth / photo.width, photoHeight / photo.height);
      const sourceWidth = cardWidth / scale;
      const sourceHeight = photoHeight / scale;
      context.drawImage(
        photo,
        (photo.width - sourceWidth) / 2,
        (photo.height - sourceHeight) / 2,
        sourceWidth,
        sourceHeight,
        x,
        y,
        cardWidth,
        photoHeight,
      );
      photo.close?.();
    }

    const contentTop = y + (photo ? 142 : 30);
    context.fillStyle = '#191816';
    context.font = '900 16px Arial';
    context.fillText(String(index + 1).padStart(2, '0'), x + 20, contentTop);
    context.font = '28px Georgia';
    drawWrappedText(context, detour.title, x + 20, contentTop + 38, cardWidth - 40, 30, 2);
    context.font = '20px Georgia';
    context.fillStyle = '#302d67';
    drawWrappedText(context, memory?.note || detour.prompt, x + 20, contentTop + 105, cardWidth - 40, 24, photo ? 2 : 3);
  });

  context.fillStyle = '#191816';
  context.font = '900 15px Arial';
  context.fillText(`PASSPORT ${profile.passportNumber} · ${options.pace === 'take-your-time' ? 'TAKE YOUR TIME' : 'ONE SITTING'}`, 58, 953);
  context.textAlign = 'right';
  context.fillText('ELSEWHERE.WORK.GD', 1342, 953);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The field report could not be prepared.')), 'image/png');
  });
}

async function downloadFieldReport(button) {
  button.disabled = true;
  button.textContent = 'Preparing report…';
  try {
    const blob = await createFieldReportBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elsewhere-free-journey-field-report.png';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    button.textContent = 'Field report saved';
  } catch {
    button.textContent = 'Try saving again';
  } finally {
    button.disabled = false;
  }
}

spread.addEventListener('click', (event) => {
  const button = event.target.closest('[data-download-field-report]');
  if (button) downloadFieldReport(button);
});

function showSignedOut() {
  currentUser = null;
  profile = signedOutProfile;
  passportStamps = [];
  passportJourney = null;
  journeyCompletions = [];
  journeyMemories = [];
  renderStampBenefits();
  signInForm.hidden = false;
  memberPanel.hidden = true;
  accountDescription.textContent = 'Use a private email link to open your passport on any device.';
  syncNote.textContent = 'Sign in to sync your identity. Stamps appear only after verified completions.';
  refreshVisibleSpread();
}

async function loadPassportData(user) {
  let [profileResult, stampsResult, journeyResult, completionsResult, memoriesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, home_base, passport_number, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('stamps')
      .select('detour_id, awarded_at, stamp_code, discount_percent, prize_entries')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: true }),
    supabase
      .from('journey_runs')
      .select('id, status, current_step, started_at, completed_at, pace, company, timezone_name')
      .eq('user_id', user.id)
      .eq('journey_id', 'free')
      .maybeSingle(),
    supabase
      .from('journey_step_completions')
      .select('step_index, completed_at, elapsed_seconds')
      .eq('user_id', user.id)
      .eq('journey_id', 'free')
      .order('step_index', { ascending: true }),
    supabase
      .from('journey_memories')
      .select('step_index, prompt, note, photo_path, updated_at')
      .eq('user_id', user.id)
      .eq('journey_id', 'free')
      .order('step_index', { ascending: true }),
  ]);

  if (stampsResult.error && /stamp_code|discount_percent|prize_entries|schema cache/i.test(stampsResult.error.message)) {
    stampsResult = await supabase
      .from('stamps')
      .select('detour_id, awarded_at')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: true });
  }

  if (journeyResult.error && /pace|company|timezone_name|schema cache/i.test(journeyResult.error.message)) {
    journeyResult = await supabase
      .from('journey_runs')
      .select('id, status, current_step, started_at, completed_at')
      .eq('user_id', user.id)
      .eq('journey_id', 'free')
      .maybeSingle();
  }

  if (profileResult.error) {
    profile = {
      name: user.email?.split('@')[0]?.toUpperCase() || 'TRAVELER',
      homeBase: '—',
      memberSince: '—',
      passportNumber: 'SETUP REQUIRED',
    };
    passportStamps = [];
    passportJourney = null;
    journeyCompletions = [];
    journeyMemories = [];
    renderStampBenefits();
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
  passportJourney = journeyResult.error ? null : journeyResult.data;
  journeyCompletions = completionsResult.error ? [] : (completionsResult.data ?? []);
  journeyMemories = memoriesResult.error ? [] : (memoriesResult.data ?? []);

  try {
    const localMemories = JSON.parse(window.localStorage.getItem(`elsewhere-journey-memories-${user.id}`) || '{}');
    Object.entries(localMemories).forEach(([stepIndex, memory]) => {
      if (journeyMemories.some((item) => Number(item.step_index) === Number(stepIndex))) return;
      journeyMemories.push({
        step_index: Number(stepIndex),
        prompt: memory.prompt || '',
        note: memory.note || '',
        photo_path: '',
        signedUrl: memory.photoDataUrl || '',
        updated_at: memory.updatedAt,
      });
    });
  } catch {
    // Device-only souvenir drafts are optional; remote records still load normally.
  }

  await Promise.all(journeyMemories.map(async (memory) => {
    if (!memory.photo_path) return;
    const signed = await supabase.storage.from('journey-souvenirs').createSignedUrl(memory.photo_path, 60 * 60);
    memory.signedUrl = signed.data?.signedUrl || '';
  }));

  renderStampBenefits();
  profileNameInput.value = profileRow.display_name ?? '';
  profileHomeBaseInput.value = profileRow.home_base ?? '';
  const passportDataError = stampsResult.error || journeyResult.error || completionsResult.error;
  setFeedback(passportDataError ? 'Passport loaded, but some journey records could not be retrieved.' : 'Passport and field report synced.', Boolean(passportDataError));
  syncNote.textContent = stampsResult.error
    ? 'Identity synced — stamp records are temporarily unavailable.'
    : `Signed in — ${passportStamps.length} earned ${passportStamps.length === 1 ? 'stamp' : 'stamps'} and ${journeyMemories.length} ${journeyMemories.length === 1 ? 'souvenir' : 'souvenirs'} synced securely.`;
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

  if (requestedOpen === 'field-report' && !openedRequestedReport) {
    openedRequestedReport = true;
    currentPosition = 2;
    renderSpread(currentPosition);
    updateControls();
  }

  if (safeReturnTo && !isReturningToJourney) {
    isReturningToJourney = true;
    setFeedback('Passport verified. Returning to your journey…');
    try {
      window.localStorage.removeItem('elsewhere-return-to');
    } catch {
      // The validated in-memory return path is still safe to use.
    }
    window.setTimeout(() => window.location.replace(safeReturnTo), 450);
  }
}

signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = signInForm.querySelector('button[type="submit"]');
  const email = new FormData(signInForm).get('email')?.toString().trim();
  if (!email) return;

  submitButton.disabled = true;
  setFeedback('Sending your private sign-in link…');
  const redirectUrl = new URL('/passport/', window.location.origin);
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
