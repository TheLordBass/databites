/* Progress, XP and streak — all local, nothing leaves the device. */

const KEY = 'databites.v1';

// The learner's own calendar day. toISOString() would be UTC: an evening
// lesson in the Americas landed on tomorrow and could break the streak.
const dayOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dayOf(new Date());
const addDays = (day, n) => {
  const [y, m, d] = day.split('-').map(Number);
  return dayOf(new Date(y, m - 1, d + n));
};

/* Spaced recall: a finished lesson comes back 2, then 7, then 21 days later,
   as its task alone. Three a day at most, so a backlog never becomes a wall. */
const REVIEW_GAPS = [2, 7, 21];
const REVIEWS_A_DAY = 3;

const daysBetween = (a, b) =>
  Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);

const blank = () => ({
  done: {},          // lessonId -> ISO date completed
  drafts: {},        // lessonId -> last code typed
  flags: {},         // practice id -> { revealed } — for the clean-solve mark
  reviews: {},       // lessonId -> { step, due } — due null once it has graduated
  reviewDay: null,
  reviewsToday: 0,
  xp: 0,
  streak: 0,
  best: 0,
  lastDay: null,
  visited: false,
});

function load() {
  try {
    return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return blank();
  }
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
}

/* Progress lives in this browser only. Ask the browser not to clear it when
   storage runs low, or after a long gap away. Most browsers decide quietly,
   granting it once someone is clearly using the app, so ask on a first finish. */
export async function keepSafe() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return false;
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}

