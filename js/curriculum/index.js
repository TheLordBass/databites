/* Every course and the path through them. Each track file (pandas.js,
   sql.js, ...) exports an array of lessons; this file names them, orders
   them (TRACKS, TRACK_GROUPS: the stages), and adds what every lesson needs
   from its track (ALL_LESSONS: track, index, lang, needs, deeper).

   A lesson is { id, mins, title, concept: [three bullets], starter, task,
   hint, solution, check }, plus optional extras: lang (when it isn't the
   track's), needs (packages to fetch), dialects (SQL elsewhere), xl (an
   Excel lesson's sheet and cell) and rows (a DAX lesson's matrix rows).
   check is Python run after the learner's code: plain asserts whose messages
   the learner reads, so they're written for someone who has never coded.
   tests.html runs every lesson: its solution must pass and its starter fail.
   The README's "Adding your own lessons" has the details. */

import { PRELUDE, COLUMNS, DATASETS } from './prelude.js';
import { BASICS } from './basics.js';
import { PYTHON } from './python.js';
import { PANDAS } from './pandas.js';
import { MESSY } from './messy.js';
import { WRANGLING } from './wrangling.js';
import { TIMESERIES } from './timeseries.js';
import { MATPLOTLIB } from './matplotlib.js';
import { SEABORN } from './seaborn.js';
import { ANALYSIS } from './analysis.js';
import { SQL } from './sql.js';
import { DAX } from './dax.js';
import { PROJECTS } from './projects.js';
import { POWERBI } from './powerbi.js';
import { STATS } from './stats.js';
import { AI } from './ai.js';
import { ALGO } from './algo.js';
import { DEEPER } from './deeper.js';
import { NUMPY } from './numpy.js';
import { METRICS } from './metrics.js';
import { FORECAST } from './forecast.js';
import { ML } from './ml.js';
import { EXCEL } from './excel.js';
import { EXCEL_CLEAN } from './xlclean.js';
import { SQL_CLEAN } from './sqlclean.js';
import { R_LESSONS } from './r.js';
import { ETL } from './etl.js';
import { DETAIL } from './detail/index.js';
import { INTROS } from './intros.js';

export { PRELUDE, COLUMNS, DATASETS };

/* Every track, in the order it was written. TRACKS (below) puts them in
   learning order. `cafe` is its café name, shown after the plain name where
   the course is a heading (courseTitle, below).
   `parts` names the chunks a track is broken into on its index page.
   A nearer finish line than the whole track — see chunkLessons below. */
