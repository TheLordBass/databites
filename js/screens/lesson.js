import { $, inline, escapeHTML, folio, toast, buzz, countUp, daxOutput, anotherWay } from '../ui.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';
import { attachHighlight, tokens } from '../highlight.js';
import { sessionHere, sessionBar, nextInSession, lastStep } from '../session.js';
import { canTake, takeWithYou } from '../export.js';
import { store } from '../store.js';
import { python } from '../python.js';
import { lessonPrelude, lessonById, ALL_LESSONS } from '../curriculum/index.js';

const LANG_LABEL = { python: 'Python', sql: 'SQL', dax: 'DAX' };
const LANG_ARIA = { python: 'Python code', sql: 'SQL query', dax: 'DAX measures' };

/* Tap-to-insert bar — typing brackets and quotes on a phone is misery. */
const SNIPPETS = {
  pandas: [
    { label: 'cafe', insert: 'cafe' },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '()', insert: '()', back: 1 },
    { label: '.head()', insert: '.head()' },
    { label: '.sum()', insert: '.sum()' },
    { label: '.mean()', insert: '.mean()' },
    { label: 'groupby', insert: '.groupby("")', back: 2 },
    { label: 'print()', insert: 'print()', back: 1 },
    { label: '"', insert: '"' },
    { label: '>', insert: ' > ' },
    { label: '&', insert: ' & ' },
  ],
  messy: [
    { label: 'survey', insert: 'survey' },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '.str.', insert: '.str.' },
    { label: 'strip()', insert: '.str.strip()' },
    { label: 'lower()', insert: '.str.lower()' },
    { label: 'to_numeric', insert: 'pd.to_numeric()', back: 1 },
    { label: 'to_datetime', insert: 'pd.to_datetime()', back: 1 },
    { label: 'coerce', insert: 'errors="coerce"' },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  wrangling: [
    { label: 'cafe', insert: 'cafe' },
    { label: 'cities', insert: 'cities' },
    { label: 'marks', insert: 'marks' },
    { label: 'students', insert: 'students' },
    { label: 'pd.merge', insert: 'pd.merge()', back: 1 },
    { label: 'pd.concat', insert: 'pd.concat([])', back: 2 },
    { label: 'on=""', insert: 'on=""', back: 1 },
    { label: 'how=""', insert: 'how=""', back: 1 },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  timeseries: [
    { label: 'cafe', insert: 'cafe' },
    { label: 'weather', insert: 'weather' },
    { label: 'set_index', insert: '.set_index("date")' },
    { label: 'resample', insert: '.resample("")', back: 2 },
    { label: 'rolling', insert: '.rolling()', back: 1 },
    { label: '.dt.', insert: '.dt.' },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '.mean()', insert: '.mean()' },
    { label: '.sum()', insert: '.sum()' },
    { label: '()', insert: '()', back: 1 },
  ],
  analysis: [
    { label: 'cafe', insert: 'cafe' },
    { label: 'groupby', insert: '.groupby("")', back: 2 },
    { label: '.agg()', insert: '.agg()', back: 1 },
    { label: 'np.', insert: 'np.' },
    { label: 'sm.', insert: 'sm.' },
    { label: '.fit()', insert: '.fit()', back: 1 },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  matplotlib: [
    { label: 'plt.', insert: 'plt.' },
    { label: 'ax.', insert: 'ax.' },
    { label: 'fig, ax', insert: 'fig, ax = plt.subplots()\n' },
    { label: 'plt.show()', insert: 'plt.show()' },
    { label: 'cafe', insert: 'cafe' },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '()', insert: '()', back: 1 },
    { label: '"', insert: '"' },
    { label: '=', insert: '=' },
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
    { label: '=', insert: ' = ' },
  ],
  seaborn: [
    { label: 'sns.', insert: 'sns.' },
    { label: 'data=cafe', insert: 'data=cafe' },
    { label: 'x=""', insert: 'x=""', back: 1 },
    { label: 'y=""', insert: 'y=""', back: 1 },
    { label: 'hue=""', insert: 'hue=""', back: 1 },
    { label: 'plt.show()', insert: 'plt.show()' },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
};