export async function isKeptSafe() {
  try {
    return Boolean(navigator.storage && navigator.storage.persisted && (await navigator.storage.persisted()));
  } catch {
    return false;
  }
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const later = (a, b) => (!a ? b : !b ? a : a > b ? a : b);

/* A streak you can't lose by opening the app late: it only ever
   updates when you finish something, and one skipped day forgives. */
function touchStreak() {
  const day = today();
  if (state.lastDay === day) return { changed: false };

  const gap = state.lastDay ? daysBetween(state.lastDay, day) : null;
  // 1 is yesterday; 2 is one day skipped, which is forgiven
  state.streak = gap === null || (gap >= 1 && gap <= 2) ? state.streak + 1 : 1;
  state.lastDay = day;
  state.best = Math.max(state.best, state.streak);
  return { changed: true };
}

export const store = {
  get state() { return state; },

  isDone: (id) => Boolean(state.done[id]),

  /** Marks a lesson complete. Returns {xp, streak, isFirst} for the celebration. */
  complete(id, xp = 20) {
    const isFirst = !state.done[id];
    const gained = isFirst ? xp : Math.round(xp * 0.25); // replays still count, less
    state.done[id] = today();
    state.xp += gained;
    const { changed } = touchStreak();
    save();
    if (isFirst) keepSafe();
    return { xp: gained, streak: state.streak, streakUp: changed, isFirst };
  },

  /** Everything, as the text of a backup file. */
  exportText() {
    return JSON.stringify({ app: 'databites', version: 1, saved: new Date().toISOString(), state }, null, 1);
  },

  /** Merges a backup file into this device's progress. It only ever adds:
      finished items are unioned, XP and best streak take the higher, and a
      draft here is never overwritten. Returns how many finished items it
      added; throws an Error worded for the learner. */
  importText(text) {
    let data = null;
    try { data = JSON.parse(text); } catch { /* reported below */ }
    const incoming = data && data.app === 'databites' && data.state;
    if (!incoming || typeof incoming.done !== 'object' || incoming.done === null) {
      throw new Error("That isn't a DataBites progress file.");
    }
    const before = Object.keys(state.done).length;
    for (const [id, day] of Object.entries(incoming.done)) {
      if (typeof day === 'string' && DAY.test(day)) state.done[id] = later(state.done[id], day);
    }
    for (const [id, code] of Object.entries(incoming.drafts || {})) {
      if (typeof code === 'string' && !(id in state.drafts)) state.drafts[id] = code;
    }
    for (const [id, flag] of Object.entries(incoming.flags || {})) {
      if (flag && flag.revealed) state.flags[id] = { ...(state.flags[id] || {}), revealed: true };
    }
    state.xp = Math.max(state.xp, Number(incoming.xp) || 0);
    state.best = Math.max(state.best, Number(incoming.best) || 0);
    if (typeof incoming.lastDay === 'string' && DAY.test(incoming.lastDay)) {
      if (!state.lastDay || incoming.lastDay > state.lastDay) {
        state.lastDay = incoming.lastDay;
        state.streak = Number(incoming.streak) || 0;
      } else if (incoming.lastDay === state.lastDay) {
        state.streak = Math.max(state.streak, Number(incoming.streak) || 0);
      }
    }
    for (const [id, r] of Object.entries(incoming.reviews || {})) {
      if (r && typeof r.step === 'number' && !(id in state.reviews)) {
        state.reviews[id] = { step: r.step, due: typeof r.due === 'string' && DAY.test(r.due) ? r.due : null };
      }
    }
    state.visited = true;
    save();
    return Object.keys(state.done).length - before;
  },

  draft: (id) => state.drafts[id],
  saveDraft(id, code) {
    state.drafts[id] = code;
    save();
  },
  clearDraft(id) {
    delete state.drafts[id];
    save();
  },

  /** Practice: the learner opened the solution. Solving still counts —
      it just isn't marked as a clean solve. */
  markRevealed(id) {
    state.flags[id] = { ...(state.flags[id] || {}), revealed: true };
    save();
  },
  wasRevealed: (id) => Boolean(state.flags[id] && state.flags[id].revealed),

  /** Streak goes stale if you miss more than a day. One skipped day keeps
      it alive, the same forgiveness touchStreak gives. */
  liveStreak() {
    if (!state.lastDay) return 0;
    return daysBetween(state.lastDay, today()) <= 2 ? state.streak : 0;
  },

  /** A lesson finished for the first time: first recall in two days. */
  scheduleReview(id) {
    if (id in state.reviews) return;
    state.reviews[id] = { step: 0, due: addDays(today(), REVIEW_GAPS[0]) };
    save();
  },

  /** Lessons finished before recall existed join the queue from their finish date. */
  seedReviews(ids) {
    let added = false;
    for (const id of ids) {
      if (state.done[id] && !(id in state.reviews)) {
        state.reviews[id] = { step: 0, due: addDays(state.done[id], REVIEW_GAPS[0]) };
        added = true;
      }
    }
    if (added) save();
  },

  /** Today's recalls, oldest due first, minus any already done today. */
  dueReviews(ids) {
    const now = today();
    const left = state.reviewDay === now ? Math.max(0, REVIEWS_A_DAY - state.reviewsToday) : REVIEWS_A_DAY;
    const due = (id) => state.reviews[id] && state.reviews[id].due;
    return ids
      .filter((id) => due(id) && due(id) <= now)
      .sort((a, b) => (due(a) < due(b) ? -1 : due(a) > due(b) ? 1 : 0))
      .slice(0, left);
  },

  /** Remembered: push it further out, or retire it after the last gap. */
  reviewed(id) {
    const step = ((state.reviews[id] && state.reviews[id].step) || 0) + 1;
    state.reviews[id] = { step, due: step < REVIEW_GAPS.length ? addDays(today(), REVIEW_GAPS[step]) : null };
    const now = today();
    state.reviewsToday = state.reviewDay === now ? state.reviewsToday + 1 : 1;
    state.reviewDay = now;
    save();
  },

  markVisited() {
    state.visited = true;
    save();
  },

  reset() {
    state = blank();
    save();
  },
};

/* XP → level, with gently widening bands. */
export function levelInfo(xp) {
  let level = 1;
  let need = 100;
  let spent = 0;
  while (xp - spent >= need) {
    spent += need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  return { level, into: xp - spent, need, pct: (xp - spent) / need };
}
