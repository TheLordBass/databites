"""A small DAX engine, for learning.

Measures, filter context, row context and context transition, evaluated over
pandas DataFrames with one-directional relationships (the lookup side filters
the data side, as in a default Power BI model). It covers the part of DAX a
learner meets first, and aims to give the same answers as Power BI for it.
It is not Microsoft's engine, and does not try to be all of DAX.

Loaded into the Python worker the first time anything DAX runs.
"""

import re as _dre
import math as _dmath
import datetime as _ddt

import numpy as _dnp
import pandas as _dpd


class DaxError(Exception):
    """A mistake in the learner's DAX, already worded for them."""


# ── Tokens ──────────────────────────────────────────────────────────

_TOKEN_RE = _dre.compile(r"""
    (?P<ws>[ \t\r]+)
  | (?P<nl>\n)
  | (?P<comment>--[^\n]*|//[^\n]*|/\*.*?\*/)
  | (?P<num>\d+\.\d*|\.\d+|\d+)
  | (?P<str>"(?:[^"]|"")*")
  | (?P<qtable>'(?:[^']|'')*')
  | (?P<bracket>\[(?:[^\]]|\]\])*\])
  | (?P<op>:=|&&|\|\||<=|>=|<>|==|[=<>+\-*/^&,(){}%])
  | (?P<ident>[A-Za-z_][A-Za-z0-9_.]*)
""", _dre.S | _dre.X)

# Phone keyboards type curly quotes. One character for one, so positions hold.
_STRAIGHT = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'"})


class Tok:
    __slots__ = ("kind", "text", "value", "line", "col", "first", "pos")

    def __init__(self, kind, text, value, line, col, first, pos=0):
        self.kind, self.text, self.value = kind, text, value
        self.line, self.col, self.first, self.pos = line, col, first, pos

    def is_op(self, *ops):
        return self.kind == "op" and self.text in ops

    def is_word(self, *words):
        return self.kind == "ident" and self.text.upper() in words

    def __repr__(self):
        return "%s(%r)" % (self.kind, self.text)


def tokenize(src):
    src = src.translate(_STRAIGHT)
    toks, pos, line, line_start, first = [], 0, 1, 0, True
    while pos < len(src):
        m = _TOKEN_RE.match(src, pos)
        if not m:
            ch = src[pos]
            if ch in "\"'[":
                raise DaxError("Line %d: a %s is opened but never closed." % (
                    line, {"\"": "double quote", "'": "single quote", "[": "square bracket"}[ch]))
            raise DaxError("Line %d: I don't understand %r." % (line, src[pos:pos + 10]))
        kind, text = m.lastgroup, m.group(m.lastgroup)
        if kind == "nl":
            line, line_start, first = line + 1, m.end(), True
        elif kind == "comment":
            if "\n" in text:
                line += text.count("\n")
                line_start = m.start() + text.rfind("\n") + 1
        elif kind != "ws":
            if kind == "num":
                value = int(text) if text.isdigit() else float(text)
            elif kind == "str":
                value = text[1:-1].replace('""', '"')
            elif kind == "qtable":
                value = text[1:-1].replace("''", "'")
            elif kind == "bracket":
                value = text[1:-1].replace("]]", "]")
            else:
                value = text
            toks.append(Tok(kind, text, value, line, m.start() - line_start, first, m.start()))
            first = False
        pos = m.end()
    return toks


# ── Expressions ─────────────────────────────────────────────────────
# Nodes are tuples:
#   ("num", v) ("str", s) ("bool", b) ("blank",)
#   ("ref", table_or_None, name)   Table[Column], 'Table'[Column], [Measure] or [Column]
#   ("table", name)                a quoted table name
#   ("name", ident)                a bare word: a VAR, or a table
#   ("call", FNAME, [args], line)
#   ("bin", op, a, b) ("neg", a) ("not", a) ("in", a, b) ("ctor", [items])
#   ("var", [(name, expr), ...], body)

class Parser:
    def __init__(self, toks):
        self.t, self.i = toks, 0

    def peek(self, k=0):
        j = self.i + k
        return self.t[j] if j < len(self.t) else None

    def take(self):
        tok = self.peek()
        if tok is None:
            last = self.t[-1].line if self.t else 1
            raise DaxError("Line %d: the expression stops part-way — is something missing at the end?" % last)
        self.i += 1
        return tok

    def at_op(self, *ops):
        tok = self.peek()
        return tok is not None and tok.is_op(*ops)

    def at_word(self, *words):
        tok = self.peek()
        return tok is not None and tok.is_word(*words)

    def expect_op(self, op, what=""):
        tok = self.peek()
        if tok is None or not tok.is_op(op):
            where = ("line %d" % tok.line) if tok else "the end"
            found = repr(tok.text) if tok else "nothing"
            raise DaxError("Expected %s%s at %s, but found %s." % (op, (" " + what) if what else "", where, found))
        self.i += 1
        return tok

    def done(self):
        tok = self.peek()
        if tok is not None:
            raise DaxError("Line %d: I didn't expect %r here — is an operator or a comma missing before it?"
                           % (tok.line, tok.text))

    # precedence, loosest first: VAR, ||, &&, NOT, comparisons and IN, &, + -, * /, unary, ^
    def expr(self):
        if self.at_word("VAR"):
            return self.var_block()
        return self.or_()

    def var_block(self):
        binds = []
        while self.at_word("VAR"):
            self.take()
            name = self.take()
            if name.kind != "ident":
                raise DaxError("Line %d: VAR needs a plain name, like VAR total = SUM(...)." % name.line)
            self.expect_op("=", "after VAR " + name.value)
            binds.append((name.value, self.expr()))
        if not self.at_word("RETURN"):
            tok = self.peek()
            raise DaxError("Line %s: a VAR block ends with RETURN, then the result." % (tok.line if tok else "?"))
        self.take()
        return ("var", binds, self.expr())

    def or_(self):
        node = self.and_()
        while self.at_op("||"):
            self.take()
            node = ("bin", "||", node, self.and_())
        return node

    def and_(self):
        node = self.not_()
        while self.at_op("&&"):
            self.take()
            node = ("bin", "&&", node, self.not_())
        return node

    def not_(self):
        nxt = self.peek(1)
        if self.at_word("NOT") and not (nxt is not None and nxt.is_op("(")):
            self.take()
            return ("not", self.not_())
        return self.cmp()

    def cmp(self):
        node = self.concat()
        while True:
            if self.at_op("=", "==", "<>", "<", ">", "<=", ">="):
                op = self.take().text
                node = ("bin", op, node, self.concat())
            elif self.at_word("IN"):
                self.take()
                node = ("in", node, self.concat())
            else:
                return node

    def concat(self):
        node = self.add()
        while self.at_op("&"):
            self.take()
            node = ("bin", "&", node, self.add())
        return node

    def add(self):
        node = self.mul()
        while self.at_op("+", "-"):
            op = self.take().text
            node = ("bin", op, node, self.mul())
        return node

    def mul(self):
        node = self.unary()
        while self.at_op("*", "/"):
            op = self.take().text
            node = ("bin", op, node, self.unary())
        return node

    def unary(self):
        if self.at_op("-"):
            self.take()
            return ("neg", self.unary())
        if self.at_op("+"):
            self.take()
            return self.unary()
        return self.power()

    def power(self):
        node = self.primary()
        if self.at_op("^"):
            self.take()
            node = ("bin", "^", node, self.unary())
        return node

    def primary(self):
        tok = self.take()
        if tok.kind == "num":
            return ("num", tok.value)
        if tok.kind == "str":
            return ("str", tok.value)
        if tok.kind == "bracket":
            return ("ref", None, tok.value)
        if tok.kind == "qtable":
            if self.peek() is not None and self.peek().kind == "bracket":
                return ("ref", tok.value, self.take().value)
            return ("table", tok.value)
        if tok.is_op("("):
            node = self.expr()
            self.expect_op(")", "to close the bracket")
            return node
        if tok.is_op("{"):
            items = []
            if not self.at_op("}"):
                while True:
                    items.append(self.expr())
                    if not self.at_op(","):
                        break
                    self.take()
            self.expect_op("}", "to close the list")
            return ("ctor", items)
        if tok.kind == "ident":
            nxt = self.peek()
            if nxt is not None and nxt.is_op("("):
                return self.call(tok)
            if nxt is not None and nxt.kind == "bracket":
                self.take()
                return ("ref", tok.value, nxt.value)
            up = tok.value.upper()
            if up in ("TRUE", "FALSE"):
                return ("bool", up == "TRUE")
            if up == "BLANK":
                return ("blank",)
            return ("name", tok.value)
        raise DaxError("Line %d: I didn't expect %r here." % (tok.line, tok.text))

    def call(self, tok):
        self.take()                                          # the (
        args = []
        if not self.at_op(")"):
            while True:
                args.append(self.expr())
                if not self.at_op(","):
                    break
                self.take()
        if not self.at_op(")"):
            nxt = self.peek()
            raise DaxError("Line %d: %s( needs a closing bracket, or a comma between its arguments%s."
                           % (tok.line, tok.value.upper(),
                              (" — I found %r" % nxt.text) if nxt is not None else ""))
        self.take()
        return ("call", tok.value.upper(), args, tok.line)


def parse_expr(src):
    p = Parser(tokenize(src))
    node = p.expr()
    p.done()
    return node


# ── Scripts: measures and queries ───────────────────────────────────
# A script is what the learner types: measure definitions, each starting at
# the left edge of a line ("Total Sales = ..." or "[Total Sales] := ..."),
# optionally followed by EVALUATE queries. Indented lines continue the
# statement above them.

def _keyword_at(toks, i):
    """Does a query keyword start here? ORDER only counts before BY, so a
    measure called "Order Count" stays a measure."""
    t = toks[i]
    if t.is_word("EVALUATE", "DEFINE", "MEASURE"):
        return True
    return t.is_word("ORDER") and i + 1 < len(toks) and toks[i + 1].is_word("BY")


def _name_end(toks, i):
    """If a measure name starts at toks[i] — [Name], or words like
    Sales 2024 or Margin % — the index of its = sign, else None."""
    t = toks[i]
    if t.kind == "bracket":
        j = i + 1
    elif t.kind == "ident":
        j = i + 1
        while j < len(toks) and toks[j].line == t.line and (toks[j].kind in ("ident", "num") or toks[j].is_op("%")):
            j += 1
    else:
        return None
    if j < len(toks) and toks[j].is_op("=", ":=") and toks[j].line == t.line:
        return j
    return None


def _is_head(toks, i):
    t = toks[i]
    if not t.first:
        return False
    if _keyword_at(toks, i):
        return True
    if t.col != 0 or t.is_word("VAR", "RETURN"):
        return False
    return _name_end(toks, i) is not None