export function renderLesson(mount, ctx) {
  const lesson = lessonById(ctx.params.id);
  if (!lesson) return ctx.go('home');

  const track = lesson.track;
  const total = track.lessons.length;
  const position = lesson.index + 1;
  // Quick recall: the task alone, from the starter, with the teaching folded away.
  // Its own draft, so the lesson's saved (usually finished) code doesn't give it away.
  const review = ctx.params.mode === 'review' && store.isDone(lesson.id);
  // Testing out of a part: this lesson, cold. No teaching, no hints, no answer.
  const testOut = ctx.params.mode === 'test' ? store.currentTestOut() : null;
  const testing = Boolean(testOut && testOut.steps[testOut.at] === lesson.id);
  let testNext;               // after a pass: the next test lesson's id, or null when done
  const draftId = review ? `${lesson.id}~review` : testing ? `${lesson.id}~test` : lesson.id;
  const saved = store.draft(draftId);
  const route = review ? `lesson/${lesson.id}/review` : testing ? `lesson/${lesson.id}/test` : `lesson/${lesson.id}`;
  const inSession = sessionHere(route);
  const isSql = lesson.lang === 'sql';
  const isDax = lesson.lang === 'dax';
  const prelude = lessonPrelude(lesson);
  // By language first: the SQL track's last lesson is Python, and must not get SQL buttons.
  const snippets = lesson.lang !== 'python' ? SNIPPETS[lesson.lang]
    : (!['sql', 'dax'].includes(track.id) && SNIPPETS[track.id]) || SNIPPETS.pandas;
  // SQLite is small; only the heavyweight downloads deserve a warning.
  const heavy = (lesson.needs || []).filter((n) => n !== 'sqlite3');

  ctx.setTitle(testing ? `Test out · ${track.name}` : review ? `Recall · ${track.name}` : `${track.name} · ${position}/${total}`);

  const concept = `<ul class="concept">
          ${lesson.concept.map((line) => `<li>${inline(line)}</li>`).join('')}
        </ul>`;
  // SQL written for SQLite here, and how the same thing looks where you'll work.
  const dialects = lesson.dialects ? `<details class="reveal">
          <summary>In other databases</summary>
          <div class="reveal-body">
            ${lesson.dialects.map(([db, text]) => `<p><b>${escapeHTML(db)}:</b> ${inline(text)}</p>`).join('')}
          </div>
        </details>` : '';

  mount.className = `screen lesson-screen ${track.theme}`;
  mount.innerHTML = `
    <div class="stack">
      ${testing ? `<div class="session-bar">
        <span class="label">Testing out &middot; question ${testOut.at + 1} of ${testOut.steps.length}</span>
        <button class="btn-text" id="test-stop">Stop</button>
      </div>` : inSession ? sessionBar(inSession) : ''}
      <div class="l-intro">
        <div class="lesson-head">
          <p class="label lesson-kicker" style="margin:0">
            ${testing ? 'Testing out &middot; ' : review ? 'Quick recall &middot; ' : ''}${escapeHTML(track.name)} &middot; ${position} of ${total}
          </p>
          <span class="folio" aria-hidden="true">${folio(position)}</span>
        </div>
        <h1 class="display lesson-title">${escapeHTML(lesson.title)}</h1>

        ${testing ? '' : review ? `<details class="reveal">
          <summary>Remind me how it works</summary>
          <div class="reveal-body">${concept}</div>
        </details>` : concept}
        ${testing ? '' : dialects}
      </div>

      <div class="task">
        <span class="label">Your turn</span>
        <p>${inline(lesson.task)}</p>
      </div>

      <div class="l-work stack">
      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">${LANG_LABEL[lesson.lang]}</span>
          <button class="btn-text" id="reset-code" style="font-size:12px">Reset</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" aria-label="${LANG_ARIA[lesson.lang]}"></textarea>
        <div class="snips" id="snips">
          ${snippets.map((s, i) =>
            `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      ${heavy.length ? `<p class="needs-note">First run also fetches
        ${escapeHTML(heavy.join(' and '))} — a one-off download.</p>` : ''}

      <div class="run-row">
        <button class="btn btn-accent" id="run">Run</button>
        <button class="btn-text" id="skip">${testing ? 'Stop the test' : review ? 'Not today' : 'Skip this'}</button>
      </div>

      <div id="result" aria-live="polite"></div>
      </div>

      <div class="l-help"${testing ? ' hidden' : ''}>
        <details class="reveal" id="hint-box">
          <summary>Nudge me</summary>
          <div class="reveal-body">${inline(lesson.hint)}</div>
        </details>

        ${canTake(lesson.lang) ? `<details class="reveal">
          <summary>Take it with you</summary>
          <div class="reveal-body">
            <p>Your code from the editor, plus the datasets, as a file that runs in real Python:
            Jupyter, VS Code or Google Colab.</p>
            <div class="quick-row">
              <button class="btn btn-quiet" id="take-ipynb">Notebook</button>
              <button class="btn btn-quiet" id="take-py">Script (.py)</button>
            </div>
          </div>
        </details>` : ''}

        <details class="reveal" id="sol-box">
          <summary>Just show me the answer</summary>
          <div class="reveal-body">
            <pre>${escapeHTML(lesson.solution)}</pre>
            <button class="btn btn-quiet btn-sm" id="use-sol" style="margin-top:12px">
              Put it in the editor
            </button>
          </div>
        </details>
      </div>
    </div>
  `;

  const editor = $('#code', mount);
  const result = $('#result', mount);
  editor.value = saved ?? lesson.starter;

  /* ── editor ergonomics ─────────────────────────────── */

  let saveTimer;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.saveDraft(draftId, editor.value), 400);
  };

  wireEditor(editor, {
    onChange: save,
    onRun: () => run(),
    snipBar: $('#snips', mount),
    snippets,
  });
  attachIntellisense(editor, { key: lesson.id, prelude, lang: lesson.lang });
  attachHighlight(editor, lesson.lang);

  $('#reset-code', mount).addEventListener('click', () => {
    editor.value = lesson.starter;
    store.clearDraft(draftId);
    result.innerHTML = '';
    toast('Back to the starting code');
  });

  ['ipynb', 'py'].forEach((kind) => {
    const take = $(`#take-${kind}`, mount);
    if (!take) return;
    take.addEventListener('click', async () => {
      const saved = await takeWithYou(kind, {
        name: `databites-${lesson.id}`, title: lesson.title, about: lesson.task, code: editor.value, lang: lesson.lang,
      });
      if (saved) toast(kind === 'py' ? 'Script saved' : 'Notebook saved — open it in Jupyter, VS Code or Colab');
    });
  });

  // In a recall, looking at the answer means it wasn't remembered yet.
  let peeked = false;
  $('#sol-box', mount).addEventListener('toggle', (event) => {
    if (event.target.open) peeked = true;
  });

  $('#use-sol', mount).addEventListener('click', () => {
    editor.value = lesson.solution;
    save();
    $('#sol-box', mount).open = false;
    editor.scrollIntoView({ block: 'center' });
    toast('Run it and see what it does');
  });

  // A skipped recall stays due; it just leaves for today.
  const stopTest = () => ctx.go(`track/${track.id}`);
  const testStop = $('#test-stop', mount);
  if (testStop) testStop.addEventListener('click', stopTest);

  $('#skip', mount).addEventListener('click', () => {
    if (testing) return stopTest();
    if (nextInSession(ctx, route)) return;
    if (review) ctx.go('home');
    else goNext(ctx, lesson);
  });
  const sessionSkip = $('#session-skip', mount);
  if (sessionSkip) sessionSkip.addEventListener('click', () => nextInSession(ctx, route));

  /* ── run ───────────────────────────────────────────── */

  const runButton = $('#run', mount);
  let busy = false;
  let misses = 0;            // failed runs in a row; at three, offer a smaller step

  // While a lesson's extra packages download, say so on the button itself.
  const offPkg = python.on('pkg', ({ text, done }) => {
    if (!runButton.isConnected) return offPkg(); // lesson left the DOM — detach
    if (!busy) return;
    runButton.textContent = done || !text ? 'Running…' : text;
  });

  async function run() {
    if (busy) return;
    busy = true;
    runButton.disabled = true;
    runButton.textContent = 'Running…';
    store.saveDraft(draftId, editor.value);

    const out = await python.run({
      code: editor.value,
      key: lesson.id,
      prelude,
      check: lesson.check,
      needs: lesson.needs || [],
      lang: lesson.lang,
      // A `while True:` used to freeze Python for the rest of the session.
      // Generous: nothing a lesson asks for comes close.
      timeoutMs: 30000,
    });

    busy = false;
    runButton.disabled = false;
    runButton.textContent = 'Run';
    paint(out);
  }

  runButton.addEventListener('click', run);

  // You can read and type while Python is still downloading — just not run yet.
  // SQL: fetch SQLite as soon as Python is up, so the first Run doesn't wait on it.
  if (lesson.needs.includes('sqlite3')) python.whenReady(() => python.ensure(['sqlite3']));

  if (!python.isReady) {
    runButton.disabled = true;
    runButton.textContent = isSql ? 'Getting the database ready…' : isDax ? 'Getting DAX ready…' : 'Warming up Python…';
    python.whenReady(() => {
      if (!runButton.isConnected) return;
      runButton.disabled = false;
      runButton.textContent = 'Run';
    });
  }

  function paint(out) {
    const parts = [];

    if (out.images && out.images.length) {
      parts.push(`<div class="out">${out.images
        .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart drawn by your code">`)
        .join('')}</div>`);
    }

    const text = (out.stdout || '').trim();
    if (out.blocks && out.blocks.length) {
      parts.push(daxOutput(out.blocks));
    } else if (text) {
      parts.push(`<div class="out">
        <div class="out-head">Output</div>
        <pre class="out-body">${escapeHTML(text)}</pre>
      </div>`);
    }

    if (!out.ok) {
      parts.push(`<div class="out">
        <div class="out-head" style="color:var(--accent)">${isSql ? 'The database said no' : isDax ? 'The measure has a problem' : 'Python stopped here'}</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre>
      </div>`);
      parts.push(out.timedOut
        ? verdict('no', 'That ran too long',
          'Almost always a loop that never ends — check whatever is meant to stop it. Python has restarted, so just Run again.')
        : isDax
        ? verdict('no', 'Read the message',
          'It names the line, and usually the fix — a missing bracket, a misspelt column, a column that needs SUM around it.')
        : isSql
        ? verdict('no', 'Read the first line, then the second',
          "The first is SQLite's complaint. The second, when there is one, is what to try.")
        : verdict('no', 'Read it from the bottom up',
          'The Tip, when there is one, says what to try. Above it, the error names the problem and the line it happened on.'));
    } else if (out.check && !out.check.passed) {
      parts.push(verdict('no', 'Not yet', out.check.msg));
    } else if (out.check && out.check.passed) {
      const reward = store.complete(lesson.id, 20 + lesson.mins * 2);
      if (track.id === 'projects') {
        store.saveWork(lesson.id, { text: out.stdout || '', image: (out.images && out.images[0]) || null });
      }
      if (testing) {
        testNext = store.advanceTestOut(lesson.id);
        if (testNext === null) store.markTestedOut(testOut.all);
      }
      if (review && peeked) store.retryReview(lesson.id);
      else if (review) store.reviewed(lesson.id);
      else if (reward.isFirst) store.scheduleReview(lesson.id);
      buzz(30);
      parts.push(done(reward, lesson));
    } else if (!parts.length) {
      parts.push(verdict('no', 'Nothing came back', isDax
        ? 'That ran, but there was no measure in it. Start a line with a name, then =, like Total = SUM(order_items[qty]).'
        : isSql
        ? 'That ran, but no table came back. End with a SELECT.'
        : 'That ran, but produced nothing. Put a variable or a chart on the last line.'));
    }

    const passed = Boolean(out.ok && out.check && out.check.passed);
    misses = passed ? 0 : misses + 1;
    if (!passed && !out.timedOut) store.miss(lesson.id);
    if (misses >= 3 && !testing) {           // a test out stays cold: no scaffold of the answer
      parts.push(`<div class="out">
        <div class="out-head">A smaller step: fill in the ___ gaps</div>
        <pre class="out-body">${escapeHTML(skeleton(lesson))}</pre>
      </div>
      <button class="btn btn-quiet btn-sm" id="use-skeleton" style="margin-top:10px">Put this in the editor</button>`);
    }

    result.innerHTML = parts.join('');
    ctx.refreshChrome();

    const useSkeleton = $('#use-skeleton', result);
    if (useSkeleton) {
      useSkeleton.addEventListener('click', () => {
        editor.value = skeleton(lesson);
        save();
        editor.focus();
        editor.scrollIntoView({ block: 'center' });
        toast('Swap each ___ for the real thing');
      });
    }

    // The reward should move — a static number doesn't register as a win.
    const xpNode = $('#xp-count', result);
    if (xpNode) countUp(xpNode, Number(xpNode.dataset.to));

    const next = $('#next-lesson', result);
    if (next) {
      next.addEventListener('click', () => {
        if (testing) return ctx.go(testNext ? `lesson/${testNext}/test` : `track/${track.id}`);
        if (nextInSession(ctx, route)) return;
        if (review) goNextReview(ctx);
        else goNext(ctx, lesson);
      });
    }

    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function verdict(kind, heading, body) {
    return `<div class="verdict verdict-${kind === 'yes' ? 'yes' : 'no'}">
      <span class="label">${escapeHTML(heading)}</span>
      <p>${inline(body)}</p>
    </div>`;
  }

  function done(reward, lesson) {
    const last = lesson.index === total - 1;
    // A peeked recall says so first: when it comes back matters more than the streak.
    const streakLine = review && peeked ? 'You looked this time, so it comes back tomorrow.'
      : reward.streakUp ? `Day ${reward.streak} in a row.`
      : review ? 'Still in there. It comes back later, further apart.'
      : (reward.isFirst ? 'Locked in.' : 'Still solid the second time round.');
    const more = review && dueNow().length > 0;
    const projectDone = track.id === 'projects' && lesson.index % 5 === 4;
    return `
      <div class="won">
        <div class="won-label">${testing ? (testNext ? 'Correct' : 'Part tested out')
          : review ? (peeked ? 'Done, with a look' : 'Remembered') : last ? 'Track complete' : "That's it"}</div>
        <p class="won-xp">+<span id="xp-count" data-to="${reward.xp}">0</span><small> XP</small></p>
        <p class="won-note">${escapeHTML(testing
          ? (testNext ? 'One more to go.' : `${testOut.all.length} lessons marked done. They come back in Quick recall like the rest.`)
          : streakLine)}</p>
        ${projectDone ? '<p class="won-note">Project finished. Its write-up is ready on the Projects track page.</p>' : ''}
      </div>
      <button class="btn btn-primary btn-block" id="next-lesson" style="margin-top:18px">
        ${testing ? (testNext ? 'Next question' : `Back to ${escapeHTML(track.name)}`)
          : inSession ? (lastStep(inSession) ? 'Done for today' : 'Next step')
          : review ? (more ? 'Next recall' : 'Back to today') : last ? `Finish ${escapeHTML(track.name)}` : 'Next lesson'}
      </button>
      ${anotherWay(editor.value, lesson.solution)}
    `;
  }

  if (store.isDone(lesson.id) && !review && !testing) {
    result.innerHTML = `<p class="needs-note">You've done this one. Replay it, or skip ahead.</p>`;
  }
}

