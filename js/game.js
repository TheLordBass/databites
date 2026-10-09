/* The game layer: what's there to keep you coming back. Borrowed from
   Boot.dev where it helps learning, and left out where it would be a slot
   machine: no loot chests, no gems, no shop, and no leaderboards (those
   need accounts, and ranking yourself against strangers puts beginners off).

   - Today's special: pick one of three goals a day; finish it for bonus XP.
     (Called a quest in the code and the store: the name on screen changed.)
   - First-try runs: new lessons and problems passed in a row with no failed
     run, no hint and no peek at the answer.
   - Spare days: a big day (three new things finished) earns one, up to two;
     each covers a missed day of the streak (the streak itself: store.js).
   - Ranks: a title for each band of levels.
   - Achievements: the full list, tied to real skills and milestones.
   - Stage bosses: the end of each stage of the learning path, cold.

   It all lives in the store, on this device. Screens call after() when
   something is finished and show the notes it hands back. */

import { store, levelInfo } from './store.js';
import { localDay, escapeHTML } from './ui.js';
import { ALL_LESSONS, TRACK_GROUPS, stepLessons } from './curriculum/index.js';
import { PROBLEMS } from './practice/problems.js';

const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const isDone = (id) => store.isDone(id);

/* ── Ranks ─────────────────────────────────────────── */

// Finishing every lesson lands around level 15.
const RANKS = [
  [1, 'Intern'], [3, 'Junior Analyst'], [5, 'Analyst'], [7, 'Senior Analyst'],
  [9, 'Lead Analyst'], [11, 'Principal Analyst'], [13, 'Head of Data'], [15, 'Chief Data Officer'],
];
export const rankOf = (level) => RANKS.filter(([from]) => level >= from).pop()[1];

/* ── Today's special (a quest, in the code) ─────────── */

// One quest of each level is offered a day; `kind` is the count it reads (store.countToday).
const QUESTS = [
  { id: 'lessons-2', level: 1, xp: 25, kind: 'lessons', of: 2, text: 'Finish 2 new lessons', go: 'next', when: (c) => c.openLessons >= 2 },
  { id: 'recalls', level: 1, xp: 25, kind: 'recalls', text: "Do today's recalls", go: 'recall', when: (c) => c.due > 0 },
  { id: 'exam-5', level: 1, xp: 25, kind: 'exam', of: 5, text: 'Answer 5 PL-300 practice questions', go: 'exam' },
  { id: 'lessons-3', level: 2, xp: 40, kind: 'lessons', of: 3, text: 'Finish 3 new lessons', go: 'next', when: (c) => c.openLessons >= 3 },
  { id: 'problem', level: 2, xp: 40, kind: 'problems', of: 1, text: 'Solve a new practice problem', go: 'practice', when: (c) => c.openProblems > 0 },
  { id: 'clean-3', level: 2, xp: 40, kind: 'clean', of: 3, text: 'Pass 3 new lessons on the first try', go: 'next', when: (c) => c.openLessons >= 3 },
  { id: 'lessons-5', level: 3, xp: 60, kind: 'lessons', of: 5, text: 'Finish 5 new lessons', go: 'next', when: (c) => c.openLessons >= 5 },
  { id: 'hardish', level: 3, xp: 60, kind: 'hardish', of: 1, text: 'Solve a new medium or hard problem', go: 'practice', when: (c) => c.openHardish > 0 },
  { id: 'clean-5', level: 3, xp: 60, kind: 'clean', of: 5, text: 'Pass 5 new lessons on the first try', go: 'next', when: (c) => c.openLessons >= 5 },
];
const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

function questContext() {
  const open = PROBLEMS.filter((p) => !isDone(p.id));
  return {
    due: store.dueReviews(ALL_LESSONS.map((l) => l.id)).length,
    openLessons: ALL_LESSONS.filter((l) => !isDone(l.id)).length,
    openProblems: open.length,
    openHardish: open.filter((p) => p.difficulty !== 'easy').length,
  };
}

