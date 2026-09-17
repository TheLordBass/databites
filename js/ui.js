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

/** One mark per lesson, filled as you go — progress you can count at a glance.
    Past `max` marks (a narrow column, or 100 problems) each mark stands for a
    few items. The first lights as soon as anything is done and the last only
    when everything is, so the tally never reads as zero or as finished early. */
export function tally(done, total, extraClass = '', max = Infinity) {
  let count = total;
  let lit = done;
  if (total > max) {
    const per = Math.ceil(total / max);
    count = Math.ceil(total / per);
    lit = done >= total ? count : Math.min(count - 1, Math.ceil(done / per));
  }
  const marks = Array.from({ length: count }, (_, i) =>
    `<i class="${i < lit ? 'on' : ''}"></i>`).join('');
  return `<div class="tally ${extraClass}">${marks}</div>`;
}

/** Counts a number up. Small thing, but the movement is the point. */
export function countUp(node, to, ms = 700) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.textContent = to;
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = Math.round(to * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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

/** DAX results as real tables, drawn the way a Power BI matrix is: numbers to
    the right, BLANK as an empty cell, and the total row set apart. */
export function daxOutput(blocks) {
  const tables = blocks.map((b) => {
    if (b.text !== undefined) return `<pre class="out-body">${escapeHTML(b.text)}</pre>`;
    const num = (i) => (b.align[i] === 'r' ? ' class="num"' : '');
    const last = b.rows.length - 1;
    const head = b.header.map((h, i) => `<th${num(i)} scope="col">${escapeHTML(h)}</th>`).join('');
    const body = b.rows.map((row, j) => `<tr${b.total && j === last ? ' class="is-total"' : ''}>${
      row.map((v, i) => `<td${num(i)}>${v === null ? '' : escapeHTML(v)}</td>`).join('')}</tr>`).join('');
    const shown = b.total ? b.count - 1 : b.count;          // the total row isn't a row of data
    const note = b.total ? '' : `<p class="matrix-note">${shown} row${shown === 1 ? '' : 's'}${
      b.rows.length < b.count ? `, the first ${b.rows.length} shown` : ''}</p>`;
    return `<div class="matrix-wrap"><table class="matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${note}`;
  }).join('');
  return `<div class="out"><div class="out-head">Output</div>${tables}</div>`;
}

/** Charts, printed output and errors from a run, as HTML blocks. */
export function outputBlocks(out, { sql = false } = {}) {
  const parts = [];
  if (out.images && out.images.length) {
    parts.push(`<div class="out">${out.images
      .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart">`).join('')}</div>`);
  }
  const text = (out.stdout || '').trim();
  if (text) {
    parts.push(`<div class="out"><div class="out-head">Output</div>
      <pre class="out-body">${escapeHTML(text)}</pre></div>`);
  }
  if (!out.ok) {
    parts.push(`<div class="out">
      <div class="out-head" style="color:var(--accent)">${out.timedOut ? 'Time limit exceeded' : sql ? 'The database said no' : 'Python stopped here'}</div>
      <pre class="out-body is-err">${escapeHTML(out.error || '')}</pre></div>`);
  }
  return parts;
}
