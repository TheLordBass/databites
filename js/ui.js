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

/** Hands the learner a file: the share sheet on a phone that can take that
    type (so it can go to Files or Drive), a download everywhere else.
    Returns false only if they cancelled the share sheet. */
export async function saveFile(name, text, type = 'text/plain', { share = true } = {}) {
  const file = new File([text], name, { type });
  // share: false for files a download opens straight into the right app (.ics → calendar).
  if (share && /Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return true;
    } catch (err) {
      if (err && err.name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/** After a pass: the model answer, with the lines yours didn't have marked.
    Nothing when they're the same. Different isn't wrong - this is to see
    another way, not to be graded again. */
export function anotherWay(yours, model) {
  const norm = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (norm(yours).join('\n') === norm(model).join('\n')) return '';
  const mine = new Set(norm(yours));
  const lines = model.replace(/\s+$/, '').split('\n').map((line) => {
    const fresh = line.trim() && !mine.has(line.trim());
    return `<span class="${fresh ? 'is-new' : ''}">${escapeHTML(line) || ' '}</span>`;
  }).join('');
  return `<details class="reveal another" style="margin-top:14px">
      <summary>See another way</summary>
      <div class="reveal-body">
        <p>The model answer. Marked lines are ones yours didn't have. Different isn't wrong:
        look for anything shorter or clearer.</p>
        <pre class="another-code">${lines}</pre>
      </div>
    </details>`;
}

/** Today in the learner's own calendar, as YYYY-MM-DD. */
export function localDay(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buzz(ms = 12) {
  // Chrome refuses (and logs an error) until the page has had a real tap.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  if (navigator.vibrate) try { navigator.vibrate(ms); } catch { /* ignore */ }
}

/** DAX results as real tables, drawn the way a Power BI matrix is: numbers to
    the right, BLANK as an empty cell, and the total row set apart. */
/* A matrix's first measure as horizontal bars, the way a Power BI visual
   would sit beside it. Rows only; the total would dwarf them. */
function matrixChart(b) {
  const value = b.align.findIndex((a, i) => a === 'r' && i > 0);
  if (value === -1) return '';
  const rows = b.rows.slice(0, b.total ? -1 : undefined)
    .map((r) => [r.slice(0, value).filter((v) => v !== null && v !== '').join(' · '), r[value]])
    .filter(([, v]) => v !== null && !Number.isNaN(parseFloat(String(v).replace(/,/g, ''))))
    .slice(0, 20);
  if (rows.length < 2) return '';
  const nums = rows.map(([, v]) => parseFloat(String(v).replace(/,/g, '')));
  const most = Math.max(...nums.map(Math.abs)) || 1;
  const rowH = 24;
  const labelW = 130;
  const barW = 170;
  const bars = rows.map(([label, text], i) => {
    const w = Math.max(1, (Math.abs(nums[i]) / most) * barW);
    const short = label.length > 18 ? `${label.slice(0, 17)}…` : label;
    const y = i * rowH;
    return `<text x="${labelW - 8}" y="${y + 16}" text-anchor="end">${escapeHTML(short)}</text>`
      + `<rect x="${labelW}" y="${y + 5}" width="${w.toFixed(1)}" height="${rowH - 10}"></rect>`
      + `<text x="${labelW + w + 6}" y="${y + 16}">${escapeHTML(text)}</text>`;
  }).join('');
  return `<figure class="matrix-chart">
    <figcaption>${escapeHTML(b.header[value])}</figcaption>
    <svg viewBox="0 0 ${labelW + barW + 80} ${rows.length * rowH}" role="img"
         aria-label="${escapeHTML(b.header[value])} as bars">${bars}</svg>
  </figure>`;
}

export function daxOutput(blocks, { chart = false } = {}) {
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
    return `<div class="matrix-wrap"><table class="matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${note}${
      chart && b.total ? matrixChart(b) : ''}`;
  }).join('');
  return `<div class="out"><div class="out-head">Output</div>${tables}</div>`;
}

/** Charts, printed output and errors from a run, as HTML blocks. */
export function outputBlocks(out, { sql = false } = {}) {
  const parts = [];
  if (out.images && out.images.length) {
    parts.push(`<div class="out">${out.images
      .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart drawn by your code">`).join('')}</div>`);
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
