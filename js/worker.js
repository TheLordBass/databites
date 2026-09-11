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

def _complete(key, prelude, text, bind, force):
    try:
        ns = _completion_ns(key, prelude, bind)
        ns.update(_assigned(text, ns))
        return json.dumps(_complete_in(text, ns, bool(force)), default=str)
    except Exception as err:
        return json.dumps({"items": [], "replace": 0, "signature": None, "context": "none",
                           "error": "%s: %s" % (type(err).__name__, err)})

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

  if (msg.type === 'complete') {
    if (!completePy) {
      post({ type: 'result', id: msg.id, items: [], signature: null });
      return;
    }
    try {
      const raw = completePy(msg.key || 'default', msg.prelude || '', msg.text || '', msg.bind || '', !!msg.force);
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
