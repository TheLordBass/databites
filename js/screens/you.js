import { escapeHTML, meter, toast } from '../ui.js';
import { store, levelInfo } from '../store.js';
import { python } from '../python.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

export function renderYou(mount, ctx) {
  ctx.setTitle('You');
  mount.className = 'screen';

  const { xp } = store.state;
  const { level, into, need } = levelInfo(xp);
  const streak = store.liveStreak();
  const done = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  const minutes = ALL_LESSONS.filter((l) => store.isDone(l.id)).reduce((n, l) => n + l.mins, 0);
  const canInstall = Boolean(installPrompt);

  mount.innerHTML = `
    <div class="stack">
      <div class="level">
        <span class="level-n">${level}</span>
        <div class="level-meta">
          <span class="label">Level</span>
          <p>${into} of ${need} XP toward ${level + 1}</p>
        </div>
      </div>

      <div class="figures">
        <div class="figure">
          <span class="figure-n">${streak}</span>
          <span class="figure-l">Streak</span>
        </div>
        <div class="figure">
          <span class="figure-n">${store.state.best}</span>
          <span class="figure-l">Best</span>
        </div>
        <div class="figure">
          <span class="figure-n">${minutes}</span>
          <span class="figure-l">Minutes</span>
        </div>
      </div>

      <div>
        <p class="label" style="margin:0 0 10px">Progress</p>
        <table class="ledger">
          ${TRACKS.map((track) => {
            const n = track.lessons.filter((l) => store.isDone(l.id)).length;
            return `
              <tr class="${track.theme}">
                <td>${escapeHTML(track.name)}</td>
                <td class="bar">${meter(n / track.lessons.length)}</td>
                <td>${n}/${track.lessons.length}</td>
              </tr>`;
          }).join('')}
        </table>
      </div>

      ${canInstall
        ? `<button class="btn btn-primary btn-block" id="install">Add to home screen</button>`
        : `<details class="reveal">
            <summary>Put this on your home screen</summary>
            <div class="reveal-body">
              <p><b>Android / Chrome:</b> menu (⋮) → <i>Add to Home screen</i>.</p>
              <p><b>iPhone / Safari:</b> Share → <i>Add to Home Screen</i>.</p>
              <p>It then opens full screen, keeps your progress, and works with no connection.</p>
            </div>
          </details>`}

      <div>
        <details class="reveal">
          <summary>How this works</summary>
          <div class="reveal-body">
            <p>Real CPython, compiled to WebAssembly, running inside this page. Your code
            never leaves the device, and neither does your progress.</p>
            <p>seaborn: <b>${python.hasSeaborn ? 'loaded' : 'unavailable offline'}</b>.
            statsmodels and scikit-learn download only when a lesson needs them.</p>
            <p>${done} of ${ALL_LESSONS.length} lessons finished · ${xp} XP all told.</p>
          </div>
        </details>

        <details class="reveal">
          <summary>Start over</summary>
          <div class="reveal-body">
            <p>Wipes progress, XP, streak and every saved snippet. There is no undo.</p>
            <button class="btn btn-quiet btn-sm" id="reset" style="color:var(--accent)">
              Erase everything
            </button>
          </div>
        </details>
      </div>
    </div>
  `;

  const install = mount.querySelector('#install');
  if (install) {
    install.addEventListener('click', async () => {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      renderYou(mount, ctx);
    });
  }

  mount.querySelector('#reset').addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (button.dataset.armed !== '1') {
      button.dataset.armed = '1';
      button.textContent = 'Tap again to confirm';
      setTimeout(() => {
        if (button.isConnected) {
          button.dataset.armed = '0';
          button.textContent = 'Erase everything';
        }
      }, 4000);
      return;
    }
    store.reset();
    toast('Cleared. Fresh start.');
    ctx.refreshChrome();
    ctx.go('home');
  });
}
