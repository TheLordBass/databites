import { escapeHTML, tally, toast, saveFile, localDay, shortDay } from '../ui.js';
import { getDisplay, setDisplay } from '../display.js';
import { openShortcuts } from '../shortcuts.js';
import { store, levelInfo, isKeptSafe } from '../store.js';
import { python } from '../python.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';
import { PROBLEMS } from '../practice/problems.js';
import { rankOf, ACHIEVEMENTS, seedAchievements } from '../game.js';
import { sync, readCode, showCode } from '../sync.js';

/* Sync across devices (js/sync.js): a code to type on the other device, or a
   place to type one in. The status line under it is kept live by the handlers. */
function syncFold() {
  const code = sync.code;
  const { text, bad } = sync.status();
  const status = `<p class="sync-status${bad ? ' is-bad' : ''}" id="sync-status" role="status"${text ? '' : ' hidden'}>${escapeHTML(text)}</p>`;
  if (!code) {
    return `
      <details class="reveal" id="sync-fold">
        <summary>Sync across devices</summary>
        <div class="reveal-body">
          <p>Keep the same progress on two devices, like your phone and a work computer.
          You get a code to type on the other one. No email, no account.</p>
          <div class="quick-row">
            <button class="btn btn-quiet" id="sync-begin">Get a code</button>
            <button class="btn btn-quiet" id="sync-have">I have a code</button>
          </div>
          <div id="sync-join" hidden>
            <label class="rows-pick" style="margin-top:14px">
              <span class="label">Code</span>
              <input type="text" id="sync-code" autocomplete="off" autocapitalize="characters"
                spellcheck="false" maxlength="40" aria-label="Sync code from your other device">
            </label>
            <button class="btn btn-quiet btn-block" id="sync-connect" style="margin-top:12px">Connect</button>
          </div>
          ${status}
        </div>
      </details>`;
  }
  return `
    <details class="reveal" id="sync-fold">
      <summary>Sync across devices: on</summary>
      <div class="reveal-body">
        <p>To use this progress on another device, open QueryCafe there and type this code
        under <i>I have a code</i>:</p>
        <p class="sync-code">${showCode(code)}</p>
        <p class="needs-note">Keep it to yourself: anyone with the code can see and change this progress.</p>
        ${status}
        <div class="quick-row">
          <button class="btn btn-quiet" id="sync-now">Sync now</button>
          <button class="btn btn-quiet" id="sync-copy">Copy code</button>
        </div>
        <div class="sync-off">
          <button class="btn btn-quiet btn-sm" id="sync-stop">Stop syncing here</button>
          <button class="btn btn-quiet btn-sm" id="sync-erase" style="color:var(--accent)">Delete the synced copy</button>
        </div>
      </div>
    </details>`;
}

/* Every achievement, each saying how to get it: earned ones first (newest
   first), then the next four to earn, and the rest one tap away in a fold. */
function achievementsSection() {
  seedAchievements();
  const got = store.state.achievements;
  // newest first; the same day keeps the list's own order
  const earned = ACHIEVEMENTS.filter((a) => got[a.id])
    .sort((a, b) => (got[b.id] > got[a.id]) - (got[b.id] < got[a.id]));
  const locked = ACHIEVEMENTS.filter((a) => !got[a.id]);
  const { run } = store.state;
  const item = (a) => `
    <li class="ach${got[a.id] ? ' is-got' : ''}">
      <span class="ach-mark" aria-hidden="true">${got[a.id] ? '&check;' : ''}</span>
      <span class="ach-text">
        <span class="ach-name">${escapeHTML(a.name)}</span>
        <span class="ach-how">${got[a.id] ? `Earned ${escapeHTML(shortDay(got[a.id]))}` : escapeHTML(a.how)}</span>
      </span>
    </li>`;
  const later = locked.slice(4);
  return `
    <section class="part">
      <div class="part-head">
        <span class="part-name">Achievements</span>
        <span class="part-count">${earned.length} of ${ACHIEVEMENTS.length}</span>
      </div>
      <p class="week-sum">First-try run: ${run.count} now, best ${run.best}. A new lesson or problem passed
      with no failed run, no nudge and no peek adds one.</p>
      <ul class="ach-list">${[...earned, ...locked.slice(0, 4)].map(item).join('')}</ul>
      ${later.length ? `
        <details class="reveal">
          <summary>${later.length} more to earn</summary>
          <ul class="ach-list">${later.map(item).join('')}</ul>
        </details>` : ''}
    </section>`;
}

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

