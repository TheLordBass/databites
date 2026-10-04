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

/* `parts` names the chunks a track is broken into on its index page.
   A nearer finish line than the whole track — see chunkLessons below. */
export const TRACKS = [
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
    blurb: 'Uncertainty, intervals and honest tests',
    parts: ['Describing and sampling', 'Comparing groups'],
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

/* How the Tracks screen groups them: by what you'd be using at work. */
export const TRACK_GROUPS = [
  { name: 'Python', note: 'first steps to AI and algorithms', ids: ['basics', 'pandas', 'messy', 'wrangling', 'timeseries', 'matplotlib', 'seaborn', 'analysis', 'stats', 'ai', 'algo'] },
  { name: 'SQL', note: 'querying databases', ids: ['sql'] },
  { name: 'Power BI', note: 'DAX and modelling', ids: ['dax', 'pbi'], exam: true },
  { name: 'Put it together', note: 'every tool, one question', ids: ['projects'] },
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

/* Lessons worth offering: the ones not done. Once any lesson outside the
   primer is done, the primer isn't pushed any more (it stays on Tracks). */
export function openLessons(isDone) {
  const beyond = ALL_LESSONS.some((l) => !isPrimer(l) && isDone(l.id));
  return ALL_LESSONS.filter((l) => !isDone(l.id) && !(beyond && isPrimer(l)));
}

export const firstUndone = (isDone) => openLessons(isDone)[0] || null;

export const trackById = (id) => TRACKS.find((t) => t.id === id);
