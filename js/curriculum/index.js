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

export { PRELUDE, COLUMNS, DATASETS };

/* Every track, in the order it was written. TRACKS (below) puts them in
   learning order. `parts` names the chunks a track is broken into on its index page.
   A nearer finish line than the whole track — see chunkLessons below. */
const TRACK_LIST = [
  {
    // The Python course: first steps to classes, files and regex. Its first
    // `primer` lessons are for someone who has never coded: once lessons
    // elsewhere are done, "what's next" skips those (see openLessons), but
    // not the rest of the course. The id stays 'basics' so progress carries.
    id: 'basics',
    name: 'Python course',
    theme: 't-basics',
    primer: 10,
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
    theme: 't-pandas',
    blurb: 'Shape, filter and summarise tables',
    parts: ['First contact', 'Asking questions', 'When data misbehaves', 'Reshaping and loading', 'Going further',
            'Groups, deeper', 'How analysts slice it'],
    lessons: PANDAS,
  },
  {
    id: 'messy',
    name: 'messy data',
    theme: 't-messy',
    blurb: 'Clean, check and rescue what someone else exported',
    parts: ['Reading the damage', 'Making it usable', 'Can you trust it?', 'Files that fight back'],
    lessons: MESSY,
  },
  {
    id: 'wrangling',
    name: 'wrangling',
    theme: 't-wrangle',
    blurb: 'Join, stack and reshape tables',
    parts: ['Putting tables together', 'Changing their shape', 'The shop, in pandas'],
    lessons: WRANGLING,
  },
  {
    id: 'timeseries',
    name: 'time series',
    theme: 't-ts',
    blurb: 'Weeks, months and trends over time',
    parts: ['Time as an index', 'Comparing across time'],
    lessons: TIMESERIES,
  },
  {
    id: 'matplotlib',
    name: 'matplotlib',
    theme: 't-mpl',
    blurb: 'Draw anything, control everything',
    parts: ['Your first charts', 'Choosing the right shape', 'Charts that do more'],
    lessons: MATPLOTLIB,
  },
  {
    id: 'seaborn',
    name: 'seaborn',
    theme: 't-sns',
    blurb: 'Beautiful statistical charts, fast',
    parts: ["Seaborn's way", 'Grids and relationships', 'More shapes'],
    lessons: SEABORN,
  },
  {
    id: 'analysis',
    name: 'analysis',
    theme: 't-analysis',
    blurb: 'One question, start to finish',
    parts: ['Before you conclude anything', 'Modelling and telling'],
    lessons: ANALYSIS,
  },
  {
    id: 'stats',
    name: 'statistics',
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
    theme: 't-ml',
    needs: ['scikit-learn'],
    blurb: 'Baselines, pipelines, the right scores, leaks, boosting and tuning',
    parts: ['A model you can trust', 'Measure it properly', 'Predicting numbers'],
    lessons: ML,
  },
  {
    id: 'forecast',
    name: 'Forecasting',
    theme: 't-fc',
    blurb: 'How many calls tomorrow? Baselines, smoothing, models and honest tests',
    parts: ['Before any model', 'Seeing the pattern', 'Forecasting models'],
    lessons: FORECAST,
  },
  {
    id: 'metrics',
    name: 'Business metrics',
    theme: 't-metrics',
    blurb: 'Funnels, retention, lifetime value and A/B tests, the way companies run them',
    parts: ['Measuring a business', 'Keeping customers', 'Running experiments'],
    lessons: METRICS,
  },
  {
    id: 'numpy',
    name: 'NumPy',
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
    theme: 't-ai',
    blurb: 'Models that learn, networks from scratch, text and trial and error',
    parts: ['How machines learn', 'Neural networks, from the inside', 'Beyond labels', 'Better models'],
    lessons: AI,
  },
  {
    // Plain Python, nothing to download. Starts with a quick go at def,
    // for anyone who comes here without the Python course.
    id: 'algo',
    name: 'Algorithms',
    theme: 't-algo',
    blurb: 'Speed, searching, sorting, structures, recursion, graphs and faster code',
    parts: ['Your own functions', 'Counting the work', 'Searching', 'Sorting',
            'Data structures', 'Recursion', 'Graphs, greedy and dynamic programming',
            'Making it faster'],
    lessons: ALGO,
  },
  {
    // lang: the editor speaks SQL (a lesson can override it). needs: SQLite
    // is fetched on the track's first run rather than at boot.
    id: 'sql',
    name: 'SQL',
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
    theme: 't-excel',
    lang: 'excel',
    blurb: 'Formulas on a real sheet: SUMIFS, lookups and lists that spill',
    parts: ['Cells and formulas', 'Copy, lock and decide', 'Count and add by condition', 'Look up, tidy and spill'],
    lessons: EXCEL,
  },
  {
    // lang: the editor holds DAX measures. The engine (js/dax.py) loads the
    // first time a DAX lesson runs; nothing to download beyond that file.
    id: 'dax',
    name: 'DAX',
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
    theme: 't-pbi',
    lang: 'dax',
    blurb: 'Calculated columns, the date table and common patterns',
    parts: ['Columns and the model', 'Patterns on a star schema'],
    lessons: POWERBI,
  },
  {
    id: 'projects',
    name: 'Projects',
    theme: 't-projects',
    blurb: 'One real question, answered with every tool',
    parts: ['Where should the shop grow next?', 'Does the weather move the cafe?',
            'From messy survey to a one-page summary', 'Who should we win back?'],
    // One part per project, however long, so each write-up covers the whole project.
    partSizes: [5, 5, 5, 10],
    lessons: PROJECTS,
  },
];

