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
    `<i class="${i < lit ? 'on' : ''}" style="--i:${i}"></i>`).join('');   // --i: its place in the hover wave
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

/** A burst of coffee beans out of `from` (the reward box), for a right
    answer, with a few scraps of paper in the tracks' inks. Drawn on a canvas
    laid over the page for about a second and a half, then removed; it never
    takes a tap. Nothing at all when the device asks for less motion. Starts a
    moment late, once the result has scrolled into view. */
export function confetti(from, { count = 70, delay = 220 } = {}) {
  if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setTimeout(() => {
    const box = from.getBoundingClientRect();
    if (!from.isConnected || !box.width) return;
    const css = getComputedStyle(document.documentElement);
    const read = (names) => names.map((name) => css.getPropertyValue(name).trim()).filter(Boolean);
    const beans = read(['--bean-1', '--bean-2', '--bean-3']);
    const inks = read(['--accent', '--t-pandas', '--t-sql', '--t-dax', '--t-basics', '--t-messy']);
    const crease = css.getPropertyValue('--paper-2').trim() || '#fff';
    const w = innerWidth;
    const h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    document.body.append(canvas);
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);

    // Out of the top of the box, fanned upwards, then falling like paper.
    const top = Math.min(Math.max(box.top, 40), h - 80);    // on screen, even mid-scroll
    // Three in four are beans; the rest paper scraps in the tracks' inks.
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const bits = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 7 + Math.random() * 9;
      const bean = beans.length && (!inks.length || Math.random() < 0.75);
      return {
        x: box.left + box.width * (0.2 + Math.random() * 0.6),
        y: top + Math.random() * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        bean,
        w: bean ? 7 + Math.random() * 3 : 5 + Math.random() * 5,
        h: bean ? 10 + Math.random() * 3 : 8 + Math.random() * 7,
        spin: Math.random() * Math.PI,
        vspin: (Math.random() - 0.5) * 0.35,
        flip: Math.random() * Math.PI,
        vflip: 0.1 + Math.random() * 0.15,
        ink: bean ? pick(beans) : pick(inks),
      };
    });

    const life = 1700;
    const start = performance.now();
    let last = start;
    const frame = (now) => {
      const t = now - start;
      // Steps are per 60th of a second, so a 120 Hz screen doesn't run it double speed.
      const k = Math.min(3, (now - last) / 16.7);
      last = now;
      g.clearRect(0, 0, w, h);
      g.globalAlpha = t < life * 0.6 ? 1 : Math.max(0, 1 - (t - life * 0.6) / (life * 0.4));
      for (const b of bits) {
        b.vx *= Math.pow(0.975, k);
        b.vy = b.vy * Math.pow(0.975, k) + 0.32 * k;     // air, then gravity
        b.x += b.vx * k;
        b.y += b.vy * k;
        b.spin += b.vspin * k;
        b.flip += b.vflip * k;
        g.save();
        g.translate(b.x, b.y);
        g.rotate(b.spin);
        g.scale(1, Math.cos(b.flip));                   // the flutter of a turning scrap
        g.fillStyle = b.ink;
        if (b.bean) {
          // an oval with the bean's crease down the middle
          g.beginPath();
          g.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
          g.fill();
          g.beginPath();
          g.moveTo(0, -b.h / 2 + 1.5);
          g.quadraticCurveTo(b.w * 0.3, 0, 0, b.h / 2 - 1.5);
          g.strokeStyle = crease;
          g.globalAlpha *= 0.7;
          g.lineWidth = 1.3;
          g.stroke();
        } else {
          g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        }
        g.restore();
      }
      if (t < life) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }, delay);
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
/* ── "?" tips ──────────────────────────────────────────────
   A small round ? beside something that needs explaining. Tapping it opens
   a card just under it (above, if there's no room below) saying what the
   thing is and how it works; tapping away, Escape, scrolling or moving to
   another screen closes it. The words live in TIPS, registered by whoever
   owns them (js/cafe.js for spare days and big days). */
