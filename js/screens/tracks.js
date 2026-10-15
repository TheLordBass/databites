import { escapeHTML, tally, folio, toast, shortDay, frameGrid } from '../ui.js';
import {
  bossSteps, bossBeaten, stageDone, startBoss, BOSS_XP, hasMini, miniSteps, miniBeaten, startMini, trackDone, MINI_XP,
} from '../game.js';
import { writeupReady, saveWriteup } from '../writeup.js';
import { stampSVG, miniStampSVG } from '../stamps.js';
import { QUESTIONS } from '../exam/pl300.js';
import { store } from '../store.js';
import { guideIfDue } from '../guide.js';
import {
  TRACKS, TRACK_GROUPS, trackById, COLUMNS, DATASETS, ALL_LESSONS, chunkLessons, stepLessons, stepOf, whatsNext, lessonById,
} from '../curriculum/index.js';

/* PL-300 prep sits with the Power BI tracks: it's where someone heading for
   the exam will look. Its tally counts questions tried. */
function examCard() {
  const answers = store.examState().answers;
  const tried = QUESTIONS.filter((q) => answers[q.id]).length;
  return `
    <button class="track t-pbi" data-go="exam">
      <div class="track-top">
        <span class="track-name">PL-300 exam prep</span>
        <span class="track-count">${tried}/${QUESTIONS.length}</span>
      </div>
      <p class="track-blurb">Exam-style questions, case studies and a timed mock</p>
      ${tally(tried, QUESTIONS.length, '', 12)}
    </button>`;
}

/* ── Find a lesson ─────────────────────────────────────────
   Every word typed has to turn up in a lesson's title, its course, its
   teaching or its task. Lessons with it in the title come first, then the
   rest in course order. What was typed lasts until the app closes, so
   coming back from a lesson finds the results as they were. */
