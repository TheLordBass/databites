/* The café's things, drawn: the cup that fills through the day, the loyalty
   card, a till receipt and the latte art for a finished track. Each one
   says what it means in plain words beside it; the drawing is the
   decoration, never the only way to read it. */

import { escapeHTML, addTips, helpTip } from './ui.js';
import { store } from './store.js';

let clipN = 0;

/* ── Spare days and big days: their icons, and what they are ─── */

/* A spare day is a voucher: a ticket with a cup on it, a day on the house.
   Drawn in outline with a light tint, so it reads on any background. An
   empty slot is the same ticket in faint dashes, with no cup. */
const TICKET = 'M3 5h18a1.5 1.5 0 0 1 1.5 1.5v3.7a1.8 1.8 0 0 0 0 3.6v3.7A1.5 1.5 0 0 1 21 19H3a1.5 1.5 0 0 1-1.5-1.5v-3.7a1.8 1.8 0 0 0 0-3.6V6.5A1.5 1.5 0 0 1 3 5z';
export const spareIcon = (have = true) => (have
  ? `<svg class="ic ic-spare" viewBox="0 0 24 24" aria-hidden="true">
    <path d="${TICKET}" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/>
    <path d="M16.5 7.2v9.6" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.5 1.5"/>
    <path d="M5.5 9h6.5v2.5a3.25 3.25 0 0 1-6.5 0z" fill="currentColor"/>
    <path d="M12 10h.8a1.6 1.6 0 0 1 0 3.2h-1.2" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <rect x="4.6" y="15.6" width="8.3" height="1.3" rx=".65" fill="currentColor"/></svg>`
  : `<svg class="ic ic-spare is-empty" viewBox="0 0 24 24" aria-hidden="true">
    <path d="${TICKET}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.4 1.8"/></svg>`);

/* A big day is a full cup, steaming: the way today's cup looks on the 14th day in a row. */
export const bigIcon = () => `<svg class="ic ic-big" viewBox="0 0 24 24" aria-hidden="true">
  <g class="ic-steam" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M7.6 2.6c-1.2 1.3 1.2 2.6 0 4"/><path d="M11 1.8c-1.2 1.4 1.2 2.9 0 4.8"/><path d="M14.4 2.6c-1.2 1.3 1.2 2.6 0 4"/></g>
  <path d="M17.6 10.8h.9a2.6 2.6 0 0 1 0 5.2h-1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M4.3 9h13.4v4a5.6 5.6 0 0 1-5.6 5.6h-2.2A5.6 5.6 0 0 1 4.3 13z" fill="currentColor"/>
  <rect x="2.6" y="20.2" width="16.8" height="1.6" rx=".8" fill="currentColor"/></svg>`;

/* A tap does on a phone what hovering does with a mouse: the icons and
   stamps play their little animation once (.is-poked, in styles.css). */
const POKE = '.meta-item, .spare-line, .won-note, .lc-day, .week-day, .day-cup-art, .ach-got';
document.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse') return;
  const el = event.target.closest && event.target.closest(POKE);
  if (!el) return;
  el.classList.remove('is-poked');
  void el.getBoundingClientRect();       // a reflow, so a second tap starts it again (SVGs have no offsetWidth)
  el.classList.add('is-poked');
  clearTimeout(el.pokeTimer);
  el.pokeTimer = setTimeout(() => el.classList.remove('is-poked'), 1300);
}, { passive: true });

/** The spare days held, as vouchers: one per slot, filled or empty. */
export function spareTokens() {
  const { spares } = store.state;
  return `<span class="spare-tokens" aria-label="${spares} of ${store.maxSpares} spare days">${
    Array.from({ length: store.maxSpares }, (_, i) => spareIcon(i < spares)).join('')}</span>`;
}

addTips({
  spare: {
    title: 'Spare days',
    body: [
      'A spare day keeps your streak going when you miss a day.',
      "There's nothing to do with it. Miss a day, and the next time you finish something, a spare day covers the gap by itself. Miss two days and it uses two. Miss more days than you have spares, and the streak starts again.",
      `You can hold ${store.maxSpares} at a time. You get one for 7 days in a row on your loyalty card, and another on a big day (14 in a row).`,
    ],
  },
  big: {
    title: 'Big days',
    body: [
      'A big day is 14 days in a row of finishing something: a lesson, a problem, a Refill or a PL-300 question. Each of those days stamps your loyalty card.',
      `Each big day saves you a spare day, if you have room for one (you can hold ${store.maxSpares}).`,
      "Today's cup on Home fills a little more each day you keep going, and it's full on the big day.",
    ],
  },
});

