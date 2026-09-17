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
let completePy = null;
let hasSeaborn = false;

/* Heavy extras (scipy, scikit-learn) stay out of the boot download. A lesson
   declares `needs: ['scikit-learn']` and we fetch it the first time that
   lesson runs, so opening the app never waits on them. */
const loadedExtras = new Set();
// name -> in-flight download. SQL screens fetch SQLite ahead of the first run,
// so a Run pressed mid-download must wait for that one rather than start another.
const loading = new Map();
const NICE = { sqlite3: 'the SQL engine' };
const nice = (name) => NICE[name] || name;

const post = (msg) => self.postMessage(msg);
const status = (text, pct) => post({ type: 'status', text, pct });

async function ensurePackages(names, id) {
  const missing = names.filter((n) => !loadedExtras.has(n));
  if (!missing.length) return true;

  post({ type: 'pkg', id, text: `Fetching ${missing.map(nice).join(' + ')} — one time only…`, done: false });
  for (const name of missing) {
    if (!loading.has(name)) {
      loading.set(name, pyodide.loadPackage(name, { messageCallback: () => {} })
        .then(() => { loadedExtras.add(name); })
        .catch((err) => { loading.delete(name); throw err; }));
    }
    try {
      await loading.get(name);
    } catch (err) {
      post({ type: 'pkg', id, text: `Couldn't fetch ${nice(name)}.`, done: true });
      return false;
    }
  }
  post({ type: 'pkg', id, text: '', done: true });
  return true;
}

/* DAX is its own Python module (js/dax.py), fetched and loaded the first
   time anything DAX runs — so nobody who never touches it pays for it. */
let daxLoading = null;
function ensureDax() {
  if (!daxLoading) {
    daxLoading = fetch('dax.py')
      .then((r) => {
        if (!r.ok) throw new Error("Couldn't load the DAX engine — check your connection and try again.");
        return r.text();
      })
      .then((src) => {
        // Its own namespace, seeded with the worker's helpers. dax.py has
        // helpers of its own (_compare, _text...) with names the worker
        // uses too: run into globals, they replaced the worker's, and every
        // SQL and Python check broke after the first DAX run.
        pyodide.globals.set('_dax_source', src);
        pyodide.runPython(`
_dax_ns = dict(globals())
exec(compile(_dax_source, "dax.py", "exec"), _dax_ns)
for _name in ("_dax_exec", "_dax_expect", "_judge_dax", "_preview_dax", "_dax_complete"):
    globals()[_name] = _dax_ns[_name]
del _dax_source
`);
      })
      .catch((err) => { daxLoading = null; throw err; });
  }
  return daxLoading;
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

# ── Intellisense ────────────────────────────────────────────────────
# Suggestions are resolved against the LIVE namespace — the datasets, and
# whatever the learner's last run defined — so cafe. lists cafe's real
# columns and methods. Learner code is never executed here: expressions are
# resolved by walking names, attributes and literal subscripts, plus a short
# whitelist of lazy calls (groupby, rolling...) that compute nothing.

import keyword as _kw
import re as _re
import inspect as _insp
import builtins as _bi

_MISSING = object()
_BIND_CACHE = {}

_COMMON = set("""
head tail describe info shape columns dtypes index values loc iloc at iat groupby agg aggregate
sum mean median min max count size std sort_values sort_index reset_index set_index merge join
pivot pivot_table melt stack unstack rename drop dropna fillna isna notna isin between astype
copy apply map value_counts unique nunique nlargest nsmallest idxmax idxmin cumsum cumcount rank
shift diff pct_change rolling resample round query assign drop_duplicates duplicated str dt plot
to_csv items T transform filter first last explode
strip lower upper title replace contains startswith endswith split extract len get cat capitalize
year month day day_name month_name dayofweek strftime date to_period days
DataFrame Series read_csv to_datetime to_numeric cut qcut concat crosstab date_range merge_asof
Timedelta Timestamp isna notna array arange linspace where select nan
figure subplots bar barh scatter hist title xlabel ylabel legend show tight_layout grid xlim ylim
histplot scatterplot lineplot barplot countplot boxplot violinplot heatmap relplot catplot
pairplot regplot kdeplot set_theme
""".split())

_BUILTIN_NAMES = ["print", "len", "range", "sorted", "list", "dict", "set", "tuple", "sum", "min",
                  "max", "round", "abs", "int", "float", "str", "bool", "enumerate", "zip",
                  "isinstance", "type", "any", "all", "map", "filter", "reversed"]

# methods assumed to hand back the same kind of object, so df.copy(). completes
_SAME_KIND = set("""head tail copy sort_values sort_index dropna fillna reset_index set_index rename
drop assign query sample drop_duplicates nlargest nsmallest astype round abs where mask clip
reindex""".split())
# lazy calls: safe to really make with literal arguments, they compute nothing yet
_LAZY_CALLS = {"groupby", "rolling", "expanding", "ewm", "resample"}

def _const(node):
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, (ast.List, ast.Tuple)) and all(isinstance(e, ast.Constant) for e in node.elts):
        vals = [e.value for e in node.elts]
        return vals if isinstance(node, ast.List) else tuple(vals)
    raise ValueError("not a literal")

def _walk(node, ns):
    import pandas as pd
    if isinstance(node, ast.Name):
        if node.id in ns:
            return ns[node.id]
        return getattr(_bi, node.id, _MISSING)
    if isinstance(node, ast.Attribute):
        base = _walk(node.value, ns)
        if base is _MISSING:
            return _MISSING
        try:
            return getattr(base, node.attr)
        except Exception:
            return _MISSING
    if isinstance(node, ast.Subscript):
        base = _walk(node.value, ns)
        if base is _MISSING:
            return _MISSING
        try:
            key = _const(node.slice)
        except ValueError:
            # a mask or a computed key: filtering keeps the same kind of object
            return base if isinstance(base, (pd.DataFrame, pd.Series)) else _MISSING
        try:
            return base[key]
        except Exception:
            return _MISSING
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
        base = _walk(node.func.value, ns)
        name = node.func.attr
        if isinstance(base, (pd.DataFrame, pd.Series)):
            if name in _SAME_KIND:
                return base
            if name in _LAZY_CALLS:
                try:
                    args = [_const(a) for a in node.args]
                    kwargs = {k.arg: _const(k.value) for k in node.keywords if k.arg}
                    return getattr(base, name)(*args, **kwargs)
                except Exception:
                    return _MISSING
    return _MISSING

