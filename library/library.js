const folders = [...document.querySelectorAll('.category-card')];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isNavigating = false;

function isPlainNavigation(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function makeBackdrop() {
  const backdrop = document.createElement('div');
  backdrop.className = 'folder-transition-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(backdrop);
  return backdrop;
}

function openFolder(event) {
  if (!isPlainNavigation(event) || isNavigating) return;

  const folder = event.currentTarget;
  const destination = folder.href;

  if (prefersReducedMotion.matches || typeof folder.animate !== 'function') return;

  event.preventDefault();
  isNavigating = true;

  const start = folder.getBoundingClientRect();
  const targetWidth = Math.min(window.innerWidth - 32, 1050);
  const targetHeight = Math.min(
    window.innerHeight - 40,
    window.innerWidth <= 680 ? 590 : 690,
  );
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;
  const clone = folder.cloneNode(true);
  const backdrop = makeBackdrop();

  clone.removeAttribute('href');
  clone.removeAttribute('aria-label');
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('category-card--route-clone');
  Object.assign(clone.style, {
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
  });

  folder.classList.add('category-card--source-hidden');
  document.body.classList.add('folder-transition-active');
  document.body.append(clone);

  backdrop.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 520, easing: 'ease-out', fill: 'forwards' },
  );

  const motion = clone.animate(
    [
      {
        left: `${start.left}px`,
        top: `${start.top}px`,
        width: `${start.width}px`,
        height: `${start.height}px`,
        transform: 'rotate(0deg)',
      },
      {
        left: `${targetLeft}px`,
        top: `${targetTop}px`,
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        transform: 'rotate(-0.35deg)',
      },
    ],
    { duration: 580, easing: 'cubic-bezier(.2,.82,.2,1)', fill: 'forwards' },
  );

  motion.finished
    .catch(() => undefined)
    .finally(() => window.location.assign(destination));
}

folders.forEach((folder) => folder.addEventListener('click', openFolder));