/* A cup from the side, coffee to `level` (0 to 1), steaming when full. */
export function dayCupSVG(level) {
  const id = `cupfill-${++clipN}`;
  const top = 24 + (1 - Math.max(0, Math.min(1, level))) * 30;
  const full = level >= 1;
  return `<svg class="day-cup-art${full ? ' is-full' : ''}" viewBox="0 0 64 64" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="M14 26 H46 V36 C46 46 39 52 30 52 C21 52 14 46 14 36 Z"/></clipPath></defs>
    <g class="cup-steam" fill="none" stroke-width="2.2" stroke-linecap="round">
      <path style="--d:0s" d="M23 20 C20 16 26 13 23 8"/>
      <path style="--d:.5s" d="M30 20 C27 15 33 12 30 6"/>
      <path style="--d:1s" d="M37 20 C34 16 40 13 37 8"/>
    </g>
    <path class="cup-body" d="M12 24 H48 V36 C48 47 40 54 30 54 C20 54 12 47 12 36 Z"/>
    <g clip-path="url(#${id})">
      <rect class="cup-coffee" x="4" y="${top.toFixed(1)}" width="52" height="40"/>
      ${level > 0 ? `<rect class="cup-crema" x="4" y="${top.toFixed(1)}" width="52" height="2.6"/>` : ''}
    </g>
    <path class="cup-line" d="M12 24 H48 V36 C48 47 40 54 30 54 C20 54 12 47 12 36 Z"/>
    <path class="cup-line" d="M48 29 H51 A6 6 0 0 1 51 41 H47"/>
    <rect class="cup-saucer" x="8" y="57" width="44" height="3" rx="1.5"/>
  </svg>`;
}

/* Today, as a cup filling towards the next big day: 14 days in a row of
   finishing something (the loyalty card's stamps), which saves a spare day
   (store.stampCard). A little more coffee each day you keep going, full
   and steaming on the big day itself. */
export function dayCup() {
  const { run, todayStamped } = store.card();
  const step = store.RUN_DAYS * 2;
  const { spares, spareDay, bigDay } = store.state;
  const day = store.todayCounts().day;
  const big = bigDay === day;
  const into = run % step;                 // days into the run towards the next big day
  const plural = (n) => `${n} day${n === 1 ? '' : 's'}`;
  const line = big
    ? `A big day: ${run} days in a row.${spareDay === day ? ' A spare day saved.' : spares >= store.maxSpares ? ' Your spare days are already full.' : ''}`
    : run === 0
      ? `Finish something today to start a run. ${step} days in a row make a big day.`
      : todayStamped
        ? `${plural(run)} in a row. ${step - into} more day${step - into === 1 ? '' : 's'} for a big day.`
        : `${plural(run)} in a row, up to yesterday. Finish something today to keep it going.`;
  return `<div class="day-cup">
    ${dayCupSVG(big ? 1 : into / step)}
    <div class="day-cup-text">
      <p class="label" style="margin:0">Today</p>
      <p class="day-cup-line">${escapeHTML(line)}</p>
      <p class="day-cup-meta">
        <span class="meta-item">${bigIcon()} Big day ${helpTip('big', 'What is a big day?')}</span>
        <span class="meta-item">${spareTokens()} Spare days ${helpTip('spare', 'What is a spare day?')}</span>
      </p>
    </div>
  </div>`;
}

const CUP_GLYPH = '<path d="M6 9 H18 V13 C18 16.5 15.5 19 12 19 C8.5 19 6 16.5 6 13 Z"/><path d="M18 11 H19.5 A2.5 2.5 0 0 1 19.5 16 H17.6" fill="none"/>';

/* The loyalty card: this week, Monday to Sunday, a cup for each day. A day
   you finish something is stamped. Five this week pays points; 7 days in a
   row saves a spare day and 14 in a row is a big day (store.stampCard). */
const weekday = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'narrow' });
};