/* The learning path: the order we'd take everything in, in stages. The
   Tracks screen shows it as numbered steps, and "what's next" (Home, and
   the button after a lesson) walks it.

   A step is a whole track, or a slice of one (`from`, `to`: lesson
   positions). The Python course is split: pandas needs only its first
   seven parts, and eighty lessons of plain Python before any data is a
   long wait. Its later parts (collections, errors and files, classes,
   testing, regex, small programs) come back before AI and Algorithms.
   tests.html checks the path takes in every lesson exactly once. */
const COURSE_SPLIT = 35;          // the end of "Functions in depth", part 7

export const TRACK_GROUPS = [
  { name: 'Start here', note: 'Python itself, from the very first line.', steps: [
    { track: 'basics', to: COURSE_SPLIT, about: 'Parts 1 to 7: first steps, loops, lists, dicts and functions. All pandas needs.' },
  ] },
  // SQL straight after pandas: its lessons ask the pandas track's questions
  // of a database, and one hands its answer back to pandas. Excel asks them
  // again of the same cafe, as the spreadsheet most offices run on.
  { name: 'Ask questions', note: 'The same questions asked three ways: in pandas, in SQL and in Excel.', steps: [
    { track: 'pandas' }, { track: 'sql' }, { track: 'excel' },
  ] },
  { name: 'Clean, reshape and chart', note: 'Fix messy data, join it up, then show it.', steps: [
    { track: 'messy' }, { track: 'wrangling' }, { track: 'matplotlib' }, { track: 'seaborn' },
  ] },
  { name: 'Find the story', note: 'Trends over time, how sure you can be, and the numbers businesses run on.', steps: [
    { track: 'timeseries' }, { track: 'forecast' }, { track: 'stats' }, { track: 'metrics' }, { track: 'analysis' },
  ] },
  { name: 'Report in Power BI', note: 'DAX, data models and the PL-300 exam.', exam: true, steps: [
    { track: 'dax' }, { track: 'pbi' },
  ] },
  { name: 'Put it together', note: 'Real questions, answered with every tool so far.', steps: [{ track: 'projects' }] },
  { name: 'Go further', note: 'More Python, NumPy, AI, machine learning and algorithms.', steps: [
    { track: 'basics', from: COURSE_SPLIT, about: 'Parts 8 to 16: collections, errors and files, classes, testing, regex and small programs.' },
    { track: 'numpy' }, { track: 'ai' }, { track: 'ml' }, { track: 'algo' },
  ] },
];

/* Every track, in the order the path first reaches it: Home's shelf, the
   You ledger and the lesson list all follow it. One left off the path
   still shows, at the end. */
const ON_PATH = [...new Set(TRACK_GROUPS.flatMap((g) => g.steps.map((s) => s.track)))];
export const TRACKS = [
  ...ON_PATH.map((id) => TRACK_LIST.find((t) => t.id === id)).filter(Boolean),
  ...TRACK_LIST.filter((t) => !ON_PATH.includes(t.id)),
];

/* A DAX lesson's matrix rows ride along in its prelude, as _DAX_ROWS.
   Use this wherever a lesson is run, so checks see the same matrix. */
export const lessonPrelude = (lesson) => {
  let prelude = PRELUDE;
  if (lesson.rows) prelude += `\n_DAX_ROWS = ${JSON.stringify(lesson.rows)}\n`;
  // An Excel lesson's sheet and cell ride along the same way, as _XL.
  if (lesson.xl) prelude += `\nimport json as _json\n_XL = _json.loads(${JSON.stringify(JSON.stringify(lesson.xl))})\n`;
  return prelude;
};

/**
 * Break a track into roughly five-lesson parts, split as evenly as possible
 * so you never get a stranded part of one.
 * 20 → 5,5,5,5   11 → 4,4,3   9 → 5,4   6 → 3,3
 */
export function chunkLessons(track) {
  // A track can set its own sizes: Projects keeps each project one part, so
  // its write-up covers the whole thing however long it is.
  if (track.partSizes && track.partSizes.reduce((a, b) => a + b, 0) === track.lessons.length) {
    let at = 0;
    return track.partSizes.map((size, i) => {
      const part = { name: track.parts[i] || `Part ${i + 1}`, start: at, lessons: track.lessons.slice(at, at + size) };
      at += size;
      return part;
    });
  }
  const total = track.lessons.length;
  const count = Math.max(1, Math.ceil(total / 5));
  const base = Math.floor(total / count);
  const extra = total % count;

  const parts = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const size = base + (i < extra ? 1 : 0);
    parts.push({
      name: (track.parts && track.parts[i]) || `Part ${i + 1}`,
      start: cursor,
      lessons: track.lessons.slice(cursor, cursor + size),
    });
    cursor += size;
  }
  return parts;
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
  }))
);

export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);

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

export const trackById = (id) => TRACKS.find((t) => t.id === id);
