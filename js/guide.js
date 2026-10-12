/* The first-time guides: a few spotlight steps over a screen, the first time
   it's opened after the welcome (and again, for every screen, from You →
   Settings). Each step lights up one real thing on the screen and says what
   it's for in a sentence or two. Skip ends that screen's guide. A step
   whose thing isn't on screen, or is hidden at this width, is passed over.
   Each screen calls guideIfDue('its name') once it's drawn. */

import { store } from './store.js';
import { escapeHTML } from './ui.js';

/* `at` is a selector, or a list tried in order (the first that's showing wins). */
const GUIDES = {
  home: [
    { at: '.block', title: 'Your next lesson',
      text: 'Tap here to start. It takes about three minutes.' },
    { at: '.cafe-row', title: "Today's cup and your loyalty card",
      text: 'Each day you finish something stamps this week\'s card and tops up the cup. 7 days in a row saves a spare day, and 14 is a big day.' },
    { at: '#streak-chip', title: 'Your streak',
      text: "How many days in a row you've learned something. The cup steams once today's is done." },
    { at: '#amb-btn', title: 'Background sounds',
      text: 'Lo-fi music, café chatter or rain, to learn to. Tap the headphones to turn them on.' },
    { at: '.tab[data-route="tracks"]', title: 'Courses',
      text: "Everything, in the order we'd take it. Every course is open, so jump around if you like." },
    { at: '.tab[data-route="practice"]', title: 'Practice',
      text: 'Problems with hidden tests, for when the lessons start to feel easy.' },
    { at: '.tab[data-route="you"]', title: 'You',
      text: 'Your progress, and settings like dark mode, text size and sounds.' },
  ],

  tracks: [
    { at: '#screen .stack > div:first-child', title: 'Your stage',
      text: "The courses come in stages. This is the one you're on, and how far through it you are." },
    { at: ['.track-group .track:has(.track-next)', '.track-group.is-current .track'], title: 'A course',
      text: 'Tap a course to see its lessons. The Next line shows where you left off.' },
    { at: '.track-group.is-current .boss-note, .track-group.is-current .boss-go', title: 'The boss',
      text: 'Each stage ends with a boss: a few questions from across the whole stage, for bonus points. Finish the stage to unlock it.' },
    { at: '.track-group:not(.is-current) .section-head', title: 'Every other course',
      text: 'Every other stage is on this page too, with all its courses. Nothing is locked, so start any of them whenever you like.' },
  ],

  track: [
    { at: '.part-head', title: 'Parts',
      text: "Lessons come in short parts of a few at a time. The number on the right is how many of this part you've done." },
    { at: ['.lesson-row.is-next', '.lesson-row'], title: 'Your next lesson',
      text: 'Tap any lesson to open it. None of them are locked, so you can start wherever you like.' },
    { at: '.part-test', title: 'Know it already?',
      text: 'Answer a few questions from this part. Get them all right and the whole part is ticked off.' },
    { at: '.lesson-screen .boss-note, .lesson-screen .boss-go', title: 'The mini boss',
      text: 'Finish the course and its mini boss opens: a few questions from across it, for bonus points.' },
  ],

  lesson: [
    { at: '.l-intro .lesson-title', title: 'Read this first',
      text: 'A short explanation with an example. Read it through, then try it yourself below.' },
    { at: '.task', title: 'Your turn',
      text: 'This is what to do. The example above shows you how.' },
    { at: '.editor-wrap', title: 'The editor',
      text: "Type your code here. The buttons under it type common bits for you, so you don't have to remember everything." },
    { at: '#run', title: 'Run',
      text: "Runs your code and checks it. What it prints appears in the output. If it's not right yet, you'll see what to fix." },
    { at: '.layout-switch', title: 'Where the output goes',
      text: 'Under your code, or side by side with it. Pick whichever is easier to read.' },
    { at: '#hint-box', title: 'Stuck?',
      text: '"Nudge me" gives you a hint, and the answer is just under it. Both are fine to use. You only miss the first-try bonus.' },
  ],

  practice: [
    { at: '.filters[aria-label="Subject"]', title: 'Pick a subject',
      text: 'The problems below change to match.' },
    { at: '#pick', title: 'Pick one for me',
      text: "Picks a problem in this subject you haven't solved yet, from the easiest level with one left." },
    { at: '.levels .diff-fold', title: 'Problems by level',
      text: 'Easy first, then harder. Tap a level to open it.' },
    { at: '#screen .quick-row', title: 'Two more ways to practise',
      text: "Interview set: three problems against a 20-minute clock. PL-300 prep: questions for Microsoft's Power BI exam." },
  ],

  problem: [
    { at: '.prompt', title: 'The problem',
      text: 'No lesson this time, just what your code needs to do.' },
    { at: '.p-example', title: 'An example',
      text: 'What goes in, and what should come out.' },
    { at: '#run', title: 'Run',
      text: 'Tries your code on the example only, so you can check it as you go.' },
    { at: '#submit', title: 'Submit',
      text: "Checks your code against tests you can't see, tricky cases included. Pass them all and it's solved." },
    { at: '.l-help', title: 'Stuck?',
      text: "There's a hint, and a full solution. Solving it after a look still counts. It just isn't a clean solve." },
  ],

  sandbox: [
    { at: '#modes', title: 'Pick a language',
      text: "Each one keeps its own code, so switching doesn't lose anything." },
    { at: '#recipes', title: 'Not sure what to try?',
      text: 'Tap one of these to put an example in the editor.' },
    { at: '.editor-wrap', title: 'Anything goes',
      text: 'Nothing here is marked. Load CSV, above the editor, turns a file of your own into a table you can use.' },
    { at: '#run', title: 'Run',
      text: 'The output shows up under the code.' },
  ],

  you: [
    { at: '.filters[aria-label="Part of You"]', title: 'Three parts',
      text: "Your progress, the achievements you've earned, and your settings." },
    { at: '.block-static', title: 'Your level',
      text: 'Every lesson and problem earns points. The bar shows how close you are to the next level.' },
    { at: '.spare-line', title: 'Spare days',
      text: 'These keep your streak going when you miss a day. Tap a ? to read more.' },
    { at: '.week', title: 'This week',
      text: 'One bar for each day. The taller it is, the more you did.' },
    { at: '[data-section="settings"]', title: 'Settings',
      text: 'Dark mode, text size, sounds, the code layout, and moving your progress to another device.' },
  ],

  exam: [
    { at: '.figures', title: 'Your scores',
      text: "How many questions you've tried, how many you got right, and your best mock exam." },
    { at: '#practice-all', title: 'A short set',
      text: 'Mixed questions, each with an explanation once you answer.' },
    { at: '#mock', title: 'A mock exam',
      text: 'A full practice exam against the clock, like the real one.' },
    { at: '.exam-area', title: 'One area at a time',
      text: 'Tap an area for questions from just that part of the exam. Ones you got wrong come back first.' },
  ],
};