const dueNow = () => store.dueReviews(ALL_LESSONS.map((l) => l.id));

/* The answer as a scaffold. On each line the starter didn't already have,
   keywords and function names stay, so the shape of the answer is there, and
   anything new is blanked: names, numbers, string contents, DAX [refs].
   Whatever the starter already used stays visible. A DAX line keeps its
   measure name, which the task gives anyway. */
export function skeleton(lesson) {
  const lang = lesson.lang;
  const given = new Set(lesson.starter.split('\n').map((l) => l.trim()));
  const seen = new Set(tokens(lesson.starter, lang).map((t) => t.text));
  return lesson.solution.split('\n').map((line) => {
    if (!line.trim() || given.has(line.trim())) return line;
    const head = lang === 'dax' ? (line.match(/^\s*[A-Za-z_][\w %]*?\s*:?=(?!=)/) || [''])[0] : '';
    const out = head + tokens(line.slice(head.length), lang).map((t) => {
      if (!t.kind || seen.has(t.text) || t.kind === 'kw' || t.kind === 'fn' || t.kind === 'com') return t.text;
      if (t.kind === 'str') return t.text.replace(/^([^"']*["'])[\s\S]*?(["']?)$/, '$1___$2');
      if (t.kind === 'ref') return '[___]';
      return '___';
    }).join('');
    if (out !== line) return out;
    const open = line.lastIndexOf('(');
    const close = line.indexOf(')', open);
    return open !== -1 && close > open + 1 ? `${line.slice(0, open + 1)}___${line.slice(close)}` : line;
  }).join('\n');
}

function goNextReview(ctx) {
  const [id] = dueNow();
  ctx.go(id ? `lesson/${id}/review` : 'home');
}

function goNext(ctx, lesson) {
  const track = lesson.track;
  const next = track.lessons[lesson.index + 1];
  if (next) return ctx.go(`lesson/${next.id}`);

  // Track finished — hand them the next unfinished thing anywhere.
  const onwards = ALL_LESSONS.find((l) => !store.isDone(l.id));
  if (onwards) {
    toast(`${track.name} complete`);
    return ctx.go(`lesson/${onwards.id}`);
  }
  ctx.go('you');
}