def _resolve(expr, ns):
    expr = expr.strip()
    if not expr:
        return _MISSING
    try:
        node = ast.parse(expr, mode="eval").body
    except SyntaxError:
        return _MISSING
    return _walk(node, ns)

def _match_open(text, close_idx):
    depth = 0
    k = close_idx
    while k >= 0:
        c = text[k]
        if c in ")]}":
            depth += 1
        elif c in "([{":
            depth -= 1
            if depth == 0:
                return k
        k -= 1
    return None

def _tail_expr(text):
    """The expression that ends at the caret: cafe["city"].str, df.groupby("a")."""
    i = len(text)
    while i > 0:
        c = text[i - 1]
        if c.isalnum() or c in "_.":
            i -= 1
        elif c in ")]":
            j = _match_open(text, i - 1)
            if j is None:
                break
            i = j
        else:
            break
    return text[i:]

def _last_top_dot(tail):
    depth = 0
    for k in range(len(tail) - 1, -1, -1):
        c = tail[k]
        if c in ")]}":
            depth += 1
        elif c in "([{":
            depth -= 1
        elif c == "." and depth == 0:
            return k
    return None

def _lex_state(text):
    quote, start, comment, i = None, -1, False, 0
    while i < len(text):
        c = text[i]
        if comment:
            if c == "\n":
                comment = False
        elif quote:
            if c == "\\":
                i += 2
                continue
            if c == quote or c == "\n":
                quote = None
        elif c in "\"'":
            quote, start = c, i
        elif c == "#":
            comment = True
        i += 1
    if comment:
        return {"mode": "comment"}
    if quote:
        return {"mode": "string", "quote": quote, "start": start}
    return {"mode": "code"}

def _open_call(text):
    """(callee, argument text) for the innermost call the caret is inside."""
    stack, quote, i = [], None, 0
    while i < len(text):
        c = text[i]
        if quote:
            if c == "\\":
                i += 2
                continue
            if c == quote or c == "\n":
                quote = None
        elif c in "\"'":
            quote = c
        elif c == "#":
            nl = text.find("\n", i)
            if nl == -1:
                break
            i = nl
            continue
        elif c in "([{":
            stack.append((c, i))
        elif c in ")]}":
            if stack:
                stack.pop()
        i += 1
    for ch, idx in reversed(stack):
        if ch == "(":
            callee = _tail_expr(text[:idx])
            if callee and not _kw.iskeyword(callee) and not callee[0].isdigit():
                return (callee, text[idx + 1:])
            return None
    return None

def _arg_index(args):
    depth, quote, n = 0, None, 0
    for c in args:
        if quote:
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
        elif c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
        elif c == "," and depth == 0:
            n += 1
    return n

def _doc_line(obj):
    try:
        doc = _insp.getdoc(obj) or ""
    except Exception:
        return ""
    # chr(96) is a backtick: a literal one would end this JS template string
    para = doc.strip().split("\n\n")[0].replace("\n", " ").replace(chr(96), "").strip()
    m = _re.match(r"(.+?[.!?])(\s|$)", para)
    line = m.group(1) if m else para
    return line if len(line) <= 150 else line[:147] + "..."

def _param_text(p):
    """by, ascending=True, *args - no type annotations, which only confuse a learner."""
    prefix = {_insp.Parameter.VAR_POSITIONAL: "*", _insp.Parameter.VAR_KEYWORD: "**"}.get(p.kind, "")
    text = prefix + p.name
    if p.default is not _insp.Parameter.empty:
        shown = repr(p.default)
        if shown.startswith("<"):              # sentinels like <no_default>
            shown = "..."
        text += "=" + (shown if len(shown) <= 18 else shown[:15] + "...")
    return text

def _sig_text(fn, name):
    try:
        params = [_param_text(p) for p in _insp.signature(fn).parameters.values()]
    except (TypeError, ValueError):
        return name + "(...)"
    sig = "(" + ", ".join(params) + ")"
    if len(sig) > 84:
        sig = sig[:80].rsplit(",", 1)[0] + ", ...)"
    return name + sig

def _has_params(fn):
    try:
        return bool(_insp.signature(fn).parameters)
    except (TypeError, ValueError):
        return True

def _columns_of(obj):
    import pandas as pd
    if isinstance(obj, pd.DataFrame):
        return [str(c) for c in obj.columns]
    inner = getattr(obj, "obj", None) if not isinstance(obj, (str, bytes, type)) else None
    if isinstance(inner, pd.DataFrame):          # groupby / rolling keep their frame here
        return [str(c) for c in inner.columns]
    return []

def _col_detail(obj, col):
    import pandas as pd
    frame = obj if isinstance(obj, pd.DataFrame) else getattr(obj, "obj", None)
    try:
        return "column · %s" % frame[col].dtype
    except Exception:
        return "column"

def _member(obj, name, is_col):
    if is_col:
        return {"label": name, "kind": "column", "detail": _col_detail(obj, name)}
    try:
        raw = _insp.getattr_static(obj, name)
    except AttributeError:
        raw = None
    kind = "attribute"
    if isinstance(raw, property):
        kind = "property"
    elif _insp.ismodule(raw):
        kind = "module"
    elif _insp.isclass(raw):
        kind = "class"
    elif raw is None or callable(raw) or isinstance(raw, (staticmethod, classmethod)):
        kind = "method"
    item = {"label": name, "kind": kind}
    if kind in ("method", "class"):
        try:
            val = getattr(obj, name)
        except Exception:
            val = None
        if callable(val):
            if _insp.isclass(val):
                item["kind"] = "class"
            elif _insp.ismodule(obj):
                item["kind"] = "function"
            else:
                item["kind"] = "method"
            item["detail"] = _sig_text(val, name)
            item["doc"] = _doc_line(val)
            item["call"] = True
            item["args"] = _has_params(val)
        else:
            item["kind"] = "attribute"
    elif kind == "property":
        item["doc"] = _doc_line(raw)
    return item

