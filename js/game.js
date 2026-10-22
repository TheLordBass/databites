/* The game layer: what's there to keep you coming back. Borrowed from
   Boot.dev where it helps learning, and left out where it would be a slot
   machine: no loot chests, no gems, no shop, and no leaderboards (those
   need accounts, and ranking yourself against strangers puts beginners off).

   - Today's special: pick one of three goals a day; finish it for bonus points.
     (Called a quest in the code and the store: the name on screen changed.)
   - First-try runs: new lessons and problems passed in a row with no failed
     run, no hint and no peek at the answer.
   - Spare days: 7 days in a row on the loyalty card saves one, and so does
     a big day (14 in a row), up to two; each covers a missed day of the
     streak (the streak itself: store.js).
   - Ranks: a title for each band of levels.
   - Achievements: the full list, tied to real skills and milestones.
   - Stage bosses: the end of each stage of the learning path, cold.
   - Mini bosses: the same at the end of each track, smaller.
   - The loyalty card: a week of days, each one you learn on stamped. Five
     in a week pays points; 7 days in a row saves a spare day, and 14 in a row
     is a big day (store.stampCard).

   It all lives in the store, on this device. Screens call after() when
   something is finished and show the notes it hands back. */

import { store, levelInfo, levelStart } from './store.js';
import { localDay, escapeHTML } from './ui.js';
import { spareIcon, bigIcon } from './cafe.js';
import { achStampSVG } from './stamps.js';
import { play as playSound } from './sound.js';
import { ALL_LESSONS, TRACKS, TRACK_GROUPS, stepLessons, chunkLessons, stageById, stageBadge, badgeStage } from './curriculum/index.js';
import { PROBLEMS, XP as PROBLEM_XP } from './practice/problems.js';

const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const isDone = (id) => store.isDone(id);

/* ── Refills: lessons, and practice questions ──────────── */
/* What's back today for a quick go so it sticks: finished lessons, and
   solved practice questions (at most one of those a day; js/store.js has
   the timings). Anything finished without a Refill of its own (from before
   Refills took it in, a part tested out of, a sync from another device) is
   taken in from its finish date, every time this is asked: it's a pass over
   ~700 ids that only saves when it adds one, so it's cheap. */
const LESSON_IDS = ALL_LESSONS.map((l) => l.id);
const PROBLEM_IDS = new Set(PROBLEMS.map((p) => p.id));
export const isProblemId = (id) => PROBLEM_IDS.has(id);
const REFILL_IDS = [...LESSON_IDS, ...PROBLEM_IDS];
export function dueRefills() {
  store.seedReviews(LESSON_IDS);
  store.seedReviews([...PROBLEM_IDS], { problem: true });
  return store.dueReviews(REFILL_IDS, isProblemId);
}
/** Where a Refill opens: a lesson's task alone, or a question from its stub. */
export const refillRoute = (id) => (isProblemId(id) ? `problem/${id}/review` : `lesson/${id}/review`);

/* ── Ranks ─────────────────────────────────────────── */

// Finishing every lesson lands around level 23, and everything around 27.
const RANKS = [
  [1, 'Intern'], [3, 'Junior Analyst'], [5, 'Analyst'], [7, 'Senior Analyst'],
  [9, 'Lead Analyst'], [11, 'Principal Analyst'], [13, 'Head of Data'], [15, 'Chief Data Officer'],
  [18, 'Data Fellow'], [21, 'Distinguished Fellow'], [24, 'Hall of Fame'], [27, 'Living Legend'],
];
export const rankOf = (level) => RANKS.filter(([from]) => level >= from).pop()[1];

/* Practice rank: a barista's ladder beside your level. It counts the base pay
   of every practice question you've solved (bonuses aside), worked out from
   what's done, so every device agrees and nothing extra is stored. Solving
   all 191 lands just past Coffee Master. */
const BARISTA = [[0, 'Trainee'], [150, 'Barista'], [600, 'Senior Barista'], [1500, 'Head Barista'],
  [3000, 'Roaster'], [5000, 'Master Roaster'], [8000, 'Coffee Master']];
export function practiceRank() {
  const points = PROBLEMS.filter((p) => store.isDone(p.id)).reduce((sum, p) => sum + PROBLEM_XP[p.difficulty], 0);
  let i = BARISTA.length - 1;
  while (BARISTA[i][0] > points) i -= 1;
  const [from, name] = BARISTA[i];
  const next = BARISTA[i + 1] ? { at: BARISTA[i + 1][0], name: BARISTA[i + 1][1] } : null;
  return { points, name, from, next };
}

