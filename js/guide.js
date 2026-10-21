/* The first-time guides: a few spotlight steps over a screen, the first time
   it's opened after the welcome (and again, for every screen, from You →
   Settings). Each step lights up one real thing on the screen and says what
   it's for in a sentence or two. Skip ends that screen's guide. A step
   whose thing isn't on screen, or is hidden at this width, is passed over.
   Each screen calls guideIfDue('its name') once it's drawn.

   Tips: one step each, shown the first time a thing turns up on a screen
   (Refills on Home, the Load CSV button, the outline after a few misses),
   one a visit, once that screen's own guide has been seen. A screen calls
   tipIfDue('its name') after drawing something new, like a run's result.

   Versions: each guide seen is stored with the build it was seen in. A guide
   listed in REWRITTEN with a build number counts as unseen for anyone who
   saw it in an older build, so a rewritten guide reaches people who know the
   old one. A new guide or tip reaches everyone the first time it applies.
   And WHATS_NEW is a short tour of what the latest build changed, shown once
   on Home to anyone who's used the app before. Raise its version and write
   new steps with each build that changes how things work.

   The rule: any build that changes something a guide or tip already
   describes (a screen's layout, a name, what a button does) rewrites that
   guide's text in the same build and sets its REWRITTEN entry to the new
   build number, so people who saw the old version see the new one. */

