import { $, inline, escapeHTML, ICON, toast, buzz } from '../ui.js';
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
  const alreadyDone = store.isDone(lesson.id);

  ctx.setTitle(`${track.name} · ${position}/${total}`);

  mount.className = `screen ${track.theme}`;
  mount.innerHTML = `
    <div class="progress-thin"><i style="width:${(position / total) * 100}%"></i></div>

    <div class="stack">
      <div>
        <div class="eyebrow">Lesson ${position} of ${total}</div>
        <h1 class="h1">${escapeHTML(lesson.title)}</h1>
      </div>

      <ul class="concept">
        ${lesson.concept.map((line) => `<li>${inline(line)}</li>`).join('')}
      </ul>

      <div class="task">
        <span class="task-label">Your turn</span>
        ${inline(lesson.task)}
      </div>

      <div class="editor-wrap">
        <div class="editor-bar">
          <span>Python</span>
          <button class="btn btn-sm btn-ghost" id="reset-code" style="min-height:30px;padding:0 10px">Reset</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" aria-label="Python code"></textarea>
        <div class="snips" id="snips">
          ${(SNIPPETS[track.id] || []).map((s, i) =>
            `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      <div class="run-row">
        <button class="btn btn-go" id="run">${ICON.play}<span>Run</span></button>
        <button class="btn btn-ghost" id="skip">Skip</button>
      </div>

      <div id="result"></div>

      <details class="reveal" id="hint-box">
        <summary>Nudge me</summary>
        <div class="reveal-body">${inline(lesson.hint)}</div>
      </details>

      <details class="reveal" id="sol-box">
        <summary>Just show me the answer</summary>
        <div class="reveal-body">
          <pre>${escapeHTML(lesson.solution)}</pre>
          <button class="btn btn-sm btn-ghost" id="use-sol" style="margin-top:10px">Put it in the editor</button>
        </div>
      </details>
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

  async function run() {
    if (busy) return;
    busy = true;
    runButton.disabled = true;
    runButton.innerHTML = `${ICON.spark}<span>Running…</span>`;
    store.saveDraft(lesson.id, editor.value);

    const out = await python.run({
      code: editor.value,
      key: lesson.id,
      prelude: PRELUDE,
      check: lesson.check,
    });

    busy = false;
    runButton.disabled = false;
    runButton.innerHTML = `${ICON.play}<span>Run</span>`;
    paint(out);
  }

  runButton.addEventListener('click', run);

  // You can read and type while Python is still downloading — just not run yet.
  if (!python.isReady) {
    runButton.disabled = true;
    runButton.innerHTML = `${ICON.spark}<span>Warming up Python…</span>`;
    python.whenReady(() => {
      if (!runButton.isConnected) return;
      runButton.disabled = false;
      runButton.innerHTML = `${ICON.play}<span>Run</span>`;
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
        <div class="out-head" style="color:var(--bad)">Python stopped here</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre>
      </div>`);
    }

    if (!out.ok) {
      parts.push(feedback('try', 'Read the last line first — it usually names the problem. The nudge below helps too.'));
    } else if (out.check && !out.check.passed) {
      parts.push(feedback('try', out.check.msg));
    } else if (out.check && out.check.passed) {
      const reward = store.complete(lesson.id, 20 + lesson.mins * 2);
      buzz(30);
      parts.push(celebration(reward, lesson));
    } else if (!parts.length) {
      parts.push(feedback('try', 'That ran, but produced nothing. Put a variable or a chart on the last line.'));
    }

    result.innerHTML = parts.join('');
    ctx.refreshChrome();

    const next = $('#next-lesson', result);
    if (next) next.addEventListener('click', () => goNext(ctx, lesson));

    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function feedback(kind, message) {
    const icon = kind === 'ok' ? ICON.check : ICON.retry;
    return `<div class="feedback fb-${kind}">${icon}<div>${inline(message)}</div></div>`;
  }

  function celebration(reward, done) {
    const last = done.index === total - 1;
    return `
      <div class="feedback fb-ok">${ICON.check}<div><b>That's it.</b> ${
        escapeHTML(reward.isFirst ? 'Locked in.' : 'Still solid the second time.')
      }</div></div>
      <div class="done-wrap">
        <div class="done-emoji">${last ? '🏁' : '✨'}</div>
        <div class="xp-pop">+${reward.xp} XP</div>
      </div>
      <button class="btn btn-go btn-block" id="next-lesson">
        <span>${last ? `Finish ${escapeHTML(track.name)}` : 'Next lesson'}</span>${ICON.arrow}
      </button>
    `;
  }

  if (alreadyDone) {
    result.innerHTML = `<div class="chip">${ICON.check} Done before — replay it or skip ahead</div>`;
  }
}

function goNext(ctx, lesson) {
  const track = lesson.track;
  const next = track.lessons[lesson.index + 1];
  if (next) return ctx.go(`lesson/${next.id}`);

  // Track finished — hand them the next unfinished thing anywhere.
  const onwards = ALL_LESSONS.find((l) => !store.isDone(l.id));
  if (onwards) {
    toast(`${track.name} complete 🎉`);
    return ctx.go(`lesson/${onwards.id}`);
  }
  ctx.go('you');
}
