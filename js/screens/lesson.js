/* One lesson. Routes: lesson/<id>; lesson/<id>/review, a Refill (the task
   alone, from the starter, in a draft of its own); lesson/<id>/test, a
   question in a test-out, a Signature or a Taste test (store.currentTestOut).

   Run sends the code to python.run (Pyodide in js/worker.js; R through
   js/r.js) with the lesson's check. A pass goes through store.complete (points,
   streak), Refills (store.scheduleReview / reviewed), game.after (specials,
   runs, achievements: js/game.js) and the win: confetti, the lesson's stamp
   (js/stamps.js), new achievements' stamps. Getting about (the link line,
   arrows, list and pager) is js/nav.js; an Excel lesson's sheet preview comes
   from _excel_peek in js/excel.py. */

import { $, inline, escapeHTML, folio, toast, buzz, countUp, confetti, anotherWay, showResult, sheetPreview, showTarget, outputBlocks, answerOnly, showsOutput, briefBlock } from '../ui.js';
import { crumbs, stepArrows, pager, jumpMenu, wireGetAbout } from '../nav.js';
import { layoutSwitch, wireLayoutSwitch } from '../display.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';
import { attachHighlight, tokens, colour } from '../highlight.js';
import { sessionHere, sessionBar, nextInSession, lastStep } from '../session.js';
import { canTake, takeWithYou } from '../export.js';
import { store } from '../store.js';
import { python } from '../python.js';
import { EXPECTED, EXAMPLES } from '../curriculum/expected.js';
import { lessonPrelude, examplePrelude, expectedStamp, exampleStamp, lessonById, ALL_LESSONS, PATH_LESSONS, openLessons, TRACK_GROUPS, chunkLessons } from '../curriculum/index.js';
import { after as gameAfter, missed as gameMissed, noteLines, achDrops, stampSounds, dueRefills, refillRoute, hasMini, miniBeaten, miniSteps, MINI_XP } from '../game.js';
import { stampSVG } from '../stamps.js';
import { latteArtSVG } from '../cafe.js';
import { play as playSound } from '../sound.js';
import { guideIfDue, tipIfDue } from '../guide.js';

const LANG_LABEL = { python: 'Python', sql: 'SQL', dax: 'DAX', excel: 'Excel', r: 'R' };
const LANG_ARIA = { python: 'Python code', sql: 'SQL query', dax: 'DAX measures', excel: 'Excel formula', r: 'R code' };