/** The practice rank as one short line, for Practice and You. */
export function practiceRankLine() {
  const r = practiceRank();
  const left = r.next ? `${(r.next.at - r.points).toLocaleString()} to ${r.next.name}` : 'the top of the ladder';
  return { rank: r, html: `<b>${escapeHTML(r.name)}</b>: ${r.points.toLocaleString()} practice point${r.points === 1 ? '' : 's'}, ${escapeHTML(left)}.` };
}

/* ── Today's special (a quest, in the code) ─────────── */

// One quest of each level is offered a day; `kind` is the count it reads (store.countToday).
const QUESTS = [
  { id: 'lessons-2', level: 1, xp: 25, kind: 'lessons', of: 2, text: 'Finish 2 new lessons', go: 'next', when: (c) => c.openLessons >= 2 },
  { id: 'recalls', level: 1, xp: 25, kind: 'recalls', text: "Do today's refills", go: 'recall', when: (c) => c.due > 0 },
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
    due: dueRefills().length,
    openLessons: ALL_LESSONS.filter((l) => !isDone(l.id)).length,
    openProblems: open.length,
    openHardish: open.filter((p) => p.difficulty !== 'easy').length,
  };
}

const questText = (quest, of) => (quest.kind === 'recalls'
  ? `Do today's ${of} refill${of === 1 ? '' : 's'}` : quest.text);

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
  checkAchievements().forEach((a) => notes.push({ text: `Achievement: ${a.name}`, ach: a }));
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
  notes.push({ text: `Today's special, done: ${questText(quest, q.of)}. +${quest.xp} points`, big: true });
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
  store.startBoss(TRACK_GROUPS[stage].id, steps);
  ctx.go(`lesson/${steps[0]}/test`);
}

// Saved under the stage's id (TRACK_GROUPS), which stays put when stages move.
export const bossBeaten = (stage) => store.state.bosses[TRACK_GROUPS[stage].id] || null;
const bossesBeaten = () => TRACK_GROUPS.filter((g) => store.state.bosses[g.id]).length;

/* ── Mini bosses ───────────────────────────────────── */

/* One for every track, waiting on its page once the whole track is done:
   a smaller fight than the stage boss, from inside one subject. Projects
   has none: it's a stage of its own, so its stage boss already is one. */
export const MINI_XP = 50;
export const hasMini = (track) => track.id !== 'projects';
export const MINI_TRACKS = TRACKS.filter(hasMini);
export const trackDone = (track) => track.lessons.every((l) => isDone(l.id));

/* The lessons that close the track's parts, which lean on what came before
   them, leaving out the last part's (the stage boss uses the track's last
   lesson). Three at most, spread from the first part to the last; a
   two-part track adds the middle of its last part, to make two. */
export function miniSteps(track) {
  const parts = chunkLessons(track);
  const closers = parts.slice(0, -1).map((p) => p.lessons[p.lessons.length - 1]);
  const last = parts[parts.length - 1].lessons;
  while (closers.length < 2 && last.length) closers.push(last[Math.floor((last.length - 1) / (3 - closers.length))]);
  const picks = closers.length <= 3 ? closers
    : [0, Math.floor((closers.length - 1) / 2), closers.length - 1].map((i) => closers[i]);
  return [...new Set(picks.map((l) => l.id))];
}

export function startMini(ctx, trackId) {
  const track = TRACKS.find((t) => t.id === trackId);
  const steps = miniSteps(track);
  store.startMini(track.id, steps);
  ctx.go(`lesson/${steps[0]}/test`);
}

export const miniBeaten = (trackId) => store.state.minis[trackId] || null;

/* ── Achievements ──────────────────────────────────── */

