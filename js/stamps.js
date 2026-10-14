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

/* ── Achievement stamps ──────────────────────────────────────
   Every achievement has a stamp of its own: its own drawing (or a track's,
   where it's that track's first), its own ink (a track's colour, or nude for
   the streaks and the cups), a figure under the drawing where it counts
   something, and, like the lesson stamps, its name round the top, the day it
   was earned round the bottom, and a border and tilt from its id. */

const FLAG = '<path d="M3 20l6-8 3.5 4 2.5-3 6 7z"/><path d="M12 16V4l6 2.5-6 2.5"/>';
const ACH = {
  'first-lesson': { ink: 't-basics', motif: '<ellipse cx="8.5" cy="15" rx="2.6" ry="4"/><ellipse cx="15.5" cy="9" rx="2.6" ry="4"/><path d="M7 21h3M14 15h3"/>' },
  'first-chart': { ink: 't-mpl', motif: MOTIF.matplotlib },
  'first-join': { ink: 't-sql', motif: '<circle cx="9" cy="12" r="5.5"/><circle cx="15" cy="12" r="5.5"/>' },
  'first-calculate': { ink: 't-dax', motif: '<path d="M8 4H5v16h3M16 4h3v16h-3"/><path d="M14.5 8h-5l3 4-3 4h5"/>' },
  'first-regex': { ink: 't-messy', motif: '<path d="M12 4v9M8 6.2l8 4.6M16 6.2l-8 4.6"/><circle cx="12" cy="19" r="1.5"/>' },
  'first-test': { ink: 't-algo', motif: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12.5l3 3 5.5-6.5"/>' },
  'first-model': { ink: 't-ai', motif: MOTIF.ai },
  'boss-1': { ink: 't-projects', motif: '<path d="M5 16a7 7 0 0 1 14 0z"/><path d="M12 9V7M10.5 7h3M3 19h18"/>' },
  'boss-all': { ink: 't-pbi', mark: 'ALL', motif: '<path d="M4 17l1.5-10 4.5 5 2-7 2 7 4.5-5L20 17z"/><path d="M4 20h16"/>' },
  'mini-1': { ink: 't-sns', motif: '<ellipse cx="12" cy="7.5" rx="3.6" ry="4.6"/><path d="M12 12v9"/>' },
  'mini-5': { ink: 't-ts', mark: '5', motif: '<path d="M3.5 9h4v6a2 2 0 0 1-4 0zM10 7h4v8a2 2 0 0 1-4 0zM16.5 9h4v6a2 2 0 0 1-4 0z"/><path d="M2 20h20"/>' },
  'mini-all': { ink: 't-analysis', mark: 'ALL', motif: '<path d="M5 3.5l4.5 1-1.2 6a2.6 2.6 0 0 1-5-1.2zM19 3.5l-4.5 1 1.2 6a2.6 2.6 0 0 0 5-1.2z"/><path d="M5.6 10.6L4.5 19M18.4 10.6L19.5 19M2.5 19.5h4M17.5 19.5h4"/>' },
  'problem-1': { ink: 't-pandas', motif: '<path d="M9 17h6M10 20h4M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z"/>' },
  'problems-25': { ink: 't-sql', mark: '25', motif: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>' },
  'clean-hard': { ink: 't-algo', motif: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M10 4L8 9l4 11 4-11-2-5"/>' },
  algorithms: { ink: 't-numpy', motif: '<circle cx="12" cy="12" r="7"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5"/><circle cx="12" cy="12" r="1.4"/>' },
  'run-5': { ink: 't-fc', mark: '5', motif: '<path d="M13.5 3L5.5 13h6l-1.5 8 8.5-10.5h-6z"/>' },
  'run-15': { ink: 't-metrics', mark: '15', motif: '<circle cx="11" cy="13" r="7"/><circle cx="11" cy="13" r="3"/><path d="M11 13l9-9M16.5 4H20v3.5"/>' },
  'streak-7': { ink: 'ink-nude', mark: '7', motif: '<path d="M12 21c-3.8 0-6.5-2.6-6.5-6 0-3.6 3-5.6 3.5-9.5 2.6 1.6 3.6 4.2 3.6 6.3 1-1 1.5-2.3 1.5-3.6 2.2 1.9 3.4 4.4 3.4 6.8 0 3.4-2.4 6-5.5 6z"/>' },
  'streak-30': { ink: 'ink-nude', mark: '30', motif: '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>' },
  'quest-1': { ink: 't-excel', motif: '<path d="M5 3h14v12H5z"/><path d="M8 21l2-6M16 21l-2-6M8 7h8M8 11h5"/>' },
  'quest-10': { ink: 'ink-nude', mark: '10', motif: '<path d="M5 9h12v4a6 6 0 0 1-12 0z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.9"/><path d="M9 3.5c-1 1 1 2 0 3M13 3.5c-1 1 1 2 0 3"/>' },
  'recall-10': { ink: 't-r', mark: '10', motif: '<path d="M9 3h6l-1 6 3 3H7l3-3z"/><path d="M12 12v9"/>' },
  'tested-out': { ink: 't-wrangle', motif: '<path d="M3.5 6l7.5 6-7.5 6zM12 6l7.5 6-7.5 6z"/>' },
  'mock-pass': { ink: 't-pbi', mark: '70%', motif: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v4.5c3 2.6 9 2.6 12 0V11M22 9v6"/>' },
  'rank-analyst': { ink: 't-analysis', mark: '5', motif: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M8.5 10.5l3.5 3 3.5-3"/>' },
  'rank-head': { ink: '', mark: '13', motif: '<path d="M7 14a4 4 0 0 1-.6-7.9 5.6 5.6 0 0 1 11.2 0A4 4 0 0 1 17 14z"/><path d="M7 14v6h10v-6M7 17h10"/>' },
};
// The stages: a flag on a hill, each its own number, ink and border.
const STAGE_INK = ['t-basics', 't-pandas', 't-wrangle', 't-stats', 't-pbi', 't-projects', 't-ml'];
const achStyle = (id) => {
  const stage = /^stage-(\d+)$/.exec(id);
  if (stage) return { ink: STAGE_INK[(Number(stage[1]) - 1) % STAGE_INK.length], mark: stage[1], motif: FLAG };
  return ACH[id] || { ink: '', motif: MOTIF.projects };
};

/** An earned achievement's stamp, as SVG: `day` is when it was earned. */
export function achStampSVG(a, day) {
  const s = achStyle(a.id);
  const h = hash(a.id);
  const id = `stamp${++uid}`;
  const tilt = ((h % 25) - 12) * 1.1;
  const title = a.name.toUpperCase();
  const arc = 146;
  const size = Math.max(6.4, Math.min(9.4, arc / (title.length * 0.66)));
  const squeeze = title.length * size * 0.66 > arc ? ` textLength="${arc}" lengthAdjust="spacingAndGlyphs"` : '';
  // With a figure under it, the drawing sits above it, a little bigger than a lesson stamp's;
  // without one, it's bigger and in the middle.
  const place = s.mark ? 'translate(47.4 28) scale(1.05)' : 'translate(44.4 44.4) scale(1.3)';
  const label = `Stamp: ${a.name}${day ? `, ${dayLabel(day)}` : ''}`;
  return `<svg class="stamp ach-stamp ${s.ink}" viewBox="0 0 120 120" role="img" aria-label="${escapeHTML(label)}">
  <defs>
    <path id="${id}t" d="M60,98 A38,38 0 1 1 60,22 A38,38 0 1 1 60,98"/>
    <path id="${id}b" d="M15,60 A45,45 0 0 0 105,60"/>
  </defs>
  <g transform="rotate(${tilt.toFixed(1)} 60 60)" filter="url(#stamp-ink)">
    <g fill="none" stroke="currentColor">${BORDERS[(h >>> 3) % BORDERS.length]}</g>
    <text class="stamp-ring" font-size="${size.toFixed(2)}"><textPath href="#${id}t" startOffset="50%" text-anchor="middle"${squeeze}>${escapeHTML(title)}</textPath></text>
    <g transform="${place}" fill="none" stroke="currentColor" stroke-width="${s.mark ? 1.9 : 1.7}" stroke-linecap="round" stroke-linejoin="round">${s.motif}</g>
    ${s.mark ? `<text class="stamp-n${s.mark.length > 2 ? ' is-word' : ''}" x="60" y="80" text-anchor="middle">${escapeHTML(s.mark)}</text>` : ''}
    <text class="stamp-day"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${escapeHTML(dayLabel(day))}</textPath></text>
  </g>
</svg>`;
}

/** One still to earn: its drawing in a faint dashed ring, waiting for ink. */
export function achGhostSVG(a) {
  const s = achStyle(a.id);
  return `<svg class="stamp-ghost" viewBox="0 0 28 28" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="14" r="12.5" stroke-width="1.4" stroke-dasharray="2.4 2.6"/>
    <g transform="translate(6.8 6.8) scale(.6)" stroke-width="2.2">${s.motif}</g>
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