/** Every screen with a guide: welcome.js skips them all for someone bringing progress over. */
export const GUIDE_PAGES = Object.keys(GUIDES);

/* The first match that's actually showing (display:none has no boxes). */
function find(at) {
  for (const selector of [].concat(at)) {
    let el = null;
    try { el = document.querySelector(selector); } catch { continue; }   // :has() on an older browser
    if (el && el.getClientRects().length && el.offsetWidth) return el;
  }
  return null;
}

let open = null;

export function startGuide(page = 'home') {
  if (open || !GUIDES[page]) return;
  const steps = GUIDES[page].filter((s) => find(s.at));
  if (!steps.length) return;
  let at = 0;

  const layer = document.createElement('div');
  layer.className = 'guide';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-labelledby', 'guide-title');
  layer.innerHTML = '<div class="guide-spot"></div><div class="guide-card" aria-live="polite"></div>';
  document.body.append(layer);
  const spot = layer.querySelector('.guide-spot');
  const card = layer.querySelector('.guide-card');

  const end = () => {
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
    window.removeEventListener('hashchange', end);
    document.removeEventListener('keydown', keys);
    layer.remove();
    open = null;
    store.markGuide(page);
  };

  function place() {
    const target = find(steps[at].at);
    if (!target) return;
    const r = target.getBoundingClientRect();
    const pad = 6;
    Object.assign(spot.style, {
      left: `${r.left - pad}px`, top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`,
    });
    // The card goes below the lit thing when there's room, above it when
    // there's room there, and at the foot of the screen when there's neither.
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 16));
    card.style.width = `${width}px`;
    card.style.left = `${left}px`;
    const height = card.offsetHeight;
    const below = r.bottom + pad + 14;
    const above = r.top - pad - 14 - height;
    card.style.top = `${below + height < window.innerHeight - 12 ? below
      : above >= 12 ? above : Math.max(12, window.innerHeight - height - 12)}px`;
  }

  function show() {
    const step = steps[at];
    const last = at === steps.length - 1;
    card.innerHTML = `
      <p class="guide-count">${at + 1} of ${steps.length}</p>
      <h2 class="guide-title" id="guide-title">${escapeHTML(step.title)}</h2>
      <p class="guide-text">${escapeHTML(step.text)}</p>
      <div class="guide-actions">
        ${last ? '<span></span>' : '<button class="btn-text" data-act="skip">Skip</button>'}
        <span class="guide-nav">
          ${at ? '<button class="btn btn-quiet btn-sm" data-act="back">Back</button>' : ''}
          <button class="btn btn-primary btn-sm" data-act="next">${last ? 'Got it' : 'Next'}</button>
        </span>
      </div>`;
    const target = find(step.at);
    // Things inside the scrolling screen are brought into view first; the tab bar is always there.
    if (target && target.closest('#screen')) target.scrollIntoView({ block: 'center' });
    requestAnimationFrame(() => requestAnimationFrame(place));
    card.querySelector('[data-act="next"]').focus({ preventScroll: true });
  }

  function keys(event) {
    if (event.key === 'Escape') end();
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft' && at) go(-1);
  }

  function go(step) {
    at += step;
    if (at >= steps.length) return end();
    show();
  }

  layer.addEventListener('click', (event) => {
    const act = event.target.closest('[data-act]');
    if (!act) return;                     // taps on the dimmed screen do nothing
    if (act.dataset.act === 'skip') end();
    if (act.dataset.act === 'back') go(-1);
    if (act.dataset.act === 'next') go(1);
  });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);   // the screen scrolls smoothly; the light follows it
  window.addEventListener('hashchange', end);       // leaving the screen (Back, a link) ends its guide
  document.addEventListener('keydown', keys);
  open = layer;
  show();
}

/** A screen calls this once it's drawn: its guide, the first time round
    after the welcome. Someone who's moved on by the time it would open
    doesn't get it over the next screen. */
export function guideIfDue(page = 'home') {
  if (!store.state.welcomed || store.seenGuide(page)) return;
  const here = location.hash;
  setTimeout(() => { if (location.hash === here) startGuide(page); }, 450);
}

/** Someone bringing their progress over has seen it all before. */
export const skipGuides = () => store.markGuide(...GUIDE_PAGES);