const questText = (quest, of) => (quest.kind === 'recalls'
  ? `Do today's ${of} recall${of === 1 ? '' : 's'}` : quest.text);

/* Most quests count from the moment they're picked. Recalls count for the
   whole day: the recall quest means all of today's, however many were done
   before it was picked (so picking it afterwards finishes it on the spot). */
const recallTarget = (c) => Math.max(1, (store.todayCounts().recalls || 0) + c.due);

/** Today's quest: offered (three to pick from), picked, or done. Builds a new offer each day. */
export function todaysQuest() {
  const day = localDay();
  const c = questContext();
  let q = store.state.quest;
  if (!q || q.day !== day) {
    const offer = [1, 2, 3].map((level) => {
      const fits = QUESTS.filter((t) => t.level === level && (!t.when || t.when(c)));
      return fits.length ? fits[hash(day + level) % fits.length].id : null;
    }).filter(Boolean);
    q = { day, offer, picked: null, of: 0, base: 0, done: false };
    store.setQuest(q);
  }
  const quest = q.picked ? QUEST_BY_ID[q.picked] : null;
  const n = quest ? Math.min(q.of, (store.todayCounts()[quest.kind] || 0) - q.base) : 0;
  return {
    offers: q.offer.map((id) => QUEST_BY_ID[id]).filter(Boolean)
      .map((t) => ({ ...t, label: questText(t, recallTarget(c)) })),
    quest: quest && { ...quest, label: questText(quest, q.of) },
    n,
    of: q.of,
    done: q.done,
  };
}

/** Pick one of today's offers. Once picked it's today's quest: no swapping.
    Returns notes, for a quest that's already met (the recalls, done earlier). */
export function pickQuest(id) {
  const q = store.state.quest;
  const quest = QUEST_BY_ID[id];
  if (!q || q.day !== localDay() || q.picked || !q.offer.includes(id) || !quest) return [];
  const recalls = quest.kind === 'recalls';
  store.setQuest({
    ...q, picked: id,
    of: recalls ? recallTarget(questContext()) : quest.of,
    base: recalls ? 0 : store.todayCounts()[quest.kind] || 0,
  });
  const notes = [];
  checkQuest(notes);
  checkAchievements().forEach((a) => notes.push({ text: `Achievement: ${a.name}` }));
  return notes;
}

function checkQuest(notes) {
  const q = store.state.quest;
  if (!q || q.day !== localDay() || !q.picked || q.done) return;
  const quest = QUEST_BY_ID[q.picked];
  if ((store.todayCounts()[quest.kind] || 0) - q.base < q.of) return;
  store.setQuest({ ...q, done: true });
  store.addXp(quest.xp);
  store.bump('quests');
  notes.push({ text: `Today's special, done: ${questText(quest, q.of)}. +${quest.xp} XP`, big: true });
}

/* ── Stage bosses ──────────────────────────────────── */

export const BOSS_XP = 100;

const stageLessons = (stage) => TRACK_GROUPS[stage].steps.flatMap(stepLessons);
export const stageDone = (stage) => stageLessons(stage).every((l) => isDone(l.id));

/* A stage's boss: the lessons that end each of its steps, which lean on
   everything before them. A stage of one or two steps is topped up with the
   lessons that end the parts before (five lessons back), to make at least
   three; never more than four. Taken in path order. */
export function bossSteps(stage) {
  const steps = TRACK_GROUPS[stage].steps.map(stepLessons);
  const picks = [];
  for (let back = 0; picks.length < 3 && back < 4; back += 1) {
    steps.forEach((list, s) => {
      const i = list.length - 1 - back * 5;
      if (i >= 0 && picks.length < 4) picks.push({ s, i, id: list[i].id });
    });
  }
  return picks.sort((a, b) => a.s - b.s || a.i - b.i).map((p) => p.id);
}

