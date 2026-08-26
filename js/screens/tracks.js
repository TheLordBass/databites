import { escapeHTML, tally, folio } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, trackById, COLUMNS, ALL_LESSONS, chunkLessons } from '../curriculum/index.js';

export function renderTracks(mount, ctx) {
  ctx.setTitle('Tracks');
  mount.className = 'screen';

  const totalMins = ALL_LESSONS.reduce((n, l) => n + l.mins, 0);
  const doneAll = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label">The whole thing</p>
        <h1 class="display-xl">${TRACKS.length} tracks<br>${ALL_LESSONS.length} lessons</h1>
        <p class="muted" style="margin:14px 0 0;font-size:15px">
          About ${Math.round(totalMins / 60)} hours end to end — in three-minute pieces.
          You've done ${doneAll}.
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
              ${tally(done, track.lessons.length)}
            </button>`;
        }).join('')}
      </div>

      <details class="reveal">
        <summary>What's in the <code>cafe</code> table?</summary>
        <div class="reveal-body">
          <p>Every lesson uses the same 120 rows of caf&eacute; sales, so you only ever
          learn one dataset.</p>
          <pre>${COLUMNS.map(([name, type, note]) =>
            `${name.padEnd(9)} ${type.padEnd(9)} ${note}`).join('\n')}</pre>
          <p style="margin-top:12px">A second table, <code>cities</code>, holds city, country
          and population. Kigali appears in it but never in <code>cafe</code> &mdash; which is
          what makes joins interesting.</p>
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
  const upNext = (track.lessons.find((l) => !store.isDone(l.id)) || {}).id;

  ctx.setTitle(track.name);
  ctx.showBack(true);
  mount.className = `screen lesson-screen ${track.theme}`;

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label lesson-kicker">Track</p>
        <h1 class="display-xl" style="margin:6px 0 10px;color:var(--accent)">
          ${escapeHTML(track.name)}
        </h1>
        <p class="muted" style="margin:0 0 18px;font-size:15px">${escapeHTML(track.blurb)}</p>
        ${tally(done, track.lessons.length, 'tall')}
        <p class="muted" style="margin:12px 0 0;font-size:12.5px">
          ${done} of ${track.lessons.length} done &middot; ${mins} min total
        </p>
      </div>

      <div class="lessons">
        ${chunkLessons(track).map((part) => {
          const partDone = part.lessons.filter((l) => store.isDone(l.id)).length;
          const allDone = partDone === part.lessons.length;
          return `
            <section class="part ${allDone ? 'is-done' : ''}">
              <div class="part-head">
                <span class="part-name">${escapeHTML(part.name)}</span>
                <span class="part-count">${allDone ? 'Done' : `${partDone}/${part.lessons.length}`}</span>
              </div>
              ${part.lessons.map((lesson, i) => {
                const isDone = store.isDone(lesson.id);
                const isNext = !isDone && lesson.id === upNext;
                return `
                  <button class="lesson-row ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}"
                          data-go="lesson/${lesson.id}">
                    <span class="lesson-n">${isDone ? '&check;' : folio(part.start + i + 1)}</span>
                    <span class="lesson-name">${escapeHTML(lesson.title)}</span>
                    ${isNext ? '<span class="next-tag">Next</span>'
                             : `<span class="lesson-mins">${lesson.mins}m</span>`}
                  </button>`;
              }).join('')}
            </section>`;
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
