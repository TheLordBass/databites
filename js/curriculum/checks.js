/* Check helpers shared by lessons whose answer is a function the learner
   writes (the Python course, Algorithms). */

/* Call the learner's function on each case and compare. Each call gets its
   own copy of the arguments, so a list changed in place can't leak into the
   next case. `cases` is a Python list of ((args...), want). The message
   names the exact call, what came back and what should have:
   "with_tip(20) gave None, but it should give 22.0." */
export const expect = (fn, cases) => `import copy as _copy
assert callable(globals().get("${fn}")), "Define a function called ${fn}, starting: def ${fn}("
for _args, _want in ${cases}:
    _got = ${fn}(*_copy.deepcopy(_args))
    _call = "${fn}(" + ", ".join(repr(_a) for _a in _args) + ")"
    assert _got == _want, "%s gave %r, but it should give %r." % (_call, _got, _want)`;