def _members(obj, prefix):
    try:
        names = [n for n in dir(obj) if not n.startswith("_")]
    except Exception:
        return []
    cols = set(_columns_of(obj))
    low = prefix.lower()
    hits = [n for n in names if n.lower().startswith(low)]
    if len(low) >= 3 and len(hits) < 6:           # substring matches only once it's specific
        hits += [n for n in names if low in n.lower() and n not in hits]
    hits.sort(key=lambda n: (n not in cols, n not in _COMMON, not n.startswith(prefix), n.lower()))
    return [_member(obj, n, n in cols) for n in hits[:40]]

def _names(ns, prefix):
    import pandas as pd
    low = prefix.lower()
    seen, out = set(), []
    def add(name, kind, detail="", call=False, args=False):
        if name in seen or not name.lower().startswith(low):
            return
        seen.add(name)
        item = {"label": name, "kind": kind, "detail": detail}
        if call:
            item["call"], item["args"] = True, args
        out.append(item)
    for name, val in list(ns.items()):
        if name.startswith("_") or name in ("In", "Out", "exit", "quit"):
            continue
        if _insp.ismodule(val):
            add(name, "module")
        elif isinstance(val, pd.DataFrame):
            add(name, "variable", "DataFrame %d x %d" % val.shape)
        elif isinstance(val, pd.Series):
            add(name, "variable", "Series, %d rows" % len(val))
        elif _insp.isclass(val):
            add(name, "class")
        elif callable(val):
            add(name, "function", _sig_text(val, name), True, _has_params(val))
        else:
            add(name, "variable", type(val).__name__)
    for name in _BUILTIN_NAMES:
        val = getattr(_bi, name, None)
        if val is not None:
            add(name, "builtin", _sig_text(val, name), True, _has_params(val))
    for name in _kw.kwlist:
        add(name, "keyword")
    return out[:40]

def _signature(call, ns):
    callee, args = call
    fn = _resolve(callee, ns)
    if fn is _MISSING or not callable(fn):
        return None
    try:
        sig = _insp.signature(fn)
    except (TypeError, ValueError):
        return None
    names = list(sig.parameters)
    kinds = [p.kind for p in sig.parameters.values()]
    params = [_param_text(p) for p in sig.parameters.values()]
    active = _arg_index(args)
    m = _re.search(r"(\w+)\s*=\s*[^=,()]*$", args)
    if m and m.group(1) in names:
        active = names.index(m.group(1))
    elif active >= len(names) or kinds[active] in (_insp.Parameter.KEYWORD_ONLY, _insp.Parameter.VAR_KEYWORD):
        var = [i for i, k in enumerate(kinds) if k == _insp.Parameter.VAR_POSITIONAL]
        active = var[0] if var else -1
    return {"name": callee.rsplit(".", 1)[-1], "params": params[:12], "more": len(params) > 12,
            "active": active if active < 12 else -1, "doc": _doc_line(fn)}

def _completion_ns(key, prelude, bind):
    ns = _NAMESPACES.get(key)
    if ns is None:
        ns = _namespace(key, prelude, False)
    view = dict(ns)
    if bind:
        cached = _BIND_CACHE.get(key)
        if cached is None or cached[0] != bind:
            cached = (bind, {})
            try:
                private = {}
                exec(compile(bind, "<bind>", "exec"), private)
                args = private["_example"]()
                if isinstance(args, dict):           # an SQL problem: the example is a set of tables
                    cached = (bind, dict(args))
                else:
                    if not isinstance(args, tuple):
                        args = (args,)
                    names = list(_insp.signature(private["_ref"]).parameters)
                    cached = (bind, dict(zip(names, args)))
            except Exception:
                pass
            _BIND_CACHE[key] = cached
        for name, val in cached[1].items():
            view.setdefault(name, val)
    return view

def _assigned(text, ns):
    """Variables assigned earlier in the unrun code, where the right-hand side
    can be resolved without running anything: busy = cafe[mask] -> busy."""
    found = {}
    for line in text.splitlines():
        m = _re.match(r"\s*([A-Za-z_]\w*)\s*=(?!=)\s*(.+?)\s*$", line)
        if not m or m.group(1) in ns:
            continue
        val = _resolve(m.group(2), dict(ns, **found))
        if val is not _MISSING:
            found[m.group(1)] = val
    return found

def _complete_in(text, ns, force):
    result = {"items": [], "replace": 0, "signature": None, "context": "none"}
    state = _lex_state(text)
    if state["mode"] == "comment":
        return result
    call = _open_call(text)
    if call:
        result["signature"] = _signature(call, ns)
    if state["mode"] == "string":
        prefix = text[state["start"] + 1:]
        before = text[:state["start"]].rstrip()
        frame = _MISSING
        if before.endswith("["):                              # df["ci
            frame = _resolve(_tail_expr(before[:-1]), ns)
        elif call:                                            # df.groupby("ci  /  x="ci
            callee, args = call
            dot = _last_top_dot(callee)
            if dot is not None:
                frame = _resolve(callee[:dot], ns)
            if not _columns_of(frame):
                m = _re.search(r"\bdata\s*=\s*([A-Za-z_][\w.]*)", args)
                if m:
                    frame = _resolve(m.group(1), ns)
        cols = _columns_of(frame)
        if cols:
            low = prefix.lower()
            items = [{"label": c, "kind": "column", "detail": _col_detail(frame, c)}
                     for c in cols if c.lower().startswith(low)]
            result.update(items=items[:40], replace=len(prefix), context="column", quote=state["quote"])
        return result
    tail = _tail_expr(text)
    dot = _last_top_dot(tail)
    if dot is not None:
        obj_expr, prefix = tail[:dot], tail[dot + 1:]
        if not obj_expr or _re.fullmatch(r"[\d.]+", obj_expr):
            return result
        obj = _resolve(obj_expr, ns)
        if obj is _MISSING:
            return result
        result.update(items=_members(obj, prefix), replace=len(prefix), context="attr")
        return result
    m = _re.search(r"[A-Za-z_]\w*$", text)
    prefix = m.group(0) if m else ""
    if len(prefix) < 2 and not force:
        return result
    result.update(items=_names(ns, prefix), replace=len(prefix), context="name")
    return result

