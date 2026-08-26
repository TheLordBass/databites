import { escapeHTML, meter, folio } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, trackById, COLUMNS, ALL_LESSONS } from '../curriculum/index.js';

export function renderTracks(mount, ctx) {
  ctx.setTitle('Tracks');
  mount.className = 'screen';

  const totalMins = ALL_LESSONS.reduce((n, l) => n + l.mins, 0);

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">The whole thing</p>
        <h1 class="display">${TRACKS.length} tracks,<br>${ALL_LESSONS.length} lessons.</h1>
        <p class="muted" style="margin:12px 0 0;font-size:15px">
          About ${Math.round(totalMins / 60)} hours end to end, in three-minute pieces.
        </p>
      </div>

      <div class="tracklist">
        ${TRACKS.map((track) => {
          const done = track.lessons.filter((l) => store.isDone(l.id)).length;
          return `
            <button class="track ${track.theme}" data-go="track/${track.id}">
              <div class="track-top">
                <span class="track-name">${escapeHTML(track.name)}</span>
                <span class="track-count">${done}/${track.lessons.length}</span>
              </div>
              <p class="track-blurb">${escapeHTML(track.blurb)}</p>
              ${meter(done / track.lessons.length)}
            </button>`;
        }).join('')}
      </div>

      <details class="reveal">
        <summary>What's in the <code>cafe</code> table?</summary>
        <div class="reveal-body">
          <p>Every lesson uses the same 120 rows of café sales, so you only ever
          learn one dataset.</p>
          <pre>${COLUMNS.map(([name, type, note]) =>
            `${name.padEnd(9)} ${type.padEnd(9)} ${note}`).join('\n')}</pre>
          <p style="margin-top:12px">A second table, <code>cities</code>, holds city, country and
          population. Kigali appears in it but never in <code>cafe</code> — which is what makes
          joins interesting.</p>
        </div>
      </details>
    </div>
  `;

  delegate(mount, ctx);
}

export function renderTrack(mount, ctx) {
  const track = trackById(ctx.params.id);
  if (!track) return ctx.go('tracks');

  const done = track.lessons.filter((l) => store.isDone(l.id)).length;
  const mins = track.lessons.reduce((n, l) => n + l.mins, 0);

  ctx.setTitle(track.name);
  ctx.showBack(true);
  mount.className = `screen ${track.theme}`;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">Track</p>
        <h1 class="display">${escapeHTML(track.name)}</h1>
        <p class="muted" style="margin:10px 0 16px;font-size:15px">${escapeHTML(track.blurb)}</p>
        ${meter(done / track.lessons.length)}
        <p class="muted" style="margin:10px 0 0;font-size:12.5px">
          ${done} of ${track.lessons.length} done &middot; ${mins} min total
        </p>
      </div>

      <div class="lessons">
        ${track.lessons.map((lesson, i) => {
          const isDone = store.isDone(lesson.id);
          return `
            <button class="lesson-row ${isDone ? 'is-done' : ''}" data-go="lesson/${lesson.id}">
              <span class="lesson-n">${isDone ? '&check;' : folio(i + 1)}</span>
              <span class="lesson-name">${escapeHTML(lesson.title)}</span>
              <span class="lesson-mins">${lesson.mins}m</span>
            </button>`;
        }).join('')}
      </div>
    </div>
  `;

  delegate(mount, ctx);
}

function delegate(mount, ctx) {
  mount.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });
}
