import { $, inline, escapeHTML, folio, tally, buzz, countUp, outputBlocks } from '../ui.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';
import { store } from '../store.js';
import { python } from '../python.js';
import {
  PROBLEMS, DIFFICULTY, XP, problemById, judgeCode, previewCode, preludeFor, needsFor,
} from '../practice/problems.js';

const LEVELS = ['easy', 'medium', 'hard'];
const LANGS = { all: 'Both', python: 'Python', sql: 'SQL' };

/* Generous for anything these problems need, short enough that an endless
   loop gets called out before you wonder whether the app has frozen. */
const TIME_LIMIT_MS = 12000;

const SNIPS = {
  python: [
    { label: 'df', insert: 'df' },
    { label: 'return', insert: 'return ' },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: 'groupby', insert: '.groupby("")', back: 2 },
    { label: 'reset_index', insert: '.reset_index()' },
    { label: 'sort_values', insert: '.sort_values("")', back: 2 },
    { label: '.copy()', insert: '.copy()' },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  sql: [
    { label: 'SELECT', insert: 'SELECT ' },
    { label: 'FROM', insert: '\nFROM ' },
    { label: 'WHERE', insert: '\nWHERE ' },
    { label: 'GROUP BY', insert: '\nGROUP BY ' },
    { label: 'ORDER BY', insert: '\nORDER BY ' },
    { label: 'COUNT(*)', insert: 'COUNT(*)' },
    { label: 'AS', insert: ' AS ' },
    { label: "'…'", insert: "''", back: 1 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
};

// Both survive leaving and coming back to the list.
let filter = 'all';
let langFilter = 'all';

const langOf = (p) => p.lang || 'python';
const inLang = (p) => langFilter === 'all' || langOf(p) === langFilter;
const solved = (p) => store.isDone(p.id);
const count = (level, pred = () => true) =>
  PROBLEMS.filter((p) => inLang(p) && (level === 'all' || p.difficulty === level) && pred(p)).length;

/* The easiest level that still has something open, then random within it —
   a gentle ramp rather than a lottery, and no list to agonise over. */
function pickOne() {
  const pool = PROBLEMS.filter((p) => inLang(p) && (filter === 'all' || p.difficulty === filter));
  const open = pool.filter((p) => !solved(p));
  const from = open.length ? open : pool;
  const level = LEVELS.find((d) => from.some((p) => p.difficulty === d));
  const candidates = from.filter((p) => p.difficulty === level);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* The next unsolved problem, preferring the language you're already in. */
function nextAfter(problem) {
  const start = PROBLEMS.indexOf(problem);
  const around = Array.from({ length: PROBLEMS.length - 1 }, (_, i) => PROBLEMS[(start + i + 1) % PROBLEMS.length]);
  return around.find((p) => !solved(p) && langOf(p) === langOf(problem))
    || around.find((p) => !solved(p))
    || around[0];
}

/* ── The list ─────────────────────────────────────────────── */

export function renderPractice(mount, ctx) {
  ctx.setTitle('Practice');
  mount.className = 'screen';

  const shown = PROBLEMS.filter((p) => inLang(p) && (filter === 'all' || p.difficulty === filter));

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Hidden tests decide</p>
        <h1 class="display-xl">Practice</h1>
        <p class="note" style="margin:12px 0 0">
          No teaching and no starter code. Write <code>def solution(...)</code> in Python, or one
          query in SQL, and it runs against inputs you haven't seen &mdash; edge cases included.
          ${count('all', solved)} of ${count('all')} solved.
        </p>
      </div>

      <div class="figures">
        ${LEVELS.map((d) => `
          <div class="figure d-${d}">
            <span class="figure-n" style="color:var(--accent)">${count(d, solved)}<small>/${count(d)}</small></span>
            <span class="figure-l">${DIFFICULTY[d].label}</span>
          </div>`).join('')}
      </div>

      <button class="btn btn-accent btn-block" id="pick">Pick one for me</button>

      <div>
        <div class="filters" aria-label="Language">
          ${Object.entries(LANGS).map(([k, label]) => `
            <button class="filter ${langFilter === k ? 'is-on' : ''}" data-lang="${k}">${label}</button>`).join('')}
        </div>
        <div class="filters" aria-label="Difficulty">
          ${['all', ...LEVELS].map((f) => `
            <button class="filter ${f === 'all' ? '' : `d-${f}`} ${filter === f ? 'is-on' : ''}"
                    data-filter="${f}">${f === 'all' ? 'All' : DIFFICULTY[f].label}</button>`).join('')}
        </div>
        <div class="problems">
          ${shown.map((p) => {
            const done = solved(p);
            return `
              <button class="lesson-row problem-row d-${p.difficulty} ${done ? 'is-done' : ''}"
                      data-go="problem/${p.id}">
                <span class="lesson-n">${done ? '&check;' : folio(PROBLEMS.indexOf(p) + 1)}</span>
                <span class="problem-main">
                  <span class="lesson-name">${escapeHTML(p.title)}</span>
                  <span class="problem-tags">${langOf(p) === 'sql' ? 'SQL &middot; ' : ''}${p.tags.map(escapeHTML).join(' &middot; ')}</span>
                </span>
                <span class="diff-tag">${DIFFICULTY[p.difficulty].label}</span>
              </button>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  mount.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter], [data-lang]');
    if (chip) {
      if (chip.dataset.lang) langFilter = chip.dataset.lang;
      else filter = chip.dataset.filter;
      ctx.go('practice');          // re-render through the router, on a fresh node
      return;
    }
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });

  $('#pick', mount).addEventListener('click', () => {
    const p = pickOne();
    if (p) ctx.go(`problem/${p.id}`);
  });
}

/* ── One problem ──────────────────────────────────────────── */

function ioBlocks(rows) {
  return `<div class="io">${rows.map(([label, text, bad]) => `
    <div class="io-block ${bad ? 'is-bad' : ''}">
      <span class="io-l">${escapeHTML(label)}</span>
      <pre>${escapeHTML(text)}</pre>
    </div>`).join('')}</div>`;
}

function verdict(heading, body) {
  return `<div class="verdict verdict-no">
    <span class="label">${escapeHTML(heading)}</span>
    <p>${inline(body)}</p>
  </div>`;
}

export function renderProblem(mount, ctx) {
  const problem = problemById(ctx.params.id);
  if (!problem) return ctx.go('practice');

  const level = DIFFICULTY[problem.difficulty].label;
  const number = PROBLEMS.indexOf(problem) + 1;
  const isSql = langOf(problem) === 'sql';
  const snips = SNIPS[langOf(problem)];
  const prelude = preludeFor(problem);
  const needs = needsFor(problem);

  ctx.setTitle(`Practice · ${level}`);
  ctx.showBack(true);
  mount.className = `screen lesson-screen d-${problem.difficulty}`;

  mount.innerHTML = `
    <div class="stack">
      <div class="l-intro">
        <div class="lesson-head">
          <p class="label lesson-kicker" style="margin:0">
            ${level}${isSql ? ' &middot; SQL' : ''} &middot; ${problem.tags.map(escapeHTML).join(' &middot; ')}
          </p>
          <span class="folio">${folio(number)}</span>
        </div>
        <h1 class="display lesson-title">${escapeHTML(problem.title)}</h1>
        <div class="prompt">${problem.prompt.map((para) => `<p>${inline(para)}</p>`).join('')}</div>
        ${problem.notes && problem.notes.length
          ? `<ul class="concept">${problem.notes.map((n) => `<li>${inline(n)}</li>`).join('')}</ul>`
          : ''}
      </div>

      <div class="p-example">
        <span class="label">Example</span>
        <div id="example"><p class="needs-note">Working out the example&hellip;</p></div>
      </div>

      <div class="l-work stack">
        <div class="editor-wrap">
          <div class="editor-bar">
            <span class="label">${isSql ? 'SQL' : 'Python'}</span>
            <button class="btn-text" id="reset-code" style="font-size:12px">Reset</button>
          </div>
          <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
            autocorrect="off" autocomplete="off" aria-label="${isSql ? 'SQL query' : 'Python code'}"></textarea>
          <div class="snips" id="snips">
            ${snips.map((s, i) => `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
          </div>
        </div>

        <div class="run-row">
          <button class="btn btn-quiet" id="run">Run</button>
          <button class="btn btn-accent" id="submit">Submit</button>
        </div>

        <div id="result"></div>
      </div>

      <div class="l-help">
        <details class="reveal">
          <summary>Nudge me</summary>
          <div class="reveal-body">${inline(problem.hint)}</div>
        </details>
        <details class="reveal" id="sol-box">
          <summary>Show a solution</summary>
          <div class="reveal-body">
            <pre>${escapeHTML(problem.solution)}</pre>
            <p style="margin:12px 0 0">Solving it after looking still counts. It just won't be
            marked as a clean solve.</p>
          </div>
        </details>
      </div>
    </div>
  `;

  const editor = $('#code', mount);
  const result = $('#result', mount);
  const example = $('#example', mount);
  const runBtn = $('#run', mount);
  const submitBtn = $('#submit', mount);

  editor.value = store.draft(problem.id) ?? problem.stub;

  let saveTimer;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.saveDraft(problem.id, editor.value), 400);
  };

  wireEditor(editor, { onChange: save, onRun: () => go(false), snipBar: $('#snips', mount), snippets: snips });
  // bind: the example's arguments (or, for SQL, its tables), so df. completes inside
  // solution(df) and FROM offers the problem's real tables.
  attachIntellisense(editor, {
    key: `p-${problem.id}`, prelude, bind: prelude + '\n' + problem.setup, lang: langOf(problem),
  });

  $('#reset-code', mount).addEventListener('click', () => {
    editor.value = problem.stub;
    store.clearDraft(problem.id);
    result.innerHTML = '';
  });

  $('#sol-box', mount).addEventListener('toggle', (event) => {
    if (event.target.open) store.markRevealed(problem.id);
  });

  /* The example is computed from the reference answer, never hand-typed. */
  python.whenReady(async () => {
    const out = await python.run({
      code: '', key: `px-${problem.id}`, prelude: '', check: previewCode(problem), needs, timeoutMs: TIME_LIMIT_MS,
    });
    if (!example.isConnected) return;
    const j = out.judge;
    example.innerHTML = j && j.mode === 'preview'
      ? ioBlocks([['Input', j.input], ['Expected output', j.expected]])
      : `<pre class="out-body is-err">${escapeHTML(out.error || (out.check && out.check.msg) || 'Could not build the example.')}</pre>`;
  });

  let busy = false;

  async function go(submit) {
    if (busy || !python.isReady) return;
    busy = true;
    const button = submit ? submitBtn : runBtn;
    const label = button.textContent;
    runBtn.disabled = submitBtn.disabled = true;
    button.textContent = submit ? 'Judging…' : 'Running…';
    store.saveDraft(problem.id, editor.value);

    const out = await python.run({
      code: editor.value,
      key: `p-${problem.id}`,
      prelude,
      lang: langOf(problem),
      needs,
      check: judgeCode(problem, submit),
      timeoutMs: TIME_LIMIT_MS,
    });

    busy = false;
    runBtn.disabled = submitBtn.disabled = false;
    button.textContent = label;
    paint(out);
  }

  runBtn.addEventListener('click', () => go(false));
  submitBtn.addEventListener('click', () => go(true));

  if (!python.isReady) {
    runBtn.disabled = submitBtn.disabled = true;
    submitBtn.textContent = 'Warming up Python…';
    python.whenReady(() => {
      if (!submitBtn.isConnected) return;
      runBtn.disabled = submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    });
  }

  function paint(out) {
    const parts = outputBlocks(out);   // anything they printed, charts, errors
    const j = out.judge;

    if (!out.ok) {
      parts.push(out.timedOut
        ? verdict('Time limit exceeded', isSql
          ? 'Usually a recursive query with nothing to stop it. Check the WHERE inside your WITH RECURSIVE.'
          : 'Usually a loop that never ends. Pandas can almost always do the whole column at once instead of row by row.')
        : verdict("Your code didn't run", 'Read the last line of the error first — it usually names the problem.'));
    } else if (j && j.mode === 'run') {
      parts.push(`<div class="judge ${j.ok ? 'is-ok' : ''}">
        <span class="label">${j.ok ? 'Example passes' : 'Example fails'}</span>
        <p>${escapeHTML(j.summary)}</p>
        ${j.case ? ioBlocks([['Input', j.case.input], ['Expected', j.case.expected], ['Your output', j.case.got, !j.ok]]) : ''}
        <p class="judge-note">Run only tries the example. Submit runs the hidden tests.</p>
      </div>`);
    } else if (j && j.ok) {
      const clean = !store.wasRevealed(problem.id);
      const reward = store.complete(problem.id, XP[problem.difficulty]);
      buzz(30);
      parts.push(`
        <div class="won">
          <div class="won-label">Accepted</div>
          <p class="won-xp">+<span id="xp-count" data-to="${reward.xp}">0</span><small> XP</small></p>
          <p class="won-note">${escapeHTML(j.summary)}${clean ? ' Clean solve — no peeking.' : ''}</p>
        </div>
        <button class="btn btn-primary btn-block" id="next-problem" style="margin-top:18px">Next problem</button>`);
    } else if (j) {
      const heading = !j.case ? 'Nothing to test'
        : / raised an SQL error/.test(j.summary) ? 'SQL error'
        : / raised /.test(j.summary) ? 'Runtime error' : 'Wrong answer';
      parts.push(`<div class="judge">
        <span class="label">${heading}</span>
        ${j.total ? tally(j.passed, j.total) : ''}
        <p>${escapeHTML(j.summary)}${j.passed ? ` Passed ${j.passed} of ${j.total} before that.` : ''}</p>
        ${j.case ? ioBlocks([['Input', j.case.input], ['Expected', j.case.expected], ['Your output', j.case.got, true]]) : ''}
      </div>`);
    } else if (out.check && !out.check.passed) {
      parts.push(verdict('Could not judge that', out.check.msg));
    }

    result.innerHTML = parts.join('');
    ctx.refreshChrome();

    const xpNode = $('#xp-count', result);
    if (xpNode) countUp(xpNode, Number(xpNode.dataset.to));
    const next = $('#next-problem', result);
    if (next) next.addEventListener('click', () => ctx.go(`problem/${nextAfter(problem).id}`));

    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  if (solved(problem)) {
    result.innerHTML = `<p class="needs-note">Solved before${store.wasRevealed(problem.id) ? '' : ', cleanly'}. Submit again any time.</p>`;
  }
}