def _complete(key, prelude, text, bind, force, lang="python", after=""):
    try:
        ns = _completion_ns(key, prelude, bind)
        if lang == "sql":
            return json.dumps(_complete_sql(text, after or "", ns, bool(force)), default=str)
        if lang == "dax":
            fn = globals().get("_dax_complete")
            empty = {"items": [], "replace": 0, "signature": None, "context": "none"}
            return json.dumps(fn(text, after or "", ns, bool(force)) if fn else empty, default=str)
        ns.update(_assigned(text, ns))
        return json.dumps(_complete_in(text, ns, bool(force)), default=str)
    except Exception as err:
        return json.dumps({"items": [], "replace": 0, "signature": None, "context": "none",
                           "error": "%s: %s" % (type(err).__name__, err)})

# ── SQL ─────────────────────────────────────────────────────────────
# SQL runs in SQLite (Python's own sqlite3, fetched the first time it's
# needed). The database is built from the namespace: every DataFrame
# becomes a table of the same name, so SQL lessons query the very cafe the
# pandas lessons use.

class _SQLFailure(Exception):
    """An SQL error, already worded for a learner."""

def _sql_type(col):
    import pandas as pd
    if pd.api.types.is_bool_dtype(col) or pd.api.types.is_integer_dtype(col):
        return "INTEGER"
    if pd.api.types.is_float_dtype(col):
        return "REAL"
    if pd.api.types.is_datetime64_any_dtype(col):
        return "DATE"
    return "TEXT"

def _sql_ready(df):
    """A copy SQLite can hold: dates as ISO text (dropping all-midnight times), no categoricals."""
    import pandas as pd
    out = df.copy()
    for c in out.columns:
        col = out[c]
        if isinstance(col, pd.DataFrame):
            continue
        if isinstance(col.dtype, pd.CategoricalDtype):
            out[c] = col.astype(object)
        elif pd.api.types.is_datetime64_any_dtype(col):
            real = col.dropna()
            fmt = "%Y-%m-%d" if (real == real.dt.normalize()).all() else "%Y-%m-%d %H:%M:%S"
            out[c] = col.dt.strftime(fmt)
    return out

def _sql_tables(ns):
    import pandas as pd
    return {k: v for k, v in ns.items()
            if isinstance(v, pd.DataFrame) and k.isidentifier() and not k.startswith("_")}

def _sql_load(tables):
    import sqlite3
    db = sqlite3.connect(":memory:")
    for name, df in tables.items():
        _sql_ready(df).to_sql(name, db, index=False)
    return db

def _sql_db(ns):
    """The namespace's database. Any DataFrame that is new - or reassigned - since the
    last run is (re)loaded as a table, so in the sandbox what you make in Python mode
    turns up in SQL mode. Tables made in SQL stay put between runs."""
    import sqlite3
    if ns.get("_db") is None:
        ns["_db"] = sqlite3.connect(":memory:")
        ns["_db_seen"] = {}
    seen = ns["_db_seen"]
    for name, df in _sql_tables(ns).items():
        if seen.get(name) is not df:
            _sql_ready(df).to_sql(name, ns["_db"], index=False, if_exists="replace")
            seen[name] = df
    return ns["_db"]

def _db_schema(db):
    out = {}
    for (name,) in db.execute("SELECT name FROM sqlite_master WHERE type IN ('table', 'view')").fetchall():
        info = db.execute('PRAGMA table_info("%s")' % name.replace('"', '""')).fetchall()
        out[name] = [(r[1], (r[2] or "").upper()) for r in info]
    return out

def _sql_schema(ns):
    schema = {name: [(str(c), _sql_type(df[c])) for c in df.columns if not isinstance(df[c], type(df))]
              for name, df in _sql_tables(ns).items()}
    if ns.get("_db") is not None:
        try:
            schema.update(_db_schema(ns["_db"]))
        except Exception:
            pass
    return schema

def _sql_code_left(stmt):
    text = _re.sub(r"--[^\n]*", "", stmt)
    text = _re.sub(r"/\*.*?\*/", "", text, flags=_re.S)
    return text.strip().strip(";").strip()

def _sql_split(code):
    """Statements, split on the semicolons that aren't inside a string."""
    import sqlite3
    stmts, buf = [], ""
    pieces = code.split(";")
    for i, piece in enumerate(pieces):
        buf += piece
        if i < len(pieces) - 1:
            buf += ";"
            if not sqlite3.complete_statement(buf):
                continue
        if _sql_code_left(buf):
            stmts.append(buf)
        buf = ""
    return stmts

_SQL_WORDS = ["SELECT", "FROM", "WHERE", "GROUP", "ORDER", "BY", "HAVING", "LIMIT", "JOIN", "LEFT",
              "INNER", "ON", "AS", "AND", "OR", "NOT", "NULL", "IS", "IN", "BETWEEN", "LIKE", "DISTINCT",
              "CASE", "WHEN", "THEN", "ELSE", "END", "WITH", "UNION", "DESC", "ASC", "OVER", "PARTITION",
              "USING", "COUNT", "SUM", "AVG", "ROUND"]

def _sql_error(err, db, statement=0):
    """SQLite's message, plus the next thing to try."""
    import difflib
    msg = str(err)
    try:
        schema = _db_schema(db)
    except Exception:
        schema = {}
    tip = ""
    m = _re.match(r"no such column: (?:\w+\.)?(\w+)", msg)
    if m:
        names = sorted({c for cols in schema.values() for c, _ in cols})
        close = difflib.get_close_matches(m.group(1), names, 1, 0.6)
        tip = ("Did you mean %s?" % close[0]) if close else \
              "Text values go in single quotes: WHERE city = 'Lagos'."
    m = _re.match(r"no such table: (\w+)", msg)
    if m:
        close = difflib.get_close_matches(m.group(1), list(schema), 1, 0.6)
        tip = ("Did you mean %s?" % close[0]) if close else "Tables here: %s." % ", ".join(sorted(schema))
    m = _re.match(r'near "(.+?)": syntax error', msg)
    if m:
        close = difflib.get_close_matches(m.group(1).upper(), _SQL_WORDS, 1, 0.75)
        if close and close[0] != m.group(1).upper():
            tip = "Did you mean %s?" % close[0]
        else:
            tip = ("Look just before %s - often a missing comma, or clauses out of order. "
                   "The order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT." % m.group(1))
    if "incomplete input" in msg or "unrecognized token" in msg:
        tip = "The query stops part-way - is a quote or a bracket left open?"
    if "misuse of window function" in msg:
        tip = "A window function can't go in WHERE. Work it out in a subquery or WITH, then filter outside."
    if "misuse of aggregate" in msg:
        tip = "SUM, COUNT and friends can't go in WHERE - filter the groups with HAVING instead."
    if "ambiguous column name" in msg:
        tip = "More than one table has that column - say which, like cafe.city."
    head = ("Statement %d: " % statement) if statement else ""
    return head + msg + ("\n" + tip if tip else "")

