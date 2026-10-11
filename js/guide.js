/* The first-run guide: a few spotlight steps over Home, the first time
   round after the welcome screen (and again from You → Settings). Each step
   lights up one real thing on the screen and says what it's for in a
   sentence. Skip ends it at any point. A step whose thing isn't on screen
   is passed over. */

import { store } from './store.js';
import { escapeHTML } from './ui.js';

const STEPS = [
  { at: '.block', title: 'Your next lesson',
    text: 'Tap here to start. It takes about three minutes.' },
  { at: '.cafe-row', title: "Today's cup and your loyalty card",
    text: 'Every new lesson tops up the cup and stamps the card. Fill the card and you get a reward.' },
  { at: '#streak-chip', title: 'Your streak',
    text: "How many days in a row you've learned something. The cup steams once today's is done." },
  { at: '.tab[data-route="tracks"]', title: 'Courses',
    text: "Everything, in the order we'd take it. Every course is open, so jump around if you like." },
  { at: '.tab[data-route="practice"]', title: 'Practice',
    text: 'Problems with hidden tests, for when the lessons start to feel easy.' },
  { at: '.tab[data-route="you"]', title: 'You',
    text: 'Your progress, and settings like dark mode, text size and sounds.' },
];

let open = null;

export function startGuide() {
  if (open) return;
  const steps = STEPS.filter((s) => document.querySelector(s.at));
  if (!steps.length) return;
  let at = 0;

  const layer = document.createElement('div');
  layer.className = 'guide';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-labelledby', 'guide-title');
  layer.innerHTML = '<div class="guide-spot"></div><div class="guide-card" aria-live="polite"></div>';
  document.body.append(layer);
  const spot = layer.querySelector('.guide-spot');
  const card = layer.querySelector('.guide-card');

  const end = () => {
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
    document.removeEventListener('keydown', keys);
    layer.remove();
    open = null;
    store.markGuided();
  };

  function place() {
    const target = document.querySelector(steps[at].at);
    if (!target) return;
    const r = target.getBoundingClientRect();
    const pad = 6;
    Object.assign(spot.style, {
      left: `${r.left - pad}px`, top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`,
    });
    // The card goes below the lit thing when there's room, above it otherwise.
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 16));
    card.style.width = `${width}px`;
    card.style.left = `${left}px`;
    const below = r.bottom + pad + 14;
    const height = card.offsetHeight;
    if (below + height < window.innerHeight - 12) {
      card.style.top = `${below}px`;
    } else {
      card.style.top = `${Math.max(12, r.top - pad - 14 - height)}px`;
    }
  }

  function show() {
    const step = steps[at];
    const last = at === steps.length - 1;
    card.innerHTML = `
      <p class="guide-count">${at + 1} of ${steps.length}</p>
      <h2 class="guide-title" id="guide-title">${escapeHTML(step.title)}</h2>
      <p class="guide-text">${escapeHTML(step.text)}</p>
      <div class="guide-actions">
        ${last ? '<span></span>' : '<button class="btn-text" data-act="skip">Skip</button>'}
        <span class="guide-nav">
          ${at ? '<button class="btn btn-quiet btn-sm" data-act="back">Back</button>' : ''}
          <button class="btn btn-primary btn-sm" data-act="next">${last ? "Let's go" : 'Next'}</button>
        </span>
      </div>`;
    const target = document.querySelector(step.at);
    // Things inside the scrolling screen are brought into view first; the tab bar is always there.
    if (target && target.closest('#screen')) target.scrollIntoView({ block: 'center' });
    requestAnimationFrame(() => requestAnimationFrame(place));
    card.querySelector('[data-act="next"]').focus({ preventScroll: true });
  }

  function keys(event) {
    if (event.key === 'Escape') end();
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft' && at) go(-1);
  }

  function go(step) {
    at += step;
    if (at >= steps.length) return end();
    show();
  }

  layer.addEventListener('click', (event) => {
    const act = event.target.closest('[data-act]');
    if (!act) return;                     // taps on the dimmed screen do nothing
    if (act.dataset.act === 'skip') end();
    if (act.dataset.act === 'back') go(-1);
    if (act.dataset.act === 'next') go(1);
  });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);   // the screen scrolls smoothly; the light follows it
  document.addEventListener('keydown', keys);
  open = layer;
  show();
}

/** Home calls this: the guide, the first time round after the welcome. */
export function guideIfDue() {
  if (store.state.welcomed && !store.state.guided) setTimeout(startGuide, 450);
}
