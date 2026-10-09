/* Progress, XP and streak — all local, nothing leaves the device. */

// The app's old name (it was DataBites). The databites.* keys, the backup
// file's app id and the cache names keep it, so nobody's progress is lost.
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
const TROUBLE = 3;                       // failed runs that make something a trouble spot

export const INTERVIEW_MS = 20 * 60 * 1000;

const daysBetween = (a, b) =>
  Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);

const blank = () => ({
  done: {},          // lessonId -> ISO date completed
  drafts: {},        // lessonId -> last code typed
  flags: {},         // practice id -> { revealed } — for the clean-solve mark
  reviews: {},       // lessonId -> { step, due } — due null once it has graduated
  reviewDay: null,
  reviewsToday: 0,
  misses: {},        // lesson or problem id -> failed runs; three or more is a trouble spot
  session: null,     // "Just 5 minutes": { day, steps: [route], at }
  interview: null,   // interview set: { started, ids, solved: { id: ms from start } }
  work: {},          // project lesson id -> { text, image } from its last passing run, for write-ups
  log: [],           // [day, id] for every finish, newest last — the weekly recap
  testOut: null,     // testing out of a part: { track, part, steps, all, at }
  offlineReady: null, // the day every optional engine was downloaded
  exam: null,        // PL-300 prep: { answers: { qid: { right, n, day } }, set, mocks: [] } — see examState()
  // The game layer (js/game.js):
  quest: null,       // today's quest: { day, offer: [ids], picked, of, base, done }
  counts: null,      // today's finishes by kind: { day, lessons, problems, hardish, recalls, clean, exam }
  run: { count: 0, best: 0 },   // first-try passes in a row
  spares: 1,         // spare days: each covers one missed day of the streak. Up to 2.
  spareDay: null,    // the day a big day last earned one
  achievements: {},  // achievement id -> day unlocked
  achievementsSeeded: false,    // earned before achievements existed: unlocked quietly, once
  bosses: {},        // stage index -> day beaten
  stats: { quests: 0, recalls: 0, testedOut: 0 },
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

// The activity log started later than progress did: seed it once from finish dates.
if (!state.log.length && Object.keys(state.done).length) {
  state.log = Object.entries(state.done).map(([id, day]) => [day, id]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

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

/* A streak you can't lose by opening the app late: it only ever updates
   when you finish something. Missed days are covered by spare days, which
   you can see (on You) and earn (a big day); there used to be a hidden
   one-day forgiveness instead, so everyone starts with one spare. */
const MAX_SPARES = 2;

function touchStreak() {
  const day = today();
  if (state.lastDay === day) return { changed: false, usedSpares: 0 };

  const gap = state.lastDay ? daysBetween(state.lastDay, day) : null;
  const missed = gap === null ? 0 : gap - 1;
  let usedSpares = 0;
  if (gap === null || gap === 1) state.streak += 1;          // first ever, or yesterday
  else if (missed >= 1 && missed <= state.spares) {          // missed days, all covered
    usedSpares = missed;
    state.spares -= missed;
    state.streak += 1;
  } else state.streak = 1;
  state.lastDay = day;
  state.best = Math.max(state.best, state.streak);
  return { changed: true, usedSpares };
}

export const store = {
  get state() { return state; },

  isDone: (id) => Boolean(state.done[id]),

  /** Marks a lesson complete. Returns {xp, streak, isFirst} for the celebration. */
  complete(id, xp = 20) {
    const isFirst = !state.done[id];
    const gained = isFirst ? xp : Math.round(xp * 0.25); // replays still count, less
    state.done[id] = today();
    state.log.push([today(), id]);
    if (state.log.length > 1000) state.log = state.log.slice(-1000);
    state.xp += gained;
    const { changed, usedSpares } = touchStreak();
    save();
    if (isFirst) keepSafe();
    return { xp: gained, streak: state.streak, streakUp: changed, isFirst, usedSpares };
  },

  /** Bonus XP from the game layer: no streak, no log entry. */
  addXp(n) {
    state.xp += n;
    save();
  },

  /* Today's finishes, by kind (lessons, problems, hardish, recalls, clean, exam):
     what daily quests and big days are measured in. A new day starts at zero. */
  countToday(kind, n = 1) {
    const day = today();
    if (!state.counts || state.counts.day !== day) state.counts = { day };
    state.counts[kind] = (state.counts[kind] || 0) + n;
    save();
  },
  todayCounts: () => (state.counts && state.counts.day === today() ? state.counts : { day: today() }),

  /** A big day earns a spare day: once a day, up to MAX_SPARES. True if it did. */
  earnSpare() {
    if (state.spareDay === today() || state.spares >= MAX_SPARES) return false;
    state.spares += 1;
    state.spareDay = today();
    save();
    return true;
  },
  maxSpares: MAX_SPARES,

  /** First-try passes in a row: a clean pass adds one, anything else starts again. */
  extendRun() {
    state.run = { count: state.run.count + 1, best: Math.max(state.run.best, state.run.count + 1) };
    save();
    return state.run.count;
  },
  breakRun() {
    if (!state.run.count) return;
    state.run = { ...state.run, count: 0 };
    save();
  },

  /* Today's quest, as the game layer builds it. */
  setQuest(quest) {
    state.quest = quest;
    save();
  },

  unlock(id, day = today()) {
    if (state.achievements[id]) return false;
    state.achievements[id] = day;
    save();
    return true;
  },
  markAchievementsSeeded() {
    state.achievementsSeeded = true;
    save();
  },

  bump(stat) {
    state.stats = { ...state.stats, [stat]: (state.stats[stat] || 0) + 1 };
    save();
  },

  /* A stage boss: its lessons, cold, one after another. It rides on the test-out
     machinery (state.testOut, route lesson/<id>/test) with kind 'boss', but
     marks nothing done: beating it is the reward. */
  startBoss(stage, steps) {
    state.testOut = { kind: 'boss', stage, steps, all: [], at: 0 };
    save();
  },
  beatBoss(stage) {
    if (!state.bosses[stage]) state.bosses[stage] = today();
    state.testOut = null;
    save();
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
      throw new Error("That isn't a QueryCafe progress file.");
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
    if (Array.isArray(incoming.log)) {
      const seen = new Set(state.log.map(([day, id]) => `${day} ${id}`));
      incoming.log.forEach((entry) => {
        if (!Array.isArray(entry) || !DAY.test(entry[0]) || typeof entry[1] !== 'string') return;
        if (!seen.has(`${entry[0]} ${entry[1]}`)) state.log.push([entry[0], entry[1]]);
      });
      state.log.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      if (state.log.length > 1000) state.log = state.log.slice(-1000);
    }
    const exam = incoming.exam && typeof incoming.exam === 'object' ? incoming.exam : null;
    if (exam && exam.answers && typeof exam.answers === 'object') {
      const ex = store.examState();
      for (const [id, a] of Object.entries(exam.answers)) {
        const mine = ex.answers[id];
        if (a && typeof a.day === 'string' && DAY.test(a.day) && (!mine || a.day > mine.day)) {
          ex.answers[id] = { right: Boolean(a.right), n: Number(a.n) || 1, day: a.day };
        }
      }
      if (Array.isArray(exam.mocks) && !ex.mocks.length) ex.mocks = exam.mocks.slice(-10);
    }
    for (const [id, r] of Object.entries(incoming.reviews || {})) {
      if (r && typeof r.step === 'number' && !(id in state.reviews)) {
        state.reviews[id] = { step: r.step, due: typeof r.due === 'string' && DAY.test(r.due) ? r.due : null };
      }
    }
    // The game layer only ever adds up: earliest unlock wins, higher counts win.
    for (const [key, field] of [['achievements', 'achievements'], ['bosses', 'bosses']]) {
      for (const [id, day] of Object.entries(incoming[field] || {})) {
        if (typeof day === 'string' && DAY.test(day) && (!state[key][id] || day < state[key][id])) state[key][id] = day;
      }
    }
    if (incoming.run && Number(incoming.run.best) > state.run.best) state.run = { ...state.run, best: Number(incoming.run.best) };
    if (incoming.stats && typeof incoming.stats === 'object') {
      const merged = { ...state.stats };
      ['quests', 'recalls', 'testedOut'].forEach((k) => { merged[k] = Math.max(merged[k] || 0, Number(incoming.stats[k]) || 0); });
      state.stats = merged;
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

  /** Streak goes stale once the missed days outnumber your spare days. Until
      then it's still alive: the next finish spends the spares to keep it. */
  liveStreak() {
    if (!state.lastDay) return 0;
    return daysBetween(state.lastDay, today()) - 1 <= state.spares ? state.streak : 0;
  },

  /** A lesson finished for the first time: first recall in two days. */
  scheduleReview(id) {
    if (id in state.reviews) return;
    // A lesson that took a lot of tries comes back sooner: tomorrow.
    const gap = (state.misses[id] || 0) >= TROUBLE ? 1 : REVIEW_GAPS[0];
    state.reviews[id] = { step: 0, due: addDays(today(), gap) };
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
    const trouble = (id) => ((state.misses[id] || 0) >= TROUBLE ? 0 : 1);   // trouble spots first
    return ids
      .filter((id) => due(id) && due(id) <= now)
      .sort((a, b) => trouble(a) - trouble(b) || (due(a) < due(b) ? -1 : due(a) > due(b) ? 1 : 0))
      .slice(0, left);
  },

  /** Remembered: push it further out, or retire it after the last gap. A
      clean recall also clears it as a trouble spot. */
  reviewed(id) {
    const step = ((state.reviews[id] && state.reviews[id].step) || 0) + 1;
    delete state.misses[id];
    state.stats = { ...state.stats, recalls: (state.stats.recalls || 0) + 1 };
    state.reviews[id] = { step, due: step < REVIEW_GAPS.length ? addDays(today(), REVIEW_GAPS[step]) : null };
    const now = today();
    state.reviewsToday = state.reviewDay === now ? state.reviewsToday + 1 : 1;
    state.reviewDay = now;
    save();
  },

  /** Got there, but only after opening the answer: same step, back tomorrow. */
  retryReview(id) {
    const step = (state.reviews[id] && state.reviews[id].step) || 0;
    state.reviews[id] = { step, due: addDays(today(), 1) };
    const now = today();
    state.reviewsToday = state.reviewDay === now ? state.reviewsToday + 1 : 1;
    state.reviewDay = now;
    save();
  },

  /** [day, id] finishes over the last `days` days, today included. */
  recentLog(days = 7) {
    const from = addDays(today(), -(days - 1));
    return state.log.filter(([day]) => day >= from);
  },

  /* Test out of a part: its hardest lessons, cold. Pass them all and the
     whole part counts as done. XP only for the ones actually solved. */
  startTestOut(track, part, steps, all) {
    state.testOut = { track, part, steps, all, at: 0 };
    save();
  },

  currentTestOut: () => state.testOut,

  /** The next step's id, null after the last, undefined if id isn't the current step. */
  advanceTestOut(id) {
    const t = state.testOut;
    if (!t || t.steps[t.at] !== id) return undefined;
    t.at += 1;
    save();
    return t.at < t.steps.length ? t.steps[t.at] : null;
  },

  cancelTestOut() {
    if (!state.testOut) return;
    state.testOut = null;
    save();
  },

  markTestedOut(ids) {
    const day = today();
    ids.forEach((id) => {
      if (state.done[id]) return;
      state.done[id] = day;
      state.log.push([day, id]);
    });
    state.testOut = null;
    state.stats = { ...state.stats, testedOut: (state.stats.testedOut || 0) + 1 };
    save();
  },

  /* PL-300 prep. answers keeps each question's latest result; set is the
     question set in progress (practice or mock), so leaving mid-way loses
     nothing; mocks keeps the last ten mock results. */
  examState() {
    if (!state.exam) state.exam = { answers: {}, set: null, mocks: [] };
    return state.exam;
  },

  examAnswer(id, right) {
    const ex = store.examState();
    const was = ex.answers[id];
    ex.answers[id] = { right: Boolean(right), n: ((was && was.n) || 0) + 1, day: today() };
    save();
  },

  startExamSet(set) {
    store.examState().set = { ...set, started: Date.now(), at: 0, picks: {}, checked: {} };
    save();
  },

  /** Saves the set after the screen changed it (picks, checked, at). */
  saveExamSet() {
    save();
  },

  /** A finished mock goes on record straight away; the set stays open for review. */
  recordMock(result) {
    const ex = store.examState();
    ex.mocks.push({ day: today(), ...result });
    if (ex.mocks.length > 10) ex.mocks = ex.mocks.slice(-10);
    save();
  },

  endExamSet() {
    store.examState().set = null;
    save();
  },

  markOfflineReady() {
    state.offlineReady = today();
    save();
  },

  /** A project step that passed: what it printed and its chart, for the write-up. */
  saveWork(id, { text = '', image = null } = {}) {
    // Browser storage is about 5 MB for everything. A huge chart would make
    // every later save fail - progress included - so an oversized one is left out.
    const fits = typeof image === 'string' && image.length <= 400000;
    state.work[id] = { text: String(text).slice(0, 4000), image: fits ? image : null };
    save();
  },

  work: (id) => state.work[id] || null,

  /** A failed run (lesson) or a failed submit (practice). */
  miss(id) {
    state.misses[id] = (state.misses[id] || 0) + 1;
    save();
  },

  /** A problem solved without opening its solution stops being a trouble spot. */
  clearMisses(id) {
    if (!(id in state.misses)) return;
    delete state.misses[id];
    save();
  },

  /** [id, failed runs] for everything tried three or more times, worst first. */
  troubleSpots() {
    return Object.entries(state.misses).filter(([, n]) => n >= TROUBLE).sort((a, b) => b[1] - a[1]);
  },

  /* "Just 5 minutes": a few steps chosen for today, walked in order. */
  startSession(steps) {
    state.session = { day: today(), steps, at: 0 };
    save();
  },

  currentSession() {
    const s = state.session;
    return s && s.day === today() && s.at < s.steps.length ? s : null;
  },

  sessionDoneToday: () => Boolean(state.session && state.session.day === today() && state.session.at >= state.session.steps.length),

  /** After finishing (or skipping) route: the next step's route, null when that
      was the last one, or undefined when route isn't the current step at all. */
  advanceSession(route) {
    const s = store.currentSession();
    if (!s || s.steps[s.at] !== route) return undefined;
    s.at += 1;
    save();
    return s.at < s.steps.length ? s.steps[s.at] : null;
  },

  /* Interview set: three problems against a 20-minute clock. */
  startInterview(ids) {
    state.interview = { started: Date.now(), ids, solved: {} };
    save();
  },

  currentInterview: () => state.interview,

  /** Stop the clock early; what was solved stands. */
  stopInterview() {
    if (!state.interview || state.interview.ended) return;
    state.interview.ended = Date.now();
    save();
  },

  interviewSolved(id) {
    const iv = state.interview;
    if (!iv || iv.ended || !iv.ids.includes(id) || iv.solved[id] !== undefined) return;
    const took = Date.now() - iv.started;
    if (took > INTERVIEW_MS) return;
    iv.solved[id] = took;
    save();
  },

  endInterview() {
    state.interview = null;
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