export function startBoss(ctx, stage) {
  const steps = bossSteps(stage);
  store.startBoss(stage, steps);
  ctx.go(`lesson/${steps[0]}/test`);
}

export const bossBeaten = (stage) => store.state.bosses[stage] || null;

/* ── Achievements ──────────────────────────────────── */

const solved = () => PROBLEMS.filter((p) => isDone(p.id));
const lessonGoal = (id, title, track) => ({
  how: `Finish "${title}" in ${track}`, test: () => isDone(id),
});

export const ACHIEVEMENTS = [
  { id: 'first-lesson', name: 'First steps', how: 'Finish your first lesson', test: () => ALL_LESSONS.some((l) => isDone(l.id)) },
  { id: 'first-chart', name: 'First chart', ...lessonGoal('mp-01', 'Your first chart', 'matplotlib') },
  { id: 'first-join', name: 'First join', ...lessonGoal('sq-12', 'Join two tables', 'SQL') },
  { id: 'first-calculate', name: 'First CALCULATE', ...lessonGoal('dx-06', 'CALCULATE changes the filter', 'DAX') },
  { id: 'first-regex', name: 'Pattern finder', ...lessonGoal('py-56', 'Finding patterns: re.findall', 'the Python course') },
  { id: 'first-test', name: 'Test writer', ...lessonGoal('py-73', 'Tests that catch bugs', 'the Python course') },
  { id: 'first-model', name: 'First model', ...lessonGoal('ai-01', 'Learning from examples', 'AI with Python') },
  ...TRACK_GROUPS.map((g, i) => ({
    id: `stage-${i + 1}`, name: `Stage ${i + 1}: ${g.name}`, how: `Finish every lesson in "${g.name}"`, test: () => stageDone(i),
  })),
  { id: 'boss-1', name: 'First boss', how: 'Beat a stage boss', test: () => Object.keys(store.state.bosses).length >= 1 },
  { id: 'boss-all', name: 'Every boss', how: `Beat all ${TRACK_GROUPS.length} stage bosses`, test: () => Object.keys(store.state.bosses).length >= TRACK_GROUPS.length },
  { id: 'problem-1', name: 'First solve', how: 'Solve a practice problem', test: () => solved().length >= 1 },
  { id: 'problems-25', name: 'Twenty-five solved', how: 'Solve 25 practice problems', test: () => solved().length >= 25 },
  { id: 'clean-hard', name: 'Clean hard solve', how: 'Solve a hard problem without opening its solution', test: () => solved().some((p) => p.difficulty === 'hard' && !store.wasRevealed(p.id)) },
  { id: 'algorithms', name: 'Algorithm hunter', how: 'Solve every algorithm problem', test: () => PROBLEMS.filter((p) => p.tags.includes('algorithms')).every((p) => isDone(p.id)) },
  { id: 'run-5', name: 'Five in a row', how: 'Pass 5 new lessons or problems in a row, each on the first try', test: () => store.state.run.best >= 5 },
  { id: 'run-15', name: 'Sharpshooter', how: 'Pass 15 in a row, each on the first try', test: () => store.state.run.best >= 15 },
  { id: 'streak-7', name: 'A week straight', how: 'Reach a 7-day streak', test: () => store.state.best >= 7 },
  { id: 'streak-30', name: 'A month straight', how: 'Reach a 30-day streak', test: () => store.state.best >= 30 },
  { id: 'quest-1', name: 'First special', how: "Finish a day's special", test: () => (store.state.stats.quests || 0) >= 1 },
  { id: 'quest-10', name: 'Regular', how: 'Finish 10 daily specials', test: () => (store.state.stats.quests || 0) >= 10 },
  { id: 'recall-10', name: 'It stuck', how: 'Remember 10 lessons in Quick recall', test: () => (store.state.stats.recalls || 0) >= 10 },
  { id: 'tested-out', name: 'Already knew that', how: 'Test out of a part of a track', test: () => (store.state.stats.testedOut || 0) >= 1 },
  { id: 'mock-pass', name: 'Mock passed', how: 'Score 70% or more on a PL-300 mock exam', test: () => store.examState().mocks.some((m) => m.total && m.right / m.total >= 0.7) },
  { id: 'rank-analyst', name: 'Analyst', how: 'Reach level 5', test: () => levelInfo(store.state.xp).level >= 5 },
  { id: 'rank-head', name: 'Head of Data', how: 'Reach level 13', test: () => levelInfo(store.state.xp).level >= 13 },
];

