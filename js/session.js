/* "Just 5 minutes": a few steps picked for today — a recall, the next lesson,
   one practice problem — walked one after another, so there's nothing to
   decide. The steps live in the store as routes. */

import { store } from './store.js';
import { toast } from './ui.js';

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
  const next = store.advanceSession(route);
  if (next === undefined) return false;
  if (next === null) {
    toast("5 minutes, done. That's today.");
    ctx.go('home');
  } else {
    ctx.go(next);
  }
  return true;
}
