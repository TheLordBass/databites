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

/** Progress ring. `size` in px, `pct` 0–1. */
export function ring(pct, size = 50, stroke = 4) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"/>
    <circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
      stroke-dasharray="${c.toFixed(1)}"
      stroke-dashoffset="${(c * (1 - Math.min(1, pct))).toFixed(1)}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}

export const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
  play:  '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
  retry: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 11-2.3-5.7M20 4v4h-4"/></svg>',
  dice:  '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
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
