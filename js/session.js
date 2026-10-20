/* "Just 5 minutes": a few steps picked for today — a recall, the next lesson,
   one practice problem — walked one after another, so there's nothing to
   decide. The steps live in the store as routes. Finishing hands you a
   receipt for them. */

import { store } from './store.js';
import { escapeHTML } from './ui.js';
import { receipt } from './cafe.js';
import { lessonById } from './curriculum/index.js';
import { PROBLEMS, problemTitle } from './practice/problems.js';

/** The session, if route is the step it's on right now. */
export function sessionHere(route) {
  const s = store.currentSession();
  return s && s.steps[s.at] === route ? s : null;
}

export function sessionBar(s) {
  return `<div class="session-bar">
    <span class="label">Just 5 minutes &middot; step ${s.at + 1} of ${s.steps.length}</span>
    <button class="btn-text" id="session-skip">Skip this step</button>
  </div>`;
}

export const lastStep = (s) => s.at + 1 >= s.steps.length;

/** Move the session on from route. False when route isn't the current step,
    so the screen carries on as it normally would. */
export function nextInSession(ctx, route) {
  const session = store.currentSession();
  const next = store.advanceSession(route);
  if (next === undefined) return false;
  if (next === null) {
    ctx.go('home');
    setTimeout(() => showReceipt(session), 60);
  } else {
    ctx.go(next);
  }
  return true;
}

/* What each step was, and whether it got done today (the log has it) or skipped. */
function stepLine(route, doneToday) {
  const [kind, id, mode] = route.split('/');
  const lesson = kind === 'lesson' ? lessonById(id) : null;
  const problem = kind === 'problem' ? PROBLEMS.find((p) => p.id === id) : null;
  const name = lesson ? lesson.title : problem ? problemTitle(problem) : route;
  const what = mode === 'review' ? 'Refill' : lesson ? 'Lesson' : 'Problem';
  const done = doneToday.has(id);
  return { qty: done ? 1 : 0, name, end: done ? what : 'skipped', done };
}

let dialog = null;

function showReceipt(session) {
  if (!session) return;
  const day = session.day;
  const doneToday = new Set(store.state.log.filter(([d]) => d === day).map(([, id]) => id));
  const items = session.steps.map((route) => stepLine(route, doneToday));
  const done = items.filter((it) => it.done).length;
  const xp = store.state.xp - (session.xp0 ?? store.state.xp);
  const streak = store.liveStreak();
  const when = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'keys receipt-dialog';
    dialog.setAttribute('aria-labelledby', 'receipt-title');
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.closest('[data-close]')) close();
    });
    document.body.append(dialog);
  }
  dialog.innerHTML = `
    <h2 id="receipt-title">5 minutes, done</h2>
    ${receipt({
      title: 'Just 5 minutes', when, items,
      totals: [
        ['Done', `${done} of ${items.length}`],
        ['Points', xp > 0 ? `+${xp}` : '0'],
        ['Streak', `${streak} day${streak === 1 ? '' : 's'}`],
      ],
    })}
    <button class="btn btn-primary btn-block" type="button" data-close>${escapeHTML(done ? "That's today" : 'Close')}</button>`;
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  dialog.querySelector('[data-close]').focus();
}

function close() {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}