let query = '';
const plain = (text) => String(text || '').replace(/[`*_]/g, '');
const wordsOf = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);
let haystacks = null;

function findLessons(text) {
  const words = wordsOf(text);
  if (!words.length) return [];
  if (!haystacks) {
    haystacks = new Map(ALL_LESSONS.map((l) => [l,
      [l.title, l.track.name, ...(l.concept || []), l.task].map(plain).join(' ').toLowerCase()]));
  }
  const whole = words.join(' ');
  return ALL_LESSONS
    .filter((l) => words.every((w) => haystacks.get(l).includes(w)))
    .map((l) => {
      const title = l.title.toLowerCase();
      return { l, score: title.includes(whole) ? 3 : words.every((w) => title.includes(w)) ? 2 : 1 };
    })
    .sort((a, b) => b.score - a.score);           // stable: ties keep the course order
}

// The words found, marked, in text that is escaped around them. Words under
// three letters ("by", "a") still have to match, but aren't marked: they'd
// light up inside every other word.
function marked(text, words) {
  const long = words.filter((w) => w.length > 2);
  if (!long.length) return escapeHTML(text);
  const re = new RegExp(`(${long.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(re).map((part, i) => (i % 2 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part))).join('');
}

// Where a lesson that doesn't say it in its title does say it.
function snippet(lesson, words) {
  const lines = [...(lesson.concept || []), lesson.task || ''].map(plain);
  const line = lines.find((t) => words.every((w) => t.toLowerCase().includes(w)))
    || lines.find((t) => t.toLowerCase().includes(words[0]));
  if (!line) return '';
  const at = Math.max(0, line.toLowerCase().indexOf(words[0]));
  // About 40 characters either side, cut at spaces so no word is chopped.
  let start = Math.max(0, at - 40);
  let end = Math.min(line.length, at + 70);
  if (start > 0) start = line.indexOf(' ', start) + 1 || start;
  if (start > at) start = at;
  if (end < line.length) end = Math.max(at + words[0].length, line.lastIndexOf(' ', end));
  return `${start ? '&hellip;' : ''}${marked(line.slice(start, end), words)}${end < line.length ? '&hellip;' : ''}`;
}

function searchResults(text) {
  const words = wordsOf(text);
  const hits = findLessons(text);
  if (!hits.length) {
    return `<p class="search-count">No lesson mentions &ldquo;${escapeHTML(text.trim())}&rdquo;. Try one word, like
      <b>join</b>, <b>chart</b> or <b>average</b>.</p>`;
  }
  const shown = hits.slice(0, 30);
  return `<p class="search-count">${hits.length} lesson${hits.length === 1 ? '' : 's'}${
    hits.length > shown.length ? `, the first ${shown.length} shown. Add a word to narrow it down.` : ''}</p>
    <div class="search-hits">${shown.map(({ l, score }) => {
      const done = store.isDone(l.id);
      return `<button class="lesson-row problem-row search-hit ${l.track.theme}${done ? ' is-done' : ''}" data-go="lesson/${l.id}">
        <span class="lesson-n">${done ? miniStampSVG(l) : folio(l.index + 1)}</span>
        <span class="problem-main">
          <span class="lesson-name">${marked(l.title, words)}</span>
          ${score < 2 ? `<span class="search-bit">${snippet(l, words)}</span>` : ''}
          <span class="problem-tags">${escapeHTML(l.track.name)} &middot; lesson ${l.index + 1} of ${l.track.lessons.length}</span>
        </span>
      </button>`;
    }).join('')}</div>`;
}

export function renderTracks(mount, ctx) {
  ctx.setTitle('Courses');
  mount.className = 'screen';

  const totalMins = ALL_LESSONS.reduce((n, l) => n + l.mins, 0);
  const doneAll = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  // Where "what's next" is: that step gets a Next line, so the path has a "you are here".
  const next = whatsNext((id) => store.isDone(id), store.state.startAt, store.lastLessonId());
  const here = next ? stepOf(next) : null;
  // The stage you're on comes first in the intro and says "You're here"; every
  // stage is listed open below it, so nobody's choice at the welcome hides a course.
  const current = Math.max(0, here ? TRACK_GROUPS.findIndex((g) => g.steps.includes(here)) : TRACK_GROUPS.length - 1);
  const stageLessons = (group) => group.steps.flatMap(stepLessons);
  const nowLessons = stageLessons(TRACK_GROUPS[current]);
  const nowDone = nowLessons.filter((l) => store.isDone(l.id)).length;
  let number = 0;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Stage ${current + 1} of ${TRACK_GROUPS.length}</p>
        <h1 class="display-xl">${escapeHTML(TRACK_GROUPS[current].name)}</h1>
        <p class="muted" style="margin:14px 0 0;font-size:15px">
          ${escapeHTML(TRACK_GROUPS[current].note)} You've done ${nowDone} of its ${nowLessons.length} lessons.
        </p>
        <p class="muted" style="margin:10px 0 0;font-size:15px">
          Every course is below, and all of them are open. Carry on with this
          stage, or go straight to whatever you need.
        </p>
      </div>

      <div class="search" role="search">
        <label class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>
          <input type="search" id="lesson-search" value="${escapeHTML(query)}" placeholder="Find a lesson: VLOOKUP, groupby, join"
                 aria-label="Find a lesson" autocomplete="off" spellcheck="false" enterkeyhint="search">
        </label>
        <div id="search-results" aria-live="polite"></div>
      </div>

      <div class="stack" id="course-list">
      ${TRACK_GROUPS.map((group, stage) => {
        const lessons = stageLessons(group);
        const done = lessons.filter((l) => store.isDone(l.id)).length;
        const finished = done === lessons.length;
        const isCurrent = stage === current;
        return `
          <section class="track-group${isCurrent ? ' is-current' : ''}" id="stage-${stage + 1}">
            <div class="section-head">
              <p class="label label-mark">${stage + 1} &middot; ${escapeHTML(group.name)}</p>
              <span class="part-count">${isCurrent ? '<span class="next-tag">You&rsquo;re here</span> ' : ''}${
                finished ? 'Done' : `${done} of ${lessons.length}`}</span>
            </div>
            ${isCurrent ? '' : `<p class="stage-note">${escapeHTML(group.note)}</p>`}
            <div class="tracklist">
              ${group.steps.map((step) => {
                const track = trackById(step.track);
                const list = stepLessons(step);
                const done = list.filter((l) => store.isDone(l.id)).length;
                number += 1;
                return `
                  <button class="track ${track.theme}" data-go="track/${track.id}">
                    <div class="track-top">
                      <span class="track-step">${folio(number)}</span>
                      <span class="track-name">${escapeHTML(track.name)}</span>
                      <span class="track-count">${done}/${list.length}</span>
                    </div>
                    <p class="track-blurb">${escapeHTML(step.about || track.blurb)}</p>
                    ${step === here ? `<p class="track-next"><span class="next-tag">Next</span>
                      <span>${folio(next.index + 1)} &middot; ${escapeHTML(next.title)}</span></p>` : ''}
                    ${miniReady(track, step) ? `<p class="track-next"><span class="next-tag">Taste test</span>
                      <span>Ready on its page</span></p>` : ''}
                    ${tally(done, list.length, '', 12)}
                  </button>`;
              }).join('')}
              ${group.exam ? examCard() : ''}
            </div>
            ${bossRow(stage)}
          </section>`;
      }).join('')}

      <p class="muted" style="margin:6px 0 0;font-size:13px">
        All together: ${TRACKS.length} courses and ${ALL_LESSONS.length} lessons, about
        ${Math.round(totalMins / 60)} hours in three-minute pieces. You've done ${doneAll}.
        Nobody does it all at once.
      </p>

      <details class="reveal">
        <summary>What's in the <code>cafe</code> table?</summary>
        <div class="reveal-body">
          <p>Most lessons use the same 120 rows of caf&eacute; sales, so the mechanics are
          the only new thing you're learning at the time.</p>
          <div class="out">${frameGrid({
            header: ['type', 'what it holds'], index: COLUMNS.map((c) => c[0]), indexName: 'column',
            rows: COLUMNS.map((c) => [c[1], c[2]]), num: [false, false], shown: `${COLUMNS.length} columns, 120 rows`,
          })}</div>
        </div>
      </details>

      <details class="reveal">
        <summary>All the tables you can reach</summary>
        <div class="reveal-body">
          <p>Every one of these is loaded in every lesson and in the Sandbox, with no
          imports, no downloads.</p>
          ${DATASETS.map(([name, shape, note]) => `
            <p style="margin:0 0 10px">
              <code>${escapeHTML(name)}</code>
              <span style="color:var(--ink-3);font-size:.85em"> &nbsp;${escapeHTML(shape)}</span><br>
              ${escapeHTML(note)}
            </p>`).join('')}
        </div>
      </details>
      </div>
    </div>
  `;

  delegate(mount, ctx);
  guideIfDue('tracks');

  // Find a lesson: the results stand in for the course list while there's a search.
  const search = mount.querySelector('#lesson-search');
  const results = mount.querySelector('#search-results');
  const courses = mount.querySelector('#course-list');
  const show = () => {
    query = search.value;
    const on = Boolean(query.trim());
    results.innerHTML = on ? searchResults(query) : '';
    courses.hidden = on;
  };
  search.addEventListener('input', show);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {               // straight to the best match
      const first = results.querySelector('[data-go]');
      if (first) ctx.go(first.dataset.go);
    } else if (event.key === 'Escape' && search.value) {
      search.value = '';
      show();
    }
  });
  if (query.trim()) show();
  mount.addEventListener('click', (event) => {
    const boss = event.target.closest('[data-boss]');
    if (boss) startBoss(ctx, Number(boss.dataset.boss));
  });
}

/* A finished track whose mini boss is still waiting. Said once, on the step
   that ends the track (the Python course is two steps of the path). */
function miniReady(track, step) {
  const lastStep = step.to === undefined || step.to >= track.lessons.length;
  return lastStep && hasMini(track) && trackDone(track) && !miniBeaten(track.id);
}

/* A track's mini boss (its Taste test, on screen), on its page, the way a
   stage's boss (its Signature) is on Tracks. */
function miniRow(track) {
  if (!hasMini(track)) return '';
  const n = miniSteps(track).length;
  const beaten = miniBeaten(track.id);
  if (beaten) {
    return `<p class="boss-note"><span class="boss-tag">Taste test</span> Passed ${escapeHTML(shortDay(beaten))}.</p>`;
  }
  if (!trackDone(track)) {
    return `<p class="boss-note"><span class="boss-tag">Taste test</span> Finish the course to take it:
      ${n} cold questions from across it, +${MINI_XP} points.</p>`;
  }
  return `<button class="btn btn-accent btn-block boss-go" data-mini="${track.id}">Take the Taste test:
    ${n} cold questions, +${MINI_XP} points</button>`;
}

/* The end of a stage: its boss (js/game.js). Locked until every lesson in the
   stage is done, then a quiet button, then the day it was beaten. */
function bossRow(stage) {
  const n = bossSteps(stage).length;
  const beaten = bossBeaten(stage);
  if (beaten) {
    return `<p class="boss-note"><span class="boss-tag">Signature</span> Passed ${escapeHTML(shortDay(beaten))}.</p>`;
  }
  if (!stageDone(stage)) {
    return `<p class="boss-note"><span class="boss-tag">Signature</span> Finish the stage to take it:
      ${n} cold questions from across it, +${BOSS_XP} points.</p>`;
  }
  return `<button class="btn btn-quiet btn-block boss-go" data-boss="${stage}">Take the Signature:
    ${n} cold questions, +${BOSS_XP} points</button>`;
}

export function renderTrack(mount, ctx) {
  const track = trackById(ctx.params.id);
  if (!track) return ctx.go('tracks');

  const done = track.lessons.filter((l) => store.isDone(l.id)).length;
  const mins = track.lessons.reduce((n, l) => n + l.mins, 0);
  const upNext = (track.lessons.find((l) => !store.isDone(l.id)) || {}).id;

  ctx.setTitle(track.name);
  ctx.showBack(true);
  // R loads on demand; opening its course page starts it, so the first lesson is ready sooner.
  if (track.lang === 'r') import('../r.js').then(({ rEngine }) => rEngine.warm());
  mount.className = `screen lesson-screen ${track.theme}`;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label lesson-kicker">Course</p>
        <h1 class="display-xl" style="margin:6px 0 10px;color:var(--accent)">
          ${escapeHTML(track.name)}
        </h1>
        <p class="muted" style="margin:0 0 18px;font-size:15px">${escapeHTML(track.blurb)}</p>
        ${tally(done, track.lessons.length, 'tall card', 20)}
        <p class="muted" style="margin:12px 0 0;font-size:12.5px">
          ${done} of ${track.lessons.length} done &middot; ${mins} min total
        </p>
        ${miniRow(track)}
      </div>

      ${done ? `<details class="reveal" id="stamp-card">
        <summary>Your stamp card: ${done} of ${track.lessons.length}</summary>
        <div class="stamp-grid">
          ${track.lessons.filter((l) => store.isDone(l.id))
            .map((l) => stampSVG(lessonById(l.id), store.state.done[l.id])).join('')}
        </div>
      </details>` : ''}

      <div class="lessons">
        ${chunkLessons(track).map((part, partIndex) => {
          const partDone = part.lessons.filter((l) => store.isDone(l.id)).length;
          const allDone = partDone === part.lessons.length;
          // Projects build step on step, so there's nothing to test out of there.
          const testOut = !allDone && track.id !== 'projects' && part.lessons.length > 1
            ? `<button class="btn-text part-test" data-testout="${partIndex}">Know these already? Test out</button>`
            : '';
          const writeup = track.id === 'projects' && writeupReady(part)
            ? `<button class="btn btn-quiet btn-block" data-writeup="${partIndex}" style="margin-top:14px">
                 Make a write-up for your portfolio</button>`
            : '';
          return `
            <section class="part ${allDone ? 'is-done' : ''}">
              <div class="part-head">
                <span class="part-name">${escapeHTML(part.name)}</span>
                <span class="part-count">${allDone ? 'Done' : `${partDone}/${part.lessons.length}`}</span>
              </div>
              ${part.lessons.map((lesson, i) => {
                const isDone = store.isDone(lesson.id);
                const isNext = !isDone && lesson.id === upNext;
                return `
                  <button class="lesson-row ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}"
                          data-go="lesson/${lesson.id}">
                    <span class="lesson-n">${isDone ? miniStampSVG(lessonById(lesson.id)) : folio(part.start + i + 1)}</span>
                    <span class="lesson-name">${escapeHTML(lesson.title)}</span>
                    ${isNext ? '<span class="next-tag">Next</span>'
                             : `<span class="lesson-mins">${lesson.mins}m</span>`}
                  </button>`;
              }).join('')}
              ${testOut}
              ${writeup}
            </section>`;
        }).join('')}
      </div>
    </div>
  `;

  delegate(mount, ctx);
  guideIfDue('track');

  // Opened from a lesson's link to its part (track/excel/2): that part, in view.
  const here = Number(ctx.params.mode) > 0 && mount.querySelectorAll('.part')[Number(ctx.params.mode) - 1];
  if (here) {
    here.classList.add('is-here');
    requestAnimationFrame(() => here.scrollIntoView({ block: 'start' }));
  }

  mount.addEventListener('click', (event) => {
    const fight = event.target.closest('[data-mini]');
    if (fight) startMini(ctx, fight.dataset.mini);
  });

  mount.addEventListener('click', (event) => {
    const test = event.target.closest('[data-testout]');
    if (!test) return;
    const index = Number(test.dataset.testout);
    const part = chunkLessons(track)[index];
    // Its last two lessons: the ones that lean on everything before them.
    const steps = part.lessons.slice(-2).map((l) => l.id);
    store.startTestOut(track.id, index, steps, part.lessons.map((l) => l.id));
    ctx.go(`lesson/${steps[0]}/test`);
  });

  mount.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-writeup]');
    if (!button) return;
    const part = chunkLessons(track)[Number(button.dataset.writeup)];
    if (await saveWriteup(part)) toast('Write-up saved as a web page for your portfolio');
  });
}

function delegate(mount, ctx) {
  mount.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });
}
