import { PRELUDE, COLUMNS, DATASETS } from './prelude.js';
import { BASICS } from './basics.js';
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

export { PRELUDE, COLUMNS, DATASETS };

/* `parts` names the chunks a track is broken into on its index page.
   A nearer finish line than the whole track — see chunkLessons below. */
export const TRACKS = [
  {
    // primer: for someone who has never coded. Once lessons elsewhere are
    // done, "what's next" skips it (see firstUndone); it stays on Tracks.
    id: 'basics',
    name: 'Python basics',
    theme: 't-basics',
    primer: true,
    blurb: 'Never coded? Start here',
    parts: ['Values and names', 'Tools and choices'],
    lessons: BASICS,
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
    blurb: 'Clean up what someone else exported',
    parts: ['Reading the damage', 'Making it usable'],
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
    parts: ['How machines learn', 'Neural networks, from the inside', 'Beyond labels'],
    lessons: AI,
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
  { name: 'Python', note: 'first steps to AI', ids: ['basics', 'pandas', 'messy', 'wrangling', 'timeseries', 'matplotlib', 'seaborn', 'analysis', 'stats', 'ai'] },
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

/* Lessons worth offering: the ones not done. The primer is for people
   starting from nothing, so once any lesson outside it is done, it isn't
   pushed at them any more (it stays on Tracks). */
export function openLessons(isDone) {
  const beyond = ALL_LESSONS.some((l) => !l.track.primer && isDone(l.id));
  return ALL_LESSONS.filter((l) => !isDone(l.id) && !(beyond && l.track.primer));
}

export const firstUndone = (isDone) => openLessons(isDone)[0] || null;

export const trackById = (id) => TRACKS.find((t) => t.id === id);
