/* From lessons to Practice: at the end of a part of a course, one practice
   question that needs only what you've covered. Lessons hold your hand (a
   starter, a worked example); a practice question is a blank page, and using
   a thing somewhere new is what makes it stick. The catch is being sent to a
   question that needs something not taught yet, so nothing here is picked by
   hand or by tag: it's worked out from the code.

   A piece of code's "features" are the things it calls on: functions and
   methods in Python and R (plus loops, lambda, classes and the like), the
   keywords and functions of a SQL query, the functions of a DAX measure or
   an Excel formula. A question is ready when every feature of its model
   answer appears in the answer of some lesson you've finished in that
   language. The one offered also uses something from the part just finished,
   easiest first.

   features(code, lang)        what a piece of code calls on
   readyQuestion(ids, isDone)  the question to offer after a part, or null */

import { ALL_LESSONS } from './curriculum/index.js';
import { PROBLEMS } from './practice/problems.js';

// So small and so common that no lesson needs to have "taught" them.
const BASICS = new Set(['print', 'len', 'round', 'c', 'AS', 'SELECT', 'FROM']);
const LEVEL = { easy: 0, medium: 1, hard: 2 };
const STRINGS = /"(?:\\.|[^"\\])*"|'(?:''|\\.|[^'\\])*'/g;

export function features(code, lang) {
  const found = new Set();
  const add = (re, text, pick = (m) => m[1]) => { for (const m of text.matchAll(re)) found.add(pick(m)); };
  if (lang === 'sql') {
    const text = code.replace(/--.*$/gm, '').replace(STRINGS, "''");
    add(/\b([A-Z][A-Z_]+)\b/g, text);
  } else if (lang === 'dax' || lang === 'excel') {
    const text = code.replace(/\/\/.*$/gm, '').replace(/"(?:""|[^"])*"/g, '""');
    add(/\b([A-Z][A-Z0-9.]*)\s*\(/g, text);
    add(/\b(VAR|RETURN)\b/g, text);
  } else {
    const text = code.replace(STRINGS, '""').replace(/#.*$/gm, '');
    const own = new Set([...text.matchAll(/\bdef\s+([A-Za-z_]\w*)|^\s*([A-Za-z_][\w.]*)\s*<-\s*function\b/gm)].map((m) => m[1] || m[2]));
    for (const m of text.matchAll(/\.?([A-Za-z_][\w]*)\s*\(/g)) if (!own.has(m[1])) found.add(m[1]);
    add(/\.(str|dt|loc|iloc|cat)\b/g, text, (m) => `.${m[1]}`);
    if (lang === 'r') {
      add(/(%>%|\|>|%in%)/g, text);
      add(/\b(for|while|function)\b/g, text.replace(/<-\s*function\b/, ''));
    } else {
      add(/\b(for|while|lambda|class|try|with|yield)\b/g, text);
      // writing a function of your own, other than the one a question asks for
      if ([...own].some((name) => name !== 'solution')) found.add('def');
    }
    for (const word of ['if', 'function']) found.delete(word);
  }
  for (const basic of BASICS) found.delete(basic);
  return found;
}

const lessonFeatures = new Map();
const problemFeatures = new Map();
const ofLesson = (l) => {
  if (!lessonFeatures.has(l.id)) lessonFeatures.set(l.id, features(l.solution, l.lang));
  return lessonFeatures.get(l.id);
};
const ofProblem = (p) => {
  if (!problemFeatures.has(p.id)) problemFeatures.set(p.id, features(p.solution, p.lang || 'python'));
  return problemFeatures.get(p.id);
};

/** Everything the finished lessons in a language have used. */
export function covered(lang, isDone) {
  const all = new Set();
  for (const l of ALL_LESSONS) if (l.lang === lang && isDone(l.id)) for (const f of ofLesson(l)) all.add(f);
  return all;
}

/** Is everything this question's model answer uses covered? */
export const isReady = (problem, have) => [...ofProblem(problem)].every((f) => have.has(f));

/** After a part (its lessons' ids, all one course): an unsolved question in
    the part's language that needs nothing new and uses something from the part. */
const BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
export function readyQuestion(ids, isDone) {
  const part = ids.map((id) => BY_ID.get(id)).filter(Boolean);
  if (!part.length) return null;
  const lang = part[part.length - 1].lang;
  const have = covered(lang, isDone);
  const here = new Set(part.filter((l) => l.lang === lang).flatMap((l) => [...ofLesson(l)]));
  const uses = (p) => [...ofProblem(p)].filter((f) => here.has(f)).length;
  // Algorithm questions go with the Python and Algorithms courses, data ones with the rest.
  const algo = ['basics', 'algo'].includes(part[0].track.id);
  const [best] = PROBLEMS
    .filter((p) => (p.lang || 'python') === lang && !isDone(p.id) && (lang !== 'python' || p.tags.includes('algorithms') === algo)
      && uses(p) > 0 && isReady(p, have))
    .sort((a, b) => LEVEL[a.difficulty] - LEVEL[b.difficulty] || uses(b) - uses(a));
  return best || null;
}