import { store } from './store.js';
import { escapeHTML } from './ui.js';
import { sync } from './sync.js';

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
    { at: '#screen .search-box', title: 'Find a lesson',
      text: 'Type a word, like VLOOKUP, groupby or join, to find every lesson and practice question that uses it.' },
    { at: '#screen .stack > div:first-child', title: 'Your stage',
      text: "The courses come in stages. This is the one you're on, and how far through it you are." },
    { at: ['.track-group .track:has(.track-next)', '.track-group.is-current .track'], title: 'A course',
      text: 'Tap a course to see its lessons. The Next line shows where you left off.' },
    { at: '.track-group.is-current .boss-note, .track-group.is-current .boss-go', title: 'The Signature',
      text: "Each stage ends with its Signature: a few questions from across the whole stage, for bonus points. Finish the stage to unlock it." },
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
    { at: '.lesson-screen .boss-note, .lesson-screen .boss-go', title: 'The Taste test',
      text: 'Finish the course and its Taste test opens: a few questions from across it, for bonus points.' },
  ],

  lesson: [
    { at: '.l-intro .lesson-title', title: 'Read this first',
      text: 'A few short points explain the idea, in plain words. Read them through, then try it yourself below.' },
    { at: 'details.worked', title: 'A worked example',
      text: 'Open this to see the idea used on something else first: the code, what it really gives, and what each piece does.' },
    { at: '.task', title: 'Your turn',
      text: "What to do, set out like a request at work: the situation, what you've got, and what to make. Expected output, under it, shows what the answer gives." },
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
    { at: '#screen .search-box', title: 'Search',
      text: "Type a word to find questions about it. A question's tags lead to every question with that tag." },
    { at: '#pick', title: 'Pick one for me',
      text: "Picks a problem in this subject you haven't solved yet, from the easiest level with one left." },
    { at: '.levels .diff-fold', title: 'Problems by level',
      text: 'Easy first, then harder. Tap a level to open it.' },
    { at: '#screen .quick-row', title: 'Two more ways to practise',
      text: "Interview set: three problems against a 20-minute clock. PL-300 prep: questions for Microsoft's Power BI exam." },
  ],

  problem: [
    { at: '.prompt', title: 'The problem',
      text: "No lesson this time. A request from the café's world: the situation, what you're given, and exactly what to return. The tricky cases are listed at the end." },
    { at: '.p-example', title: 'An example',
      text: "Tap a table's name to see what goes in, and Expected output for what should come out." },
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
      text: 'Nothing here is marked, so try anything. Nothing you do here can break.' },
    { at: '#run', title: 'Run',
      text: 'The output shows up under the code.' },
  ],

  you: [
    { at: '.filters[aria-label="Part of You"]', title: 'Three parts',
      text: "Your progress, the achievements you've earned, and your settings." },
    { at: '.block-static', title: 'Your level',
      text: 'Every lesson and problem earns points. The ten marks fill in as you get closer to the next level.' },
    { at: '.spare-line', title: 'Spare days',
      text: 'These keep your streak going when you miss a day. Tap a ? to read more.' },
    { at: '.week', title: 'This week',
      text: 'A stamp for each of the last 7 days you finished something, with the date on it. ×2 or more means you finished that many things that day.' },
    { at: '[data-section="settings"]', title: 'Settings',
      text: 'Colour themes, dark mode, text size, sounds, the code layout, and syncing your progress across devices.' },
  ],

  settings: [
    { at: '#sync-fold', title: 'Sync across devices',
      text: 'Learning on a phone and a computer? Open this and tap Get a code, then type that code on your other device. Both keep the same progress. No email, no account.' },
    { at: '#set-safe', title: 'Keep your progress safe',
      text: 'Save your progress to a file now and then. If you change phones or clear your browser, load the file to carry on where you were.' },
    { at: '#set-offline', title: 'No internet?',
      text: 'The app works offline once it has loaded. A few lessons need extras, and this downloads them all before a flight.' },
    { at: '#set-remind', title: 'A daily reminder',
      text: 'Adds a 5-minute slot to your calendar every day, with an alert.' },
    { at: '#set-display', title: 'How it looks and sounds',
      text: 'Colour themes, dark mode, bigger text, code and output side by side, and sounds when things pass.' },
    { at: ['#install', '#set-install'], title: 'On your home screen',
      text: 'Add QueryCafe to your home screen and it opens like an app, full screen.' },
    { at: '#set-about', title: 'How this works',
      text: "The version you're on, the keyboard shortcuts, and a button to see all these guides again." },
  ],

  achievements: [
    { at: '.ach-stamps, .ach-list', title: 'Achievements',
      text: "Each one you earn is a stamp of its own, with the day you got it. The ones still to earn say how." },
    { at: '.week-sum', title: 'Your first-try run',
      text: 'Pass new lessons and problems without a failed run, a nudge or a peek, and this run grows. Your best is kept.' },
  ],

  interview: [
    { at: '#iv-clock', title: 'The clock',
      text: 'Twenty minutes for three problems, like a real interview. Tap a problem to start it.' },
    { at: '#screen .problems', title: 'The set',
      text: "Each one shows its time once it's solved. Solve them in any order." },
    { at: '#iv-stop', title: 'Stop any time',
      text: 'Problems you finish after the clock still count, just not on the clock.' },
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

/* One-step tips, each for one screen, in the order they're offered there.
   `when`, if given, has to be true as well as the thing being on screen. */
const TIPS = [
  { id: 'tip-quick', page: 'home', at: '#screen .quick-row', title: 'Short on time?',
    text: 'Just 5 minutes lines up a Refill, your next lesson and an easy problem, one after another. Surprise me opens a lesson at random.' },
  { id: 'tip-sync', page: 'home', at: '.tab[data-route="you"]', title: 'Use more than one device?',
    when: () => Object.keys(store.state.done).length > 0 && !sync.code,
    text: 'Your progress is saved on this device. To have it on your phone and your computer too, open You, then Settings, then Sync across devices.' },
  { id: 'tip-special', page: 'home', at: '.quest', title: "Today's special",
    text: "Pick one small goal for bonus points. There's a new choice every day." },
  { id: 'tip-refills', page: 'home', at: '.recall', title: 'Refills',
    text: "Lessons you've finished come back here after a few days, for a quick go. Each time you get one right, it comes back later." },
  { id: 'tip-data', page: 'tracks', at: '#screen details.reveal', title: "What's in the data",
    text: 'Most lessons use the same café sales table. Open this to see its columns, and below it every other table you can use.' },
  { id: 'tip-refill', page: 'lesson', at: '.recall-how', title: 'A Refill',
    text: "You've done this one before, so the explanation is folded away. Try it from memory first. Open this if you need a reminder." },
  { id: 'tip-keys', page: 'lesson', at: '#run', title: 'Run from the keyboard',
    when: () => matchMedia('(hover: hover) and (pointer: fine)').matches,
    text: 'Ctrl + Enter runs your code (Cmd + Enter on a Mac). Press ? to see every shortcut.' },
  { id: 'tip-skeleton', page: 'lesson', at: '#use-skeleton', title: 'A smaller step',
    text: "After a few tries you get the answer's outline, with gaps to fill. Tap here to put it in the editor." },
  { id: 'tip-another', page: 'problem', at: '.another', title: 'See another way',
    text: "Open this to compare yours with the model answer. Lines yours didn't have are marked. Different isn't wrong." },
  { id: 'tip-csv', page: 'sandbox', at: '#load-csv', title: 'Your own data',
    text: 'Load CSV turns a spreadsheet saved as a CSV file into a table you can use here. The file never leaves your device.' },
  { id: 'tip-dax-rows', page: 'sandbox', at: '#dax-rows', title: 'Matrix rows',
    text: 'Pick a column to split your measures by, the way a Power BI matrix has rows.' },
  { id: 'tip-xl-sheet', page: 'sandbox', at: '#xl-sheet', title: 'Sheets',
    text: 'Pick the sheet your formula works on. Tick Fill down to copy it down the whole column, like dragging it in Excel.' },
];
for (const tip of TIPS) GUIDES[tip.id] = [tip];

/* What the latest build changed, as a tour of Home. Shown once to anyone
   who's been here before; a newcomer's first tour covers it all anyway.
   `covers`: tips it says the same as, marked seen along with it. */
export const WHATS_NEW = {
  covers: ['tip-sync'],
  // Each step's `v`: the build it came in. You see the ones newer than the last tour you saw.
  // Only functional changes get a step: something new you can do, or a change to how
  // the app works. Not looks, renames, animations or polish.
  steps: [
    { v: 167, at: '#topbar-title', title: 'Reload from the logo',
      text: 'Tap the QueryCafe logo here on Home to reload the whole app. On a phone, pulling down at the top works too.' },
    { v: 167, at: '.tab[data-route="tracks"]', title: 'Fuller lessons',
      text: "Every lesson explains its idea in a few more points, has a worked example to open with its real result, and sets out the task like a request at work." },
    { v: 136, at: '.tab[data-route="tracks"]', title: 'ETL and pipelines',
      text: 'A new course in Go further: carry a nightly export from raw text into a database safely, with checks, set-aside rows, safe reruns, updates, logs and retries.' },
    { v: 126, at: '.tab[data-route="tracks"]', title: 'Expected output in lessons',
      text: 'Every lesson has an Expected output fold under its task, like a practice question: tap it to see what the answer gives.' },
    { v: 122, at: '.tab[data-route="you"]', title: 'Colour themes',
      text: "You → Settings → Display has colour themes, each a pair like the Hyde Special: one colour by day, another at night. Caramel Macchiato, Espresso Tonic, Rose Latte, London Fog and High contrast." },
    { v: 121, at: '.tab[data-route="home"]', title: 'Practice questions in Refills',
      text: 'Solved practice questions come back as Refills now, a week later, then three weeks, then two months, to solve again from the start. One a day at most.' },
    { v: 121, at: '.tab[data-route="practice"]', title: 'Search, tags and interviews',
      text: "Practice has a search box, and a question's tags lead to every question with that tag. The Interview set asks which job first, with Excel and R among the choices." },
    { v: 121, at: '.tab[data-route="play"]', title: 'Step through a formula',
      text: 'After an Excel formula runs, open Step through it, under the result, to watch Excel work it out from the inside, one piece at a time.' },
    { v: 120, at: '.tab[data-route="tracks"]', title: 'Find a lesson',
      text: 'Courses has a search box: type a word like VLOOKUP, groupby or join to find every lesson that teaches it.' },
    { v: 120, at: '.tab[data-route="practice"]', title: 'The whole list, and Excel ranges',
      text: 'In a lesson or a practice question, tap its number (Lesson 3 of 20) for the whole list, to jump to any of them. Above an Excel sheet, tap a range like D2:D121 to put it in your formula.' },
    { v: 118, at: '.tab[data-route="tracks"]', title: 'Getting about',
      text: 'Lessons and practice questions have arrows by their number, and links at the end, to the one before or after. The line above the title goes back to the course and its part, or to Practice and the difficulty.' },
    { v: 111, at: '.tab[data-route="play"]', title: 'R in the Sandbox',
      text: 'The Sandbox has an R mode now: the same datasets, dplyr loaded, and your variables kept between runs.' },
    { v: 110, at: '.tab[data-route="practice"]', title: 'R practice',
      text: 'Practice has an R tab: 16 problems where you write solution <- function(df), judged on hidden tables like the Python ones.' },
    { v: 109, at: '.tab[data-route="tracks"]', title: 'R for data analysis',
      text: 'A new course, last on Courses: the pandas questions again, in R with dplyr, on the same café data. R downloads the first time you open one of its lessons.' },
    { v: 99, at: '.tab[data-route="you"]', title: 'Sync across devices',
      text: 'Learning on a phone and a computer? Open You, then Settings, then Sync across devices. You type a code on the other device. No email, no account.' },
    { v: 99, at: '#topbar-title', title: 'Tips as you go',
      text: 'Short tips now point things out the first time you meet them, like Refills and Load CSV. You, then Settings, then How this works shows every guide again.' },
  ],
};
WHATS_NEW.version = Math.max(...WHATS_NEW.steps.map((s) => s.v));
GUIDES.whatsnew = WHATS_NEW.steps;

// The build a guide was last rewritten in: anyone who saw an older one sees it again.
// Whenever a build changes something a guide or tip describes, rewrite that guide in
// the same build and set its entry here to that build's number.
const REWRITTEN = {
  whatsnew: WHATS_NEW.version,
  tracks: 167, lesson: 167, practice: 167, problem: 167, you: 167, settings: 167,
};
// Guides that count as seen along with another: Home's tour covers What's new.
const ALSO = { home: ['whatsnew', ...WHATS_NEW.covers], whatsnew: WHATS_NEW.covers };
const seen = (page) => store.seenGuide(page, REWRITTEN[page] || 0);

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

export function startGuide(page = 'home', label = '') {
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
    store.markGuide(page, ...(ALSO[page] || []));
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
    const count = [label && escapeHTML(label), steps.length > 1 && `${at + 1} of ${steps.length}`].filter(Boolean).join(' &middot; ');
    card.innerHTML = `
      ${count ? `<p class="guide-count">${count}</p>` : ''}
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
  const here = location.hash;
  const soon = (p, label) => setTimeout(() => { if (location.hash === here) startGuide(p, label); }, 450);
  const { welcomed } = store.state;
  if (page === 'home') {
    // A newcomer's tour of Home covers everything new (ALSO marks What's new seen with it).
    if (welcomed && !seen('home')) { soon('home'); return; }
    // What's new: for anyone who's been here before, welcomed or from before the welcome.
    if (known() && !seen('whatsnew')) {
      // Only the steps newer than the tour you last saw: all of them if you never
      // saw one, or asked for the guides again since. None left, and tips carry on.
      const st = store.state;
      const last = (st.guides.whatsnew || 0) > (st.guidesFrom || 0) ? (st.guideVer || {}).whatsnew || 0 : 0;
      GUIDES.whatsnew = WHATS_NEW.steps.filter((s) => s.v > last);
      if (GUIDES.whatsnew.length) { soon('whatsnew', "What's new"); return; }
    }
  } else if (welcomed && GUIDES[page] && !seen(page)) {
    soon(page);
    return;
  }
  tipIfDue(page);
}

const known = () => store.state.welcomed || Object.keys(store.state.done).length > 0;

/** The first tip for this screen that hasn't been seen and is showing now. */
export function tipIfDue(page) {
  if (open || !known() || (GUIDES[page] && store.state.welcomed && !seen(page))) return;
  const tip = TIPS.find((t) => t.page === page && !seen(t.id) && (!t.when || t.when()) && find(t.at));
  if (!tip) return;
  const here = location.hash;
  setTimeout(() => { if (location.hash === here) startGuide(tip.id, 'Tip'); }, 450);
}

/** Someone bringing their progress over has seen it all before. */
export const skipGuides = () => store.markGuide(...GUIDE_PAGES);
