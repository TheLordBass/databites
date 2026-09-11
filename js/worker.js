/* ═══════════════════════════════════════════════════════════
   Pyodide worker — all Python runs off the main thread so the
   UI stays smooth even while pandas is chewing on something.

   Protocol
     in : {type:'init'}
        : {type:'run', id, key, code, prelude, check, fresh, needs}
     out: {type:'status', text, pct}
        : {type:'ready', seaborn:boolean}
        : {type:'pkg', id, text, done}
        : {type:'fatal', text}
        : {type:'result', id, ...payload}
   ═══════════════════════════════════════════════════════════ */

// First entry that actually exists on the CDN wins. Bump the list to upgrade.
const PYODIDE_VERSIONS = ['0.28.3', '0.28.2', '0.28.0', '0.27.7', '0.27.2', '0.26.4'];

let pyodide = null;
let runPy = null;
let hasSeaborn = false;

/* Heavy extras (scipy, scikit-learn) stay out of the boot download. A lesson
   declares `needs: ['scikit-learn']` and we fetch it the first time that
   lesson runs, so opening the app never waits on them. */
const loadedExtras = new Set();

const post = (msg) => self.postMessage(msg);
const status = (text, pct) => post({ type: 'status', text, pct });

async function ensurePackages(names, id) {
  const missing = names.filter((n) => !loadedExtras.has(n));
  if (!missing.length) return true;

  post({ type: 'pkg', id, text: `Fetching ${missing.join(' + ')} — one time only…`, done: false });
  for (const name of missing) {
    try {
      await pyodide.loadPackage(name, { messageCallback: () => {} });
      loadedExtras.add(name);
    } catch (err) {
      post({ type: 'pkg', id, text: `Couldn't fetch ${name}.`, done: true });
      return false;
    }
  }
  post({ type: 'pkg', id, text: '', done: true });
  return true;
}

