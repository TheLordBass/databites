/* Finding things: lessons, on Courses, and practice questions, on Practice
   and under the lessons on Courses. Every word typed has to turn up
   somewhere in the thing: a lesson's title, course, three bullets or task;
   a question's title, tags, subject or wording. The best matches come first
   (the words in the title, or a question tagged with exactly what was
   typed), then the rest in their own order, each saying where it says it
   when its title doesn't. What was typed in each place lasts until the app
   closes, so coming back finds the results as they were. */

import { escapeHTML, folio } from './ui.js';
import { store } from './store.js';
import { miniStampSVG } from './stamps.js';
import { ALL_LESSONS } from './curriculum/index.js';
import { PROBLEMS, DIFFICULTY, LANG_NAMES } from './practice/problems.js';

/** The searches in progress, kept until the app closes. */
export const searches = { courses: '', practice: '' };

const plain = (text) => String(text || '').replace(/[`*_]/g, '');
export const wordsOf = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);
const subjectName = (p) => (p.tags.includes('algorithms') ? 'Algorithms' : LANG_NAMES[p.lang || 'python']);

// The words found, marked, in text that is escaped around them. Words under
// three letters ("by", "a") still have to match, but aren't marked: they'd
// light up inside every other word.
function marked(text, words) {
  const long = words.filter((w) => w.length > 2);
  if (!long.length) return escapeHTML(text);
  const re = new RegExp(`(${long.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(re).map((part, i) => (i % 2 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part))).join('');
}

// Where something that doesn't say it in its title does say it: about 40
// characters either side, cut at spaces so no word is chopped.
function snippet(texts, words) {
  const lines = texts.map(plain);
  const line = lines.find((t) => words.every((w) => t.toLowerCase().includes(w)))
    || lines.find((t) => t.toLowerCase().includes(words[0]));
  if (!line) return '';
  const at = Math.max(0, line.toLowerCase().indexOf(words[0]));
  let start = Math.max(0, at - 40);
  let end = Math.min(line.length, at + 70);
  if (start > 0) start = line.indexOf(' ', start) + 1 || start;
  if (start > at) start = at;
  if (end < line.length) end = Math.max(at + words[0].length, line.lastIndexOf(' ', end));
  return `${start ? '&hellip;' : ''}${marked(line.slice(start, end), words)}${end < line.length ? '&hellip;' : ''}`;
}

let lessonText = null;
let problemText = null;

/** Lessons with every word in them: [{ l, score }], best first. */
export function findLessons(text) {
  const words = wordsOf(text);
  if (!words.length) return [];
  if (!lessonText) {
    lessonText = new Map(ALL_LESSONS.map((l) => [l,
      [l.title, l.track.name, ...(l.concept || []), l.task].map(plain).join(' ').toLowerCase()]));
  }
  const whole = words.join(' ');
  return ALL_LESSONS
    .filter((l) => words.every((w) => lessonText.get(l).includes(w)))
    .map((l) => {
      const title = l.title.toLowerCase();
      return { l, score: title.includes(whole) ? 3 : words.every((w) => title.includes(w)) ? 2 : 1 };
    })
    .sort((a, b) => b.score - a.score);           // stable: ties keep the course order
}

/** Practice questions with every word in them: [{ p, score }], best first. A
    question tagged with exactly what was typed (COUNTIF, window) leads. */
export function findProblems(text) {
  const words = wordsOf(text);
  if (!words.length) return [];
  if (!problemText) {
    problemText = new Map(PROBLEMS.map((p) => [p,
      [p.title, ...p.tags, subjectName(p), DIFFICULTY[p.difficulty].label, ...(p.prompt || []), ...(p.notes || [])]
        .map(plain).join(' ').toLowerCase()]));
  }
  const whole = words.join(' ');
  return PROBLEMS
    .filter((p) => words.every((w) => problemText.get(p).includes(w)))
    .map((p) => {
      const title = p.title.toLowerCase();
      const tags = p.tags.map((t) => t.toLowerCase());
      const score = tags.includes(whole) ? 4 : title.includes(whole) ? 3
        : words.every((w) => title.includes(w) || tags.some((t) => t.includes(w))) ? 2 : 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);           // stable: ties keep the practice order
}

/** A found lesson, as a row to open it. */
export function lessonHit({ l, score }, words) {
  const done = store.isDone(l.id);
  return `<button class="lesson-row problem-row search-hit ${l.track.theme}${done ? ' is-done' : ''}" data-go="lesson/${l.id}">
        <span class="lesson-n">${done ? miniStampSVG(l) : folio(l.index + 1)}</span>
        <span class="problem-main">
          <span class="lesson-name">${marked(l.title, words)}</span>
          ${score < 2 ? `<span class="search-bit">${snippet([...(l.concept || []), l.task || ''], words)}</span>` : ''}
          <span class="problem-tags">${escapeHTML(l.track.name)} &middot; lesson ${l.index + 1} of ${l.track.lessons.length}</span>
        </span>
      </button>`;
}

/** A found practice question, as a row to open it. */
export function problemHit({ p, score }, words) {
  const done = store.isDone(p.id);
  const tags = p.tags.filter((t) => t !== 'algorithms');
  return `<button class="lesson-row problem-row search-hit d-${p.difficulty}${done ? ' is-done' : ''}" data-go="problem/${p.id}">
        <span class="lesson-n">${done ? '&check;' : folio(PROBLEMS.indexOf(p) + 1)}</span>
        <span class="problem-main">
          <span class="lesson-name">${marked(p.title, words)}</span>
          ${score < 2 ? `<span class="search-bit">${snippet([...(p.prompt || []), ...(p.notes || [])], words)}</span>` : ''}
          <span class="problem-tags">${subjectName(p)} &middot; ${DIFFICULTY[p.difficulty].label}${
            tags.length ? ` &middot; ${tags.map((t) => marked(t, words)).join(' &middot; ')}` : ''}</span>
        </span>
      </button>`;
}

/** A search box, as on Courses and Practice: the input, already holding
    `value` (the search kept from before), and a place for its results. */
export const searchBox = (placeholder, label, value) => `<div class="search" role="search">
        <label class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>
          <input type="search" class="search-input" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}"
                 aria-label="${escapeHTML(label)}" autocomplete="off" spellcheck="false" enterkeyhint="search">
        </label>
        <div class="search-results" aria-live="polite"></div>
      </div>`;

/** Wires the search box in `mount`: as you type, `keep(text)` remembers it
    and `results(text)` (HTML) shows in place of `list`, which hides while
    there's a search. Enter opens the best match (the first result), Escape
    clears the box. A search kept from before shows straight away. */
export function wireSearch(mount, ctx, { list, keep, results }) {
  const input = mount.querySelector('.search-input');
  const out = mount.querySelector('.search-results');
  const show = () => {
    keep(input.value);
    const text = input.value.trim();
    out.innerHTML = text ? results(text) : '';
    list.hidden = Boolean(text);
  };
  input.addEventListener('input', show);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = out.querySelector('[data-go]');
      if (first) ctx.go(first.dataset.go);
    } else if (event.key === 'Escape' && input.value) {
      input.value = '';
      show();
    }
  });
  if (input.value.trim()) show();
  return out;
}

/** "12 lessons", "1 question", with a note when only the first are shown. */
export const hitCount = (n, shown, noun) => `${n} ${noun}${n === 1 ? '' : 's'}${
  n > shown ? `, the first ${shown} shown. Add a word to narrow it down.` : ''}`;