const TRACK_LIST = [
  {
    // The Python course: first steps to classes, files and regex. Its first
    // `primer` lessons are for someone who has never coded: once lessons
    // elsewhere are done, "what's next" skips those (see openLessons), but
    // not the rest of the course. The id stays 'basics' so progress carries.
    id: 'basics',
    name: 'Python',
    cafe: 'First Sip',
    theme: 't-basics',
    primer: 11,                    // the introduction, then ten first steps
    blurb: 'From your first line to classes, tests, regex and small programs',
    parts: ['Values and names', 'Tools and choices', 'Numbers and text', 'Loops in depth',
            'Lists and tuples', 'Dicts and sets', 'Functions in depth', 'Choices and collections',
            'When things go wrong', 'Files, formats and the standard library', 'Classes and objects',
            'Classes that behave', 'Iterators, generators and more', 'Code you can trust',
            'Regular expressions', 'Small programs'],
    lessons: [...BASICS, ...PYTHON],
  },
  {
    id: 'pandas',
    name: 'pandas',
    cafe: 'Daily Grind',
    theme: 't-pandas',
    blurb: 'Shape, filter and summarise tables',
    parts: ['First contact', 'Asking questions', 'When data misbehaves', 'Reshaping and loading', 'Going further',
            'Groups, deeper', 'How analysts slice it'],
    lessons: PANDAS,
  },
  {
    id: 'messy',
    name: 'messy data',
    cafe: 'Spilled Beans',
    theme: 't-messy',
    blurb: 'Clean, check and rescue what someone else exported',
    parts: ['Reading the damage', 'Making it usable', 'Can you trust it?', 'Files that fight back'],
    lessons: MESSY,
  },
  {
    id: 'wrangling',
    name: 'wrangling',
    cafe: 'The Blend',
    theme: 't-wrangle',
    blurb: 'Join, stack and reshape tables',
    parts: ['Putting tables together', 'Changing their shape', 'The shop, in pandas'],
    lessons: WRANGLING,
  },
  {
    id: 'timeseries',
    name: 'time series',
    cafe: 'Slow Drip',
    theme: 't-ts',
    blurb: 'Weeks, months and trends over time',
    parts: ['Time as an index', 'Comparing across time'],
    lessons: TIMESERIES,
  },
  {
    id: 'matplotlib',
    name: 'matplotlib',
    cafe: 'Latte Art',
    theme: 't-mpl',
    blurb: 'Draw anything, control everything',
    parts: ['Your first charts', 'Choosing the right shape', 'Charts that do more'],
    lessons: MATPLOTLIB,
  },
  {
    id: 'seaborn',
    name: 'seaborn',
    cafe: 'Rosetta',
    theme: 't-sns',
    blurb: 'Beautiful statistical charts, fast',
    parts: ["Seaborn's way", 'Grids and relationships', 'More shapes'],
    lessons: SEABORN,
  },
  {
    id: 'analysis',
    name: 'analysis',
    cafe: 'Single Origin',
    theme: 't-analysis',
    blurb: 'One question, start to finish',
    parts: ['Before you conclude anything', 'Modelling and telling'],
    lessons: ANALYSIS,
  },
  {
    id: 'stats',
    name: 'statistics',
    cafe: 'Cupping Notes',
    theme: 't-stats',
    blurb: 'Chance, uncertainty, relationships and honest tests',
    parts: ['Describing and sampling', 'Comparing groups', 'Chance', 'Distributions at work',
            'Relationships', 'More tests', 'Thinking like a statistician'],
    lessons: STATS,
  },
  {
    // The working version of what the AI track explains from the inside.
    // scikit-learn is fetched on the track's first run.
    id: 'ml',
    name: 'Machine learning at work',
    cafe: 'House Roast',
    theme: 't-ml',
    needs: ['scikit-learn'],
    blurb: 'Baselines, pipelines, the right scores, leaks, boosting and tuning',
    parts: ['A model you can trust', 'Measure it properly', 'Predicting numbers'],
    lessons: ML,
  },
  {
    id: 'forecast',
    name: 'Forecasting',
    cafe: "Tomorrow's Brew",
    theme: 't-fc',
    blurb: 'How many calls tomorrow? Baselines, smoothing, models and honest tests',
    parts: ['Before any model', 'Seeing the pattern', 'Forecasting models'],
    lessons: FORECAST,
  },
  {
    id: 'metrics',
    name: 'Business metrics',
    cafe: 'Till Receipts',
    theme: 't-metrics',
    blurb: 'Funnels, retention, lifetime value and A/B tests, the way companies run them',
    parts: ['Measuring a business', 'Keeping customers', 'Running experiments'],
    lessons: METRICS,
  },
  {
    id: 'numpy',
    name: 'NumPy',
    cafe: 'Fine Grind',
    theme: 't-numpy',
    blurb: 'Arrays: the fast numbers under pandas and machine learning',
    parts: ['Arrays', 'Shapes and axes', 'NumPy at work'],
    lessons: NUMPY,
  },
  {
    // Most lessons need scikit-learn, declared per lesson: the numpy ones
    // (a neuron, gradient descent, filters, Q-learning) don't wait for it.
    id: 'ai',
    name: 'AI with Python',
    cafe: 'Barista Bot',
    theme: 't-ai',
    blurb: 'Models that learn, networks from scratch, text and trial and error',
    parts: ['How machines learn', 'Neural networks, from the inside', 'Beyond labels', 'Better models'],
    lessons: AI,
  },
  {
    // R, the other language analysts use: the pandas course's questions
    // again, with dplyr, on the same tables. It runs in webR (js/r.js),
    // fetched the first time an R lesson runs, so lang: 'r'.
    id: 'r',
    name: 'R for data analysis',
    cafe: 'Second Pour',
    theme: 't-r',
    lang: 'r',
    blurb: 'The same questions again, in R with dplyr',
    parts: ['First contact', 'Asking questions', 'When data misbehaves', 'Reshaping and loading', 'Going further',
            'Groups, deeper', 'How analysts slice it'],
    lessons: R_LESSONS,
  },
  {
    // Plain Python, nothing to download. Starts with a quick go at def,
    // for anyone who comes here without the Python course.
    id: 'algo',
    name: 'Algorithms',
    cafe: 'Double Shot',
    theme: 't-algo',
    blurb: 'Speed, searching, sorting, structures, recursion, graphs and faster code',
    parts: ['Your own functions', 'Counting the work', 'Searching', 'Sorting',
            'Data structures', 'Recursion', 'Graphs, greedy and dynamic programming',
            'Making it faster'],
    lessons: ALGO,
  },
  {
    // Data engineering for analysts: one nightly till export carried from
    // text to a database safely. Builds on pandas, SQL and the Python
    // course's own small ETL program (py-80). From part 2 on, each lesson's
    // setup carries the pipeline so far. SQLite is fetched per lesson, from
    // the loading part on.
    id: 'etl',
    name: 'ETL and pipelines',
    cafe: 'Bean to Cup',
    theme: 't-etl',
    blurb: 'Move data from source to database safely: contracts, rejects, reruns, upserts, logs and checks',
    parts: ['Getting data in', 'Cleaning on the way', 'Loading it safely', 'A pipeline you can trust'],
    lessons: ETL,
  },
  {
    // lang: the editor speaks SQL (a lesson can override it). needs: SQLite
    // is fetched on the track's first run rather than at boot.
    id: 'sql',
    name: 'SQL',
    cafe: 'Order Up',
    theme: 't-sql',
    lang: 'sql',
    needs: ['sqlite3'],
    blurb: 'Ask a database questions',
    parts: ['First queries', 'Summing up', 'Dates, joins and subqueries',
            'The shop: many tables', 'Harder questions', 'Windows, and back to pandas',
            'Changing data, and text', 'Deeper queries', 'Analyst patterns'],
    lessons: SQL,
  },
  {
    // lang: the editor holds a formula, for the cell each lesson names. The
    // engine (js/excel.py) loads the first time an Excel lesson runs.
    id: 'excel',
    name: 'Excel',
    cafe: 'Menu Board',
    theme: 't-excel',
    lang: 'excel',
    blurb: 'Formulas on a real sheet: SUMIFS, lookups and lists that spill',
    parts: ['Cells and formulas', 'Copy, lock and decide', 'Count and add by condition', 'Look up, tidy and spill'],
    lessons: EXCEL,
  },
  {
    // The messy data course's ideas with formulas, on the same survey export.
    id: 'xlclean',
    name: 'Excel cleaning',
    cafe: 'Wiped Counter',
    theme: 't-excel',
    lang: 'excel',
    blurb: 'Trim, fix and check a messy export with formulas',
    parts: ['Find the mess', 'Fix it', 'Can you trust it?'],
    lessons: EXCEL_CLEAN,
  },
  {
    // The same, in a database: quoted column names, CASE and a clean view.
    id: 'sqlclean',
    name: 'SQL cleaning',
    cafe: 'Clean Pour',
    theme: 't-sql',
    lang: 'sql',
    needs: ['sqlite3'],
    blurb: 'Trim, fix and check a messy table in SQL',
    parts: ['Find the mess', 'Fix it', 'Can you trust it?'],
    lessons: SQL_CLEAN,
  },
  {
    // lang: the editor holds DAX measures. The engine (js/dax.py) loads the
    // first time a DAX lesson runs; nothing to download beyond that file.
    id: 'dax',
    name: 'DAX',
    cafe: 'Perfect Measure',
    theme: 't-dax',
    lang: 'dax',
    blurb: 'Power BI formulas: measures and filters',
    parts: ['Your first measures', 'CALCULATE', 'Row by row, ranking and time',
            'Blanks, labels and totals', 'Patterns that come up', 'Going through a table', 'Analyst patterns'],
    lessons: DAX,
  },
  {
    id: 'pbi',
    name: 'Power BI modelling',
    cafe: 'Origin Map',
    theme: 't-pbi',
    lang: 'dax',
    blurb: 'Calculated columns, the date table and common patterns',
    parts: ['Columns and the model', 'Patterns on a star schema'],
    lessons: POWERBI,
  },
  {
    id: 'projects',
    name: 'Projects',
    cafe: 'The Full Menu',
    theme: 't-projects',
    blurb: 'One real question, answered with every tool',
    parts: ['Where should the shop grow next?', 'Does the weather move the cafe?',
            'From messy survey to a one-page summary', 'Who should we win back?'],
    // One part per project, however long, so each write-up covers the whole project.
    partSizes: [5, 5, 5, 10],
    lessons: PROJECTS,
  },
];