def _sql_run(db, code):
    """Every statement in turn: a DataFrame for each that returns rows, a note for each that changes some."""
    import pandas as pd
    out = []
    stmts = _sql_split(code)
    for n, stmt in enumerate(stmts, 1):
        try:
            cur = db.execute(stmt)
            if cur.description:
                cols = [d[0] for d in cur.description]
                out.append(pd.DataFrame(cur.fetchall(), columns=cols))
            elif cur.rowcount >= 0:
                out.append("%d row%s changed." % (cur.rowcount, "" if cur.rowcount == 1 else "s"))
        except Exception as err:
            raise _SQLFailure(_sql_error(err, db, n if len(stmts) > 1 else 0))
    return out

def _sql_show(df, limit=20):
    if df is None:
        return "(no table)"
    if df.shape[1] == 0:
        return "(no columns)"
    if df.empty:
        return "(no rows)  columns: %s" % ", ".join(map(str, df.columns))
    head = df.head(limit)
    shown = head.astype(object).where(head.notna(), "NULL")
    n = len(df)
    foot = ("%d row%s" % (n, "" if n == 1 else "s")) if n <= limit else "first %d of %d rows" % (limit, n)
    return shown.to_string(index=False) + "\n(" + foot + ")"

def _exec_sql(code, ns):
    ns["_query"] = code
    ns["_result"] = None
    if not ns.get("_SQL_EXEC", True):       # practice: the judge runs it, against its own tables
        return
    shown = []
    for part in _sql_run(_sql_db(ns), code):
        if isinstance(part, str):
            shown.append(part)
        else:
            ns["_result"] = part
            shown.append(_sql_show(part))
    if shown:
        print("\n\n".join(shown))

def _sql_answer(tables, sql):
    frames = [r for r in _sql_run(_sql_load(tables), sql) if not isinstance(r, str)]
    return frames[-1] if frames else None

def _sql_expect(ns, ref, ordered=False):
    """Lesson check: the learner's last result must match what ref returns."""
    got = ns.get("_result")
    if got is None:
        raise AssertionError("No table came back yet - finish with a SELECT.")
    want = _sql_answer(_sql_tables(ns), ref)
    wcols, gcols = [str(c) for c in want.columns], [str(c) for c in got.columns]
    if sorted(c.lower() for c in gcols) != sorted(c.lower() for c in wcols):
        msg = "The columns should be %s - yours are %s." % (", ".join(wcols), ", ".join(gcols))
        if len(gcols) == len(wcols):
            msg += " AS names a column: SUM(revenue) AS revenue."
        raise AssertionError(msg)
    g, w = got.copy(), want.copy()
    g.columns = [c.lower() for c in gcols]
    w.columns = [c.lower() for c in wcols]
    g = g[list(w.columns)]
    if _compare(w, g, "frame_ordered" if ordered else "frame") is None:
        return True
    if len(g) != len(w):
        raise AssertionError("There should be %d row%s - yours has %d." % (len(w), "" if len(w) == 1 else "s", len(g)))
    if ordered and _compare(w, g, "frame") is None:
        raise AssertionError("Right rows, wrong order - check your ORDER BY.")
    raise AssertionError("Right shape, but some values differ - check the conditions and the rounding.")

def _sql_tables_shown(tables):
    return "\n\n".join("%s\n%s" % (name, _sql_show(_sql_ready(df), 10)) for name, df in tables.items())

def _sql_compare(expected, got, mode):
    e, g = expected.copy(), got.copy()
    e.columns = [str(c).lower() for c in e.columns]
    g.columns = [str(c).lower() for c in g.columns]
    return _compare(e, g, mode)

def _judge_sql(query, ref_sql, cases, mode="frame", reveal=False):
    """_judge for SQL: each case is a dict of tables, loaded into a fresh database."""
    total = len(cases)
    report = {"ok": False, "passed": 0, "total": total, "summary": "", "case": None,
              "mode": "run" if reveal else "submit"}
    if not _sql_code_left(query or ""):
        report["summary"] = "Write a query - one SELECT that returns the answer."
        return report
    for i, tables in enumerate(cases):
        label = "Example" if reveal else "Test %d of %d" % (i + 1, total)
        shown = _sql_tables_shown(tables)
        expected = _sql_answer(tables, ref_sql)
        try:
            got = _sql_answer(tables, query)
        except _SQLFailure as err:
            report["summary"] = "%s raised an SQL error: %s" % (label, str(err).split("\n")[0])
            report["case"] = {"n": i + 1, "input": shown, "expected": _sql_show(expected, 10), "got": str(err)}
            return report
        if got is None:
            report["summary"] = "%s failed - the query returned no table. Finish with a SELECT." % label
            report["case"] = {"n": i + 1, "input": shown, "expected": _sql_show(expected, 10), "got": "(no table)"}
            return report
        problem = _sql_compare(expected, got, mode)
        if problem or reveal:
            report["case"] = {"n": i + 1, "input": shown, "expected": _sql_show(expected, 10),
                              "got": _sql_show(got, 10)}
        if problem:
            report["summary"] = "%s failed - %s." % (label, problem)
            return report
        report["passed"] += 1
    report["ok"] = True
    report["summary"] = "Matches the expected output." if reveal else "All %d tests passed." % total
    return report

def _preview_sql(ref_sql, tables):
    return {"mode": "preview", "input": _sql_tables_shown(tables),
            "expected": _sql_show(_sql_answer(tables, ref_sql), 10)}

# ── SQL intellisense ──
# Same idea as Python's: the schema comes from the live namespace, so the
# real tables and columns are offered - and values too, inside a quote.

_SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS NULL", "IS NOT NULL", "LIKE",
                 "BETWEEN", "DISTINCT", "AS", "ON", "USING", "JOIN", "LEFT JOIN", "INNER JOIN", "CROSS JOIN",
                 "GROUP BY", "ORDER BY", "PARTITION BY", "HAVING", "LIMIT", "OFFSET", "ASC", "DESC",
                 "CASE", "WHEN", "THEN", "ELSE", "END", "WITH", "RECURSIVE", "UNION", "UNION ALL",
                 "INTERSECT", "EXCEPT", "OVER", "EXISTS", "NULL", "ROWS BETWEEN", "UNBOUNDED PRECEDING",
                 "CURRENT ROW", "PRECEDING", "FOLLOWING",
                 "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE"]

_SQL_FUNCS = {
    "COUNT": (["expr"], "How many rows. COUNT(*) counts every row; COUNT(col) skips NULLs."),
    "SUM": (["expr"], "Adds a column up, skipping NULLs."),
    "AVG": (["expr"], "The mean, skipping NULLs."),
    "MIN": (["expr"], "The smallest value."),
    "MAX": (["expr"], "The largest value."),
    "ROUND": (["x", "digits"], "Rounds x to that many decimal places."),
    "ABS": (["x"], "Drops the minus sign."),
    "UPPER": (["text"], "The text in capitals."),
    "LOWER": (["text"], "The text in lower case."),
    "LENGTH": (["text"], "How many characters."),
    "TRIM": (["text"], "Strips spaces from both ends."),
    "SUBSTR": (["text", "start", "length"], "Part of the text. start counts from 1."),
    "REPLACE": (["text", "find", "with"], "Swaps every find for with."),
    "INSTR": (["text", "find"], "Where find first appears, counting from 1; 0 if it never does."),
    "COALESCE": (["x", "fallback", "..."], "The first value that isn't NULL."),
    "IFNULL": (["x", "fallback"], "x, or fallback when x is NULL."),
    "NULLIF": (["x", "y"], "NULL when x equals y, otherwise x."),
    "CAST": (["x AS type"], "Converts x, like CAST(price AS INTEGER)."),
    "STRFTIME": (["format", "date"], "Formats a date: '%Y' year, '%m' month, '%d' day, '%Y-%m' year and month."),
    "DATE": (["date", "modifier"], "The date part. DATE(d, '+1 day') moves it on a day."),
    "JULIANDAY": (["date"], "A date as a number of days - subtract two to get the gap between them."),
    "GROUP_CONCAT": (["expr", "separator"], "Joins a group's values into one piece of text."),
    "ROW_NUMBER": ([], "1, 2, 3... through the window. Ties still get different numbers."),
    "RANK": ([], "Ties share a rank and the next one skips: 1, 1, 3."),
    "DENSE_RANK": ([], "Ties share a rank with no gap after: 1, 1, 2."),
    "LAG": (["expr", "offset", "default"], "The value from the row before, in the window's order."),
    "LEAD": (["expr", "offset", "default"], "The value from the row after, in the window's order."),
    "NTILE": (["n"], "Splits the window into n groups of about the same size."),
    "FIRST_VALUE": (["expr"], "The first value in the window."),
    "PRINTF": (["format", "..."], "Formats values as text, like PRINTF('%.1f', x)."),
}

_SQL_NOT_ALIAS = set("""WHERE JOIN LEFT RIGHT INNER OUTER CROSS FULL NATURAL ON USING GROUP ORDER
HAVING LIMIT UNION EXCEPT INTERSECT WINDOW AS SELECT FROM""".split())

def _sql_scan(text):
    """Lexer state at the end of text: open quote, open comment, open brackets, last semicolon."""
    i, n = 0, len(text)
    quote, qstart, comment, stack, semi = None, -1, None, [], -1
    while i < n:
        c = text[i]
        if comment == "line":
            if c == "\n":
                comment = None
        elif comment == "block":
            if text.startswith("*/", i):
                comment = None
                i += 1
        elif quote:
            if c == quote:
                if i + 1 < n and text[i + 1] == quote:     # '' is an escaped quote
                    i += 1
                else:
                    quote = None
        elif c in "'\"":
            quote, qstart = c, i
        elif text.startswith("--", i):
            comment = "line"
        elif text.startswith("/*", i):
            comment = "block"
            i += 1
        elif c == "(":
            stack.append(i)
        elif c == ")":
            if stack:
                stack.pop()
        elif c == ";":
            semi, stack = i, []
        i += 1
    return {"quote": quote, "qstart": qstart, "comment": comment, "stack": stack, "semi": semi}

def _sql_close(text, open_idx):
    depth, quote = 0, None
    for k in range(open_idx, len(text)):
        c = text[k]
        if quote:
            if c == quote:
                quote = None
        elif c in "'\"":
            quote = c
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return k
    return len(text)

def _sql_select_columns(body):
    """Output column names of SELECT a, b AS c FROM ... - for WITH and subqueries."""
    m = (_re.match(r"\s*SELECT\s+(?:DISTINCT\s+)?(.*?)\bFROM\b", body, _re.I | _re.S)
         or _re.match(r"\s*SELECT\s+(?:DISTINCT\s+)?(.*)$", body, _re.I | _re.S))
    if not m:
        return []
    items, depth, buf = [], 0, ""
    for c in m.group(1):
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
        if c == "," and depth == 0:
            items.append(buf)
            buf = ""
        else:
            buf += c
    items.append(buf)
    cols = []
    for item in items:
        a = (_re.search(r"\bAS\s+([A-Za-z_]\w*)\s*$", item.strip(), _re.I)
             or _re.search(r"(?:^|\.)([A-Za-z_]\w*)\s*$", item.strip()))
        if a and a.group(1).upper() != "END":
            cols.append(a.group(1))
    return cols