export function loyaltyCard() {
  const { days, stamped, full, paid, run, todayStamped } = store.card();
  const need = store.CARD_DAYS;
  const open = days.filter((d) => !d.stamped && (d.today || d.future)).length;
  // The next in-a-row reward: every 7th day a spare day, every 14th a big day.
  const step = store.RUN_DAYS;
  const target = (Math.floor(run / step) + 1) * step;
  const prize = target % (step * 2) === 0 ? 'a big day' : 'a spare day';
  const togo = target - run;
  // One short line each: this week, days in a row, and a footnote.
  const streak = run === 0
    ? `${step} days in a row saves a spare day, and ${step * 2} is a big day, which saves another.`
    : todayStamped
      ? `<b>${run} day${run === 1 ? '' : 's'} in a row.</b> ${togo} more for ${prize}.`
      : `<b>${run} day${run === 1 ? '' : 's'} in a row.</b> Stamp today to keep it going: ${togo} more for ${prize}.`;
  const cups = days.map((d) => `<span class="lc-day${d.today ? ' is-today' : ''}">
      <span class="lc-cup${d.stamped ? ' is-punched' : ''}${d.future ? ' is-ahead' : ''}">
        <svg viewBox="0 0 24 24" aria-hidden="true">${CUP_GLYPH}</svg></span>
      <span class="lc-letter">${escapeHTML(weekday(d.day))}</span>
    </span>`).join('');
  const week = paid
    ? `<b>${stamped} of 7 this week.</b> +${store.CARD_XP} points, paid.`
    : stamped + open < need
      ? `<b>${stamped} of 7 this week.</b> Too few days left for the ${need}-day points this time.`
      : `<b>${stamped} of 7 this week.</b> ${stamped ? '' : 'Finish something today to stamp it. '}${need} days pays +${store.CARD_XP} points.`;
  const foot = `A new card starts on Monday.${full ? ` ${full} filled so far.` : ''}`;
  return `<section class="loyalty" aria-label="Loyalty card: ${stamped} of 7 days this week">
    <div class="lc-head">
      <span class="lc-name">QueryCafe</span>
      <span class="lc-kind">Loyalty card &middot; this week</span>
    </div>
    <div class="lc-cups">${cups}</div>
    <p class="lc-note">${week}</p>
    <p class="lc-note lc-run">${streak}</p>
    <p class="lc-foot">${foot}</p>
  </section>`;
}

/* A till receipt. items: [{ qty, name, end }]; totals: [[left, right]]. */
export function receipt({ title, when, items, more = 0, totals = [], thanks }) {
  return `<div class="receipt">
    <p class="receipt-shop">QueryCafe</p>
    <p class="receipt-meta">${escapeHTML(when)}${title ? ` &middot; ${escapeHTML(title)}` : ''}</p>
    <ul class="receipt-items">
      ${items.length ? items.map((it) => `<li>
        <span class="ri-qty">${escapeHTML(String(it.qty))}</span>
        <span class="ri-name">${escapeHTML(it.name)}</span>
        <span class="ri-end">${escapeHTML(it.end || '')}</span>
      </li>`).join('') : '<li><span class="ri-name">Nothing yet</span></li>'}
      ${more ? `<li class="ri-more"><span class="ri-name">and ${more} more</span></li>` : ''}
    </ul>
    <div class="receipt-totals">
      ${totals.map(([left, right], i) => `<p class="${i === 0 ? 'is-total' : ''}"><span>${escapeHTML(left)}</span><span>${escapeHTML(right)}</span></p>`).join('')}
    </div>
    <p class="receipt-thanks">${escapeHTML(thanks || 'Thank you. See you tomorrow.')}</p>
  </div>`;
}

/* A flat white from above, a heart poured in: for a finished track. */
export function latteArtSVG() {
  return `<svg class="latte-art" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="56" class="la-saucer"/>
    <rect x="96" y="54" width="20" height="12" rx="6" class="la-cup"/>
    <circle cx="60" cy="60" r="40" class="la-cup"/>
    <circle cx="60" cy="60" r="34" fill="#6f4a2e"/>
    <circle cx="60" cy="60" r="32.5" fill="none" stroke="#a8693a" stroke-width="3"/>
    <g class="la-heart">
      <path d="M60 80 C42 66 38 56 44 49 C49 43 57 45 60 52 C63 45 71 43 76 49 C82 56 78 66 60 80 Z" fill="#f6ede0"/>
      <path d="M60 86 L60 56" stroke="#6f4a2e" stroke-width="2.4" stroke-linecap="round"/>
    </g>
  </svg>`;
}
