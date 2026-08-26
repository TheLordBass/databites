/* Small DOM helpers. No framework — the app is not big enough to need one. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/** The only markup lesson text is allowed: **bold** and `code`. */
export function inline(text) {
  return escapeHTML(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

/** A hairline progress bar. `pct` 0–1. */
export function meter(pct) {
  return `<div class="meter"><i style="width:${(Math.min(1, pct) * 100).toFixed(1)}%"></i></div>`;
}

/** Zero-padded folio number, the way a book numbers its chapters. */
export const folio = (n) => String(n).padStart(2, '0');

export const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M14 5l-7 7 7 7"/></svg>',
};

let toastTimer;
export function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-on'), 2200);
}

export function buzz(ms = 12) {
  if (navigator.vibrate) try { navigator.vibrate(ms); } catch { /* ignore */ }
}