def _sql_scope(stmt, schema):
    """named: every table name and alias -> (table, columns). used: what the statement reads from."""
    defined, named, used = {}, {}, []
    for m in _re.finditer(r"\b([A-Za-z_]\w*)\s+AS\s*\(", stmt, _re.I):            # WITH name AS (...)
        body = stmt[m.end():_sql_close(stmt, m.end() - 1)]
        defined[m.group(1).lower()] = (None, [(c, "") for c in _sql_select_columns(body)])
    for m in _re.finditer(r"\b(?:FROM|JOIN)\s*\(", stmt, _re.I):                   # FROM (SELECT ...) x
        end = _sql_close(stmt, m.end() - 1)
        a = _re.match(r"\s*(?:AS\s+)?([A-Za-z_]\w*)", stmt[end + 1:], _re.I)
        if a and a.group(1).upper() not in _SQL_NOT_ALIAS:
            entry = (None, [(c, "") for c in _sql_select_columns(stmt[m.end():end])])
            named[a.group(1).lower()] = entry
            used.append(entry)
    lookup = {k.lower(): k for k in schema}
    for m in _re.finditer(r"\b(?:FROM|JOIN)\s+([A-Za-z_]\w*)(?:\s+(?:AS\s+)?([A-Za-z_]\w*))?", stmt, _re.I):
        name = m.group(1).lower()
        if name in lookup:
            entry = (lookup[name], schema[lookup[name]])
        elif name in defined:
            entry = defined[name]
        else:
            continue
        named[name] = entry
        used.append(entry)
        if m.group(2) and m.group(2).upper() not in _SQL_NOT_ALIAS:
            named[m.group(2).lower()] = entry
    return named, used, defined

def _sql_case(word, prefix):
    """Keywords come back in the case you're typing in."""
    return word.lower() if prefix and prefix == prefix.lower() else word

def _sql_col_items(entries, prefix, flag_shared=True):
    low = prefix.lower()
    found = {}
    for table, cols in entries:
        for col, typ in cols:
            if col.lower().startswith(low):
                found.setdefault(col, []).append((table, typ))
    items = []
    for col, where in found.items():
        tables = [t for t, _ in where if t]
        typ = next((t for _, t in where if t), "")
        if flag_shared and len(where) > 1:
            detail = "in %s - say which" % ", ".join(tables) if tables else "in more than one"
        else:
            detail = " · ".join(x for x in [", ".join(tables), typ] if x)
        item = {"label": col, "kind": "column", "detail": detail}
        if not _re.fullmatch(r"[A-Za-z_]\w*", col):
            item["insert"] = '"%s"' % col.replace('"', '""')
        items.append(item)
    return items

def _sql_signature(text, open_idx):
    m = _re.search(r"([A-Za-z_]\w*)\s*$", text[:open_idx])
    if not m:
        return None
    spec = _SQL_FUNCS.get(m.group(1).upper())
    if spec is None:
        return None
    params, doc = spec
    active = _arg_index(text[open_idx + 1:])
    if params and params[-1] == "..." and active >= len(params) - 1:
        active = len(params) - 1
    return {"name": m.group(1).upper(), "params": list(params), "more": False,
            "active": active if active < len(params) else -1, "doc": doc}

def _sql_values(result, text, qstart, named, used, ns):
    """Inside WHERE city = 'La - the values that column actually holds."""
    before, prefix = text[:qstart], text[qstart + 1:]
    m = _re.search(r"([A-Za-z_]\w*)(?:\.([A-Za-z_]\w*))?\s*(?:=|!=|<>|\bLIKE|\bIN\s*\((?:\s*'[^']*'\s*,)*)\s*$",
                   before, _re.I)
    if not m:
        return result
    qual, col = (m.group(1), m.group(2)) if m.group(2) else (None, m.group(1))
    frames = _sql_tables(ns)
    if qual:
        entry = named.get(qual.lower())
        tables = [entry[0]] if entry and entry[0] else []
    else:
        tables = [t for t, cols in used if t and any(c.lower() == col.lower() for c, _ in cols)] or list(frames)
    values = set()
    for t in tables:
        df = frames.get(t)
        if df is None:
            continue
        match = [c for c in df.columns if str(c).lower() == col.lower()]
        if match and df[match[0]].dtype == object:
            values.update(v for v in df[match[0]].dropna().unique()[:500] if isinstance(v, str) and "'" not in v)
    low = prefix.lower()
    items = [{"label": v, "kind": "value", "detail": col} for v in sorted(values) if v.lower().startswith(low)]
    if items:
        result.update(items=items[:40], replace=len(prefix), context="value", quote="'")
    return result

def _complete_sql(text, after, ns, force):
    result = {"items": [], "replace": 0, "signature": None, "context": "none"}
    st = _sql_scan(text)
    if st["comment"]:
        return result
    schema = _sql_schema(ns)
    before = text[st["semi"] + 1:]
    named, used, defined = _sql_scope(before + after.split(";")[0], schema)
    if st["stack"]:
        result["signature"] = _sql_signature(text, st["stack"][-1])
    if st["quote"] == "'":
        return _sql_values(result, text, st["qstart"], named, used, ns)
    if st["quote"]:
        return result

    m = _re.search(r"([A-Za-z_]\w*)\.(\w*)$", before)                  # alias.col
    if m:
        entry = named.get(m.group(1).lower())
        if entry:
            result.update(items=_sql_col_items([entry], m.group(2), False)[:60],
                          replace=len(m.group(2)), context="sql")
        return result

    m = _re.search(r"[A-Za-z_]\w*$", before)
    prefix = m.group(0) if m else ""
    head = before[:len(before) - len(prefix)]
    if head[-1:].isdigit() or _re.search(r"\bAS\s+$", head, _re.I):
        return result
    low = prefix.lower()

    if _re.search(r"\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+$", head, _re.I):     # a table goes here
        items = [{"label": name, "kind": "table",
                  "detail": ", ".join(c for c, _ in cols[:4]) + (", ..." if len(cols) > 4 else "")}
                 for name, cols in sorted(schema.items()) if name.lower().startswith(low)]
        items += [{"label": name, "kind": "table", "detail": "from WITH"}
                  for name in sorted(defined) if name.startswith(low) and name not in schema]
        result.update(items=items, replace=len(prefix), context="sql")
        return result

    if not prefix and not force:
        return result
    start = not head.strip()
    items = []
    if not start:
        if used:
            items += _sql_col_items(used, prefix)
        else:
            items += _sql_col_items(list(schema.items()), prefix, False)
        items += [{"label": _sql_case(name, prefix), "kind": "function",
                   "detail": "%s(%s)" % (name, ", ".join(params)), "doc": doc,
                   "call": True, "args": bool(params)}
                  for name, (params, doc) in _SQL_FUNCS.items() if name.lower().startswith(low)]
    for word in (["SELECT", "WITH"] if start else _SQL_KEYWORDS):
        if word.lower().startswith(low):
            items.append({"label": _sql_case(word, prefix), "kind": "keyword", "space": True})
    if not start:
        items += [{"label": name, "kind": "table", "detail": "table"}
                  for name in sorted(schema) if name.lower().startswith(low)]
    seen, unique = set(), []
    for item in items:
        if item["label"].lower() not in seen:
            seen.add(item["label"].lower())
            unique.append(item)
    result.update(items=unique[:60], replace=len(prefix), context="sql")
    return result

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

