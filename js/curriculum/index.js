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
    parts: ['First contact', 'Asking questions', 'When data misbehaves', 'Reshaping and loading', 'Going further'],
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
            'Changing data, and text'],
    lessons: SQL,
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
            'Blanks, labels and totals', 'Patterns that come up'],
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
            'From messy survey to a one-page summary'],
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
  { name: 'Start here', note: 'the language itself', steps: [
    { track: 'basics', to: COURSE_SPLIT, about: 'Parts 1 to 7: first steps, loops, lists, dicts and functions. All pandas needs.' },
  ] },
  // SQL straight after pandas: its lessons ask the pandas track's questions
  // of a database, and one hands its answer back to pandas.
  { name: 'Ask questions', note: 'pandas and SQL: the same questions, two ways', steps: [
    { track: 'pandas' }, { track: 'sql' },
  ] },
  { name: 'Clean, reshape and chart', note: 'fix it, join it, show it', steps: [
    { track: 'messy' }, { track: 'wrangling' }, { track: 'matplotlib' }, { track: 'seaborn' },
  ] },
  { name: 'Find the story', note: 'time, uncertainty and analysis', steps: [
    { track: 'timeseries' }, { track: 'stats' }, { track: 'analysis' },
  ] },
  { name: 'Report in Power BI', note: 'DAX, modelling and the PL-300', exam: true, steps: [
    { track: 'dax' }, { track: 'pbi' },
  ] },
  { name: 'Put it together', note: 'every tool, one question', steps: [{ track: 'projects' }] },
  { name: 'Go further', note: 'more Python, AI and algorithms', steps: [
    { track: 'basics', from: COURSE_SPLIT, about: 'Parts 8 to 16: collections, errors and files, classes, testing, regex and small programs.' },
    { track: 'ai' }, { track: 'algo' },
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
export const lessonPrelude = (lesson) =>
  lesson.rows ? `${PRELUDE}\n_DAX_ROWS = ${JSON.stringify(lesson.rows)}\n` : PRELUDE;

/**
 * Break a track into roughly five-lesson parts, split as evenly as possible
 * so you never get a stranded part of one.
 * 20 → 5,5,5,5   11 → 4,4,3   9 → 5,4   6 → 3,3
 */
export function chunkLessons(track) {
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
   Tracks). */
export function openLessons(isDone) {
  const beyond = ALL_LESSONS.some((l) => !isPrimer(l) && isDone(l.id));
  return PATH_LESSONS.filter((l) => !isDone(l.id) && !(beyond && isPrimer(l)));
}

export const firstUndone = (isDone) => openLessons(isDone)[0] || null;

export const trackById = (id) => TRACKS.find((t) => t.id === id);
