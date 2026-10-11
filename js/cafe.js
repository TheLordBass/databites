/* The café's things, drawn: the cup that fills through the day, the loyalty
   card, a till receipt and the latte art for a finished track. Each one
   says what it means in plain words beside it; the drawing is the
   decoration, never the only way to read it. */

import { escapeHTML } from './ui.js';
import { store } from './store.js';

let clipN = 0;

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
      <rect class="cup-coffee" x="10" y="${top.toFixed(1)}" width="40" height="40"/>
      ${level > 0 ? `<rect class="cup-crema" x="10" y="${top.toFixed(1)}" width="40" height="2.6"/>` : ''}
    </g>
    <path class="cup-line" d="M12 24 H48 V36 C48 47 40 54 30 54 C20 54 12 47 12 36 Z"/>
    <path class="cup-line" d="M48 29 H51 A6 6 0 0 1 51 41 H47"/>
    <rect class="cup-saucer" x="8" y="57" width="44" height="3" rx="1.5"/>
  </svg>`;
}

/* Today, as a cup: new lessons and problems out of the three that make a
   big day, which is what saves a spare day (js/game.js). */
export function dayCup() {
  const counts = store.todayCounts();
  const n = (counts.lessons || 0) + (counts.problems || 0);
  const { spares, spareDay } = store.state;
  const saved = spareDay === counts.day;
  const line = n >= 3
    ? `A big day: ${n} new today.${saved ? ' A spare day saved.' : spares >= store.maxSpares ? ' Your spare days are already full.' : ''}`
    : n === 0
      ? 'Nothing new yet today. Three new lessons or problems make a big day, which saves a spare day.'
      : `${n} of 3 new today. ${3 - n} more for a big day, which saves a spare day.`;
  return `<div class="day-cup">
    ${dayCupSVG(Math.min(n, 3) / 3)}
    <div class="day-cup-text">
      <p class="label" style="margin:0">Today</p>
      <p class="day-cup-line">${escapeHTML(line)}</p>
    </div>
  </div>`;
}

const CUP_GLYPH = '<path d="M6 9 H18 V13 C18 16.5 15.5 19 12 19 C8.5 19 6 16.5 6 13 Z"/><path d="M18 11 H19.5 A2.5 2.5 0 0 1 19.5 16 H17.6" fill="none"/>';

/* The loyalty card: ten cups, one punched for every new lesson or problem.
   A full card pays out (store.punchCard). */
export function loyaltyCard() {
  const { filled, full } = store.card();
  const cups = Array.from({ length: 10 }, (_, i) => `<span class="lc-cup${i < filled ? ' is-punched' : ''}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${CUP_GLYPH}</svg></span>`).join('');
  return `<section class="loyalty" aria-label="Loyalty card: ${filled} of 10">
    <div class="lc-head">
      <span class="lc-name">QueryCafe</span>
      <span class="lc-kind">Loyalty card${full ? ` &middot; ${full} filled` : ''}</span>
    </div>
    <div class="lc-cups">${cups}</div>
    <p class="lc-note"><b>${filled} of 10.</b> Every new lesson or practice problem punches one.
      A full card gives you +${store.CARD_XP} XP and a spare day.</p>
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