/* Every course opens with its introduction lesson (intros.js): lesson 1,
   a part of its own. */
for (const track of TRACK_LIST) {
  if (INTROS[track.id]) track.lessons = [INTROS[track.id], ...track.lessons];
}

/* The learning path: the order we'd take everything in, in stages. The
   Tracks screen shows it as numbered steps, and "what's next" (Home, and
   the button after a lesson) walks it.

   A step is a whole track, or a slice of one (`from`, `to`: lesson
   positions). The Python course is split: pandas needs only its first
   seven parts, and eighty lessons of plain Python before any data is a
   long wait. Its later parts (collections, errors and files, classes,
   testing, regex, small programs) come back in Build with Python.
   tests.html checks the path takes in every lesson exactly once. */
const COURSE_SPLIT = 36;          // the end of "Functions in depth", part 7 (after the introduction)

export const TRACK_GROUPS = [
  // One stage per tool, in the order to learn them: Excel (no code), then
  // SQL, then Python and pandas, each with its own cleaning course. Then the
  // analysis, Power BI and the projects, and three stages to go further.
  // A stage's id is what saved progress keys its Signature by (store.js
  // OLD_STAGES maps the numbered stages from before ids), so ids never change.
  // `ink` colours the stage's badge (js/stamps.js).
  { id: 'excel', ink: 't-excel', name: 'Excel', note: 'Formulas on a real sheet, then cleaning a messy one. No code to write.', steps: [
    { track: 'excel' }, { track: 'xlclean' },
  ] },
  { id: 'sql', ink: 't-sql', name: 'SQL', note: 'Ask a database questions, then clean up what it holds.', steps: [
    { track: 'sql' }, { track: 'sqlclean' },
  ] },
  { id: 'python', ink: 't-pandas', name: 'Python and pandas', note: 'Python from its first line, then pandas: clean, reshape and chart a table.', steps: [
    { track: 'basics', to: COURSE_SPLIT, about: 'Parts 1 to 7: first steps, loops, lists, dicts and functions. All pandas needs.' },
    { track: 'pandas' }, { track: 'messy' }, { track: 'wrangling' }, { track: 'matplotlib' }, { track: 'seaborn' },
  ] },
  { id: 'story', ink: 't-stats', name: 'Find the story', note: 'Trends over time, how sure you can be, and the numbers businesses run on.', steps: [
    { track: 'timeseries' }, { track: 'forecast' }, { track: 'stats' }, { track: 'metrics' }, { track: 'analysis' },
  ] },
  { id: 'powerbi', ink: 't-pbi', name: 'Power BI', note: 'DAX, data models and the PL-300 exam.', exam: true, steps: [
    { track: 'dax' }, { track: 'pbi' },
  ] },
  { id: 'projects', ink: 't-projects', name: 'Put it together', note: 'Real questions, answered with every tool so far.', steps: [{ track: 'projects' }] },
  { id: 'build', ink: 't-algo', name: 'Build with Python', note: 'The rest of Python, data pipelines, and algorithms that scale.', steps: [
    { track: 'basics', from: COURSE_SPLIT, about: 'Parts 8 to 16: collections, errors and files, classes, testing, regex and small programs.' },
    { track: 'etl' }, { track: 'algo' },
  ] },
  { id: 'ml', ink: 't-ml', name: 'AI and machine learning', note: 'NumPy, then models that learn from examples.', steps: [
    { track: 'numpy' }, { track: 'ai' }, { track: 'ml' },
  ] },
  { id: 'r', ink: 't-r', name: 'R', note: 'The same data questions, in the language statisticians love.', steps: [{ track: 'r' }] },
];