/** Unlocks whatever is newly earned, and returns those. */
export function checkAchievements() {
  const fresh = ACHIEVEMENTS.filter((a) => !store.state.achievements[a.id] && a.test());
  fresh.forEach((a) => store.unlock(a.id));
  return fresh;
}

/** Once, the first time the app opens with achievements: everything already
    earned unlocks quietly, rather than as a pile of notes on the next pass. */
export function seedAchievements() {
  if (store.state.achievementsSeeded) return;
  checkAchievements();
  store.markAchievementsSeeded();
}

/* ── After a finish ────────────────────────────────── */

/**
 * Something was finished. Counts it for today, extends or ends the first-try
 * run, earns a spare day on a big day, finishes the quest, unlocks
 * achievements, and says so.
 * @param {object} e
 *   kind: 'lesson' | 'problem' | 'recall' | 'exam' | 'mock' | 'test' | 'boss'
 *   isFirst, clean, difficulty, stage, usedSpares, xpBefore
 * @returns {{text: string, big?: boolean}[]} notes to show with the reward
 */
export function after(e) {
  const notes = [];
  const xpBefore = e.xpBefore ?? store.state.xp;

  if (e.usedSpares) {
    notes.push({ text: e.usedSpares === 1 ? 'A spare day kept your streak going.' : `${e.usedSpares} spare days kept your streak going.` });
  }

  const fresh = (e.kind === 'lesson' || e.kind === 'problem') && e.isFirst;
  if (e.kind === 'lesson' && e.isFirst) {
    store.countToday('lessons');
    if (e.clean) store.countToday('clean');
  }
  if (e.kind === 'problem' && e.isFirst) {
    store.countToday('problems');
    if (e.difficulty && e.difficulty !== 'easy') store.countToday('hardish');
  }
  if (e.kind === 'recall') store.countToday('recalls');
  if (e.kind === 'exam') store.countToday('exam');

  // Only new things count towards a run: a replay can't extend it.
  if (fresh && e.clean) {
    const count = store.extendRun();
    if (count % 5 === 0) {
      store.addXp(15);
      notes.push({ text: `First try, ${count} in a row. +15 XP` });
    } else if (count >= 3) {
      notes.push({ text: `First try: ${count} in a row.` });
    }
  } else if (fresh) {
    store.breakRun();
  }

  if (e.kind === 'boss') {
    store.addXp(BOSS_XP);
    notes.push({ text: `Boss beaten: ${TRACK_GROUPS[e.stage].name}. +${BOSS_XP} XP`, big: true });
  }

  const today = store.todayCounts();
  if ((today.lessons || 0) + (today.problems || 0) >= 3 && store.earnSpare()) {
    notes.push({ text: `Big day: a spare day saved (${store.state.spares} of ${store.maxSpares}). It covers a missed day.` });
  }

  checkQuest(notes);
  checkAchievements().forEach((a) => notes.push({ text: `Achievement: ${a.name}` }));

  const before = levelInfo(xpBefore).level;
  const now = levelInfo(store.state.xp).level;
  if (now > before) notes.push({ text: `Level ${now}: ${rankOf(now)}`, big: true });
  return notes;
}

/** A failed run or submit on something new: the first-try run starts again. */
export const missed = () => store.breakRun();

/** The notes, as extra lines in a reward box. */
export const noteLines = (notes) => notes
  .map((n) => `<p class="won-note won-extra">${escapeHTML(n.text)}</p>`).join('');
