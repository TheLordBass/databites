/* PL-300 prep: an overview (route exam) and one screen that runs a question
   set (route quiz). A set is either practice (a few questions, feedback after
   each) or a mock (40 questions against the clock, marked at the end). The
   set lives in the store, so leaving and coming back loses nothing.

   Three question types: single and multi (choose one, choose two), and
   order (tap the steps into place, first to last). Case study questions come
   after their scenario, which stays one tap away while you answer. */

import { $, inline, escapeHTML, folio, tally, buzz } from '../ui.js';
import { store } from '../store.js';
import { lessonById } from '../curriculum/index.js';
import { DOMAINS, QUESTIONS, CASES } from '../exam/pl300.js';

const PRACTICE_SIZE = 10;
const MOCK_MS = 80 * 60 * 1000;
// Proportions follow the exam: roughly equal for the first three areas, less
// for deployment. A case study's questions come on top, at the end.
const MOCK_QUOTA = { prepare: 10, model: 10, visualize: 10, deploy: 5 };
const MOCK_SIZE = Object.values(MOCK_QUOTA).reduce((a, b) => a + b, 0)
  + (CASES.length ? CASES[0].questions.length : 0);

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
const caseById = new Map(CASES.map((c) => [c.id, c]));
const domainOf = (id) => DOMAINS.find((d) => d.id === id);
const pct = (right, total) => (total ? Math.round((right / total) * 100) : 0);
const plain = (text) => escapeHTML(String(text).replace(/`|\*\*/g, ''));
const standalone = (q) => !q.case;

/* Stable shuffles: the same set always shows a question's options in the
   same order, so leaving and coming back doesn't reshuffle them. */
function seeded(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* Practice: questions you got wrong come first, then ones you haven't seen,
   then the right ones you answered longest ago. Case study questions only
   come with their case. */
function practicePicks(domain) {
  const answers = store.examState().answers;
  const pool = QUESTIONS.filter((q) => standalone(q) && (domain === 'all' || q.domain === domain));
  const wrong = shuffle(pool.filter((q) => answers[q.id] && !answers[q.id].right));
  const unseen = shuffle(pool.filter((q) => !answers[q.id]));
  const right = pool.filter((q) => answers[q.id] && answers[q.id].right)
    .sort((a, b) => (answers[a.id].day < answers[b.id].day ? -1 : 1));
  return shuffle([...wrong, ...unseen, ...right].slice(0, PRACTICE_SIZE)).map((q) => q.id);
}

function mockPicks() {
  const regular = shuffle(DOMAINS.flatMap((d) =>
    shuffle(QUESTIONS.filter((q) => standalone(q) && q.domain === d.id)).slice(0, MOCK_QUOTA[d.id])));
  const theCase = CASES[Math.floor(Math.random() * CASES.length)];
  return [...regular.map((q) => q.id), ...(theCase ? theCase.questions : [])];
}

/* Order questions need the exact sequence; the others the exact set. */
function isRight(q, picks = []) {
  if (picks.length !== q.answer.length) return false;
  return q.type === 'order'
    ? q.answer.every((i, k) => picks[k] === i)
    : q.answer.every((i) => picks.includes(i));
}

function tried(ids) {
  const answers = store.examState().answers;
  const seen = ids.filter((id) => answers[id]);
  return { tried: seen.length, right: seen.filter((id) => answers[id].right).length, total: ids.length };
}

const clock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const inProgress = (set) => set && !set.finished;
const mockLeft = (set) => set.started + MOCK_MS - Date.now();

const scoreCell = (s) => `<span class="exam-score">${s.tried ? `${pct(s.right, s.tried)}%` : 'new'}<small>${s.tried}/${s.total}</small></span>`;

/* ── Overview ─────────────────────────────────────────────── */

export function renderExam(mount, ctx) {
  ctx.setTitle('PL-300 prep');
  ctx.showBack(true);
  mount.className = 'screen t-pbi';

  const ex = store.examState();
  const set = ex.set;
  // A mock whose time ran out while you were elsewhere is marked now, not
  // offered back to you at 0:00.
  if (set && set.mode === 'mock' && !set.finished && mockLeft(set) <= 0) finishMock(set);
  const all = tried(QUESTIONS.map((q) => q.id));
  const best = ex.mocks.length ? Math.max(...ex.mocks.map((m) => pct(m.right, m.total))) : null;
  const practising = inProgress(set) && set.mode === 'practice';
  const mocking = inProgress(set) && set.mode === 'mock';
  const orders = QUESTIONS.filter((q) => q.type === 'order').length;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Power BI Data Analyst</p>
        <h1 class="display-xl" style="color:var(--accent)">PL-300 prep</h1>
        <p class="note" style="margin:12px 0 0">${QUESTIONS.length} exam-style questions across the four
        areas the exam measures, ${orders} of them putting steps in order, and ${CASES.length} case studies.
        Each has an explanation. Written for DataBites and set in its own shop: they aren't Microsoft's
        questions, and this isn't affiliated with Microsoft.</p>
      </div>

      <div class="figures">
        <div class="figure">
          <span class="figure-n">${all.tried}<small>/${all.total}</small></span>
          <span class="figure-l">Tried</span>
        </div>
        <div class="figure">
          <span class="figure-n">${all.tried ? `${pct(all.right, all.tried)}<small>%</small>` : '&ndash;'}</span>
          <span class="figure-l">Right</span>
        </div>
        <div class="figure">
          <span class="figure-n">${best === null ? '&ndash;' : `${best}<small>%</small>`}</span>
          <span class="figure-l">Best mock</span>
        </div>
      </div>

      <button class="btn btn-accent btn-block" id="practice-all">${practising
        ? `Carry on: question ${set.at + 1} of ${set.ids.length}`
        : `${PRACTICE_SIZE} questions, mixed`}</button>
      <button class="btn btn-quiet btn-block" id="mock">${mocking
        ? `Back to your mock &middot; ${clock(mockLeft(set))} left`
        : `Mock exam: ${MOCK_SIZE} questions, 80 minutes`}</button>

      <section class="part">
        <div class="part-head">
          <span class="part-name">By area</span>
          <span class="part-count">right of tried</span>
        </div>
        ${DOMAINS.map((d) => {
          const s = tried(QUESTIONS.filter((q) => q.domain === d.id).map((q) => q.id));
          return `
            <button class="lesson-row exam-area" data-domain="${d.id}">
              <span class="problem-main">
                <span class="lesson-name">${escapeHTML(d.name)}</span>
                <span class="problem-tags">${escapeHTML(d.note)}</span>
                ${tally(s.tried, s.total, '', 30)}
              </span>
              ${scoreCell(s)}
            </button>`;
        }).join('')}
        <p class="needs-note" style="margin:10px 0 0">Tap an area for ${PRACTICE_SIZE} questions from it.
        Questions you got wrong come back first.</p>
      </section>

      <section class="part">
        <div class="part-head">
          <span class="part-name">Case studies</span>
          <span class="part-count">right of tried</span>
        </div>
        ${CASES.map((c) => `
          <button class="lesson-row exam-area" data-case="${c.id}">
            <span class="problem-main">
              <span class="lesson-name">${escapeHTML(c.title)}</span>
              <span class="problem-tags">${escapeHTML(c.about)}</span>
            </span>
            ${scoreCell(tried(c.questions))}
          </button>`).join('')}
        <p class="needs-note" style="margin:10px 0 0">A scenario, then ${CASES[0].questions.length} questions
        about it. The real exam has case studies too: read the scenario once, then answer from it.
        Every mock ends with one.</p>
      </section>

      ${ex.mocks.length ? `
        <section class="part">
          <div class="part-head">
            <span class="part-name">Your mocks</span>
            <span class="part-count">latest first</span>
          </div>
          ${[...ex.mocks].reverse().slice(0, 5).map((m, i) => {
            const review = i === 0 && set && set.finished && set.mode === 'mock';
            return `
              <${review ? 'button class="lesson-row" data-go="quiz"' : 'div class="lesson-row"'}>
                <span class="lesson-n">${folio(ex.mocks.length - i)}</span>
                <span class="lesson-name">${pct(m.right, m.total)}% &middot; ${m.right} of ${m.total}</span>
                <span class="lesson-mins">${review ? 'Review' : escapeHTML(m.day)}</span>
              </${review ? 'button' : 'div'}>`;
          }).join('')}
        </section>` : ''}

      <details class="reveal">
        <summary>Before you book the real exam</summary>
        <div class="reveal-body">
          <p>Read the current <b>skills outline</b> in Microsoft's PL-300 study guide on Microsoft Learn.
          It is updated from time to time, and it is the only definitive list of what's tested.</p>
          <p>Microsoft's role-based exams are scored from 1 to 1000, and 700 passes. The score is
          scaled, so it isn't the percentage of questions you got right. The real exam mixes the same
          kinds of question as here: choose one, choose several, put steps in order, and case studies.</p>
          <p>Only practice builds the Model the data area properly: the <b>DAX</b> and <b>Power BI
          modelling</b> tracks do it hands-on, and many explanations here link to the lesson that
          covers the same idea. Power Query ideas (unpivot, merge, append, fill down) have their pandas
          twins in the <b>messy data</b> and <b>wrangling</b> tracks.</p>
          <p>These questions only cover what's written about Power BI Desktop and the service; practise
          in Power BI Desktop itself too, which is free.</p>
        </div>
      </details>
    </div>
  `;

  const start = (mode, domain = 'all') => {
    store.startExamSet({ mode, domain, ids: mode === 'mock' ? mockPicks() : practicePicks(domain) });
    ctx.go('quiz');
  };

  $('#practice-all', mount).addEventListener('click', () => (practising ? ctx.go('quiz') : start('practice')));
  $('#mock', mount).addEventListener('click', () => (mocking ? ctx.go('quiz') : start('mock')));
  mount.addEventListener('click', (event) => {
    const area = event.target.closest('[data-domain]');
    if (area) return start('practice', area.dataset.domain);
    const c = event.target.closest('[data-case]');
    if (c) {
      store.startExamSet({ mode: 'practice', domain: 'all', caseId: c.dataset.case, ids: caseById.get(c.dataset.case).questions });
      return ctx.go('quiz');
    }
    const go = event.target.closest('[data-go]');
    if (go) ctx.go(go.dataset.go);
  });
}

/* ── Pieces of a question ─────────────────────────────────── */

function caseBox(theCase, open, note) {
  return `<details class="reveal case-box"${open ? ' open' : ''}>
    <summary>Case study: ${escapeHTML(theCase.title)}</summary>
    <div class="reveal-body">
      ${note ? `<p><b>${escapeHTML(note)}</b></p>` : ''}
      <p>${inline(theCase.overview)}</p>
      ${theCase.sections.map((s) => `
        <p class="label case-head">${escapeHTML(s.head)}</p>
        <ul class="case-list">${s.lines.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`).join('')}
    </div>
  </details>`;
}

/* Order: numbered slots filled by tapping the steps below them. A placed
   step taps back out. Marked, each slot says whether its step is right. */
function orderHTML(q, picks, checked, pool) {
  const n = q.answer.length;
  const full = picks.length >= n;
  const slots = Array.from({ length: n }, (_, k) => {
    const i = picks[k];
    if (i === undefined) return `<li class="order-slot"><span class="order-empty">Step ${k + 1}</span></li>`;
    if (checked) {
      const place = q.answer[k] === i ? 'Right place' : q.answer.includes(i) ? 'Wrong place' : 'Not a step';
      return `<li class="order-slot"><span class="order-done ${q.answer[k] === i ? 'is-right' : 'is-wrong'}">
          <span class="order-text">${inline(q.options[i])}</span><span class="opt-tag">${place}</span></span></li>`;
    }
    return `<li class="order-slot"><button type="button" class="order-item is-placed" data-remove="${k}"
        aria-label="Step ${k + 1}: ${plain(q.options[i])}. Tap to take it out">
        <span class="order-text">${inline(q.options[i])}</span><span class="order-x" aria-hidden="true">&times;</span>
      </button></li>`;
  }).join('');
  const left = pool.filter((i) => !picks.includes(i));
  return `
    <p class="label order-label">Your order</p>
    <ol class="order-list">${slots}</ol>
    ${checked ? '' : `
      <p class="label order-label">${full ? 'All steps placed. Tap one above to take it out.' : 'Tap the steps, first to last'}</p>
      <div class="order-pool">${left.map((i) => `
        <button type="button" class="order-item" data-add="${i}"${full ? ' disabled' : ''}
          aria-label="Add as step ${picks.length + 1}: ${plain(q.options[i])}">
          <span class="order-text">${inline(q.options[i])}</span></button>`).join('')}
      </div>`}`;
}

/* ── A question set ───────────────────────────────────────── */

export function renderQuiz(mount, ctx) {
  const set = store.examState().set;
  if (!set) return ctx.go('exam');
  const mock = set.mode === 'mock';

  ctx.setTitle(mock ? 'PL-300 mock' : set.caseId ? 'PL-300 case study' : 'PL-300 practice');
  ctx.showBack(true);
  mount.className = 'screen t-pbi';

  // Time's up while you were away: mark it now.
  if (mock && !set.finished && mockLeft(set) <= 0) finishMock(set);
  if (set.finished || set.at >= set.ids.length) return renderResults(mount, ctx, set);

  const q = byId.get(set.ids[set.at]);
  if (!q) {                                // a question removed since the set began
    set.ids.splice(set.at, 1);
    store.saveExamSet();
    return renderQuiz(mount, ctx);
  }
  const order = shuffle(q.options.map((_, i) => i), seeded(`${set.started}:${q.id}`));
  const picks = set.picks[q.id] || [];
  const checked = !mock && set.checked[q.id];
  const multi = q.type === 'multi';
  const ordering = q.type === 'order';
  const last = set.at === set.ids.length - 1;

  // The scenario opens on a case's first question, and stays a tap away after.
  const theCase = q.case && caseById.get(q.case);
  const before = set.at > 0 && byId.get(set.ids[set.at - 1]);
  const firstOfCase = theCase && !(before && before.case === q.case);
  const caseLeft = theCase ? set.ids.slice(set.at).filter((id) => (byId.get(id) || {}).case === q.case).length : 0;

  const option = (i) => {
    const on = picks.includes(i);
    const correct = q.answer.includes(i);
    const mark = checked ? (correct ? 'is-right' : on ? 'is-wrong' : '') : '';
    const tag = checked && correct ? 'Correct' : checked && on ? 'Your pick' : '';
    return `<label class="opt ${mark}">
        <input type="${multi ? 'checkbox' : 'radio'}" name="opt" value="${i}"${on ? ' checked' : ''}${checked ? ' disabled' : ''}>
        <span class="opt-text">${inline(q.options[i])}</span>
        ${tag ? `<span class="opt-tag">${tag}</span>` : ''}
      </label>`;
  };

  const right = checked && isRight(q, picks);
  const lesson = q.lesson && lessonById(q.lesson);
  const feedback = checked ? `
    <div class="judge ${right ? 'is-ok' : ''}">
      <span class="label">${right ? 'Right' : 'Not quite'}</span>
      ${ordering && !right ? `<p><b>The right order:</b></p>
        <ol class="exam-answers">${q.answer.map((i) => `<li>${inline(q.options[i])}</li>`).join('')}</ol>` : ''}
      <p>${inline(q.why)}</p>
      ${lesson ? `<button class="btn-text" data-go="lesson/${lesson.id}">Try it hands-on: ${escapeHTML(lesson.title)}</button>` : ''}
    </div>` : '';

  const domain = domainOf(q.domain);
  mount.innerHTML = `
    <div class="stack">
      <div class="session-bar">
        <span class="label">${mock ? 'Mock' : set.caseId ? 'Case study' : 'Practice'} &middot; ${set.at + 1} of ${set.ids.length}${mock
          ? ` &middot; <span id="mock-left">${clock(mockLeft(set))}</span> left` : ''}</span>
        <button class="btn-text" id="stop">${mock ? 'Finish now' : 'Stop'}</button>
      </div>

      ${theCase ? caseBox(theCase, firstOfCase,
        firstOfCase && mock ? `The last ${caseLeft} questions are about this case study.` : '') : ''}

      <div>
        <p class="label">${escapeHTML(domain.name)} &middot; ${escapeHTML(q.topic)}</p>
        <h1 class="exam-stem">${inline(q.stem)}</h1>
      </div>

      ${ordering
        ? `<div class="order" id="order">${orderHTML(q, picks, checked, order)}</div>`
        : `<fieldset class="opts">
            <legend class="sr-only">${multi ? `Choose ${q.answer.length}` : 'Choose one'}</legend>
            ${order.map(option).join('')}
          </fieldset>
          ${multi && !checked ? `<p class="needs-note">Pick ${q.answer.length}.</p>` : ''}`}

      <div id="feedback" aria-live="polite">${feedback}</div>

      <div class="quick-row exam-nav">
        ${mock
          ? `<button class="btn btn-quiet" id="prev"${set.at === 0 ? ' disabled' : ''}>Previous</button>
             <button class="btn btn-accent" id="next">${last ? 'Finish' : 'Next'}</button>`
          : checked
            ? `<button class="btn btn-accent" id="next">${last ? 'See how you did' : 'Next question'}</button>`
            : `<button class="btn btn-accent" id="check"${picks.length === q.answer.length ? '' : ' disabled'}>Check</button>`}
      </div>
    </div>
  `;

  const check = $('#check', mount);
  const answered = (list) => {
    set.picks[q.id] = list;
    store.saveExamSet();
    if (check) check.disabled = list.length !== q.answer.length;
  };

  // Choose one / choose several.
  const inputs = [...mount.querySelectorAll('.opts input')];
  inputs.forEach((input) => input.addEventListener('change', () => {
    let chosen = inputs.filter((el) => el.checked).map((el) => Number(el.value));
    // A multi question takes exactly as many as it asks for: the oldest pick gives way.
    if (multi && chosen.length > q.answer.length) {
      const keep = [...(set.picks[q.id] || []).filter((i) => chosen.includes(i)).slice(1), Number(input.value)];
      inputs.forEach((el) => { el.checked = keep.includes(Number(el.value)); });
      chosen = keep;
    }
    answered(chosen);
  }));

  // Put in order: redrawn in place, so the page doesn't jump on every tap.
  const orderBox = $('#order', mount);
  if (orderBox && !checked) {
    orderBox.addEventListener('click', (event) => {
      const add = event.target.closest('[data-add]');
      const remove = event.target.closest('[data-remove]');
      if (!add && !remove) return;
      const list = [...(set.picks[q.id] || [])];
      if (add && !add.disabled && list.length < q.answer.length) list.push(Number(add.dataset.add));
      if (remove) list.splice(Number(remove.dataset.remove), 1);
      answered(list);
      orderBox.innerHTML = orderHTML(q, list, false, order);
      // A keyboard press (detail 0) keeps its place: on to the next step, or Check once they're all in.
      if (event.detail === 0) {
        const nextFocus = orderBox.querySelector('[data-add]:not(:disabled)') || check || $('#next', mount);
        if (nextFocus) nextFocus.focus();
      }
    });
  }

  if (check) {
    check.addEventListener('click', () => {
      const chosen = set.picks[q.id] || [];
      if (chosen.length !== q.answer.length) return;
      set.checked[q.id] = true;
      store.examAnswer(q.id, isRight(q, chosen));
      store.saveExamSet();
      if (isRight(q, chosen)) buzz(20);
      // Through the router, onto a fresh node: re-rendering this mount would
      // stack a second click handler on it.
      ctx.go('quiz');
      const shown = $('#feedback');
      if (shown) shown.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  const next = $('#next', mount);
  if (next) {
    next.addEventListener('click', () => {
      if (mock && last) {
        const open = set.ids.filter((id) => !(set.picks[id] || []).length).length;
        if (open && next.dataset.armed !== '1') {
          next.dataset.armed = '1';
          next.textContent = `${open} unanswered: finish anyway?`;
          return;
        }
        finishMock(set);
      } else {
        set.at += 1;
        if (!mock && set.at >= set.ids.length) set.finished = true;
        store.saveExamSet();
      }
      ctx.go('quiz');
    });
  }
  const prev = $('#prev', mount);
  if (prev) {
    prev.addEventListener('click', () => {
      set.at = Math.max(0, set.at - 1);
      store.saveExamSet();
      ctx.go('quiz');
    });
  }

  $('#stop', mount).addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (mock) {
      if (button.dataset.armed !== '1') {
        button.dataset.armed = '1';
        button.textContent = 'Tap again to finish';
        return;
      }
      finishMock(set);
      return ctx.go('quiz');
    }
    store.endExamSet();              // what you answered is already kept
    ctx.go('exam');
  });

  mount.addEventListener('click', (event) => {
    const go = event.target.closest('[data-go]');
    if (go) ctx.go(go.dataset.go);
  });

  const leftNode = $('#mock-left', mount);
  if (leftNode) {
    const tick = setInterval(() => {
      if (!leftNode.isConnected) return clearInterval(tick);
      const ms = mockLeft(set);
      leftNode.textContent = clock(ms);
      if (ms <= 0) {
        clearInterval(tick);
        finishMock(set);
        ctx.go('quiz');
      }
    }, 1000);
  }
}

function finishMock(set) {
  if (set.finished) return;
  const byDomain = {};
  let right = 0;
  set.ids.forEach((id) => {
    const q = byId.get(id);
    if (!q) return;
    const picks = set.picks[id] || [];
    const ok = isRight(q, picks);
    if (ok) right += 1;
    if (picks.length) store.examAnswer(id, ok);       // unanswered ones stay unseen for practice
    const d = byDomain[q.domain] || (byDomain[q.domain] = [0, 0]);
    d[0] += ok ? 1 : 0;
    d[1] += 1;
  });
  set.finished = true;
  set.result = { right, total: set.ids.length, byDomain };
  store.recordMock(set.result);
  store.saveExamSet();
}

/* ── Results ──────────────────────────────────────────────── */

function reviewItem(q, picks) {
  const got = isRight(q, picks);
  const body = q.type === 'order'
    ? `<p><b>The right order:</b></p>
       <ol class="exam-answers">${q.answer.map((i) => `<li>${inline(q.options[i])}</li>`).join('')}</ol>
       ${picks.length ? `<p><b>Yours:</b></p>
         <ol class="exam-answers">${picks.map((i, k) => `<li class="${q.answer[k] === i ? 'is-right' : 'is-wrong'}">${inline(q.options[i])}${
           q.answer[k] === i ? '' : ' <b>(wrong place)</b>'}</li>`).join('')}</ol>` : ''}`
    : `<ul class="exam-answers">
         ${q.options.map((text, i) => `<li class="${q.answer.includes(i) ? 'is-right' : picks.includes(i) ? 'is-wrong' : ''}">${inline(text)}${
           q.answer.includes(i) ? ' <b>(correct)</b>' : picks.includes(i) ? ' <b>(your pick)</b>' : ''}</li>`).join('')}
       </ul>`;
  const theCase = q.case && caseById.get(q.case);
  return `<details class="reveal">
    <summary>${got ? '&check;' : '&times;'} ${escapeHTML(q.topic)}${theCase ? ` &middot; ${escapeHTML(theCase.title)}` : ''}</summary>
    <div class="reveal-body">
      <p>${inline(q.stem)}</p>
      ${body}
      ${picks.length ? '' : '<p><b>Not answered.</b></p>'}
      <p>${inline(q.why)}</p>
    </div>
  </details>`;
}

function renderResults(mount, ctx, set) {
  const mock = set.mode === 'mock';
  const rows = set.ids.map((id) => byId.get(id)).filter(Boolean);
  const got = (q) => isRight(q, set.picks[q.id] || []);
  const right = rows.filter(got).length;
  const score = pct(right, rows.length);

  const perDomain = DOMAINS.map((d) => {
    const qs = rows.filter((q) => q.domain === d.id);
    return { d, total: qs.length, right: qs.filter(got).length };
  }).filter((x) => x.total);
  const weakest = [...perDomain].sort((a, b) => a.right / a.total - b.right / b.total)[0];
  const missed = rows.filter((q) => !got(q));

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">${mock ? 'Mock exam, marked' : set.caseId ? 'Case study, done' : 'Practice set, done'}</p>
        <p class="clock">${score}<small>%</small></p>
        <p class="note" style="margin:6px 0 0">${right} of ${rows.length} right.${mock
          ? ' A comfortable margin here, 80% or more, is a good sign; this isn\'t the scaled score the real exam gives.'
          : ''}</p>
      </div>

      <section class="part">
        <div class="part-head">
          <span class="part-name">By area</span>
          <span class="part-count">right</span>
        </div>
        ${perDomain.map((x) => `
          <div class="lesson-row">
            <span class="problem-main">
              <span class="lesson-name">${escapeHTML(x.d.name)}</span>
              ${tally(x.right, x.total, '', 30)}
            </span>
            <span class="exam-score">${pct(x.right, x.total)}%<small>${x.right}/${x.total}</small></span>
          </div>`).join('')}
      </section>

      ${missed.length ? `<section>
        <p class="label label-mark" style="margin:0 0 4px">${mock ? 'What you missed' : 'Worth another look'}</p>
        ${missed.map((q) => reviewItem(q, set.picks[q.id] || [])).join('')}
      </section>` : ''}

      <button class="btn btn-accent btn-block" id="again">${weakest && weakest.right < weakest.total
        ? `${PRACTICE_SIZE} questions on ${escapeHTML(weakest.d.name.toLowerCase())}`
        : `${PRACTICE_SIZE} more questions`}</button>
      <button class="btn btn-quiet btn-block" id="done">Back to PL-300 prep</button>
    </div>
  `;

  $('#again', mount).addEventListener('click', () => {
    const domain = weakest && weakest.right < weakest.total ? weakest.d.id : 'all';
    store.startExamSet({ mode: 'practice', domain, ids: practicePicks(domain) });
    ctx.go('quiz');
  });
  $('#done', mount).addEventListener('click', () => {
    if (!mock) store.endExamSet();    // a mock stays open for review from the overview
    ctx.go('exam');
  });
}
