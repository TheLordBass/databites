import { $, inline, escapeHTML, folio, toast, buzz, countUp } from '../ui.js';
import { store } from '../store.js';
import { python } from '../python.js';
import { PRELUDE, lessonById, ALL_LESSONS } from '../curriculum/index.js';

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
  const saved = store.draft(lesson.id);

  ctx.setTitle(`${track.name} · ${position}/${total}`);

  mount.className = `screen lesson-screen ${track.theme}`;
  mount.innerHTML = `
    <div class="stack">
      <div class="l-intro">
        <div class="lesson-head">
          <p class="label lesson-kicker" style="margin:0">
            ${escapeHTML(track.name)} &middot; ${position} of ${total}
          </p>
          <span class="folio">${folio(position)}</span>
        </div>
        <h1 class="display lesson-title">${escapeHTML(lesson.title)}</h1>

        <ul class="concept">
          ${lesson.concept.map((line) => `<li>${inline(line)}</li>`).join('')}
        </ul>
      </div>

      <div class="task">
        <span class="label">Your turn</span>
        <p>${inline(lesson.task)}</p>
      </div>

      <div class="l-work stack">
      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">Python</span>
          <button class="btn-text" id="reset-code" style="font-size:12px">Reset</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" aria-label="Python code"></textarea>
        <div class="snips" id="snips">
          ${(SNIPPETS[track.id] || []).map((s, i) =>
            `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      ${lesson.needs ? `<p class="needs-note">First run also fetches
        ${escapeHTML(lesson.needs.join(' and '))} — a one-off download.</p>` : ''}

      <div class="run-row">
        <button class="btn btn-accent" id="run">Run</button>
        <button class="btn-text" id="skip">Skip this</button>
      </div>

      <div id="result"></div>
      </div>

      <div class="l-help">
        <details class="reveal" id="hint-box">
          <summary>Nudge me</summary>
          <div class="reveal-body">${inline(lesson.hint)}</div>
        </details>

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

  const insert = (text, back = 0) => {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText(text, start, end, 'end');
    const caret = editor.selectionStart - back;
    editor.setSelectionRange(caret, caret);
    editor.focus();
    save();
  };

  let saveTimer;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.saveDraft(lesson.id, editor.value), 400);
  };

  editor.addEventListener('input', save);

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      insert('    ');
    } else if (event.key === 'Enter') {
      // Carry the indent down, and step in after a colon.
      const upto = editor.value.slice(0, editor.selectionStart);
      const line = upto.slice(upto.lastIndexOf('\n') + 1);
      const indent = (line.match(/^[ \t]*/) || [''])[0];
      const deeper = /:\s*$/.test(line) ? '    ' : '';
      if (indent || deeper) {
        event.preventDefault();
        insert('\n' + indent + deeper);
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  });

  $('#snips', mount).addEventListener('click', (event) => {
    const button = event.target.closest('[data-snip]');
    if (!button) return;
    const snip = SNIPPETS[track.id][Number(button.dataset.snip)];
    insert(snip.insert, snip.back || 0);
    buzz(8);
  });

  $('#reset-code', mount).addEventListener('click', () => {
    editor.value = lesson.starter;
    store.clearDraft(lesson.id);
    result.innerHTML = '';
    toast('Back to the starting code');
  });

  $('#use-sol', mount).addEventListener('click', () => {
    editor.value = lesson.solution;
    save();
    $('#sol-box', mount).open = false;
    editor.scrollIntoView({ block: 'center' });
    toast('Run it and see what it does');
  });

  $('#skip', mount).addEventListener('click', () => goNext(ctx, lesson));

  /* ── run ───────────────────────────────────────────── */

  const runButton = $('#run', mount);
  let busy = false;

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
    store.saveDraft(lesson.id, editor.value);

    const out = await python.run({
      code: editor.value,
      key: lesson.id,
      prelude: PRELUDE,
      check: lesson.check,
      needs: lesson.needs || [],
    });

    busy = false;
    runButton.disabled = false;
    runButton.textContent = 'Run';
    paint(out);
  }

  runButton.addEventListener('click', run);

  // You can read and type while Python is still downloading — just not run yet.
  if (!python.isReady) {
    runButton.disabled = true;
    runButton.textContent = 'Warming up Python…';
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
        .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart">`)
        .join('')}</div>`);
    }

    const text = (out.stdout || '').trim();
    if (text) {
      parts.push(`<div class="out">
        <div class="out-head">Output</div>
        <pre class="out-body">${escapeHTML(text)}</pre>
      </div>`);
    }

    if (!out.ok) {
      parts.push(`<div class="out">
        <div class="out-head" style="color:var(--accent)">Python stopped here</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre>
      </div>`);
      parts.push(verdict('no', 'Read the last line first',
        'It usually names the problem outright. The nudge below helps too.'));
    } else if (out.check && !out.check.passed) {
      parts.push(verdict('no', 'Not yet', out.check.msg));
    } else if (out.check && out.check.passed) {
      const reward = store.complete(lesson.id, 20 + lesson.mins * 2);
      buzz(30);
      parts.push(done(reward, lesson));
    } else if (!parts.length) {
      parts.push(verdict('no', 'Nothing came back',
        'That ran, but produced nothing. Put a variable or a chart on the last line.'));
    }

    result.innerHTML = parts.join('');
    ctx.refreshChrome();

    // The reward should move — a static number doesn't register as a win.
    const xpNode = $('#xp-count', result);
    if (xpNode) countUp(xpNode, Number(xpNode.dataset.to));

    const next = $('#next-lesson', result);
    if (next) next.addEventListener('click', () => goNext(ctx, lesson));

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
    const streakLine = reward.streakUp
      ? `Day ${reward.streak} in a row.`
      : (reward.isFirst ? 'Locked in.' : 'Still solid the second time round.');
    return `
      <div class="won">
        <div class="won-label">${last ? 'Track complete' : "That's it"}</div>
        <p class="won-xp">+<span id="xp-count" data-to="${reward.xp}">0</span><small> XP</small></p>
        <p class="won-note">${escapeHTML(streakLine)}</p>
      </div>
      <button class="btn btn-primary btn-block" id="next-lesson" style="margin-top:18px">
        ${last ? `Finish ${escapeHTML(track.name)}` : 'Next lesson'}
      </button>
    `;
  }

  if (store.isDone(lesson.id)) {
    result.innerHTML = `<p class="needs-note">You've done this one. Replay it, or skip ahead.</p>`;
  }
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