/* ── Python side runtime ─────────────────────────────────── */
const BOOTSTRAP = String.raw`
import sys, io, ast, json, base64, traceback, warnings

import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt

# plt.show() is a habit worth teaching; under AGG it just warns. Hush it.
warnings.filterwarnings("ignore", message=".*non-interactive.*")
warnings.simplefilter("ignore", FutureWarning)

_MAX_OUT = 8000
_NAMESPACES = {}

def _axes():
    """Every Axes on every open figure — for exercise checks."""
    found = []
    for num in plt.get_fignums():
        found.extend(plt.figure(num).axes)
    return found

def _labels(ax=None):
    """All the words on a chart, lowercased: titles, axis labels, legend."""
    targets = [ax] if ax is not None else _axes()
    bits = []
    for a in targets:
        bits += [a.get_title(), a.get_xlabel(), a.get_ylabel()]
        legend = a.get_legend()
        if legend is not None:
            bits += [t.get_text() for t in legend.get_texts()]
    return " | ".join(b for b in bits if b).lower()

# ── Practice judge ──────────────────────────────────────────────────
# Runs a learner's solution() against hidden inputs and a reference
# answer, LeetCode-style. Always returns a plain dict (JSON-safe), so the
# UI can show exactly which case broke rather than a bare pass/fail.

def _describe(x, limit=10):
    import pandas as pd
    if isinstance(x, pd.DataFrame):
        if x.empty:
            return "(empty DataFrame, columns: %s)" % list(x.columns)
        text = x.head(limit).to_string()
        return text + ("\n... %d rows in total" % len(x) if len(x) > limit else "")
    if isinstance(x, pd.Series):
        if x.empty:
            return "(empty Series)"
        text = x.head(limit).to_string()
        return text + ("\n... %d rows in total" % len(x) if len(x) > limit else "")
    return repr(x)

def _copy_arg(a):
    """Every call gets its own copy, so a solution that mutates its input
    can't change what the reference answer (or the next test) sees."""
    import copy
    import pandas as pd
    if isinstance(a, (pd.DataFrame, pd.Series)):
        return a.copy(deep=True)
    return copy.deepcopy(a)

def _uncat(frame):
    """Categoricals compare badly against plain objects; flatten them."""
    import pandas as pd
    frame = frame.copy()
    for c in frame.columns:
        if isinstance(frame[c].dtype, pd.CategoricalDtype):
            frame[c] = frame[c].astype(object)
    return frame

def _compare(expected, got, mode):
    """None when they match, otherwise a short human reason."""
    import pandas as pd
    if mode.startswith("frame"):
        if not isinstance(got, pd.DataFrame):
            return "expected a DataFrame, got %s" % type(got).__name__
        if set(map(str, got.columns)) != set(map(str, expected.columns)):
            return "expected columns %s, got %s" % (list(expected.columns), list(got.columns))
        if mode == "frame_strict" and list(map(str, got.columns)) != list(map(str, expected.columns)):
            return "right columns, wrong order - expected %s" % list(expected.columns)
        g = _uncat(got[list(expected.columns)]).reset_index(drop=True)
        e = _uncat(expected).reset_index(drop=True)
        if len(g) != len(e):
            return "expected %d rows, got %d" % (len(e), len(g))
        if mode == "frame" and len(e):
            cols = list(e.columns)
            g = g.sort_values(cols, kind="mergesort", na_position="last").reset_index(drop=True)
            e = e.sort_values(cols, kind="mergesort", na_position="last").reset_index(drop=True)
        try:
            pd.testing.assert_frame_equal(g, e, check_dtype=False, check_names=False,
                                          check_exact=False, rtol=1e-6, atol=1e-6)
        except AssertionError:
            return "the values don't match"
        return None
    if mode == "series":
        if isinstance(got, pd.DataFrame) and got.shape[1] == 1:
            got = got.iloc[:, 0]
        if not isinstance(got, pd.Series):
            return "expected a Series, got %s" % type(got).__name__
        if len(got) != len(expected):
            return "expected %d values, got %d" % (len(expected), len(got))
        try:
            pd.testing.assert_series_equal(
                got.sort_index().astype(object) if isinstance(got.dtype, pd.CategoricalDtype) else got.sort_index(),
                expected.sort_index(), check_dtype=False, check_names=False,
                check_exact=False, rtol=1e-6, atol=1e-6, check_index_type=False)
        except AssertionError:
            return "the values don't match"
        return None
    if mode == "list":
        try:
            got_list = list(got)
        except TypeError:
            return "expected a list, got %s" % type(got).__name__
        return None if got_list == list(expected) else "the values don't match"
    # scalar
    if expected is None:
        return None if got is None else "expected None, got %r" % (got,)
    if isinstance(expected, float) or isinstance(got, float):
        try:
            if got is None or abs(float(got) - float(expected)) > 1e-6 * max(1.0, abs(float(expected))):
                return "the values don't match"
        except (TypeError, ValueError):
            return "the values don't match"
        return None
    try:
        return None if bool(got == expected) else "the values don't match"
    except Exception:
        return "the values don't match"

def _labelled(ref, args):
    import inspect
    try:
        names = list(inspect.signature(ref).parameters)
    except (TypeError, ValueError):
        names = []
    parts = []
    for i, a in enumerate(args):
        name = names[i] if i < len(names) else "arg %d" % (i + 1)
        parts.append("%s =\n%s" % (name, _describe(a)))
    return "\n\n".join(parts)

def _judge(fn, ref, cases, mode="frame", reveal=False):
    total = len(cases)
    report = {"ok": False, "passed": 0, "total": total, "summary": "", "case": None, "mode": "submit"}
    if reveal:
        report["mode"] = "run"
    if not callable(fn):
        report["summary"] = "Define a function called solution - that's what gets tested."
        return report
    for i, args in enumerate(cases):
        if not isinstance(args, tuple):
            args = (args,)
        shown = _labelled(ref, args)
        expected = ref(*[_copy_arg(a) for a in args])
        try:
            got = fn(*[_copy_arg(a) for a in args])
        except Exception as err:
            report["summary"] = "Test %d of %d raised %s: %s" % (i + 1, total, type(err).__name__, err)
            report["case"] = {"n": i + 1, "input": shown, "expected": _describe(expected),
                              "got": "%s: %s" % (type(err).__name__, err)}
            return report
        problem = _compare(expected, got, mode)
        if problem or reveal:
            report["case"] = {"n": i + 1, "input": shown, "expected": _describe(expected), "got": _describe(got)}
        if problem:
            label = "Example" if reveal else "Test %d of %d" % (i + 1, total)
            report["summary"] = "%s failed - %s." % (label, problem)
            return report
        report["passed"] += 1
    report["ok"] = True
    report["summary"] = ("Matches the expected output." if reveal
                         else "All %d tests passed." % total)
    return report

def _preview(ref, args):
    if not isinstance(args, tuple):
        args = (args,)
    return {"mode": "preview", "input": _labelled(ref, args),
            "expected": _describe(ref(*[_copy_arg(a) for a in args]))}

def _display(val):
    """Jupyter-ish echo of a cell's last expression."""
    try:
        import pandas as pd
        if isinstance(val, (pd.DataFrame, pd.Series, pd.Index)):
            return str(val)
    except Exception:
        pass
    if isinstance(val, str):
        return repr(val)
    return repr(val)

def _namespace(key, prelude, fresh):
    if fresh or key not in _NAMESPACES:
        ns = {"__name__": "__main__"}
        if prelude:
            exec(compile(prelude, "<setup>", "exec"), ns)
        _NAMESPACES[key] = ns
    return _NAMESPACES[key]

def _friendly_error():
    """Beginner-readable error: no internal frames, points at their line."""
    etype, evalue, tb = sys.exc_info()
    line_no, src = None, None
    for frame in traceback.extract_tb(tb):
        if frame.filename == "<cell>":
            line_no, src = frame.lineno, frame.line
    if isinstance(evalue, SyntaxError) and evalue.lineno:
        line_no = evalue.lineno
        src = (evalue.text or "").rstrip()

    head = "{}: {}".format(etype.__name__, evalue)
    if line_no:
        bits = ["Line {}".format(line_no)]
        if src:
            bits.append("    " + src.strip())
        bits.append(head)
        return "\n".join(bits)
    return head

def _exec_cell(code, ns):
    """Execute a cell, echoing the value of a trailing expression."""
    tree = ast.parse(code, "<cell>", "exec")
    tail = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        tail = tree.body.pop()
    if tree.body:
        exec(compile(tree, "<cell>", "exec"), ns)
    if tail is not None:
        value = eval(compile(ast.Expression(tail.value), "<cell>", "eval"), ns)
        if value is not None:
            print(_display(value))

def _harvest_figures():
    out = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(
            buf, format="png", dpi=112, bbox_inches="tight", facecolor="white"
        )
        out.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    return out

def _clip(text):
    if len(text) > _MAX_OUT:
        return text[:_MAX_OUT] + "\n… (output trimmed)"
    return text

def _run(key, code, prelude, check, fresh):
    result = {"ok": True, "stdout": "", "error": "", "images": [], "check": None, "judge": None}
    buffer = io.StringIO()
    real_out, real_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buffer
    plt.close("all")
    try:
        ns = _namespace(key, prelude, fresh)
        try:
            _exec_cell(code, ns)
        except Exception:
            result["ok"] = False
            result["error"] = _friendly_error()

        # Checks run while the figures are still open, so they can inspect them.
        if result["ok"] and check:
            ns["_axes"] = _axes
            ns["_labels"] = _labels
            ns["_judge"] = _judge
            ns["_preview"] = _preview
            ns["_out"] = buffer.getvalue()
            try:
                exec(compile(check, "<check>", "exec"), ns)
                result["check"] = {"passed": True, "msg": ""}
            except AssertionError as err:
                result["check"] = {"passed": False, "msg": str(err) or "Not quite yet."}
            except Exception as err:
                result["check"] = {
                    "passed": False,
                    "msg": "I couldn't check that — {}: {}".format(type(err).__name__, err),
                }
            report = ns.get("__judge__")
            if isinstance(report, dict):
                result["judge"] = report

        try:
            result["images"] = _harvest_figures()
        except Exception:
            pass
    finally:
        sys.stdout, sys.stderr = real_out, real_err

    result["stdout"] = _clip(buffer.getvalue())
    return json.dumps(result)
`;