def parse_script(src):
    """[("measure", name, ast, line) | ("evaluate", ast, line) | ("expr", ast, line)]"""
    toks = tokenize(src)
    if not toks:
        return []
    starts, depth = [], 0
    for i, t in enumerate(toks):
        if depth == 0 and _is_head(toks, i):
            starts.append(i)
        if t.is_op("(", "{"):
            depth += 1
        elif t.is_op(")", "}"):
            depth = max(0, depth - 1)
    if not starts or starts[0] != 0:
        starts = [0] + starts
    out = []
    for n, s in enumerate(starts):
        chunk = toks[s:starts[n + 1] if n + 1 < len(starts) else len(toks)]
        head = chunk[0]
        if head.is_word("DEFINE"):
            if len(chunk) > 1:
                raise DaxError("Line %d: after DEFINE, start each measure on its own line with MEASURE." % head.line)
            continue
        if head.is_word("ORDER") and _keyword_at(chunk, 0):
            continue                                        # ORDER BY: results are shown as computed
        if head.is_word("EVALUATE"):
            p = Parser(chunk[1:])
            node = p.expr()
            p.done()
            out.append(("evaluate", node, head.line))
            continue
        if head.is_word("MEASURE"):
            body = chunk[1:]
            if body and body[0].kind in ("ident", "qtable") and len(body) > 1 and body[1].kind == "bracket":
                body = body[1:]
            if not body or body[0].kind != "bracket" or len(body) < 2 or not body[1].is_op("=", ":="):
                raise DaxError("Line %d: write MEASURE Table[Name] = the expression." % head.line)
            p = Parser(body[2:])
            node = p.expr()
            p.done()
            out.append(("measure", body[0].value, node, head.line))
            continue
        if _is_head(chunk, 0):
            k = _name_end(chunk, 0)
            if chunk[0].kind == "bracket":
                name = chunk[0].value
            else:                                           # as typed, so [Margin%] finds Margin%
                name = " ".join(src.translate(_STRAIGHT)[chunk[0].pos:chunk[k].pos].split())
            p = Parser(chunk[k + 1:])
            if p.peek() is None:
                raise DaxError("Line %d: %s = needs an expression after the equals sign." % (head.line, name))
            node = p.expr()
            p.done()
            out.append(("measure", name, node, head.line))
        else:
            p = Parser(chunk)
            node = p.expr()
            p.done()
            out.append(("expr", node, head.line))
    return out

# ── The model ───────────────────────────────────────────────────────

def _close(word, options):
    import difflib
    hit = difflib.get_close_matches(str(word).lower(), [o.lower() for o in options], 1, 0.6)
    if not hit:
        return None
    return next(o for o in options if o.lower() == hit[0])


class Model:
    """Tables, and the relationships between them. Every relationship is
    many-to-one, and filters flow one way: from the lookup side (customers,
    products, calendar) to the data side (orders, order_items) — never back."""

    def __init__(self, tables, relationships):
        self.tables = {name: df.reset_index(drop=True) for name, df in tables.items()}
        self.names = {name.lower(): name for name in self.tables}
        self.cols = {name: {str(c).lower(): str(c) for c in df.columns} for name, df in self.tables.items()}
        # (many table, foreign key, one table, key)
        self.rels = [r for r in relationships if r[0] in self.tables and r[2] in self.tables]
        self.up = {}
        for many, fk, one, pk in self.rels:
            self.up.setdefault(many, []).append((fk, one, pk))
        # The date table, as Power BI's "Mark as date table": a filter on its
        # date column clears every other filter on the table (see CALCULATE).
        self.date_key = ("calendar", "date") if "calendar" in self.tables else None

    def table(self, name):
        real = self.names.get(str(name).lower())
        if real is None:
            close = _close(name, list(self.tables))
            raise DaxError("There's no table called %s. %s" % (
                name, ("Did you mean %s?" % close) if close else "The tables are: %s." % ", ".join(sorted(self.tables))))
        return real

    def column(self, table, name):
        real = self.cols[table].get(str(name).lower())
        if real is None:
            close = _close(name, list(self.cols[table].values()))
            raise DaxError("%s has no column called [%s].%s" % (
                table, name, (" Did you mean %s[%s]?" % (table, close)) if close else ""))
        return real

    def ancestors(self, table):
        """Every table this one looks up, directly or through another."""
        out, todo = [], [table]
        while todo:
            for _, one, _ in self.up.get(todo.pop(), []):
                if one not in out:
                    out.append(one)
                    todo.append(one)
        return out

    def path(self, start, target):
        """The many-to-one steps from start up to target, for RELATED."""
        todo, seen = [(start, [])], {start}
        while todo:
            table, steps = todo.pop(0)
            if table == target:
                return steps
            for fk, one, pk in self.up.get(table, []):
                if one not in seen:
                    seen.add(one)
                    todo.append((one, steps + [(table, fk, one, pk)]))
        return None


# ── Values ──────────────────────────────────────────────────────────
# Scalars are plain Python: int/float, str, bool, pandas Timestamp — and None
# for BLANK. Tables are TableVal.

def _py(v):
    """A cell as a plain Python scalar, with every kind of missing as BLANK."""
    if v is None:
        return None
    if isinstance(v, float) and _dmath.isnan(v):
        return None
    if v is _dpd.NaT:
        return None
    try:
        if _dpd.isna(v):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(v, _dnp.generic):
        v = v.item()
    if isinstance(v, _ddt.datetime) and not isinstance(v, _dpd.Timestamp):
        v = _dpd.Timestamp(v)
    return v


class TableVal:
    """A table. Either some rows of a model table (base + row numbers), or a
    free-standing frame whose columns are keyed (table, column) — table is
    None for named columns like the ones SUMMARIZECOLUMNS adds."""

    def __init__(self, base=None, idx=None, frame=None, keys=None):
        self.base, self.idx = base, idx
        self.frame, self.keys = frame, keys

    def __len__(self):
        return len(self.idx) if self.base is not None else len(self.frame)

    def first_column(self, model):
        if self.base is not None:
            df = model.tables[self.base]
            return [_py(v) for v in df.iloc[self.idx, 0]]
        return [_py(v) for v in self.frame.iloc[:, 0]]


def _eq_mask(series, value):
    if value is None:
        return series.isna().to_numpy()
    return (series == value).fillna(False).to_numpy(dtype=bool)


# ── Filter context ──────────────────────────────────────────────────

class Ctx:
    """The filter context (which rows each table shows), plus the row context
    and VARs of the moment. Treated as immutable: changes make a new Ctx."""
    __slots__ = ("model", "filters", "rows", "vals", "vars", "_vis")

    def __init__(self, model, filters=(), rows=None, vals=None, vars=None):
        self.model = model
        self.filters = tuple(filters)        # (table, columns or None for whole rows, mask)
        self.rows = rows or {}               # table -> row number     (iterating a model table)
        self.vals = vals or {}               # (table, column) -> value (iterating column values)
        self.vars = vars or {}               # lower-case VAR name -> value
        self._vis = {}

    def derive(self, filters=None, rows=None, vals=None, vars=None):
        return Ctx(self.model,
                   self.filters if filters is None else filters,
                   self.rows if rows is None else rows,
                   self.vals if vals is None else vals,
                   self.vars if vars is None else vars)

    def constrained(self, table, _seen=None):
        """Is anything filtering this table — directly, or through its lookups?"""
        if any(t == table for t, _, _ in self.filters):
            return True
        seen = _seen or {table}
        for _, one, _ in self.model.up.get(table, []):
            if one not in seen:
                seen.add(one)
                if self.constrained(one, seen):
                    return True
        return False

    def visible(self, table):
        """Mask of the rows of table that the filter context lets through."""
        if table in self._vis:
            return self._vis[table]
        df = self.model.tables[table]
        mask = _dnp.ones(len(df), dtype=bool)
        for t, _, m in self.filters:
            if t == table:
                mask &= m
        for fk, one, pk in self.model.up.get(table, []):
            if self.constrained(one):
                keys = self.model.tables[one].loc[self.visible(one), pk]
                mask &= df[fk].isin(keys).to_numpy(dtype=bool)
        self._vis[table] = mask
        return mask

    def without(self, table, cols=None):
        """The filters, minus those on table — or, given cols, minus the
        column filters on those columns (whole-row filters stay)."""
        keep = []
        for t, c, m in self.filters:
            if t == table and (cols is None or (c is not None and set(c) & set(cols))):
                continue
            keep.append((t, c, m))
        return keep

    def transition(self):
        """Context transition: the current row becomes a filter, as happens
        whenever a measure (or CALCULATE) runs inside an iterator."""
        if not self.rows and not self.vals:
            return self
        filters = list(self.filters)
        for t, i in self.rows.items():
            filters = [f for f in filters if f[0] != t]
            m = _dnp.zeros(len(self.model.tables[t]), dtype=bool)
            m[i] = True
            filters.append((t, None, m))
        for (t, c), v in self.vals.items():
            if t is None:
                continue
            filters = [f for f in filters if not (f[0] == t and f[1] is not None and c in f[1])]
            filters.append((t, (c,), _eq_mask(self.model.tables[t][c], v)))
        return Ctx(self.model, filters, {}, {}, self.vars)


# ── Scalar rules: BLANK, truth, text, comparison ────────────────────

def _is_date(v):
    return isinstance(v, (_dpd.Timestamp, _ddt.date))


def _num(v, what="a number"):
    if v is None:
        return 0
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int, float)):
        return v
    if _is_date(v):
        return _dpd.Timestamp(v).toordinal() - 693594          # days, like Excel/DAX serial dates
    if isinstance(v, str):
        try:
            return float(v) if "." in v else int(v)
        except ValueError:
            raise DaxError('"%s" is text, and I need %s here.' % (v, what))
    raise DaxError("I need %s here." % what)


def _truthy(v):
    if v is None:
        return False
    if isinstance(v, str):
        raise DaxError('"%s" is text — a condition needs TRUE or FALSE, like [x] > 10.' % v)
    return bool(_num(v))


