# QueryCafe

Learn **Python** (pandas, NumPy, matplotlib, seaborn, statistics, forecasting, machine learning and algorithms), **SQL**, **DAX** and **Excel** formulas in 3-minute bites, on your phone.

Real CPython runs inside the page (Pyodide → WebAssembly). Your code never
leaves the device, and neither does your progress unless you turn on Sync across
devices. After the first load it works with no connection.

It used to be called DataBites. The web address, the repo and the internal
`databites.*` storage keys keep that name on purpose, so links, installed copies
and saved progress all carry over.

---

## Why it's built this way

Every design decision here is aimed at the "I want to learn this but I keep
bouncing off it" problem:

| Friction | What the app does |
| --- | --- |
| Deciding what to do | Home screen is **one button**: the next lesson |
| Setup before learning | Nothing to install — no Anaconda, no Colab, no login |
| Walls of text | Max 3 bullets per concept, then you type |
| Getting stuck → quitting | **Nudge me** → **Just show me the answer**, one tap, no penalty |
| Typing `["` on a phone | Tap-to-insert snippet bar under the editor |
| Losing your place | Everything resumes exactly where you left it |
| Learning 5 datasets at once | One home dataset (`cafe`) for the mechanics; new tables only where meeting unfamiliar data *is* the lesson |
| Boring linear order | "Surprise me" and "⚡ shortest bite" buttons |
| Broken streaks | The streak only moves when you *finish* something (a lesson, a problem, a Refill or a PL-300 question), and spare days (you start with one, 7 days in a row or a big day earns another, up to two) cover missed days |

---

## The design

Editorial, not dashboard, and set in a cafe: the cafe's print (a menu board,
a loyalty card, a stamp) rather than coffee photos, chalkboards or brown
everywhere, which would cost the contrast and the loud blocks the app relies
on to hold attention. The rules, in case you extend it:

- **No cards.** Hairline rules (`--rule`) and whitespace separate things. If you
  find yourself adding a border-radius and a background to group content, use a
  rule and some space instead.
- **Type carries the hierarchy.** Fraunces for anything that announces
  itself (titles, big numbers, track names), IBM Plex Sans for reading, IBM Plex
  Mono for code. Nothing in between competes.
- **Matcha and nude.** By day the accent is matcha green
  (`#4f6b26`) on crema paper (`#f8f3ea`), with nude (`#8c5e4d`, still called `--caramel` in the CSS) for the
  warm things: the streak chip, the loyalty card's punched cups, spare days and
  big days. At night the paper is a matcha so dark it reads as black
  (`#12150d`), with matcha in its greys and lines, the type is crema, and nude (`#dcae9a`) takes over as the accent. It was
  brown at night before, and people found it muddy: the browns in the greys
  and lines did that. Coffee-cherry red (`--danger`) is kept for what can't be
  undone, like starting over. Each track still overrides `--accent` with its
  own colour. Both are real modes, driven by `prefers-color-scheme`, and every
  grey clears 4.5:1 on all three papers.
- **Colour themes.** The Hyde Special (matcha and nude) is the house look and the default (what anyone
  new sees, and anyone who hasn't picked), but You → Settings → Display offers
  five more. Each is a pair, the way matcha and nude are: one colour by day,
  a partner that leads at night (and shows by day, deeper, in the warm
  details), on a night paper tinted by the day colour. Each has a café name:
  Caramel Macchiato is coffee brown by day and caramel at night, Espresso
  Tonic blue and lemon, Rose Latte pink and mint, London Fog calm slate and
  lavender, and High contrast (a plain name, since it's for reading ease) black and
  white, blue by day and yellow at night. A theme sets the base tokens through
  `[data-palette]` on the root (styles.css, after the dark blocks); a swatch
  in Settings carries the same attribute to preview its theme in the current
  light or dark. Every pair clears 4.5:1, the track inks on each theme's
  papers included, and lessons keep their track colours whatever the theme.
  `THEMES` in `js/display.js` names them and keeps their paper colours for
  the browser's bar; index.html applies the choice before the first paint.
- **Points, not XP.** On screen it's points, like a coffee shop's loyalty
  points: earn them, reach the next level. "XP" is gamer's jargon, and points
  is the plain word. In the code and in saved progress it's still `xp`, so
  nobody's progress changes.
- **Progress is a loyalty card.** `tally()` draws round stamps, punched in sets
  of five, filled ones with a stamp's ring: a row on lists, two rows of ten on a
  track page, tiny ones in the You ledger. Past its `max`, a stamp stands for a
  few lessons; the first fills on any progress and the last only when it's all
  done.
- **Lists read like a menu board.** A dotted leader runs from a lesson or track
  name to its number, the way a menu runs from a drink to its price (CSS only:
  `::after` with `order`).
- **No emoji in the interface.** Success is one slim green row under your
  output: small-caps "That's it", and a serif `+28` that pops in and counts up.
  A short burst of coffee beans goes with it, with a few paper scraps in the
  tracks' inks (`confetti()` in `ui.js`): bigger for a finished track, a project,
  a hard problem, a Signature or a special, and none at all when the device asks for
  reduced motion. PL-300 practice gets a smaller burst from the "Right" box when
  you check a right answer (more for choose-two and put-in-order); never during
  a mock.
- **Cafe words, never at the cost of clarity.** Today's special, Refills (with a
  line underneath saying they're lessons coming back so they stick), "The
  usual?" over the next lesson, and the home tab is the Café (it was Today;
  a screen reader hears "Café, home"). Anything a cafe word would hide stays
  plain. Courses have café names after the plain one, "pandas: Daily
  Grind", where the course is the heading (its card and its page;
  `courseTitle` in `curriculum/index.js`, from each course's `cafe` field),
  and sentences keep the plain name ("On to pandas"). Practice questions go
  further: each opens with its situation, set in the café's own world (the
  cafés, the online shop, the app, coffee cards, the barista school), in
  `practice/stories.js`, and its title names that situation ("Which days
  needed a second barista?"; `practice/cafe-names.js`, shown everywhere by
  `problemTitle` in `practice/problems.js`). The instructions under the
  situation stay exactly as plain as before, and search reads the situation
  and the old plain title too. Each question is laid out as a brief
  (`practice/briefs.js`, drawn by `briefHTML` in practice.js): the
  situation, what you get with every column explained, "They want you to:"
  as bullets, exactly what to return, and "Good to know" for the edge cases.
  A brief only rearranges the question's own prompt and notes, which stay in
  its file as the fallback, so it must never change what the judge expects.
  tests.html checks every course and question has a name, no two match, and
  every question has its situation and a full brief. Switching tabs, the accent bar slides along the top of the tab bar
  to the new tab and its word lifts (`moveTabInk` in `js/main.js`).
- **Changing screens cross-fades.** A still copy of the screen you leave
  stays a moment over the new one and fades away (`fadeAway` in
  `js/main.js`), so there is never a blank frame. The screen itself leaves the
  page at once, so the screens' `isConnected` checks still work: a sheet's
  preview or an Expected output that arrives after you've gone leaves it
  alone. A new page rises gently
  into place under it; a sub-page (You's sections, Practice's subjects, the
  Sandbox's languages) only fades, so what didn't change doesn't move. Which
  parts of a route make a new page is the route's `page` in `ROUTES`. The
  new screen goes into the page first, so code that looks up an id straight
  after a render finds the new one.
- **The page scrolls, not a box inside it**, so a phone browser tucks its
  address bar away as you scroll down and brings it back as you scroll up.
  The top bar (`.top-chrome`) sticks to the top and the tab
  bar to the bottom; `html` has `scroll-padding-bottom` so anything scrolled
  to stays clear of the tab bar. Code that keeps or resets a scroll position
  uses the window (`window.scrollY`, `window.scrollTo`), never
  `#screen`'s scrollTop. The fading copy of the old screen is `position:
  fixed` where it was on the window.
- **The cafe's things, drawn** (`js/cafe.js`), each with plain words beside it:
  a loyalty card on Home (the one exception to "no cards", because it's an
  object being drawn, not a box around content), a cup that fills a
  little more each day in a row towards a big day (14), a till receipt when "Just 5 minutes" ends and for the
  week on You, latte art when a track is finished, a cup in the streak chip
  that steams once something's done today.
- **Spare days and big days have icons and a "?" beside them.** A spare day
  is a voucher (a ticket with a cup on it; an empty slot is a faint dashed
  ticket), a big day a full cup steaming. Home shows both under today's cup,
  You shows them on the spare-day line, and the win notes carry them. The "?"
  opens a small card saying what the thing is and what to do with it
  (`helpTip`/`addTips` in `js/ui.js`): one card at a time, closed by tapping
  away, Escape, scrolling or the "?" again.
- **They move a little when you reach for them.** Hovering (or tapping, on a
  phone, via `.is-poked` from `js/cafe.js`) makes the big day's steam rise as
  the cup tips, the spare-day vouchers wiggle, a stamped cup on the loyalty
  card or a stamped day on You's week thunk down like the stamp's pressed
  again, and an empty one lift. The stamps keep their hand-stamped tilt
  (`--tilt`). The progress stamps (`tally()`) do the same wherever they
  are: hover the stamps or the card they sit on and the stamped ones pop in
  turn (`--i`, set by `tally()`), and the next one to earn pulses.
  Today's cup on Home rocks on its saucer when hovered or tapped, its
  coffee sloshing (the fill pivots on its surface) and a puff of steam
  rising even before it's full.
  Reduced motion turns it all off.
- **On the paper, never behind the reading.** Two faint coffee-ring stains sit
  at the screen's edges and scroll with it; on a wide screen, beans fill the
  empty margins either side of a list screen, never beside a lesson, problem
  or the Sandbox, which use the whole width.
- **Sounds, off by default.** You → Settings → Display and sound. Made with Web
  Audio (`js/sound.js`), nothing to download: a cup set on its saucer for a
  pass, milk steam for the big wins, two glasses clinking for a Taste test
  and the counter bell, ding ding, for a Signature (the `.won` block's
  `data-sound`). Each is sine partials with their own ring times and a tick
  of noise (`strike()`). Per device, like the theme.
- **Background sounds to learn to.** The headphones in the top bar, on every
  screen, open a panel: Play, then a row for each layer (lo-fi music, café
  chatter, rain) with its on/off button and its own volume slider, and an
  Overall volume. A layer's slider starts at 70, the balance they were mixed
  at: 100 is about twice as loud and 0 is silent (`layerGain`: the layer's
  place in the mix times (level/70)²). A safety limiter (-3 dB, 20:1) sits
  last, so a layer and Overall both turned right up can't clip into crackle.
  Layers, levels and volume are kept per device.
  Once Play has been pressed, two small buttons sit right beside the
  headphones: Pause/Play (its label says what's on) and a cross that stops the
  sounds and hides them. The headphones open the mix. Where the
  browser offers it, the Media Session API puts the same controls on the
  lock screen and headset buttons. The music, rain and the café's cups are synthesised in
  `js/ambience.js`; only the café chatter is a recording. Each layer is rendered once with an
  OfflineAudioContext into a loop and then just played, so it never stutters
  while Python runs and keeps going in a background tab, with no timers.
  Rendering is heavy for a phone, so renders queue one at a time (rain, then
  café, then the music, quickest first), the second music tape waits 12
  seconds, and the live context asks for `latencyHint: 'playback'` (bigger
  buffers). All at once, it starved the live audio and crackled on phones.
  - *Lo-fi music*: two 16-bar tapes at 74 BPM that take turns, so the music
    repeats only every couple of minutes. Seventh chords on an FM electric
    piano, a round bass, a swung beat (kick, snare, hats), a sparse
    pentatonic melody through a delay, a room reverb and a slow tape wobble.
    There's no vinyl crackle: its hiss read as static and its pops (six a
    second) as a crackle. The tapes are booked one ahead: each, when it ends, books the next.
  - *Café chatter*: a real recording, "QUIET CAFE, CHATTER, MILK FROTHING
    MACHINE" by Anya_Media on freesound.org (sound 437461, CC0, public
    domain), 2 minutes with a milk frother partway through. It lives in
    `audio/cafe-chatter.mp3` (2.8 MB), fetched the first time the layer plays.
    The service worker keeps `.mp3` files in its long-lived cache, so it isn't
    fetched again with each new version. It's decoded at the layer's low
    sample rate, brought from its quiet -46 dB to a steady level, trimmed
    below 90 Hz and above 7 kHz, and looped with its last 3 seconds
    cross-faded over its start in place, so there's no click and no second
    copy in memory. Generated cups, a spoon stirring and the door bell sit
    quietly on top, on their own 40-second loop. Synthesised chatter was
    tried twice first (a buzz through vowel formants, then speech-shaped
    noise) and sounded robotic, then like wind at an airport.
  - *Rain*: wide filtered noise, a low rumble and drops on the glass, on a
    20-second loop.
  - Each layer uses its own seed, so it sounds the same every time. Loops are
    rendered 3 seconds long and the extra is crossfaded over the start, so
    there's no click where they join. Pausing suspends the audio context, which
    stops its clock, so everything resumes in step. The layers and volume are
    kept per device, but it never starts by itself: a browser only plays sound
    after a tap.
- **Numbers are set as folios**, zero-padded, the way a book numbers chapters.
- **The icon** is a cream cup from the side, on its saucer, on a matcha
  tile, tipped just enough to show the coffee in it, and the steam rising
  off it is a bar chart in three tones of crema (`icons/icon.svg`;
  `icon-maskable.svg` is the cropped-safe version Android uses). The matcha
  matches the app, and the nude steam stands out on it. The PNGs
  are rendered from the SVGs with headless Edge, through a page that sizes the
  image exactly (an SVG opened directly lays out at the wrong size). It tops
  Home beside the wordmark, and the loading screen, where its steam brews
  while the engine loads.

The fonts are the app's own files, in `fonts/` (latin and latin-ext only), and
the service worker keeps them with the rest of the shell, so offline still
works and no font request goes to a third party. Every stack has a real local
fallback.

## Run it on your computer

No Node, no Python, no build step needed.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8123>.

Opening `index.html` directly with `file://` will **not** work — ES modules and
service workers need a real `http://` origin.

---

## Get it on your Android phone

It's already live at **https://ibomenobasiekanem.com/databites/** (the old
address, thelordbass.github.io/databites, redirects there).