/** A stage by its id: what a Signature in progress, and a passed one, are saved under. */
export const stageById = (id) => TRACK_GROUPS.find((g) => g.id === id) || null;
/** A stage's badge (js/game.js ACHIEVEMENTS) is stage-<its id>; this gives a badge id's stage position, or -1. */
export const stageBadge = (g) => `stage-${g.id}`;
export const badgeStage = (id) => TRACK_GROUPS.findIndex((g) => stageBadge(g) === id);

/* Every track, in the order the path first reaches it: Home's shelf, the
   You ledger and the lesson list all follow it. One left off the path
   still shows, at the end. */
const ON_PATH = [...new Set(TRACK_GROUPS.flatMap((g) => g.steps.map((s) => s.track)))];
export const TRACKS = [
  ...ON_PATH.map((id) => TRACK_LIST.find((t) => t.id === id)).filter(Boolean),
  ...TRACK_LIST.filter((t) => !ON_PATH.includes(t.id)),
];

/* A DAX lesson's matrix rows ride along in its prelude, as _DAX_ROWS, and
   so do an Excel lesson's sheet and a lesson's own `setup`. Use this
   wherever a lesson is run, so checks see the same matrix, sheet and setup. */
export const lessonPrelude = (lesson) => {
  let prelude = PRELUDE;
  if (lesson.rows) prelude += `\n_DAX_ROWS = ${JSON.stringify(lesson.rows)}\n`;
  // An Excel lesson's sheet and cell ride along the same way, as _XL.
  if (lesson.xl) prelude += `\nimport json as _json\n_XL = _json.loads(${JSON.stringify(JSON.stringify(lesson.xl))})\n`;
  // What a lesson builds on from the ones before it (the ETL course's
  // pipeline so far), run before the learner's code so the editor starts short.
  if (lesson.setup) prelude += `\n${lesson.setup}\n`;
  return prelude;
};