const solved = () => PROBLEMS.filter((p) => isDone(p.id));
const minisBeaten = () => MINI_TRACKS.filter((t) => miniBeaten(t.id)).length;
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
    id: stageBadge(g), name: `Stage ${i + 1}: ${g.name}`, how: `Finish every lesson in "${g.name}"`, test: () => stageDone(i),
  })),
  { id: 'boss-1', name: 'First Signature', how: "Pass a stage's Signature, its final questions", test: () => bossesBeaten() >= 1 },
  { id: 'boss-all', name: 'Every Signature', how: `Pass all ${TRACK_GROUPS.length} stages' Signatures`, test: () => bossesBeaten() >= TRACK_GROUPS.length },
  { id: 'mini-1', name: 'First Taste test', how: "Pass a course's Taste test, its final questions", test: () => minisBeaten() >= 1 },
  { id: 'mini-5', name: 'Five Taste tests', how: 'Pass the Taste tests of 5 courses', test: () => minisBeaten() >= 5 },
  { id: 'mini-all', name: 'Every Taste test', how: `Pass all ${MINI_TRACKS.length} Taste tests`, test: () => minisBeaten() >= MINI_TRACKS.length },
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
  { id: 'recall-10', name: 'It stuck', how: 'Remember 10 lessons in Refills', test: () => (store.state.stats.recalls || 0) >= 10 },
  { id: 'tested-out', name: 'Already knew that', how: 'Test out of part of a course', test: () => (store.state.stats.testedOut || 0) >= 1 },
  { id: 'mock-pass', name: 'Mock passed', how: 'Score 70% or more on a PL-300 mock exam', test: () => store.examState().mocks.some((m) => m.total && m.right / m.total >= 0.7) },
  { id: 'rank-analyst', name: 'Analyst', how: 'Reach level 5', test: () => levelInfo(store.state.xp).level >= 5 },
  { id: 'rank-head', name: 'Head of Data', how: 'Reach level 13', test: () => levelInfo(store.state.xp).level >= 13 },
];

/* How far along a counted one is, for its row on You: [have, need], and a
   unit when it isn't a plain count. The runs and streaks count the current
   one, since that's the one that has to reach the number. */
const algoProblems = () => PROBLEMS.filter((p) => p.tags.includes('algorithms'));
const PROGRESS = {
  'boss-all': () => [bossesBeaten(), TRACK_GROUPS.length],
  'mini-5': () => [minisBeaten(), 5],
  'mini-all': () => [minisBeaten(), MINI_TRACKS.length],
  'problems-25': () => [solved().length, 25],
  algorithms: () => [algoProblems().filter((p) => isDone(p.id)).length, algoProblems().length],
  'run-5': () => [store.state.run.count, 5],
  'run-15': () => [store.state.run.count, 15],
  'streak-7': () => [store.liveStreak(), 7],
  'streak-30': () => [store.liveStreak(), 30],
  'quest-10': () => [store.state.stats.quests || 0, 10],
  'recall-10': () => [store.state.stats.recalls || 0, 10],
  'mock-pass': () => [Math.max(0, ...store.examState().mocks.filter((m) => m.total).map((m) => Math.round((100 * m.right) / m.total))), 70, '%'],
  'rank-analyst': () => [store.state.xp, levelStart(5), ' points'],
  'rank-head': () => [store.state.xp, levelStart(13), ' points'],
};

/** An achievement still to earn: { have, need, unit } toward it, or null
    for the ones that happen all at once (a first join, a first chart). */
export function achProgress(a) {
  const stage = badgeStage(a.id);
  const got = stage >= 0 ? (() => {
    const lessons = stageLessons(stage);
    return [lessons.filter((l) => isDone(l.id)).length, lessons.length];
  })() : PROGRESS[a.id] && PROGRESS[a.id]();
  if (!got) return null;
  const [have, need, unit = ''] = got;
  return { have: Math.min(have, need), need, unit };
}

/** Unlocks whatever is newly earned, and returns those. */
export function checkAchievements() {
  const fresh = ACHIEVEMENTS.filter((a) => !store.state.achievements[a.id] && a.test());
  fresh.forEach((a) => store.unlock(a.id));
  return fresh;
}

/** Once, the first time the app opens with achievements: everything already
    earned unlocks quietly, rather than as a pile of notes on the next pass. */
export function seedAchievements() {
  // Stage badges were numbered (stage-1) before stages had ids: a stage
  // already finished gets its new badge quietly, not as a note, and the
  // numbered ones go, so this happens once.
  const numbered = Object.keys(store.state.achievements).filter((id) => /^stage-\d+$/.test(id));
  if (numbered.length) {
    ACHIEVEMENTS.filter((a) => badgeStage(a.id) >= 0 && !store.state.achievements[a.id] && a.test()).forEach((a) => store.unlock(a.id));
    store.forgetAchievements(numbered);
  }
  if (store.state.achievementsSeeded) return;
  checkAchievements();
  store.markAchievementsSeeded();
}

