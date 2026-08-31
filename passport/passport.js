const book = document.querySelector('#passport-book');
const cover = document.querySelector('#passport-cover');
const spread = document.querySelector('#passport-spread');
const previousButton = document.querySelector('#passport-previous');
const nextButton = document.querySelector('#passport-next');
const status = document.querySelector('#passport-status');
const progress = [...document.querySelectorAll('.passport-progress span')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const signedOutProfile = {
  name: 'SIGN IN TO COMPLETE',
  homeBase: '—',
  memberSince: '—',
  passportNumber: 'PENDING',
};

const profile = window.elsewherePassportUser ?? signedOutProfile;
const totalSpreads = 3;
let currentPosition = 0;
let isTurning = false;

function stampSpaces(start, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const number = String(start + index).padStart(2, '0');
    return `<div class="stamp-space"><span>STAMP ${number}</span></div>`;
  }).join('');
}

function register(title, number) {
  return `<div class="page-register"><span>${title}</span><span>${number}</span></div>`;
}

function identitySpread() {
  return `
    <section class="passport-page passport-page--upper identity-page" aria-label="Identity page">
      ${register('ELSEWHERE / IDENTITY', 'P')}
      <div class="identity-layout">
        <div class="passport-portrait" aria-label="Profile image placeholder">
          <span class="portrait-head" aria-hidden="true"></span>
          <span class="portrait-shoulders" aria-hidden="true"></span>
          <small>PHOTO</small>
        </div>
        <dl class="identity-fields">
          <div class="identity-field identity-field--wide"><dt>Name</dt><dd>${profile.name}</dd></div>
          <div class="identity-field"><dt>Home base</dt><dd>${profile.homeBase}</dd></div>
          <div class="identity-field"><dt>Member since</dt><dd>${profile.memberSince}</dd></div>
          <div class="identity-field identity-field--wide"><dt>Passport no.</dt><dd>${profile.passportNumber}</dd></div>
        </dl>
      </div>
      <div class="identity-machine-line" aria-hidden="true">P&lt;ELSEWHERE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
    </section>
    <section class="passport-page passport-page--lower stamp-page" aria-label="Stamp page one">
      ${register('COMPLETED DETOURS / 01', '01')}
      <div class="stamp-grid" aria-label="Six empty stamp spaces">${stampSpaces(1)}</div>
    </section>`;
}

function stampSpread(spreadNumber, firstStamp) {
  const upperPage = String(spreadNumber * 2).padStart(2, '0');
  const lowerPage = String(spreadNumber * 2 + 1).padStart(2, '0');
  return `
    <section class="passport-page passport-page--upper stamp-page" aria-label="Stamp page ${upperPage}">
      ${register(`COMPLETED DETOURS / ${upperPage}`, upperPage)}
      <div class="stamp-grid" aria-label="Six empty stamp spaces">${stampSpaces(firstStamp)}</div>
    </section>
    <section class="passport-page passport-page--lower stamp-page" aria-label="Stamp page ${lowerPage}">
      ${register(`COMPLETED DETOURS / ${lowerPage}`, lowerPage)}
      <div class="stamp-grid" aria-label="Six empty stamp spaces">${stampSpaces(firstStamp + 6)}</div>
    </section>`;
}

function renderSpread(position) {
  spread.innerHTML = position === 1
    ? identitySpread()
    : stampSpread(position - 1, position === 2 ? 7 : 19);
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

  if (wasCover || willBeCover || reduceMotion) {
    currentPosition = position;
    if (!willBeCover) renderSpread(currentPosition);
    updateControls();
    return;
  }

  isTurning = true;
  spread.classList.add(`turn-${direction}`);

  window.setTimeout(() => {
    currentPosition = position;
    renderSpread(currentPosition);
    updateControls();
  }, 220);

  window.setTimeout(() => {
    spread.classList.remove(`turn-${direction}`);
    isTurning = false;
  }, 470);
}

cover.addEventListener('click', () => goTo(1));
previousButton.addEventListener('click', () => goTo(currentPosition - 1));
nextButton.addEventListener('click', () => goTo(currentPosition + 1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goTo(currentPosition - 1);
  if (event.key === 'ArrowRight') goTo(currentPosition + 1);
});

renderSpread(1);
updateControls();
