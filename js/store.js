/* Progress, XP and streak — all local, nothing leaves the device. */

const KEY = 'databites.v1';

const today = () => new Date().toISOString().slice(0, 10);

const daysBetween = (a, b) =>
  Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);

const blank = () => ({
  done: {},          // lessonId -> ISO date completed
  drafts: {},        // lessonId -> last code typed
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

/* A streak you can't lose by opening the app late: it only ever
   updates when you finish something, and one skipped day forgives. */
function touchStreak() {
  const day = today();
  if (state.lastDay === day) return { changed: false };

  const gap = state.lastDay ? daysBetween(state.lastDay, day) : null;
  state.streak = gap === 1 || gap === null ? state.streak + 1 : 1;
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
    return { xp: gained, streak: state.streak, streakUp: changed, isFirst };
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

  /** Streak goes stale if you miss more than a day. */
  liveStreak() {
    if (!state.lastDay) return 0;
    return daysBetween(state.lastDay, today()) <= 1 ? state.streak : 0;
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