Open that in Chrome on your phone → menu **⋮** → **Add to Home screen**. It then
opens full screen with no browser chrome, and the app's **You** tab offers a
one-tap install button whenever Chrome allows it.

To publish updates, just push — Pages redeploys itself:

```bash
git add -A && git commit -m "your change" && git push
```

**Versions.** Every build raises `VERSION` in `js/version.js` and `SHELL` in
`sw.js` to the same number (tests.html fails if they differ); You → About
shows it. The service worker fetches the app's own files **network first**
(past the browser's HTTP cache, with a cheap ETag check), so a new build is
what everyone gets the first time they open it. The cached copy is only the
fallback: offline, or a network that takes over 3 seconds. A new worker takes
over at once and the page reloads into it, and an app left open for over 10
minutes looks for a new build when it comes back.

**What's new.** `WHATS_NEW` in `js/guide.js` is a short spotlight tour of what
a build changed. It's shown once on Home to anyone who's used the app before
(a newcomer's first tour covers it). With each build that changes how things
work differently (something new you can do, or a change to how the app
works; never looks, renames, animations or polish), add a step with `v` set to the new `VERSION` (newest first). Each
person sees only the steps newer than the last tour they saw, or all of
them if they never saw one. Its `covers` lists tips it repeats, marked seen
along with it. The store keeps the
build each guide was seen in (`guideVer`), so a screen's guide listed in
`REWRITTEN` with a build number reaches, once, anyone who saw an older one.
A new guide or tip needs nothing: it reaches everyone the first time it
applies.

> First launch downloads ~25 MB of Python runtime. Do it on wifi once; after
> that the service worker serves it from cache and the app opens offline.

---

## Staying with it

- **The game layer** (`js/game.js`), borrowed from Boot.dev where it helps
  learning:
  - *Today's special* (a quest, in the code): Home offers three goals a day (an easy, a medium and a
    hard one: finish lessons, solve a problem, do the recalls, answer PL-300
    questions, pass lessons first try). Pick one; it can't be swapped. Finish
    it for 25, 40 or 60 bonus points.
  - *First-try runs*: a new lesson or problem passed with no failed run, no
    nudge, no smaller step and no peek at the answer extends the run; anything
    else starts it again. Every 5 in a row is worth 15 points.
  - *Spare days*: each covers one missed day of the streak. Everyone starts
    with one; 7 days in a row earns another, and so does a big day (14 days
    in a row), up to two.
    They replaced a hidden one-day forgiveness, and You says how many you have.
    A last day that's ahead of today here (another device's clock or time
    zone, synced over) counts as today, so it can't reset the streak.
  - *Replays*: doing something again pays a quarter of its points, once a
    day; Run again straight after a pass pays nothing (and shows no "+0").
    A test-out, Taste test or Signature question moves on once, however
    many times it's run, and only the run that ends the test pays for it.
  - *Levels and ranks*: each level needs a quarter more points than the one
    before, up to level 10, then 8% more, so practice keeps moving you up
    (all the lessons land around level 23, everything around 27). A title per
    band of levels, Intern to Living Legend.
  - *Practice pays*: easy 20, medium 45, hard 80 (`XP` in problems.js), and
    half again for a clean first solve: no wrong submit, no hint, no peek.
  - *Practice rank* (game.js `practiceRank`): a barista ladder, Trainee to
    Coffee Master, from the base pay of every practice question solved. It is
    worked out from `done`, so nothing extra is stored or synced. On Practice
    and on You.
  - *Interview bonus*: all three in time earns 60 points, once a set, and a
    new best time 40 more (`store.interviewBest`, merged as the faster).
  - *Achievements*: 34, on You → Achievements with how to earn each (the
    earned ones and the next four, the rest one tap away), tied to real
    skills (first join, first CALCULATE, a stage of the path) and habits
    (streaks, specials, recalls, runs). Ones earned before they existed unlock
    quietly at start-up, once. Each earned one is a stamp of its own
    (`achStampSVG` in `js/stamps.js`): its own drawing, its own ink (a
    track's colour, or nude for the streaks and the cups), a figure under the
    drawing where it counts something (7, 25, 70%, ALL), its name round the
    ring and the day it was earned round the bottom. A stamp you haven't seen
    yet is stamped down when the screen opens, one after another in reading
    order, marked New (`achSeen` in the store, synced, so each lands once);
    after that, hovering or tapping one stamps it again. The ones still to
    earn show their drawing in a faint dashed ring (`achGhostSVG`), and the
    counted ones how far along you are (`achProgress` in `js/game.js`: 3
    of 7 days, 12 of 25 solved, 340 of 576 points to level 5; runs and
    streaks count the current one). The four shown first are the ones you're
    furthest along. A new achievement also lands as a stamp on the win
    screen, on the paper under the reward box (a coloured box would swallow
    its ink), after the lesson's own stamp, with a rubber stamp's thud when
    sounds are on, as each one landing on Achievements does.
  - *Stamps*: every finished lesson earns its own rubber stamp, drawn from
    the lesson (`js/stamps.js`): its title round the top of the ring, the
    track's motif and the lesson number in the middle, the day it was
    finished round the bottom. The lesson id picks the border (double ring,
    seal, dashed, dotted) and the tilt; the track gives the ink; a shared SVG
    filter in `index.html` wears the ink. A new one lands under the win with
    a thunk, each track's page keeps its stamp card (where a hover or a tap
    stamps one again), and finished rows show
    a small stamp instead of a tick. Nothing is stored: a stamp is redrawn
    from the lesson and its finish date, so stamps sync with the progress.
  - *Signatures* (stage bosses; "boss" in the code): the end of each stage of the path, on Courses: the lessons
    that close each of its steps, 3 or 4 of them, cold (the test-out
    machinery, `kind: 'boss'`). Unlocked by finishing the stage; worth 100 points.
  - *Taste tests* (mini bosses; "mini" in the code): one per track (all but Projects, which is a stage of its
    own), on the track's page: 2 or 3 lessons that close its parts, never its
    last one (the Signature asks that), cold (`kind: 'mini'`, `miniSteps` in
    `game.js`). Unlocked by finishing the track, which says so under the win,
    and Courses marks it ready until it's beaten; worth 50 points. Kept in
    `store.minis`, which syncs and merges like the Signatures. On screen
    they're always named with a plain line beside them (a few questions from
    across the stage or course, for bonus points).
  - *Loyalty card*: weekly, Monday to Sunday, a cup for each day with its
    letter under it. A day you finish anything (a lesson, a problem, a Refill,
    or a PL-300 question checked: `store.examDay()` logs one `pl300` entry a day)
    is stamped. Five stamped days this week pay +40 points, once that week.
    Stamps in a row count across weeks: every 7th day in a row saves a spare
    day, and every 14th is a big day instead, which also saves a spare day.
    This is the only way to earn a big day: it used to be three new lessons in
    a day, and is now two weeks of days in a row. Today's cup on Home fills
    towards it, a fourteenth more each day, and steams on the big day
    (`state.bigDay`).
    A run pays at 7, 14, 21, 28 and on. It is real days in a row: a spare day
    keeps the streak alive but doesn't fill a gap in the stamps
    (`store.stampCard`). A fresh card starts on Monday. The stamps are read
    from `store.log`, so all that is kept is the week and the day each last
    paid (`card.paidWeek`, `card.runPaid`) and how many cards have been filled.
    Two devices merge to the later of each and the higher count. The card
    shows one short line for the week, one for days in a row (and what the
    next one brings), and a footnote.
    When there aren't enough days left in the week to reach five, the card says
    so plainly. It used to be ten cups, one per new lesson. That filled in a
    day on a busy one and felt daily, so cards already filled kept their count
    when it changed.

  Deliberately left out: loot chests, gems and a shop (random rewards are a
  slot machine, and with ADHD they become the thing you chase), and
  leaderboards and leagues (they need accounts, and ranking against strangers
  puts beginners off). Everything is local, in the store, and goes into the
  progress file. Screens call `after()` when something is finished and show
  the notes it returns under the reward.
