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
    eyebrow: 'Detour no. 01',
    title: 'Follow the color yellow',
    instructions: 'Leave with no destination. Take the first yellow thing you see as a sign, then the next. Stop after seven signs.',
    time: '34 minutes',
    take: 'One small coin',
    rule: 'No maps allowed',
    reward: 'A new shortcut home',
    accent: '#ff5b35',
    image: '/detours/yellow-trail.webp',
    imageAlt: 'A yellow bicycle, flowers, umbrella, and doorway form a trail through a quiet street.',
  },
  {
    eyebrow: 'Detour no. 02',
    title: 'Find the quietest table',
    instructions: 'Enter the third café you pass. Order something you have never tried and write down the best sentence you overhear.',
    time: '51 minutes',
    take: 'A blunt pencil',
    rule: 'Keep your phone away',
    reward: 'One borrowed story',
    accent: '#2254f4',
    image: '/detours/quiet-table.webp',
    imageAlt: 'A quiet café table with a warm drink, an unfamiliar pastry, a blunt pencil, and a blank notebook.',
  },
  {
    eyebrow: 'Detour no. 03',
    title: 'Collect five tiny wonders',
    instructions: 'Walk one familiar street very slowly. Photograph only details smaller than your palm. Give the collection a grand title.',
    time: '27 minutes',
    take: 'Your sharpest eyes',
    rule: 'Nothing expensive counts',
    reward: 'Proof the day was here',
    accent: '#d448a8',
    image: '/detours/tiny-wonders.webp',
    imageAlt: 'Five tiny found objects resting on a sunlit stone ledge.',
  },
  {
    eyebrow: 'Detour no. 04',
    title: 'Ask a stranger for a song',
    instructions: 'Find someone who looks unhurried. Ask what they would play on a long train ride. Listen to it while walking nowhere useful.',
    time: '42 minutes',
    take: 'A little courage',
    rule: 'Accept the first answer',
    reward: 'A borrowed soundtrack',
    accent: '#16836d',
    image: '/detours/borrowed-song.webp',
    imageAlt: 'Two people exchange a pair of wired headphones beside a waiting train.',
  },
  {
    eyebrow: 'Detour no. 05',
    title: 'Visit a future memory',
    instructions: 'Choose a nearby place you have never entered. Sit for ten minutes and imagine telling someone about this exact afternoon in ten years.',
    time: '63 minutes',
    take: 'Something to drink',
    rule: 'Do not rush the ending',
    reward: 'A memory in advance',
    accent: '#8652cc',
    image: '/detours/future-memory.webp',
    imageAlt: 'A person sits with a drink in a sunlit glasshouse, looking out through the plants.',
  },
  {
    eyebrow: 'Detour no. 06',
    title: 'Let a coin plan the route',
    instructions: 'At every corner, flip: heads means left, tails means right. Continue until you meet a door you wish you could open.',
    time: '39 minutes',
    take: 'One decisive coin',
    rule: 'Turn back only once',
    reward: 'A beautifully wrong turn',
    accent: '#e78d10',
    image: '/detours/coin-route.webp',
    imageAlt: 'A hand flips a coin where two old city streets split left and right.',
  },
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
  reader: document.querySelector('#detour-reader'),
  readerClose: document.querySelector('#detour-reader-close'),
  readerStage: document.querySelector('#detour-reader-stage'),
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
  elements.gallery.hidden = false;
  elements.gallery.innerHTML = detours.map(galleryCardMarkup).join('');
  elements.summary.removeAttribute('role');
  elements.summaryMark.hidden = true;
  elements.summaryKicker.textContent = `Filed collection · ${detours.length} detours`;
  elements.summaryTitle.textContent = category.title;
  elements.summaryDescription.textContent = category.description;
}

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