/* A daily 5-minute calendar slot with an alert, as an .ics file. Times are
   "floating" (no time zone), so it stays at 7pm wherever you are. */
function reminderCalendar(time) {
  const [hour, minute] = time.split(':').map(Number);
  const start = new Date();
  start.setHours(hour || 0, minute || 0, 0, 0);
  if (start < new Date()) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 5 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const floating = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const link = location.href.split('#')[0];
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QueryCafe//Daily reminder//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:querycafe-daily-${stamp}@ibomenobasiekanem.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${floating(start)}`,
    `DTEND:${floating(end)}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:QueryCafe: 5 minutes',
    `DESCRIPTION:Open QueryCafe and tap Just 5 minutes. ${link}`,
    `URL:${link}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:QueryCafe: 5 minutes', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n') + '\r\n';
}

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

/* You is three short tabs rather than one long scroll. The tab in view lasts
   until the app closes; a link can name one (you/settings). */
const SECTIONS = { progress: 'Progress', achievements: 'Achievements', settings: 'Settings' };
let section = 'progress';

export function renderYou(mount, ctx) {
  ctx.setTitle('You');
  mount.className = 'screen';
  if (SECTIONS[ctx.params.id]) section = ctx.params.id;

  const { xp } = store.state;
  const { level, into, need } = levelInfo(xp);
  const streak = store.liveStreak();
  const done = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  const minutes = ALL_LESSONS.filter((l) => store.isDone(l.id)).reduce((n, l) => n + l.mins, 0);
  const canInstall = Boolean(installPrompt);
  const close = closestTrack();
  const practiceDone = PROBLEMS.filter((p) => store.isDone(p.id)).length;
  const display = getDisplay();

  // Everything tried three or more times: lessons come back sooner in recall.
  const byLesson = new Map(ALL_LESSONS.map((l) => [l.id, l]));
  const byProblem = new Map(PROBLEMS.map((p) => [p.id, p]));
  const trouble = store.troubleSpots().map(([id, n]) => {
    const l = byLesson.get(id);
    if (l) return { n, title: l.title, where: l.track.name, go: `lesson/${id}` };
    const p = byProblem.get(id);
    if (p) return { n, title: p.title, where: 'practice', go: `problem/${id}` };
    return null;
  }).filter(Boolean).slice(0, 5);

  // The last seven days, today last: finishes per day, and what they were.
  const week = (() => {
    const entries = store.recentLog(7);
    const perDay = new Map();
    entries.forEach(([day]) => perDay.set(day, (perDay.get(day) || 0) + 1));
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = localDay(date);
      return { n: perDay.get(key) || 0, letter: date.toLocaleDateString(undefined, { weekday: 'narrow' }) };
    });
    const lessons = new Set(entries.map(([, id]) => id).filter((id) => byLesson.has(id)));
    const problems = new Set(entries.map(([, id]) => id).filter((id) => byProblem.has(id)));
    const where = {};
    lessons.forEach((id) => { const name = byLesson.get(id).track.name; where[name] = (where[name] || 0) + 1; });
    if (problems.size) where.practice = (where.practice || 0) + problems.size;
    const top = Object.entries(where).sort((a, b) => b[1] - a[1])[0];
    return { days, lessons: lessons.size, problems: problems.size, top: top ? top[0] : null, active: days.filter((d) => d.n).length };
  })();
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const did = [week.lessons && plural(week.lessons, 'lesson'), week.problems && plural(week.problems, 'problem')]
    .filter(Boolean).join(' and ');
  const weekLine = !did
    ? 'Nothing yet this week. One lesson counts.'
    : `${did}, on ${plural(week.active, 'day')} of the last 7.`
      + (week.top ? ` Mostly ${week.top}.` : '')
      + (trouble.length ? ` ${plural(trouble.length, 'trouble spot')} below.` : '');

  // Spare days (js/store.js): what keeps a streak alive through a missed day.
  const { spares } = store.state;
  const spareLine = `${spares ? `${spares} spare day${spares === 1 ? '' : 's'}: miss a day and your streak carries on.`
    : 'No spare days: miss a day and the streak starts again.'} A big day (3 new lessons or problems) earns one, up to ${store.maxSpares}.`;

  const chips = (set, options) => options.map(([value, label]) => {
    const on = (display[set] || '') === value;
    return `<button class="filter ${on ? 'is-on' : ''}" data-set="${set}" data-value="${value}" aria-pressed="${on}">${label}</button>`;
  }).join('');

  // Achievements get their own tab; Progress shows the count and the newest.
  const got = store.state.achievements;
  const earned = ACHIEVEMENTS.filter((a) => got[a.id]);
  const newest = earned.reduce((a, b) => (!a || got[b.id] > got[a.id] ? b : a), null);
  const tracksStarted = TRACKS.filter((t) => t.lessons.some((l) => store.isDone(l.id))).length;

  const progress = () => `
      <div class="block block-static" data-folio="${level}">
        <div class="block-meta">
          <span>Level ${level} &middot; ${escapeHTML(rankOf(level))}</span>
          <span class="spacer">${xp} XP total</span>
        </div>
        <h1 class="block-title">${done} lesson${done === 1 ? '' : 's'} down.</h1>
        <div style="position:relative;margin-bottom:10px">
          ${tally(Math.round((into / need) * 10), 10, 'tall')}
        </div>
        <p class="block-sub" style="margin:0">${need - into} XP to level ${level + 1}${
          rankOf(level + 1) !== rankOf(level) ? `: ${escapeHTML(rankOf(level + 1))}` : ''}</p>
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
      <p class="week-sum" style="margin-top:12px">${spareLine}</p>

      <section class="part">
        <div class="part-head">
          <span class="part-name">This week</span>
          <span class="part-count">${week.active} of 7 days</span>
        </div>
        <div class="week" aria-hidden="true">
          ${week.days.map((d) => `<div class="week-day${d.n ? ' is-on' : ''}">
            <i style="height:${d.n ? Math.min(44, 8 + d.n * 6) : 3}px"></i><span>${escapeHTML(d.letter)}</span>
          </div>`).join('')}
        </div>
        <p class="week-sum">${escapeHTML(weekLine)}</p>
      </section>

      <button class="nudge" data-section="achievements">
        <span class="nudge-body">
          <span class="nudge-t">${earned.length} of ${ACHIEVEMENTS.length} achievements</span>
          <span class="nudge-s">${newest ? `Newest: ${escapeHTML(newest.name)}` : 'See what there is to earn'}</span>
        </span>
        <span class="nudge-go">&rarr;</span>
      </button>

      ${close ? `
        <button class="nudge ${close.track.theme}" data-go="track/${close.track.id}">
          <span class="nudge-body">
            <span class="nudge-t">${close.left} to finish ${escapeHTML(close.track.name)}</span>
            <span class="nudge-s">Closest thing you have to a finished track</span>
          </span>
          <span class="nudge-go">&rarr;</span>
        </button>` : ''}

      <details class="reveal">
        <summary>Every track: ${tracksStarted} of ${TRACKS.length} started</summary>
        <div class="reveal-body">
        <table class="ledger">
          ${TRACKS.map((track) => {
            const n = track.lessons.filter((l) => store.isDone(l.id)).length;
            return `
              <tr class="${track.theme}">
                <td>${escapeHTML(track.name)}</td>
                <td class="bar">${tally(n, track.lessons.length, 'tally-sm', 8)}</td>
                <td>${n}/${track.lessons.length}</td>
              </tr>`;
          }).join('')}
          <tr>
            <td>practice</td>
            <td class="bar">${tally(practiceDone, PROBLEMS.length, 'tally-sm', 8)}</td>
            <td>${practiceDone}/${PROBLEMS.length}</td>
          </tr>
        </table>
        </div>
      </details>

      ${trouble.length ? `
        <section class="part">
          <div class="part-head">
            <span class="part-name">Trouble spots</span>
            <span class="part-count">tries</span>
          </div>
          ${trouble.map((t) => `
            <button class="lesson-row" data-go="${t.go}">
              <span class="lesson-n">${t.n}</span>
              <span class="lesson-name">${escapeHTML(t.title)}</span>
              <span class="lesson-mins">${escapeHTML(t.where)}</span>
            </button>`).join('')}
          <p class="needs-note" style="margin:10px 0 0">These took the most goes. Lessons here come back in
          Refills sooner, and leave the list once you get them cleanly.</p>
        </section>` : ''}`;

  const settings = () => `
      <div>
        <p class="label label-mark settings-label">Settings</p>
        <details class="reveal">
          <summary>Display: theme and text size</summary>
          <div class="reveal-body">
            <p class="label" style="margin:0 0 8px">Theme</p>
            <div class="filters" style="margin:0">
              ${chips('theme', [['', 'Like my device'], ['light', 'Light'], ['dark', 'Dark']])}
            </div>
            <p class="label" style="margin:16px 0 8px">Text size</p>
            <div class="filters" style="margin:0">
              ${chips('size', [['small', 'Smaller'], ['', 'Default'], ['large', 'Larger']])}
            </div>
          </div>
        </details>

        <details class="reveal">
          <summary>A daily reminder</summary>
          <div class="reveal-body">
            <p>A web app can't reliably nudge you on a phone, but your calendar can. This adds a
            5-minute QueryCafe slot every day, with an alert.</p>
            <label class="rows-pick">
              <span class="label">Time</span>
              <input type="time" id="remind-time" value="19:00">
            </label>
            <button class="btn btn-quiet btn-block" id="remind" style="margin-top:12px">Add to my calendar</button>
          </div>
        </details>

        <details class="reveal">
          <summary>Make it work offline</summary>
          <div class="reveal-body">
            <p id="offline-status">${store.state.offlineReady
              ? 'Everything is downloaded: every lesson works without a connection.'
              : 'The app already works offline once it has loaded. A few lessons need an extra engine (SQLite, statsmodels, scikit-learn or the DAX engine), fetched the first time they run. Get them all now, before a flight.'}</p>
            <button class="btn btn-quiet btn-block" id="offline">${store.state.offlineReady ? 'Check them again' : 'Download them all now'}</button>
          </div>
        </details>

        ${syncFold()}

        <details class="reveal">
          <summary>Keep your progress safe</summary>
          <div class="reveal-body">
            <p id="safe-status">${sync.code
              ? 'Your progress is saved in this browser, and synced under your code, so your other device has a copy too.'
              : 'Your progress is saved in this browser, on this device only.'}</p>
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

      </div>

      <div>
        <p class="label label-mark settings-label">About</p>
        ${canInstall
          ? `<button class="btn btn-quiet btn-block" id="install" style="margin-bottom:6px">Add to home screen</button>`
          : `<details class="reveal">
              <summary>Put this on your home screen</summary>
              <div class="reveal-body">
                <p><b>Android / Chrome:</b> menu (⋮) → <i>Add to Home screen</i>.</p>
                <p><b>iPhone / Safari:</b> Share → <i>Add to Home Screen</i>.</p>
                <p>It then opens full screen, keeps your progress, and works with no connection.</p>
              </div>
            </details>`}
        <details class="reveal">
          <summary>How this works</summary>
          <div class="reveal-body">
            <p>Real CPython, compiled to WebAssembly, running inside this page. Your code
            never leaves the device. Neither does your progress, unless you turn on
            Sync across devices.</p>
            <p>seaborn: <b>${python.hasSeaborn ? 'loaded' : 'unavailable offline'}</b>.
            scipy, statsmodels and scikit-learn download only when a lesson, or your code in the Sandbox, needs them.</p>
            <p>SQL runs in SQLite, fetched the first time you use it. Every table is
            the same data the Python lessons use.</p>
            <p>DAX runs on a small engine written for this app, for learning. It isn't
            Microsoft's, but it gives Power BI's answers for what the lessons cover.</p>
            <p>${done} of ${ALL_LESSONS.length} lessons finished · ${xp} XP all told.</p>
            <button class="btn btn-quiet btn-block" id="keys">Keyboard shortcuts</button>
          </div>
        </details>
        <details class="reveal">
          <summary>The small print</summary>
          <div class="reveal-body">
            <p>QueryCafe is an independent learning app. It isn't affiliated with, endorsed
            by or sponsored by Microsoft. Microsoft, Power BI and PL-300 are trademarks of
            Microsoft. Other names here (Python, pandas, SQLite and the rest) belong to their
            owners, and are used only to say what's taught.</p>
            <p>The PL-300 practice questions were written for this app. They aren't questions
            from the real exam.</p>
            <p>Every person, business, review and number in the lessons and questions is made
            up. Any likeness to a real one is chance.</p>
            <p>Sync across devices is off unless you turn it on. When it's on, your progress
            (what you've finished, XP, streak, Refills and exam answers, but not the code you
            type) is kept in a database run by Supabase, under your sync code, with no name or
            email. <i>Stop syncing here</i> forgets the code on this device. <i>Delete the synced
            copy</i> erases it from the database.</p>
            <p>&copy; 2026 Ibomeno Basiekanem. All rights reserved. Type: Fraunces and IBM Plex,
            under the SIL Open Font License. Python: Pyodide.</p>
          </div>
        </details>

      </div>

      <div class="danger">
        <details class="reveal">
          <summary>Start over</summary>
          <div class="reveal-body">
            <p>Wipes progress, XP, streak and every saved snippet. There is no undo &mdash;
            save your progress to a file first if you might want it back.${sync.code ? `
            This device stops syncing first, so your synced copy and other devices keep theirs.` : ''}</p>
            <button class="btn btn-quiet btn-sm" id="reset" style="color:var(--accent)">
              Erase everything
            </button>
          </div>
        </details>
      </div>`;

  mount.innerHTML = `
    <div class="stack">
      <div class="filters seg" role="group" aria-label="Part of You">
        ${Object.entries(SECTIONS).map(([k, name]) => `
          <button class="filter ${section === k ? 'is-on' : ''}" data-section="${k}"
                  aria-pressed="${section === k}">${name}</button>`).join('')}
      </div>
      ${section === 'achievements' ? achievementsSection() : section === 'settings' ? settings() : progress()}
    </div>
  `;

  mount.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-section]');
    if (tab) {
      section = tab.dataset.section;
      ctx.go('you');
      return;
    }
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });

  // Everything below wires up Settings.
  if (section !== 'settings') return;

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
    if (!line || !line.isConnected || sync.code) return;
    line.textContent = kept
      ? 'This browser has agreed not to clear your progress — but it still lives on this device only.'
      : 'This browser may clear your progress if storage runs low, or if you stay away a long while. A saved file is your backup.';
  });

  /* Sync across devices. After turning it on or off, You is drawn again with
     the fold still open, so the next step is right there. */
  const reopenSync = () => {
    ctx.go('you');
    const fold = document.getElementById('sync-fold');
    if (fold) fold.open = true;
  };
  const syncLine = mount.querySelector('#sync-status');
  const say = (text, bad = false) => {
    syncLine.textContent = text;
    syncLine.hidden = !text;
    syncLine.classList.toggle('is-bad', bad);
  };
  const stopWatching = sync.watch(() => {
    if (!syncLine.isConnected) return stopWatching();
    const { text, bad } = sync.status();
    say(text, Boolean(bad));
  });
  const busy = (button, text) => {
    button.disabled = true;
    button.dataset.label = button.textContent;
    button.textContent = text;
  };
  const free = (button) => {
    if (!button.isConnected) return;
    button.disabled = false;
    button.textContent = button.dataset.label;
  };

  const begin = mount.querySelector('#sync-begin');
  if (begin) {
    begin.addEventListener('click', async () => {
      busy(begin, 'Getting a code…');
      const result = await sync.begin();
      if (result.error) return free(begin);
      toast('Syncing. Now type the code on your other device.');
      reopenSync();
    });

    const join = mount.querySelector('#sync-join');
    const input = mount.querySelector('#sync-code');
    const connect = mount.querySelector('#sync-connect');
    mount.querySelector('#sync-have').addEventListener('click', () => {
      join.hidden = false;
      input.focus();
    });
    const tryCode = async () => {
      const code = readCode(input.value);
      if (!code) return say("That isn't a whole code. It's 20 letters and numbers, as shown on your other device.", true);
      busy(connect, 'Connecting…');
      const result = await sync.join(code);
      if (!sync.code) {
        free(connect);
        return say(result.error, true);
      }
      // Connected, even if sending this device's part back has to wait for a retry.
      if (!result.error) toast('Connected. This device now shares that progress.');
      reopenSync();
    };
    connect.addEventListener('click', tryCode);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') tryCode();
    });
  }

  const now = mount.querySelector('#sync-now');
  if (now) {
    now.addEventListener('click', async () => {
      busy(now, 'Syncing…');
      await sync.now();
      free(now);
    });
    mount.querySelector('#sync-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(showCode(sync.code))
        .then(() => toast('Code copied'))
        .catch(() => toast("Couldn't copy it. Write the code down instead."));
    });
    mount.querySelector('#sync-stop').addEventListener('click', () => {
      sync.stop();
      toast('Stopped syncing on this device');
      reopenSync();
    });
    mount.querySelector('#sync-erase').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (button.dataset.armed !== '1') {
        button.dataset.armed = '1';
        button.textContent = 'Tap again to delete it';
        setTimeout(() => {
          if (button.isConnected && button.dataset.armed === '1') {
            button.dataset.armed = '0';
            button.textContent = 'Delete the synced copy';
          }
        }, 4000);
        return;
      }
      button.dataset.armed = '2';
      busy(button, 'Deleting…');
      const result = await sync.erase();
      if (result.error) {
        free(button);
        button.dataset.armed = '0';
        button.textContent = 'Delete the synced copy';
        return say(result.error, true);
      }
      toast('Synced copy deleted. This device keeps its progress.');
      reopenSync();
    });
  }

  mount.querySelector('#export').addEventListener('click', async () => {
    if (await saveFile(`querycafe-progress-${localDay()}.json`, store.exportText(), 'application/json')) {
      toast('Saved — keep that file somewhere safe');
    }
  });

  // Display chips change in place, so the open section stays open.
  mount.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-set]');
    if (!chip) return;
    setDisplay({ [chip.dataset.set]: chip.dataset.value });
    mount.querySelectorAll(`[data-set="${chip.dataset.set}"]`).forEach((b) => {
      const on = b === chip;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  });

  mount.querySelector('#keys').addEventListener('click', () => openShortcuts());

  mount.querySelector('#offline').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const line = mount.querySelector('#offline-status');
    button.disabled = true;
    button.textContent = 'Downloading…';
    const off = python.on('pkg', ({ text }) => { if (text && line.isConnected) line.textContent = text; });
    const packages = await python.ensure(['sqlite3', 'statsmodels', 'scikit-learn', 'scipy']);
    const dax = await python.run({ code: 'Ready = 1', key: 'offline-dax', lang: 'dax', timeoutMs: 60000 });
    off();
    if (!button.isConnected) return;
    button.disabled = false;
    if (packages.ok && dax.ok) {
      store.markOfflineReady();
      line.textContent = 'Everything is downloaded: every lesson works without a connection.';
      button.textContent = 'Check them again';
    } else {
      line.textContent = "Some of it didn't download. Check the connection and try again.";
      button.textContent = 'Try again';
    }
  });

  mount.querySelector('#remind').addEventListener('click', async () => {
    const time = mount.querySelector('#remind-time').value || '19:00';
    if (await saveFile('querycafe-daily.ics', reminderCalendar(time), 'text/calendar', { share: false })) {
      toast('Open the file to add it to your calendar');
    }
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
    // Stop syncing first, or the empty progress would be sent to the other devices.
    sync.stop();
    store.reset();
    // "Every saved snippet" includes the Sandbox's drafts, kept under their own keys.
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('databites.sandbox'))
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* storage blocked: nothing was saved there anyway */ }
    toast('Cleared. Fresh start.');
    section = 'progress';
    ctx.refreshChrome();
    ctx.go('home');
  });
}
