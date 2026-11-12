/* Build it from pieces: a lesson's answer cut up and shuffled, to tap into
   order (a Parsons problem). A help step between the nudge and the answer:
   the thinking that's left is what goes where, with no typing, which is what
   a phone makes hard. Nothing is marked here. The built code goes into the
   editor and Run checks it like anything typed, so any order that works
   passes.

   An answer of three lines or more is cut into its lines (long ones into
   blocks, so there are never more than ten pieces). A shorter one, which is
   every Excel formula and most DAX, is cut inside the lines the starter
   didn't already have: at brackets, commas and spaces, with anything in
   quotes kept whole. Lines the starter had stay where they are.

   piecesOf(lesson)  the puzzle, or null when the answer can't make one
   piecesFold()      the fold's HTML, for a lesson's help
   wirePieces(...)   makes it work; lesson.js passes what to do with the code */

import { escapeHTML } from './ui.js';

const MAX = 10;                 // pieces of a long answer
const MAX_BITS = 14;            // pieces of a short one, before it's cut more coarsely
const STR = String.raw`"(?:\\.|[^"\\])*"|'(?:''|\\.|[^'\\])*'`;
const FINE = new RegExp(`(?:${STR}|[^\\s(),])+\\(?|[(),]`, 'g');
const COARSE = new RegExp(`(?:${STR}|\\S)+`, 'g');