/* Tap-to-insert bar — typing brackets and quotes on a phone is misery. */
const SNIPPETS = {
  r: [
    { label: 'cafe', insert: 'cafe' },
    { label: '<-', insert: ' <- ' },
    { label: '|>', insert: ' |> ' },
    { label: '$', insert: '$' },
    { label: '( )', insert: '()', back: 1 },
    { label: '"…"', insert: '""', back: 1 },
    { label: 'c()', insert: 'c()', back: 1 },
    { label: 'filter', insert: 'filter()', back: 1 },
    { label: 'mutate', insert: 'mutate()', back: 1 },
    { label: 'group_by', insert: 'group_by()', back: 1 },
    { label: 'summarise', insert: 'summarise()', back: 1 },
    { label: 'arrange', insert: 'arrange()', back: 1 },
    { label: '==', insert: ' == ' },
    { label: '%in%', insert: ' %in% ' },
  ],
  basics: [
    { label: 'print()', insert: 'print()', back: 1 },
    { label: '"…"', insert: '""', back: 1 },
    { label: '[ ]', insert: '[]', back: 1 },
    { label: '( )', insert: '()', back: 1 },
    { label: '{ }', insert: '{}', back: 1 },
    { label: '=', insert: ' = ' },
    { label: '==', insert: ' == ' },
    { label: ':', insert: ':' },
    { label: 'indent', insert: '    ' },
    { label: 'for', insert: 'for ' },
    { label: 'def', insert: 'def ' },
    { label: 'return', insert: 'return ' },
  ],
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
  algo: [
    { label: 'def', insert: 'def ' },
    { label: 'return', insert: 'return ' },
    { label: 'for', insert: 'for ' },
    { label: 'while', insert: 'while ' },
    { label: 'if', insert: 'if ' },
    { label: ':', insert: ':' },
    { label: 'indent', insert: '    ' },
    { label: '[ ]', insert: '[]', back: 1 },
    { label: '( )', insert: '()', back: 1 },
    { label: '==', insert: ' == ' },
  ],
  ai: [
    { label: '.fit()', insert: '.fit()', back: 1 },
    { label: '.score()', insert: '.score()', back: 1 },
    { label: '.predict()', insert: '.predict()', back: 1 },
    { label: 'X_train', insert: 'X_train' },
    { label: 'y_train', insert: 'y_train' },
    { label: 'X_test', insert: 'X_test' },
    { label: 'y_test', insert: 'y_test' },
    { label: 'np.', insert: 'np.' },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  ml: [
    { label: '.fit()', insert: '.fit(X_train, y_train)' },
    { label: '.predict()', insert: '.predict(X_test)' },
    { label: 'X_test', insert: 'X_test' },
    { label: 'y_test', insert: 'y_test' },
    { label: 'make_pipeline', insert: 'make_pipeline()', back: 1 },
    { label: 'round(, 3)', insert: 'round(, 3)', back: 4 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
    { label: '[:, 1]', insert: '[:, 1]' },
  ],
  forecast: [
    { label: 'np.', insert: 'np.' },
    { label: 'np.abs()', insert: 'np.abs()', back: 1 },
    { label: '.mean()', insert: '.mean()' },
    { label: '.to_numpy()', insert: '.to_numpy()' },
    { label: 'len(test)', insert: 'len(test)' },
    { label: '["calls"]', insert: '["calls"]' },
    { label: 'round(, 1)', insert: 'round(, 1)', back: 4 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
  ],
  numpy: [
    { label: 'np.', insert: 'np.' },
    { label: '.to_numpy()', insert: '.to_numpy()' },
    { label: '[ ]', insert: '[]', back: 1 },
    { label: '[:, ]', insert: '[:, ]', back: 1 },
    { label: 'axis=0', insert: 'axis=0' },
    { label: '.shape', insert: '.shape' },
    { label: '.mean()', insert: '.mean()' },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
    { label: '@', insert: ' @ ' },
  ],
  stats: [
    { label: 'stats.', insert: 'stats.' },
    { label: 'np.', insert: 'np.' },
    { label: 'rng.', insert: 'rng.' },
    { label: '.mean()', insert: '.mean()' },
    { label: '.std()', insert: '.std()' },
    { label: '.corr()', insert: '.corr()', back: 1 },
    { label: '["…"]', insert: '[""]', back: 2 },
    { label: '()', insert: '()', back: 1 },
    { label: ', ', insert: ', ' },
    { label: '**', insert: ' ** ' },
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
  excel: [
    { label: '=', insert: '=' },
    { label: '( )', insert: '()', back: 1 },
    { label: ', ', insert: ',' },
    { label: ':', insert: ':' },
    { label: '$', insert: '$' },
    { label: '"…"', insert: '""', back: 1 },
    { label: '&', insert: '&' },
    { label: '>=', insert: '>=' },
    { label: '<>', insert: '<>' },
    { label: 'cities!', insert: 'cities!' },
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
  // A stage boss is a test out across a whole stage of the path, and a mini
  // boss one across a single track (js/game.js).
  const bossing = testing && (testOut.kind === 'boss' || testOut.kind === 'mini');
  const mini = bossing && testOut.kind === 'mini';
  const bossName = !bossing ? '' : mini ? track.name : TRACK_GROUPS[testOut.stage].name;
  const bossWord = mini ? 'Taste test' : 'Signature';     // on screen: a course's Taste test, a stage's Signature
  const bossHome = mini ? `track/${track.id}` : 'tracks';
  let testNext;               // after a pass: the next test lesson's id, or null when done
  const draftId = review ? `${lesson.id}~review` : testing ? `${lesson.id}~test` : lesson.id;
  const saved = store.draft(draftId);
  const route = review ? `lesson/${lesson.id}/review` : testing ? `lesson/${lesson.id}/test` : `lesson/${lesson.id}`;
  const inSession = sessionHere(route);
  const isSql = lesson.lang === 'sql';
  const isDax = lesson.lang === 'dax';
  const isXl = lesson.lang === 'excel';
  const isR = lesson.lang === 'r';
  let rReady = !isR;          // R comes in on demand (js/r.js): Run waits for it
  // Which cell the formula goes in, as Excel's Name Box would say.
  const cellNote = lesson.xl ? ` &middot; cell ${escapeHTML(lesson.xl.cell)}${lesson.xl.fill ? ', filled down' : ''}` : '';
  const prelude = lessonPrelude(lesson);
  // By language first: the SQL track's last lesson is Python, and must not get SQL buttons.
  const snippets = lesson.lang !== 'python' ? SNIPPETS[lesson.lang]
    : (!['sql', 'dax'].includes(track.id) && SNIPPETS[track.id]) || SNIPPETS.pandas;
  // SQLite is small; only the heavyweight downloads deserve a warning.
  const heavy = (lesson.needs || []).filter((n) => n !== 'sqlite3');

  // Browsing the course: links back up to it and the part this lesson is in,
  // and the lessons either side, in the course's own order. Not in a test or
  // a refill, which have their own way on.
  const browse = !testing && !review;
  const near = (i) => (browse && track.lessons[i]
    ? { go: `lesson/${track.lessons[i].id}`, title: track.lessons[i].title, n: i + 1 } : null);
  const prev = near(lesson.index - 1);
  const next = near(lesson.index + 1);
  const parts = chunkLessons(track);
  const partAt = parts.findIndex((p) => lesson.index >= p.start && lesson.index < p.start + p.lessons.length);
  const whereFrom = browse ? crumbs([['tracks', 'Courses'], [`track/${track.id}`, track.name],
    ...(parts.length > 1 ? [[`track/${track.id}/${partAt + 1}`, parts[partAt].name]] : [])]) : '';
  // "Lesson 3 of 20" opens the whole course, part by part.
  const everyLesson = parts.map((p) => ({
    name: parts.length > 1 ? p.name : '',
    items: p.lessons.map((l, i) => ({ go: `lesson/${l.id}`, title: l.title, n: p.start + i + 1, done: store.isDone(l.id) })),
  }));

  ctx.setTitle(bossing ? `${bossWord} · ${bossName}` : testing ? `Test out · ${track.name}`
    : review ? `Refill · ${track.name}` : `${track.name} · ${position}/${total}`);

  // The teaching: the fuller explanation where a lesson has one (detail/), its
  // three bullets where it doesn't, then a worked example of the idea: its
  // code, what it gives (built in, expected.js EXAMPLES) and line by line.
  const detail = lesson.detail;
  const concept = `<ul class="concept">
          ${(detail && detail.explain ? detail.explain : lesson.concept).map((line) => `<li>${inline(line)}</li>`).join('')}
        </ul>`;
  const ex = detail && detail.example;
  const exOut = ex ? savedExample(lesson) : null;
  // Folded, like Go deeper, so the lesson stays short to scroll through on a
  // small screen; one tap opens it.
  const worked = ex ? `<details class="reveal worked">
          <summary>Worked example</summary>
          <div class="reveal-body">
            <p>${inline(ex.say)}</p>
            <pre class="worked-code">${colour(ex.code, lesson.lang)}</pre>
            <div class="worked-out" id="worked-out">${exOut ? exampleHTML(exOut) : '<p class="needs-note">Working it out&hellip;</p>'}</div>
            <p class="brief-head">Line by line</p>
            <ul class="worked-lines">${ex.lines.map(([bit, about]) => `<li><code>${escapeHTML(bit)}</code><span>${inline(about)}</span></li>`).join('')}</ul>
          </div>
        </details>` : '';
  // SQL written for SQLite here, and how the same thing looks where you'll work.
  const dialects = lesson.dialects ? `<details class="reveal">
          <summary>In other databases</summary>
          <div class="reveal-body">
            ${lesson.dialects.map(([db, text]) => `<p><b>${escapeHTML(db)}:</b> ${inline(text)}</p>`).join('')}
          </div>
        </details>` : '';

  // Depth on demand: why it works, the usual mistake, and where it turns up at
  // work. Folded, so the lesson itself stays three bullets long.
  const deeper = lesson.deeper ? `<details class="reveal deeper">
          <summary>Go deeper</summary>
          <div class="reveal-body">
            <p><b>Why it works.</b> ${inline(lesson.deeper.why)}</p>
            <p><b>The usual mistake.</b> ${inline(lesson.deeper.mistake)}</p>
            <p><b>At work.</b> ${inline(lesson.deeper.work)}</p>
          </div>
        </details>` : '';

  mount.className = `screen lesson-screen ${track.theme}`;
  mount.innerHTML = `
    <div class="stack">
      ${testing ? `<div class="session-bar">
        <span class="label">${bossing ? `${bossWord} &middot; ${escapeHTML(bossName)}` : 'Testing out'} &middot; question ${testOut.at + 1} of ${testOut.steps.length}</span>
        <button class="btn-text" id="test-stop">Stop</button>
      </div>` : inSession ? sessionBar(inSession) : ''}
      <div class="l-intro">
        ${whereFrom}
        <div class="lesson-head">
          <div class="lesson-kick">
            ${browse ? jumpMenu(`Lesson ${position} of ${total}`, everyLesson, `lesson/${lesson.id}`, `every lesson in ${track.name}`)
              : `<p class="label lesson-kicker" style="margin:0">
              ${bossing ? `${bossWord} &middot; ` : testing ? 'Testing out &middot; ' : review ? 'Refill &middot; ' : ''}${escapeHTML(track.name)} &middot; ${position} of ${total}
            </p>`}
            ${browse ? stepArrows(prev, next, 'lesson') : ''}
          </div>
          <span class="folio" aria-hidden="true">${folio(position)}</span>
        </div>
        <h1 class="display lesson-title">${escapeHTML(lesson.title)}</h1>

        ${testing ? '' : review ? `<details class="reveal recall-how">
          <summary>Remind me how it works</summary>
          <div class="reveal-body">${concept}${worked}</div>
        </details>` : `${concept}${worked}`}
        ${testing ? '' : deeper}
        ${testing ? '' : dialects}
      </div>

      <div class="task">
        <span class="label">Your turn</span>
        ${detail && detail.brief ? briefBlock(detail.brief, detail.brief.story) : `<p>${inline(lesson.task)}</p>`}
        ${isXl ? '<div class="xl-peeks" id="xl-peek" role="group" aria-label="The sheet"></div>' : ''}
        ${testing ? '' : `<details class="reveal io-fold lesson-expect" id="expect-fold">
          <summary>Expected output</summary>
          <div class="reveal-body" id="expected"><p class="needs-note">Working it out&hellip;</p></div>
        </details>`}
      </div>

      <div class="l-work stack">
      <div class="l-code stack">
      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">${LANG_LABEL[lesson.lang]}${cellNote}</span>
          <span class="editor-actions">${layoutSwitch()}<button class="btn-text" id="reset-code" style="font-size:12px">Reset</button></span>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" aria-label="${LANG_ARIA[lesson.lang]}"></textarea>
        <div class="snips" id="snips">
          ${snippets.map((s, i) =>
            `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      ${heavy.length ? `<p class="needs-note">First run also fetches
        ${escapeHTML(heavy.join(' and '))}, a one-off download.</p>` : ''}

      <div class="run-row">
        <button class="btn btn-accent" id="run">Run</button>
        <button class="btn-text" id="skip">${testing ? 'Stop the test' : review ? 'Not today' : 'Skip this'}</button>
      </div>
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

        ${pager(prev, next, `Other lessons in ${track.name}`)}
      </div>
    </div>
  `;

  const editor = $('#code', mount);
  wireLayoutSwitch(mount);

  // Excel: the sheet as it looks, with the formula's cell outlined, before
  // anything's typed, and any other sheet the answer reads (js/excel.py).
  // One namespace for every lesson's sheet, rebuilt each time, like Expected
  // output's below: not one more kept per Excel lesson opened.
  const peek = $('#xl-peek', mount);
  if (peek) {
    const others = [...new Set([...(lesson.solution).matchAll(/([A-Za-z_]\w*)!/g)].map((m) => m[1]))];
    python.whenReady(async () => {
      const out = await python.run({
        code: '', key: 'xl-peek', prelude, lang: 'excel', timeoutMs: 15000,
        check: `__judge__ = {"grids": _excel_peek(extra=${JSON.stringify(others)})}`,
      });
      if (!peek.isConnected) return;
      const grids = out.judge && out.judge.grids;
      if (!grids || !grids.length) return peek.remove();
      peek.innerHTML = sheetPreview(grids);
      showTarget(peek);
    });
  }
  if (!testing) guideIfDue('lesson');

  /* Expected output, folded like a practice question's: what the lesson's
     own solution shows when it runs. Not in a test-out or a Signature, where
     the checks use fixed data and the value would be a give-away.
     It's worked out ahead of time, never typed in by hand: expected.html runs
     every solution and writes what it shows into curriculum/expected.js,
     which comes with the app, so it's there as soon as the fold opens and
     Python (or R) isn't touched, charts included. Only a lesson changed
     since that file was made (its stamp, curriculum/index.js expectedStamp)
     works it out live, the first time the fold opens.
     A live run uses one namespace shared by every lesson's expected output,
     rebuilt each time (python.run's fresh), so only one lesson's copy of the
     tables is ever kept for it, not one per lesson opened. The time limit is
     long: a solution never loops forever, so running out of time could only
     mean a slow phone, and a timed-out run restarts Python, which would stop
     a Run of the learner's going at the same time. */
  // A worked example whose result isn't built in yet (a new or changed one)
  // is worked out live, once, in the same shared namespace.
  const workedOut = $('#worked-out', mount);
  if (workedOut && ex && !exOut) {
    python.whenReady(async () => {
      const out = await python.run({
        code: ex.code, key: 'expected', prelude: examplePrelude(lesson), needs: lesson.needs || [], lang: lesson.lang, timeoutMs: 120000,
      });
      if (workedOut.isConnected) workedOut.innerHTML = exampleHTML(out);
    });
  }

  const expectFold = $('#expect-fold', mount);
  if (expectFold) {
    let asked = false;
    expectFold.addEventListener('toggle', async () => {
      if (!expectFold.open || asked) return;
      asked = true;
      const out = savedExpected(lesson) || await python.run({
        code: lesson.solution, key: 'expected', prelude, needs: lesson.needs || [],
        lang: lesson.lang, timeoutMs: 120000,
      });
      const box = $('#expected', mount);
      if (!box || !box.isConnected) return;
      box.innerHTML = expectedHTML(out);
      showTarget(box);
      if (!out.ok) asked = false;              // a dropped download: try again on the next open
    });
  }
  const result = $('#result', mount);
  editor.value = saved ?? lesson.starter;

  /* ── editor ergonomics ─────────────────────────────── */

  let saveTimer = 0;
  const flush = () => {
    saveTimer = 0;
    store.saveDraft(draftId, editor.value);
  };
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 400);
  };

  // Leaving by the arrows, the list, the pager, a link up or a tag (js/nav.js):
  // anything typed in the last moment is saved first.
  wireGetAbout(mount, ctx, () => {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    flush();
  });

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
        name: `querycafe-${lesson.id}`, title: lesson.title, about: lesson.task, code: editor.value, lang: lesson.lang, setup: lesson.setup,
      });
      if (saved) toast(kind === 'py' ? 'Script saved' : 'Notebook saved. Open it in Jupyter, VS Code or Colab');
    });
  });

  // In a recall, looking at the answer means it wasn't remembered yet. Either
  // look (the answer, the nudge, the smaller step) means a pass isn't first try.
  let peeked = false;
  let helped = false;
  $('#sol-box', mount).addEventListener('toggle', (event) => {
    if (event.target.open) peeked = true;
  });
  $('#hint-box', mount).addEventListener('toggle', (event) => {
    if (event.target.open) helped = true;
  });

  $('#use-sol', mount).addEventListener('click', () => {
    editor.value = lesson.solution;
    save();
    $('#sol-box', mount).open = false;
    editor.scrollIntoView({ block: 'center', behavior: 'smooth' });
    toast('Run it and see what it does');
  });

  // A skipped recall stays due; it just leaves for today.
  const stopTest = () => {
    store.cancelTestOut();
    ctx.go(bossing ? bossHome : `track/${track.id}`);
  };
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
    // Ctrl+Enter works while Python is still loading; don't queue a run the
    // button can't show (it would read "Run" while one was waiting).
    if (busy || !python.isReady || !rReady) return;
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
    runButton.textContent = isSql ? 'Getting the database ready…' : isDax ? 'Getting DAX ready…' : isXl ? 'Getting Excel ready…' : isR ? 'Getting R ready…' : 'Warming up Python…';
    python.whenReady(() => {
      if (!runButton.isConnected || !rReady) return;
      runButton.disabled = false;
      runButton.textContent = 'Run';
    });
  }

  // An R lesson starts R loading as it opens (about 12 MB the first time,
  // kept after that), and the button says how far it's got. If it can't
  // load, Run is offered anyway: the run says what went wrong.
  if (isR) {
    import('../r.js').then(({ rEngine }) => {
      if (rEngine.isReady) { rReady = true; return; }
      runButton.disabled = true;
      runButton.textContent = 'Getting R ready…';
      const off = rEngine.onStatus((text) => {
        if (runButton.isConnected && text && !busy) runButton.textContent = text;
      });
      rEngine.warm().then(() => {
        off();
        rReady = true;
        if (!runButton.isConnected || !python.isReady) return;
        runButton.disabled = false;
        runButton.textContent = 'Run';
      });
    });
  }

  function paint(out) {
    // Charts, then the sheet or table (or printed output), then what the code
    // stored, then the error, if there was one (ui.js).
    const parts = outputBlocks(out, {
      blocks: out.blocks, sql: isSql,
      fail: isDax ? 'The measure has a problem' : isXl ? "Excel won't take that formula" : isR ? 'R stopped here' : '',
    });
    const shown = parts.length - (out.ok ? 0 : 1);   // anything of the learner's own to look at

    if (!out.ok) {
      parts.push(out.downloadFailed
        ? verdict('no', 'Nothing wrong with your code',
          'A library this lesson needs didn\'t arrive. Run it again once you\'re online; after that it\'s kept.')
        : out.timedOut
        ? verdict('no', 'That ran too long',
          'This is nearly always a loop that never ends, so check whatever is meant to stop it. Python has restarted, so just Run again.')
        : isDax
        ? verdict('no', 'Read the message',
          'It names the line, and usually the fix: a missing bracket, a misspelt column, or a column that needs SUM around it.')
        : isXl
        ? verdict('no', 'Read the message',
          'Real Excel would refuse to leave the cell too. The message says what it couldn\'t read: usually a bracket, a comma or a quote mark.')
        : isSql
        ? verdict('no', 'Read the first line, then the second',
          "The first is SQLite's complaint. The second, when there is one, is what to try.")
        : isR
        ? verdict('no', 'Read the first line',
          'It says what R couldn\'t do. The Tip, when there is one, says what to try.')
        : verdict('no', 'Read it from the bottom up',
          'The Tip, when there is one, says what to try. Above it, the error names the problem and the line it happened on.'));
    } else if (out.check && !out.check.passed) {
      parts.push(verdict('no', 'Not yet', out.check.msg));
    } else if (out.check && out.check.passed) {
      // First try: no failed run of this lesson ever, and no look at the nudge, smaller step or answer.
      const clean = !peeked && !helped && !(store.state.misses[lesson.id] > 0);
      const xpBefore = store.state.xp;
      const reward = store.complete(lesson.id, 20 + lesson.mins * 2);
      if (track.id === 'projects') {
        store.saveWork(lesson.id, { text: out.stdout || '', image: (out.images && out.images[0]) || null });
      }
      // Once per question: a second Run on it must not move the test on again.
      let endsTest = false;
      if (testing && testNext === undefined) {
        testNext = store.advanceTestOut(lesson.id);
        endsTest = testNext === null;
        if (endsTest && mini) store.beatMini(testOut.track);
        else if (endsTest && bossing) store.beatBoss(testOut.stage);
        else if (endsTest) store.markTestedOut(testOut.all);
      }
      // A Refill counts once, while it's due (store.isDue): running it again
      // after passing is a replay, and moves nothing on. Any pass of it clears
      // its draft (each Run saves it first), so the next time it comes back it
      // starts cold again.
      const recalled = review && (peeked ? store.retryReview(lesson.id) : store.reviewed(lesson.id));
      if (review) {
        clearTimeout(saveTimer);
        saveTimer = 0;
        store.clearDraft(draftId);
      } else if (!review && reward.isFirst) store.scheduleReview(lesson.id);
      if (!review && !testing) store.setLastLesson(lesson.id);   // what's next carries on from here
      const notes = gameAfter({
        kind: recalled ? 'recall' : testing ? (bossing && endsTest ? (mini ? 'mini' : 'boss') : 'test') : 'lesson',
        isFirst: reward.isFirst, clean, stage: bossing && !mini ? testOut.stage : undefined, track: mini ? track : undefined,
        usedSpares: reward.usedSpares, xpBefore,
      });
      buzz(30);
      if (!shown && (lesson.lang === 'python' || isR)) {
        parts.push(`<p class="needs-note">That ran without showing anything. To see a value, put its name on a line of its own at the end.</p>`);
      }
      parts.push(done(reward, lesson, notes));
    } else if (!parts.length) {
      parts.push(verdict('no', 'Nothing came back', isDax
        ? 'That ran, but there was no measure in it. Start a line with a name, then =, like Total = SUM(order_items[qty]).'
        : isXl
        ? 'The cell is still empty. Type a formula, starting with =.'
        : isSql
        ? 'That ran, but no table came back. End with a SELECT.'
        : 'That ran, but produced nothing. Put a variable or a chart on the last line.'));
    }

    const passed = Boolean(out.ok && out.check && out.check.passed);
    misses = passed ? 0 : misses + 1;
    if (!passed && !out.timedOut && !out.downloadFailed) store.miss(lesson.id);   // a dropped download isn't a miss
    // A failed run on something new ends the first-try run (recalls and tests don't count either way).
    if (!passed && !out.downloadFailed && !review && !testing && !store.isDone(lesson.id)) gameMissed();
    if (misses >= 3 && !testing) {           // a test out stays cold: no scaffold of the answer
      parts.push(`<div class="out">
        <div class="out-head">A smaller step: fill in the ___ gaps</div>
        <pre class="out-body">${escapeHTML(skeleton(lesson))}</pre>
      </div>
      <button class="btn btn-quiet btn-sm" id="use-skeleton" style="margin-top:10px">Put this in the editor</button>`);
    }

    result.innerHTML = parts.join('');
    ctx.refreshChrome();
    if (!testing) tipIfDue('lesson');

    const useSkeleton = $('#use-skeleton', result);
    if (useSkeleton) {
      useSkeleton.addEventListener('click', () => {
        helped = true;
        editor.value = skeleton(lesson);
        save();
        editor.focus();
        editor.scrollIntoView({ block: 'center', behavior: 'smooth' });
        toast('Swap each ___ for the real thing');
      });
    }

    // The reward should move — a static number doesn't register as a win.
    const xpNode = $('#xp-count', result);
    if (xpNode) countUp(xpNode, Number(xpNode.dataset.to));
    const won = $('.won', result);
    if (won) confetti(won, { count: won.hasAttribute('data-big') ? 150 : 70 });
    // only if sounds are on: glasses for a Taste test, the counter bell for a Signature
    if (won) playSound(won.dataset.sound || (won.hasAttribute('data-big') ? 'hiss' : 'clink'));
    stampSounds(result.querySelectorAll('.ach-drop'), 1.08, 0.25);   // a new achievement's stamp landing

    const next = $('#next-lesson', result);
    if (next) {
      next.addEventListener('click', () => {
        if (testing) return ctx.go(testNext ? `lesson/${testNext}/test` : bossing ? bossHome : `track/${track.id}`);
        if (nextInSession(ctx, route)) return;
        if (review) goNextReview(ctx);
        else goNext(ctx, lesson);
      });
    }

    showResult(mount, result);
  }

  function verdict(kind, heading, body) {
    return `<div class="verdict verdict-${kind === 'yes' ? 'yes' : 'no'}">
      <span class="label">${escapeHTML(heading)}</span>
      <p>${inline(body)}</p>
    </div>`;
  }

  function done(reward, lesson, notes = []) {
    // Where Next goes, along the path: crossing into another track says which.
    const stop = nextStop(lesson);
    const onwards = !stop ? `Finish ${escapeHTML(track.name)}`
      : stop.track !== track ? `On to ${escapeHTML(stop.track.name)}` : 'Next lesson';
    // A peeked recall says so first: when it comes back matters more than the streak.
    const streakLine = review && peeked ? 'You looked this time, so it comes back tomorrow.'
      : reward.streakUp ? `Day ${reward.streak} in a row.`
      : review ? 'Still in there. It comes back later, further apart.'
      : (reward.isFirst ? 'Locked in.' : 'Still solid the second time round.');
    const more = review && dueNow().length > 0;
    // A project is one part of the Projects track, however many steps it has.
    const projectDone = track.id === 'projects'
      && chunkLessons(track).some((part) => part.lessons[part.lessons.length - 1].id === lesson.id);
    // A first finish earns the lesson's stamp, which lands under the win.
    const stamped = reward.isFirst && !testing && !review;
    const stamps = track.lessons.filter((l) => store.isDone(l.id)).length;
    // Only when this pass is what finished it: the last lesson with others skipped isn't.
    const trackDone = reward.isFirst && !testing && track.lessons.every((l) => store.isDone(l.id));
    // a bigger burst of confetti: a track, a project, a test or boss beaten, a quest or a level
    const big = trackDone || projectDone || (testing && !testNext) || notes.some((n) => n.big);
    return `
      <div class="won"${big ? ' data-big' : ''}${bossing && !testNext ? ` data-sound="${mini ? 'glasses' : 'bell'}"` : ''}>
        <div class="won-text">
          <div class="won-label">${testing ? (testNext ? 'Correct' : bossing ? `${bossWord} passed` : 'Part tested out')
            : review ? (peeked ? 'Done, with a look' : 'Remembered') : trackDone ? 'Course complete' : "That's it"}</div>
          <p class="won-note">${escapeHTML(testing
            ? (testNext ? (testOut.steps.length - testOut.at === 1 ? 'One more to go.' : `${testOut.steps.length - testOut.at} more to go.`) : bossing ? `${testOut.steps.length} cold questions from "${bossName}", all right.`
              : `${testOut.all.length} lessons marked done, each stamped on the course's card. They come back as Refills like the rest.`)
            : streakLine)}</p>
          ${projectDone ? '<p class="won-note">Project finished. Its write-up is ready on the Projects page.</p>' : ''}
          ${trackDone && hasMini(track) && !miniBeaten(track.id) ? `<p class="won-note">Its Taste test is waiting on the ${escapeHTML(track.name)} page: ${miniSteps(track).length} cold questions, +${MINI_XP} points.</p>` : ''}
          ${noteLines(notes)}
        </div>
        ${reward.xp ? `<p class="won-xp">+<span id="xp-count" data-to="${reward.xp}">0</span><small> point${reward.xp === 1 ? '' : 's'}</small></p>` : ''}
      </div>
      ${stamped ? `<div class="stamp-drop">
        ${stampSVG(lesson, store.state.done[lesson.id])}
        <p class="stamp-caption"><b>Stamped.</b> That's ${stamps} of ${track.lessons.length} on your
        ${escapeHTML(track.name)} card, kept on the course's page.</p>
      </div>` : ''}
      ${achDrops(notes)}
      ${trackDone ? `<div class="latte-drop">
        ${latteArtSVG()}
        <p class="stamp-caption"><b>Course complete.</b> Every lesson in ${escapeHTML(track.name)}, done.
        Have this one on us.</p>
      </div>` : ''}
      <button class="btn btn-primary btn-block" id="next-lesson" style="margin-top:14px">
        ${testing ? (testNext ? 'Next question' : bossing && !mini ? 'Back to Courses' : `Back to ${escapeHTML(track.name)}`)
          : inSession ? (lastStep(inSession) ? 'Done for today' : 'Next step')
          : review ? (more ? 'Next refill' : 'Back to the café') : onwards}
      </button>
      ${anotherWay(editor.value, lesson.solution)}
    `;
  }

  if (store.isDone(lesson.id) && !review && !testing) {
    result.innerHTML = `<p class="needs-note">You've done this one. Replay it, or skip ahead.</p>`;
  }
}

const dueNow = () => dueRefills();

/* The answer as a scaffold. On each line the starter didn't already have,
   keywords and function names stay, so the shape of the answer is there, and
   anything new is blanked: names, numbers, string contents, DAX [refs].
   Whatever the starter already used stays visible. A DAX line keeps its
   measure name, which the task gives anyway.

   When the answer is made only of names the starter already had (finish a
   loop, fix a WHERE), that leaves no gaps at all, and the "smaller step"
   would be the whole answer. Then every new line is blanked, known names
   included, so the shape is there and the thinking isn't done for you. */
export function skeleton(lesson) {
  const loose = scaffold(lesson, false);
  return loose.includes('___') ? loose : scaffold(lesson, true);
}

function scaffold(lesson, strict) {
  const lang = lesson.lang;
  const given = new Set(lesson.starter.split('\n').map((l) => l.trim()));
  const seen = strict ? new Set() : new Set(tokens(lesson.starter, lang).map((t) => t.text));
  return lesson.solution.split('\n').map((line) => {
    if (!line.trim() || given.has(line.trim())) return line;
    const head = lang === 'dax' ? (line.match(/^\s*[A-Za-z_][\w %]*?\s*:?=(?!=)/) || [''])[0] : '';
    const out = head + tokens(line.slice(head.length), lang).map((t) => {
      if (!t.kind || seen.has(t.text) || t.kind === 'kw' || t.kind === 'fn' || t.kind === 'com') return t.text;
      if (t.kind === 'str') return t.text.replace(/^([^"']*["'])[\s\S]*?(["']?)$/, '$1___$2');
      if (t.kind === 'ref') return lang === 'dax' ? '[___]' : '___';
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
  ctx.go(id ? refillRoute(id) : 'home');
}

/* What the solution's run shows, drawn the way a learner's own run is
   (ui.js, outputBlocks): charts, then tables (an Excel sheet, a DAX matrix)
   or printed output, then whatever the code ended up storing. An Excel
   answer shows only the cells it fills, with no formula and no step-through
   (ui.js, answerOnly): the formula is what the learner writes. A lesson that
   showed nothing when it ran (the check looking at a variable) would say so,
   though tests.html makes sure none does. */
/* A lesson's built-in expected output (curriculum/expected.js; see the
   Expected output fold above), or null when there's none for this version
   of the lesson: then it's worked out live. */
function savedExpected(lesson) {
  const saved = EXPECTED[lesson.id];
  return saved && saved.out && saved.stamp === expectedStamp(lesson) ? { ok: true, ...saved.out } : null;
}

/* A lesson's worked example (curriculum/detail), as it runs: built in
   (expected.js EXAMPLES) for this version of the example, or null, when the
   lesson works it out live once the engine is up. */
function savedExample(lesson) {
  const saved = EXAMPLES && EXAMPLES[lesson.id];
  return saved && saved.out && saved.stamp === exampleStamp(lesson) ? { ok: true, ...saved.out } : null;
}

function exampleHTML(out) {
  if (!out.ok) return '<p class="needs-note">The example\'s result couldn\'t be worked out just now.</p>';
  return outputBlocks(out, { blocks: (out.blocks || []).filter((b) => !b.steps), alt: 'The chart the example draws' }).join('');
}

function expectedHTML(out) {
  if (!out.ok) {
    return `<p class="needs-note">${out.downloadFailed
      ? "Something this needs didn't download. Open this again once you're online."
      : "The expected output couldn't be worked out just now. Open this again in a moment."}</p>`;
  }
  if (!showsOutput(out)) {
    return '<p class="needs-note">Nothing shows on screen when this one runs: the check looks at what your code stores instead.</p>';
  }
  return outputBlocks(out, { blocks: answerOnly(out.blocks), alt: 'The chart the answer draws' }).join('');
}

/* Where "Next lesson" goes: the next lesson of this step of the path. At the
   end of a step (the Python course's part 7, the end of seaborn...) it's the
   first thing still to do from here on along the path, never this lesson
   again: Skip on an unfinished lesson used to land straight back on it. */
function nextStop(lesson) {
  const at = PATH_LESSONS.indexOf(lesson);
  const after = PATH_LESSONS[at + 1];
  if (after && after.track === lesson.track) return after;
  const open = openLessons((id) => store.isDone(id), store.state.startAt).filter((l) => l !== lesson);
  return open.find((l) => PATH_LESSONS.indexOf(l) > at) || open[0] || null;
}

function goNext(ctx, lesson) {
  const next = nextStop(lesson);
  if (!next) return ctx.go('you/progress');
  // Only say "complete" when it is: skipping the last lesson lands here too.
  const track = lesson.track;
  if (next.track !== track && track.lessons.every((l) => store.isDone(l.id))) toast(`${track.name} complete`);
  ctx.go(`lesson/${next.id}`);
}
