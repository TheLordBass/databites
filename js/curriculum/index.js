import { PRELUDE, COLUMNS, DATASETS } from './prelude.js';
import { PANDAS } from './pandas.js';
import { MESSY } from './messy.js';
import { WRANGLING } from './wrangling.js';
import { TIMESERIES } from './timeseries.js';
import { MATPLOTLIB } from './matplotlib.js';
import { SEABORN } from './seaborn.js';
import { ANALYSIS } from './analysis.js';
import { SQL } from './sql.js';

export { PRELUDE, COLUMNS, DATASETS };

/* `parts` names the chunks a track is broken into on its index page.
   A nearer finish line than the whole track — see chunkLessons below. */
export const TRACKS = [
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
    blurb: 'Resample, roll and compare over time',
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
    // lang: the editor speaks SQL (a lesson can override it). needs: SQLite
    // is fetched on the track's first run rather than at boot.
    id: 'sql',
    name: 'SQL',
    theme: 't-sql',
    lang: 'sql',
    needs: ['sqlite3'],
    blurb: 'Ask a database the same questions',
    parts: ['First queries', 'Summing up', 'Dates, joins and subqueries',
            'The shop: many tables', 'Harder questions', 'Windows, and back to pandas'],
    lessons: SQL,
  },
];

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

export const trackById = (id) => TRACKS.find((t) => t.id === id);
