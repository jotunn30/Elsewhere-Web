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
