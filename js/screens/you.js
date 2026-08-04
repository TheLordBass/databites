import { escapeHTML, ring, toast } from '../ui.js';
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
  const { level, into, need, pct } = levelInfo(xp);
  const streak = store.liveStreak();
  const done = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  const minutes = ALL_LESSONS.filter((l) => store.isDone(l.id)).reduce((n, l) => n + l.mins, 0);
  const canInstall = Boolean(installPrompt);

  mount.innerHTML = `
    <div class="stack">
      <div class="you-head">
        <div class="level-ring">
          ${ring(pct, 96, 7)}
          <div class="level-n"><b>${level}</b><span>Level</span></div>
        </div>
        <p class="muted" style="margin:0;font-size:14px">${into} / ${need} XP to level ${level + 1}</p>
      </div>

      <div class="stat-row">
        <div class="stat"><div class="stat-n">${streak}</div><div class="stat-l">Streak</div></div>
        <div class="stat"><div class="stat-n">${store.state.best}</div><div class="stat-l">Best</div></div>
        <div class="stat"><div class="stat-n">${minutes}</div><div class="stat-l">Minutes</div></div>
      </div>

      <div class="card">
        <div class="eyebrow" style="margin-bottom:12px">Progress</div>
        <div class="stack">
          ${TRACKS.map((track) => {
            const n = track.lessons.filter((l) => store.isDone(l.id)).length;
            const p = n / track.lessons.length;
            return `
              <div class="${track.theme}" style="display:flex;align-items:center;gap:12px">
                <div class="ring" style="width:38px;height:38px">
                  ${ring(p, 38, 4)}
                  <div class="ring-label" style="font-size:10px">${Math.round(p * 100)}</div>
                </div>
                <div style="flex:1">${escapeHTML(track.name)}</div>
                <div class="lesson-mins">${n}/${track.lessons.length}</div>
              </div>`;
          }).join('')}
        </div>
      </div>

      ${canInstall ? `
        <button class="btn btn-go btn-block" id="install">Add to home screen</button>
      ` : `
        <details class="reveal">
          <summary>Put this on your home screen</summary>
          <div class="reveal-body prose">
            <p><b>Android / Chrome:</b> menu (⋮) → <i>Add to Home screen</i>.</p>
            <p><b>iPhone / Safari:</b> Share → <i>Add to Home Screen</i>.</p>
            <p>It then opens fullscreen, keeps your progress, and works without a connection.</p>
          </div>
        </details>
      `}

      <details class="reveal">
        <summary>How this works</summary>
        <div class="reveal-body prose">
          <p>Real CPython is compiled to WebAssembly and runs inside this page — your code
          never leaves the device, and neither does your progress.</p>
          <p>seaborn: <b>${python.hasSeaborn ? 'loaded' : 'unavailable offline'}</b>.</p>
          <p>${done} of ${ALL_LESSONS.length} lessons finished · ${xp} XP total.</p>
        </div>
      </details>

      <details class="reveal">
        <summary>Start over</summary>
        <div class="reveal-body prose">
          <p>Wipes progress, XP, streak and every saved snippet. No undo.</p>
          <button class="btn btn-sm btn-ghost" id="reset" style="color:var(--bad)">Erase everything</button>
        </div>
      </details>
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