/* ── After a finish ────────────────────────────────── */

/**
 * Something was finished. Counts it for today, extends or ends the first-try
 * run, stamps the loyalty card (and pays out for it), finishes the quest, unlocks
 * achievements, and says so.
 * @param {object} e
 *   kind: 'lesson' | 'problem' | 'recall' | 'exam' | 'mock' | 'test' | 'boss' | 'mini'
 *   isFirst, clean, difficulty, stage (a boss), track (a mini boss), usedSpares, xpBefore
 * @returns {{text: string, big?: boolean}[]} notes to show with the reward
 */
export function after(e) {
  const notes = [];
  const xpBefore = e.xpBefore ?? store.state.xp;

  if (e.usedSpares) {
    notes.push({ icon: 'spare', text: e.usedSpares === 1 ? 'A spare day kept your streak going.' : `${e.usedSpares} spare days kept your streak going.` });
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
      notes.push({ text: `First try, ${count} in a row. +15 points` });
    } else if (count >= 3) {
      notes.push({ text: `First try: ${count} in a row.` });
    }
  } else if (fresh) {
    store.breakRun();
  }

  // The loyalty card: any finish stamps today. The fifth day this week pays
  // points; the 7th day in a row saves a spare day; the 14th is a big day,
  // which saves one too.
  const paid = store.stampCard();
  if (paid && paid.week) {
    notes.push({ text: `Loyalty card: ${store.CARD_DAYS} days this week. +${store.CARD_XP} points.`, big: true });
  }
  if (paid && paid.run) {
    notes.push(paid.big
      ? { icon: 'big', text: `${paid.run} days in a row: a big day! ${paid.spare ? `A spare day saved (${store.state.spares} of ${store.maxSpares}).` : "Your spare days are already full."}`, big: true }
      : { icon: 'spare', text: `${paid.run} days in a row: ${paid.spare ? `a spare day saved (${store.state.spares} of ${store.maxSpares})` : "that's a spare day, but you're already holding 2"}.`, big: true });
  }

  if (e.kind === 'boss') {
    store.addXp(BOSS_XP);
    notes.push({ text: `Signature passed: ${(stageById(e.stage) || { name: 'a stage' }).name}. +${BOSS_XP} points`, big: true });
  }
  if (e.kind === 'mini') {
    store.addXp(MINI_XP);
    notes.push({ text: `Taste test passed: ${e.track.name}. +${MINI_XP} points`, big: true });
  }

  checkQuest(notes);
  checkAchievements().forEach((a) => notes.push({ text: `Achievement: ${a.name}`, ach: a }));

  const before = levelInfo(xpBefore).level;
  const now = levelInfo(store.state.xp).level;
  if (now > before) notes.push({ text: `Level ${now}: ${rankOf(now)}`, big: true });
  return notes;
}

/** A failed run or submit on something new: the first-try run starts again. */
export const missed = () => store.breakRun();

/** The notes, as extra lines in a reward box. New achievements aren't
    among them: they come as stamps, under the box (achDrops). */
export const noteLines = (notes) => notes.filter((n) => !n.ach)
  .map((n) => `<p class="won-note won-extra">${n.icon ? NOTE_ICON[n.icon]() : ''}${escapeHTML(n.text)}</p>`).join('');

/** A new achievement's stamp, thunking down on the paper under the reward
    box (in its own ink, which a coloured box would swallow), after the
    lesson's stamp; with the stamp sound (stampSounds). It lands again, the
    first time, on You → Achievements. */
export const achDrops = (notes) => notes.filter((n) => n.ach)
  .map((n, k) => `<div class="stamp-drop ach-drop" style="--d:${(0.25 * k).toFixed(2)}s">${achStampSVG(n.ach, localDay())}
    <p class="stamp-caption"><b>New achievement: ${escapeHTML(n.ach.name)}.</b> Its stamp joins the rest on You, under
    Achievements.</p></div>`).join('');

/* The stamp sound for each stamp landing in `root`, timed to the moment it
   hits the paper: `start` is the first one's delay (s), `gap` between them.
   Only when sounds are on, and never more than ten. */
export function stampSounds(stamps, start, gap) {
  [...stamps].slice(0, 10).forEach((el, i) => playSound('stamp', { at: start + gap * i }));
}

// Spare days and big days carry their icons (js/cafe.js) into the reward box.
const NOTE_ICON = { spare: () => spareIcon(true), big: bigIcon };
