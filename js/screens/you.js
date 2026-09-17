import { escapeHTML, tally, toast } from '../ui.js';
import { store, levelInfo, isKeptSafe } from '../store.js';
import { python } from '../python.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';
import { PROBLEMS } from '../practice/problems.js';

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

/* The track you're closest to finishing — a far better prompt than a stat. */
function closestTrack() {
  const live = TRACKS
    .map((track) => {
      const done = track.lessons.filter((l) => store.isDone(l.id)).length;
      return { track, done, left: track.lessons.length - done };
    })
    .filter((t) => t.left > 0 && t.done > 0)
    .sort((a, b) => a.left - b.left);
  return live[0] || null;
}

export function renderYou(mount, ctx) {
  ctx.setTitle('You');
  mount.className = 'screen';

  const { xp } = store.state;
  const { level, into, need } = levelInfo(xp);
  const streak = store.liveStreak();
  const done = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  const minutes = ALL_LESSONS.filter((l) => store.isDone(l.id)).reduce((n, l) => n + l.mins, 0);
  const canInstall = Boolean(installPrompt);
  const close = closestTrack();
  const practiceDone = PROBLEMS.filter((p) => store.isDone(p.id)).length;

  mount.innerHTML = `
    <div class="stack">
      <div class="block block-static" data-folio="${level}">
        <div class="block-meta">
          <span>Level ${level}</span>
          <span class="spacer">${xp} XP total</span>
        </div>
        <h1 class="block-title">${done} lesson${done === 1 ? '' : 's'} down.</h1>
        <div style="position:relative;margin-bottom:10px">
          ${tally(Math.round((into / need) * 14), 14, 'tall')}
        </div>
        <p class="block-sub" style="margin:0">${need - into} XP to level ${level + 1}</p>
      </div>

      <div class="figures">
        <div class="figure">
          <span class="figure-n">${streak}</span>
          <span class="figure-l">Day streak</span>
        </div>
        <div class="figure">
          <span class="figure-n">${store.state.best}</span>
          <span class="figure-l">Best ever</span>
        </div>
        <div class="figure">
          <span class="figure-n">${minutes}</span>
          <span class="figure-l">Minutes</span>
        </div>
      </div>

      ${close ? `
        <button class="nudge ${close.track.theme}" data-go="track/${close.track.id}">
          <span class="nudge-body">
            <span class="nudge-t">${close.left} to finish ${escapeHTML(close.track.name)}</span>
            <span class="nudge-s">Closest thing you have to a finished track</span>
          </span>
          <span class="nudge-go">&rarr;</span>
        </button>` : ''}

      <div>
        <p class="label label-mark" style="margin:0 0 12px">Every track</p>
        <table class="ledger">
          ${TRACKS.map((track) => {
            const n = track.lessons.filter((l) => store.isDone(l.id)).length;
            return `
              <tr class="${track.theme}">
                <td>${escapeHTML(track.name)}</td>
                <td class="bar">${tally(n, track.lessons.length, '', 20)}</td>
                <td>${n}/${track.lessons.length}</td>
              </tr>`;
          }).join('')}
          <tr>
            <td>practice</td>
            <td class="bar">${tally(practiceDone, PROBLEMS.length, '', 20)}</td>
            <td>${practiceDone}/${PROBLEMS.length}</td>
          </tr>
        </table>
      </div>

      ${canInstall
        ? `<button class="btn btn-accent btn-block" id="install">Add to home screen</button>`
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
          <summary>Keep your progress safe</summary>
          <div class="reveal-body">
            <p id="safe-status">Your progress is saved in this browser, on this device only.</p>
            <p>Save it to a file now and then. Load that file on a new phone, or after
            clearing the browser, to carry on where you were. Loading only adds &mdash; it
            never removes anything already here.</p>
            <div class="quick-row">
              <button class="btn btn-quiet" id="export">Save to a file</button>
              <button class="btn btn-quiet" id="import">Load a file</button>
            </div>
            <input type="file" id="import-file" accept=".json,application/json" hidden>
          </div>
        </details>

        <details class="reveal">
          <summary>How this works</summary>
          <div class="reveal-body">
            <p>Real CPython, compiled to WebAssembly, running inside this page. Your code
            never leaves the device, and neither does your progress.</p>
            <p>seaborn: <b>${python.hasSeaborn ? 'loaded' : 'unavailable offline'}</b>.
            statsmodels and scikit-learn download only when a lesson needs them.</p>
            <p>SQL runs in SQLite, fetched the first time you use it. Every table is
            the same data the Python lessons use.</p>
            <p>DAX runs on a small engine written for this app, for learning. It isn't
            Microsoft's, but it gives Power BI's answers for what the lessons cover.</p>
            <p>${done} of ${ALL_LESSONS.length} lessons finished · ${xp} XP all told.</p>
          </div>
        </details>

        <details class="reveal">
          <summary>Start over</summary>
          <div class="reveal-body">
            <p>Wipes progress, XP, streak and every saved snippet. There is no undo &mdash;
            save your progress to a file first if you might want it back.</p>
            <button class="btn btn-quiet btn-sm" id="reset" style="color:var(--accent)">
              Erase everything
            </button>
          </div>
        </details>
      </div>
    </div>
  `;

  mount.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });

  const install = mount.querySelector('#install');
  if (install) {
    install.addEventListener('click', async () => {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      ctx.go('you');         // through the router: re-rendering this mount would stack a second click handler
    });
  }

  isKeptSafe().then((kept) => {
    const line = mount.querySelector('#safe-status');
    if (!line || !line.isConnected) return;
    line.textContent = kept
      ? 'This browser has agreed not to clear your progress — but it still lives on this device only.'
      : 'This browser may clear your progress if storage runs low, or if you stay away a long while. A saved file is your backup.';
  });

  mount.querySelector('#export').addEventListener('click', async () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const name = `databites-progress-${stamp}.json`;
    const file = new File([store.exportText()], name, { type: 'application/json' });
    // Phones: the share sheet can save to Files or Drive, which a download
    // often can't from a home-screen app.
    if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'DataBites progress' });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Saved — keep that file somewhere safe');
  });

  const picker = mount.querySelector('#import-file');
  mount.querySelector('#import').addEventListener('click', () => picker.click());
  picker.addEventListener('change', async () => {
    const file = picker.files && picker.files[0];
    picker.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("That file is too big to be a progress file");
      return;
    }
    try {
      const added = store.importText(await file.text());
      toast(added ? `Loaded — ${added} finished item${added === 1 ? '' : 's'} added` : 'Loaded — nothing new in that file');
      ctx.refreshChrome();
      ctx.go('you');
    } catch (err) {
      toast(err.message || "Couldn't read that file");
    }
  });

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