def _text(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    if isinstance(v, _dpd.Timestamp):
        return v.strftime("%Y-%m-%d") if v == v.normalize() else v.strftime("%Y-%m-%d %H:%M")
    return str(v)


def _compare(op, x, y):
    if op == "==":
        return x is None and y is None or (x is not None and y is not None and x == y)
    if x is None and y is None:
        return op in ("=", "<=", ">=")
    if x is None:
        x = "" if isinstance(y, str) else (y.__class__(0) if isinstance(y, (int, float)) else None)
    if y is None:
        y = "" if isinstance(x, str) else (x.__class__(0) if isinstance(x, (int, float)) else None)
    if x is None or y is None:                                  # a date against BLANK: BLANK is day 0
        x, y = (0 if x is None else _num(x)), (0 if y is None else _num(y))
    if isinstance(x, str) != isinstance(y, str):
        raise DaxError('Comparing text with a number — %r and %r. Put text in double quotes on both sides, or compare numbers.' % (x, y))
    if isinstance(x, str):
        x, y = x.lower(), y.lower()                             # DAX compares text without caring about case
    if _is_date(x) or _is_date(y):
        x, y = _num(x), _num(y)
    return {"=": x == y, "<>": x != y, "<": x < y, ">": x > y, "<=": x <= y, ">=": x >= y}[op]


def _arith(op, x, y):
    if x is None and y is None:
        return None
    if op == "+" and (_is_date(x) or _is_date(y)):
        d, n = (x, y) if _is_date(x) else (y, x)
        return _dpd.Timestamp(d) + _dpd.Timedelta(days=_num(n))
    if op == "-" and _is_date(x) and _is_date(y):
        return (_dpd.Timestamp(x) - _dpd.Timestamp(y)).days
    if op == "-" and _is_date(x):
        return _dpd.Timestamp(x) - _dpd.Timedelta(days=_num(y))
    a, b = _num(x, "a number to calculate with"), _num(y, "a number to calculate with")
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if op == "^":
        return a ** b
    if b == 0:                                                  # DAX: x/0 is infinity, 0/0 is NaN
        return float("nan") if a == 0 else (float("inf") if a > 0 else float("-inf"))
    return a / b


# ── The evaluator ───────────────────────────────────────────────────

class Engine:
    def __init__(self, model, measures=None):
        self.model = model
        self.measures = {}                                      # lower name -> (name, ast)
        for name, ast in (measures or {}).items():
            self.measures[name.lower()] = (name, ast)
        self.depth = 0

    def root(self):
        return Ctx(self.model)

    def measure(self, name, ctx):
        key = name.lower()
        if key not in self.measures:
            close = _close(name, [n for n, _ in self.measures.values()])
            raise DaxError("There's no measure called [%s].%s" % (name, (" Did you mean [%s]?" % close) if close else ""))
        self.depth += 1
        if self.depth > 40:
            raise DaxError("Your measures refer to each other in a circle — [%s] ends up needing itself." % name)
        try:
            c = ctx.transition()
            return self.eval(self.measures[key][1], Ctx(self.model, c.filters))   # a measure sees no row context, no VARs
        finally:
            self.depth -= 1

    def base(self, table, ctx):
        return TableVal(base=table, idx=_dnp.flatnonzero(ctx.visible(table)))

    def cell(self, table, col, i):
        return _py(self.model.tables[table].at[i, col])

    def scalar(self, node, ctx):
        v = self.eval(node, ctx)
        if isinstance(v, TableVal):
            if len(v) == 1:
                vals = v.first_column(self.model)
                width = len(self.model.cols[v.base]) if v.base is not None else v.frame.shape[1]
                if width == 1:
                    return vals[0]
            raise DaxError("That gives a table, and a single value is needed here. Wrap it in something that "
                           "makes one number, like COUNTROWS(...), or SUMX(table, expression).")
        return v

    def table_of(self, node, ctx, fname="this function"):
        v = self.eval(node, ctx)
        if not isinstance(v, TableVal):
            raise DaxError("%s needs a table here — like orders, FILTER(orders, ...) or ALL(products)." % fname)
        return v

    def ref(self, table, name, ctx):
        if table is None:
            if name.lower() in self.measures:
                return self.measure(name, ctx)
            for t, i in ctx.rows.items():
                if name.lower() in self.model.cols[t]:
                    return self.cell(t, self.model.column(t, name), i)
            for (t, c), v in ctx.vals.items():
                if c.lower() == name.lower():
                    return v
            close = _close(name, [n for n, _ in self.measures.values()])
            raise DaxError("[%s] isn't a measure I know.%s For a column, say which table: Table[%s]." % (
                name, (" Did you mean [%s]?" % close) if close else "", name))
        real = self.model.table(table)
        if name.lower() not in self.model.cols[real] and name.lower() in self.measures:
            return self.measure(name, ctx)
        col = self.model.column(real, name)
        if real in ctx.rows:
            return self.cell(real, col, ctx.rows[real])
        if (real, col) in ctx.vals:
            return ctx.vals[(real, col)]
        raise DaxError("%s[%s] on its own needs a row to read from. In a measure, wrap it in an aggregation "
                       "like SUM(%s[%s]) — or go row by row with SUMX." % (real, col, real, col))

    def eval(self, node, ctx):
        kind = node[0]
        if kind in ("num", "str", "bool"):
            return node[1]
        if kind == "blank":
            return None
        if kind == "ref":
            return self.ref(node[1], node[2], ctx)
        if kind == "table":
            return self.base(self.model.table(node[1]), ctx)
        if kind == "name":
            key = node[1].lower()
            if key in ctx.vars:
                return ctx.vars[key]
            if key in self.model.names:
                return self.base(self.model.table(node[1]), ctx)
            if node[1].upper() in FUNCS:
                raise DaxError("%s is a function, so it needs brackets: %s(...)." % (node[1].upper(), node[1].upper()))
            raise DaxError("I don't know what %s is. It isn't a VAR, and the tables are %s." % (
                node[1], ", ".join(sorted(self.model.tables))))
        if kind == "call":
            return call(self, node, ctx)
        if kind == "bin":
            op = node[1]
            if op == "&&":
                return _truthy(self.scalar(node[2], ctx)) and _truthy(self.scalar(node[3], ctx))
            if op == "||":
                return _truthy(self.scalar(node[2], ctx)) or _truthy(self.scalar(node[3], ctx))
            x, y = self.scalar(node[2], ctx), self.scalar(node[3], ctx)
            if op == "&":
                return _text(x) + _text(y)
            if op in ("=", "==", "<>", "<", ">", "<=", ">="):
                return _compare(op, x, y)
            return _arith(op, x, y)
        if kind == "neg":
            v = self.scalar(node[1], ctx)
            return None if v is None else -_num(v)
        if kind == "not":
            return not _truthy(self.scalar(node[1], ctx))
        if kind == "in":
            x = self.scalar(node[1], ctx)
            options = self.table_of(node[2], ctx, "IN").first_column(self.model)
            return any(_compare("=", x, o) for o in options)
        if kind == "ctor":
            vals = [self.scalar(e, ctx) for e in node[1]]
            return TableVal(frame=_dpd.DataFrame({"Value": vals}), keys=[(None, "Value")])
        if kind == "var":
            scope = dict(ctx.vars)
            for name, e in node[1]:
                scope[name.lower()] = self.eval(e, ctx.derive(vars=scope))
            return self.eval(node[2], ctx.derive(vars=scope))
        raise DaxError("Something in that expression isn't supported yet.")

# ── Functions ───────────────────────────────────────────────────────
# Each gets the engine, the argument nodes (unevaluated — IF and CALCULATE
# must control when, and in which context, their arguments run) and the ctx.

FUNCS = {}


def _fn(*names, args=None):
    """Register a function. args=(fewest, most) is checked before it runs."""
    def wrap(f):
        for name in names:
            FUNCS[name] = (f, args)
        return f
    return wrap


def call(engine, node, ctx):
    _, name, args, line = node
    entry = FUNCS.get(name)
    if entry is None:
        close = _close(name, list(FUNCS))
        raise DaxError("Line %d: I don't know the function %s.%s" % (
            line, name, (" Did you mean %s?" % close) if close else ""))
    f, arity = entry
    if arity is not None:
        lo, hi = arity
        if len(args) < lo or (hi is not None and len(args) > hi):
            want = ("exactly %d" % lo) if lo == hi else ("at least %d" % lo) if hi is None else ("%d to %d" % (lo, hi))
            raise DaxError("Line %d: %s takes %s argument%s, and got %d." % (
                line, name, want, "" if lo == hi == 1 else "s", len(args)))
    return f(engine, args, ctx)


def _col(engine, node, fname):
    """A Table[Column] argument, as (table, column)."""
    if node[0] != "ref" or node[1] is None:
        raise DaxError("%s needs a column here, written Table[Column] — like orders[order_date]." % fname)
    t = engine.model.table(node[1])
    return t, engine.model.column(t, node[2])


def _visible_values(engine, node, ctx, fname):
    t, c = _col(engine, node, fname)
    return engine.model.tables[t].loc[ctx.visible(t), c]


def _rows(engine, tv, ctx):
    """One ctx per row of a table, carrying that row as the row context."""
    if tv.base is not None:
        for i in tv.idx:
            rows = dict(ctx.rows)
            rows[tv.base] = int(i)
            yield ctx.derive(rows=rows)
    else:
        for rec in tv.frame.itertuples(index=False):
            vals = dict(ctx.vals)
            for key, v in zip(tv.keys, rec):
                vals[key] = _py(v)
            yield ctx.derive(vals=vals)


def _numbers(values):
    out = []
    for v in values:
        v = _py(v)
        if v is None or isinstance(v, str):
            continue
        out.append(_num(v))
    return out


# aggregations over a column: they read the filter context and ignore any row context

@_fn("SUM", args=(1, 1))
def _sum(engine, args, ctx):
    nums = _numbers(_visible_values(engine, args[0], ctx, "SUM"))
    return sum(nums) if nums else None


@_fn("AVERAGE", args=(1, 1))
def _average(engine, args, ctx):
    nums = _numbers(_visible_values(engine, args[0], ctx, "AVERAGE"))
    return sum(nums) / len(nums) if nums else None


def _minmax(pick):
    def f(engine, args, ctx):
        if len(args) == 2:                                      # MIN(a, b) on two values
            vals = [v for v in (engine.scalar(args[0], ctx), engine.scalar(args[1], ctx)) if v is not None]
            return pick(vals) if vals else None
        vals = [_py(v) for v in _visible_values(engine, args[0], ctx, "MIN / MAX")]
        vals = [v for v in vals if v is not None]
        return pick(vals) if vals else None
    return f


_fn("MIN", args=(1, 2))(_minmax(min))
_fn("MAX", args=(1, 2))(_minmax(max))


@_fn("COUNT", "COUNTA", args=(1, 1))
def _count(engine, args, ctx):
    n = int(_visible_values(engine, args[0], ctx, "COUNT").notna().sum())
    return n or None


@_fn("COUNTBLANK", args=(1, 1))
def _countblank(engine, args, ctx):
    n = int(_visible_values(engine, args[0], ctx, "COUNTBLANK").isna().sum())
    return n or None


@_fn("DISTINCTCOUNT", args=(1, 1))
def _distinctcount(engine, args, ctx):
    n = int(_visible_values(engine, args[0], ctx, "DISTINCTCOUNT").nunique(dropna=False))
    return n or None


@_fn("DISTINCTCOUNTNOBLANK", args=(1, 1))
def _distinctcountnoblank(engine, args, ctx):
    n = int(_visible_values(engine, args[0], ctx, "DISTINCTCOUNTNOBLANK").nunique())
    return n or None


@_fn("COUNTROWS", args=(1, 1))
def _countrows(engine, args, ctx):
    return len(engine.table_of(args[0], ctx, "COUNTROWS")) or None


# iterators: row by row over a table, then combine

def _iter_values(engine, args, ctx, fname):
    tv = engine.table_of(args[0], ctx, fname)
    return [engine.scalar(args[1], row) for row in _rows(engine, tv, ctx)]


@_fn("SUMX", args=(2, 2))
def _sumx(engine, args, ctx):
    nums = _numbers(_iter_values(engine, args, ctx, "SUMX"))
    return sum(nums) if nums else None


@_fn("AVERAGEX", args=(2, 2))
def _averagex(engine, args, ctx):
    nums = _numbers(_iter_values(engine, args, ctx, "AVERAGEX"))
    return sum(nums) / len(nums) if nums else None


@_fn("MINX", args=(2, 2))
def _minx(engine, args, ctx):
    vals = [v for v in _iter_values(engine, args, ctx, "MINX") if v is not None]
    return min(vals) if vals else None


@_fn("MAXX", args=(2, 2))
def _maxx(engine, args, ctx):
    vals = [v for v in _iter_values(engine, args, ctx, "MAXX") if v is not None]
    return max(vals) if vals else None


@_fn("COUNTX", args=(2, 2))
def _countx(engine, args, ctx):
    return sum(1 for v in _iter_values(engine, args, ctx, "COUNTX") if v is not None) or None


@_fn("CONCATENATEX", args=(2, 3))
def _concatenatex(engine, args, ctx):
    sep = _text(engine.scalar(args[2], ctx)) if len(args) > 2 else ""
    return sep.join(_text(v) for v in _iter_values(engine, args[:2], ctx, "CONCATENATEX"))


@_fn("RANKX", args=(2, 5))
def _rankx(engine, args, ctx):
    """RANKX(table, expression, [value], [ASC|DESC], [SKIP|DENSE])"""
    tv = engine.table_of(args[0], ctx, "RANKX")
    values = [engine.scalar(args[1], row) for row in _rows(engine, tv, ctx)]
    mine = engine.scalar(args[2], ctx) if len(args) > 2 and args[2] != ("blank",) else engine.scalar(args[1], ctx)
    order = args[3][1].upper() if len(args) > 3 and args[3][0] == "name" else "DESC"
    dense = len(args) > 4 and args[4][0] == "name" and args[4][1].upper() == "DENSE"
    key = _num(mine)
    nums = [_num(v) for v in values]
    better = (lambda v: v > key) if order != "ASC" else (lambda v: v < key)
    ahead = {v for v in nums if better(v)} if dense else [v for v in nums if better(v)]
    return len(ahead) + 1


# logic

@_fn("IF", args=(2, 3))
def _if(engine, args, ctx):
    if _truthy(engine.scalar(args[0], ctx)):
        return engine.eval(args[1], ctx)
    return engine.eval(args[2], ctx) if len(args) > 2 else None


@_fn("SWITCH", args=(3, None))
def _switch(engine, args, ctx):
    subject = engine.scalar(args[0], ctx)
    pairs, rest = args[1:], None
    if len(pairs) % 2 == 1:
        pairs, rest = pairs[:-1], pairs[-1]
    for k in range(0, len(pairs), 2):
        if _compare("=", subject, engine.scalar(pairs[k], ctx)):
            return engine.eval(pairs[k + 1], ctx)
    return engine.eval(rest, ctx) if rest is not None else None


@_fn("AND", args=(2, 2))
def _and(engine, args, ctx):
    return _truthy(engine.scalar(args[0], ctx)) and _truthy(engine.scalar(args[1], ctx))


@_fn("OR", args=(2, 2))
def _or(engine, args, ctx):
    return _truthy(engine.scalar(args[0], ctx)) or _truthy(engine.scalar(args[1], ctx))


@_fn("NOT", args=(1, 1))
def _not(engine, args, ctx):
    return not _truthy(engine.scalar(args[0], ctx))


@_fn("TRUE", args=(0, 0))
def _true(engine, args, ctx):
    return True


@_fn("FALSE", args=(0, 0))
def _false(engine, args, ctx):
    return False


@_fn("BLANK", args=(0, 0))
def _blank(engine, args, ctx):
    return None


@_fn("ISBLANK", args=(1, 1))
def _isblank(engine, args, ctx):
    return engine.scalar(args[0], ctx) is None


@_fn("COALESCE", args=(2, None))
def _coalesce(engine, args, ctx):
    for a in args:
        v = engine.scalar(a, ctx)
        if v is not None:
            return v
    return None


@_fn("IFERROR", args=(2, 2))
def _iferror(engine, args, ctx):
    try:
        v = engine.scalar(args[0], ctx)
    except DaxError:
        raise
    except Exception:
        return engine.scalar(args[1], ctx)
    if isinstance(v, float) and (_dmath.isinf(v) or _dmath.isnan(v)):
        return engine.scalar(args[1], ctx)
    return v


# maths

@_fn("DIVIDE", args=(2, 3))
def _divide(engine, args, ctx):
    x, y = engine.scalar(args[0], ctx), engine.scalar(args[1], ctx)
    if y is None or _num(y) == 0:
        return engine.scalar(args[2], ctx) if len(args) > 2 else None
    if x is None:
        return None
    return _num(x) / _num(y)


@_fn("ROUND", args=(1, 2))
def _round(engine, args, ctx):
    import decimal
    v = engine.scalar(args[0], ctx)
    if v is None:
        return None
    digits = int(_num(engine.scalar(args[1], ctx))) if len(args) > 1 else 0
    q = decimal.Decimal(1).scaleb(-digits)
    out = float(decimal.Decimal(str(_num(v))).quantize(q, rounding=decimal.ROUND_HALF_UP))
    return int(out) if digits <= 0 else out


@_fn("ABS", args=(1, 1))
def _abs(engine, args, ctx):
    v = engine.scalar(args[0], ctx)
    return None if v is None else abs(_num(v))


@_fn("INT", args=(1, 1))
def _int(engine, args, ctx):
    v = engine.scalar(args[0], ctx)
    return None if v is None else int(_dmath.floor(_num(v)))


@_fn("MOD", args=(2, 2))
def _mod(engine, args, ctx):
    return _num(engine.scalar(args[0], ctx)) % _num(engine.scalar(args[1], ctx))


@_fn("POWER", args=(2, 2))
def _power(engine, args, ctx):
    return _num(engine.scalar(args[0], ctx)) ** _num(engine.scalar(args[1], ctx))


@_fn("SQRT", args=(1, 1))
def _sqrt(engine, args, ctx):
    return _dmath.sqrt(_num(engine.scalar(args[0], ctx)))


# text

@_fn("CONCATENATE", args=(2, 2))
def _concatenate(engine, args, ctx):
    return _text(engine.scalar(args[0], ctx)) + _text(engine.scalar(args[1], ctx))


@_fn("UPPER", args=(1, 1))
def _upper(engine, args, ctx):
    return _text(engine.scalar(args[0], ctx)).upper()


@_fn("LOWER", args=(1, 1))
def _lower(engine, args, ctx):
    return _text(engine.scalar(args[0], ctx)).lower()


@_fn("LEN", args=(1, 1))
def _len(engine, args, ctx):
    return len(_text(engine.scalar(args[0], ctx)))


@_fn("LEFT", "RIGHT", args=(1, 2))
def _leftright(engine, args, ctx):
    raise DaxError("LEFT and RIGHT aren't in this engine yet.")


@_fn("FORMAT", args=(2, 2))
def _format(engine, args, ctx):
    """The common number formats: "0", "0.0", "#,##0", "#,##0.00", "0%", "0.0%"."""
    v = engine.scalar(args[0], ctx)
    fmt = _text(engine.scalar(args[1], ctx))
    if v is None:
        return ""
    if _is_date(v):
        py = fmt.replace("yyyy", "%Y").replace("mmm", "%b").replace("mm", "%m").replace("dd", "%d")
        return _dpd.Timestamp(v).strftime(py)
    x = _num(v)
    pct = fmt.endswith("%")
    if pct:
        x *= 100
        fmt = fmt[:-1]
    decimals = len(fmt.split(".")[1]) if "." in fmt else 0
    text = ("{:,.%df}" if "," in fmt else "{:.%df}") % decimals
    return text.format(x) + ("%" if pct else "")


# dates

@_fn("DATE", args=(3, 3))
def _date(engine, args, ctx):
    y, m, d = (int(_num(engine.scalar(a, ctx))) for a in args)
    return _dpd.Timestamp(year=y, month=m, day=d)


def _datepart(attr):
    def f(engine, args, ctx):
        v = engine.scalar(args[0], ctx)
        if v is None:
            return None
        if not _is_date(v):
            raise DaxError("That needs a date — like a value from calendar[date].")
        return getattr(_dpd.Timestamp(v), attr)
    return f


_fn("YEAR", args=(1, 1))(_datepart("year"))
_fn("MONTH", args=(1, 1))(_datepart("month"))
_fn("DAY", args=(1, 1))(_datepart("day"))


# relationships

@_fn("RELATED", args=(1, 1))
def _related(engine, args, ctx):
    target, col = _col(engine, args[0], "RELATED")
    for start, i in ctx.rows.items():
        steps = engine.model.path(start, target)
        if steps is None:
            continue
        for table, fk, one, pk in steps:
            key = _py(engine.model.tables[table].at[i, fk])
            if key is None:
                return None
            hits = _dnp.flatnonzero(_eq_mask(engine.model.tables[one][pk], key))
            if not len(hits):
                return None
            i = int(hits[0])
        return engine.cell(target, col, i)
    if ctx.rows:
        raise DaxError("RELATED(%s[%s]) can't reach %s from the row you're on — there's no relationship "
                       "leading there. RELATED looks up, from the data to a lookup table." % (target, col, target))
    raise DaxError("RELATED works row by row, so it needs a row: use it inside an iterator like "
                   "SUMX(order_items, order_items[qty] * RELATED(products[price])).")


@_fn("RELATEDTABLE", args=(1, 1))
def _relatedtable(engine, args, ctx):
    t = engine.model.table(args[0][1]) if args[0][0] in ("name", "table") else None
    if t is None:
        raise DaxError("RELATEDTABLE needs a table name, like RELATEDTABLE(orders).")
    return engine.base(t, ctx.transition())

# ── CALCULATE: changing the filter context ──────────────────────────

_REMOVERS = ("ALL", "REMOVEFILTERS", "ALLEXCEPT", "ALLSELECTED", "ALLNOBLANKROW")


def _drop(filters, table, cols=None):
    """filters minus those on table — or only its column filters on cols."""
    return [f for f in filters
            if not (f[0] == table and (cols is None or (f[1] is not None and set(f[1]) & set(cols))))]


def _refs(node, out):
    """Every Table[Column] and bare [name] inside an expression."""
    if isinstance(node, tuple):
        if node and node[0] == "ref":
            out.append((node[1], node[2]))
        for part in node[1:]:
            if isinstance(part, tuple):
                _refs(part, out)
            elif isinstance(part, list):
                for p in part:
                    if isinstance(p, tuple):
                        _refs(p, out)
    return out


def _remove(engine, filters, node):
    """Apply ALL / REMOVEFILTERS / ALLEXCEPT used as a CALCULATE modifier."""
    fname, args = node[1], node[2]
    if not args:
        return []                                               # ALL(): every filter, everywhere
    if fname == "ALLEXCEPT":
        t = engine.model.table(args[0][1]) if args[0][0] in ("name", "table") else None
        if t is None:
            raise DaxError("ALLEXCEPT starts with a table, then the columns to keep: ALLEXCEPT(orders, customers[city]).")
        keep = {_col(engine, a, "ALLEXCEPT") for a in args[1:]}
        scope = {t, *engine.model.ancestors(t)}
        return [f for f in filters
                if f[0] not in scope or (f[1] is not None and all((f[0], c) in keep for c in f[1]))]
    for a in args:
        if a[0] in ("name", "table"):
            t = engine.model.table(a[1])
            for each in (t, *engine.model.ancestors(t)):         # a table's filters include its lookups'
                filters = _drop(filters, each)
        else:
            t, c = _col(engine, a, fname)
            filters = _drop(filters, t, (c,))
    return filters


def _as_filters(engine, tv):
    """A table used as a filter: its rows (or value combinations) become filters."""
    if tv.base is not None:
        m = _dnp.zeros(len(engine.model.tables[tv.base]), dtype=bool)
        m[tv.idx] = True
        return [(tv.base, None, m)]
    out, by_table = [], {}
    for pos, (t, c) in enumerate(tv.keys):
        if t is not None:
            by_table.setdefault(t, []).append((pos, c))
    for t, cols in by_table.items():
        df = engine.model.tables[t]
        allowed = {tuple(_py(v) for v in row)
                   for row in tv.frame.iloc[:, [p for p, _ in cols]].itertuples(index=False)}
        combos = [tuple(_py(v) for v in row) for row in df[[c for _, c in cols]].itertuples(index=False)]
        out.append((t, tuple(c for _, c in cols), _dnp.array([k in allowed for k in combos], dtype=bool)))
    if not out:
        raise DaxError("That table has no model columns in it, so it can't filter anything.")
    return out


def _filter_arg(engine, node, outer):
    """One CALCULATE filter argument -> filters. A true/false expression on
    columns of one table means FILTER(ALL(those columns), expression)."""
    is_table_call = node[0] == "call" and node[1] in TABLE_FUNCS
    if node[0] in ("name", "table") or is_table_call:
        return _as_filters(engine, engine.table_of(node, outer, "CALCULATE"))
    refs = _refs(node, [])
    cols, tables = [], set()
    for t, name in refs:
        if t is None or (name.lower() not in engine.model.cols.get(engine.model.names.get(t.lower(), ""), {})
                         and name.lower() in engine.measures):
            raise DaxError("A measure can't go straight into a CALCULATE filter. Use FILTER instead: "
                           "CALCULATE(..., FILTER(table, [%s] > ...))." % name)
        real = engine.model.table(t)
        cols.append((real, engine.model.column(real, name)))
        tables.add(real)
    if not cols:
        raise DaxError("A CALCULATE filter needs a column to filter, like products[category] = \"beans\".")
    if len(tables) > 1:
        raise DaxError("One filter can only test columns from one table. Split it into two filters, separated by a comma.")
    t = tables.pop()
    names = list(dict.fromkeys(c for _, c in cols))
    df = engine.model.tables[t]
    combos = df[names].drop_duplicates()
    allowed = set()
    for rec in combos.itertuples(index=False):
        vals = dict(outer.vals)
        key = tuple(_py(v) for v in rec)
        for c, v in zip(names, key):
            vals[(t, c)] = v
        if _truthy(engine.scalar(node, outer.derive(rows={}, vals=vals))):
            allowed.add(key)
    mask = _dnp.array([tuple(_py(v) for v in r) in allowed for r in df[names].itertuples(index=False)], dtype=bool)
    return [(t, tuple(names), mask)]


def _calculate_ctx(engine, args, ctx):
    """The new filter context CALCULATE builds from its filter arguments."""
    c = ctx.transition()
    filters = list(c.filters)
    rest = []
    for a in args:
        if a[0] == "call" and a[1] in _REMOVERS:
            filters = _remove(engine, filters, a)
        else:
            rest.append(a)
    for a in rest:
        keep = a[0] == "call" and a[1] == "KEEPFILTERS"
        node = a[2][0] if keep else a
        for t, cols, mask in _filter_arg(engine, node, ctx):
            if not keep:
                dk = engine.model.date_key
                if dk and t == dk[0] and cols and dk[1] in cols:
                    # Filtering the date table's date column (what DATESYTD,
                    # DATEADD and friends return) clears the table's other
                    # filters — otherwise a matrix row's month would still cut
                    # "January to March" back down to March.
                    filters = _drop(filters, t)
                else:
                    filters = _drop(filters, t, cols)
            filters.append((t, cols, mask))
    return Ctx(engine.model, filters, {}, {}, ctx.vars)


@_fn("CALCULATE", args=(1, None))
def _calculate(engine, args, ctx):
    return engine.scalar(args[0], _calculate_ctx(engine, args[1:], ctx))


@_fn("CALCULATETABLE", args=(1, None))
def _calculatetable(engine, args, ctx):
    return engine.table_of(args[0], _calculate_ctx(engine, args[1:], ctx), "CALCULATETABLE")


@_fn("KEEPFILTERS", args=(1, 1))
def _keepfilters(engine, args, ctx):
    raise DaxError("KEEPFILTERS goes inside CALCULATE, around one of its filters.")


# ── Table functions ─────────────────────────────────────────────────

def _distinct(engine, cols, filters_ctx):
    t = cols[0][0]
    if any(c[0] != t for c in cols):
        raise DaxError("Those columns come from different tables — list columns from one table at a time.")
    df = engine.model.tables[t]
    mask = filters_ctx.visible(t) if filters_ctx is not None else _dnp.ones(len(df), dtype=bool)
    sub = df.loc[mask, [c for _, c in cols]].drop_duplicates().reset_index(drop=True)
    return TableVal(frame=sub, keys=list(cols))


@_fn("ALL", "REMOVEFILTERS", "ALLSELECTED", "ALLNOBLANKROW", args=(0, None))
def _all(engine, args, ctx):
    # As a table (not a CALCULATE modifier): every row, ignoring filters.
    # ALLSELECTED behaves as ALL here — there are no slicers to remember.
    if not args:
        raise DaxError("ALL() with nothing inside only works as a CALCULATE filter. Give it a table or columns.")
    if args[0][0] in ("name", "table"):
        t = engine.model.table(args[0][1])
        return TableVal(base=t, idx=_dnp.arange(len(engine.model.tables[t])))
    return _distinct(engine, [_col(engine, a, "ALL") for a in args], None)


@_fn("ALLEXCEPT", args=(2, None))
def _allexcept(engine, args, ctx):
    t = engine.model.table(args[0][1]) if args[0][0] in ("name", "table") else None
    if t is None:
        raise DaxError("ALLEXCEPT starts with a table: ALLEXCEPT(orders, customers[city]).")
    c = Ctx(engine.model, _remove(engine, list(ctx.filters), ("call", "ALLEXCEPT", args, 0)))
    return engine.base(t, c)


@_fn("VALUES", "DISTINCT", args=(1, 1))
def _values(engine, args, ctx):
    if args[0][0] in ("name", "table"):
        return engine.base(engine.model.table(args[0][1]), ctx)
    if args[0][0] == "ref" and args[0][1] is not None:
        return _distinct(engine, [_col(engine, args[0], "VALUES")], ctx)
    tv = engine.table_of(args[0], ctx, "VALUES")
    if tv.frame is not None:
        return TableVal(frame=tv.frame.drop_duplicates().reset_index(drop=True), keys=tv.keys)
    return tv


@_fn("FILTER", args=(2, 2))
def _filter(engine, args, ctx):
    tv = engine.table_of(args[0], ctx, "FILTER")
    keep = [_truthy(engine.scalar(args[1], row)) for row in _rows(engine, tv, ctx)]
    if tv.base is not None:
        return TableVal(base=tv.base, idx=tv.idx[_dnp.array(keep, dtype=bool)] if len(keep) else tv.idx)
    return TableVal(frame=tv.frame[_dnp.array(keep, dtype=bool)].reset_index(drop=True) if len(keep) else tv.frame,
                    keys=tv.keys)


def _frame_of(engine, tv):
    """A table as a frame with (table, column) keys."""
    if tv.frame is not None:
        return tv.frame.copy(), list(tv.keys)
    df = engine.model.tables[tv.base].iloc[tv.idx].reset_index(drop=True)
    return df, [(tv.base, str(c)) for c in df.columns]


def _named_pairs(engine, args, fname):
    if len(args) % 2:
        raise DaxError("%s wants name and expression pairs: \"Sales\", [Total Sales]." % fname)
    out = []
    for k in range(0, len(args), 2):
        if args[k][0] != "str":
            raise DaxError("%s: each new column needs a name in double quotes first." % fname)
        out.append((args[k][1], args[k + 1]))
    return out


@_fn("ADDCOLUMNS", args=(3, None))
def _addcolumns(engine, args, ctx):
    tv = engine.table_of(args[0], ctx, "ADDCOLUMNS")
    frame, keys = _frame_of(engine, tv)
    for name, expr in _named_pairs(engine, args[1:], "ADDCOLUMNS"):
        frame[name] = [engine.scalar(expr, row) for row in _rows(engine, tv, ctx)]
        keys.append((None, name))
    frame.columns = range(frame.shape[1])
    return TableVal(frame=frame, keys=keys)


@_fn("SELECTCOLUMNS", args=(3, None))
def _selectcolumns(engine, args, ctx):
    tv = engine.table_of(args[0], ctx, "SELECTCOLUMNS")
    data, keys = {}, []
    for k, (name, expr) in enumerate(_named_pairs(engine, args[1:], "SELECTCOLUMNS")):
        data[k] = [engine.scalar(expr, row) for row in _rows(engine, tv, ctx)]
        keys.append((None, name))
    return TableVal(frame=_dpd.DataFrame(data), keys=keys)


@_fn("TOPN", args=(3, 4))
def _topn(engine, args, ctx):
    n = int(_num(engine.scalar(args[0], ctx)))
    tv = engine.table_of(args[1], ctx, "TOPN")
    scores = [_num(engine.scalar(args[2], row)) for row in _rows(engine, tv, ctx)]
    asc = len(args) > 3 and args[3][0] == "name" and args[3][1].upper() == "ASC"
    order = sorted(range(len(scores)), key=lambda k: scores[k], reverse=not asc)
    if len(order) > n > 0:
        cut = scores[order[n - 1]]
        order = [k for k in order if (scores[k] >= cut if not asc else scores[k] <= cut)]   # ties at the cut stay
    elif n <= 0:
        order = []
    if tv.base is not None:
        return TableVal(base=tv.base, idx=tv.idx[order])
    return TableVal(frame=tv.frame.iloc[order].reset_index(drop=True), keys=tv.keys)


def _lookup_value(engine, start, i, target, col):
    """The value of target[col] for row i of start, following relationships up."""
    if start == target:
        return engine.cell(target, col, i)
    steps = engine.model.path(start, target)
    if steps is None:
        raise DaxError("%s can't reach %s — there's no relationship leading there." % (start, target))
    for table, fk, one, pk in steps:
        key = _py(engine.model.tables[table].at[i, fk])
        hits = _dnp.flatnonzero(_eq_mask(engine.model.tables[one][pk], key)) if key is not None else []
        if not len(hits):
            return None
        i = int(hits[0])
    return engine.cell(target, col, i)


@_fn("SUMMARIZE", args=(2, None))
def _summarize(engine, args, ctx):
    tv = engine.table_of(args[0], ctx, "SUMMARIZE")
    if tv.base is None:
        raise DaxError("SUMMARIZE needs a model table first, like SUMMARIZE(orders, customers[city]).")
    group = [a for a in args[1:] if a[0] == "ref"]
    extra = [a for a in args[1:] if a[0] != "ref"]
    if extra:
        raise DaxError("Add calculated columns with ADDCOLUMNS(SUMMARIZE(...), \"name\", ...) — it's the safer way.")
    cols = [_col(engine, a, "SUMMARIZE") for a in group]
    rows = {tuple(_lookup_value(engine, tv.base, int(i), t, c) for t, c in cols) for i in tv.idx}
    frame = _dpd.DataFrame(sorted(rows, key=lambda r: tuple(_text(v) for v in r)), columns=range(len(cols)))
    return TableVal(frame=frame, keys=cols)


@_fn("SUMMARIZECOLUMNS", args=(1, None))
def _summarizecolumns(engine, args, ctx):
    group, filter_args, named = [], [], []
    k = 0
    while k < len(args) and args[k][0] != "str":
        (group if args[k][0] == "ref" else filter_args).append(args[k])
        k += 1
    named = _named_pairs(engine, args[k:], "SUMMARIZECOLUMNS")
    cols = [_col(engine, a, "SUMMARIZECOLUMNS") for a in group]
    base_ctx = _calculate_ctx(engine, filter_args, ctx) if filter_args else ctx
    by_table = {}
    for t, c in cols:
        by_table.setdefault(t, []).append(c)
    combos = [()]
    for t, cs in by_table.items():
        vals = engine.model.tables[t][cs].drop_duplicates()
        vals = sorted((tuple(_py(v) for v in r) for r in vals.itertuples(index=False)),
                      key=lambda r: tuple(_sort_key(v) for v in r))
        combos = [a + b for a in combos for b in vals]
    order = [(t, c) for t, cs in by_table.items() for c in cs]
    rows = []
    for combo in combos:
        filters = list(base_ctx.filters)
        for (t, c), v in zip(order, combo):
            filters = _drop(filters, t, (c,))
            filters.append((t, (c,), _eq_mask(engine.model.tables[t][c], v)))
        cell_ctx = Ctx(engine.model, filters, {}, {}, ctx.vars)
        results = [engine.scalar(expr, cell_ctx) for _, expr in named]
        if named and all(r is None for r in results):
            continue                                            # SUMMARIZECOLUMNS drops all-blank rows
        rows.append(list(combo) + results)
    keys = order + [(None, name) for name, _ in named]
    frame = _dpd.DataFrame(rows, columns=range(len(keys))) if rows else _dpd.DataFrame(columns=range(len(keys)))
    return TableVal(frame=frame, keys=keys)


@_fn("SELECTEDVALUE", args=(1, 2))
def _selectedvalue(engine, args, ctx):
    vals = _visible_values(engine, args[0], ctx, "SELECTEDVALUE").drop_duplicates()
    if len(vals) == 1:
        return _py(vals.iloc[0])
    return engine.scalar(args[1], ctx) if len(args) > 1 else None


@_fn("HASONEVALUE", args=(1, 1))
def _hasonevalue(engine, args, ctx):
    return int(_visible_values(engine, args[0], ctx, "HASONEVALUE").nunique(dropna=False)) == 1


@_fn("ISFILTERED", args=(1, 1))
def _isfiltered(engine, args, ctx):
    t, c = _col(engine, args[0], "ISFILTERED")
    return any(f[0] == t and f[1] is not None and c in f[1] for f in ctx.filters)


# ── Time intelligence ───────────────────────────────────────────────
# These take a date column — calendar[date] — and return a set of dates to
# filter by, worked out from the dates visible right now.

def _date_col(engine, node, fname):
    t, c = _col(engine, node, fname)
    if not _dpd.api.types.is_datetime64_any_dtype(engine.model.tables[t][c]):
        raise DaxError("%s needs a date column — use calendar[date]." % fname)
    return t, c


def _date_set(engine, t, c, dates):
    all_dates = engine.model.tables[t][c]
    keep = all_dates[all_dates.isin(list(dates))].drop_duplicates().sort_values()
    return TableVal(frame=_dpd.DataFrame({0: keep.to_numpy()}), keys=[(t, c)])


def _visible_dates(engine, node, ctx, fname):
    t, c = _date_col(engine, node, fname)
    return t, c, _dpd.to_datetime(engine.model.tables[t].loc[ctx.visible(t), c]).dropna()


@_fn("DATESYTD", args=(1, 1))
def _datesytd(engine, args, ctx):
    t, c, seen = _visible_dates(engine, args[0], ctx, "DATESYTD")
    if seen.empty:
        return _date_set(engine, t, c, [])
    last = seen.max()
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    return _date_set(engine, t, c, all_dates[(all_dates >= _dpd.Timestamp(last.year, 1, 1)) & (all_dates <= last)])


@_fn("TOTALYTD", args=(2, 2))
def _totalytd(engine, args, ctx):
    c = _calculate_ctx(engine, [("call", "DATESYTD", [args[1]], 0)], ctx)
    return engine.scalar(args[0], c)


def _shift(seen, all_dates, n, unit):
    unit = unit.upper()
    if unit == "DAY":
        return seen + _dpd.Timedelta(days=n)
    months = n * {"MONTH": 1, "QUARTER": 3, "YEAR": 12}.get(unit, 0)
    if months == 0:
        raise DaxError("The interval should be DAY, MONTH, QUARTER or YEAR.")
    periods = seen.dt.to_period("M").unique()
    whole = all(set(all_dates[all_dates.dt.to_period("M") == p]) <= set(seen) for p in periods)
    if whole:                                                   # whole months shift to whole months
        targets = {p + months for p in periods}
        return all_dates[all_dates.dt.to_period("M").isin(targets)]
    return _dpd.Series([d + _dpd.DateOffset(months=months) for d in seen])


@_fn("DATEADD", args=(3, 3))
def _dateadd(engine, args, ctx):
    t, c, seen = _visible_dates(engine, args[0], ctx, "DATEADD")
    n = int(_num(engine.scalar(args[1], ctx)))
    if args[2][0] != "name":
        raise DaxError("DATEADD's last argument is DAY, MONTH, QUARTER or YEAR — written without quotes.")
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    return _date_set(engine, t, c, _shift(seen, all_dates, n, args[2][1]) if not seen.empty else [])


@_fn("SAMEPERIODLASTYEAR", args=(1, 1))
def _sameperiodlastyear(engine, args, ctx):
    t, c, seen = _visible_dates(engine, args[0], ctx, "SAMEPERIODLASTYEAR")
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    return _date_set(engine, t, c, _shift(seen, all_dates, -1, "YEAR") if not seen.empty else [])


@_fn("PREVIOUSMONTH", args=(1, 1))
def _previousmonth(engine, args, ctx):
    t, c, seen = _visible_dates(engine, args[0], ctx, "PREVIOUSMONTH")
    if seen.empty:
        return _date_set(engine, t, c, [])
    target = seen.min().to_period("M") - 1
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    return _date_set(engine, t, c, all_dates[all_dates.dt.to_period("M") == target])


@_fn("DATESINPERIOD", args=(4, 4))
def _datesinperiod(engine, args, ctx):
    """DATESINPERIOD(dates, start, n, interval): n intervals back from start
    (start included), or forward when n is positive — a rolling window."""
    t, c = _date_col(engine, args[0], "DATESINPERIOD")
    start = engine.scalar(args[1], ctx)
    n = int(_num(engine.scalar(args[2], ctx)))
    if args[3][0] != "name" or args[3][1].upper() not in ("DAY", "MONTH", "QUARTER", "YEAR"):
        raise DaxError("DATESINPERIOD's last argument is DAY, MONTH, QUARTER or YEAR — written without quotes.")
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    if start is None or n == 0:
        return _date_set(engine, t, c, [])
    if not _is_date(start):
        raise DaxError("DATESINPERIOD needs a date to count from, like MAX(calendar[date]).")
    start = _dpd.Timestamp(start)
    unit = args[3][1].upper()
    step = (_dpd.Timedelta(days=n) if unit == "DAY"
            else _dpd.DateOffset(months=n * {"MONTH": 1, "QUARTER": 3, "YEAR": 12}[unit]))
    if n < 0:
        keep = (all_dates > start + step) & (all_dates <= start)
    else:
        keep = (all_dates >= start) & (all_dates < start + step)
    return _date_set(engine, t, c, all_dates[keep])


@_fn("DATESBETWEEN", args=(3, 3))
def _datesbetween(engine, args, ctx):
    t, c = _date_col(engine, args[0], "DATESBETWEEN")
    lo, hi = engine.scalar(args[1], ctx), engine.scalar(args[2], ctx)
    all_dates = _dpd.to_datetime(engine.model.tables[t][c])
    keep = _dnp.ones(len(all_dates), dtype=bool)
    if lo is not None:
        keep &= (all_dates >= _dpd.Timestamp(lo)).to_numpy()
    if hi is not None:
        keep &= (all_dates <= _dpd.Timestamp(hi)).to_numpy()
    return _date_set(engine, t, c, all_dates[keep])


# Functions that hand back a table — a CALCULATE argument made of one of
# these is a table filter, not a true/false test.
TABLE_FUNCS = {
    "FILTER", "ALL", "REMOVEFILTERS", "ALLSELECTED", "ALLNOBLANKROW", "ALLEXCEPT", "VALUES", "DISTINCT",
    "CALCULATETABLE", "TOPN", "ADDCOLUMNS", "SELECTCOLUMNS", "SUMMARIZE", "SUMMARIZECOLUMNS",
    "DATESYTD", "DATEADD", "SAMEPERIODLASTYEAR", "PREVIOUSMONTH", "DATESBETWEEN", "DATESINPERIOD", "RELATEDTABLE",
}

# ── The model the app uses ──────────────────────────────────────────
# The shop is a star schema already; cafe joins the same calendar and
# cities. A calendar table is generated to cover every date in the data.

DAX_RELATIONSHIPS = [
    ("order_items", "order_id", "orders", "order_id"),
    ("order_items", "product_id", "products", "product_id"),
    ("orders", "customer_id", "customers", "customer_id"),
    ("orders", "order_date", "calendar", "date"),
    ("customers", "city", "cities", "city"),
    ("cafe", "date", "calendar", "date"),
    ("cafe", "city", "cities", "city"),
]


def _dax_calendar(frames):
    dates = [_dpd.to_datetime(frames[t][c]).dropna()
             for t, c in (("orders", "order_date"), ("cafe", "date")) if t in frames and c in frames[t]]
    if not dates:
        return None
    every = _dpd.concat(dates)
    days = _dpd.date_range(every.min().to_period("M").start_time,
                           every.max().to_period("M").end_time.normalize(), freq="D")
    return _dpd.DataFrame({"date": days, "year": days.year, "month": days.month,
                           "month_name": days.month_name(), "quarter": "Q" + days.quarter.astype(str),
                           "weekday": days.day_name()})


def dax_model(frames, relationships=DAX_RELATIONSHIPS):
    frames = dict(frames)
    if "calendar" not in frames:
        cal = _dax_calendar(frames)
        if cal is not None:
            frames["calendar"] = cal
    return Model(frames, relationships)


def _ns_frames(ns):
    return {k: v for k, v in ns.items()
            if isinstance(v, _dpd.DataFrame) and k.isidentifier() and not k.startswith("_")}


# ── Showing results ─────────────────────────────────────────────────

def _fmt(v):
    if v is None:
        return "(blank)"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, int):
        return "{:,}".format(v)
    if isinstance(v, float):
        if _dmath.isnan(v):
            return "NaN"
        if _dmath.isinf(v):
            return "Infinity" if v > 0 else "-Infinity"
        return "{:,}".format(int(v)) if v.is_integer() else "{:,.2f}".format(v)
    return _text(v)


