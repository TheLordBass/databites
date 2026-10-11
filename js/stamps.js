/* A stamp for every finished lesson, like a café loyalty card.

   Each one is drawn from the lesson itself, so no two are alike: its title
   round the top of the ring, its number in the middle under the track's
   motif, and the day it was finished round the bottom. The lesson id picks
   the border (double ring, seal, dashed or dotted) and a slight tilt, and the
   track gives the ink. The worn-ink texture is the #stamp-ink filter in
   index.html, shared by every stamp on the page. */

import { escapeHTML } from './ui.js';

// One small line drawing per track, on a 24 × 24 grid, drawn in the track's ink.
const MOTIF = {
  basics: '<path d="M9 4C7 4 6 5 6 7v2c0 1.3-.8 2.5-2 3 1.2.5 2 1.7 2 3v2c0 2 1 3 3 3M15 4c2 0 3 1 3 3v2c0 1.3.8 2.5 2 3-1.2.5-2 1.7-2 3v2c0 2-1 3-3 3"/>',
  pandas: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M4 15h16M10 5v14"/>',
  messy: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  wrangling: '<path d="M6 4v4c0 3.5 6 4.5 6 8v4M18 4v4c0 3.5-6 4.5-6 8"/>',
  timeseries: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  matplotlib: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4 3 3 5-6"/>',
  seaborn: '<circle cx="7" cy="16" r="1.6"/><circle cx="11" cy="11" r="1.6"/><circle cx="15" cy="13" r="1.6"/><circle cx="18" cy="7" r="1.6"/><path d="M4 20h16"/>',
  analysis: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  stats: '<path d="M3 18c3.5 0 4.5-11 9-11s5.5 11 9 11M3 18h18"/>',
  ai: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4M18 8.2v7.6"/>',
  algo: '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v4M12 11l-5 5M12 11l5 5"/>',
  sql: '<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"/>',
  dax: '<path d="M17.5 5H6.5l6 7-6 7h11"/>',
  pbi: '<circle cx="12" cy="12" r="2.6"/><path d="M12 9.4V4M12 14.6V20M9.4 12H4M14.6 12H20"/>',
  projects: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>',
  numpy: '<circle cx="6" cy="6" r="1.7"/><circle cx="12" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7"/><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/><circle cx="6" cy="18" r="1.7"/><circle cx="12" cy="18" r="1.7"/><circle cx="18" cy="18" r="1.7"/>',
  metrics: '<path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 17l4.5-5.5"/><path d="M3 20h18"/>',
  forecast: '<path d="M3 18l4.5-5 4 3"/><path d="M11.5 16l9-9" stroke-dasharray="2.2 2.6"/>',
  ml: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2"/>',
  excel: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16"/><rect x="10.6" y="10.6" width="2.8" height="2.8"/>',
};

const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};

// Every stamp needs its own path ids for the text that follows its ring.
let uid = 0;

const dayLabel = (day) => {
  if (!day) return '';
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
};

// Scalloped edge for the seal: a circle of little bumps.
const seal = (() => {
  const bumps = 26;
  const parts = [];
  for (let i = 0; i <= bumps * 2; i++) {
    const a = (i / (bumps * 2)) * Math.PI * 2;
    const r = i % 2 ? 54 : 57.5;
    parts.push(`${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${parts.join(' ')}" stroke-width="2.4" stroke-linejoin="round"/>`;
})();

const BORDERS = [
  '<circle cx="60" cy="60" r="56" stroke-width="3"/><circle cx="60" cy="60" r="50" stroke-width="1.2"/>',
  `${seal}<circle cx="60" cy="60" r="49" stroke-width="1.2"/>`,
  '<circle cx="60" cy="60" r="56" stroke-width="2.6" stroke-dasharray="7 4"/><circle cx="60" cy="60" r="50" stroke-width="1.2"/>',
  '<circle cx="60" cy="60" r="56" stroke-width="2.6"/><circle cx="60" cy="60" r="51.5" stroke-width="1.6" stroke-dasharray="0.1 4.2" stroke-linecap="round"/>',
];

/** The stamp for a finished lesson, as SVG. `day` is when it was finished
    (YYYY-MM-DD). Coloured with currentColor: put it inside the track's theme. */
export function stampSVG(lesson, day) {
  const h = hash(lesson.id);
  const id = `stamp${++uid}`;
  const tilt = ((h % 25) - 12) * 1.1;                 // -13 to +13 degrees
  const title = lesson.title.toUpperCase();
  // Fit the title on about 220 degrees of the ring; a long one gets smaller
  // letters, and past a point is squeezed to fit rather than run round.
  const arc = 146;
  const size = Math.max(6.4, Math.min(9.4, arc / (title.length * 0.66)));
  const squeeze = title.length * size * 0.66 > arc ? ` textLength="${arc}" lengthAdjust="spacingAndGlyphs"` : '';
  const motif = MOTIF[lesson.track.id] || MOTIF.projects;
  const label = `Stamp: ${lesson.track.name} ${lesson.index + 1}, ${lesson.title}${day ? `, ${dayLabel(day)}` : ''}`;
  return `<svg class="stamp" viewBox="0 0 120 120" role="img" aria-label="${escapeHTML(label)}">
  <defs>
    <path id="${id}t" d="M60,98 A38,38 0 1 1 60,22 A38,38 0 1 1 60,98"/>
    <path id="${id}b" d="M15,60 A45,45 0 0 0 105,60"/>
  </defs>
  <g transform="rotate(${tilt.toFixed(1)} 60 60)" filter="url(#stamp-ink)">
    <g fill="none" stroke="currentColor">${BORDERS[h % BORDERS.length]}</g>
    <text class="stamp-ring" font-size="${size.toFixed(2)}"><textPath href="#${id}t" startOffset="50%" text-anchor="middle"${squeeze}>${escapeHTML(title)}</textPath></text>
    <g transform="translate(50 33) scale(.84)" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${motif}</g>
    <text class="stamp-n" x="60" y="80" text-anchor="middle">${lesson.index + 1}</text>
    <text class="stamp-day"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${escapeHTML(dayLabel(day))}</textPath></text>
  </g>
</svg>`;
}

/** A small stamp for a finished lesson's row: the track's motif in a ring,
    tilted like the big one. */
export function miniStampSVG(lesson) {
  const h = hash(lesson.id);
  const tilt = ((h % 25) - 12) * 1.1;
  const motif = MOTIF[lesson.track.id] || MOTIF.projects;
  return `<svg class="stamp-mini" viewBox="0 0 28 28" role="img" aria-label="Done">
  <g transform="rotate(${tilt.toFixed(1)} 14 14)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="14" r="12.5" stroke-width="1.8"/>
    <g transform="translate(6.8 6.8) scale(.6)" stroke-width="2.4">${motif}</g>
  </g>
</svg>`;
}
