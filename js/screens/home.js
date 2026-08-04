import { escapeHTML, ICON, ring } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';

const hello = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

/* The whole point of this screen: one obvious thing to tap. */
export function nextLesson() {
  return ALL_LESSONS.find((l) => !store.isDone(l.id)) || null;
}

const shortest = () => {
  const open = ALL_LESSONS.filter((l) => !store.isDone(l.id));
  return open.sort((a, b) => a.mins - b.mins)[0] || null;
};

export function renderHome(mount, ctx) {
  ctx.setTitle('DataBites');
  mount.className = 'screen';

  const next = nextLesson();
  const doneCount = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;
  const quick = shortest();

  if (!next) {
    mount.innerHTML = `
      <div class="stack">
        <div class="done-wrap">
          <div class="done-emoji">🏆</div>
          <h1 class="h1">All ${ALL_LESSONS.length} done</h1>
          <p class="muted">Every lesson, finished. Go build something with it.</p>
        </div>
        <button class="btn btn-go btn-block" data-go="play">${ICON.play}<span>Open the Sandbox</span></button>
        <button class="btn btn-ghost btn-block" data-go="tracks">Replay a track</button>
      </div>`;
    return wire(mount, ctx);
  }

  const first = doneCount === 0;

  mount.innerHTML = `
    <div class="stack">
      <div class="hero">
        <p class="hero-greet">${hello()}${first ? '' : ` · ${doneCount} lesson${doneCount === 1 ? '' : 's'} in`}</p>
      </div>

      <div class="next-card ${next.track.theme}">
        <div class="next-meta">
          <span class="badge-track">${escapeHTML(next.track.name)}</span>
          <span class="chip">${next.mins} min</span>
        </div>
        <h2 class="next-title">${escapeHTML(next.title)}</h2>
        <p class="next-why">${first
          ? 'Start here. Real Python, running on your phone — no setup, nothing to install.'
          : escapeHTML(next.task)}</p>
        <button class="btn btn-go btn-block" data-go="lesson/${next.id}">
          ${ICON.play}<span>${first ? 'Start' : 'Continue'}</span>
        </button>
      </div>

      <div class="quick-row">
        <button class="btn btn-ghost" data-go="lesson/${quick ? quick.id : next.id}">
          ⚡ ${quick ? quick.mins : next.mins} min bite
        </button>
        <button class="btn btn-ghost" id="surprise">${ICON.dice}<span>Surprise me</span></button>
      </div>

      <div class="stat-row">
        <div class="stat">
          <div class="stat-n">${doneCount}</div>
          <div class="stat-l">Done</div>
        </div>
        <div class="stat">
          <div class="stat-n">${store.state.xp}</div>
          <div class="stat-l">XP</div>
        </div>
        <div class="stat">
          <div class="stat-n">${ALL_LESSONS.length - doneCount}</div>
          <div class="stat-l">Left</div>
        </div>
      </div>

      <div>
        <div class="eyebrow" style="margin-bottom:10px">Your tracks</div>
        <div class="stack">
          ${TRACKS.map((track) => {
            const done = track.lessons.filter((l) => store.isDone(l.id)).length;
            const pct = done / track.lessons.length;
            return `
              <button class="track-card ${track.theme}" data-go="track/${track.id}">
                <div class="ring">${ring(pct)}<div class="ring-label">${Math.round(pct * 100)}</div></div>
                <div style="flex:1;min-width:0">
                  <div class="track-name">${escapeHTML(track.name)}</div>
                  <div class="track-sub">${escapeHTML(track.blurb)}</div>
                </div>
                <div class="lesson-mins">${done}/${track.lessons.length}</div>
              </button>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  wire(mount, ctx);

  const surprise = mount.querySelector('#surprise');
  if (surprise) {
    surprise.addEventListener('click', () => {
      const open = ALL_LESSONS.filter((l) => !store.isDone(l.id));
      const pick = open[Math.floor(Math.random() * open.length)];
      ctx.go(`lesson/${pick.id}`);
    });
  }
}

function wire(mount, ctx) {
  mount.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });
}