- **Courses, not tracks.** On screen a track is a *course* (the Courses tab, "Course
  complete"), a plain word that also fits the cafe, where a meal comes in
  courses. The code still calls them tracks.
- **Code and output, both in view.** Lessons, problems and the Sandbox lay out the
  same way. On a phone held upright they stack, and Run brings your code to the
  top of the screen with the output straight under it (`showResult` in
  `ui.js`). On anything wider there are two layouts, switched from the
  editor's top bar or You → Settings → Display, kept per device
  (`data-layout` on the root):
  - *Output below the code* (the default): the reading on the left, the editor
    and its output on the right.
  - *Side by side*: the output beside the editor. Two columns on a tablet;
    three on a laptop, with the editor in the middle and widest.

  Either way the page is the only thing that scrolls: nothing is pinned and
  the output never scrolls inside a box of its own (it used to), the same on
  lessons, practice and the Sandbox. After a run, `showResult` brings
  whichever of the code and the output starts higher to the top of the screen.
- **What's next carries on where you were.** Home's next lesson (and Courses'
  "Next") is the next one not done in the same step of the path as the lesson
  you last finished as a lesson, not a refill or test (`whatsNext` in
  `curriculum/index.js`, `store.lastLesson`). Once that step is done, the path
  takes over again, from the course chosen on the welcome screen. Before this,
  someone who chose SQL and then did Python lesson 1 was still offered SQL
  lesson 1, and "This part" sat at 0/5.
- **Not the whole menu at once.** Home's third figure is how far you are through
  the part you're on ("2/5 This part"), not how many lessons are left, and
  Courses leads with the stage you're in ("You're here" on its heading).
  Every other stage is listed open below, with a line on what it covers: they
  were folded away once, but then someone who picked SQL at the welcome saw
  only Python. The lesson count is still there, once, at the bottom.
- **A welcome, then a short guide.** Someone brand new (nothing finished, never
  welcomed) gets `js/screens/welcome.js` where Home would be: what this is, and
  where to start (from zero, a bit of Python, SQL, Excel or Power BI). The
  answer is `store.startAt`, and `openLessons` offers the path from that course
  on first. Then `js/guide.js` lights up Home's parts one at a time (the next
  lesson, today's cup and the card, the streak, three tabs) with Skip all. Every
  other screen has its own short guide the first time it's opened: Courses, a
  course, a lesson, Practice, a problem, the Sandbox, You and PL-300 prep.
  Each step lights one real thing and says what it's for; a step whose thing
  isn't showing at that width is passed over (the layout switch only exists
  on wide screens). Settings has one too, Sync across devices first, then
  saving to a file, offline, the reminder, display, the home screen and About;
  so do Achievements and a running Interview set. Screens call
  `guideIfDue(name)`; the store keeps when each was seen (`guides`), in which
  build (`guideVer`) and when they were last reset (`guidesFrom`), so
  "Show the first-time guides again" (You → Settings → About) survives sync.
  Someone bringing progress over at the welcome skips them all.
- **Tips as you go.** `TIPS` in `js/guide.js` are one-step guides for
  things that turn up later or only sometimes: Just 5 minutes and Surprise
  me, Sync across devices (on Home, pointing at You, once something's
  finished and sync is off), Today's special, Refills, what's in the data
  (Courses), a Refill's folded explanation, keyboard shortcuts (with a mouse),
  the gap-filling outline after three misses, See another way after a solve,
  Load CSV, DAX matrix rows and Excel sheets. A screen's tips whose things
  are already showing come at the end of its own guide, so a newcomer gets
  them all at once; the rest show the first time their thing turns up, one a
  visit. A screen calls `tipIfDue(name)` after drawing something new, like a
  run's result. **Skip all** on any guide, tip or What's new marks that
  screen's guide and every one of its tips as seen, so nothing more pops up
  there until something new does (a new tip, or a guide in `REWRITTEN`).
- **A learning path.** Courses shows every course as a numbered step, in the
  order to take them, under nine stages, one per tool: Excel (Excel, then Excel cleaning;
  no code to write), SQL (SQL, then SQL cleaning), Python and pandas (Python parts 1 to 7,
  pandas, messy data, reshaping and joining, matplotlib, seaborn), Find the story, Power BI,
  Put it together, Build with Python (Python parts 8 to 16, ETL and pipelines, algorithms),
  AI and machine learning (NumPy, AI, machine learning) and R. The step you're on says which
  lesson is next. The Python course is split: its first seven parts (all pandas needs) come
  just before pandas, and parts 8 to 16 open Build with Python, just before ETL and
  pipelines (which builds on the course's last lesson, a small ETL program), so nobody does
  eighty lessons of plain Python before touching data. Each stage has an `id`: its
  Signature is saved under it, and its badge is `stage-<id>`, so stages can move without
  progress moving with them (store.js maps the Signatures saved under stage numbers before
  v175). Home's "what's next" and the button
  after a lesson walk the same path ("On to pandas" at the end of part 7).
  It lives in `TRACK_GROUPS` in `curriculum/index.js`; tests.html checks it
  takes in every lesson exactly once.
- **Test out.** Every unfinished part of a track, apart from Projects, offers
  "Know these already? Test out": the part's last two lessons, cold (no
  teaching, hints or answer; route `lesson/<id>/test`). Pass both and every
  lesson in the part is marked done, with points only for the two actually solved.
  State lives in `store.testOut`.
- **Tables look like tables.** A DataFrame or Series that's printed or left
  as a cell's last line, and every table an SQL query returns, is drawn as a
  grid. That means column names on a shaded row, the index (pandas) or row
  numbers (SQL, as SQL Server shows them) pinned on the left, values
  formatted exactly as pandas prints them (dates as 2024-01-01, NULL for an
  empty SQL value), and a "…" row where pandas cuts a long table short (past
  `display.max_rows`, its first and last few). The worker notes each one as
  it's printed (`_GRIDS`, `_table_print`, `_grid` in `worker.js`), and
  `ui.printed()` swaps that stretch of the printed text for the grid. The
  printed text itself is unchanged, because lesson checks read it. Practice
  draws its tables the same way. The worker sends views beside the text
  (`inputView`, `expectedView`, `gotView`, from `_view` in `worker.js`,
  the first ten rows; DAX's matrices as matrix tables). The example is a
  list of folds like Nudge me, closed until tapped: one per input table,
  titled with just its name (`menu`), an Excel sheet under its sheet name,
  and Expected output. A short value (a word, a number, True) sits on its
  row with no fold, and DAX's model is a sentence above. After a run only
  Your output shows, full width; a failed hidden test adds two folds under
  it, The data in this test and What this test expected, since those aren't
  the example's. A lesson has an Expected output fold too, in its task box:
  what the lesson's own solution shows when it runs (worked out the first
  time ahead, never typed in: `expected.html` runs every solution and writes
  what it shows into `js/curriculum/expected.js`, which comes with the app,
  so it shows the moment the fold opens and never touches Python or R. The
  charts are in it too, as PNGs (about 2.4 MB of the file), so no lesson has
  to run anything to show it. Each entry carries `expectedStamp` (curriculum/index.js) of the
  answer, data and settings it came from; if the lesson has changed since,
  the lesson works it out live instead, and tests.html lists the missing or
  stale ones. Rerun
  expected.html after adding or changing lessons, or after changing how an
  engine draws its output, which no stamp can see; it saves through
  `serve.ps1`, so only on the local server), drawn the way a Run is (`outputBlocks` in
  `js/ui.js`). An Excel answer shows only the cells it fills, with no formula
  and no step-through (`answerOnly`), since the formula, and which columns it
  reads, are what the learner works out. It isn't there in a test-out or a
  Signature, whose checks use fixed data. Every lesson's solution shows
  something: tests.html checks it with the rest (`showsOutput`). Tables fill their box, the index as narrow as its labels.
  Every table's contents are centred, and every grid has lines between its
  columns, headings included, as do DAX matrices and Excel sheets. Courses'
  "What's in the cafe table?" is a grid too.
- **See what you made.** Code that ends by storing something (`busy = ...`,
  `cafe["tip"] = ...`) prints nothing, so the result shows what's in it,
  under "What's in busy now". In lessons, problems and the Sandbox; worked out
  after the check (`_echo_stored()` in `worker.js`), so it never counts as
  printed output. Numbers show as `4303`, not numpy 2's `np.int64(4303)`.
- **See another way.** After a lesson or problem passes, the model answer is
  one tap away, with the lines yours didn't have marked. It's hidden when
  yours already matches.
- **In other databases.** SQL lessons where SQLite differs from PostgreSQL,
  BigQuery or SQL Server carry a `dialects` list, shown folded under the
  concept: `LIMIT` vs `TOP`, integer division, date functions, date
  differences, `CREATE TABLE AS`, text joining, `QUALIFY` and `DISTINCT ON`.
