import { $, inline, escapeHTML, folio, tally, buzz, countUp, outputBlocks, anotherWay } from '../ui.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';
import { attachHighlight } from '../highlight.js';
import { store, INTERVIEW_MS } from '../store.js';
import { sessionHere, sessionBar, nextInSession, lastStep } from '../session.js';
import { python } from '../python.js';
import {
  PROBLEMS, DIFFICULTY, XP, problemById, judgeCode, previewCode, preludeFor, needsFor,
} from '../practice/problems.js';

const LEVELS = ['easy', 'medium', 'hard'];
const LANGS = { all: 'All', python: 'Python', sql: 'SQL', dax: 'DAX' };
const ARIA = { python: 'Python code', sql: 'SQL query', dax: 'DAX measures' };

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
  dax: [
    { label: '[ ]', insert: '[]', back: 1 },
    { label: 'CALCULATE', insert: 'CALCULATE()', back: 1 },
    { label: 'SUMX', insert: 'SUMX()', back: 1 },
    { label: 'DIVIDE', insert: 'DIVIDE()', back: 1 },
    { label: 'FILTER', insert: 'FILTER()', back: 1 },
    { label: 'ALL', insert: 'ALL()', back: 1 },
    { label: 'RELATED', insert: 'RELATED()', back: 1 },
    { label: '"…"', insert: '""', back: 1 },
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
          query in SQL, or a measure in DAX, and it runs against inputs you haven't seen &mdash; edge cases included.
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
      <button class="btn btn-quiet btn-block" data-go="interview">${interviewRunning()
        ? 'Back to your interview set'
        : 'Interview set: 3 problems, 20 minutes'}</button>

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
                  <span class="problem-tags">${langOf(p) !== 'python' ? LANGS[langOf(p)] + ' &middot; ' : ''}${p.tags.map(escapeHTML).join(' &middot; ')}</span>
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

/* ── Interview set ────────────────────────────────────────── */
/* One SQL, one Python and one DAX problem, medium or harder, against a
   20-minute clock, the shape of a real technical screen. The clock is a
   start time in the store, so it keeps running if you leave the screen. */

const clockText = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function interviewRunning() {
  const iv = store.currentInterview();
  if (!iv || iv.ended || Date.now() - iv.started >= INTERVIEW_MS) return false;
  return !iv.ids.every((id) => iv.solved[id] !== undefined);
}

function interviewPicks() {
  return ['sql', 'python', 'dax'].map((lang) => {
    const pool = PROBLEMS.filter((p) => langOf(p) === lang && p.difficulty !== 'easy');
    const open = pool.filter((p) => !solved(p));
    const from = open.length ? open : pool;
    return from[Math.floor(Math.random() * from.length)];
  }).filter(Boolean).map((p) => p.id);
}

export function renderInterview(mount, ctx) {
  ctx.setTitle('Interview set');
  ctx.showBack(true);
  mount.className = 'screen';
  const iv = store.currentInterview();

  if (!iv) {
    mount.innerHTML = `
      <div class="stack">
        <div>
          <p class="label">Practice against a clock</p>
          <h1 class="display-xl">Interview set</h1>
          <p class="note" style="margin:12px 0 0">Three problems (one SQL, one Python, one DAX) and
          twenty minutes: the shape of a real technical screen. Hidden tests decide, as usual. The clock
          keeps running if you leave, so come back here to check it.</p>
        </div>
        <button class="btn btn-accent btn-block" id="iv-start">Start the clock</button>
      </div>`;
    $('#iv-start', mount).addEventListener('click', () => {
      store.startInterview(interviewPicks());
      ctx.go('interview');
    });
    return;
  }

  const problems = iv.ids.map(problemById).filter(Boolean);
  const took = (p) => iv.solved[p.id];
  const count = problems.filter((p) => took(p) !== undefined).length;
  const running = interviewRunning();
  const left = INTERVIEW_MS - (Date.now() - iv.started);
  const summary = count === problems.length
    ? `All ${problems.length}, the last one at ${clockText(Math.max(...problems.map(took)))}.`
    : `${count} of ${problems.length} in time. The open ones still count if you finish them now, just not on the clock.`;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">${running ? 'Interview set · the clock is running' : 'Interview set · finished'}</p>
        <p class="clock" id="iv-clock">${running ? clockText(left) : `${count}/${problems.length}`}</p>
        <p class="note" style="margin:6px 0 0">${running ? 'left of twenty minutes' : escapeHTML(summary)}</p>
      </div>
      <div class="problems">
        ${problems.map((p, i) => {
          const t = took(p);
          return `
            <button class="lesson-row problem-row d-${p.difficulty} ${t !== undefined ? 'is-done' : ''}" data-go="problem/${p.id}">
              <span class="lesson-n">${t !== undefined ? '&check;' : folio(i + 1)}</span>
              <span class="problem-main">
                <span class="lesson-name">${escapeHTML(p.title)}</span>
                <span class="problem-tags">${LANGS[langOf(p)]} &middot; ${DIFFICULTY[p.difficulty].label}</span>
              </span>
              <span class="diff-tag">${t !== undefined ? clockText(t) : running ? 'open' : 'missed'}</span>
            </button>`;
        }).join('')}
      </div>
      ${running
        ? '<button class="btn btn-quiet btn-block" id="iv-stop">Stop the clock</button>'
        : '<button class="btn btn-accent btn-block" id="iv-again">Another set</button>'}
    </div>`;

  mount.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });
  const stop = $('#iv-stop', mount);
  if (stop) {
    stop.addEventListener('click', () => {
      store.stopInterview();
      ctx.go('interview');
    });
  }
  const again = $('#iv-again', mount);
  if (again) {
    again.addEventListener('click', () => {
      store.endInterview();
      ctx.go('interview');
    });
  }

  if (running) {
    const clock = $('#iv-clock', mount);
    const tick = setInterval(() => {
      if (!clock.isConnected) return clearInterval(tick);
      const now = INTERVIEW_MS - (Date.now() - iv.started);
      if (now <= 0) {
        clearInterval(tick);
        ctx.go('interview');
      } else {
        clock.textContent = clockText(now);
      }
    }, 1000);
  }
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
  const isDax = langOf(problem) === 'dax';
  const snips = SNIPS[langOf(problem)];
  const prelude = preludeFor(problem);
  const needs = needsFor(problem);
  const route = `problem/${problem.id}`;
  const inSession = sessionHere(route);
  const inInterview = interviewRunning() && store.currentInterview().ids.includes(problem.id);

  ctx.setTitle(`Practice · ${level}`);
  ctx.showBack(true);
  mount.className = `screen lesson-screen d-${problem.difficulty}`;

  mount.innerHTML = `
    <div class="stack">
      ${inSession ? sessionBar(inSession) : ''}
      ${inInterview ? `<div class="session-bar">
        <span class="label">Interview set &middot; <span id="iv-left">${clockText(INTERVIEW_MS - (Date.now() - store.currentInterview().started))}</span> left</span>
        <button class="btn-text" data-go-set>Back to the set</button>
      </div>` : ''}
      <div class="l-intro">
        <div class="lesson-head">
          <p class="label lesson-kicker" style="margin:0">
            ${level}${langOf(problem) !== 'python' ? ' &middot; ' + LANGS[langOf(problem)] : ''} &middot; ${problem.tags.map(escapeHTML).join(' &middot; ')}
          </p>
          <span class="folio" aria-hidden="true">${folio(number)}</span>
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
            <span class="label">${LANGS[langOf(problem)]}</span>
            <button class="btn-text" id="reset-code" style="font-size:12px">Reset</button>
          </div>
          <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
            autocorrect="off" autocomplete="off" aria-label="${ARIA[langOf(problem)]}"></textarea>
          <div class="snips" id="snips">
            ${snips.map((s, i) => `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
          </div>
        </div>

        <div class="run-row">
          <button class="btn btn-quiet" id="run">Run</button>
          <button class="btn btn-accent" id="submit">Submit</button>
        </div>

        <div id="result" aria-live="polite"></div>
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

  const sessionSkip = $('#session-skip', mount);
  if (sessionSkip) sessionSkip.addEventListener('click', () => nextInSession(ctx, route));
  const backToSet = $('[data-go-set]', mount);
  if (backToSet) backToSet.addEventListener('click', () => ctx.go('interview'));
  const ivLeft = $('#iv-left', mount);
  if (ivLeft) {
    const tick = setInterval(() => {
      if (!ivLeft.isConnected) return clearInterval(tick);
      const iv = store.currentInterview();
      const left = iv ? INTERVIEW_MS - (Date.now() - iv.started) : 0;
      ivLeft.textContent = clockText(left);
      if (left <= 0 || !iv || iv.ended) clearInterval(tick);
    }, 1000);
  }

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
    key: `p-${problem.id}`, prelude, bind: problem.setup ? prelude + '\n' + problem.setup : '', lang: langOf(problem),
  });
  attachHighlight(editor, langOf(problem));

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
      // DAX previews need the shop tables and the engine; the others build their own inputs
      code: '', key: `px-${problem.id}`, prelude: isDax ? prelude : '', lang: isDax ? 'dax' : 'python',
      check: previewCode(problem), needs, timeoutMs: TIME_LIMIT_MS,
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

  if (needs.length) python.whenReady(() => python.ensure(needs));   // SQLite before the first Run

  if (!python.isReady) {
    runBtn.disabled = submitBtn.disabled = true;
    submitBtn.textContent = isSql ? 'Getting the database ready…' : isDax ? 'Getting DAX ready…' : 'Warming up Python…';
    python.whenReady(() => {
      if (!submitBtn.isConnected) return;
      runBtn.disabled = submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    });
  }

  function paint(out) {
    const parts = outputBlocks(out, { sql: isSql });   // anything they printed, charts, errors
    const j = out.judge;

    if (!out.ok) {
      parts.push(out.timedOut
        ? verdict('Time limit exceeded', isSql
          ? 'Usually a recursive query with nothing to stop it. Check the WHERE inside your WITH RECURSIVE.'
          : isDax
            ? 'Usually an iterator inside an iterator over a big table. Iterate over fewer rows, like VALUES of one column.'
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
      if (clean) store.clearMisses(problem.id);
      store.interviewSolved(problem.id);
      buzz(30);
      parts.push(`
        <div class="won">
          <div class="won-label">Accepted</div>
          <p class="won-xp">+<span id="xp-count" data-to="${reward.xp}">0</span><small> XP</small></p>
          <p class="won-note">${escapeHTML(j.summary)}${clean ? ' Clean solve — no peeking.' : ''}</p>
        </div>
        <button class="btn btn-primary btn-block" id="next-problem" style="margin-top:18px">${inSession
          ? (lastStep(inSession) ? 'Done for today' : 'Next step')
          : inInterview ? 'Back to the set' : 'Next problem'}</button>
        ${anotherWay(editor.value, problem.solution)}`);
    } else if (j) {
      store.miss(problem.id);
      // A DAX script that doesn't parse has no case to show, only the message.
      const heading = / raised a DAX error/.test(j.summary) ? 'DAX error'
        : !j.case ? 'Nothing to test'
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
    if (next) {
      next.addEventListener('click', () => {
        if (nextInSession(ctx, route)) return;
        if (inInterview) return ctx.go('interview');
        ctx.go(`problem/${nextAfter(problem).id}`);
      });
    }

    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  if (solved(problem)) {
    result.innerHTML = `<p class="needs-note">Solved before${store.wasRevealed(problem.id) ? '' : ', cleanly'}. Submit again any time.</p>`;
  }
}
