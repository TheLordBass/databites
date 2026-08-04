import { PRELUDE, COLUMNS } from './prelude.js';
import { PANDAS } from './pandas.js';
import { MATPLOTLIB } from './matplotlib.js';
import { SEABORN } from './seaborn.js';

export { PRELUDE, COLUMNS };

export const TRACKS = [
  {
    id: 'pandas',
    name: 'pandas',
    theme: 't-pandas',
    blurb: 'Shape, filter and summarise tables',
    lessons: PANDAS,
  },
  {
    id: 'matplotlib',
    name: 'matplotlib',
    theme: 't-mpl',
    blurb: 'Draw anything, control everything',
    lessons: MATPLOTLIB,
  },
  {
    id: 'seaborn',
    name: 'seaborn',
    theme: 't-sns',
    blurb: 'Beautiful statistical charts, fast',
    lessons: SEABORN,
  },
];

export const ALL_LESSONS = TRACKS.flatMap((track) =>
  track.lessons.map((lesson, i) => ({ ...lesson, track, index: i }))
);

export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);

export const trackById = (id) => TRACKS.find((t) => t.id === id);
