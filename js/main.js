/* The app's start: the hash router, the top bar, and boot.

   Routes are #/name/id/mode (ROUTES below): home, tracks (Courses),
   track/<id>[/<part>], lesson/<id>[/review|/test], practice[/<subject>/<level>],
   problem/<id>[/review], interview, exam, quiz, play (the Sandbox), you[/<section>],
   welcome. Each screen is a render(mount, ctx) in js/screens/, given a fresh
   mount every time, and ctx: go(route), setTitle, showBack, refreshChrome and
   params ({ id, mode }). Back walks the app's own history (history.state.depth)
   and, opened straight onto a deep link, goes up to where that screen lives
   (parentOf). */

import { $, $$, toast, escapeHTML, localDay, wireTips } from './ui.js';
import { store } from './store.js';
import { python } from './python.js';
import { renderHome } from './screens/home.js';
import { renderTracks, renderTrack } from './screens/tracks.js';
import { renderLesson } from './screens/lesson.js';
import { renderSandbox } from './screens/sandbox.js';
import { renderYou } from './screens/you.js';
import { renderPractice, renderProblem, renderInterview } from './screens/practice.js';
import { renderExam, renderQuiz } from './screens/exam.js';
import { renderWelcome } from './screens/welcome.js';
import { applyDisplay } from './display.js';
import { listenForShortcuts } from './shortcuts.js';
import { lessonById } from './curriculum/index.js';
import { seedAchievements } from './game.js';
import { sync } from './sync.js';
import { wireAmbience } from './ambience.js';

applyDisplay();
// Achievements earned before they existed unlock quietly, once, not as notes on the next pass.
seedAchievements();
listenForShortcuts();
wireTips();          // every ? in the app (spare days, big days)
wireAmbience();      // the headphones in the top bar: background sounds

let screen = $('#screen');
const boot = $('#boot');
const app = $('#app');

/* ── Router ──────────────────────────────────────────────── */

// page: which parts of the route make it a different page rather than the
// same screen drawn again (render: a new page rises in, the same screen only
// cross-fades). Without it, the route is one screen whatever its id: You's id
// is just the section open, Practice's the subject. A course is a page of its
// own (its mode is only the part to scroll to); a lesson or question is too,
// and so is its Refill or test (the mode), which is drawn differently.
const ROUTES = {
  home:   { render: renderHome,    tab: 'home' },
  tracks: { render: renderTracks,  tab: 'tracks' },
  track:  { render: renderTrack,   tab: 'tracks', back: true, page: ['id'] },
  lesson: { render: renderLesson,  tab: null,     back: true, page: ['id', 'mode'] },
  play:   { render: renderSandbox, tab: 'play' },
  you:    { render: renderYou,     tab: 'you' },
  practice: { render: renderPractice, tab: 'practice' },
  problem:  { render: renderProblem,  tab: 'practice', back: true, page: ['id', 'mode'] },
  interview: { render: renderInterview, tab: 'practice', back: true },
  exam:      { render: renderExam,      tab: 'practice', back: true },
  quiz:      { render: renderQuiz,      tab: 'practice', back: true },
  welcome:   { render: renderWelcome,   tab: null },
};

/* Home's title is the brand: the app icon (its steam a rising bar chart)
   beside the wordmark. Every other screen titles itself in small capitals.
   The icon is the boot screen's, read before that screen goes. The steam
   rises once a session, not on every visit home. */
// Never let a missing icon stop the app: an index.html cached from before the
// icon existed, meeting this script, would otherwise fail right here.
const bootMark = $('#brand-mark');
const MARK = bootMark ? bootMark.cloneNode(true) : null;
if (MARK) {
  MARK.removeAttribute('id');
  MARK.classList.remove('boot-mark');
}
const BRAND = `${MARK ? MARK.outerHTML : ''}<span class="brand-word">Query<b>Cafe</b></span>`;
let brandShown = false;

const ctx = {
  go(path) {
    if (location.hash === '#/' + path) render();
    else location.hash = '#/' + path;
  },
  setTitle(text, { brand = false } = {}) {
    const title = $('#topbar-title');
    title.classList.toggle('is-brand', brand);
    title.classList.toggle('is-rising', brand && !brandShown);
    if (brand) {
      title.innerHTML = BRAND;
      brandShown = true;
    } else {
      title.textContent = text;
    }
  },
  showBack(show) { $('#nav-back').hidden = !show; },
  refreshChrome,
  params: {},
};

function parse() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [name, id, mode] = raw.split('/');
  return ROUTES[name] ? { name, id, mode } : { name: 'home', id: undefined };
}

