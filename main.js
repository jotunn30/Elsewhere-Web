const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const detours = [
  {
    eyebrow: 'Detour no. 01', title: 'Follow the color yellow',
    instructions: 'Leave with no destination. Take the first yellow thing you see as a sign, then the next. Stop after seven signs.',
    time: '34 minutes', take: 'One small coin', rule: 'No maps allowed', reward: 'A new shortcut home', accent: '#ff5b35',
    image: assetPath('detours/yellow-trail.webp'), imageAlt: 'A yellow bicycle, flowers, umbrella, and doorway form a trail through a quiet street.',
  },
  {
    eyebrow: 'Detour no. 02', title: 'Find the quietest table',
    instructions: 'Enter the third café you pass. Order something you have never tried and write down the best sentence you overhear.',
    time: '51 minutes', take: 'A blunt pencil', rule: 'Keep your phone away', reward: 'One borrowed story', accent: '#2254f4',
    image: assetPath('detours/quiet-table.webp'), imageAlt: 'A quiet café table with a warm drink, an unfamiliar pastry, a blunt pencil, and a blank notebook.',
  },
  {
    eyebrow: 'Detour no. 03', title: 'Collect five tiny wonders',
    instructions: 'Walk one familiar street very slowly. Photograph only details smaller than your palm. Give the collection a grand title.',
    time: '27 minutes', take: 'Your sharpest eyes', rule: 'Nothing expensive counts', reward: 'Proof the day was here', accent: '#d448a8',
    image: assetPath('detours/tiny-wonders.webp'), imageAlt: 'Five tiny found objects resting on a sunlit stone ledge.',
  },
  {
    eyebrow: 'Detour no. 04', title: 'Ask a stranger for a song',
    instructions: 'Find someone who looks unhurried. Ask what they would play on a long train ride. Listen to it while walking nowhere useful.',
    time: '42 minutes', take: 'A little courage', rule: 'Accept the first answer', reward: 'A borrowed soundtrack', accent: '#16836d',
    image: assetPath('detours/borrowed-song.webp'), imageAlt: 'Two people exchange a pair of wired headphones beside a waiting train.',
  },
  {
    eyebrow: 'Detour no. 05', title: 'Visit a future memory',
    instructions: 'Choose a nearby place you have never entered. Sit for ten minutes and imagine telling someone about this exact afternoon in ten years.',
    time: '63 minutes', take: 'Something to drink', rule: 'Do not rush the ending', reward: 'A memory in advance', accent: '#8652cc',
    image: assetPath('detours/future-memory.webp'), imageAlt: 'A person sits with a drink in a sunlit glasshouse, looking out through the plants.',
  },
  {
    eyebrow: 'Detour no. 06', title: 'Let a coin plan the route',
    instructions: 'At every corner, flip: heads means left, tails means right. Continue until you meet a door you wish you could open.',
    time: '39 minutes', take: 'One decisive coin', rule: 'Turn back only once', reward: 'A beautifully wrong turn', accent: '#e78d10',
    image: assetPath('detours/coin-route.webp'), imageAlt: 'A hand flips a coin where two old city streets split left and right.',
  },
];

const elements = {
  shell: document.querySelector('#site-shell'), issue: document.querySelector('#issue'),
  eyebrow: document.querySelector('#eyebrow'), title: document.querySelector('#detour-title'),
  instructions: document.querySelector('#instructions'), time: document.querySelector('#time'),
  take: document.querySelector('#take'), rule: document.querySelector('#rule'), reward: document.querySelector('#reward'),
  image: document.querySelector('#detour-image'), button: document.querySelector('#generate'),
};

let currentIndex = 0;
let issue = 1;

function generateDetour() {
  const offset = 1 + Math.floor(Math.random() * (detours.length - 1));
  currentIndex = (currentIndex + offset) % detours.length;
  issue += 1;
  const detour = detours[currentIndex];

  elements.shell.style.setProperty('--accent', detour.accent);
  elements.issue.textContent = String(issue).padStart(3, '0');
  elements.issue.parentElement.setAttribute('aria-label', `Issue ${String(issue).padStart(3, '0')}`);
  elements.eyebrow.textContent = detour.eyebrow;
  elements.title.textContent = detour.title;
  elements.instructions.textContent = detour.instructions;
  elements.time.textContent = detour.time;
  elements.take.textContent = detour.take;
  elements.rule.textContent = detour.rule;
  elements.reward.textContent = detour.reward;
  elements.image.src = detour.image;
  elements.image.alt = detour.imageAlt;
}

detours.slice(1).forEach((detour) => {
  const image = new Image();
  image.src = detour.image;
});

elements.button.addEventListener('click', generateDetour);