def _grid_text(header, rows, limit=40):
    """Rows as aligned text: numbers to the right, text to the left, so a
    long label (CONCATENATEX) doesn't push the columns before it far apart."""
    body = rows[:limit]
    texty = [any(isinstance(r[i], str) and r[i] != "" for r in body) for i in range(len(header))]
    cells = [[_fmt(v) if not isinstance(v, str) else v for v in r] for r in body]
    heads = [str(h) for h in header]
    widths = [max([len(heads[i])] + [len(c[i]) for c in cells]) for i in range(len(heads))]

    def line(vals):
        return "  ".join(v.ljust(w) if t else v.rjust(w) for v, w, t in zip(vals, widths, texty)).rstrip()

    text = "\n".join([line(heads)] + [line(c) for c in cells])
    if len(rows) > limit:
        text += "\n... %d rows in all" % len(rows)
    return text


def _show_table(engine, tv):
    frame, keys = _frame_of(engine, tv)
    counts = {}
    for _, c in keys:
        counts[c] = counts.get(c, 0) + 1
    header = [c if counts[c] == 1 or t is None else "%s[%s]" % (t, c) for t, c in keys]
    rows = [[_py(v) for v in r] for r in frame.itertuples(index=False)]
    if not rows:
        return "(an empty table)  columns: %s" % ", ".join(header)
    return _grid_text(header, rows) + "\n(%d row%s)" % (len(rows), "" if len(rows) == 1 else "s")


