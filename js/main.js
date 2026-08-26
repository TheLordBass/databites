import { $, $$, toast } from './ui.js';
import { store } from './store.js';
import { python } from './python.js';
import { renderHome } from './screens/home.js';
import { renderTracks, renderTrack } from './screens/tracks.js';
import { renderLesson } from './screens/lesson.js';
import { renderSandbox } from './screens/sandbox.js';
import { renderYou } from './screens/you.js';

const screen = $('#screen');
const boot = $('#boot');
const app = $('#app');

/* ── Router ──────────────────────────────────────────────── */

const ROUTES = {
  home:   { render: renderHome,    tab: 'home' },
  tracks: { render: renderTracks,  tab: 'tracks' },
  track:  { render: renderTrack,   tab: 'tracks', back: true },
  lesson: { render: renderLesson,  tab: null,     back: true },
  play:   { render: renderSandbox, tab: 'play' },
  you:    { render: renderYou,     tab: 'you' },
};

const ctx = {
  go(path) {
    if (location.hash === '#/' + path) render();
    else location.hash = '#/' + path;
  },
  setTitle(text) { $('#topbar-title').textContent = text; },
  showBack(show) { $('#nav-back').hidden = !show; },
  refreshChrome,
  params: {},
};

function parse() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [name, id] = raw.split('/');
  return ROUTES[name] ? { name, id } : { name: 'home', id: undefined };
}

function render() {
  const { name, id } = parse();
  const route = ROUTES[name];

  ctx.params = { id };
  ctx.showBack(Boolean(route.back));

  screen.innerHTML = '';
  route.render(screen, ctx);

  $$('.tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.route === route.tab));
  screen.scrollTop = 0;
  refreshChrome();
}

window.addEventListener('hashchange', render);

$('#nav-back').addEventListener('click', () => history.back());

$$('.tab').forEach((tab) =>
  tab.addEventListener('click', () => ctx.go(tab.dataset.route))
);

/* ── Topbar chip: loading progress, then the streak ──────── */

let loadPct = 0;

function refreshChrome() {
  const chip = $('#streak-chip');
  const count = $('#streak-count');
  const unit = $('.streak-unit', chip);

  if (!python.isReady) {
    chip.classList.add('is-cold');
    chip.title = 'Python is starting';
    count.textContent = loadPct ? `${loadPct}%` : '···';
    unit.hidden = true;
    return;
  }

  const streak = store.liveStreak();
  const grew = streak > Number(count.textContent || 0);

  chip.classList.toggle('is-cold', streak === 0);
  chip.title = streak ? `${streak} day streak` : 'Finish a lesson to start a streak';
  count.textContent = streak;
  unit.hidden = false;
  unit.textContent = streak === 1 ? 'day' : 'days';

  if (grew) {
    chip.classList.remove('is-flaring');
    void chip.offsetWidth;               // restart the animation
    chip.classList.add('is-flaring');
  }
}

/* ── Boot ────────────────────────────────────────────────── */

python.on('status', ({ text, pct }) => {
  loadPct = pct;
  $('#boot-status').textContent = text;
  $('#boot-bar').style.width = `${pct}%`;
  refreshChrome();
});

python.on('ready', () => {
  refreshChrome();
  if (!store.state.visited) {
    store.markVisited();
    toast('Python is live. Nothing to install.');
  }
});

python.on('fatal', ({ text }) => {
  $('#boot-status').textContent = 'Could not load Python';
  screen.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Something went wrong</p>
        <h1 class="display">Python couldn't start.</h1>
      </div>
      <div class="verdict verdict-no">
        <span class="label">Reason</span>
        <p>${text}</p>
      </div>
      <p class="note">The first run needs a connection to download the Python runtime.
      After that it works offline.</p>
      <button class="btn btn-primary btn-block" id="retry">Try again</button>
    </div>`;
  screen.querySelector('#retry').addEventListener('click', () => location.reload());
  toast('Offline? The first load needs a connection.');
});

/* Show the app straight away — reading the lesson shouldn't wait on a download. */
function reveal() {
  boot.classList.add('is-gone');
  app.hidden = false;
  render();
  setTimeout(() => boot.remove(), 500);
}

if (!location.hash) location.hash = '#/home';
python.boot();
// A beat of the splash so it doesn't flash, then straight into the app.
setTimeout(reveal, 550);

/* ── Service worker ──────────────────────────────────────── */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* http:// or private mode */ });
  });
}