/* Each lesson's Expected output is worked out ahead of time and shipped as
   expected/<id>.json (made by expected.html), so opening it runs nothing.
   The file carries this stamp of what it was worked out from: the answer,
   the data and the lesson's settings. If the lesson changes, the stamps no
   longer match and the lesson works it out live instead (lesson.js), so it
   never shows an old answer; expected.html then remakes the stale ones. */
const stampOf = (code, lesson) => {
  const text = [lesson.lang, code, (lesson.needs || []).join(','), lessonPrelude(lesson)].join('\u0000');
  let h = 2166136261;                            // FNV-1a
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${(h >>> 0).toString(36)}-${text.length.toString(36)}`;
};
export const expectedStamp = (lesson) => stampOf(lesson.solution, lesson);

/* A worked example (detail/) runs with the lesson's prelude, except that an
   Excel example can give its own cell and heading (example.xl), so its
   answer isn't shown under the task's heading, and a DAX example its own
   matrix rows (example.rows), for a column the example makes itself.
   examplePrelude is what it runs with, and exampleStamp the same stamp for
   its result, built in beside the Expected outputs (expected.js EXAMPLES). */
const exampleLesson = (lesson) => {
  const ex = lesson.detail && lesson.detail.example;
  if (!ex || (!ex.xl && !ex.rows)) return lesson;
  return {
    ...lesson,
    ...(ex.xl ? { xl: { ...lesson.xl, ...ex.xl } } : {}),
    ...(ex.rows ? { rows: ex.rows } : {}),
  };
};
export const examplePrelude = (lesson) => lessonPrelude(exampleLesson(lesson));
export const exampleStamp = (lesson) => stampOf(lesson.detail && lesson.detail.example ? lesson.detail.example.code : '', exampleLesson(lesson));

/**
 * Break a track into roughly five-lesson parts, split as evenly as possible
 * so you never get a stranded part of one.
 * 20 → 5,5,5,5   11 → 4,4,3   9 → 5,4   6 → 3,3
 */
export function chunkLessons(track) {
  // The introduction lesson is a part of its own, first; the rest chunk as before.
  const intro = track.lessons[0] && track.lessons[0].intro ? 1 : 0;
  const head = intro ? [{ name: 'Introduction', start: 0, lessons: track.lessons.slice(0, 1), intro: true }] : [];
  const lessons = track.lessons.slice(intro);
  // A track can set its own sizes: Projects keeps each project one part, so
  // its write-up covers the whole thing however long it is.
  if (track.partSizes && track.partSizes.reduce((a, b) => a + b, 0) === lessons.length) {
    let at = intro;
    return [...head, ...track.partSizes.map((size, i) => {
      const part = { name: track.parts[i] || `Part ${i + 1}`, start: at, lessons: track.lessons.slice(at, at + size) };
      at += size;
      return part;
    })];
  }
  const total = lessons.length;
  const count = Math.max(1, Math.ceil(total / 5));
  const base = Math.floor(total / count);
  const extra = total % count;

  const parts = [];
  let cursor = intro;
  for (let i = 0; i < count; i++) {
    const size = base + (i < extra ? 1 : 0);
    parts.push({
      name: (track.parts && track.parts[i]) || `Part ${i + 1}`,
      start: cursor,
      lessons: track.lessons.slice(cursor, cursor + size),
    });
    cursor += size;
  }
  return [...head, ...parts];
}

export const ALL_LESSONS = TRACKS.flatMap((track) =>
  track.lessons.map((lesson, i) => ({
    ...lesson,
    track,
    index: i,
    lang: lesson.lang || track.lang || 'python',
    needs: [...(track.needs || []), ...(lesson.needs || [])],
    // "Go deeper" text lives in deeper.js, keyed by lesson id.
    deeper: lesson.deeper || DEEPER[lesson.id] || null,
    // Fuller teaching, a worked example and the task as a brief (detail/).
    detail: DETAIL[lesson.id] || null,
  }))
);

export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);

/** A course as it's named where it's the heading (its card, its own page):
    the plain name, then its café name, "pandas: Daily Grind". Sentences and
    the top bar use the plain name alone ("On to pandas"). */
export const courseTitle = (track) => (track.cafe ? `${track.name}: ${track.cafe}` : track.name);

/* A primer lesson: one of the first `track.primer` lessons of a track, for
   people starting from nothing. */
export const isPrimer = (lesson) => lesson.index < (lesson.track.primer || 0);

/* The path as steps, and each step's lessons. */
export const PATH = TRACK_GROUPS.flatMap((g) => g.steps);
export const stepLessons = (step) => ALL_LESSONS.filter((l) => l.track.id === step.track
  && l.index >= (step.from || 0) && l.index < (step.to ?? Infinity));
/* Every lesson in path order. A lesson the path misses still comes, at the end. */
const ON_PATH_LESSONS = PATH.flatMap(stepLessons);
export const PATH_LESSONS = [...ON_PATH_LESSONS, ...ALL_LESSONS.filter((l) => !ON_PATH_LESSONS.includes(l))];
export const stepOf = (lesson) => PATH.find((step) => stepLessons(step).includes(lesson)) || null;

/* Lessons worth offering, in path order: the ones not done. Once any lesson
   outside the primer is done, the primer isn't pushed any more (it stays on
   Courses). startAt is the course a learner chose to begin with on the
   welcome screen: the path is offered from there on first, then from the
   beginning for anything earlier. */
export function openLessons(isDone, startAt = null) {
  const beyond = ALL_LESSONS.some((l) => !isPrimer(l) && isDone(l.id));
  const open = PATH_LESSONS.filter((l) => !isDone(l.id) && !(beyond && isPrimer(l)));
  const from = startAt ? PATH_LESSONS.findIndex((l) => l.track.id === startAt) : -1;
  if (from <= 0) return open;
  const at = new Map(PATH_LESSONS.map((l, i) => [l, i]));
  return [...open.filter((l) => at.get(l) >= from), ...open.filter((l) => at.get(l) < from)];
}

export const firstUndone = (isDone, startAt = null) => openLessons(isDone, startAt)[0] || null;

/* What's next, for Home and Courses: carry on where you were. `last` is the
   lesson you most recently finished as a lesson (not a refill or a test):
   the next one not done in the same step of the path comes first. Once that
   step is done, the path (from where you chose to start) takes over again. */
export function whatsNext(isDone, startAt = null, last = null) {
  const lesson = last ? ALL_LESSONS.find((l) => l.id === last) : null;
  const step = lesson ? stepOf(lesson) : null;
  if (step) {
    const list = stepLessons(step);
    const after = list.slice(list.indexOf(lesson) + 1).find((l) => !isDone(l.id))
      || list.find((l) => !isDone(l.id));
    if (after) return after;
  }
  return firstUndone(isDone, startAt);
}

export const trackById = (id) => TRACKS.find((t) => t.id === id);