- **This week.** You shows the last seven days as date stamps (a nude stamp on a day you finished something, with how many under the date when it's more than one), with one line: lessons,
  problems, active days, the busiest track. It comes from `store.log`, which was
  seeded once from existing finish dates.
- **Make it work offline.** You downloads every optional engine (SQLite,
  statsmodels, scikit-learn, scipy, the DAX engine) in one go, so every lesson
  works without a connection.
- **Keyboard and screen readers.** `?` outside a text box (or You → Settings → How this
  works) lists the shortcuts in a native `<dialog>`. Results are announced
  (`aria-live`), focus moves to each new screen, the current tab is marked
  `aria-current`, and charts have real alt text.
- **Just 5 minutes.** One button on Home builds today's steps: a due recall,
  the next lesson, and the easiest open problem in that lesson's language.
  They're walked in order, with a step counter and a skip, and nothing to
  choose. State lives in `store.session`; the flow is in `js/session.js`.
- **Trouble spots.** Failed lesson runs and failed practice submits are
  counted. Anything tried three or more times is listed on You → Progress, and such a
  lesson's first recall comes the next day and goes to the front of the
  queue. A clean recall, or a solve without peeking, clears it.
- **Plain-English errors.** Python errors end with a Tip worked out from the
  real workspace: "There's no column called 'Revenue'. Did you mean
  'revenue'?", `.grupby` → `.groupby`, `cafe.Revenue` → brackets, `=` for
  `==`, `and`/`or` on pandas conditions, indentation, unclosed brackets, a
  missing colon, text without quotes, a misspelt dict key, text `+` a number,
  a library the app doesn't have. See `_hint()` in `worker.js`. The Sandbox
  fetches scikit-learn, scipy, statsmodels and SQLite the first time code
  imports one, the way a lesson's `needs` does.
- **A daily reminder.** You → Settings → A daily reminder downloads an `.ics` file with a
  5-minute event every day and an alert. The calendar does the nudging,
  which a web app can't do reliably on a phone.
- **Display.** You → Settings → Display: Light, Dark or Like my device, and three text
  sizes. `index.html` applies the choice before first paint. Dark colours live
  twice in the CSS — in the media query and under `[data-theme="dark"]` — so
  change both together. Text size zooms each screen's content, since the
  stylesheet is in px.
- **Refills (quick recall).** A finished lesson comes back on Home 2, 7 and 21 days
  later, as its task alone: the starter code, with the teaching folded away.
  A solved practice question comes back too, a week, three weeks and two
  months later, to solve again from its stub in a draft of its own (so the
  solved code doesn't give it away); opening its solution brings it back
  tomorrow and leaves its clean-solve mark alone. A Refill counts once, while
  it is due (`store.isDue`): passing it again straight after is a replay that
  moves nothing on, and once it counts its draft is cleared, so the next time
  it comes back it starts cold. Three Refills a day at most,
  and only one of them a question, so a backlog never turns into a wall; "Not
  today" leaves it due. Questions solved before they joined Refills are taken
  in once, from their solve dates. State lives in `store.reviews` (and
  `reviewProblemDay` for the one a day); the routes are `lesson/<id>/review`
  and `problem/<id>/review`; `dueRefills` and `refillRoute` in `js/game.js`
  are what Home, Just 5 minutes and the daily special use.
- **A smaller step.** After three failed runs in a row, a lesson offers its
  answer as a scaffold. Keywords and function names stay, and anything the
  starter didn't already contain is blanked to `___`. When that leaves no
  gaps (an answer made only of names the starter had), every new line is
  blanked instead, so it's never the whole answer. See `skeleton()` in
  `lesson.js`, which uses the tokenizer in `highlight.js`.
- **Keep your progress safe.** Progress lives in the browser. The app asks the
  browser to keep it (`navigator.storage.persist()`), and You → Settings → Keep your
  progress safe saves it to a JSON file and loads one back. Loading merges:
  finished lessons are combined, points and best streak take the higher value, and
  nothing on the device is removed (`mergeInto` in `store.js`).
- **Sync across devices.** Off until you turn it on, under You → Settings. It
  gives you a 20-character code (Crockford base32, 100 random bits) to type on
  another device, such as a work computer you can't copy files to. There's no
  account and no email. The app is still served from GitHub Pages; the progress
  goes to one row of a Supabase table, which the browser calls directly
  (`js/sync.js`, with the project URL and publishable key at the top). The
  database side is [`supabase/sync.sql`](supabase/sync.sql). The table has row
  level security and no policies, so the app can only call three functions:
  load, save and delete, each by code. Only the code's SHA-256 is stored.
  Saves are capped at 200 KB and the table at 2,000 copies.
  - *Local first.* The app never waits on the network. It sends changes six
    seconds after they stop, and when you leave the app. It looks for
    changes when it opens, when you come back to it, and as you move between
    screens (at most once a minute).
  - *No device wipes another.* Each save names the version it built on. If
    another device saved in between, the save is refused, and this one loads
    that copy, merges it with the same `mergeInto` as backups and tries
    again. Points earned on both sides is added up from the last point they
    agreed on. A device with no changes just takes the newer copy as it is.
  - *Not shared:* code drafts, project output (its charts are big) and this
    browser's downloads. Changes that arrive mid-lesson or mid-question wait
    until you leave that screen. Start over stops syncing first, so it never
    sends the empty progress to the other devices.
  - *The free tier* pauses a project after a week with no requests. Restore it
    from the Supabase dashboard.
- **Your own data.** Sandbox → Load a CSV of your own reads a file into the
  shared workspace as a DataFrame named after the file, so it's a table in
  Python, SQL and DAX alike. The delimiter is detected, and ISO-looking date
  columns become dates. It lasts until the app closes, and the file never
  leaves the device.
- **Matrices.** DAX results come back as data (`result.blocks`) as well as
  text, and are drawn as real tables: numbers on the right, BLANK as an empty
  cell, and the total row set apart. In the Sandbox, *Matrix rows* picks what
  the measures are split by. Excel results use the same channel, drawn as the
  sheet itself (`sheetGrid` in `ui.js`): a formula bar, column letters, row
  numbers, and the cells the formula filled tinted.
- **Take it with you.** Python and SQL lessons, and the Sandbox, download the
  code in the editor as a Jupyter notebook or a `.py` script (`js/export.js`).
  The first cell is the same `PRELUDE` the app runs, so the datasets come back
  value for value in Jupyter, VS Code or Colab. SQL gets a `run_sql()` helper
  that loads every DataFrame into SQLite. DAX has no export, because its engine
  only exists here.
- **Interview set.** Practice → Interview set: three problems, medium or
  harder, and a 20-minute clock that keeps running if you leave
  (`store.interview`, the `interview` route). Which three depends on the job
  picked first: Data analyst (SQL, Excel, Python), BI analyst (SQL, DAX,
  Excel), Data scientist (SQL, Python, R) or Mixed (SQL, Python, DAX), kept
  per device. Problems in the set show
  the time left, and the end shows solve times.
- **Project write-ups.** Finish a project and its track page offers a
  standalone HTML page for a portfolio (`js/writeup.js`): the finding, then
  each step's own code (the learner's saved draft, never the model answer),
  what it printed and its chart (`store.work`, saved when a project step passes).
- **Charts beside matrices.** In the Sandbox, a DAX matrix gets bars for its
  first measure underneath.
- **Syntax colouring.** `js/highlight.js` keeps the textarea as the real input
  (caret, selection, undo and phone keyboards stay native), makes its text
  transparent, and draws a coloured copy in a `<pre>` exactly underneath.
  Anything that sets `editor.value` recolours too, because that element's
  setter is patched.

## Intellisense

Every editor — lessons, practice and the sandbox — suggests as you type:
`cafe.` lists cafe's methods *and its columns*, `cafe["ci` offers `city`,
`sns.histplot(data=cafe, x="` offers cafe's columns, and inside a call the
signature sits above the line with the argument you're on underlined.

| Key | Does |
| --- | --- |
| ↑ / ↓ | move through the list |
| Enter or Tab | take the highlighted one (methods get their `()`, caret inside) |
| Esc | dismiss |
| Ctrl+Space | ask for suggestions anywhere |

On a phone, tap a suggestion. The keyboard stays up.

It is not Jedi. Suggestions come from the **live** Python namespace (`_complete`
in `js/worker.js`), which is why it knows your data's columns: after you run
code, the variables you made complete too. Nothing you type is executed to
work out a suggestion — expressions are resolved by walking names, attributes
and literal subscripts, a filter like `cafe[cafe.cups > 40]` is assumed to keep
cafe's shape, and only lazy calls (`groupby`, `rolling`, `resample`...) with
literal arguments are really made. A line like `busy = cafe[...]` above the
caret is enough for `busy.` to complete before you've run anything.

In practice problems, the function's arguments complete as the example input,
so `df.` inside `def solution(df):` lists that problem's real columns.

SQL gets the same treatment: after `FROM` or `JOIN` it offers the tables;
elsewhere the columns of the tables the query reads (it looks past the caret,
since `SELECT` is typed before the `FROM` that names the table), including
aliases (`c.` lists cafe's columns after `FROM cafe c`) and `WITH` steps.
Inside `WHERE city = '` it offers the values that column really holds.
Keywords come back in whichever case you're typing, and `ROUND(` shows its
arguments.

Excel formulas complete Excel's function names, each with its arguments and a
line on what it does, and the sheet names (`cit` offers `cities!`). Inside a
call, the argument you're on is underlined, as in Excel's own tooltip.

## SQL

SQL runs in SQLite — Python's own `sqlite3`, which Pyodide fetches (small)
the first time an SQL lesson or problem runs. There's no separate database
to maintain: on each run the worker builds one from the namespace, turning
every DataFrame into a table of the same name. So the SQL track queries the
very `cafe` the pandas lessons use. Dates are stored as ISO text
(`'2024-01-31'`), which is what SQLite's date functions expect.

The **Sandbox** has a Python | SQL | Excel | DAX switch. All four modes share
one workspace, so a DataFrame you make in Python mode is a table in SQL mode
(reassign it and the table is replaced) and a sheet in Excel mode, tables you
`CREATE` in SQL stay put between runs, and DAX measures stay defined for the
next DAX run. Each mode keeps its own draft and its own recipes.

Excel mode has a *Sheet* picker and a *Fill down* switch above Run, the way DAX
has *Matrix rows*; they reach the engine as the run's `rows` (JSON), which the
worker puts in `_XL`. With no `cell` there, the formula goes in the first
empty column, row 2. Lines like `J2: =AVERAGE(D2:D121)` put other cells
anywhere; with no plain formula line, the first of those that's a formula is
the one in the formula bar. A CSV loaded in any mode joins the sheet list.

An SQL lesson's editor holds SQL (`lang: 'sql'` on the track, overridable per
lesson). Its check calls `_same_as(reference_sql)`: the learner's last
result must match the reference's, rows in any order unless you pass
`ordered=True`. The failures are worded as the next thing to try — wrong
columns ("AS names a column"), wrong row count, right rows in the wrong
order. SQLite's own errors get a second line too: *Did you mean revenue?*,
*text values go in single quotes*, *filter groups with HAVING*.

## DAX

The DAX track runs on a small DAX engine written for this app,
`js/dax.py`, which the worker fetches the first time anything DAX runs. It
is **not** Microsoft's engine, and it does not try to be all of DAX. It
covers what a learner meets first:

- measures, filter context and row context, and context transition
- `CALCULATE` with `ALL`, `ALLEXCEPT` and `KEEPFILTERS`
- the `X` iterators, `RELATED` and `RANKX`
- time intelligence on a calendar table treated as Power BI's "marked" date table

A whole table used as a `CALCULATE` filter, like
`CALCULATE(DISTINCTCOUNT(orders[customer_id]), order_items)`, brings its lookup
tables along, as Power BI's expanded tables do. It stops at a blank key, which
in Power BI belongs to the lookup's blank row. Calculated columns
(`Table[Column] = ...` at the left edge) are worked out row by row before any
measure, and checked in lessons with `_dax_expect_column(table, column, reference)`.

Every lesson's answer was checked against the same numbers worked out
separately in pandas.

The model is the shop plus `cafe`, with a generated `calendar`. The links run
order_items → orders → customers → cities, order_items → products, and
orders / cafe → calendar. Relationships are many-to-one and filter one way,
from the lookup side to the data side, as in a default Power BI model. So,
just as in Power BI, `COUNTROWS(orders)` stays the same on every row of a
matrix by product category.

A lesson's editor holds measure definitions such as `Total Sales = ...`,
each starting at the left edge. Indented lines continue the measure above.
The lesson's `rows:` sets the column its matrix is split by. Checks call
`_dax_expect(measure, reference, helpers={...}, uses=[...])`, and the measure
must match the reference both overall and in every row. The reference only
uses its own helper measures, never the learner's, so a wrong `[Sales]`
can't hide a wrong answer.

DAX practice problems (`js/practice/more-dax.js`) name a `measure`, a
`reference` expression with optional `helpers`, and `layouts`: the matrices
it is tested in, such as `[]` for the total, `['products[category]']`, or two
columns crossed. The hidden tests are those layouts. Every cell and total of
each one must match. **Run** tries only the first layout. In a cell, BLANK
and 0 count as the same, as `BLANK() = 0` does in DAX. The learner's script
is not run on its own there (`_DAX_EXEC = False`); `_judge_dax` evaluates
it layout by layout.

Excel practice problems (`js/practice/excel.js`) give an `xl` (the open sheet,
the cell, and `fill`) and a `reference` formula. The formula runs when the
cell does, so Run shows the sheet as a lesson would. `_judge_excel` then works
out the learner's formula and the reference on the same changed copies of
the data: the open sheet as it is, its rows in another order, and a fresh
draw of its rows (whole rows, so revenue still equals cups times price), plus
an optional `edge` (Python that changes `book`, like a Lagos day of exactly
30 cups). A typed-in number, or a formula that only fits this data, fails.
Every cell it fills, or spills into, must match.

## Excel

**The sheet comes first.** Excel is visual, so before anything is typed, an
Excel lesson (inside "Your turn"), an Excel practice problem (its Example,
with each sheet's fold open) and the Sandbox's Excel mode (under the Sheet
picker, above the editor, where it stays through every run) show the sheet
as Excel would. Its name sits on a tab, letters run across and row
numbers down (pinned while a wide sheet scrolls), the headings are in row 1,
and the first rows of data follow. The cell the formula goes in is outlined,
with its column tinted when it fills down, and the formula bar reads "your
formula goes here". Any other sheet the answer reads (`cities!`, `orders!`)
follows. A problem's Example also shows the answer as cells. On a phone the
sheet is wider than the screen, so each preview scrolls just far enough to
show the outlined cell. They come from `_excel_peek` and `_preview_excel` in
`js/excel.py`, drawn by `ui.sheetPreview`.

**No counting rows.** Under each sheet's tab it says how many rows of data
there are and where they run ("120 rows of data, in rows 2 to 121"), then
each column's whole range with its heading (`D2:D121 cups`), so a range is
read off, never counted. The editor bar says it again ("data in rows 2 to
121"; in the Sandbox, with the sheet's name). It is safe to promise: a
problem's hidden tests shuffle and redraw rows but keep every sheet's length.
Each range is a button: a tap puts it in the formula at the caret (another
sheet's with its name, `orders!B2:B151`). With a mouse the editor takes the
focus; on a phone it doesn't, so the keyboard stays down between taps, and a
note says where it went if the editor is off the screen. After a run, a range
that starts at the top of a sheet's data but stops short of the end (F2:F100
when the data runs to 121) is pointed out under the result, not marked wrong:
it may be on purpose, but it's usually a miscount. In a filled-down formula
only a range with fixed rows ($F$2:$F$100) counts, since relative ones move
(`_short_range` in `js/excel.py`).

**Step through it.** Under a formula's result, a fold works it out the way
Excel's Evaluate Formula does: from the inside, one piece at a time, each
piece swapped for what it gives (a range for its first few values, like
`{192.23,120.64,287.28,…}`), until one value is left, with a sentence for
each step ("F2:F121 holds 120 values: 192.23, 120.64, 287.28 and 117 more").
An IF only goes into the side its test picks, and IFERROR into its fallback
only when it's needed. LET and LAMBDA count as one step, since their names
mean nothing outside them. For a filled or spilled formula it's the first
cell's. `_steps` in `js/excel.py`, which notes where each piece sits with a
parser that keeps positions (`_SpanParser`); drawn by `formulaSteps` in
`js/ui.js`.

The Excel track runs on a formula engine written for this app, `js/excel.py`,
loaded the same way as the DAX one: fetched the first time anything Excel
runs, into a namespace of its own. It is **not** Excel, but it follows Excel's
rules where a learner would notice:

- the sheets are the datasets: `cafe`'s columns are A to G, its headings in
  row 1 and its data from row 2, and `cities!A:C` reads another sheet
- `$` locks, so a formula filled down moves its relative references row by row
- Excel's precedence (`=-2^2` is 4), rounding (`ROUND(2.5,0)` is 3, halves away
  from zero), dates as day numbers (a date joined into text shows 45292), text
  comparisons that ignore case, and an empty cell read as 0
- error values (`#N/A`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#SPILL!`...) that travel
  through every calculation until `IFERROR` catches them, each explained under
  the result (`#NAME?` names the word it didn't know and suggests the function
  you probably meant)
- criteria like `">=40"`, `"lat*"` and `">="&J1`; `SUMIFS`, `COUNTIFS`,
  `AVERAGEIFS`, `MAXIFS`; `VLOOKUP` (including the wrong rows an approximate
  match gives on unsorted data), `XLOOKUP`, `INDEX`/`MATCH`; text, `TEXT`
  formats and date functions; and dynamic arrays that spill (`FILTER`, `UNIQUE`,
  `SORT`, `SEQUENCE`)
- formulas Excel would refuse to take at all (a missing bracket, semicolons,
  too few arguments, a second `=` line) are refused here too, in words

About 140 function names in all, counting pairs like RANK and RANK.EQ. A lesson's `xl` names the sheet and the cell, and
whether the formula is filled down to the last row of data: `xl: { sheet:
'cafe', cell: 'H2', fill: true, label: 'takings' }`. The editor holds one
formula; other cells can be filled from lines like `J1: 40` above it. Checks
call `_excel_expect(reference, uses=[...])`: every cell the learner's formula
filled must match what the reference gives in the same place. `uses` names
functions the formula must call, `"$"` for a locked reference, or a cell it
must read. `tests.html` runs the engine's own self-test too (`xl-engine`),
about 130 formulas against Excel's known answers, with the sums checked
against pandas.

## R

**R for data analysis** asks the pandas course's questions again, in R, on
the same tables: base R for the first look (`head`, `dim`, `$`, `summary`),
then dplyr (`filter`, `mutate`, `group_by`/`summarise`, `arrange`,
`slice_max`, joins), with `tapply` and `addmargins` for pivots, `cut` for
bands, factors for weekday order and `strsplit` for lists in a cell. 35
lessons in the pandas course's 7 parts, its own Taste test, last in Go
further. Its ink is a slate blue (`--t-r`).

It runs in **webR** (R compiled to WebAssembly, as Pyodide is Python), pinned
at `v0.6.0` in `js/r.js`. Nothing loads until an R lesson opens: then R
(about 12 MB) is fetched, dplyr and jsonlite are installed from
repo.r-wasm.org, and the shared tables come over from the Python side as CSV
(`_export_frames` in `worker.js`, `python.exportFrames`), with each
column's kind, so R's `cafe` is the very cafe pandas has: dates as Dates,
missing values as `NA`, all as tibbles. The Run button says how far it's got
("Installing dplyr…"). The service worker keeps R and its packages forever,
like Pyodide, so after the first time it works offline.

GitHub Pages can't send the headers webR's fastest channel needs, so it talks
over postMessage. A run can't be interrupted that way, so one that overruns
the time limit closes R, and the next run starts it again. `python.run` with
`lang: 'r'` goes to `rEngine.run`, so the lesson screen and `tests.html`
treat R like any other language.

A run is `.qc_run`: the code is parsed and evaluated one top-level
expression at a time in a fresh environment, the way a console would. A value
left showing is printed, a data frame is drawn as a grid too (the same grids
pandas and SQL get, the first 10 rows), warnings and messages go into the
output, and code that ends by storing something shows what it stored.
Errors are said plainly: dplyr's "In argument… Caused by error" is cut to
the problem, with where it happened in brackets, and a parse error names its
line, each with a tip for the usual causes.

Checks are R, with `has("name")`, `expect(condition, "message")`,
`expect_table(got, want, ordered = FALSE)` (same columns in any case, same
rows, in order if asked; it says which of those is wrong), `out_has()`,
`.out`, `.last` and `fresh("cafe")` (a table as loaded, before the
learner's changes). There's no Intellisense in R; the snippet bar has `<-`,
`|>`, `$` and the dplyr verbs.

Before every run, `.qc_reset` puts the tables back as loaded, removes
anything code left in the global environment (`<<-`, `assign`) and restores
the options, so one run can't spoil the next; Python rebuilds its namespace
each run for the same reason. Lesson checks build their references from
`fresh()`, so a learner who overwrites `cafe` can't make a check agree.

**R practice.** 16 problems (6 easy, 6 medium, 4 hard) in
`js/practice/r.js`, under Practice's R tab: write `solution <- function(df)`,
judged like the Python ones. Each problem's `setup` is R defining `.ref`,
`.example` and `.cases` (lists of named arguments). It's evaluated in a
private environment (`.P`, parented on the global one, not the learner's), so
a learner's own function called `filter` can't change the reference, and
`.qc_judge` is bound in the check's environment so it can't be replaced.
Modes: `frame`, `frame_ordered`, `scalar` and `vector`. The report has the
same shape as Python's `_judge` (examples as folds, Your output as grids).

**R in the Sandbox.** The Sandbox's fifth mode. R is a separate engine, so
it has the datasets but not what the other modes make, and the note says so.
Its runs use a space that keeps its variables (`.qc_spaces`, named by the
run's key: `python.run` with `fresh: false` passes it), the way Python mode
is a notebook; a lesson's run still gets a new environment every time. Load
CSV puts the file into R's space too (`rEngine.load`, `.qc_load`: the
header line's commonest separator, ISO date text as dates), and R mode loads
any file from this visit it doesn't have yet, again after R restarts
(`rEngine.boots`). There's no "Take it with you" for R.

## PL-300 prep

For the Power BI Data Analyst exam (PL-300): Practice → PL-300 prep, or the
card with the Power BI tracks. It has 107 original exam-style questions across
the four areas the exam measures (Prepare the data, Model the data, Visualize
and analyze, Deploy and maintain), in the exam's kinds of question:

- **Choose one** and **choose two**.
- **Put in order**: tap the steps into numbered slots, first to last; tap a
  placed step to take it out. Some lists include a step that doesn't belong,
  as the real exam's do. Marked slot by slot: right place, wrong place, not a step.
- **Case studies**: a scenario (overview, existing environment, requirements)
  and five questions that only make sense with it. The scenario opens on the
  first question and stays one tap away. Five of them, each leaning on
  different skills:

  | Case | Covers |
  |---|---|
  | Kettle & Grind | Gateways, DirectQuery, unpivot, apps |
  | The online store | A second date, incremental refresh, deployment pipelines |
  | Harbour Roasters | Folder sources, date locales, parameters, dataflows |
  | Riverside Deli | Dynamic RLS, sensitivity labels, subscriptions, alerts |
  | Sunrise Bakery | Last year, year to date, share of region, growth |

None is taken from the real exam, which is under NDA; they're set in the app's
own shop and cafe. The screen says it isn't affiliated with Microsoft, and
points to the current skills outline on Microsoft Learn.

- **10-question practice**, mixed or by area. After each answer you get the
  explanation, and where a lesson practises the same idea, a "Try it hands-on"
  link to it. Questions you got wrong come first next time, then ones you
  haven't seen.
- **Case studies** from the overview, one scenario at a time.
- **Mock exam:** 35 questions (10 / 10 / 10 / 5 by area) then a whole case
  study, 40 in all, in 80 minutes, with no feedback until it's marked. Then a
  score by area and a review of every miss. The clock keeps running if you
  leave; a mock that runs out while you're away is marked when you come back.
- **By area** on the overview: the share right of what you've tried, per area.

Questions live in `js/exam/pl300.js` as `{ id, domain, topic, type: 'single' |
'multi' | 'order', stem, options, answer, why, lesson?, case? }`: a multi
question says "Choose two."; an order question lists its steps in `answer`,
first to last, and says "in order"; a question with `case` belongs to one of
`CASES` and only appears after its scenario. `tests.html` checks every
question's and case's shape (ids, answer indices, wording, lesson links, that
cases and their questions point at each other) on each run. State lives in
`store.exam`; the routes are `exam` (overview) and `quiz` (the set in progress).

## Practice problems

The **Practice** tab is LeetCode-style: no teaching and no starter code. You
write `def solution(...)`, and it's judged against **hidden** inputs,
including the edge cases the problem is really about — ties, missing values,
empty results, boundaries. **Run** tries your function on the visible example;
**Submit** runs the hidden tests and, on failure, shows exactly which case
broke: its input, the expected output, and what you returned.

208 original problems: 61 in Python (21 easy, 25 medium, 15 hard) and 62 in
SQL (21, 25, 16); 28 in DAX (9 easy, 11 medium, 8 hard); 19 in Excel
(7 easy, 8 medium, 4 hard); 19 in R (9, 6, 4); and 19 algorithm
problems in Python (5 easy, 8 medium, 6 hard: sets, sliding windows, stacks,
binary search, intervals, dynamic programming, breadth-first search,
topological sort, shortest paths). The harder twenty in `harder.js` go past
the first set: Pareto lists, filling quiet days, matching payments to
invoices, sessions and quartiles in SQL, running shares and next-month
retention in DAX.

**Data cleaning, across the languages.** The 17 questions in `cleaning.js`
(c01–c17, all tagged `cleaning`) take the messy survey and rota data of the
cleaning courses into every language: tidy city names, spend stored as text,
every kind of yes, rows sent twice, two date layouts and shifts that break
the rules. Practice keeps its subjects split by language, and a **Data
cleaning** button under the subjects (`TOPICS` in practice.js) finds every
question with the tag, in all of them at once. A question asked in more than
one language belongs to a family (`practice/families.js`), and its page links
to the others under its title (*Also in Python · R · Excel*); each version is
solved and scored on its own. tests.html checks every family is real
questions, each in one family, with no language twice.

Practice shows one subject at a time, picked from tabs at the top: Python,
SQL, Excel, DAX, or **Algorithms** (the `algorithms` tag, so not under Python). Within
a subject the problems fold by difficulty, closed until you open one, so it's
never a wall of problems. The subject and the open folds last until the app closes,
the first subject is the one you last practised, and *Pick one for me* picks
within it. The problems live in `js/practice/problems.js`,
`more-python.js`, `algorithms.js`, `more-sql.js`, `more-dax.js` and `excel.js`;
`problems.js` merges them and sorts Python, then SQL, then DAX, easy before
hard. Just 5 minutes picks an algorithms problem when your next lesson is on
the Algorithms track, and a data problem otherwise. A run that goes over 12
seconds — nearly always a loop that never ends — is stopped as *Time limit
exceeded*, and the Python worker restarts itself rather than hanging.

**Getting about.** A lesson and a practice question each open with a line of
links back up: *Courses › Excel › Lookups* goes to the course page opened at
that part (`track/<id>/<part>`, the part glowing for a moment), and
*Practice › Excel › Medium* to the list on that subject with that difficulty
open (`practice/<subject>/<level>`). Arrows by the number (*Lesson 3 of 20*,
*9 of 16*) and two links at the end go to the one before and the one after: a
course's lessons in order, or a subject's questions as the list shows them,
easy to hard. The number itself opens the whole list, the course part by
part or the subject by difficulty, scrolled to where you are, to jump to any
of them; it closes on a tap outside it or Escape. None of this shows in a
test-out, a Signature, a refill or an interview set, which have their own way
on. Anything typed in the last moment is saved before leaving. The pieces are
`crumbs`, `stepArrows`, `jumpMenu`, `pager` and `wireGetAbout` in `js/nav.js`.
A link up also clears any search left on Courses or Practice, so the place
it goes to isn't hidden behind old results.

**Find a lesson.** Courses opens with a search box. Every word typed has to
turn up in a lesson's title, its course, its three bullets or its task;
lessons with it in the title come first, then the rest in course order, each
showing where it says it when the title doesn't. Enter opens the best match,
Escape clears it, and the search lasts until the app closes, so coming back
from a lesson finds the results as they were. Under the lessons come the
practice questions that match, the first five, with the rest a tap away on
Practice, which has a search box of its own across every subject. A question
tagged with exactly what was typed (COUNTIF, window) comes first, and the
tags on a question are links to that search. It all lives in `js/search.js`.

Problems live in `js/practice/problems.js`. Each one gives Python for:

| Name | Purpose |
| --- | --- |
| `_ref(...)` | the reference answer. Its parameter names label a failing case (`orders =`, `menu =`) |
| `_example()` | the visible example, as a tuple of arguments. The description renders it from `_ref`, so it can't drift |
| `_cases()` | the hidden tests — a list of argument tuples. Put the trap in here |

`mode` sets how answers are compared: `frame` (columns and rows in any
order), `frame_ordered` (rows in order), `frame_strict` (column order too),
`scalar` or `list`. Setup runs in a private namespace, so a solution can't
simply call `_ref`.

**SQL problems** set `lang: 'sql'` and define `_ref_sql` (the reference
query) instead of `_ref`. `_example()` returns a dict of `{table name:
DataFrame}` and `_cases()` a list of them; the judge loads each case into its
own fresh SQLite database and runs both queries there. Column names are
compared without regard to case.

Two optional lists keep the tests honest:

- `alt` — other correct answers. The tests must **accept** them, which catches
  tests that only allow one way of writing it.
- `wrong` — tempting wrong answers (`>=` instead of `>`, an inner join that
  drops the quiet customers). The tests must **reject** them, which proves the
  hidden cases actually exercise the trap.

Check all of it from the console:

```js
const P = await import('/js/practice/problems.js');
const { python } = await import('/js/python.js');
const judge = (p, code) => python.run({ code, key: 'pt', lang: p.lang, prelude: P.preludeFor(p),
                                        needs: P.needsFor(p), check: P.judgeCode(p, true),
                                        timeoutMs: 20000 });
for (const p of P.PROBLEMS) {
  if (!(await judge(p, p.solution)).judge?.ok) console.error('solution fails:', p.id);
  if ((await judge(p, p.stub)).judge?.ok)      console.error('stub passes:', p.id);
  for (const a of p.alt || [])   if (!(await judge(p, a)).judge?.ok) console.error('alt rejected:', p.id);
  for (const w of p.wrong || []) if ((await judge(p, w)).judge?.ok)  console.error('wrong accepted:', p.id);
}
console.log('done');
```

## Adding your own lessons

Lessons are plain objects. Drop one into `js/curriculum/pandas.js` (or
`matplotlib.js` / `seaborn.js`) and it appears in the app immediately:

```js
{
  id: 'pd-14',                    // must be unique
  mins: 3,                        // drives points and the "shortest bite" button
  title: 'Renaming columns',
  concept: [                      // 2–3 lines. **bold** and `code` work.
    '`.rename(columns={...})` gives columns better names.',
  ],
  starter: 'cafe.rename(columns={"cups": "units"}).head()',
  task: 'Rename `revenue` to `sales`.',
  hint: 'Pass `{"revenue": "sales"}` to `columns=`.',
  solution: 'renamed = cafe.rename(columns={"revenue": "sales"})\nrenamed.head()',
  check: `assert "sales" in renamed.columns, "No sales column yet."`,
}
```

**Writing a `check`:** it's Python, run in the same namespace as the learner's
code right after it. Raise `AssertionError` with the message you want shown:

```python
assert "busy" in globals(), "Make a variable called busy."
```

Three extras are injected for you:

| Name | What it gives you |
| --- | --- |
| `_out` | everything the code printed, as a string |
| `_axes()` | list of every matplotlib `Axes` currently drawn |
| `_labels()` | all chart text (title, axis labels, legend), lowercased |

Write the message as the **next thing to try**, never as a verdict —
`"Some rows in busy have 45 cups or fewer."` beats `"Wrong."`

**Write for someone who has never coded.** Every track can be someone's
first, so:

- Explain a term the first time a track uses it, in everyday words:
  "a single column on its own is called a **Series**", "a `name=value`
  inside the brackets is a setting".
- Say what a thing does before how: "`groupby` answers per-city questions"
  before the syntax.
- Keep other tracks out of it: SQL and DAX lessons don't lean on pandas.
- In tasks, hints and check messages, say what to type. Avoid "argument",
  "boolean", "parse", "unpack", "aggregation", "chain the fixes".

### Check both directions

A lesson is only correct if the solution passes **and** the starter fails. A
practice problem is only correct if its solution and every `alt` pass, and its
stub and every `wrong` answer fail.

Open **`tests.html`** and press Run. It isn't linked from the app or cached
for offline. It checks all of them in one worker session, DAX first so a clash
between the languages' helpers shows up. Then it lists every failure and the
ten slowest checks. Filter by language or id prefix to check just what you
changed. The whole set takes about ten minutes.

---

## The curriculum

575 lessons across 24 tracks — 375 in Python (including an 80-lesson Python course, 35 of pandas, 20 of messy data, 35 of statistics, 15 each of NumPy, business metrics, forecasting and machine learning, 20 of AI, 40 of algorithms and 20 of ETL and pipelines), 60 in SQL (45 of SQL, 15 of SQL cleaning), 45 in DAX (35 on measures, 10 on Power BI modelling), 35 in Excel (20 of Excel, 15 of Excel cleaning), 35 in R, and 25 in four projects — plus 208 practice problems (61 in Python, 19 algorithm problems, 62 in SQL, 28 in DAX, 19 in Excel, 19 in R).

**Fuller lessons** (`curriculum/detail/`, one file per course, merged as each lesson's `detail`). Each lesson can have five or six plain-English points in place of its three bullets, a worked example of the idea (never the task's answer: a sentence, its code coloured like the editor, what it gives, and the code explained piece by piece) and its task laid out as a brief, the same shape as a practice question (`briefBlock` in ui.js). An Excel example can name its own cell and heading (`example.xl`), and a DAX example its own matrix rows (`example.rows`, for a column it makes itself), both run through `examplePrelude`, so an example never sits under the task's heading. An example's result is never typed in: expected.html runs it and builds it into `expected.js` as `EXAMPLES`, stamped by `exampleStamp`, and tests.html checks every one is there and current. Examples and briefs are hidden in a test-out or a Signature. The worked example sits in a closed fold so the task is close to the top. Every one of the 575 lessons has this.

**Less scrolling on a laptop.** On a laptop or bigger (the side-by-side lesson layout), the work side (editor, Run and the result) is sticky: it stays in view under the top bar while you scroll the lesson or question, and if the result is long it scrolls inside its own box, capped to the screen. main.js keeps `--chrome-top` and `--tabbar-h` set to the bars' real heights so the cap fits. Phones are unchanged.

**ETL and pipelines** (`curriculum/etl.js`) follows one nightly export from the cafe tills, made-up text that lives in the file, from raw text to a SQLite table: read it as sent, check the columns against a contract, clean it with every bad row set aside with a reason, load it so a rerun can't double it (delete then insert, then upserts and a watermark), reconcile the counts, then wrap it all in a pipeline that logs, retries, orders its steps with `graphlib` and runs its own quality checks. From part 2 on, a lesson's `setup` field carries the pipeline built so far: `lessonPrelude` runs it before the learner's code, and Take it with you adds it as its own cell, so the editor holds only the new step.

**Go deeper.** The SQL, pandas, DAX, Excel, R and ETL lessons, and the 80 of the Python course, have an optional fold under
their three bullets: why it works, the usual mistake, and where it turns up at
work. The lesson stays three bullets long; the depth is there for whoever
wants it. The text lives in `js/curriculum/deeper.js`, keyed by lesson id
(Excel's sits on each lesson, as `deeper`), and `tests.html` checks every
entry belongs to a real lesson and has all three parts. The topic order follows *Python for Data Analysis*
(Wes McKinney, 3rd ed.) as a syllabus — chapters 5–13 — but every lesson,
example and exercise here is original and written against the `cafe` dataset.

The AI track follows *Artificial Intelligence Programming with Python: From
Zero to Hero* (Perry Xiao, Wiley, 2022) the same way: chapters 3, 4, 5, 7 and
10 as a syllabus, every lesson original. The book's deep-learning frameworks
(TensorFlow and Keras, OpenCV, YOLO, face recognition, GANs, transformers)
can't run in the browser, so networks are built by hand in numpy, or with
scikit-learn's own `MLPClassifier`. "Take it with you" exports a lesson to
Colab for going further.

Later parts were planned from a shelf of Python books, again used only as
a syllabus, never as text. The Python course's newer parts follow *Think
Python* (3rd ed.), *Introducing Python* (3rd ed.), *Learning Python* (6th
ed.), *Professional Python* and *Job Ready Python*. Messy data's quality and
file parts follow *Practical Python: Data Wrangling and Data Quality*. AI's
"Better models" follows *Python for Data Science For Dummies* (3rd ed.), and
Algorithms' "Making it faster" follows *High Performance Python* (3rd ed.).
*Python Polars: The Definitive Guide* was looked at too, but polars doesn't
run in the browser's Python yet, so it has no track.

| Track | Lessons | Covers |
| --- | --- | --- |
| Python | 80 | the language itself, from nothing: `print` and maths, variables, text, True/False, lists, calling functions, methods, dicts, `if`, `for`; then ints and floats, slicing, f-strings, `split`/`join`; `range`, `while`, `break`/`continue`, nested loops, `enumerate`/`zip`; changing lists, copies versus the same list, tuples, comprehensions; dicts in depth, records, sets, nested data; writing functions, `*args`, scope, lambdas, docstrings and type hints; reading errors, `try`/`except`, `raise`, files; `csv`, `json`, `datetime`, the standard library, a small program; classes, methods, `__repr__`, inheritance, dataclasses; `iter`/`next`, generators, `any`/`all`, decorators, `*`/`**` unpacking; regular expressions (`findall`, classes, groups, `fullmatch`, `sub`). Woven in between: conditional expressions and truthiness, `match`, `Counter`, `defaultdict`, `namedtuple`; `__eq__`/`__lt__`, `__len__`/`__contains__`/`__iter__`, `__add__`, properties with setters, classmethods; your own exceptions and `else`, context managers with `contextlib`, tests that catch broken versions, `doctest`, `unittest`; and to finish, small programs: word counts, bigrams, a Markov chain that writes, a banded tax calculator, and ETL into SQLite. Its first 10 lessons are a primer (`track.primer`): once you've done lessons elsewhere, Home skips those, but not the rest |
| pandas | 35 | DataFrames, Series, filtering, groupby, `loc`/`iloc`, `.str`, `apply`/`map`, binning, missing data, `read_csv`, `query`, method chains with `assign`, `np.where`, `cumsum`/`rank`, shares with `value_counts(normalize=True)`; then the top N per group, `groupby().filter`, `cumcount`, days between a customer's orders, a MultiIndex with `.xs`, pivot totals with `margins`, weekdays in order with `Categorical`, `explode`, rank within a group, and a cohort grid |
| Excel cleaning | 15 | the survey export as a sheet: stray spaces with `TRIM`, capitals with `PROPER`, wildcard counts, disguised blanks, copies marked with `COUNTIF`, text into numbers (`SUBSTITUTE`, `VALUE`, `IFERROR`), yes/y/YES, two date layouts rebuilt with `DATE`, a number from text with `TEXTBEFORE`/`TEXTAFTER`, `UNIQUE`; then rules with `IFS`, totals checked against another sheet, outliers against their own city, a health count, and counting while cleaning |
| SQL cleaning | 15 | the same survey as a table: quoted column names, spellings with GROUP BY, `TRIM` and a home-made title case, `NULLIF` for stand-ins, duplicate rows with HAVING, `CAST` and the n/a-becomes-0 trap, CASE for yes/no, day-first dates rebuilt, `INSTR`/`SUBSTR`, `DISTINCT`; then rules, totals that don't add up, outliers with a window, a one-row health check, and one clean view |
| messy data | 20 | unfamiliar tables, bad column names, text that only looks the same, numbers stored as text, mixed date formats, yes/y/YES, duplicates, regex extraction, "missing" spelled as text, a full clean from start to finish; then data quality: rules every row should follow, totals that don't add up, IQR outliers, near-miss spellings with `difflib`, a health report function; and files that fight back: fixed width with `read_fwf`, spreadsheet day counts as dates, junk lines and thousands commas in `read_csv`, nested JSON with `json_normalize`, and whether the data covers the dates you need |
| wrangling | 15 | `merge` and join types, `concat`, duplicates, `melt`, `stack`/`unstack`, `transform`, `crosstab`, melt → merge → groupby on wide data; then the shop in pandas — many-to-one merges with `validate`, three-table totals, `indicator=True` anti-joins, a category × month pivot |
| time series | 10 | datetime index, `resample`, `rolling`, `shift`/`pct_change`, `.dt` features, `ewm`, a full year of weather, counting the empty days |
| matplotlib | 15 | figure/axes, bar, scatter, hist, legends, subplots, annotation, `.plot()`, styling, `twinx`, sorted horizontal bars, stacked bars, error bars |
| seaborn | 15 | themes, `hue`, categorical plots, heatmaps, facets, `pairplot`, `regplot`, violins, KDE, strip-over-box, `catplot` panels, `jointplot` |
| analysis | 10 | the capstone — framing, profiling, outliers, correlation, `polyfit`, statsmodels OLS, scikit-learn, the final chart, and whether the winner wins every month |
| SQL | 45 | `SELECT`/`WHERE`, `NULL`, `ORDER BY`, aggregates, `GROUP BY`/`HAVING`, `CASE`, dates, joins and `LEFT JOIN`, subqueries, `WITH`; then the four-table shop — multi-table joins, `COUNT(DISTINCT)`, anti-joins, `EXISTS`, `UNION`, conditional counts, date gaps, `CREATE TABLE AS`; window functions (`RANK`, running totals, `LAG`, share of total), and `pd.read_sql` back into pandas; then `INSERT`, `UPDATE`, `DELETE`, text functions and `ROW_NUMBER` for the latest row per group; then several WITH steps, a self-join for products bought together, a moving average with `ROWS BETWEEN`, `NTILE` quartiles, `EXCEPT`/`INTERSECT`, safe division with `NULLIF`, every day with `WITH RECURSIVE`, cohorts and retention, and a median without MEDIAN |
| DAX | 35 | measures, `SUMX` and `RELATED`, one-way filter flow, `CALCULATE`, `KEEPFILTERS`, `ALL` for shares, `FILTER` and context transition, `AVERAGEX`, `VAR`/`RETURN`, `RANKX`, `TOTALYTD`, `DATEADD` growth; BLANK and `COALESCE`, `SWITCH(TRUE())`, `SELECTEDVALUE`, `HASONEVALUE` totals, `CONCATENATEX`; `MAXX` and context transition, `VALUES` as a filter, `TOPN` in `CALCULATE`, rolling `DATESINPERIOD`, two fact tables on one lookup; then the average and best month with `AVERAGEX`/`MAXX` over months, busy days, naming the best seller with `TOPN` and `CONCATENATEX`, customers who never ordered, a fixed window with `DATESBETWEEN`, a rank hidden on the total with `ISFILTERED`, a running share and ABC classes, and returning customers with `PREVIOUSMONTH` |
| Excel | 20 | formulas on a real sheet (see Excel, above): cell addresses and `=`, `SUM`, `AVERAGE`/`MIN`/`MAX`, counting blanks, `ROUND`; `$` for a running total and a share of the total, `IF`, `IFS`, `AND`; `COUNTIF`, `SUMIF`, `SUMIFS`, criteria like `">="&J1` from a cell, `AVERAGEIFS` over a month of dates; `VLOOKUP` and why it ends in `FALSE`, `XLOOKUP` across sheets, `INDEX`/`MATCH`, labels with `&` and `TEXT`, and `FILTER` spilling a list |
| Business metrics | 15 | a metric defined before it's counted, the funnel and where visitors drop out, conversion by channel, value per visit; active customers, churn, survival and lifetime value on a subscription; a metric tree; then an A/B test read properly: the split checked first, lift with an interval, a ship-or-wait decision, guardrails, and whether it holds in every segment |
| Forecasting | 15 | daily contact-centre calls: holding back the future, naive and seasonal-naive baselines, percentage error, moving averages, the weekly shape, trend, decomposition, autocorrelation, a regression you can explain, exponential smoothing and Holt-Winters, when fancier loses, testing over several months, and a range instead of a point |
| Machine learning at work | 15 | the job-ready workflow on churn and delivery times: beating the lazy guess, one-hot columns, a pipeline with no leaks, why accuracy hides the misses, choosing a threshold, ROC AUC, rare leavers, cross-validation, a leak that looks like genius, what the model relied on; then predicting numbers with RMSE, Lasso and boosted trees, tuned on training and tested once |
| NumPy | 15 | arrays and why they do maths on every value at once, from a column to an array, ranges and evenly spaced steps, quartiles, two dimensions and `axis`, folding days into weeks, broadcasting, joining arrays, `select` for several choices, `argmax`, repeatable random numbers, replacing loops, and weighted totals with the dot product |
| statistics | 35 | mean vs median on skewed order values, standard deviation and IQR (and checking the 68% rule), sampling variation and the standard error, 95% intervals by formula and by bootstrap, an interval for a difference, Welch's t-test with scipy, a two-proportion A/B test by hand, Bonferroni for many comparisons, Cohen's d; then chance by simulation and the law of large numbers, conditional probability from a two-way table, z-scores, the normal curve (`norm.cdf`/`ppf`), the binomial and the Poisson checked against simulations; the central limit theorem drawn, an interval for a share, sample sizes for a margin of error, expected value; correlation, Spearman against one wild point, `linregress` and r², residuals that show a curve, a lurking variable held steady in temperature bands; chi-square for a table and for an even spread, a paired t-test, one-way ANOVA, Mann-Whitney on lopsided baskets; and by simulation, a permutation test, false alarms in A/A tests, power, what peeking does, and regression to the mean |
| AI with Python | 20 | learning from examples (k-nearest neighbours, train/test, accuracy), a decision tree drawn with `plot_tree`, scaling features in a pipeline, a confusion matrix, five models compared with `cross_val_score`; one neuron and the sigmoid, a perceptron learning AND, gradient descent and the learning rate, an `MLPClassifier` reading handwritten digits, a convolution filter finding edges; k-means, PCA, bag of words with stop words, Naive Bayes sentiment on café reviews, Q-learning for a robot waiter; then better models: overfitting seen as train vs test by depth, `predict_proba` and acting only when sure, a random forest against one tree, feature importances, `GridSearchCV` |
| Algorithms | 40 | writing your own functions (`def`, `return`, defaults, `while`, edge cases and `assert`); counting steps, best/worst/average case, how work grows, Big-O, list vs set timed for real; guess-the-number, binary search, lower bound, `bisect`, binary search on the answer; selection and insertion sort, merging, `sorted` with a key, the top k with `heapq`; counting with dicts, two-sum, grouping, stacks, queues with `deque`; recursion, nested data, merge sort, memoisation, backtracking with pruning; adjacency lists, BFS, Dijkstra, greedy change, and dynamic programming when greedy fails; and making it faster: profiling with `cProfile`, hoisting work out of loops, lazy generator pipelines, numpy vectorising timed with `timeit`, and smaller tables with categories and `int8`. Plain Python (numpy and pandas in the last part), checked by calling your functions on cases that include the awkward ones |
| Power BI modelling | 10 | calculated columns vs measures, `RELATED` in a column, a date-table column, filtering through a fact table (expanded tables), a measure inside a column; segments, new customers per month, a running total, days since last order, value per segment |
| Projects | 25 | "Who should we win back?" (ten steps, one part, so its write-up covers it all: `partSizes` in `index.js`) — define lapsed from the data, check the list in SQL, what they spent and bought, which cohorts drift, one chart with the cut-off, a live DAX measure, who to contact first, what it could be worth a month, and the case in words; "Where should the shop grow next?" — build the city numbers in pandas, check them in SQL, make them measures in DAX, chart spend per customer with the counts it rests on, then make the call with a rule anyone can check; "Does the weather move the cafe?" — join by day, compare rainy and warm days, daily vs weekly correlation, a chart at its honest size, and a rule that says no; "From messy survey to a one-page summary" — clean it once, summarise by city, flag thin figures, one chart, a paragraph built from the numbers |

### Speed

Measured, then fixed where the time actually went (2026-10-14, build 112):

- **Python is ready a second sooner.** Of the four seconds to Ready (with
  everything cached), the imports were most of it: pandas 1.1 s, pyplot 0.5,
  matplotlib 0.3, seaborn 0.25, plus installing seaborn. Now pandas, matplotlib
  and micropip are fetched in one call, pandas is imported, and Ready goes out
  (about 3 s); then `loadExtras` brings in pyplot and seaborn in the
  background. `_charts()` sets AGG and imports pyplot the first time anything
  needs a namespace or a figure, so nothing can reach pyplot first, and a run
  that uses seaborn before it's installed waits for it (the `'run'` handler).
  The Sandbox's workspace, made before seaborn arrived, gets the real `sns`.
- **SQL runs in a third of the time** (120 ms to 35): `_sql_wanted` copies
  in only the tables a query names, or all of them for `sqlite_master` or
  `PRAGMA`, instead of all sixteen datasets, twice (the check builds its own).
- **DAX**: `RELATED` looks its row up in a key index (`_key_index`) instead
  of comparing the whole lookup column for every row; cells come from a
  per-column list (`_col_values`) instead of pandas' `.at`; relationship
  paths are remembered; the calendar's dates and months are worked out once
  (`_model_dates`); and contexts with the same filters share their masks and
  the values aggregations read, so `MAX(calendar[date])` inside a FILTER is
  worked out once, not once a row. All caches are on the model or the context
  and rebuilt if a table is replaced. A typical measure went from 146 ms to 70;
  a running total from a second to under 150 ms.
- **Saving**: `save()` batches into one write per moment (a microtask): a
  finished lesson wrote the whole state seven times. Project output (charts,
  up to megabytes) has its own key (`databites.work`), written only when a
  project step passes, so everyday saves stay small.
- **Opening the app**: the splash stays up until 400 ms after the page started
  opening, not 550 ms after the code had loaded, so a phone that took a second
  to load no longer waits another half second.
- **R**: the tables are fetched from Python while webR starts, and opening the
  R course's page starts loading R.

Left alone on purpose: screens draw in under 30 ms, a pandas run is about
25 ms, Excel 25, R 30; the two heaviest DAX lessons (dx-34, dx-35) still take
under a second, because SUMX really is iterating every order line many times.

### Lazy-loaded packages

scipy, statsmodels and scikit-learn are **not** in the boot download — they
would roughly double it. A lesson declares what it needs:

```js
{ id: 'an-08', needs: ['scikit-learn'], … }
```

The worker fetches those on that lesson's first run (a few seconds), the lesson
card warns about it up front, and the Run button reports progress. After that
the service worker has them cached. Most of the AI track needs scikit-learn;
its numpy lessons (a neuron, gradient descent, filters, Q-learning) don't
wait for it. scikit-learn brings its classic datasets with it: iris flowers,
wines and handwritten digits.

A download that fails is checked for, not assumed: Pyodide's `loadPackage`
logs a failure instead of throwing, so the worker confirms the package really
arrived, says so if it didn't, and tries again on the next run. A timed run
downloads before its clock starts (scipy alone can take 40 seconds on a slow
line), and if that download fails, the run stops there with "A download
failed / Nothing wrong with your code" instead of retrying inside the time
limit, where a slow second try used to read as "a loop that never ends". It
doesn't count as a failed attempt at the lesson.

## The dataset

Every lesson uses the same 120 rows, generated in `js/curriculum/prelude.js`:

```
date     datetime   one row per day, Jan–Apr 2024
city     text       Lagos, Nairobi or Accra
drink    text       latte, espresso, cold brew, tea
cups     int        cups sold that day
price    float      price per cup
revenue  float      cups × price
rating   float      customer rating — has 9 missing values
```

A second table, `cities`, holds city / country / population. **Kigali** appears
in it but never in `cafe` — that deliberate gap is what makes inner vs outer
joins visible in the wrangling track.

**The shop** is four linked tables for the SQL track — the café's online
store: `customers` (40, two with no city, six who never ordered), `orders`
(150, January to June 2024, delivered / shipped / cancelled), `order_items`
(what was in each order) and `products` (12, one of which — the tote bag —
has never sold). It has its own random generator and comes after everything
else in the prelude, so it can't shift a single value in `cafe`.

**`reviews`** is 40 short café reviews, written by hand and marked `happy` or
`unhappy`, for the AI track's text lessons (bag of words, sentiment).

**Work-shaped tables** come last, with their own seeded generator, for the
tracks that copy real jobs: `ab_test` (4,000 users in a checkout experiment),
`sessions` (3,000 shop visits and how far each got), `subs` (a coffee
subscription, one row per customer per month paid), `calls` (two years of
daily contact-centre calls, with a weekly and a yearly shape), `churn` (800
customers and whether they left) and `deliveries` (600 deliveries and how long
each took). The signals in them were tuned so the methods the lessons teach
really find them.

Lessons get a **fresh** copy on every run, so a mistake can never poison the
next attempt. The Sandbox is the opposite — state persists, like a notebook.

---

## Layout

```
index.html              app shell
sw.js                   offline caching
manifest.webmanifest    home-screen install
serve.ps1               local dev server (also takes expected.html's saves)
css/styles.css          the whole design system
fonts/                  Fraunces and IBM Plex, with their licences
js/
  main.js               hash router + boot
  python.js             main-thread handle on the worker
  worker.js             Pyodide + the Python execution/check runtime
  dax.py, excel.py      the DAX and Excel engines, loaded on first use
  r.js                  R, through webR, loaded when an R lesson opens
  store.js              progress, points, streak, spare days (localStorage)
  sync.js               sync across devices, by code (Supabase)
  game.js               specials, first-try runs, ranks, achievements, bosses
  ui.js                 DOM helpers: output, sheets and grids, toasts, confetti
  nav.js                getting about a lesson or question: links up, arrows, the list, the pager
  search.js             finding lessons and practice questions (Courses, Practice)
  stamps.js             the rubber stamps: one per lesson, one per achievement
  display.js            colours, light or dark, text size, layout (per device)
  screens/              welcome, home, tracks (Courses), lesson, practice, sandbox, you
  guide.js              first-time guides, tips and What's new
  cafe.js, sound.js     the drawn cafe things, and the optional sounds
  curriculum/           prelude + one file per track, and deeper.js (Go deeper)
  practice/             the practice questions, one file per batch; problems.js merges them
  exam/                 PL-300 prep: its questions and case studies
tests.html              the self-test: every lesson and question, plus checks (see below)
expected.html           writes js/curriculum/expected.js, every lesson's built-in Expected output
supabase/sync.sql       the sync table and its three functions
```

**Upgrading Python:** `PYODIDE_VERSIONS` at the top of `js/worker.js` is a
fallback list — the first version that exists on the CDN wins. Add a newer one
to the front to upgrade.

## Picking this up

For whoever works on this next, person or agent. Each file opens with a
comment saying what it's for; this is what isn't in any one file.

- **No build step.** The app is plain ES modules, CSS and two Python files
  (`js/dax.py`, `js/excel.py`), served as they are. Pyodide, webR and the
  Python packages come from their CDNs at run time. Locally, `serve.ps1`
  serves the folder on port 8123. Nothing needs Node or Python installed.
- **Every deploy:** bump `VERSION` in `js/version.js` and the matching
  `databites-shell-vN` in `sw.js` together (tests.html fails if they
  differ), and add any new file to `APP_FILES` in `sw.js`, or it won't work
  offline. Pushing to `main` deploys (GitHub Pages).
- **Test before shipping:** open `tests.html` and press Run (about two
  minutes). It runs every lesson (solution passes, starter fails) and every
  practice question (solution and `alt`s pass, stub and `wrong`s fail), and
  checks Go deeper entries, sync merges, the learning path, PL-300 questions,
  the version, and the colour themes' CSS (every theme complete, both dark
  blocks the same, every pair clearing 4.5:1).
- **Python in strings.** `js/worker.js` holds its Python inside a
  `String.raw` template: never put a backtick in that Python. Lesson
  `check`s and practice `setup`s are Python in JavaScript strings, so a
  backslash there needs doubling. Edit files with regular expressions in them
  (excel.py, search.js, tests.html) with an editor, not a shell heredoc,
  which can eat backslashes.
- **Saved progress** is one object in localStorage (`databites.v1`, see
  `js/store.js`). A new field needs a default in `blank()` and a rule in
  `mergeInto()`, or sync across devices drops it. Per-device settings
  (display, the Sandbox's drafts) use keys of their own.
- **Refills** (`store.reviews`) count once, while due: `store.isDue`.
  `dueRefills` and `refillRoute` in `js/game.js` are the way in.
- **Words on screen** are for someone who has never coded: plain words
  first, café words only alongside them, no em dashes, and every lesson
  shows a result. Questions and explanations are written new, never copied
  from a book.
- **What's new** (`WHATS_NEW` in `js/guide.js`) gets a step only when a
  build changes what you can do or how the app works, never for looks; each
  step carries the build (`v`) it arrived in.
- **Colours** are tokens on `:root` in `css/styles.css`; the dark values
  are written twice (for a dark device, and for Dark picked by hand). Colour
  themes override them in `[data-palette]` blocks, three per theme; add a
  theme there and in `THEMES` (`js/display.js`), and tests.html checks the
  rest. Courses keep their own colours (`--t-*`) inside lessons.

---

## Licence and the small print

Copyright © 2026 Ibomeno Basiekanem. **All rights reserved.** The code,
lessons, problems, questions, datasets and design aren't licensed for reuse;
see [LICENSE](LICENSE). The source is public only so GitHub Pages can serve
the app.

QueryCafe is an independent learning app. It isn't affiliated with, endorsed
by or sponsored by Microsoft. Microsoft, Power BI and PL-300 are trademarks of
Microsoft. The DAX engine is written from scratch for teaching, and contains
no Microsoft code. The PL-300 practice questions were written for this app,
not taken from the real exam (its questions are under a non-disclosure
agreement; never add any remembered from sitting it). Every person, business,
review and number in the lessons is made up. The same notice is in the app,
under You → Settings → The small print.

The fonts (Fraunces, IBM Plex) are served from `fonts/`, not Google, so no
visitor's details go to a third party just to draw the type. They're under
the SIL Open Font License, whose text sits beside them. Pyodide and the
Python packages are fetched from the jsDelivr CDN when the app runs, under
their own licences.