const TIPS = {};
export const addTips = (tips) => Object.assign(TIPS, tips);

export function helpTip(key, label) {
  return `<button type="button" class="tip-q" data-tip="${escapeHTML(key)}" aria-label="${escapeHTML(label)}"
    aria-expanded="false">?</button>`;
}

let tipFor = null;
let tipCard = null;

function closeTip() {
  if (!tipFor) return;
  tipFor.setAttribute('aria-expanded', 'false');
  tipFor = null;
  if (tipCard) tipCard.hidden = true;
}

function openTip(button) {
  const tip = TIPS[button.dataset.tip];
  if (!tip) return;
  if (!tipCard) {
    tipCard = document.createElement('div');
    tipCard.className = 'tip-card';
    tipCard.id = 'tip-card';
    tipCard.setAttribute('role', 'dialog');
    document.body.append(tipCard);
  }
  tipCard.innerHTML = `<p class="tip-title">${escapeHTML(tip.title)}</p>${tip.body.map((p) => `<p>${escapeHTML(p)}</p>`).join('')}`;
  tipCard.setAttribute('aria-label', tip.title);
  tipCard.hidden = false;
  const r = button.getBoundingClientRect();
  const width = Math.min(300, window.innerWidth - 24);
  tipCard.style.width = `${width}px`;
  tipCard.style.left = `${Math.max(12, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 12))}px`;
  const below = r.bottom + 8;
  tipCard.style.top = below + tipCard.offsetHeight < window.innerHeight - 8
    ? `${below}px` : `${Math.max(8, r.top - 8 - tipCard.offsetHeight)}px`;
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-controls', 'tip-card');
  tipFor = button;
}

/** Once, at start-up: every ? in the app, wherever it's drawn. */
export function wireTips() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tip]');
    if (button) {
      event.stopPropagation();
      const same = button === tipFor;
      closeTip();
      if (!same) openTip(button);
      return;
    }
    if (tipFor && !event.target.closest('.tip-card')) closeTip();
  }, true);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeTip(); });
  window.addEventListener('scroll', closeTip, true);
  window.addEventListener('hashchange', closeTip);
  window.addEventListener('resize', closeTip);
}

/** After a run: your code and what it gave back, in view together. The
    page is the only thing that scrolls, so it brings whichever of the two
    starts higher to the top of the screen: the code, with the output under
    it, when they're stacked; the output, when it sits beside the lesson. */