function render() {
  const parsed = parse();
  // Someone brand new gets the welcome where Home would be, until they've answered it.
  const name = parsed.name === 'home' && store.isNew() ? 'welcome' : parsed.name;
  const { id, mode } = parsed;
  const route = ROUTES[name];
  // Where the screen you're leaving is on the window, read before anything
  // below moves the layout (leaving the welcome brings the tab bar back), so
  // it fades out exactly where you saw it.
  const old = screen;
  const box = old.getBoundingClientRect();
  app.classList.toggle('is-welcome', name === 'welcome');

  ctx.params = { id, mode };
  ctx.showBack(Boolean(route.back));

  // A fresh element for every screen. Screens attach click handlers to their
  // mount; on one long-lived node those piled up with every visit, so a single
  // tap was being handled several times over. A still copy of the old one
  // stays a moment as a fading layer over the new one (fadeAway), so the
  // change is a cross-fade with no blank frame. The new one goes in first, so
  // anything that looks up an id straight after a render (Settings reopening
  // its sync fold) finds the new screen's, not the copy's.
  const here = [name, ...(route.page || []).map((part) => parsed[part] || '')].join('/');
  const sub = here === shownRoute;              // the same screen again: You's sections, Practice's subjects...
  shownRoute = here;
  const fresh = old.cloneNode(false);
  old.before(fresh);
  screen = fresh;
  fadeAway(old, box, sub);
  route.render(screen, ctx);
  // A sub-page only cross-fades, so what didn't change doesn't move; a new
  // page also rises gently into place (styles.css, rise).
  screen.classList.toggle('is-sub', sub);
  // Screens that use the full width on a big monitor (lesson, problem, Sandbox)
  // keep the beans out of their margins. A track's lesson list doesn't.
  app.classList.toggle('is-workbench', screen.classList.contains('lesson-screen') && !screen.querySelector('.lessons'));

  $$('.tab').forEach((tab) => {
    const on = tab.dataset.route === route.tab;
    // Arriving on a tab you weren't on: its word gives a small lift (styles.css, tab-pop).
    if (on && !tab.classList.contains('is-active')) {
      tab.classList.remove('is-arriving');
      void tab.offsetWidth;                       // a reflow, so the lift plays again each time
      tab.classList.add('is-arriving');
    }
    tab.classList.toggle('is-active', on);
    if (on) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  moveTabInk();
  window.scrollTo(0, 0);                      // the page scrolls (styles.css, html), so a new screen starts at its top
  // A screen reader starts reading the new screen, not wherever the tap was.
  screen.focus({ preventScroll: true });
  refreshChrome();
}

/* Changing screens: a still copy of the screen you're leaving stays where it
   was, over the new one, and fades out (styles.css, .screen-ghost), going up
   a touch when it's a different page. It can't be tapped or read while it
   fades, and it's gone in about a fifth of a second, or at once if another
   change comes first. With reduced motion it simply goes.
   The screen itself leaves the page at once; only the copy stays. So the
   screens' isConnected checks keep working: what a screen was still waiting
   on (a sheet's preview, an Expected output, the Run button's download note)
   finds it gone and leaves it alone, rather than drawing into a screen
   you've left while it fades. */
let shownRoute = null;
const calm = matchMedia('(prefers-reduced-motion: reduce)');
function fadeAway(old, box, sub) {
  document.querySelectorAll('.screen-ghost').forEach((g) => g.remove());
  if (calm.matches || !old.firstChild) {
    old.remove();
    return;
  }
  const ghost = old.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.inert = true;
  ghost.setAttribute('aria-hidden', 'true');
  ghost.classList.add('screen-ghost');
  ghost.classList.toggle('is-page', !sub);
  // Pinned to the window where it was, so it stays put while the page goes
  // back to the top under it.
  Object.assign(ghost.style, {
    position: 'fixed', top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`,
  });
  old.replaceWith(ghost);
  const gone = () => ghost.remove();
  ghost.addEventListener('animationend', (event) => { if (event.target === ghost) gone(); });
  setTimeout(gone, 600);                       // in case the animation never runs (a hidden tab)
}

/* The tab bar's accent bar: one bar that slides from the tab you were on to
   the one you're on, rather than each tab lighting up on its own. Screens
   with no tab of their own (a lesson, a question) fade it out. The first time
   it's over a tab, it doesn't slide in from the edge: .is-ready, which turns
   the sliding on, is added only once it's been drawn there. The welcome, or a
   link straight to a lesson, has no tab, so that waits for the first one that
   does. A resize moves it too, since the tabs change width with the window. */
function moveTabInk() {
  const ink = $('.tab-ink');
  if (!ink) return;
  const on = $('.tab.is-active');
  ink.classList.toggle('is-off', !on);
  if (!on) return;
  ink.style.width = `${on.offsetWidth}px`;
  ink.style.transform = `translateX(${on.offsetLeft}px)`;
  if (!ink.classList.contains('is-ready')) {
    void ink.offsetWidth;                      // drawn in place first, so turning sliding on doesn't slide it there
    ink.classList.add('is-ready');
  }
}
window.addEventListener('resize', moveTabInk);

/* The page scrolls under the top bar (styles.css, html), so scrolling to
   something has to stop below the bar, whose height changes: the sounds
   strip comes and goes, and a notch adds to it. */
const topChrome = $('.top-chrome');
if (topChrome && 'ResizeObserver' in window) {
  new ResizeObserver(() => document.documentElement.style.setProperty('--chrome-top', `${topChrome.offsetHeight}px`))
    .observe(topChrome);
}

/* Back. Every screen opened in the app gets a depth in history.state, the
   first one 0. Opened straight onto a lesson (a bookmark, a shared link),
   there's no earlier screen of ours to go back to, and history.back() would
   leave the app; go up to where that screen lives instead. */
let depth = 0;

function onHashChange() {
  if (history.state && typeof history.state.depth === 'number') {
    depth = history.state.depth;                 // back or forward to a screen we numbered
  } else {
    depth += 1;                                  // a new screen
    history.replaceState({ depth }, '');
  }
  render();
}

function parentOf() {
  const { name, id } = parse();
  if (name === 'lesson') {
    const lesson = lessonById(id);
    return lesson ? `track/${lesson.track.id}` : 'tracks';
  }
  return { track: 'tracks', problem: 'practice', interview: 'practice', exam: 'practice', quiz: 'exam' }[name] || 'home';
}

window.addEventListener('hashchange', onHashChange);

$('#nav-back').addEventListener('click', () => {
  if (depth > 0) return history.back();
  history.replaceState({ depth: 0 }, '', `#/${parentOf()}`);
  render();
});

$$('.tab').forEach((tab) =>
  tab.addEventListener('click', () => ctx.go(tab.dataset.route))
);

/* ── Topbar chip: loading progress, then the streak ──────── */

let loadPct = 0;

function refreshChrome() {
  const chip = $('#streak-chip');
  const count = $('#streak-count');
  const unit = $('.streak-unit', chip);

  chip.classList.toggle('is-loading', !python.isReady);
  if (!python.isReady) {
    chip.classList.add('is-cold');
    chip.title = 'Getting ready to run code';
    count.textContent = loadPct ? `${loadPct}%` : '···';
    unit.hidden = true;
    return;
  }

  const streak = store.liveStreak();
  const grew = streak > Number(count.textContent || 0);

  // The cup steams once something's finished today, so a glance says whether today is done.
  const warm = store.state.lastDay === localDay(new Date());
  chip.classList.toggle('is-cold', streak === 0);
  chip.classList.toggle('is-warm', warm);
  chip.title = streak ? `${streak} day streak${warm ? ', and today is done' : '. Nothing finished yet today'}`
    : 'Finish a lesson to start a streak';
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
  // The splash is gone after first boot, but a restart reports status too.
  const label = $('#boot-status');
  const bar = $('#boot-bar');
  if (label) label.textContent = text;
  if (bar) bar.style.width = `${pct}%`;
  refreshChrome();
});

python.on('ready', () => {
  refreshChrome();
  if (!store.state.visited) {
    store.markVisited();
    toast("Python's ready. You can run code now.");
  }
});

python.on('fatal', ({ text }) => {
  const label = $('#boot-status');
  if (label) label.textContent = 'Could not load Python';
  screen.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Something went wrong</p>
        <h1 class="display">Python couldn't start.</h1>
      </div>
      <div class="verdict verdict-no">
        <span class="label">Reason</span>
        <p>${escapeHTML(text)}</p>
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

// replaceState, not location.hash: that added a blank-URL entry behind Home
// (so Back from Home just showed Home again) and rendered Home twice at start.
history.replaceState({ depth: 0 }, '', location.hash ? undefined : '#/home');
python.boot();
// Sync across devices: only goes near the network once it's turned on, on You.
sync.start(ctx, (added) => toast(`Synced: ${added} finished item${added === 1 ? '' : 's'} from your other device`));
// A beat of the splash so it doesn't flash, then straight into the app. The
// beat counts from when the page started opening, not from here: this used
// to wait a further 550 ms after the code had loaded, on every open, so a
// phone that took a second to load waited a second and a half.
setTimeout(reveal, Math.max(0, 400 - performance.now()));

/* ── Service worker ──────────────────────────────────────── */

if ('serviceWorker' in navigator) {
  /* The cached shell is what makes this open instantly and work offline, but it
     also meant a deploy took two opens to appear. A new worker calls
     skipWaiting() and claims this page, which fires controllerchange — reload
     once at that point and updates land on the first open instead.
     `hadController` guards the very first install, where claiming is not an
     update and a reload would be pointless. */
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* http:// or private mode */ });
  });

  /* An app left open for a while (an installed one, on a phone, for days):
     when it comes back, look for a new build. A new one takes over at once,
     and controllerchange above reloads into it. Drafts are saved as you type. */
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 10 * 60 * 1000) {
      navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update()).catch(() => {});
    }
  });
}
