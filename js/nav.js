/* Getting about from a lesson or a practice question (js/screens/lesson.js
   and practice.js both use all of this):

     crumbs      above the title, where it sits, as links back up: Courses,
                 the course, its part; or Practice, the subject, the difficulty
     stepArrows  by the number ("Lesson 3 of 20"), arrows to the one before and after
     jumpMenu    the number itself, opening the whole list to jump to any one
     pager       at the end, the one before and the one after, by name
     wireGetAbout  the one click handler a screen needs for all of the above

   Neighbours are { go, title, n } or null. A button's data-step holds the
   route it goes to; an empty one (an arrow at either end) does nothing. None
   of this shows in a test-out, a Signature, a refill or an interview set:
   the screens decide that (their `browse`). */

import { escapeHTML, buzz } from './ui.js';
import { searches } from './search.js';

export const crumbs = (links) => `<nav class="crumbs" aria-label="Where this is">${links.map(([to, text], i) =>
  `${i ? '<span class="crumb-sep" aria-hidden="true">&rsaquo;</span>' : ''}<a class="crumb" href="#/${to}">${escapeHTML(text)}</a>`).join('')}</nav>`;

export function stepArrows(prev, next, noun) {
  const button = (to, word, path) => {
    const about = to ? `${word} ${noun}: ${escapeHTML(to.title)}` : `No ${word.toLowerCase()} ${noun}`;
    return `<button class="lesson-step" data-step="${to ? to.go : ''}" aria-label="${about}" title="${about}"${to ? '' : ' disabled'}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg></button>`;
  };
  return `<span class="lesson-steps">${button(prev, 'Previous', 'M14 5l-7 7 7 7')}${button(next, 'Next', 'M10 5l7 7-7 7')}</span>`;
}

/* The whole list, from the number: "Lesson 3 of 20" (or "9 of 16") opens
   every lesson in the course, or every question in the subject, in their
   parts or difficulties, to go straight to one. groups is
   [{ name, items: [{ go, title, n, done }] }]; `here` is this one's route,
   shown marked and not as a link. It's a <details>, so it opens and closes
   without any code; the listeners below close it from outside. */
export function jumpMenu(label, groups, here, about) {
  const item = (it) => (it.go === here
    ? `<span class="jump-item is-here" aria-current="page"><span class="jump-n">${it.n}</span><span class="jump-t">${escapeHTML(it.title)}</span></span>`
    : `<button class="jump-item${it.done ? ' is-done' : ''}" data-step="${it.go}"><span class="jump-n">${it.done ? '&check;' : it.n}</span><span class="jump-t">${escapeHTML(it.title)}</span></button>`);
  return `<details class="jump">
    <summary class="label lesson-kicker" aria-label="${escapeHTML(label)}: ${escapeHTML(about)}">${escapeHTML(label)}<svg class="jump-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>
    <div class="jump-panel">${groups.map((g) => `${g.name ? `<p class="jump-group">${escapeHTML(g.name)}</p>` : ''}${g.items.map(item).join('')}`).join('')}</div>
  </details>`;
}
// The list closes on a tap outside it, on Escape, and once one is picked; it
// opens scrolled to where you are. Registered once, for every screen.
document.addEventListener('click', (event) => {
  document.querySelectorAll('details.jump[open]').forEach((menu) => {
    if (!menu.contains(event.target) || event.target.closest('.jump-item')) menu.open = false;
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('details.jump[open]').forEach((menu) => {
    menu.open = false;
    menu.querySelector('summary').focus();
  });
});
document.addEventListener('toggle', (event) => {      // toggle doesn't bubble: caught on the way down
  const menu = event.target;
  if (!(menu instanceof HTMLDetailsElement) || !menu.classList.contains('jump') || !menu.open) return;
  const panel = menu.querySelector('.jump-panel');
  const here = panel.querySelector('.is-here');
  if (here) panel.scrollTop = here.offsetTop - panel.clientHeight / 2 + here.offsetHeight / 2;
}, true);

export function pager(prev, next, label) {
  if (!prev && !next) return '';
  const link = (to, word) => `<button class="pager-link${word === 'Next' ? ' is-next' : ''}" data-step="${to.go}">
      <span class="label">${word}</span><span class="pager-title">${to.n}. ${escapeHTML(to.title)}</span></button>`;
  return `<nav class="lesson-pager" aria-label="${escapeHTML(label)}">${prev ? link(prev, 'Previous') : ''}${next ? link(next, 'Next') : ''}</nav>`;
}

/** Wires a lesson's or a question's mount for getting about: the arrows,
    the list and the pager (data-step), the links up (.crumb, ordinary
    links, left to the router), and a question's tags (data-tag, every
    question with that tag, found on Practice). `flush` saves whatever was
    typed in the last moment, before the screen goes. A link up also clears
    any search left on Courses or Practice, or its results would stand in
    front of the place the link goes to. */
export function wireGetAbout(mount, ctx, flush) {
  mount.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step], .crumb, [data-tag]');
    if (!step || step.dataset.step === '') return;
    flush();
    if (step.classList.contains('crumb')) {
      searches.courses = '';
      searches.practice = '';
      return;                                   // the link's own href does the going
    }
    if (step.dataset.tag) {
      searches.practice = step.dataset.tag;
      ctx.go('practice');
      return;
    }
    buzz(8);
    ctx.go(step.dataset.step);
  });
}