def _sort_key(v):
    return (v is None, 0 if isinstance(v, (int, float)) else 1, v if isinstance(v, (int, float)) else _text(v))


def _col_of(engine, text):
    m = _dre.match(r"\s*('?)([^'\[]+)\1\s*\[([^\]]+)\]\s*$", text)
    if not m:
        raise DaxError("I couldn't read %r as Table[Column]." % text)
    t = engine.model.table(m.group(2).strip())
    return t, engine.model.column(t, m.group(3))


def _grid(engine, names, cols):
    """Each measure in names, for every combination of values of cols, plus
    the total. -> [(labels, [values])], blank rows left out like a matrix."""
    per_table = {}
    for t, c in cols:
        per_table.setdefault(t, []).append(c)
    combos = [()]
    order = []
    for t, cs in per_table.items():
        vals = engine.model.tables[t][cs].drop_duplicates()
        vals = sorted((tuple(_py(v) for v in r) for r in vals.itertuples(index=False)),
                      key=lambda r: tuple(_sort_key(v) for v in r))
        combos = [a + b for a in combos for b in vals]
        order += [(t, c) for c in cs]
    out = []
    if cols:
        for combo in combos:
            filters = []
            for (t, c), v in zip(order, combo):
                filters.append((t, (c,), _eq_mask(engine.model.tables[t][c], v)))
            ctx = Ctx(engine.model, filters)
            values = [engine.measure(n, ctx) for n in names]
            if all(v is None for v in values):
                continue
            out.append((combo, values))
    out.append((("Total",) + ("",) * (len(cols) - 1) if cols else ("Total",),
                [engine.measure(n, engine.root()) for n in names]))
    return order, out