/* ── Boot ────────────────────────────────────────────────── */

async function loadRuntime() {
  let lastError = null;

  for (const version of PYODIDE_VERSIONS) {
    const indexURL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
    try {
      status('Fetching Python…', 8);
      self.importScripts(indexURL + 'pyodide.js');
      pyodide = await self.loadPyodide({
        indexURL,
        stdout: () => {},
        stderr: () => {},
      });
      break;
    } catch (err) {
      lastError = err;
      pyodide = null;
    }
  }

  if (!pyodide) throw lastError || new Error('Could not reach the Python CDN.');

  status('Unpacking pandas + matplotlib…', 42);
  await pyodide.loadPackage(['pandas', 'matplotlib'], { messageCallback: () => {} });

  status('Adding seaborn…', 74);
  try {
    await pyodide.loadPackage('micropip', { messageCallback: () => {} });
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('seaborn');
    hasSeaborn = true;
  } catch (err) {
    hasSeaborn = false; // pandas + matplotlib still work fine
  }

  status('Warming up…', 92);
  await pyodide.runPythonAsync(BOOTSTRAP);
  runPy = pyodide.globals.get('_run');

  // Take the one-time import cost now, not on the user's first tap.
  await pyodide.runPythonAsync(
    'import pandas as pd, numpy as np' + (hasSeaborn ? ', seaborn as sns' : '')
  );

  status('Ready', 100);
  post({ type: 'ready', seaborn: hasSeaborn });
}

/* ── Dispatch ────────────────────────────────────────────── */

self.onmessage = async (event) => {
  const msg = event.data || {};

  if (msg.type === 'init') {
    try {
      await loadRuntime();
    } catch (err) {
      post({ type: 'fatal', text: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (msg.type === 'run') {
    if (!runPy) {
      post({ type: 'result', id: msg.id, ok: false, stdout: '', error: 'Python is still starting up.', images: [], check: null });
      return;
    }
    if (msg.needs && msg.needs.length) {
      const ok = await ensurePackages(msg.needs, msg.id);
      if (!ok) {
        post({
          type: 'result', id: msg.id, ok: false, stdout: '', images: [], check: null,
          error: `This lesson needs ${msg.needs.join(', ')}, which couldn't be downloaded.\nCheck your connection and try again.`,
        });
        return;
      }
    }
    try {
      const raw = runPy(
        msg.key || 'default',
        msg.code || '',
        msg.prelude || '',
        msg.check || '',
        msg.fresh !== false
      );
      post({ type: 'result', id: msg.id, ...JSON.parse(raw) });
    } catch (err) {
      post({
        type: 'result', id: msg.id, ok: false, stdout: '', images: [], check: null,
        error: String(err && err.message ? err.message : err),
      });
    }
  }
};
