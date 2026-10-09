import { escapeHTML, tally, folio, toast } from '../ui.js';
import { store } from '../store.js';
import { todaysQuest, pickQuest } from '../game.js';
import { TRACKS, ALL_LESSONS, firstUndone, openLessons, isPrimer } from '../curriculum/index.js';
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
   problem in that lesson's language. Someone still on the primer isn't
   ready for a practice problem (they all need pandas, SQL or DAX), so
   they get the primer's following lesson instead. */
function fiveMinutes(ids) {
  const steps = [];
  const [recall] = store.dueReviews(ids);
  if (recall) steps.push(`lesson/${recall}/review`);
  const next = nextLesson();
  if (next) steps.push(`lesson/${next.id}`);
  if (next && isPrimer(next)) {
    const after = next.track.lessons[next.index + 1];
    if (after && !store.isDone(after.id)) steps.push(`lesson/${after.id}`);
    return steps;
  }
  const lang = next ? next.lang : 'python';
  const open = PROBLEMS.filter((p) => !store.isDone(p.id));
  const same = (p) => ((p.lang || 'python') === lang ? 0 : 1);
  // On the Algorithms track, an algorithms problem; anywhere else, a data one.
  const algo = Boolean(next && next.track.id === 'algo');
  const topic = (p) => (p.tags.includes('algorithms') === algo ? 0 : 1);
  const [problem] = [...(open.length ? open : PROBLEMS)]
    .sort((a, b) => same(a) - same(b) || topic(a) - topic(b) || LEVEL[a.difficulty] - LEVEL[b.difficulty]);
  if (problem) steps.push(`problem/${problem.id}`);
  return steps;
}

/* The whole point of this screen: one obvious thing to tap. */
export function nextLesson() {
  return firstUndone((id) => store.isDone(id));
}

/* Today's special (a quest in js/game.js): three to pick from, then the one picked, with
   how far along it is and a tap that goes and does it. Quiet, like recall:
   the next lesson stays the one loud thing here. */
function questSection() {
  const q = todaysQuest();
  if (!q.quest && !q.offers.length) return '';
  const head = (count) => `
    <div class="part-head">
      <span class="part-name">Today's special</span>
      <span class="part-count">${count}</span>
    </div>`;
  if (!q.quest) {
    return `
      <section class="part quest">
        ${head('pick one for bonus XP')}
        ${q.offers.map((t) => `
          <button class="lesson-row" data-quest="${t.id}">
            <span class="lesson-name">${escapeHTML(t.label)}</span>
            <span class="lesson-mins">+${t.xp} XP</span>
          </button>`).join('')}
      </section>`;
  }
  if (q.done) {
    return `
      <section class="part quest">
        ${head('done')}
        <div class="lesson-row is-done">
          <span class="lesson-n">&check;</span>
          <span class="lesson-name">${escapeHTML(q.quest.label)}</span>
          <span class="lesson-mins">+${q.quest.xp} XP</span>
        </div>
      </section>`;
  }
  const next = nextLesson();
  const [recall] = store.dueReviews(ALL_LESSONS.map((l) => l.id));
  const go = { next: next ? `lesson/${next.id}` : 'tracks', recall: recall ? `lesson/${recall}/review` : 'home',
    practice: 'practice', exam: 'exam' }[q.quest.go];
  return `
    <section class="part quest">
      ${head(`${q.n} of ${q.of}`)}
      <button class="lesson-row" data-go="${go}">
        <span class="lesson-name">${escapeHTML(q.quest.label)}</span>
        <span class="lesson-mins">+${q.quest.xp} XP</span>
      </button>
      ${tally(q.n, q.of, 'quest-tally')}
    </section>`;
}

export function renderHome(mount, ctx) {
  ctx.setTitle('DataBites');
  mount.className = 'screen';

  const next = nextLesson();
  const doneCount = ALL_LESSONS.filter((l) => store.isDone(l.id)).length;

  // Finished lessons coming back for a quick recall — a few, never a wall.
  // On screen they're Refills, with a line that says plainly what they are.
  const byId = new Map(ALL_LESSONS.map((l) => [l.id, l]));
  store.seedReviews([...byId.keys()]);
  const due = store.dueReviews([...byId.keys()]).map((id) => byId.get(id));
  const recall = due.length ? `
      <section class="part recall">
        <div class="part-head">
          <span class="part-name">Refills</span>
          <span class="part-count">${due.length} for today</span>
        </div>
        <p class="part-sub">Lessons you've done, back for a quick go so they stick.</p>
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
  // Past the primer, a track with only primer lessons left isn't offered either.
  const pastPrimer = ALL_LESSONS.some((l) => !isPrimer(l) && store.isDone(l.id));
  const onlyPrimerLeft = (track) => track.lessons.every((l, i) => store.isDone(l.id) || i < (track.primer || 0));
  const shelf = (going.length ? going : progress.filter(({ track, done }) =>
    done < track.lessons.length && !(pastPrimer && onlyPrimerLeft(track)))).slice(0, 3);
  const trackRows = shelf.map(({ track, done }) => `
    <button class="track ${track.theme}" data-go="track/${track.id}">
      <div class="track-top">
        <span class="track-name">${escapeHTML(track.name)}</span>
        <span class="track-count">${done}/${track.lessons.length}</span>
      </div>
      ${tally(done, track.lessons.length, '', 12)}
    </button>`).join('');

  if (!next) {
    // Only the primer can still be open here: skipped because they were past it.
    const skipped = ALL_LESSONS.length - doneCount;
    mount.innerHTML = `
      <div class="stack">
        <p class="label">${skipped ? 'Everything past the basics, finished' : 'Every lesson, finished'}</p>
        <h1 class="display">You're through<br>all ${doneCount}.</h1>
        <p class="muted">${skipped
          ? "Only the Python course's first steps are left, and you're well past them. They're on Tracks if you ever want a refresher."
          : "Nothing left to unlock. Go and use it on data that's actually yours."}</p>
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
      <p class="label">${hello()}${first ? '' : '. The usual?'}</p>

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

      ${questSection()}

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
      const open = openLessons((id) => store.isDone(id));
      const pick = open[Math.floor(Math.random() * open.length)];
      ctx.go(`lesson/${pick.id}`);
    });
  }
}

function wire(mount, ctx) {
  mount.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-quest]');
    if (pick) {
      const notes = pickQuest(pick.dataset.quest);
      if (notes.length) toast(notes.map((n) => n.text).join(' · '));
      ctx.go('home');
      return;
    }
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
