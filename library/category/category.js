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

const requestedCategory = new URLSearchParams(window.location.search).get('category');
const category = categories[requestedCategory] ?? categories.free;

document.querySelector('#folder-number').textContent = category.number;
document.querySelector('#folder-label').textContent = `Category ${category.number}`;
document.querySelector('#folder-title').textContent = category.title;
document.querySelector('#folder-description').textContent = category.description;
document.querySelector('#folder-image').src = category.image;
document.title = `${category.title} Detours — Elsewhere`;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const closeLinks = document.querySelectorAll('.folder-back, .site-nav a[href="/library/"]');
let isClosing = false;

function isPlainNavigation(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function closeFolder(event) {
  if (!isPlainNavigation(event) || isClosing) return;

  const destination = event.currentTarget.href;
  const folder = document.querySelector('#open-folder');

  if (prefersReducedMotion.matches || typeof folder.animate !== 'function') return;

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
