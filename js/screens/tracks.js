import { escapeHTML, ICON, ring } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, trackById, COLUMNS, ALL_LESSONS } from '../curriculum/index.js';

export function renderTracks(mount, ctx) {
  ctx.setTitle('Tracks');
  mount.className = 'screen';

  mount.innerHTML = `
    <div class="stack">
      <div>
        <div class="eyebrow">Pick a lane</div>
        <h1 class="h1">${TRACKS.length} tracks, ${ALL_LESSONS.length} lessons</h1>
      </div>

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

      <details class="reveal">
        <summary>What's in the <code>cafe</code> table?</summary>
        <div class="reveal-body">
          <p style="margin:0 0 10px">Every lesson uses the same 120 rows of café sales, so you
          only ever learn one dataset.</p>
          <pre>${COLUMNS.map(([name, type, note]) =>
            `${name.padEnd(9)} ${type.padEnd(9)} ${note}`).join('\n')}</pre>
          <p style="margin:10px 0 0">A second table, <code>cities</code>, is loaded too — city,
          country and population. Kigali appears in it but never in <code>cafe</code>, which is
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
  const pct = done / track.lessons.length;

  ctx.setTitle(track.name);
  ctx.showBack(true);
  mount.className = `screen ${track.theme}`;

  mount.innerHTML = `
    <div class="stack">
      <div style="display:flex;align-items:center;gap:14px">
        <div class="ring" style="width:58px;height:58px">
          ${ring(pct, 58, 5)}
          <div class="ring-label" style="font-size:13px">${Math.round(pct * 100)}</div>
        </div>
        <div>
          <h1 class="h1" style="margin:0">${escapeHTML(track.name)}</h1>
          <p class="muted" style="margin:2px 0 0;font-size:14px">
            ${done} of ${track.lessons.length} lessons ·
            ${track.lessons.reduce((n, l) => n + l.mins, 0)} min total
          </p>
        </div>
      </div>

      ${track.lessons.map((lesson, i) => {
        const isDone = store.isDone(lesson.id);
        return `
          <button class="lesson-row ${isDone ? 'is-done' : ''}" data-go="lesson/${lesson.id}">
            <span class="lesson-num">${isDone ? ICON.check : i + 1}</span>
            <span class="lesson-title">${escapeHTML(lesson.title)}</span>
            <span class="lesson-mins">${lesson.mins}m</span>
          </button>`;
      }).join('')}
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
