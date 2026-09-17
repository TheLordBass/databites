import { escapeHTML, tally, folio } from '../ui.js';
import { store } from '../store.js';
import { TRACKS, ALL_LESSONS } from '../curriculum/index.js';
import { PROBLEMS } from '../practice/problems.js';

const openProblems = () => PROBLEMS.filter((p) => !store.isDone(p.id)).length;

const hello = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const LEVEL = { easy: 0, medium: 1, hard: 2 };

/* Just 5 minutes: a due recall, the next lesson, and the easiest open
   problem in that lesson's language. */
function fiveMinutes(ids) {
  const steps = [];
  const [recall] = store.dueReviews(ids);
  if (recall) steps.push(`lesson/${recall}/review`);
  const next = nextLesson();
  if (next) steps.push(`lesson/${next.id}`);
  const lang = next ? next.lang : 'python';
  const open = PROBLEMS.filter((p) => !store.isDone(p.id));
  const same = (p) => ((p.lang || 'python') === lang ? 0 : 1);
  const [problem] = [...(open.length ? open : PROBLEMS)]
    .sort((a, b) => same(a) - same(b) || LEVEL[a.difficulty] - LEVEL[b.difficulty]);
  if (problem) steps.push(`problem/${problem.id}`);
  return steps;
}

/* The whole point of this screen: one obvious thing to tap. */
export function nextLesson() {
  return ALL_LESSONS.find((l) => !store.isDone(l.id)) || null;
}

export function renderHome(mount, ctx) {
  ctx.setTitle('DataBites');
  mount.className = 'screen';

  const next = nextLesson();
  const doneCount = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;

  // Finished lessons coming back for a quick recall — a few, never a wall.
  const byId = new Map(ALL_LESSONS.map((l) => [l.id, l]));
  store.seedReviews([...byId.keys()]);
  const due = store.dueReviews([...byId.keys()]).map((id) => byId.get(id));
  const recall = due.length ? `
      <section class="part recall">
        <div class="part-head">
          <span class="part-name">Quick recall</span>
          <span class="part-count">${due.length} for today</span>
        </div>
        ${due.map((l) => `
          <button class="lesson-row ${l.track.theme}" data-go="lesson/${l.id}/review">
            <span class="lesson-n">${folio(l.index + 1)}</span>
            <span class="lesson-name">${escapeHTML(l.title)}</span>
            <span class="lesson-mins">${escapeHTML(l.track.name)}</span>
          </button>`).join('')}
      </section>` : '';

  // One loud thing on this screen: the next lesson. Everything else is quiet.
  const session = store.currentSession();
  const doneToday = store.sessionDoneToday();
  const fiveLabel = doneToday ? 'Another 5 minutes' : 'Just 5 minutes';
  const carryOn = session
    ? `<button class="btn btn-quiet btn-block" data-go="${session.steps[session.at]}">Carry on: step ${session.at + 1} of ${session.steps.length}</button>`
    : '';
  const quickRow = session ? carryOn : `
      <div class="quick-row">
        <button class="btn btn-quiet" id="five">${fiveLabel}</button>
        <button class="btn btn-quiet" id="surprise">Surprise me</button>
      </div>`;

  // Tracks you're part-way through, not the whole index: that's the Tracks tab.
  const progress = TRACKS.map((track) => ({ track, done: track.lessons.filter((l) => store.isDone(l.id)).length }));
  const going = progress.filter(({ track, done }) => done > 0 && done < track.lessons.length);
  const shelf = (going.length ? going : progress.filter(({ track, done }) => done < track.lessons.length)).slice(0, 3);
  const trackRows = shelf.map(({ track, done }) => `
    <button class="track ${track.theme}" data-go="track/${track.id}">
      <div class="track-top">
        <span class="track-name">${escapeHTML(track.name)}</span>
        <span class="track-count">${done}/${track.lessons.length}</span>
      </div>
      ${tally(done, track.lessons.length, '', 30)}
    </button>`).join('');

  if (!next) {
    mount.innerHTML = `
      <div class="stack">
        <p class="label">Every lesson, finished</p>
        <h1 class="display">You're through<br>all ${ALL_LESSONS.length}.</h1>
        <p class="muted">Nothing left to unlock. Go and use it on data that's actually yours.</p>
        ${session ? carryOn : `<button class="btn btn-quiet btn-block" id="five">${fiveLabel}</button>`}
        ${recall}
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
          ? 'Real Python, running anywhere. Nothing to install, nothing to sign up for.'
          : escapeHTML(next.task.replace(/`|\*\*/g, ''))}</p>
        <span class="btn btn-onblock btn-block">${first ? 'Begin' : 'Continue'}</span>
      </button>

      ${quickRow}

      ${recall}

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

      <div>
        <div class="section-head">
          <p class="label label-mark">${going.length ? 'Keep going' : 'Where to start'}</p>
          <button class="btn-text" data-go="tracks">All ${TRACKS.length} tracks</button>
        </div>
        <div class="tracklist">${trackRows}</div>
      </div>

      <button class="nudge" data-go="practice">
        <span class="nudge-body">
          <span class="nudge-t">${openProblems()
            ? `${openProblems()} practice problems to crack`
            : 'Every practice problem solved'}</span>
          <span class="nudge-s">Hidden tests, no hand-holding. For when the lessons start to feel easy.</span>
        </span>
        <span class="nudge-go">&rarr;</span>
      </button>
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
    if (event.target.closest('#five')) {
      const steps = fiveMinutes(ALL_LESSONS.map((l) => l.id));
      if (!steps.length) return;
      store.startSession(steps);
      ctx.go(steps[0]);
      return;
    }
    const target = event.target.closest('[data-go]');
    if (target) ctx.go(target.dataset.go);
  });
}
