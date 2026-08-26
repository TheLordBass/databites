import { escapeHTML, tally, folio } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';

const hello = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
        <p class="label">Every lesson, finished</p>
        <h1 class="display">You're through<br>all ${ALL_LESSONS.length}.</h1>
        <p class="muted">Nothing left to unlock. Go and use it on data that's actually yours.</p>
        <button class="btn btn-primary btn-block" data-go="play">Open the Sandbox</button>
        <button class="btn btn-quiet btn-block" data-go="tracks">Revisit a track</button>
      </div>`;
    return wire(mount, ctx);
  }

  const first = doneCount === 0;

  mount.innerHTML = `
    <div class="stack">
      <p class="label">${hello()}${first ? '' : ` &middot; ${doneCount} down`}</p>

      <button class="block ${next.track.theme}" data-folio="${folio(next.index + 1)}"
              data-go="lesson/${next.id}">
        <div class="block-meta">
          <span>${escapeHTML(next.track.name)}</span>
          <span class="spacer">${next.mins} min</span>
        </div>
        <h1 class="block-title">${escapeHTML(next.title)}</h1>
        <p class="block-sub">${first
          ? 'Real Python, running on your phone. Nothing to install, nothing to sign up for.'
          : escapeHTML(next.task.replace(/`/g, ''))}</p>
        <span class="btn btn-onblock btn-block">${first ? 'Begin' : 'Continue'}</span>
      </button>

      <div class="figures">
        <div class="figure">
          <span class="figure-n">${doneCount}</span>
          <span class="figure-l">Done</span>
        </div>
        <div class="figure">
          <span class="figure-n">${store.state.xp}</span>
          <span class="figure-l">XP</span>
        </div>
        <div class="figure">
          <span class="figure-n">${ALL_LESSONS.length - doneCount}</span>
          <span class="figure-l">To go</span>
        </div>
      </div>

      <div class="quick-row">
        <button class="btn btn-quiet" data-go="lesson/${quick ? quick.id : next.id}">
          Shortest &middot; ${quick ? quick.mins : next.mins}m
        </button>
        <button class="btn btn-quiet" id="surprise">Surprise me</button>
      </div>

      <div>
        <p class="label label-mark" style="margin:0 0 12px">Tracks</p>
        <div class="tracklist">
          ${TRACKS.map((track) => {
            const done = track.lessons.filter((l) => store.isDone(l.id)).length;
            return `
              <button class="track ${track.theme}" data-go="track/${track.id}">
                <div class="track-top">
                  <span class="track-name">${escapeHTML(track.name)}</span>
                  <span class="track-count">${done}/${track.lessons.length}</span>
                </div>
                ${tally(done, track.lessons.length)}
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