def _run(key, code, prelude, check, fresh, lang="python", rows=None):
    result = {"ok": True, "stdout": "", "error": "", "images": [], "check": None, "judge": None}
    buffer = io.StringIO()
    real_out, real_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buffer
    plt.close("all")
    try:
        ns = _namespace(key, prelude, fresh)
        if lang == "dax" and rows is not None:     # the Sandbox's matrix-rows picker; "" means none
            ns["_DAX_ROWS"] = rows or None
        try:
            if lang == "sql":
                _exec_sql(code, ns)
            elif lang == "dax":
                _dax_exec(code, ns)             # defined by js/dax.py, loaded on first use
            else:
                _exec_cell(code, ns)
        except _SQLFailure as err:
            result["ok"] = False
            result["error"] = str(err)
        except Exception:
            result["ok"] = False
            result["error"] = _friendly_error()
        if lang == "dax" and result["ok"] and isinstance(ns.get("_dax_blocks"), list):
            result["blocks"] = ns["_dax_blocks"]     # drawn as real tables; stdout keeps the text

        # Checks run while the figures are still open, so they can inspect them.
        if result["ok"] and check:
            ns["_axes"] = _axes
            ns["_labels"] = _labels
            ns["_judge"] = _judge
            ns["_preview"] = _preview
            ns["_judge_sql"] = _judge_sql
            ns["_preview_sql"] = _preview_sql
            ns["_same_as"] = lambda ref, ordered=False: _sql_expect(ns, ref, ordered)
            if "_dax_expect" in globals():      # only once js/dax.py has loaded
                ns["_dax_expect"] = lambda *a, **k: _dax_expect(ns, *a, **k)
                ns["_judge_dax"] = lambda *a, **k: _judge_dax(ns, *a, **k)
                ns["_preview_dax"] = lambda *a, **k: _preview_dax(ns, *a, **k)
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

def _load_csv(key, prelude, name, text):
    """A CSV the learner picked, as a DataFrame in that workspace (the Sandbox).
    The delimiter is sniffed; text columns that look like ISO dates become
    dates, so resample, strftime and DAX's calendar all work on them."""
    import keyword
    import pandas as pd
    if not name.isidentifier() or keyword.iskeyword(name):
        name = "data"
    ns = _namespace(key, prelude, False)
    # Guess the delimiter among the real ones only. Left to guess freely, a
    # one-column file ("name", "Ada") had the letter n picked as the separator
    # and came back as nonsense columns, with no error.
    import csv
    try:
        sep = csv.Sniffer().sniff(text[:20000], delimiters=",;\t|").delimiter
    except csv.Error:
        sep = ","
    try:
        df = pd.read_csv(io.StringIO(text), sep=sep)
    except Exception as err:
        return json.dumps({"ok": False, "error": "That file couldn't be read as a CSV: {}".format(err)})
    df.columns = [str(c).strip() for c in df.columns]
    for c in df.columns:
        if df[c].dtype == object:
            sample = df[c].dropna().astype(str).head(25)
            if len(sample) and sample.str.match(r"\d{4}-\d{2}-\d{2}").all():
                try:
                    df[c] = pd.to_datetime(df[c])
                except Exception:
                    pass
    ns[name] = df
    return json.dumps({"ok": True, "name": name, "rows": int(len(df)), "cols": [str(c) for c in df.columns]})
`;

/* ── Boot ────────────────────────────────────────────────── */

async function loadRuntime() {
  let lastError = null;

  for (const version of PYODIDE_VERSIONS) {
    const indexURL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
    try {
      status('Fetching the engine…', 8);   // the same one runs Python and SQL
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
  completePy = pyodide.globals.get('_complete');

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

  // A CSV the learner picked, into a workspace as a DataFrame.
  if (msg.type === 'load') {
    if (!runPy) {
      post({ type: 'result', id: msg.id, ok: false, error: 'Python is still starting up.' });
      return;
    }
    try {
      const loadCsv = pyodide.globals.get('_load_csv');
      const raw = loadCsv(msg.key || 'default', msg.prelude || '', msg.name || 'data', msg.text || '');
      loadCsv.destroy();
      post({ type: 'result', id: msg.id, ...JSON.parse(raw) });
    } catch (err) {
      post({ type: 'result', id: msg.id, ok: false, error: String(err && err.message ? err.message : err) });
    }
    return;
  }

  // Fetch packages without running anything - so a timed run never pays for a download.
  if (msg.type === 'ensure') {
    const ok = pyodide ? await ensurePackages(msg.needs || [], msg.id) : false;
    post({ type: 'result', id: msg.id, ok });
    return;
  }

  if (msg.type === 'complete') {
    if (!completePy) {
      post({ type: 'result', id: msg.id, items: [], signature: null });
      return;
    }
    if (msg.lang === 'dax') {
      try {
        await ensureDax();
      } catch (err) {
        post({ type: 'result', id: msg.id, items: [], signature: null });
        return;
      }
    }
    try {
      const raw = completePy(msg.key || 'default', msg.prelude || '', msg.text || '', msg.bind || '', !!msg.force,
                             msg.lang || 'python', msg.after || '');
      post({ type: 'result', id: msg.id, ...JSON.parse(raw) });
    } catch (err) {
      post({ type: 'result', id: msg.id, items: [], signature: null, error: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (msg.type === 'run') {
    if (!runPy) {
      post({ type: 'result', id: msg.id, ok: false, stdout: '', error: 'Python is still starting up.', images: [], check: null });
      return;
    }
    if (msg.lang === 'dax') {
      try {
        await ensureDax();
      } catch (err) {
        post({ type: 'result', id: msg.id, ok: false, stdout: '', images: [], check: null,
               error: String(err && err.message ? err.message : err) });
        return;
      }
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
        msg.fresh !== false,
        msg.lang || 'python',
        // undefined, not null: Pyodide turns JS null into jsnull, which isn't None,
        // and a lesson's own _DAX_ROWS would be wiped
        msg.rows === null ? undefined : msg.rows
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