const isCode = (line) => line.trim() && !/^\s*(#|--|\/\/)/.test(line);
/* The answer's lines of code, without blank lines and comments. Text in
   triple quotes that runs over several lines stays whole with the line it
   starts on: a blank line in there is part of the text. */
function codeLines(code) {
  const out = [];
  let open = null;                  // the triple quote we're inside
  for (const raw of code.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (open) out[out.length - 1] += `\n${raw}`;
    else if (isCode(line)) out.push(line);
    else continue;
    for (const [quote] of raw.matchAll(/"""|'''/g)) open = open ? (quote === open ? null : open) : quote;
  }
  return out;
}

const stripStrings = (line) => line.replace(new RegExp(STR, 'g'), '""');

/* How two pieces of a line sit together: no space inside a bracket or before
   a comma, and none between a closing bracket and what hangs off it. */
function glue(a, b) {
  if (/[(\[]$/.test(a) || b === ')' || b === ',') return '';
  if (/[)\]]$/.test(a) && /^[\].\[:;]/.test(b)) return '';
  return ' ';
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/* The same shuffle every time for a lesson, and never the answer's own order. */
function shuffled(n, seed) {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  const next = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (n > 1 && order.every((v, i) => v === i)) order.push(order.shift());
  return order;
}

/* Whole lines: one piece each, or blocks when there are many. */
function linePieces(lines) {
  let pieces = lines.map((line) => line);
  if (pieces.length > 8) {
    // an indented line goes with the line it sits under
    pieces = [];
    for (const line of lines) {
      if (/^\s/.test(line) && pieces.length) pieces[pieces.length - 1] += `\n${line}`;
      else pieces.push(line);
    }
  }
  while (pieces.length > MAX) {
    // still too many: join the two shortest neighbours
    let at = 0;
    for (let i = 1; i < pieces.length - 1; i++) {
      if (pieces[i].length + pieces[i + 1].length < pieces[at].length + pieces[at + 1].length) at = i;
    }
    pieces.splice(at, 2, `${pieces[at]}\n${pieces[at + 1]}`);
  }
  return pieces;
}

export function piecesOf(lesson) {
  const lines = codeLines(lesson.solution);
  const seed = hash(lesson.id);
  if (lines.length >= 3) {
    const pieces = linePieces(lines);
    if (pieces.length < 3) return null;
    return {
      mode: 'lines', pieces: pieces.map((text) => ({ text })), order: shuffled(pieces.length, seed),
      build: (placed) => `${placed.map((i) => pieces[i]).join('\n')}\n`,
    };
  }

  // A short answer: cut up the lines the starter didn't have.
  const had = new Set(lesson.starter.split('\n').map((l) => l.trim()));
  const fresh = lines.map((line) => !had.has(line.trim()));
  if (!fresh.some(Boolean)) return null;
  // not text over several lines, or a comment after the code
  if (lines.some((line, i) => fresh[i] && (line.includes('\n') || /#|--/.test(stripStrings(line))))) return null;
  const cut = (re) => {
    const pieces = [];
    lines.forEach((line, i) => {
      if (!fresh[i]) return;
      const indent = line.match(/^\s*/)[0];
      (line.match(re) || []).forEach((text, k) => pieces.push({ text, line: i, first: k === 0, indent }));
    });
    return pieces;
  };
  let pieces = cut(FINE);
  if (pieces.length > MAX_BITS) pieces = cut(COARSE);
  if (pieces.length < 3 || pieces.length > MAX_BITS) return null;
  const firstFresh = fresh.indexOf(true);
  pieces.forEach((p) => { p.br = p.first && p.line !== firstFresh; });   // starts another line

  // The placed pieces, as lines; then each takes the place of a fresh line,
  // in order, among the lines the starter had.
  const build = (placed) => {
    const made = [];
    placed.forEach((i, k) => {
      const p = pieces[i];
      if (k === 0 || p.br) made.push(p.indent + p.text);
      else made[made.length - 1] += glue(pieces[placed[k - 1]].text, p.text) + p.text;
    });
    const out = [];
    lines.forEach((line, i) => { if (!fresh[i]) out.push(line); else if (made.length) out.push(made.shift()); });
    return `${[...out, ...made].join('\n')}\n`;
  };
  return {
    mode: 'bits', pieces, order: shuffled(pieces.length, seed), build,
    twoLines: pieces.some((p) => p.br),
  };
}

export function piecesFold() {
  return `<details class="reveal" id="pieces-box">
          <summary>Build it from pieces</summary>
          <div class="reveal-body">
            <p class="pieces-how" id="pieces-how"></p>
            <div class="pieces-built" id="pieces-built" role="group" aria-label="Your answer so far"></div>
            <div class="pieces-tray" id="pieces-tray" role="group" aria-label="Pieces still to place"></div>
            <div class="quick-row">
              <button class="btn btn-quiet btn-sm" id="use-pieces" disabled>Put it in the editor</button>
              <button class="btn-text" id="clear-pieces" hidden>Start again</button>
            </div>
          </div>
        </details>`;
}

/** Tap a piece to place it next; tap a placed one to take it back.
    `use(code)` is called with the built code once every piece is placed. */
export function wirePieces(box, lesson, use) {
  const puzzle = piecesOf(lesson);
  if (!box) return;
  if (!puzzle) { box.remove(); return; }
  const built = box.querySelector('#pieces-built');
  const tray = box.querySelector('#pieces-tray');
  const useButton = box.querySelector('#use-pieces');
  const clear = box.querySelector('#clear-pieces');
  const placed = [];
  box.classList.add(`pieces-${puzzle.mode}`);
  box.querySelector('#pieces-how').textContent = puzzle.mode === 'lines'
    ? "The answer's lines, shuffled. Tap them in the order they go. Tap one you've placed to take it back."
    : `The answer, cut into pieces and shuffled. Tap them in the order they go. Tap one you've placed to take it back.${puzzle.twoLines ? ' A piece marked with an arrow starts a new line.' : ''}`;

  const piece = (i, where) => {
    const p = puzzle.pieces[i];
    return `<button class="piece" type="button" data-piece="${i}" aria-label="${where === 'tray' ? 'Place' : 'Take back'}: ${escapeHTML(p.text)}">${p.br ? '<span class="piece-br" aria-hidden="true">&crarr;</span>' : ''}${escapeHTML(p.text)}</button>`;
  };
  const draw = () => {
    built.innerHTML = placed.length ? placed.map((i) => piece(i, 'built')).join('')
      : '<span class="pieces-empty">Your answer builds up here.</span>';
    tray.innerHTML = puzzle.order.filter((i) => !placed.includes(i)).map((i) => piece(i, 'tray')).join('');
    useButton.disabled = placed.length !== puzzle.pieces.length;
    clear.hidden = !placed.length;
  };
  box.addEventListener('click', (event) => {
    const tapped = event.target.closest('[data-piece]');
    if (tapped) {
      const i = Number(tapped.dataset.piece);
      const at = placed.indexOf(i);
      if (at >= 0) placed.splice(at, 1); else placed.push(i);
      draw();
      return;
    }
    if (event.target === clear) { placed.length = 0; draw(); }
    if (event.target === useButton && !useButton.disabled) use(puzzle.build(placed));
  });
  draw();
}