export function showResult(mount, result) {
  const code = mount.querySelector('.l-code');
  const first = code && code.getBoundingClientRect().top <= result.getBoundingClientRect().top ? code : result;
  first.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

export function anotherWay(yours, model) {
  const norm = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (norm(yours).join('\n') === norm(model).join('\n')) return '';
  const mine = new Set(norm(yours));
  // Yours already has every line of it (plus extras of your own): nothing new to see.
  if (norm(model).every((line) => mine.has(line))) return '';
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

/** "2024-03-05" as "5 Mar", with month names in the learner's own language. */
export function shortDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
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

/** DAX results as real tables, drawn the way a Power BI matrix is: numbers to
    the right, BLANK as an empty cell, and the total row set apart. */
export function daxOutput(blocks, { chart = false } = {}) {
  const tables = blocks.map((b) => {
    if (b.text !== undefined) return `<pre class="out-body">${escapeHTML(b.text)}</pre>`;
    if (b.sheet) return sheetGrid(b);
    return matrixTable(b, { chart });
  }).join('');
  return `<div class="out"><div class="out-head">Output</div>${tables}</div>`;
}

/** One DAX table or matrix, with its row count (or its total row). */
export function matrixTable(b, { chart = false } = {}) {
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
}

/* An Excel result, drawn as the sheet looks: column letters across the top,
   row numbers down the side, row 1 holding the headings, the formula in a
   formula bar above, and the cells it filled tinted. */
function sheetGrid(b) {
  const mark = new Set(b.mark || []);
  // A preview outlines the one cell the formula goes in: b.target is [row, column] in b.rows.
  const [tRow, tCol] = b.target || [-1, -1];
  const cls = (i, extra = '') => {
    const names = [extra, b.align[i] === 'r' ? 'num' : '', mark.has(i) ? 'is-mark' : ''].filter(Boolean).join(' ');
    return names ? ` class="${names}"` : '';
  };
  const head = b.header.map((h, i) => (i === 0
    ? '<th class="sheet-corner" aria-label="Row"></th>'
    : `<th scope="col"${cls(i, 'sheet-col')}>${escapeHTML(h)}</th>`)).join('');
  // Row 1 holds headings: always left-aligned, whatever the column below holds.
  const td = (v, i, heads, target) => `<td${target ? ' class="is-target"' : heads ? (mark.has(i) ? ' class="is-mark"' : '') : cls(i)}>${v === null ? '' : escapeHTML(v)}</td>`;
  const body = b.rows.map((row, r) => `<tr${row[0] === '1' ? ' class="sheet-heads"' : ''}>${row.map((v, i) => (i === 0
    ? `<th scope="row" class="sheet-row">${escapeHTML(v)}</th>`
    : td(v, i, row[0] === '1', r === tRow && i === tCol))).join('')}</tr>`).join('');
  const fx = b.fx ? `<div class="fx-bar"><span class="fx-cell">${escapeHTML(b.fx.cell)}</span><span class="fx-sign" aria-hidden="true">fx</span>${b.fx.formula ? `<code class="fx-formula">${escapeHTML(b.fx.formula)}</code>` : `<span class="fx-hint">${escapeHTML(b.fx.hint || '')}</span>`}</div>` : '';
  const tab = b.tab ? `<p class="sheet-tab"><span>Sheet</span> ${escapeHTML(b.tab)}</p>` : '';
  return `${tab}${b.span ? sheetSpan(b.span) : ''}${fx}<div class="matrix-wrap"><table class="matrix is-sheet${b.compact ? ' is-compact' : ''}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${
    b.note ? `<p class="matrix-note">${escapeHTML(b.note)}</p>` : ''}`;
}

/** Where a sheet's data is, in words: "rows 2 to 121". */
export const dataRows = (span) => (span.rows === 1 ? 'row 2' : `rows 2 to ${span.last}`);

/* Above a preview: how many rows of data the sheet has and each column's
   whole range, so writing D2:D121 never means counting rows. The hidden
   tests keep every sheet's length, so these hold for them too. */
function sheetSpan(s) {
  if (!s.rows) return '<div class="sheet-span"><p class="sheet-count">No data under the headings yet.</p></div>';
  const range = (c) => (s.rows === 1 ? `${c}2` : `${c}2:${c}${s.last}`);
  return `<div class="sheet-span">
    <p class="sheet-count"><b>${s.rows} row${s.rows === 1 ? '' : 's'} of data</b>, in ${dataRows(s)}, so each column's data is:</p>
    <ul class="sheet-ranges">${s.cols.map(([c, h]) => `<li><code>${range(c)}</code> ${escapeHTML(h)}</li>`).join('')}</ul>
  </div>`;
}

/** Excel sheets as they look, with no "Output" frame round them: the
    previews of a sheet before any formula (js/excel.py, _excel_peek). */
export const sheetPreview = (blocks, { framed = true } = {}) =>
  (blocks || []).map((b) => (framed ? `<div class="xl-peek">${sheetGrid(b)}</div>` : sheetGrid(b))).join('');

/** On a phone a sheet is wider than the screen, and the outlined cell is
    usually past the data, on the right. Scroll each preview just far enough
    to show it; the columns before it are a swipe away. */
export function showTarget(root) {
  root.querySelectorAll('.matrix-wrap').forEach((wrap) => {
    const cell = wrap.querySelector('.is-target');
    if (!cell) return;
    const right = cell.offsetLeft + cell.offsetWidth + 12;
    if (right > wrap.clientWidth) wrap.scrollLeft = right - wrap.clientWidth;
  });
}

/* A DataFrame, a Series or an SQL result, drawn as a grid, the way pandas
   shows one in a notebook and SQL Server shows its results: column names
   across, the index (or row numbers, for SQL) down, values as pandas prints
   them, and "…" where pandas would cut a long table short. The worker notes
   these as it runs (result.grids). */
export function frameGrid(g) {
  const num = (j) => (g.num[j] ? ' class="num"' : '');
  const gapCell = (tag, j) => (j === g.gapCol ? `<${tag} class="grid-gap">…</${tag}>` : '');
  const head = g.header.map((h, j) => `${gapCell('th', j)}<th scope="col"${num(j)}>${escapeHTML(h)}</th>`).join('');
  const width = g.header.length + (g.gapCol === null || g.gapCol === undefined ? 0 : 1);
  const gapRow = `<tr class="grid-gaprow"><th scope="row" class="grid-index">…</th>${'<td>…</td>'.repeat(width)}</tr>`;
  const body = g.rows.map((row, i) => `${i === g.gapRow ? gapRow : ''}<tr><th scope="row" class="grid-index">${escapeHTML(g.index[i])}</th>${
    row.map((v, j) => `${gapCell('td', j)}<td${num(j)}>${escapeHTML(v)}</td>`).join('')}</tr>`).join('');
  return `<div class="matrix-wrap"><table class="matrix is-frame${g.sql ? ' is-sql' : ''}"><thead><tr><th class="grid-corner" scope="col">${escapeHTML(g.indexName || '')}</th>${head}</tr></thead><tbody>${body}</tbody></table></div>
    <p class="matrix-note">${g.note ? `${escapeHTML(g.note)} &middot; ` : ''}${escapeHTML(g.shown)}</p>`;
}

/** Printed output with its tables drawn as grids: each grid replaces the
    stretch of text it was printed as; the rest stays as text. */
export function printed(stdout, grids) {
  const text = stdout || '';
  const pre = (t) => (t.trim() ? `<pre class="out-body">${escapeHTML(t.replace(/^\n+|\s+$/g, ''))}</pre>` : '');
  if (!grids || !grids.length) return pre(text);
  let html = '';
  let at = 0;
  for (const g of grids) {
    const i = text.indexOf(g.text, at);
    if (i < 0) continue;                   // cut off with the rest of a very long output
    html += pre(text.slice(at, i)) + frameGrid(g);
    at = i + g.text.length;
  }
  return html + pre(text.slice(at));
}

/** What the last line stored, when the code ended by storing something
    rather than showing it: `busy = cafe[...]` prints nothing, and a right
    answer shouldn't come back looking empty. */
export function echoBlock(out) {
  if (!out.echo) return '';
  return `<div class="out"><div class="out-head">What's in <span class="out-name">${escapeHTML(out.echo.name)}</span> now</div>
    ${out.echo.grid ? frameGrid(out.echo.grid) : `<pre class="out-body">${escapeHTML(out.echo.text)}</pre>`}</div>`;
}

/** Charts, printed output and errors from a run, as HTML blocks. */
export function outputBlocks(out, { sql = false, fail = '' } = {}) {
  const parts = [];
  if (out.images && out.images.length) {
    parts.push(`<div class="out">${out.images
      .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart drawn by your code">`).join('')}</div>`);
  }
  const text = (out.stdout || '').trim();
  if (text) {
    parts.push(`<div class="out"><div class="out-head">Output</div>
      ${printed(out.stdout, out.grids)}</div>`);
  }
  if (out.echo) parts.push(echoBlock(out));
  if (!out.ok) {
    parts.push(`<div class="out">
      <div class="out-head" style="color:var(--accent)">${out.downloadFailed ? 'A download failed' : out.timedOut ? 'Time limit exceeded' : fail || (sql ? 'The database said no' : 'Python stopped here')}</div>
      <pre class="out-body is-err">${escapeHTML(out.error || '')}</pre></div>`);
  }
  return parts;
}
