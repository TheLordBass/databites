/* ═══════════════════════════════════════════════════════════
   Pyodide worker — all Python runs off the main thread so the
   UI stays smooth even while pandas is chewing on something.

   Protocol
     in : {type:'init'}
        : {type:'run', id, key, code, prelude, check, fresh}
     out: {type:'status', text, pct}
        : {type:'ready', seaborn:boolean}
        : {type:'fatal', text}
        : {type:'result', id, ...payload}
   ═══════════════════════════════════════════════════════════ */

// First entry that actually exists on the CDN wins. Bump the list to upgrade.
const PYODIDE_VERSIONS = ['0.28.3', '0.28.2', '0.28.0', '0.27.7', '0.27.2', '0.26.4'];

let pyodide = null;
let runPy = null;
let hasSeaborn = false;

const post = (msg) => self.postMessage(msg);
const status = (text, pct) => post({ type: 'status', text, pct });

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
    result = {"ok": True, "stdout": "", "error": "", "images": [], "check": None}
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