def _grid_show(engine, names, cols):
    order, out = _grid(engine, names, cols)
    header = [c for _, c in order] or [""]
    rows = [list(labels) + values for labels, values in out]
    return _grid_text(header + list(names), rows)


# ── Running a script ────────────────────────────────────────────────
# Lessons set _DAX_ROWS = "products[category]" in their prelude to show
# the measures as a matrix; without it each measure shows its total.

def _dax_exec(code, ns):
    ns["_query"] = code
    if not ns.get("_DAX_EXEC", True):       # practice: the judge runs it, cell by cell
        return
    try:
        statements = parse_script(code)
        engine = Engine(dax_model(_ns_frames(ns)), {})
        kept = dict(ns.get("_dax_kept", {})) if ns.get("_DAX_KEEP") else {}
        defined = []
        for s in statements:
            if s[0] == "measure":
                kept[s[1]] = s[2]
                defined.append(s[1])
        engine = Engine(engine.model, kept)
        ns["_dax_engine"] = engine
        ns["_dax_defined"] = defined
        if ns.get("_DAX_KEEP"):
            ns["_dax_kept"] = kept
        shown = []
        for s in statements:
            if s[0] == "evaluate":
                shown.append(_show_table(engine, engine.table_of(s[1], engine.root(), "EVALUATE")))
            elif s[0] == "expr":
                v = engine.eval(s[1], engine.root())
                shown.append(_show_table(engine, v) if isinstance(v, TableVal) else _fmt(v))
        if defined and not any(s[0] != "measure" for s in statements):
            rows = ns.get("_DAX_ROWS")
            if rows:
                shown.append(_grid_show(engine, defined, [_col_of(engine, rows)]))
            else:
                width = max(len(n) for n in defined)
                shown.append("\n".join("%s   %s" % (n.ljust(width), _fmt(engine.measure(n, engine.root())))
                                       for n in defined))
        if not statements:
            shown.append("Nothing to run yet — define a measure, like Total Sales = SUM(order_items[qty]).")
        print("\n\n".join(shown))
    except DaxError as err:
        raise _SQLFailure(str(err))
    except Exception as err:
        raise _SQLFailure(_unexpected(err))


