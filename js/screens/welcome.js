/* The first screen a brand-new learner sees, in place of Home: what this is,
   in a few lines, then one question, where to start. The answer sets
   store.startAt, which "what's next" begins from, and then the first-run
   guide (js/guide.js) walks round Home, and each screen after it. Every course stays open either way. */

import { escapeHTML } from '../ui.js';
import { store } from '../store.js';
import { skipGuides } from '../guide.js';

// In the path's own order (curriculum/index.js TRACK_GROUPS): the Excel, SQL and Python stages.
const STARTS = [
  { at: 'excel', title: "I'm new to all this", note: 'Start at the beginning: Excel formulas first, then SQL, then Python. No experience needed.' },
  { at: 'sql', title: 'I want to learn SQL', note: 'Ask a database questions, the way most data jobs do.' },
  { at: 'basics', title: 'I want to learn to code', note: 'Start Python from its very first line. No experience needed.' },
  { at: 'pandas', title: 'I know a bit of Python', note: 'Go straight to pandas, for working with tables of data.' },
  { at: 'dax', title: "I'm learning Power BI", note: 'DAX, the formula language behind it, and help with the PL-300.' },
];

export function renderWelcome(mount, ctx) {
  ctx.setTitle('QueryCafe', { brand: true });
  mount.className = 'screen welcome';
  const mark = document.querySelector('.topbar-title .brand-mark');

  mount.innerHTML = `
    <div class="stack">
      <div class="welcome-head">
        ${mark ? mark.outerHTML.replace('class="brand-mark"', 'class="brand-mark welcome-mark"') : ''}
        <h1 class="display">Welcome to QueryCafe</h1>
        <p class="welcome-lede">Learn to work with data in small bites: Python, SQL, Excel and Power BI.
          Each lesson takes about three minutes, and the code runs right here, with nothing to install.</p>
      </div>

      <section>
        <p class="label label-mark">Where would you like to start?</p>
        <div class="welcome-starts">
          ${STARTS.map((s) => `
            <button class="welcome-start" data-start="${s.at}">
              <span class="welcome-start-t">${escapeHTML(s.title)}</span>
              <span class="welcome-start-n">${escapeHTML(s.note)}</span>
            </button>`).join('')}
        </div>
        <p class="muted welcome-small">You're not tied down. Every course stays open, so you can jump
          around whenever you like.</p>
      </section>

      <p class="muted welcome-small">Learning on another device already?
        <button class="btn-text" id="welcome-bring">Bring your progress over</button></p>
    </div>`;

  mount.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-start]');
    if (pick) {
      store.welcome(pick.dataset.start === 'excel' ? null : pick.dataset.start);   // the path's first course: start at the top
      ctx.go('home');
    }
  });
  mount.querySelector('#welcome-bring').addEventListener('click', () => {
    store.welcome(null);
    skipGuides();
    ctx.go('you/settings');
  });
}