def _unexpected(err):
    """A Python error from inside the engine, worded for a learner rather
    than shown as a traceback."""
    if isinstance(err, ZeroDivisionError):
        return "Something there divides by zero. DIVIDE(x, y) gives BLANK instead of failing."
    if isinstance(err, RecursionError):
        return "That goes round in circles too deeply to work out. Does a measure end up using itself?"
    return "That couldn't be worked out (%s). Check the values going into each function." % err


def _dax_uses(engine, ast, fname, seen=None):
    """Does this expression call fname — directly, or in a measure it uses?"""
    seen = seen or set()
    if not isinstance(ast, tuple):
        return False
    if ast[0] == "call" and ast[1] == fname:
        return True
    if ast[0] == "ref" and ast[2].lower() in engine.measures and ast[2].lower() not in seen:
        seen.add(ast[2].lower())
        if _dax_uses(engine, engine.measures[ast[2].lower()][1], fname, seen):
            return True
    for part in ast[1:]:
        if isinstance(part, tuple) and _dax_uses(engine, part, fname, seen):
            return True
        if isinstance(part, list) and any(_dax_uses(engine, p, fname, seen) for p in part if isinstance(p, tuple)):
            return True
    return False


def _same(a, b):
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool):
        if _dmath.isnan(float(a)) or _dmath.isnan(float(b)):
            return _dmath.isnan(float(a)) and _dmath.isnan(float(b))
        return abs(float(a) - float(b)) <= 1e-6 * max(1.0, abs(float(b)))
    return _text(a) == _text(b)


def _dax_expect(ns, measure, reference, by=None, uses=(), helpers=None):
    """Lesson check: [measure] must match the reference expression overall,
    and for every value of each column in by (default: the lesson's rows).
    helpers are the reference's own measures ({"Sales": "SUMX(...)"}) — the
    reference never borrows the learner's, so a wrong [Sales] can't hide."""
    engine = ns.get("_dax_engine")
    if engine is None:
        raise AssertionError("Run it first, so there's a measure to check.")
    if measure.lower() not in engine.measures:
        raise AssertionError("Define a measure called [%s]: start a line with  %s = ..." % (measure, measure))
    try:
        for fname in uses:
            if not _dax_uses(engine, engine.measures[measure.lower()][1], fname.upper()):
                raise AssertionError("This one is about %s — use it in [%s]." % (fname.upper(), measure))
        ref_measures = {name: parse_expr(src) for name, src in (helpers or {}).items()}
        ref_measures["__ref__"] = parse_expr(reference)
        ref = Engine(engine.model, ref_measures)
        groups = by if by is not None else ([ns["_DAX_ROWS"]] if ns.get("_DAX_ROWS") else [])
        places = [("overall", Ctx(engine.model))]
        for g in groups:
            t, c = _col_of(engine, g)
            for v in sorted({_py(x) for x in engine.model.tables[t][c]}, key=_sort_key):
                places.append(('where %s[%s] is %s' % (t, c, _fmt(v) if not isinstance(v, str) else '"%s"' % v),
                               Ctx(engine.model, [(t, (c,), _eq_mask(engine.model.tables[t][c], v))])))
        for label, ctx in places:
            got, want = engine.measure(measure, ctx), ref.measure("__ref__", ctx)
            if not _same(got, want):
                raise AssertionError("%s, [%s] gives %s — it should be %s." % (
                    label[0].upper() + label[1:], measure, _fmt(got), _fmt(want)))
    except AssertionError:
        raise
    except DaxError as err:
        raise AssertionError(str(err))
    except Exception as err:
        raise AssertionError(_unexpected(err))
    return True


# ── Practice: judging a measure in many filter contexts ─────────────
# The hidden tests for a measure are the places it gets evaluated: overall,
# per product, per city, per month, and crossed. A measure that's right in
# the total but wrong inside one cell fails.

def _same_cell(a, b):
    """A matrix cell: BLANK and 0 count as the same, as BLANK = 0 does in DAX,
    so a rate of 0 where the reference leaves a blank isn't a wrong answer."""
    if (a is None) != (b is None):
        return _same(0 if a is None else a, 0 if b is None else b)
    return _same(a, b)


def _judge_dax(ns, code, reference, measure, layouts, reveal=False, helpers=None):
    total = len(layouts)
    report = {"ok": False, "passed": 0, "total": total, "summary": "", "case": None,
              "mode": "run" if reveal else "submit"}
    try:
        statements = parse_script(code)
    except DaxError as err:
        # No case: there is nothing to compare yet, and the message says it all.
        report["summary"] = "Your DAX raised a DAX error: %s" % err
        return report
    mine = {s[1]: s[2] for s in statements if s[0] == "measure"}
    if measure.lower() not in {k.lower() for k in mine}:
        report["summary"] = "Define a measure called [%s] — that's what gets tested." % measure
        return report
    model = dax_model(_ns_frames(ns))
    engine = Engine(model, mine)
    ref_measures = {name: parse_expr(src) for name, src in (helpers or {}).items()}
    ref_measures[measure] = parse_expr(reference)
    ref = Engine(model, ref_measures)
    for i, layout in enumerate(layouts):
        label = "Example" if reveal else "Test %d of %d" % (i + 1, total)
        cols = [_col_of(engine, g) for g in layout]
        place = "the total" if not cols else "a matrix by " + " and ".join("%s[%s]" % tc for tc in cols)
        expected_text = _grid_show(ref, [measure], cols)
        try:
            got_order, got = _grid(engine, [measure], cols)
        except Exception as err:
            msg = str(err) if isinstance(err, DaxError) else _unexpected(err)
            report["summary"] = "%s raised a DAX error: %s" % (label, msg.split("\n")[0])
            report["case"] = {"n": i + 1, "input": place, "expected": expected_text, "got": msg}
            return report
        _, want = _grid(ref, [measure], cols)
        mismatch = None
        got_map = {labels: vals[0] for labels, vals in got}
        for labels, vals in want:
            if not _same_cell(got_map.get(labels), vals[0]):
                mismatch = labels
                break
        if mismatch is None and len(got) != len(want):
            wanted = {l for l, _ in want}
            extra = [labels for labels, vals in got if labels not in wanted and not _same_cell(vals[0], None)]
            mismatch = extra[0] if extra else None
        if mismatch is not None or reveal:
            report["case"] = {"n": i + 1, "input": place, "expected": expected_text,
                              "got": _grid_show(engine, [measure], cols)}
        if mismatch is not None:
            where = "the total" if mismatch[0] == "Total" else ", ".join(_text(v) for v in mismatch)
            report["summary"] = "%s failed — wrong at %s." % (label, where)
            return report
        report["passed"] += 1
    report["ok"] = True
    report["summary"] = "Matches the expected output." if reveal else "All %d tests passed." % total
    return report


def _preview_dax(ns, reference, measure, layout, helpers=None):
    model = dax_model(_ns_frames(ns))
    ref_measures = {name: parse_expr(src) for name, src in (helpers or {}).items()}
    ref_measures[measure] = parse_expr(reference)
    ref = Engine(model, ref_measures)
    cols = [_col_of(ref, g) for g in layout]
    place = "the shop model (customers, orders, order_items, products, calendar)"
    if cols:
        place += "\nshown as a matrix by " + " and ".join("%s[%s]" % tc for tc in cols)
    return {"mode": "preview", "input": place, "expected": _grid_show(ref, [measure], cols)}


# ── Intellisense ────────────────────────────────────────────────────

DAX_SIGS = {
    "CALCULATE": (["expression", "filter", "..."], "Works out the expression with the filters changed."),
    "CALCULATETABLE": (["table", "filter", "..."], "A table, with the filters changed."),
    "FILTER": (["table", "condition"], "The rows of the table where the condition is true."),
    "ALL": (["table or column", "..."], "Removes filters. Inside CALCULATE: ignore them. As a table: every row."),
    "ALLEXCEPT": (["table", "column to keep", "..."], "Removes every filter on the table except these columns'."),
    "REMOVEFILTERS": (["table or column", "..."], "Clears filters, inside CALCULATE."),
    "KEEPFILTERS": (["filter"], "Adds a filter without replacing the one already there."),
    "VALUES": (["table or column"], "The distinct values showing right now."),
    "DISTINCT": (["column"], "The distinct values showing right now."),
    "SUM": (["column"], "Adds up a column, in the current filter context."),
    "AVERAGE": (["column"], "The mean of a column, in the current filter context."),
    "MIN": (["column"], "The smallest value."),
    "MAX": (["column"], "The largest value."),
    "COUNT": (["column"], "How many values aren't blank."),
    "COUNTROWS": (["table"], "How many rows the table has right now."),
    "DISTINCTCOUNT": (["column"], "How many different values."),
    "SUMX": (["table", "expression"], "Row by row: works out the expression for each row, then adds them up."),
    "AVERAGEX": (["table", "expression"], "Row by row, then the mean."),
    "MINX": (["table", "expression"], "Row by row, then the smallest."),
    "MAXX": (["table", "expression"], "Row by row, then the largest."),
    "COUNTX": (["table", "expression"], "Row by row, counting the results that aren't blank."),
    "RANKX": (["table", "expression", "value", "order", "ties"], "Where the current value ranks among the table's."),
    "RELATED": (["column"], "Looks up a value from a lookup table, for the current row."),
    "RELATEDTABLE": (["table"], "The rows of a data table that belong to the current row."),
    "DIVIDE": (["numerator", "denominator", "if zero"], "Division that gives BLANK (or your fallback) instead of an error."),
    "IF": (["condition", "if true", "if false"], "One of two results, depending on the condition."),
    "SWITCH": (["expression", "value", "result", "...", "else"], "Picks a result by matching values. SWITCH(TRUE(), ...) tests conditions in turn."),
    "SELECTEDVALUE": (["column", "otherwise"], "The single value showing, or the fallback if there's more than one."),
    "HASONEVALUE": (["column"], "TRUE if exactly one value is showing."),
    "ISBLANK": (["value"], "TRUE if the value is BLANK."),
    "BLANK": ([], "An empty value — what a matrix leaves as an empty cell."),
    "COALESCE": (["value", "fallback", "..."], "The first value that isn't BLANK."),
    "ROUND": (["number", "digits"], "Rounds to that many decimal places; halves go away from zero."),
    "FORMAT": (["value", "format"], 'Text from a number: "0.0%", "#,##0", "0.00".'),
    "DATE": (["year", "month", "day"], "A date."),
    "YEAR": (["date"], "The year of a date."),
    "MONTH": (["date"], "The month number of a date."),
    "TOTALYTD": (["expression", "dates"], "The expression from the start of the year to the latest date showing."),
    "DATESYTD": (["dates"], "The dates from 1 January to the latest date showing."),
    "DATEADD": (["dates", "number", "interval"], "The dates showing, shifted: DATEADD(calendar[date], -1, MONTH)."),
    "PREVIOUSMONTH": (["dates"], "Every date of the month before."),
    "SAMEPERIODLASTYEAR": (["dates"], "The same dates, a year earlier."),
    "DATESBETWEEN": (["dates", "start", "end"], "The dates from start to end, inclusive."),
    "DATESINPERIOD": (["dates", "start", "number", "interval"], "A rolling window: DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH)."),
    "CONCATENATEX": (["table", "expression", "separator"], "Row by row, joined into one piece of text."),
    "SUMMARIZECOLUMNS": (["group by column", "...", "name", "expression"], "A table of values by group — how a matrix is built."),
    "SUMMARIZE": (["table", "group by column", "..."], "The combinations of values that appear in the table."),
    "ADDCOLUMNS": (["table", "name", "expression", "..."], "The table with calculated columns added."),
    "SELECTCOLUMNS": (["table", "name", "expression", "..."], "A new table of just these columns."),
    "TOPN": (["n", "table", "order by", "ASC or DESC"], "The top n rows by an expression."),
    "CONCATENATEX": (["table", "expression", "separator"], "Row by row, joined into one piece of text."),
}

_DAX_WORDS = ["VAR", "RETURN", "EVALUATE", "DEFINE", "MEASURE", "ASC", "DESC", "DAY", "MONTH", "QUARTER", "YEAR",
              "TRUE", "FALSE", "IN", "NOT"]


def _dax_scan(text):
    """Lexer state at the end of text: open quote/bracket, comment, bracket stack."""
    i, n = 0, len(text)
    opener, start, comment, stack = None, -1, None, []
    close_of = {'"': '"', "'": "'", "[": "]"}
    while i < n:
        c = text[i]
        if comment == "line":
            if c == "\n":
                comment = None
        elif comment == "block":
            if text.startswith("*/", i):
                comment, i = None, i + 1
        elif opener:
            if c == close_of[opener]:
                if i + 1 < n and text[i + 1] == c and opener != "[":
                    i += 1
                else:
                    opener = None
        elif c in close_of:
            opener, start = c, i
        elif text.startswith("--", i) or text.startswith("//", i):
            comment = "line"
        elif text.startswith("/*", i):
            comment, i = "block", i + 1
        elif c == "(":
            stack.append(i)
        elif c == ")" and stack:
            stack.pop()
        i += 1
    return {"opener": opener, "start": start, "comment": comment, "stack": stack}


def _dax_measure_names(src):
    names = []
    for line in src.splitlines():
        m = _dre.match(r"(?:\[([^\]]+)\]|([A-Za-z_][A-Za-z0-9_ %]*?))\s*:?=(?!=)", line)
        if m and not line.startswith((" ", "\t")):
            name = (m.group(1) or m.group(2)).strip()
            if name.upper() not in ("VAR", "RETURN", "EVALUATE", "DEFINE", "MEASURE"):
                names.append(name)
    m2 = _dre.findall(r"MEASURE\s+(?:'[^']*'|[A-Za-z_]\w*)?\s*\[([^\]]+)\]", src, _dre.I)
    return list(dict.fromkeys(names + m2))


def _dax_complete(text, after, ns, force):
    result = {"items": [], "replace": 0, "signature": None, "context": "none"}
    st = _dax_scan(text)
    if st["comment"]:
        return result
    model = dax_model(_ns_frames(ns))
    full = text + after
    if st["stack"]:
        k = st["stack"][-1]
        m = _dre.search(r"([A-Za-z_][A-Za-z0-9_.]*)\s*$", text[:k])
        if m and m.group(1).upper() in DAX_SIGS:
            params, doc = DAX_SIGS[m.group(1).upper()]
            active = _arg_index(text[k + 1:])
            if params and params[-1] == "..." and active >= len(params) - 1:
                active = len(params) - 1
            result["signature"] = {"name": m.group(1).upper(), "params": list(params), "more": False,
                                   "active": active if active < len(params) else -1, "doc": doc}
    if st["opener"] == "[":
        prefix = text[st["start"] + 1:]
        before = text[:st["start"]]
        m = _dre.search(r"(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_]*))\s*$", before)
        table = None
        if m:
            table = model.names.get((m.group(1) or m.group(2)).lower())
        if table:
            options = [(c, "column", str(model.tables[table][c].dtype)) for c in model.tables[table].columns]
        else:
            options = [(n, "measure", "measure") for n in _dax_measure_names(full)]
        low = prefix.lower()
        items = [{"label": str(name), "kind": "column" if kind == "column" else "variable",
                  "detail": ("%s · %s" % (table, detail)) if table else detail}
                 for name, kind, detail in options if str(name).lower().startswith(low)]
        result.update(items=items[:60], replace=len(prefix), context="bracket", quote="[", close="]")
        return result
    if st["opener"] == "'":
        prefix = text[st["start"] + 1:]
        items = [{"label": t, "kind": "table", "detail": "table"} for t in sorted(model.tables)
                 if t.lower().startswith(prefix.lower())]
        result.update(items=items, replace=len(prefix), context="bracket", quote="'", close="'")
        return result
    if st["opener"] == '"':
        before = text[:st["start"]]
        m = _dre.search(r"([A-Za-z_]\w*)\[([^\]]+)\]\s*(?:=|<>|IN\s*\{[^}]*)\s*$", before, _dre.I)
        if m and m.group(1).lower() in model.names:
            t = model.names[m.group(1).lower()]
            c = model.cols[t].get(m.group(2).lower())
            prefix = text[st["start"] + 1:]
            if c and model.tables[t][c].dtype == object:
                vals = sorted({v for v in model.tables[t][c].dropna().unique() if isinstance(v, str) and '"' not in v})
                items = [{"label": v, "kind": "value", "detail": c} for v in vals if v.lower().startswith(prefix.lower())]
                if items:
                    result.update(items=items[:40], replace=len(prefix), context="value", quote='"')
        return result
    m = _dre.search(r"[A-Za-z_][A-Za-z0-9_.]*$", text)
    prefix = m.group(0) if m else ""
    head = text[:len(text) - len(prefix)]
    if head[-1:].isdigit() or head.rstrip().upper().endswith("VAR"):
        return result
    if not prefix and not force:
        return result
    low = prefix.lower()
    items = []
    items += [{"label": t, "kind": "table", "detail": ", ".join(str(c) for c in model.tables[t].columns[:4])}
              for t in sorted(model.tables) if t.lower().startswith(low)]
    items += [{"label": v, "kind": "variable", "detail": "VAR"}
              for v in dict.fromkeys(_dre.findall(r"\bVAR\s+([A-Za-z_]\w*)", text, _dre.I)) if v.lower().startswith(low)]
    names = list(DAX_SIGS) + [f for f in FUNCS if f not in DAX_SIGS]
    for f in names:
        if f.lower().startswith(low):
            params, doc = DAX_SIGS.get(f, (["..."], ""))
            items.append({"label": f, "kind": "function", "detail": "%s(%s)" % (f, ", ".join(params)),
                          "doc": doc, "call": True, "args": bool(params)})
    items += [{"label": w, "kind": "keyword", "space": True} for w in _DAX_WORDS if w.lower().startswith(low)]
    seen, unique = set(), []
    for item in items:
        if item["label"].lower() not in seen:
            seen.add(item["label"].lower())
            unique.append(item)
    result.update(items=unique[:60], replace=len(prefix), context="sql")
    return result
