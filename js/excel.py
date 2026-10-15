"""Excel formulas for the Excel track, worked out in Python.

The worker loads this the first time anything Excel runs, in a namespace of
its own (like dax.py), and takes _excel_exec, _excel_expect, _excel_complete
and _excel_selftest from it.

The workbook is the namespace's DataFrames, one sheet each. cafe's columns
are A, B, C..., its column names sit in row 1 and its data starts in row 2,
so =SUM(F2:F121) adds up cafe's revenue, and cities!A:C is the cities table.
A lesson says which sheet is open, which cell the formula goes in, and
whether it fills down to the last row of data, the way double-clicking the
fill handle does.

Values are what Excel keeps: numbers (a date is a number too, shown as a
date), text, TRUE/FALSE, empty, and error values like #N/A, which travel
through every calculation that touches them until IFERROR catches them.
"""

import math as _xm
import re as _xre
import random as _xrandom
import datetime as _xdt
from decimal import Decimal as _XD, ROUND_HALF_UP as _HALF_UP, ROUND_UP as _AWAY, ROUND_DOWN as _TOWARD


class ExcelError(Exception):
    """A formula Excel wouldn't take at all (it refuses to leave the cell),
    already worded for the learner."""


class XErr(Exception):
    """An error value, like #N/A. It sits in a cell as a value, and is raised
    when a calculation tries to use it, so it travels up until something
    (IFERROR, ISERROR...) catches it or it lands in the cell. Always raised
    fresh, as XErr(code): raising a stored one again would keep growing its
    traceback."""

    def __init__(self, code):
        Exception.__init__(self, code)
        self.code = code

    def __eq__(self, other):
        return isinstance(other, XErr) and other.code == self.code

    def __hash__(self):
        return hash(self.code)

    def __repr__(self):
        return self.code


ERROR_MEANS = {
    "#DIV/0!": "something was divided by zero, or averaged over no numbers at all",
    "#N/A": "a value isn't available, usually because a lookup found nothing or no IFS test was TRUE",
    "#VALUE!": "a calculation got the wrong kind of value, like text where a number should be",
    "#REF!": "a reference points at a cell or sheet that isn't there",
    "#NAME?": "Excel doesn't recognise a name in the formula",
    "#NUM!": "a number that can't be worked out, like the square root of a negative",
    "#SPILL!": "the answer is a list of values, and there's no room for it to spill into",
    "#CALC!": "the answer would be an empty list (FILTER found nothing, say), with nothing to show instead",
    "#NULL!": "two ranges were meant to overlap and don't",
}


class DateNum(float):
    """A date. Excel keeps a date as a count of days (2024-01-01 is 45292)
    and only shows it as a date, so it adds and compares like a number."""
    __slots__ = ()


_EPOCH = _xdt.date(1899, 12, 30)
_EPOCH_DT = _xdt.datetime(1899, 12, 30)


def _serial(d):
    if isinstance(d, _xdt.datetime):
        return DateNum((d - _EPOCH_DT).total_seconds() / 86400)
    return DateNum((d - _EPOCH).days)


def _date_of(n):
    try:
        return _EPOCH + _xdt.timedelta(days=int(_xm.floor(float(n))))
    except (OverflowError, ValueError):
        raise XErr("#NUM!")


class Arr(list):
    """A block of values, a list of rows, as a range or an array formula gives."""

    @property
    def dims(self):
        return len(self), (len(self[0]) if self else 0)


class Rng:
    """A reference to a block of cells, read when a function needs the values."""
    __slots__ = ("book", "sheet", "c1", "r1", "c2", "r2")

    def __init__(self, book, sheet, c1, r1, c2, r2):
        self.book, self.sheet, self.c1, self.r1, self.c2, self.r2 = book, sheet, c1, r1, c2, r2

    @property
    def dims(self):
        return self.r2 - self.r1 + 1, self.c2 - self.c1 + 1

    def first(self):
        return self.book.get(self.sheet, self.c1, self.r1)

    def column(self, c):
        return self.sheet.values(self.book, c, self.r1, self.r2)

    def grid(self):
        cols = [self.column(c) for c in range(self.c1, self.c2 + 1)]
        if len(cols) == 1:
            return Arr([[v] for v in cols[0]])
        return Arr([list(row) for row in zip(*cols)])

    def flat(self):
        if self.c1 == self.c2:
            return list(self.column(self.c1))
        return [v for row in self.grid() for v in row]


# ── Cells and sheets ────────────────────────────────────────────────

_MAX_COL = 16383          # XFD
_MAX_ROW = 1048576


def _col_name(i):
    s = ""
    i += 1
    while i:
        i, rem = divmod(i - 1, 26)
        s = chr(65 + rem) + s
    return s


def _col_index(s):
    n = 0
    for ch in s.upper():
        n = n * 26 + ord(ch) - 64
    return n - 1


def _addr(c, r):
    return "%s%d" % (_col_name(c), r)


_CELL = _xre.compile(r"^\$?([A-Za-z]{1,3})\$?([0-9]+)$")


def _cell_ref(text):
    m = _CELL.match(text.strip())
    if not m:
        raise ExcelError("%s isn't a cell address. One looks like H2: a column letter, then a row number." % text)
    return _col_index(m.group(1)), int(m.group(2))


def _values(col):
    """A DataFrame column as cell values: numbers, text, TRUE/FALSE, dates
    as day numbers, and None where pandas has a gap."""
    import pandas as pd
    if pd.api.types.is_datetime64_any_dtype(col):
        return [None if pd.isna(v) else _serial(v.to_pydatetime().replace(tzinfo=None)) for v in col]
    out = []
    for v in col.tolist():
        if v is None:
            out.append(None)
        elif isinstance(v, bool):
            out.append(v)
        elif isinstance(v, int):
            out.append(v)
        elif isinstance(v, float):
            out.append(None if v != v else v)
        elif isinstance(v, _xdt.datetime):
            out.append(_serial(v.replace(tzinfo=None)))
        elif isinstance(v, _xdt.date):
            out.append(_serial(v))
        else:
            try:
                gap = bool(pd.isna(v))
            except (TypeError, ValueError):
                gap = False
            out.append(None if gap else str(v))
    return out


class _Sheet:
    def __init__(self, name, frame):
        self.name = name
        self.full = [[str(frame.columns[i])] + _values(frame.iloc[:, i]) for i in range(frame.shape[1])]
        self.n = len(frame)
        self.extra = {}            # (col, row) -> ("value", v) or ("formula", ast, anchor col, anchor row)
        self.extra_cols = set()
        self.last = self.n + 1     # the last row anything is in

    def put(self, c, r, entry):
        self.extra[(c, r)] = entry
        self.extra_cols.add(c)
        self.last = max(self.last, r)

    def occupied(self, c, r):
        return (c, r) in self.extra or self.raw(c, r) is not None

    def raw(self, c, r):
        if c < len(self.full) and r - 1 < len(self.full[c]):
            return self.full[c][r - 1]
        return None

    def values(self, book, c, r1, r2):
        if c in self.extra_cols:
            return [book.get(self, c, r) for r in range(r1, r2 + 1)]
        col = self.full[c] if c < len(self.full) else []
        out = col[r1 - 1:r2]
        short = r2 - r1 + 1 - len(out)
        return out + [None] * short if short > 0 else out


class _Book:
    def __init__(self, frames):
        self.frames = {str(k).lower(): (k, v) for k, v in frames.items()}
        self.sheets = {}
        self.cache = {}
        self.busy = set()
        self.unknown = []          # names Excel wouldn't know, for the note under the result
        self.missing_sheets = []

    def sheet(self, name):
        key = name.lower()
        if key not in self.sheets:
            if key not in self.frames:
                return None
            real, frame = self.frames[key]
            self.sheets[key] = _Sheet(real, frame)
        return self.sheets[key]

    def get(self, sheet, c, r):
        e = sheet.extra.get((c, r))
        if e is None:
            return sheet.raw(c, r)
        if e[0] == "value":
            return e[1]
        key = (sheet.name, c, r)
        if key in self.cache:
            return self.cache[key]
        if key in self.busy:
            raise ExcelError("The formula in %s ends up reading %s itself: a circular reference. "
                             "Excel can't work that out, so point it at other cells." % (_addr(c, r), _addr(c, r)))
        self.busy.add(key)
        try:
            v = _cell_result(self.run(e, sheet, c, r))
        finally:
            self.busy.discard(key)
        self.cache[key] = v
        return v

    def run(self, e, sheet, c, r):
        ctx = _Ctx(self, sheet, c, r, c - e[2], r - e[3], None)
        try:
            return _ev(e[1], ctx)
        except XErr as err:
            return XErr(err.code)


class _Ctx:
    __slots__ = ("book", "sheet", "col", "row", "dc", "dr", "names")

    def __init__(self, book, sheet, col, row, dc, dr, names):
        self.book, self.sheet, self.col, self.row, self.dc, self.dr, self.names = book, sheet, col, row, dc, dr, names


def _cell_result(v):
    """What a cell shows for a formula's result: one value. An empty cell
    read by a formula shows 0, as =A1 does in Excel when A1 is empty."""
    if isinstance(v, Rng):
        if v.dims != (1, 1):
            return XErr("#SPILL!")
        v = v.first()
    if isinstance(v, Arr):
        if v.dims != (1, 1):
            return XErr("#SPILL!")
        v = v[0][0]
    return 0 if v is None else v


# ── Reading a formula ───────────────────────────────────────────────

_TOKEN = _xre.compile(r"""
  (?P<ws>\s+)
| (?P<str>"(?:[^"]|"")*")
| (?P<err>\#(?:DIV/0!|N/A|VALUE!|REF!|NAME\?|NUM!|NULL!|SPILL!|CALC!))
| (?P<sheet>(?:'(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!)
| (?P<cell>\$?[A-Za-z]{1,3}\$?[0-9]+(?::\$?[A-Za-z]{1,3}\$?[0-9]+)?(?![A-Za-z0-9_.(]))
| (?P<cols>\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}(?![A-Za-z0-9_.(!]))
| (?P<num>(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)
| (?P<name>[A-Za-z_][A-Za-z0-9_.]*)
| (?P<op><=|>=|<>|[-+*/^&=<>%(),;:{}])
""", _xre.X)

_PART = _xre.compile(r"(\$?)([A-Za-z]{1,3})(\$?)([0-9]*)$")


def _tokens(src):
    out, i = [], 0
    while i < len(src):
        m = _TOKEN.match(src, i)
        if not m:
            ch = src[i]
            if ch == '"':
                raise ExcelError("A quote mark is missing. Text in a formula needs one at each end, like \"Lagos\".")
            if ch == "'":
                raise ExcelError("There's a stray ' in the formula. Text goes in double quotes, like \"Lagos\".")
            raise ExcelError("Excel can't read the %s in this formula." % ch)
        kind = m.lastgroup
        if kind != "ws":
            out.append((kind, m.group(kind), i))
        i = m.end()
    return out


def _depth(text):
    depth, quoted = 0, False
    for ch in text:
        if ch == '"':
            quoted = not quoted
        elif not quoted and ch == "(":
            depth += 1
        elif not quoted and ch == ")":
            depth -= 1
    return depth


class _Parser:
    """Excel's grammar, loosest first: comparisons, then &, + and -, * and /,
    ^, then a leading minus (which binds tighter than ^ in Excel: =-2^2 is 4),
    then %."""

    def __init__(self, src):
        self.src = src
        self.toks = _tokens(src)
        self.i = 0

    def peek(self):
        return self.toks[self.i] if self.i < len(self.toks) else (None, None, len(self.src))

    def take(self):
        tok = self.peek()
        self.i += 1
        return tok

    def is_op(self, *ops):
        kind, text, _ = self.peek()
        return kind == "op" and text in ops

    def parse(self):
        if not self.toks:
            raise ExcelError("There's nothing after the =. Type the formula after it, like =SUM(F2:F121).")
        node = self.compare()
        if self.i < len(self.toks):
            kind, text, _ = self.peek()
            if text == ")":
                raise ExcelError("There's an extra ) in the formula, or a ( missing before it.")
            raise ExcelError("Excel can't read the formula from \"%s\" on. Is an operator, like + or a comma, missing?" % text)
        return node

    def compare(self):
        node = self.concat()
        while self.is_op("=", "<>", "<", ">", "<=", ">="):
            op = self.take()[1]
            node = ("bin", op, node, self.concat())
        return node

    def concat(self):
        node = self.add()
        while self.is_op("&"):
            self.take()
            node = ("bin", "&", node, self.add())
        return node

    def add(self):
        node = self.mul()
        while self.is_op("+", "-"):
            op = self.take()[1]
            node = ("bin", op, node, self.mul())
        return node

    def mul(self):
        node = self.power()
        while self.is_op("*", "/"):
            op = self.take()[1]
            node = ("bin", op, node, self.power())
        return node

    def power(self):
        node = self.unary()
        while self.is_op("^"):
            self.take()
            node = ("bin", "^", node, self.unary())
        return node

    def unary(self):
        if self.is_op("-"):
            self.take()
            return ("neg", self.unary())
        if self.is_op("+"):
            self.take()
            return self.unary()
        node = self.primary()
        while self.is_op("%"):
            self.take()
            node = ("pct", node)
        return node

    def primary(self):
        kind, text, pos = self.take()
        if kind is None:
            raise ExcelError("The formula stops too soon: something is missing at the end.")
        if kind == "num":
            v = float(text)
            return ("num", int(v) if v.is_integer() and "." not in text and "e" not in text.lower() else v)
        if kind == "str":
            return ("str", text[1:-1].replace('""', '"'))
        if kind == "err":
            return ("err", text.upper())
        if kind == "sheet":
            name = text[:-1]
            if name.startswith("'"):
                name = name[1:-1].replace("''", "'")
            nkind, ntext, _ = self.take()
            if nkind not in ("cell", "cols"):
                raise ExcelError("After %s! comes a cell or range, like %s!A2 or %s!A:C." % (name, name, name))
            return self.ref(ntext, name)
        if kind in ("cell", "cols"):
            return self.ref(text, None)
        if kind == "name":
            if self.is_op("("):
                self.take()
                return ("call", text.upper(), self.args(text.upper()), text)
            if text.upper() in ("TRUE", "FALSE"):
                return ("bool", text.upper() == "TRUE")
            return ("name", text.upper(), text)
        if kind == "op":
            if text == "(":
                node = self.compare()
                if not self.is_op(")"):
                    raise ExcelError("A bracket is missing: there's a ( without its ).")
                self.take()
                return node
            if text == "{":
                return self.array()
            if text in (")", ","):
                raise ExcelError("Something is missing before the \"%s\"." % text)
            if text == "=":
                raise ExcelError("There's an = in the middle where Excel expects a value. A formula has one = at the very start; to compare two things, put a value on each side of it.")
            raise ExcelError("Excel didn't expect \"%s\" there." % text)
        raise ExcelError("Excel can't read \"%s\" there." % text)

    def ref(self, text, sheet):
        ends = text.split(":")
        parts = []
        for end in ends:
            m = _PART.match(end)
            ac, letters, ar, digits = m.groups()
            parts.append((_col_index(letters), int(digits) if digits else None, bool(ac), bool(ar)))
        for c, r, _, _ in parts:
            if c > _MAX_COL or (r is not None and (r < 1 or r > _MAX_ROW)):
                raise ExcelError("%s isn't a cell on the sheet. Rows start at 1." % text)
        (c1, r1, ac1, ar1) = parts[0]
        if len(parts) == 1:
            return ("ref", sheet, c1, r1, None, None, ac1, ar1, ac1, ar1)
        (c2, r2, ac2, ar2) = parts[1]
        return ("ref", sheet, c1, r1, c2, r2, ac1, ar1, ac2, ar2)

    def args(self, name):
        args = []
        if self.is_op(")"):
            self.take()
            return args
        while True:
            if self.is_op(",", ")"):
                args.append(("blank",))
            else:
                args.append(self.compare())
            kind, text, _ = self.take()
            if kind == "op" and text == ")":
                return args
            if kind == "op" and text == ",":
                continue
            if kind == "op" and text == ";":
                raise ExcelError("Put commas between the parts of %s. Semicolons are what Excel uses with some European settings." % name)
            if kind is None:
                raise ExcelError("A bracket is missing: %s( needs a ) to close it." % name)
            if kind == "name" and text.upper() in ("AND", "OR"):
                raise ExcelError("In Excel, %s is a function, not a word between tests: put the tests inside it, "
                                 "like %s(B2=\"Lagos\", D2>=40)." % (text.upper(), text.upper()))
            raise ExcelError("Inside %s(...), parts are separated by commas. Excel didn't expect \"%s\" there." % (name, text))

    def array(self):
        rows, row = [], []
        while True:
            row.append(self.unary())
            kind, text, _ = self.take()
            if text == ",":
                continue
            if text == ";":
                rows.append(row)
                row = []
                continue
            if text == "}":
                rows.append(row)
                break
            raise ExcelError("An array like {1,2,3} needs commas between its values and a } at the end.")
        if len({len(r) for r in rows}) != 1:
            raise ExcelError("Every row of an array needs the same number of values.")
        return ("array", rows)


def _check_calls(node):
    """Excel refuses a formula with too few or too many arguments: it won't
    leave the cell. Checked before anything runs."""
    kind = node[0]
    if kind == "call":
        name, args = node[1], node[2]
        spec = FUNCS.get(name)
        if spec:
            lo, hi = spec[2], spec[3]
            sig = _signature(name)
            if len(args) < lo:
                raise ExcelError("%s needs %s inside its brackets: %s" % (
                    name, "at least %d parts" % lo if lo > 1 else "something", sig))
            if hi is not None and len(args) > hi:
                raise ExcelError("%s takes %s: %s" % (
                    name, "no arguments" if hi == 0 else "at most %d part%s" % (hi, "" if hi == 1 else "s"), sig))
            if name in _PAIRED and (len(args) - _PAIRED[name]) % 2:
                raise ExcelError("%s takes its conditions in pairs, a range and then its criteria: %s" % (name, sig))
        for a in args:
            _check_calls(a)
    elif kind == "bin":
        _check_calls(node[2])
        _check_calls(node[3])
    elif kind in ("neg", "pct"):
        _check_calls(node[1])
    elif kind == "array":
        for row in node[1]:
            for x in row:
                _check_calls(x)


def _parse_formula(text):
    """=formula text -> its tree. Raises ExcelError, worded for the learner."""
    src = text.strip()
    if src.startswith("="):
        src = src[1:]
    d = _depth(src)
    if d > 0:
        raise ExcelError("A bracket is missing: there %s %d ( without a ). Every function's brackets come in pairs." % (
            "is" if d == 1 else "are", d))
    if d < 0:
        raise ExcelError("There's an extra ) in the formula, or a ( missing before it.")
    node = _Parser(src).parse()
    _check_calls(node)
    return node


# ── Working a formula out ───────────────────────────────────────────

def _ev(node, ctx):
    kind = node[0]
    if kind in ("num", "str", "bool"):
        return node[1]
    if kind == "ref":
        return _resolve(node, ctx)
    if kind == "call":
        return _call(node, ctx)
    if kind == "bin":
        a = _value(_ev(node[2], ctx))
        b = _value(_ev(node[3], ctx))
        return _lift2(_BINOPS[node[1]], a, b)
    if kind == "neg":
        return _lift1(lambda v: -_num(v), _value(_ev(node[1], ctx)))
    if kind == "pct":
        return _lift1(lambda v: _num(v) / 100, _value(_ev(node[1], ctx)))
    if kind == "err":
        return XErr(node[1])
    if kind == "blank":
        return None
    if kind == "name":
        if ctx.names and node[1] in ctx.names:
            return ctx.names[node[1]]
        ctx.book.unknown.append(node[2])
        raise XErr("#NAME?")
    if kind == "array":
        return Arr([[_one(_arg(x, ctx)) for x in row] for row in node[1]])
    raise ExcelError("Excel can't work that formula out.")


def _arg(node, ctx):
    """An argument's value, with an error kept as a value rather than
    raised, so ISERROR and IFERROR can look at it."""
    try:
        return _ev(node, ctx)
    except XErr as err:
        return XErr(err.code)


def _resolve(node, ctx):
    _, name, c1, r1, c2, r2, ac1, ar1, ac2, ar2 = node
    book = ctx.book
    if name is None:
        sheet = ctx.sheet
    else:
        sheet = book.sheet(name)
        if sheet is None:
            book.missing_sheets.append(name)
            raise XErr("#REF!")
    if c2 is None:
        c2, r2, ac2, ar2 = c1, r1, ac1, ar1
    if not ac1:
        c1 += ctx.dc
    if not ac2:
        c2 += ctx.dc
    if r1 is None:                        # whole columns: row 1 to the last row in use
        r1, r2 = 1, sheet.last
    else:
        if not ar1:
            r1 += ctx.dr
        if not ar2:
            r2 += ctx.dr
    if min(c1, c2) < 0 or min(r1, r2) < 1:
        raise XErr("#REF!")
    return Rng(book, sheet, min(c1, c2), min(r1, r2), max(c1, c2), max(r1, r2))


def _value(v):
    """A reference read: one cell's value, or a block of them."""
    if isinstance(v, Rng):
        return v.first() if v.dims == (1, 1) else v.grid()
    return v


def _one(v):
    """One value from whatever came back: a single cell, a 1x1 block."""
    v = _value(v)
    if isinstance(v, Arr):
        return v[0][0] if v.dims == (1, 1) else XErr("#VALUE!")
    return v


def _pick(g, i, j):
    rows, cols = len(g), len(g[0])
    ii = 0 if rows == 1 else i
    jj = 0 if cols == 1 else j
    if ii >= rows or jj >= cols:
        return XErr("#N/A")
    return g[ii][jj]


def _lift1(f, a):
    if isinstance(a, Arr):
        out = []
        for row in a:
            new = []
            for x in row:
                try:
                    new.append(f(x))
                except XErr as err:
                    new.append(XErr(err.code))
            out.append(new)
        return Arr(out)
    return f(a)


def _lift2(f, a, b):
    if not isinstance(a, Arr) and not isinstance(b, Arr):
        return f(a, b)
    ga = a if isinstance(a, Arr) else Arr([[a]])
    gb = b if isinstance(b, Arr) else Arr([[b]])
    rows = max(len(ga), len(gb))
    cols = max(len(ga[0]), len(gb[0]))
    out = []
    for i in range(rows):
        new = []
        for j in range(cols):
            try:
                new.append(f(_pick(ga, i, j), _pick(gb, i, j)))
            except XErr as err:
                new.append(XErr(err.code))
        out.append(new)
    return Arr(out)


def _call(node, ctx):
    name, args = node[1], node[2]
    spec = FUNCS.get(name)
    if spec is None:
        ctx.book.unknown.append(node[3])
        raise XErr("#NAME?")
    kind, f = spec[0], spec[1]
    if kind == "lazy":
        return f(args, ctx)
    vals = [_arg(a, ctx) for a in args]
    if kind != "scalar" and name not in _KEEPS_ERRORS:
        for v in vals:                    # an error going in is the answer coming out
            if isinstance(v, XErr):
                raise XErr(v.code)
    if kind == "scalar":
        vals = [_value(v) for v in vals]
        if any(isinstance(v, Arr) and v.dims != (1, 1) for v in vals):
            return _broadcast(f, vals)
        return f(*[v[0][0] if isinstance(v, Arr) else v for v in vals])
    if kind == "ctx":
        return f(ctx, *vals)
    return f(*vals)


def _broadcast(f, vals):
    blocks = [v for v in vals if isinstance(v, Arr)]
    rows = max(len(v) for v in blocks)
    cols = max(len(v[0]) for v in blocks)
    out = []
    for i in range(rows):
        new = []
        for j in range(cols):
            args = [_pick(v, i, j) if isinstance(v, Arr) else v for v in vals]
            try:
                new.append(_one(f(*args)))
            except XErr as err:
                new.append(XErr(err.code))
        out.append(new)
    return Arr(out)


# ── Values, the way Excel treats them ───────────────────────────────

def _is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


_NUMBER = _xre.compile(r"^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?(?:[eE][+-]?\d+)?$")
_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July",
           "August", "September", "October", "November", "December"]
_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _parse_date(s):
    s = s.strip()
    m = _xre.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})$", s)
    try:
        if m:
            return _serial(_xdt.date(int(m.group(1)), int(m.group(2)), int(m.group(3))))
        m = _xre.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", s)        # day first, as in the UK
        if m:
            return _serial(_xdt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))))
        m = _xre.match(r"^(\d{1,2})[ -]([A-Za-z]{3,9})[ -](\d{4})$", s)
        if m:
            month = [x.lower()[:3] for x in _MONTH_NAMES].index(m.group(2).lower()[:3]) + 1
            return _serial(_xdt.date(int(m.group(3)), month, int(m.group(1))))
    except ValueError:
        return None
    return None


def _parse_number(s):
    t = s.strip()
    if not t:
        return None
    pct = t.endswith("%")
    if pct:
        t = t[:-1].strip()
    if t[:1] in "£$€":
        t = t[1:]
    if t and _NUMBER.match(t) and any(ch.isdigit() for ch in t):
        v = float(t.replace(",", ""))
        if pct:
            return v / 100
        return int(v) if v.is_integer() and "." not in t and "e" not in t.lower() else v
    if not pct:
        return _parse_date(s)
    return None


def _num(v):
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, (int, float)):
        return v
    if v is None:
        return 0
    if isinstance(v, XErr):
        raise XErr(v.code)
    if isinstance(v, str):
        n = _parse_number(v)
        if n is None:
            raise XErr("#VALUE!")
        return n
    if isinstance(v, (Arr, Rng)):
        return _num(_one(v))
    raise XErr("#VALUE!")


def _int(v):
    return int(_xm.floor(_num(v) + 1e-9)) if _num(v) >= 0 else -int(_xm.floor(-_num(v) + 1e-9))


def _general(n, digits=10):
    """A number the way Excel's General format writes it."""
    if isinstance(n, int) and not isinstance(n, bool):
        return str(n)
    n = float(n)
    if n != n or n in (float("inf"), float("-inf")):
        return "#NUM!"
    if n == int(n) and abs(n) < 1e15:
        return str(int(n))
    s = "%.*g" % (digits, n)
    if "e" in s:
        mant, exp = s.split("e")
        return "%sE%s%02d" % (mant, exp[0], abs(int(exp)))
    return s


def _text(v):
    if isinstance(v, str):
        return v
    if v is None:
        return ""
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, XErr):
        raise XErr(v.code)
    if isinstance(v, (int, float)):
        return _general(v, 15)          # a date joins as its day number, as in Excel
    if isinstance(v, (Arr, Rng)):
        return _text(_one(v))
    raise XErr("#VALUE!")


def _bool(v):
    if isinstance(v, bool):
        return v
    if v is None:
        return False
    if isinstance(v, (int, float)):
        return v != 0
    if isinstance(v, XErr):
        raise XErr(v.code)
    if isinstance(v, str):
        u = v.strip().upper()
        if u == "TRUE":
            return True
        if u == "FALSE":
            return False
    raise XErr("#VALUE!")


def _rank(v):
    return 2 if isinstance(v, bool) else 1 if isinstance(v, str) else 0


def _compare(a, b):
    """-1, 0 or 1, as Excel orders values: numbers, then text (ignoring
    case), then TRUE/FALSE. An empty cell is 0, "" or FALSE, whichever
    it's compared with."""
    if isinstance(a, XErr):
        raise XErr(a.code)
    if isinstance(b, XErr):
        raise XErr(b.code)
    if a is None and b is None:
        return 0
    if a is None:
        a = "" if isinstance(b, str) else (False if isinstance(b, bool) else 0)
    if b is None:
        b = "" if isinstance(a, str) else (False if isinstance(a, bool) else 0)
    ra, rb = _rank(a), _rank(b)
    if ra != rb:
        return -1 if ra < rb else 1
    if ra == 1:
        a, b = a.lower(), b.lower()
    elif ra == 0:
        a, b = float(a), float(b)
        if abs(a - b) <= 1e-12 * max(1.0, abs(a), abs(b)):
            return 0
    return (a > b) - (a < b)


def _feq(a, b):
    return abs(float(a) - float(b)) <= 1e-12 * max(1.0, abs(float(a)), abs(float(b)))


def _add(a, b):
    x, y = _num(a), _num(b)
    r = x + y
    return DateNum(r) if isinstance(x, DateNum) != isinstance(y, DateNum) else r


def _sub(a, b):
    x, y = _num(a), _num(b)
    r = x - y
    return DateNum(r) if isinstance(x, DateNum) and not isinstance(y, DateNum) else (float(r) if isinstance(r, DateNum) else r)


def _div(a, b):
    x, y = _num(a), _num(b)
    if y == 0:
        raise XErr("#DIV/0!")
    return x / y


def _pow(a, b):
    x, y = float(_num(a)), float(_num(b))
    if x == 0 and y == 0:
        raise XErr("#NUM!")
    if x == 0 and y < 0:
        raise XErr("#DIV/0!")
    try:
        r = x ** y
    except OverflowError:
        raise XErr("#NUM!")
    if isinstance(r, complex):
        raise XErr("#NUM!")
    return int(r) if r.is_integer() and abs(r) < 1e15 and float(_num(a)).is_integer() and y >= 0 else r


def _mul(a, b):
    r = _num(a) * _num(b)
    return float(r) if isinstance(r, DateNum) else r


_BINOPS = {
    "+": _add, "-": _sub, "*": _mul, "/": _div, "^": _pow,
    "&": lambda a, b: _text(a) + _text(b),
    "=": lambda a, b: _compare(a, b) == 0,
    "<>": lambda a, b: _compare(a, b) != 0,
    "<": lambda a, b: _compare(a, b) < 0,
    ">": lambda a, b: _compare(a, b) > 0,
    "<=": lambda a, b: _compare(a, b) <= 0,
    ">=": lambda a, b: _compare(a, b) >= 0,
}


def _flat(v):
    if isinstance(v, Rng):
        return v.flat()
    if isinstance(v, Arr):
        return [x for row in v for x in row]
    return [v]


def _grid(v):
    if isinstance(v, Rng):
        return v.grid()
    if isinstance(v, Arr):
        return v
    return Arr([[v]])


def _dims(v):
    if isinstance(v, (Rng, Arr)):
        return v.dims
    return (1, 1)


def _block(v):
    return isinstance(v, (Rng, Arr))


def _numbers(vals):
    """The numbers SUM, AVERAGE and friends use. Inside a range: numbers
    only, text and empty cells skipped. Typed in directly: TRUE is 1 and
    "3" is 3."""
    out = []
    for v in vals:
        if _block(v):
            for x in _flat(v):
                if isinstance(x, XErr):
                    raise XErr(x.code)
                if _is_num(x):
                    out.append(x)
        elif v is None:
            continue
        else:
            out.append(_num(v))
    return out


def _total(nums):
    s = _xm.fsum(nums)
    if all(isinstance(n, int) and not isinstance(n, bool) for n in nums):
        return int(s)
    return s


def _round_to(n, digits, mode):
    n = _num(n)
    d = _int(digits)
    x = _XD(repr(float(n)))
    if d >= 0:
        r = x.quantize(_XD(1).scaleb(-d), rounding=mode)
    else:
        r = (x.scaleb(d)).quantize(_XD(1), rounding=mode).scaleb(-d)
    f = float(r)
    return int(f) if d <= 0 and abs(f) < 1e15 else f


# ── Criteria: "Lagos", ">=40", "lat*", "<>" ─────────────────────────

_WILD = {}


def _wild(pattern):
    """Excel's wildcards as a regex: * any run of characters, ? any one,
    ~ before either makes it literal. Case doesn't matter."""
    rx = _WILD.get(pattern)
    if rx is None:
        out, i = "", 0
        while i < len(pattern):
            ch = pattern[i]
            if ch == "~" and i + 1 < len(pattern) and pattern[i + 1] in "*?~":
                out += _xre.escape(pattern[i + 1])
                i += 2
                continue
            out += ".*" if ch == "*" else "." if ch == "?" else _xre.escape(ch)
            i += 1
        rx = _WILD[pattern] = _xre.compile(out, _xre.I | _xre.S)
    return rx


def _has_wild(s):
    return any(ch in s for ch in "*?")


def _criterion(c):
    """A SUMIF-style criterion as a test on one cell's value."""
    c = _one(c)
    if isinstance(c, XErr):
        raise XErr(c.code)
    if c is None:
        c = ""
    if isinstance(c, bool):
        return lambda v: isinstance(v, bool) and v == c
    if _is_num(c):
        return lambda v: _is_num(v) and _feq(v, c)
    s = str(c)
    m = _xre.match(r"^(<=|>=|<>|=|<|>)(.*)$", s, _xre.S)
    op, rest = (m.group(1), m.group(2)) if m else ("=", s)
    num = _parse_number(rest) if rest.strip() else None
    if num is not None:
        tests = {
            "=": lambda v: _is_num(v) and _feq(v, num),
            "<>": lambda v: not (_is_num(v) and _feq(v, num)),
            "<": lambda v: _is_num(v) and v < num and not _feq(v, num),
            ">": lambda v: _is_num(v) and v > num and not _feq(v, num),
            "<=": lambda v: _is_num(v) and (v < num or _feq(v, num)),
            ">=": lambda v: _is_num(v) and (v > num or _feq(v, num)),
        }
        return tests[op]
    if rest.upper() in ("TRUE", "FALSE"):
        flag = rest.upper() == "TRUE"
        same = lambda v: isinstance(v, bool) and v == flag
        return same if op == "=" else (lambda v: not same(v)) if op == "<>" else (lambda v: False)
    if op in ("=", "<>"):
        if rest == "":
            same = lambda v: v is None or v == ""
        elif _has_wild(rest):
            rx = _wild(rest)
            same = lambda v: isinstance(v, str) and rx.fullmatch(v) is not None
        else:
            low = rest.lower()
            same = lambda v: isinstance(v, str) and v.lower() == low
        return same if op == "=" else (lambda v: not same(v))
    low = rest.lower()
    cmp = {"<": lambda a: a < low, ">": lambda a: a > low, "<=": lambda a: a <= low, ">=": lambda a: a >= low}[op]
    return lambda v: isinstance(v, str) and cmp(v.lower())


def _same_shape(a, b):
    if _dims(a) != _dims(b):
        raise XErr("#VALUE!")


def _mask(pairs, shape):
    mask = None
    for i in range(0, len(pairs), 2):
        rng, crit = pairs[i], pairs[i + 1]
        if _dims(rng) != shape:
            raise XErr("#VALUE!")
        test = _criterion(crit)
        hits = [test(v) for v in _flat(rng)]
        mask = hits if mask is None else [a and b for a, b in zip(mask, hits)]
    return mask


def _resized(rng, like):
    """SUMIF's sum range takes the criteria range's size, from its top-left cell."""
    if isinstance(rng, Rng) and isinstance(like, Rng):
        rows, cols = like.dims
        return Rng(rng.book, rng.sheet, rng.c1, rng.r1, rng.c1 + cols - 1, rng.r1 + rows - 1).flat()
    vals = _flat(rng)
    if len(vals) != len(_flat(like)):
        raise XErr("#VALUE!")
    return vals


def _nums_where(vals, mask):
    out = []
    for v, keep in zip(vals, mask):
        if keep:
            if isinstance(v, XErr):
                raise XErr(v.code)
            if _is_num(v):
                out.append(v)
    return out


# ── The functions ───────────────────────────────────────────────────
# Each is registered with how it takes its arguments:
#   scalar  one value each, and it repeats over a block (UPPER(B2:B5) spills)
#   range   ranges and blocks as they are (SUM, VLOOKUP...)
#   ctx     as range, plus the cell it's in (ROW())
#   lazy    the unworked arguments (IF only works out the side it needs)

FUNCS = {}
SIGS = {}
# These look at an error argument themselves rather than failing with it:
# COUNTA counts it, CHOOSE may pick another value, XLOOKUP's if_not_found
# and FILTER's if_empty are only used when needed.
_KEEPS_ERRORS = {"CHOOSE", "XLOOKUP", "COUNTA", "VSTACK", "HSTACK", "FILTER"}
_PAIRED = {"SUMIFS": 1, "AVERAGEIFS": 1, "MAXIFS": 1, "MINIFS": 1, "COUNTIFS": 0, "IFS": 0}
_NOT_GIVEN = object()


def _fn(names, kind, lo, hi, params, doc):
    def wrap(f):
        for n in names.split():
            FUNCS[n] = (kind, f, lo, hi)
            SIGS[n] = (params, doc)
        return f
    return wrap


def _signature(name):
    params = SIGS.get(name, ([], ""))[0]
    return "%s(%s)" % (name, ", ".join(params))


# Maths

@_fn("SUM", "range", 1, None, ["number1", "[number2]", "..."], "Adds up numbers. In a range, text and empty cells are skipped.")
def _SUM(*vals):
    return _total(_numbers(vals))


@_fn("AVERAGE", "range", 1, None, ["number1", "[number2]", "..."], "The mean: the total divided by how many numbers. Empty cells aren't counted.")
def _AVERAGE(*vals):
    nums = _numbers(vals)
    if not nums:
        raise XErr("#DIV/0!")
    return _xm.fsum(nums) / len(nums)


@_fn("MIN", "range", 1, None, ["number1", "[number2]", "..."], "The smallest number.")
def _MIN(*vals):
    nums = _numbers(vals)
    return min(nums) if nums else 0


@_fn("MAX", "range", 1, None, ["number1", "[number2]", "..."], "The largest number.")
def _MAX(*vals):
    nums = _numbers(vals)
    return max(nums) if nums else 0


@_fn("COUNT", "range", 1, None, ["value1", "[value2]", "..."], "How many cells hold numbers (dates count; text and empty cells don't).")
def _COUNT(*vals):
    n = 0
    for v in vals:
        if _block(v):
            n += sum(1 for x in _flat(v) if _is_num(x))
        elif _is_num(v) or (isinstance(v, str) and _parse_number(v) is not None):
            n += 1
    return n


@_fn("COUNTA", "range", 1, None, ["value1", "[value2]", "..."], "How many cells aren't empty, whatever is in them.")
def _COUNTA(*vals):
    n = 0
    for v in vals:
        if _block(v):
            n += sum(1 for x in _flat(v) if x is not None)
        elif v is not None:
            n += 1
    return n


@_fn("COUNTBLANK", "range", 1, 1, ["range"], "How many cells in the range are empty.")
def _COUNTBLANK(rng):
    return sum(1 for x in _flat(rng) if x is None or x == "")


@_fn("PRODUCT", "range", 1, None, ["number1", "[number2]", "..."], "Multiplies the numbers together.")
def _PRODUCT(*vals):
    nums = _numbers(vals)
    out = 1
    for n in nums:
        out *= n
    return out if nums else 0


@_fn("SUMPRODUCT", "range", 1, None, ["array1", "[array2]", "..."], "Multiplies the arrays item by item, then adds it all up. Non-numbers count as 0.")
def _SUMPRODUCT(*arrays):
    grids = [_flat(a) for a in arrays]
    shape = _dims(arrays[0])
    for a in arrays:
        if _dims(a) != shape:
            raise XErr("#VALUE!")
    total = 0.0
    for items in zip(*grids):
        p = 1.0
        for x in items:
            if isinstance(x, XErr):
                raise XErr(x.code)
            p *= x if _is_num(x) else 0
        total += p
    return int(total) if total.is_integer() and abs(total) < 1e15 else total


@_fn("ROUND", "scalar", 2, 2, ["number", "num_digits"], "Rounds to that many decimal places. Halves round away from zero.")
def _ROUND(n, d):
    return _round_to(n, d, _HALF_UP)


@_fn("ROUNDUP", "scalar", 2, 2, ["number", "num_digits"], "Rounds away from zero, always.")
def _ROUNDUP(n, d):
    return _round_to(n, d, _AWAY)


@_fn("ROUNDDOWN", "scalar", 2, 2, ["number", "num_digits"], "Rounds towards zero, always.")
def _ROUNDDOWN(n, d):
    return _round_to(n, d, _TOWARD)


@_fn("INT", "scalar", 1, 1, ["number"], "Rounds down to a whole number.")
def _INT(n):
    return int(_xm.floor(_num(n)))


@_fn("TRUNC", "scalar", 1, 2, ["number", "[num_digits]"], "Cuts off the decimals, without rounding.")
def _TRUNC(n, d=0):
    return _round_to(n, d, _TOWARD)


@_fn("ABS", "scalar", 1, 1, ["number"], "The number without its minus sign.")
def _ABS(n):
    return abs(_num(n))


@_fn("MOD", "scalar", 2, 2, ["number", "divisor"], "The remainder after dividing.")
def _MOD(n, d):
    x, y = _num(n), _num(d)
    if y == 0:
        raise XErr("#DIV/0!")
    r = x - y * _xm.floor(x / y)
    return int(r) if isinstance(x, int) and isinstance(y, int) else r


@_fn("QUOTIENT", "scalar", 2, 2, ["numerator", "denominator"], "How many whole times one number goes into another.")
def _QUOTIENT(n, d):
    y = _num(d)
    if y == 0:
        raise XErr("#DIV/0!")
    return int(_num(n) / y)


@_fn("POWER", "scalar", 2, 2, ["number", "power"], "A number raised to a power, like ^.")
def _POWER(n, p):
    return _pow(n, p)


@_fn("SQRT", "scalar", 1, 1, ["number"], "The square root.")
def _SQRT(n):
    x = _num(n)
    if x < 0:
        raise XErr("#NUM!")
    return _xm.sqrt(x)


@_fn("EXP", "scalar", 1, 1, ["number"], "e raised to the number.")
def _EXP(n):
    try:
        return _xm.exp(_num(n))
    except OverflowError:
        raise XErr("#NUM!")


@_fn("LN", "scalar", 1, 1, ["number"], "The natural logarithm.")
def _LN(n):
    x = _num(n)
    if x <= 0:
        raise XErr("#NUM!")
    return _xm.log(x)


@_fn("LOG", "scalar", 1, 2, ["number", "[base]"], "The logarithm, base 10 unless you give another.")
def _LOG(n, base=10):
    x, b = _num(n), _num(base)
    if x <= 0 or b <= 0:
        raise XErr("#NUM!")
    if b == 1:
        raise XErr("#DIV/0!")
    return _xm.log(x, b)


@_fn("LOG10", "scalar", 1, 1, ["number"], "The base-10 logarithm.")
def _LOG10(n):
    return _LOG(n, 10)


@_fn("SIGN", "scalar", 1, 1, ["number"], "1 for positive, -1 for negative, 0 for zero.")
def _SIGN(n):
    x = _num(n)
    return (x > 0) - (x < 0)


@_fn("PI", "range", 0, 0, [], "The number pi, 3.14159...")
def _PI():
    return _xm.pi


def _to_multiple(n, sig, mode):
    x, s = _num(n), _num(sig)
    if s == 0:
        return 0
    q = _XD(repr(float(x))) / _XD(repr(float(abs(s))))
    q = q.to_integral_value(rounding=mode)
    r = float(q * _XD(repr(float(abs(s)))))
    return int(r) if r.is_integer() and abs(r) < 1e15 else r


@_fn("CEILING CEILING.MATH", "scalar", 1, 2, ["number", "[significance]"], "Rounds up to the next multiple of significance (1 if you leave it out).")
def _CEILING(n, sig=1):
    from decimal import ROUND_CEILING
    return _to_multiple(n, sig, ROUND_CEILING)


@_fn("FLOOR FLOOR.MATH", "scalar", 1, 2, ["number", "[significance]"], "Rounds down to a multiple of significance (1 if you leave it out).")
def _FLOOR(n, sig=1):
    from decimal import ROUND_FLOOR
    return _to_multiple(n, sig, ROUND_FLOOR)


@_fn("MROUND", "scalar", 2, 2, ["number", "multiple"], "Rounds to the nearest multiple.")
def _MROUND(n, m):
    if _num(n) * _num(m) < 0:
        raise XErr("#NUM!")
    return _to_multiple(n, m, _HALF_UP)


@_fn("RAND", "range", 0, 0, [], "A random number between 0 and 1, new every time the sheet works itself out.")
def _RAND():
    return _xrandom.random()


@_fn("RANDBETWEEN", "scalar", 2, 2, ["bottom", "top"], "A random whole number between the two.")
def _RANDBETWEEN(lo, hi):
    a, b = _xm.ceil(_num(lo)), _xm.floor(_num(hi))
    if a > b:
        raise XErr("#NUM!")
    return _xrandom.randint(a, b)


# Statistics

@_fn("MEDIAN", "range", 1, None, ["number1", "[number2]", "..."], "The middle value once they're sorted.")
def _MEDIAN(*vals):
    nums = sorted(_numbers(vals))
    if not nums:
        raise XErr("#NUM!")
    mid = len(nums) // 2
    return nums[mid] if len(nums) % 2 else (nums[mid - 1] + nums[mid]) / 2


@_fn("MODE MODE.SNGL", "range", 1, None, ["number1", "[number2]", "..."], "The number that turns up most often.")
def _MODE(*vals):
    nums = _numbers(vals)
    counts = {}
    for n in nums:
        counts[n] = counts.get(n, 0) + 1
    best = max(counts.values()) if counts else 0
    if best < 2:
        raise XErr("#N/A")
    return next(n for n in nums if counts[n] == best)


def _spread(vals, sample):
    nums = _numbers(vals)
    need = 2 if sample else 1
    if len(nums) < need:
        raise XErr("#DIV/0!")
    mean = _xm.fsum(nums) / len(nums)
    return _xm.fsum((x - mean) ** 2 for x in nums) / (len(nums) - (1 if sample else 0))


@_fn("STDEV STDEV.S", "range", 1, None, ["number1", "[number2]", "..."], "Standard deviation of a sample: how spread out the numbers are.")
def _STDEV_S(*vals):
    return _xm.sqrt(_spread(vals, True))


@_fn("STDEVP STDEV.P", "range", 1, None, ["number1", "[number2]", "..."], "Standard deviation of a whole population.")
def _STDEV_P(*vals):
    return _xm.sqrt(_spread(vals, False))


@_fn("VAR VAR.S", "range", 1, None, ["number1", "[number2]", "..."], "Variance of a sample.")
def _VAR_S(*vals):
    return _spread(vals, True)


@_fn("VARP VAR.P", "range", 1, None, ["number1", "[number2]", "..."], "Variance of a whole population.")
def _VAR_P(*vals):
    return _spread(vals, False)


@_fn("LARGE", "range", 2, 2, ["array", "k"], "The k-th largest number: k=1 is the biggest.")
def _LARGE(arr, k):
    nums = sorted(_numbers([arr]), reverse=True)
    i = _int(k)
    if i < 1 or i > len(nums):
        raise XErr("#NUM!")
    return nums[i - 1]


@_fn("SMALL", "range", 2, 2, ["array", "k"], "The k-th smallest number: k=1 is the smallest.")
def _SMALL(arr, k):
    nums = sorted(_numbers([arr]))
    i = _int(k)
    if i < 1 or i > len(nums):
        raise XErr("#NUM!")
    return nums[i - 1]


def _rank_of(n, ref, order, avg):
    x = _num(_one(n))
    nums = _numbers([ref])
    if not any(_feq(x, v) for v in nums):
        raise XErr("#N/A")
    asc = order is not None and _num(_one(order)) != 0
    ahead = sum(1 for v in nums if (v < x if asc else v > x) and not _feq(v, x))
    ties = sum(1 for v in nums if _feq(v, x))
    return ahead + (ties + 1) / 2 if avg else ahead + 1


@_fn("RANK RANK.EQ", "range", 2, 3, ["number", "ref", "[order]"], "Where the number comes in the list: 1 is the biggest (order 1: the smallest). Ties share a rank.")
def _RANK(n, ref, order=None):
    if _block(n) and _dims(n) != (1, 1):
        return Arr([[_rank_of(v, ref, order, False) if not isinstance(v, XErr) else v for v in row] for row in _grid(n)])
    return _rank_of(n, ref, order, False)


@_fn("RANK.AVG", "range", 2, 3, ["number", "ref", "[order]"], "Like RANK.EQ, but ties get the average of the places they share.")
def _RANK_AVG(n, ref, order=None):
    return _rank_of(n, ref, order, True)


def _percentile(nums, k):
    nums = sorted(nums)
    if not nums or k < 0 or k > 1:
        raise XErr("#NUM!")
    pos = (len(nums) - 1) * k
    lo = int(_xm.floor(pos))
    hi = min(lo + 1, len(nums) - 1)
    return nums[lo] + (nums[hi] - nums[lo]) * (pos - lo)


@_fn("PERCENTILE PERCENTILE.INC", "range", 2, 2, ["array", "k"], "The value k of the way up the sorted list: 0.9 is the 90th percentile.")
def _PERCENTILE(arr, k):
    return _percentile(_numbers([arr]), _num(_one(k)))


@_fn("QUARTILE QUARTILE.INC", "range", 2, 2, ["array", "quart"], "A quartile: 1 is a quarter of the way up, 2 the median, 3 three quarters.")
def _QUARTILE(arr, q):
    qq = _int(_one(q))
    if qq < 0 or qq > 4:
        raise XErr("#NUM!")
    return _percentile(_numbers([arr]), qq / 4)


@_fn("CORREL", "range", 2, 2, ["array1", "array2"], "How closely two columns move together, from -1 to 1.")
def _CORREL(a, b):
    xs, ys = _flat(a), _flat(b)
    if len(xs) != len(ys):
        raise XErr("#N/A")
    pairs = [(x, y) for x, y in zip(xs, ys) if _is_num(x) and _is_num(y)]
    if len(pairs) < 2:
        raise XErr("#DIV/0!")
    mx = sum(p[0] for p in pairs) / len(pairs)
    my = sum(p[1] for p in pairs) / len(pairs)
    sxy = sum((x - mx) * (y - my) for x, y in pairs)
    sxx = sum((x - mx) ** 2 for x, _ in pairs)
    syy = sum((y - my) ** 2 for _, y in pairs)
    if sxx == 0 or syy == 0:
        raise XErr("#DIV/0!")
    return sxy / _xm.sqrt(sxx * syy)


# Counting and adding up by condition

@_fn("COUNTIF", "range", 2, 2, ["range", "criteria"], "How many cells in the range match: \"Lagos\", \">=40\", \"lat*\".")
def _COUNTIF(rng, crit):
    test = _criterion(crit)
    return sum(1 for v in _flat(rng) if test(v))


@_fn("COUNTIFS", "range", 2, None, ["criteria_range1", "criteria1", "[criteria_range2, criteria2]", "..."], "How many rows match every condition.")
def _COUNTIFS(*pairs):
    return sum(1 for keep in _mask(pairs, _dims(pairs[0])) if keep)


@_fn("SUMIF", "range", 2, 3, ["range", "criteria", "[sum_range]"], "Adds up the sum_range where the range matches the criteria.")
def _SUMIF(rng, crit, sum_rng=_NOT_GIVEN):
    test = _criterion(crit)
    keys = _flat(rng)
    vals = keys if sum_rng is _NOT_GIVEN or sum_rng is None else _resized(sum_rng, rng)
    return _total(_nums_where(vals, [test(k) for k in keys]))


@_fn("SUMIFS", "range", 3, None, ["sum_range", "criteria_range1", "criteria1", "[criteria_range2, criteria2]", "..."], "Adds up sum_range where every condition matches. The range to add comes first.")
def _SUMIFS(sum_rng, *pairs):
    return _total(_nums_where(_flat(sum_rng), _mask(pairs, _dims(sum_rng))))


@_fn("AVERAGEIF", "range", 2, 3, ["range", "criteria", "[average_range]"], "The average of average_range where the range matches.")
def _AVERAGEIF(rng, crit, avg_rng=_NOT_GIVEN):
    test = _criterion(crit)
    keys = _flat(rng)
    vals = keys if avg_rng is _NOT_GIVEN or avg_rng is None else _resized(avg_rng, rng)
    nums = _nums_where(vals, [test(k) for k in keys])
    if not nums:
        raise XErr("#DIV/0!")
    return _xm.fsum(nums) / len(nums)


@_fn("AVERAGEIFS", "range", 3, None, ["average_range", "criteria_range1", "criteria1", "[criteria_range2, criteria2]", "..."], "The average of average_range where every condition matches.")
def _AVERAGEIFS(avg_rng, *pairs):
    nums = _nums_where(_flat(avg_rng), _mask(pairs, _dims(avg_rng)))
    if not nums:
        raise XErr("#DIV/0!")
    return _xm.fsum(nums) / len(nums)


@_fn("MAXIFS", "range", 3, None, ["max_range", "criteria_range1", "criteria1", "..."], "The largest number in max_range where every condition matches.")
def _MAXIFS(rng, *pairs):
    nums = _nums_where(_flat(rng), _mask(pairs, _dims(rng)))
    return max(nums) if nums else 0


@_fn("MINIFS", "range", 3, None, ["min_range", "criteria_range1", "criteria1", "..."], "The smallest number in min_range where every condition matches.")
def _MINIFS(rng, *pairs):
    nums = _nums_where(_flat(rng), _mask(pairs, _dims(rng)))
    return min(nums) if nums else 0


# Logic

@_fn("IF", "lazy", 2, 3, ["logical_test", "value_if_true", "[value_if_false]"], "One value if the test is TRUE, another if it's FALSE.")
def _IF(args, ctx):
    test = _value(_arg(args[0], ctx))
    if isinstance(test, Arr) and test.dims != (1, 1):
        yes = _value(_arg(args[1], ctx))
        no = _value(_arg(args[2], ctx)) if len(args) > 2 else False
        return _broadcast(lambda t, y, n: y if _bool(t) else n, [test, yes, no])
    if _bool(_one(test)):
        return _ev(args[1], ctx)
    return _ev(args[2], ctx) if len(args) > 2 else False


@_fn("IFS", "lazy", 2, None, ["logical_test1", "value_if_true1", "[logical_test2, value_if_true2]", "..."], "The value for the first test that's TRUE. End with TRUE, \"else\" for everything left.")
def _IFS(args, ctx):
    for i in range(0, len(args), 2):
        if _bool(_one(_ev(args[i], ctx))):
            return _ev(args[i + 1], ctx)
    raise XErr("#N/A")


def _catch(args, ctx, only_na):
    v = _value(_arg(args[0], ctx))

    def bad(x):
        return isinstance(x, XErr) and (not only_na or x.code == "#N/A")
    if isinstance(v, Arr):
        if not any(bad(x) for row in v for x in row):
            return v
        alt = _one(_arg(args[1], ctx))
        return Arr([[alt if bad(x) else x for x in row] for row in v])
    if bad(v):
        return _arg(args[1], ctx)
    return v


@_fn("IFERROR", "lazy", 2, 2, ["value", "value_if_error"], "The value, unless it's an error (#N/A, #DIV/0!...): then the second one instead.")
def _IFERROR(args, ctx):
    return _catch(args, ctx, False)


@_fn("IFNA", "lazy", 2, 2, ["value", "value_if_na"], "The value, unless it's #N/A: then the second one instead.")
def _IFNA(args, ctx):
    return _catch(args, ctx, True)


@_fn("SWITCH", "lazy", 3, None, ["expression", "value1", "result1", "[value2, result2]", "...", "[default]"], "Compares the expression with each value and gives the matching result.")
def _SWITCH(args, ctx):
    key = _one(_ev(args[0], ctx))
    if isinstance(key, XErr):
        raise XErr(key.code)
    rest = args[1:]
    for i in range(0, len(rest) - 1, 2):
        if _compare(key, _one(_ev(rest[i], ctx))) == 0:
            return _ev(rest[i + 1], ctx)
    if len(rest) % 2:
        return _ev(rest[-1], ctx)
    raise XErr("#N/A")


def _logicals(vals):
    out = []
    for v in vals:
        if _block(v):
            for x in _flat(v):
                if isinstance(x, XErr):
                    raise XErr(x.code)
                if isinstance(x, bool):
                    out.append(x)
                elif _is_num(x):
                    out.append(x != 0)
        elif v is None:
            continue
        else:
            out.append(_bool(v))
    if not out:
        raise XErr("#VALUE!")
    return out


@_fn("AND", "range", 1, None, ["logical1", "[logical2]", "..."], "TRUE only if every test is TRUE.")
def _AND(*vals):
    return all(_logicals(vals))


@_fn("OR", "range", 1, None, ["logical1", "[logical2]", "..."], "TRUE if any test is TRUE.")
def _OR(*vals):
    return any(_logicals(vals))


@_fn("XOR", "range", 1, None, ["logical1", "[logical2]", "..."], "TRUE if an odd number of the tests are TRUE.")
def _XOR(*vals):
    return sum(_logicals(vals)) % 2 == 1


@_fn("NOT", "scalar", 1, 1, ["logical"], "Turns TRUE into FALSE, and FALSE into TRUE.")
def _NOT(v):
    return not _bool(v)


@_fn("TRUE", "range", 0, 0, [], "TRUE.")
def _TRUE():
    return True


@_fn("FALSE", "range", 0, 0, [], "FALSE.")
def _FALSE():
    return False


@_fn("LET", "lazy", 3, None, ["name1", "value1", "[name2, value2]", "...", "calculation"], "Names a value once, then uses the name in the calculation at the end.")
def _LET(args, ctx):
    if len(args) % 2 == 0:
        raise ExcelError("LET takes names and values in pairs, then one calculation at the end: LET(total, SUM(F2:F121), total/2).")
    names = dict(ctx.names or {})
    for i in range(0, len(args) - 1, 2):
        node = args[i]
        if node[0] != "name":
            raise ExcelError("In LET, each name is a plain word, like total or price, that doesn't look like a cell address.")
        sub = _Ctx(ctx.book, ctx.sheet, ctx.col, ctx.row, ctx.dc, ctx.dr, dict(names))
        names[node[1]] = _arg(args[i + 1], sub)
    return _ev(args[-1], _Ctx(ctx.book, ctx.sheet, ctx.col, ctx.row, ctx.dc, ctx.dr, names))


@_fn("CHOOSE", "range", 2, None, ["index_num", "value1", "[value2]", "..."], "Picks a value by number: CHOOSE(2, \"a\", \"b\") is \"b\".")
def _CHOOSE(i, *vals):
    k = _int(_one(i))
    if k < 1 or k > len(vals):
        raise XErr("#VALUE!")
    return vals[k - 1]


# Information

@_fn("ISBLANK", "scalar", 1, 1, ["value"], "TRUE if the cell is empty.")
def _ISBLANK(v):
    return v is None


@_fn("ISNUMBER", "scalar", 1, 1, ["value"], "TRUE if it's a number (a date is one too).")
def _ISNUMBER(v):
    return _is_num(v)


@_fn("ISTEXT", "scalar", 1, 1, ["value"], "TRUE if it's text.")
def _ISTEXT(v):
    return isinstance(v, str)


@_fn("ISNONTEXT", "scalar", 1, 1, ["value"], "TRUE if it isn't text.")
def _ISNONTEXT(v):
    return not isinstance(v, str)


@_fn("ISLOGICAL", "scalar", 1, 1, ["value"], "TRUE if it's TRUE or FALSE.")
def _ISLOGICAL(v):
    return isinstance(v, bool)


@_fn("ISERROR", "scalar", 1, 1, ["value"], "TRUE if it's any error value.")
def _ISERROR(v):
    return isinstance(v, XErr)


@_fn("ISERR", "scalar", 1, 1, ["value"], "TRUE if it's an error other than #N/A.")
def _ISERR(v):
    return isinstance(v, XErr) and v.code != "#N/A"


@_fn("ISNA", "scalar", 1, 1, ["value"], "TRUE if it's #N/A.")
def _ISNA(v):
    return isinstance(v, XErr) and v.code == "#N/A"


@_fn("ISEVEN", "scalar", 1, 1, ["number"], "TRUE if the number is even.")
def _ISEVEN(v):
    return int(_num(v)) % 2 == 0


@_fn("ISODD", "scalar", 1, 1, ["number"], "TRUE if the number is odd.")
def _ISODD(v):
    return int(_num(v)) % 2 == 1


@_fn("NA", "range", 0, 0, [], "The #N/A error, on purpose.")
def _NA():
    return XErr("#N/A")


# Lookups

def _find_exact(values, key, wild):
    if isinstance(key, XErr):
        raise XErr(key.code)
    if key is None:
        return None
    if isinstance(key, str):
        if wild and _has_wild(key):
            rx = _wild(key)
            for i, v in enumerate(values):
                if isinstance(v, str) and rx.fullmatch(v):
                    return i
            return None
        low = key.lower()
        for i, v in enumerate(values):
            if isinstance(v, str) and v.lower() == low:
                return i
        return None
    if isinstance(key, bool):
        for i, v in enumerate(values):
            if isinstance(v, bool) and v == key:
                return i
        return None
    for i, v in enumerate(values):
        if _is_num(v) and _feq(v, key):
            return i
    return None


def _find_sorted(values, key, descending=False):
    """Approximate match, as VLOOKUP's TRUE and MATCH's 1 and -1 do: the
    last value not past the key, reading down a list sorted that way."""
    if isinstance(key, XErr):
        raise XErr(key.code)
    best = None
    for i, v in enumerate(values):
        if v is None or _rank(v) != _rank(key):
            continue
        c = _compare(v, key)
        if (c >= 0) if descending else (c <= 0):
            best = i
            if c == 0:
                continue
        else:
            break
    return best


def _each(f, key, *rest):
    """A lookup of a whole block of values at once: one answer each."""
    g = _grid(key)
    out = []
    for row in g:
        new = []
        for k in row:
            try:
                new.append(_one(f(k, *rest)))
            except XErr as err:
                new.append(XErr(err.code))
        out.append(new)
    return Arr(out)


@_fn("VLOOKUP", "range", 3, 4, ["lookup_value", "table_array", "col_index_num", "[range_lookup]"], "Finds the value in the table's first column and gives the cell col_index_num across. End with FALSE for an exact match.")
def _VLOOKUP(key, table, col, approx=True):
    if _block(key) and _dims(key) != (1, 1):
        return _each(_VLOOKUP, key, table, col, approx)
    key = _one(key)
    g = _grid(table)
    c = _int(_one(col))
    if c < 1:
        raise XErr("#VALUE!")
    if c > len(g[0]):
        raise XErr("#REF!")
    first = [row[0] for row in g]
    exact = not _bool(_one(approx))
    i = _find_exact(first, key, True) if exact else _find_sorted(first, key)
    if i is None:
        raise XErr("#N/A")
    return g[i][c - 1]


@_fn("HLOOKUP", "range", 3, 4, ["lookup_value", "table_array", "row_index_num", "[range_lookup]"], "Like VLOOKUP, but across the table's first row.")
def _HLOOKUP(key, table, row, approx=True):
    key = _one(key)
    g = _grid(table)
    r = _int(_one(row))
    if r < 1:
        raise XErr("#VALUE!")
    if r > len(g):
        raise XErr("#REF!")
    exact = not _bool(_one(approx))
    i = _find_exact(g[0], key, True) if exact else _find_sorted(g[0], key)
    if i is None:
        raise XErr("#N/A")
    return g[r - 1][i]


def _xfind(keys, key, mode, search):
    order = list(range(len(keys)))
    if search < 0:
        order.reverse()
    if mode in (0, 2):
        for i in order:
            v = keys[i]
            if mode == 2 and isinstance(key, str) and isinstance(v, str):
                if _wild(key).fullmatch(v):
                    return i
            elif v is not None and _rank(v) == _rank(key) and _compare(v, key) == 0:
                return i
        return None
    best = None
    for i in order:
        v = keys[i]
        if v is None or _rank(v) != _rank(key):
            continue
        c = _compare(v, key)
        if c == 0:
            return i
        if mode == -1 and c < 0 and (best is None or _compare(v, keys[best]) > 0):
            best = i
        if mode == 1 and c > 0 and (best is None or _compare(v, keys[best]) < 0):
            best = i
    return best


@_fn("XLOOKUP", "range", 3, 6, ["lookup_value", "lookup_array", "return_array", "[if_not_found]", "[match_mode]", "[search_mode]"], "Finds the value in lookup_array and gives what's in the same place in return_array. Exact by default.")
def _XLOOKUP(key, look_in, ret, missing=_NOT_GIVEN, match_mode=0, search_mode=1):
    if _block(key) and _dims(key) != (1, 1):
        return _each(_XLOOKUP, key, look_in, ret, missing, match_mode, search_mode)
    key = _one(key)
    for v in (key, look_in, ret):
        if isinstance(v, XErr):
            raise XErr(v.code)
    rows, cols = _dims(look_in)
    if rows != 1 and cols != 1:
        raise XErr("#VALUE!")
    keys = _flat(look_in)
    g = _grid(ret)
    down = cols == 1 and rows > 1 or (rows == 1 and cols == 1)
    if (down and len(g) != len(keys)) or (not down and len(g[0]) != len(keys)):
        raise XErr("#VALUE!")
    mode = 0 if match_mode is None else _int(_one(match_mode))
    search = 1 if search_mode is None else _int(_one(search_mode))
    if mode not in (-1, 0, 1, 2):
        raise XErr("#VALUE!")
    i = _xfind(keys, key, mode, search)
    if i is None:
        if missing is _NOT_GIVEN or missing is None:
            raise XErr("#N/A")
        return missing
    if down:
        row = g[i]
        return row[0] if len(row) == 1 else Arr([list(row)])
    col = [r[i] for r in g]
    return col[0] if len(col) == 1 else Arr([[x] for x in col])


@_fn("INDEX", "range", 2, 3, ["array", "row_num", "[column_num]"], "The value at that row and column of the range, counting from 1.")
def _INDEX(arr, row, col=_NOT_GIVEN):
    g = _grid(arr)
    nr, nc = len(g), len(g[0])
    r = 0 if row is None else _int(_one(row))
    if col is _NOT_GIVEN:
        if nr == 1 and nc > 1:
            r, c = 1, r
        else:
            c = 1 if nc == 1 else 0
    else:
        c = 0 if col is None else _int(_one(col))
    if r < 0 or c < 0 or r > nr or c > nc:
        raise XErr("#REF!")
    if r == 0 and c == 0:
        return g
    if r == 0:
        return Arr([[row_[c - 1]] for row_ in g])
    if c == 0:
        return Arr([list(g[r - 1])])
    return g[r - 1][c - 1]


@_fn("MATCH", "range", 2, 3, ["lookup_value", "lookup_array", "[match_type]"], "Where the value is in the list, counting from 1. Use 0 for an exact match.")
def _MATCH(key, arr, kind=1):
    if _block(key) and _dims(key) != (1, 1):
        return _each(_MATCH, key, arr, kind)
    key = _one(key)
    rows, cols = _dims(arr)
    if rows != 1 and cols != 1:
        raise XErr("#N/A")
    values = _flat(arr)
    t = 1 if kind is None else _int(_one(kind))
    if t == 0:
        i = _find_exact(values, key, True)
    else:
        i = _find_sorted(values, key, descending=t < 0)
    if i is None:
        raise XErr("#N/A")
    return i + 1


@_fn("XMATCH", "range", 2, 4, ["lookup_value", "lookup_array", "[match_mode]", "[search_mode]"], "Where the value is in the list, counting from 1. Exact by default.")
def _XMATCH(key, arr, match_mode=0, search_mode=1):
    key = _one(key)
    values = _flat(arr)
    mode = 0 if match_mode is None else _int(_one(match_mode))
    search = 1 if search_mode is None else _int(_one(search_mode))
    i = _xfind(values, key, mode, search)
    if i is None:
        raise XErr("#N/A")
    return i + 1


@_fn("ROW", "ctx", 0, 1, ["[reference]"], "The row number of a cell, or of the cell the formula is in.")
def _ROW(ctx, ref=_NOT_GIVEN):
    if ref is _NOT_GIVEN:
        return ctx.row
    if not isinstance(ref, Rng):
        raise XErr("#VALUE!")
    if ref.r1 == ref.r2:
        return ref.r1
    return Arr([[r] for r in range(ref.r1, ref.r2 + 1)])


@_fn("COLUMN", "ctx", 0, 1, ["[reference]"], "The column number of a cell (A is 1), or of the cell the formula is in.")
def _COLUMN(ctx, ref=_NOT_GIVEN):
    if ref is _NOT_GIVEN:
        return ctx.col + 1
    if not isinstance(ref, Rng):
        raise XErr("#VALUE!")
    return ref.c1 + 1


@_fn("ROWS", "range", 1, 1, ["array"], "How many rows the range has.")
def _ROWS(arr):
    return _dims(arr)[0]


@_fn("COLUMNS", "range", 1, 1, ["array"], "How many columns the range has.")
def _COLUMNS(arr):
    return _dims(arr)[1]


# Dynamic arrays: one formula, a block of answers spilling down

def _sort_key(v):
    if v is None:
        return (3, 0)
    if isinstance(v, bool):
        return (2, v)
    if isinstance(v, str):
        return (1, v.lower())
    if isinstance(v, XErr):
        return (4, v.code)
    return (0, float(v))


def _norm(v):
    if isinstance(v, str):
        return ("s", v.lower())
    if _is_num(v):
        return ("n", round(float(v), 9))
    return ("o", repr(v))


@_fn("UNIQUE", "range", 1, 3, ["array", "[by_col]", "[exactly_once]"], "Each different value once, in the order they first turn up. It spills down.")
def _UNIQUE(arr, by_col=False, once=False):
    g = _grid(arr)
    across = _bool(_one(by_col)) if by_col is not None else False
    rows = [list(r) for r in zip(*g)] if across else [list(r) for r in g]
    counts, order = {}, []
    for r in rows:
        key = tuple(_norm(v) for v in r)
        if key not in counts:
            order.append((key, r))
            counts[key] = 0
        counts[key] += 1
    only = _bool(_one(once)) if once is not None else False
    keep = [r for key, r in order if not only or counts[key] == 1]
    if not keep:
        raise XErr("#CALC!")
    return Arr([list(x) for x in zip(*keep)]) if across else Arr(keep)


@_fn("SORT", "range", 1, 4, ["array", "[sort_index]", "[sort_order]", "[by_col]"], "The range sorted by one of its columns: sort_order 1 is smallest first, -1 largest first.")
def _SORT(arr, index=1, order=1, by_col=False):
    g = [list(r) for r in _grid(arr)]
    i = 1 if index is None else _int(_one(index))
    o = 1 if order is None else _int(_one(order))
    if o not in (1, -1) or i < 1 or i > len(g[0]):
        raise XErr("#VALUE!")
    return Arr(sorted(g, key=lambda r: _sort_key(r[i - 1]), reverse=o == -1))


@_fn("SORTBY", "range", 2, None, ["array", "by_array1", "[sort_order1]", "..."], "The range sorted by another column of the same length.")
def _SORTBY(arr, *keys):
    g = [list(r) for r in _grid(arr)]
    pairs = []
    for i in range(0, len(keys), 2):
        by = _flat(keys[i])
        if len(by) != len(g):
            raise XErr("#VALUE!")
        o = _int(_one(keys[i + 1])) if i + 1 < len(keys) and keys[i + 1] is not None else 1
        pairs.append((by, o))
    idx = list(range(len(g)))
    for by, o in reversed(pairs):
        idx.sort(key=lambda j: _sort_key(by[j]), reverse=o == -1)
    return Arr([g[j] for j in idx])


@_fn("FILTER", "range", 2, 3, ["array", "include", "[if_empty]"], "Only the rows where include is TRUE, like D2:D121>40. It spills down.")
def _FILTER(arr, include, if_empty=_NOT_GIVEN):
    for v in (arr, include):
        if isinstance(v, XErr):
            raise XErr(v.code)
    g = _grid(arr)
    inc = _grid(include)
    if len(inc) == len(g) and len(inc[0]) == 1:
        keep = [r for r, flag in zip(g, inc) if _bool(flag[0])]
        out = Arr([list(r) for r in keep])
    elif len(inc) == 1 and len(inc[0]) == len(g[0]):
        cols = [j for j, flag in enumerate(inc[0]) if _bool(flag)]
        out = Arr([[r[j] for j in cols] for r in g]) if cols else Arr([])
    else:
        raise XErr("#VALUE!")
    if not out or not out[0]:
        if if_empty is _NOT_GIVEN:
            raise XErr("#CALC!")
        return if_empty
    return out


@_fn("SEQUENCE", "range", 1, 4, ["rows", "[columns]", "[start]", "[step]"], "A block of numbers counting up: SEQUENCE(5) is 1 to 5, down a column.")
def _SEQUENCE(rows, cols=1, start=1, step=1):
    nr = _int(_one(rows))
    nc = 1 if cols is None else _int(_one(cols))
    s = 1 if start is None else _num(_one(start))
    st = 1 if step is None else _num(_one(step))
    if nr < 0 or nc < 0:
        raise XErr("#VALUE!")
    if nr == 0 or nc == 0:
        raise XErr("#CALC!")                 # an empty list, as Excel says
    if nr * nc > 100000:
        raise XErr("#NUM!")
    return Arr([[s + (i * nc + j) * st for j in range(nc)] for i in range(nr)])


@_fn("TRANSPOSE", "range", 1, 1, ["array"], "Turns rows into columns and columns into rows.")
def _TRANSPOSE(arr):
    g = _grid(arr)
    return Arr([list(r) for r in zip(*g)])


@_fn("TAKE", "range", 2, 3, ["array", "rows", "[columns]"], "The first rows (or the last, with a minus number).")
def _TAKE(arr, rows, cols=_NOT_GIVEN):
    g = [list(r) for r in _grid(arr)]
    if rows is not None:
        k = _int(_one(rows))
        g = g[:k] if k >= 0 else g[k:]
    if cols is not _NOT_GIVEN and cols is not None:
        k = _int(_one(cols))
        g = [r[:k] if k >= 0 else r[k:] for r in g]
    if not g or not g[0]:
        raise XErr("#CALC!")
    return Arr(g)


@_fn("DROP", "range", 2, 3, ["array", "rows", "[columns]"], "Everything except the first rows (or the last, with a minus number).")
def _DROP(arr, rows, cols=_NOT_GIVEN):
    g = [list(r) for r in _grid(arr)]
    if rows is not None:
        k = _int(_one(rows))
        g = g[k:] if k >= 0 else g[:k]
    if cols is not _NOT_GIVEN and cols is not None:
        k = _int(_one(cols))
        g = [r[k:] if k >= 0 else r[:k] for r in g]
    if not g or not g[0]:
        raise XErr("#CALC!")
    return Arr(g)


@_fn("CHOOSECOLS", "range", 2, None, ["array", "col_num1", "[col_num2]", "..."], "Just the columns you name, by number.")
def _CHOOSECOLS(arr, *nums):
    g = _grid(arr)
    picks = []
    for n in nums:
        k = _int(_one(n))
        if k == 0 or abs(k) > len(g[0]):
            raise XErr("#VALUE!")
        picks.append(k - 1 if k > 0 else len(g[0]) + k)
    return Arr([[r[j] for j in picks] for r in g])


@_fn("VSTACK", "range", 1, None, ["array1", "[array2]", "..."], "Stacks ranges on top of each other.")
def _VSTACK(*arrs):
    grids = [_grid(a) for a in arrs]
    width = max(len(g[0]) for g in grids)
    return Arr([list(r) + [XErr("#N/A")] * (width - len(r)) for g in grids for r in g])


@_fn("HSTACK", "range", 1, None, ["array1", "[array2]", "..."], "Puts ranges side by side.")
def _HSTACK(*arrs):
    grids = [_grid(a) for a in arrs]
    height = max(len(g) for g in grids)
    out = []
    for i in range(height):
        row = []
        for g in grids:
            row += list(g[i]) if i < len(g) else [XErr("#N/A")] * len(g[0])
        out.append(row)
    return Arr(out)


# Text

@_fn("LEFT", "scalar", 1, 2, ["text", "[num_chars]"], "The first characters of the text (1 if you don't say how many).")
def _LEFT(t, n=1):
    k = _int(n)
    if k < 0:
        raise XErr("#VALUE!")
    return _text(t)[:k]


@_fn("RIGHT", "scalar", 1, 2, ["text", "[num_chars]"], "The last characters of the text.")
def _RIGHT(t, n=1):
    k = _int(n)
    if k < 0:
        raise XErr("#VALUE!")
    s = _text(t)
    return s[-k:] if k else ""


@_fn("MID", "scalar", 3, 3, ["text", "start_num", "num_chars"], "Characters from the middle: where to start (1 is the first), and how many.")
def _MID(t, start, n):
    a, k = _int(start), _int(n)
    if a < 1 or k < 0:
        raise XErr("#VALUE!")
    return _text(t)[a - 1:a - 1 + k]


@_fn("LEN", "scalar", 1, 1, ["text"], "How many characters, spaces included.")
def _LEN(t):
    return len(_text(t))


@_fn("UPPER", "scalar", 1, 1, ["text"], "THE TEXT IN CAPITALS.")
def _UPPER(t):
    return _text(t).upper()


@_fn("LOWER", "scalar", 1, 1, ["text"], "the text in small letters.")
def _LOWER(t):
    return _text(t).lower()


@_fn("PROPER", "scalar", 1, 1, ["text"], "A Capital At The Start Of Each Word.")
def _PROPER(t):
    return _text(t).title()


@_fn("TRIM", "scalar", 1, 1, ["text"], "Removes spaces at the ends, and doubled spaces in the middle.")
def _TRIM(t):
    return _xre.sub(" +", " ", _text(t)).strip(" ")


@_fn("CLEAN", "scalar", 1, 1, ["text"], "Removes characters that don't print, like line breaks.")
def _CLEAN(t):
    return "".join(ch for ch in _text(t) if ord(ch) >= 32)


@_fn("SUBSTITUTE", "scalar", 3, 4, ["text", "old_text", "new_text", "[instance_num]"], "Swaps old_text for new_text, every time (or just the n-th).")
def _SUBSTITUTE(t, old, new, inst=None):
    s, o, n = _text(t), _text(old), _text(new)
    if not o:
        return s
    if inst is None:
        return s.replace(o, n)
    k = _int(inst)
    if k < 1:
        raise XErr("#VALUE!")
    at = -1
    for _ in range(k):
        at = s.find(o, at + 1)
        if at < 0:
            return s
    return s[:at] + n + s[at + len(o):]


@_fn("REPLACE", "scalar", 4, 4, ["old_text", "start_num", "num_chars", "new_text"], "Replaces characters by position: from start_num, num_chars of them.")
def _REPLACE(t, start, n, new):
    s, a, k = _text(t), _int(start), _int(n)
    if a < 1 or k < 0:
        raise XErr("#VALUE!")
    return s[:a - 1] + _text(new) + s[a - 1 + k:]


@_fn("FIND", "scalar", 2, 3, ["find_text", "within_text", "[start_num]"], "Where find_text starts, counting from 1. Capitals matter.")
def _FIND(f, within, start=1):
    a = _int(start)
    s = _text(within)
    if a < 1 or a > len(s) + 1:
        raise XErr("#VALUE!")
    i = s.find(_text(f), a - 1)
    if i < 0:
        raise XErr("#VALUE!")
    return i + 1


@_fn("SEARCH", "scalar", 2, 3, ["find_text", "within_text", "[start_num]"], "Like FIND, but capitals don't matter and * and ? work as wildcards.")
def _SEARCH(f, within, start=1):
    a = _int(start)
    s = _text(within)
    if a < 1 or a > len(s) + 1:
        raise XErr("#VALUE!")
    m = _wild(_text(f)).search(s, a - 1)
    if not m:
        raise XErr("#VALUE!")
    return m.start() + 1


@_fn("CONCAT", "range", 1, None, ["text1", "[text2]", "..."], "Joins text together, whole ranges included.")
def _CONCAT(*vals):
    return "".join(_text(x) for v in vals for x in _flat(v))


@_fn("CONCATENATE", "scalar", 1, None, ["text1", "[text2]", "..."], "Joins text together, the older way. & does the same.")
def _CONCATENATE(*vals):
    return "".join(_text(v) for v in vals)


@_fn("TEXTJOIN", "range", 3, None, ["delimiter", "ignore_empty", "text1", "[text2]", "..."], "Joins text with a separator between each, like \", \".")
def _TEXTJOIN(delim, ignore, *vals):
    d = _text(_one(delim))
    skip = _bool(_one(ignore))
    parts = [_text(x) for v in vals for x in _flat(v) if not (skip and (x is None or x == ""))]
    return d.join(parts)


@_fn("TEXT", "scalar", 2, 2, ["value", "format_text"], "A number or date as text, in a format: \"0.00\", \"#,##0\", \"0%\", \"dd/mm/yyyy\", \"mmm\".")
def _TEXT(v, fmt):
    return _format(v, _text(fmt))


@_fn("VALUE", "scalar", 1, 1, ["text"], "Text that looks like a number, as a number.")
def _VALUE(t):
    if _is_num(t):
        return t
    if isinstance(t, str):
        n = _parse_number(t)
        if n is not None:
            return n
    if isinstance(t, XErr):
        raise XErr(t.code)
    raise XErr("#VALUE!")


@_fn("NUMBERVALUE", "scalar", 1, 1, ["text"], "Text that looks like a number, as a number.")
def _NUMBERVALUE(t):
    return _VALUE(t)


@_fn("REPT", "scalar", 2, 2, ["text", "number_times"], "The text repeated: REPT(\"*\", 3) is ***.")
def _REPT(t, n):
    k = _int(n)
    if k < 0:
        raise XErr("#VALUE!")
    return _text(t) * k


@_fn("EXACT", "scalar", 2, 2, ["text1", "text2"], "TRUE if the two are exactly the same, capitals included.")
def _EXACT(a, b):
    return _text(a) == _text(b)


@_fn("TEXTBEFORE", "scalar", 2, 3, ["text", "delimiter", "[instance_num]"], "The text before the delimiter.")
def _TEXTBEFORE(t, d, inst=1):
    s, dl, k = _text(t), _text(d), 1 if inst is None else _int(inst)
    parts = s.split(dl) if dl else [s]
    if k < 1 or k >= len(parts):
        raise XErr("#N/A")
    return dl.join(parts[:k])


@_fn("TEXTAFTER", "scalar", 2, 3, ["text", "delimiter", "[instance_num]"], "The text after the delimiter.")
def _TEXTAFTER(t, d, inst=1):
    s, dl, k = _text(t), _text(d), 1 if inst is None else _int(inst)
    parts = s.split(dl) if dl else [s]
    if k < 1 or k >= len(parts):
        raise XErr("#N/A")
    return dl.join(parts[k:])


@_fn("CHAR", "scalar", 1, 1, ["number"], "The character with that code: CHAR(10) is a line break.")
def _CHAR(n):
    k = _int(n)
    if k < 1 or k > 255:
        raise XErr("#VALUE!")
    return chr(k)


# Dates

def _date_arg(v):
    if isinstance(v, XErr):
        raise XErr(v.code)
    if isinstance(v, str):
        d = _parse_date(v)
        if d is None:
            n = _parse_number(v)
            if n is None:
                raise XErr("#VALUE!")
            return n
        return d
    n = _num(v)
    if n < 0:
        raise XErr("#NUM!")
    return n


def _make_date(y, m, d):
    y = int(y)
    if 0 <= y < 1900:
        y += 1900
    m = int(m)
    y += (m - 1) // 12
    m = (m - 1) % 12 + 1
    if y < 1900 or y > 9999:
        raise XErr("#NUM!")
    try:
        day = _xdt.date(y, m, 1) + _xdt.timedelta(days=int(d) - 1)
    except OverflowError:
        raise XErr("#NUM!")
    if day < _xdt.date(1900, 1, 1):
        raise XErr("#NUM!")
    return _serial(day)


@_fn("DATE", "scalar", 3, 3, ["year", "month", "day"], "A date from its parts: DATE(2024, 3, 1) is 1 March 2024.")
def _DATE(y, m, d):
    return _make_date(_int(y), _int(m), _int(d))


@_fn("YEAR", "scalar", 1, 1, ["date"], "The year of a date.")
def _YEAR(d):
    return _date_of(_date_arg(d)).year


@_fn("MONTH", "scalar", 1, 1, ["date"], "The month of a date, 1 to 12.")
def _MONTH(d):
    return _date_of(_date_arg(d)).month


@_fn("DAY", "scalar", 1, 1, ["date"], "The day of the month, 1 to 31.")
def _DAY(d):
    return _date_of(_date_arg(d)).day


@_fn("WEEKDAY", "scalar", 1, 2, ["date", "[return_type]"], "The day of the week as a number. Type 2 counts Monday as 1, Sunday as 7.")
def _WEEKDAY(d, kind=1):
    wd = _date_of(_date_arg(d)).weekday()       # Monday is 0
    t = 1 if kind is None else _int(kind)
    if t == 1:
        return (wd + 1) % 7 + 1
    if t == 2:
        return wd + 1
    if t == 3:
        return wd
    raise XErr("#NUM!")


@_fn("WEEKNUM", "scalar", 1, 2, ["date", "[return_type]"], "Which week of the year: week 1 holds 1 January. Type 2 starts weeks on Monday.")
def _WEEKNUM(d, kind=1):
    day = _date_of(_date_arg(d))
    t = 1 if kind is None else _int(kind)
    start = 6 if t == 1 else 0                # the weekday a week starts on (Python: Monday 0)
    jan1 = _xdt.date(day.year, 1, 1)
    offset = (jan1.weekday() - start) % 7
    return (day.timetuple().tm_yday - 1 + offset) // 7 + 1


@_fn("ISOWEEKNUM", "scalar", 1, 1, ["date"], "The ISO week number, as used across Europe: weeks start on Monday.")
def _ISOWEEKNUM(d):
    return _date_of(_date_arg(d)).isocalendar()[1]


def _add_months(d, months):
    day = _date_of(d)
    m = day.month - 1 + months
    y = day.year + m // 12
    m = m % 12 + 1
    if y < 1900 or y > 9999:
        raise XErr("#NUM!")
    return y, m, day.day


@_fn("EOMONTH", "scalar", 2, 2, ["start_date", "months"], "The last day of the month, so many months on: EOMONTH(A2, 0) is the end of A2's month.")
def _EOMONTH(d, months):
    y, m, _ = _add_months(_date_arg(d), _int(months))
    nxt = _xdt.date(y + (m == 12), m % 12 + 1, 1)
    return _serial(nxt - _xdt.timedelta(days=1))


@_fn("EDATE", "scalar", 2, 2, ["start_date", "months"], "The same day, so many months on (or back, with a minus).")
def _EDATE(d, months):
    y, m, day = _add_months(_date_arg(d), _int(months))
    nxt = _xdt.date(y + (m == 12), m % 12 + 1, 1)
    last = (nxt - _xdt.timedelta(days=1)).day
    return _serial(_xdt.date(y, m, min(day, last)))


@_fn("DATEDIF", "scalar", 3, 3, ["start_date", "end_date", "unit"], "Whole years (\"Y\"), months (\"M\") or days (\"D\") between two dates.")
def _DATEDIF(a, b, unit):
    s, e = _date_of(_date_arg(a)), _date_of(_date_arg(b))
    if s > e:
        raise XErr("#NUM!")
    u = _text(unit).upper()
    months = (e.year - s.year) * 12 + e.month - s.month - (1 if e.day < s.day else 0)
    if u == "D":
        return (e - s).days
    if u == "M":
        return months
    if u == "Y":
        return months // 12
    if u == "YM":
        return months % 12
    if u == "MD":
        if e.day >= s.day:
            return e.day - s.day
        return (_xdt.date(e.year, e.month, 1) - _xdt.timedelta(days=1)).day - s.day + e.day
    raise XErr("#NUM!")


@_fn("DAYS", "scalar", 2, 2, ["end_date", "start_date"], "How many days from start_date to end_date.")
def _DAYS(e, s):
    return int(_xm.floor(_date_arg(e))) - int(_xm.floor(_date_arg(s)))


@_fn("NETWORKDAYS", "range", 2, 3, ["start_date", "end_date", "[holidays]"], "Working days (Monday to Friday) from one date to the other, both included.")
def _NETWORKDAYS(a, b, holidays=None):
    s, e = int(_date_arg(_one(a))), int(_date_arg(_one(b)))
    sign = 1
    if s > e:
        s, e, sign = e, s, -1
    off = set()
    if holidays is not None:
        off = {int(x) for x in _flat(holidays) if _is_num(x)}
    n = sum(1 for k in range(s, e + 1) if _date_of(k).weekday() < 5 and k not in off)
    return sign * n


@_fn("WORKDAY", "range", 2, 3, ["start_date", "days", "[holidays]"], "The working day so many working days on, skipping weekends.")
def _WORKDAY(a, days, holidays=None):
    k = int(_date_arg(_one(a)))
    left = _int(_one(days))
    step = 1 if left >= 0 else -1
    off = {int(x) for x in _flat(holidays) if _is_num(x)} if holidays is not None else set()
    while left:
        k += step
        if _date_of(k).weekday() < 5 and k not in off:
            left -= step
    return DateNum(k)


@_fn("TODAY", "range", 0, 0, [], "Today's date. It changes every day, so a sheet using it changes too.")
def _TODAY():
    return _serial(_xdt.date.today())


@_fn("NOW", "range", 0, 0, [], "The date and time right now.")
def _NOW():
    return _serial(_xdt.datetime.now())


@_fn("DATEVALUE", "scalar", 1, 1, ["date_text"], "A date written as text, like \"2024-03-01\", as a real date.")
def _DATEVALUE(t):
    d = _parse_date(_text(t))
    if d is None:
        raise XErr("#VALUE!")
    return d


# ── Formats, for TEXT ───────────────────────────────────────────────

_DATE_TOKEN = _xre.compile(r'("[^"]*")|(\\.)|(yyyy|yy|mmmmm|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s|am/pm)|(.)', _xre.I | _xre.S)


def _literal_parts(fmt):
    """The format with quoted text and \\x escapes turned into plain text,
    as (is_literal, text) pieces."""
    out = []
    i = 0
    while i < len(fmt):
        ch = fmt[i]
        if ch == '"':
            j = fmt.find('"', i + 1)
            j = len(fmt) if j < 0 else j
            out.append((True, fmt[i + 1:j]))
            i = j + 1
        elif ch == "\\" and i + 1 < len(fmt):
            out.append((True, fmt[i + 1]))
            i += 2
        elif ch in "_*" and i + 1 < len(fmt):
            i += 2                           # padding codes: nothing to show here
        else:
            out.append((False, ch))
            i += 1
    return out


def _is_date_format(fmt):
    code = "".join(t for lit, t in _literal_parts(fmt) if not lit).lower()
    return bool(_xre.search(r"[ydhs]|m", code)) and not _xre.search(r"[0#?]", code)


def _format_date(n, fmt):
    day = _date_of(n)
    frac = float(n) - _xm.floor(float(n))
    secs = int(round(frac * 86400))
    hh, mm, ss = secs // 3600, secs // 60 % 60, secs % 60
    out = []
    last = None
    for quoted, esc, code, other in _DATE_TOKEN.findall(fmt):
        if quoted:
            out.append(quoted[1:-1])
        elif esc:
            out.append(esc[1])
        elif code:
            c = code.lower()
            if c in ("m", "mm") and last in ("h", "hh"):
                out.append("%02d" % mm if c == "mm" else str(mm))
            elif c == "yyyy":
                out.append("%04d" % day.year)
            elif c == "yy":
                out.append("%02d" % (day.year % 100))
            elif c == "mmmmm":
                out.append(_MONTH_NAMES[day.month - 1][0])
            elif c == "mmmm":
                out.append(_MONTH_NAMES[day.month - 1])
            elif c == "mmm":
                out.append(_MONTH_NAMES[day.month - 1][:3])
            elif c == "mm":
                out.append("%02d" % day.month)
            elif c == "m":
                out.append(str(day.month))
            elif c == "dddd":
                out.append(_DAY_NAMES[day.weekday()])
            elif c == "ddd":
                out.append(_DAY_NAMES[day.weekday()][:3])
            elif c == "dd":
                out.append("%02d" % day.day)
            elif c == "d":
                out.append(str(day.day))
            elif c == "hh":
                out.append("%02d" % hh)
            elif c == "h":
                out.append(str(hh))
            elif c == "ss":
                out.append("%02d" % ss)
            elif c == "s":
                out.append(str(ss))
            elif c == "am/pm":
                out.append("AM" if hh < 12 else "PM")
            last = c
        else:
            out.append(other)
    return "".join(out)


def _split_sections(fmt):
    parts, cur, quoted = [], "", False
    for ch in fmt:
        if ch == '"':
            quoted = not quoted
        if ch == ";" and not quoted:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    return parts


def _format_number(n, fmt):
    pieces = _literal_parts(fmt)
    code_idx = [i for i, (lit, t) in enumerate(pieces) if not lit and t in "0#?.,"]
    if not code_idx:
        text = "".join(t for _, t in pieces)
        pct = sum(1 for lit, t in pieces if not lit and t == "%")
        return text if not pct else text
    a, b = code_idx[0], code_idx[-1]
    pre = "".join(t for _, t in pieces[:a])
    core = "".join(t for _, t in pieces[a:b + 1])
    post = "".join(t for _, t in pieces[b + 1:])
    pct = sum(1 for lit, t in pieces if not lit and t == "%")
    x = float(n) * (100 ** pct)
    ip, _, dp = core.partition(".")
    places = sum(1 for ch in dp if ch in "0#?")
    must = sum(1 for ch in dp if ch == "0")
    q = _XD(repr(abs(x))).quantize(_XD(1).scaleb(-places), rounding=_HALF_UP)
    digits = "{:f}".format(q)
    whole, _, frac = digits.partition(".")
    while len(frac) > must and frac.endswith("0"):
        frac = frac[:-1]
    min_int = ip.count("0")
    if whole == "0" and min_int == 0:
        whole = ""
    whole = whole.rjust(min_int, "0")
    if "," in ip and whole:
        whole = "{:,}".format(int(whole))
    body = whole + ("." + frac if frac else "")
    sign = "-" if x < 0 and float(q) != 0 else ""
    return sign + pre + body + post


def _format(v, fmt):
    if isinstance(v, XErr):
        raise XErr(v.code)
    if fmt.strip().lower() == "general":
        return _text(v) if not _is_num(v) else _general(v)
    if fmt == "@":
        return _text(v)
    if isinstance(v, str):
        n = _parse_number(v)
        if n is None:
            return v
        v = n
    if isinstance(v, bool):
        return _text(v)
    n = _num(v)
    sections = _split_sections(fmt)
    if len(sections) > 1 and n < 0:
        fmt, n = sections[1], -n
    elif len(sections) > 2 and n == 0:
        fmt = sections[2]
    else:
        fmt = sections[0]
    if _is_date_format(fmt):
        if n < 0:
            raise XErr("#VALUE!")
        return _format_date(n, fmt)
    return _format_number(n, fmt)


# ── Putting a lesson's code into the workbook ───────────────────────

_CELL_LINE = _xre.compile(r"^\s*\$?([A-Za-z]{1,3})\$?([0-9]+)\s*:\s*(.*)$")
_SMART = {"“": '"', "”": '"', "„": '"', "‘": "'", "’": "'", " ": " "}


def _split_code(code):
    """The editor's lines: the formula for the lesson's cell, and any
    others typed as CELL: value, like J1: Lagos or J3: =AVERAGE(D2:D121)."""
    for bad, good in _SMART.items():
        code = code.replace(bad, good)
    main, extras, depth = None, [], 0
    for raw in code.split("\n"):
        line = raw.rstrip()
        if not line.strip():
            continue
        if main is not None and depth > 0:
            main += "\n" + line
            depth = _depth(main)
            continue
        m = _CELL_LINE.match(line)
        if m and not line.lstrip().startswith("="):
            extras.append((m.group(1).upper() + m.group(2), m.group(3).strip()))
            continue
        if main is None:
            main = line.strip()
        elif line.lstrip().startswith("="):
            raise ExcelError("One formula per cell: there's a second line starting with =. To put another "
                             "formula in a different cell, start its line with that cell, like J3: =AVERAGE(D2:D121).")
        else:
            main += "\n" + line
        depth = _depth(main)
    return main, extras


def _literal(text):
    """What a typed value becomes in a cell: a number, TRUE/FALSE, a date,
    or text as typed. A leading ' keeps it as text, as in Excel."""
    t = text.strip()
    if t.startswith("'"):
        return t[1:]
    if not t:
        return None
    if t.upper() in ("TRUE", "FALSE"):
        return t.upper() == "TRUE"
    n = _parse_number(t)
    if n is not None and not isinstance(n, DateNum) and not t[:1] in "£$€":
        return n
    d = _parse_date(t)
    return d if d is not None else t


def _frames(ns):
    import pandas as pd
    return {k: v for k, v in ns.items() if isinstance(v, pd.DataFrame) and not k.startswith("_")}


def _refs_on(node, sheet_name, out):
    """The columns of the open sheet a formula reads, to show beside its answer."""
    if not isinstance(node, tuple):
        return out
    if node[0] == "ref":
        if node[1] is None or node[1].lower() == sheet_name.lower():
            c1 = node[2]
            c2 = node[4] if node[4] is not None else c1
            out.update(range(min(c1, c2), max(c1, c2) + 1))
        return out
    for part in node[1:]:
        if isinstance(part, tuple):
            _refs_on(part, sheet_name, out)
        elif isinstance(part, list):
            for p in part:
                if isinstance(p, tuple):
                    _refs_on(p, sheet_name, out)
                elif isinstance(p, list):
                    for q in p:
                        _refs_on(q, sheet_name, out)
    return out


def _build(code, ns, cfg=None):
    """Put the code into a fresh workbook the way the lesson says, work it
    out, and say what landed where."""
    cfg = dict(cfg if cfg is not None else (ns.get("_XL") or {}))
    book = _Book(_frames(ns))
    name = cfg.get("sheet") or "cafe"
    sheet = book.sheet(name)
    if sheet is None:
        raise ExcelError("There's no sheet called %s." % name)
    main, extras = _split_code(code or "")
    if cfg.get("cell"):
        tc, tr = _cell_ref(cfg["cell"])
    elif main is None and any(text.startswith("=") for _, text in extras):
        # The Sandbox says no cell: with no plain formula line, the first
        # CELL: =formula line is the one in the formula bar.
        tc, tr = _cell_ref(next(cell for cell, text in extras if text.startswith("=")))
    else:
        tc, tr = len(sheet.full), 2       # the first empty column, beside the data
    for cell, text in extras:
        if _cell_ref(cell) == (tc, tr) and main is None:
            main = text
    extras = [(cell, text) for cell, text in extras if _cell_ref(cell) != (tc, tr)]

    info = {"cfg": cfg, "sheet": sheet.name, "col": tc, "row": tr, "cell": _addr(tc, tr),
            "formula": None, "literal": None, "values": None, "fill": False, "spill": None,
            "refs": [], "extras": [], "unknown": book.unknown}

    label = cfg.get("label")
    if label and tr > 1 and not sheet.occupied(tc, tr - 1):
        sheet.put(tc, tr - 1, ("value", label))

    placed = []
    for cell, text in extras:
        c, r = _cell_ref(cell)
        if sheet.raw(c, r) is not None:
            raise ExcelError("%s already holds %s, part of the %s data. Put your own cells somewhere empty, "
                             "to the right of the data." % (cell, _shown(sheet.raw(c, r)), sheet.name))
        if text.startswith("="):
            try:
                ast = _parse_formula(text)
            except ExcelError as err:
                raise ExcelError("In %s: %s" % (cell, err))
            sheet.put(c, r, ("formula", ast, c, r))
        else:
            sheet.put(c, r, ("value", _literal(text)))
        placed.append((c, r))
    info["extras"] = placed

    if main is None or not main.strip():
        info["values"] = Arr([[None]])
        return book, info
    if not main.startswith("="):
        v = _literal(main)
        sheet.put(tc, tr, ("value", v))
        info["literal"] = v
        info["values"] = Arr([[v]])
        return book, info

    ast = _parse_formula(main)
    info["formula"] = main
    info["refs"] = sorted(_refs_on(ast, sheet.name, set()))
    entry = ("formula", ast, tc, tr)
    sheet.put(tc, tr, entry)
    key = (sheet.name, tc, tr)
    book.busy.add(key)
    try:
        raw = book.run(entry, sheet, tc, tr)
    finally:
        book.busy.discard(key)
    if isinstance(raw, Rng) and raw.dims != (1, 1):
        raw = raw.grid()
    if isinstance(raw, Arr) and raw.dims != (1, 1):
        rows, cols = raw.dims
        clash = any(sheet.occupied(tc + j, tr + i) for i in range(rows) for j in range(cols) if (i, j) != (0, 0))
        if clash:
            sheet.put(tc, tr, ("value", XErr("#SPILL!")))
            info["values"] = Arr([[XErr("#SPILL!")]])
            return book, info
        for i in range(rows):
            for j in range(cols):
                v = raw[i][j]
                sheet.put(tc + j, tr + i, ("value", 0 if v is None else v))
        info["spill"] = (rows, cols)
        info["values"] = Arr([[book.get(sheet, tc + j, tr + i) for j in range(cols)] for i in range(rows)])
    else:
        book.cache[key] = _cell_result(raw)
        if cfg.get("fill"):
            for r in range(tr + 1, sheet.n + 2):
                sheet.put(tc, r, entry)
            info["fill"] = True
            # Top to bottom, so a row reading the row above finds it worked out already.
            info["values"] = Arr([[book.get(sheet, tc, r)] for r in range(tr, sheet.n + 2)])
        else:
            info["values"] = Arr([[book.get(sheet, tc, tr)]])
    for c, r in placed:
        book.get(sheet, c, r)
    return book, info


# ── Showing the result ──────────────────────────────────────────────

def _shown(v):
    """A value as the cell shows it."""
    if v is None:
        return ""
    if isinstance(v, XErr):
        return v.code
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, DateNum):
        try:
            return _format_date(v, "yyyy-mm-dd" if float(v).is_integer() else "yyyy-mm-dd hh:mm")
        except XErr:
            return _general(float(v))
    if isinstance(v, (int, float)):
        return _general(v)
    return str(v)


def _said(v):
    """A value written into a sentence: text in quotes, empty as empty."""
    if v is None:
        return "empty"
    if isinstance(v, str):
        return "\"%s\"" % v if v else "\"\" (empty text)"
    return _shown(v)


# ── Step through a formula ──────────────────────────────────────────
# Like Excel's Evaluate Formula: the formula worked out from the inside, one
# piece at a time, each piece swapped for what it gives, until one value is
# left. Shown under a run's result, folded, for the formula's own cell.

class _SpanParser(_Parser):
    """The same grammar, noting where in the formula each piece sits."""

    def __init__(self, src):
        _Parser.__init__(self, src)
        self.spans = {}
        self.last_end = 0

    def take(self):
        tok = _Parser.take(self)
        if tok[0] is not None:
            self.last_end = tok[2] + len(tok[1])
        return tok


def _spanned(name):
    base = getattr(_Parser, name)

    def method(self):
        start = self.peek()[2]
        node = base(self)
        self.spans.setdefault(id(node), (start, self.last_end))
        return node
    return method


for _m in ("compare", "concat", "add", "mul", "power", "unary", "primary"):
    setattr(_SpanParser, _m, _spanned(_m))


def _kids(node):
    kind = node[0]
    if kind == "call":
        return [a for a in node[2] if a[0] != "blank"]
    if kind == "bin":
        return [node[2], node[3]]
    if kind in ("neg", "pct"):
        return [node[1]]
    return []


# Functions that name their own values (LET's names, LAMBDA's arguments):
# the pieces inside them can't be worked out on their own, so they're one step.
_WHOLE = {"LET", "LAMBDA", "MAP", "BYROW", "BYCOL", "REDUCE", "SCAN", "MAKEARRAY"}


def _step_order(node, ctx, out):
    """The pieces to work out, innermost first, left to right. An IF only
    goes into the side its test picks, and IFERROR into its fallback only
    when it's needed, as Excel does."""
    kind = node[0]
    if kind == "call" and node[1] in _WHOLE:
        out.append(node)
        return
    args = node[2] if kind == "call" else []
    if kind == "call" and node[1] == "IF" and args and args[0][0] != "blank":
        _step_order(args[0], ctx, out)
        try:
            test = _value(_ev(args[0], ctx))
            side = None if isinstance(test, (Arr, list)) else (1 if _bool(test) else 2)
        except Exception:
            side = None
        for i, arg in enumerate(args[1:], 1):
            if arg[0] != "blank" and (side is None or i == side):
                _step_order(arg, ctx, out)
        out.append(node)
        return
    if kind == "call" and node[1] == "IFERROR" and len(args) == 2:
        _step_order(args[0], ctx, out)
        if isinstance(_arg(args[0], ctx), XErr) and args[1][0] != "blank":
            _step_order(args[1], ctx, out)
        out.append(node)
        return
    for kid in _kids(node):
        _step_order(kid, ctx, out)
    if kind in ("call", "bin", "neg", "pct", "ref"):
        out.append(node)


def _typed(v):
    """One value as it would be typed back into a formula."""
    if v is None:
        return '""'
    if isinstance(v, str):
        return '"%s"' % v
    if isinstance(v, XErr):
        return v.code
    return _shown(v)


def _brief(v):
    """What a piece gives: (as it goes back into the formula, in words)."""
    if isinstance(v, Rng):
        rows, cols = v.dims
        if (rows, cols) == (1, 1):
            v = v.first()
        else:
            # Only the three cells that get shown are read: a range of 10,000
            # rows isn't turned into a grid just to show its first three.
            first = []
            for r in range(v.r1, v.r2 + 1):
                for c in range(v.c1, v.c2 + 1):
                    first.append(_typed(v.book.get(v.sheet, c, r)))
                    if len(first) == 3:
                        break
                if len(first) == 3:
                    break
            more = rows * cols - len(first)
            return ("{%s%s}" % (",".join(first), ",…" if more else ""),
                    "%d values: %s%s" % (rows * cols, ", ".join(first), " and %d more" % more if more else ""))
    if isinstance(v, list) and v and isinstance(v[0], list):
        flat = [x for row in v for x in row]
        if len(flat) == 1:
            v = flat[0]
        else:
            first = [_typed(x) for x in flat[:3]]
            more = len(flat) - len(first)
            return ("{%s%s}" % (",".join(first), ",…" if more else ""),
                    "%d values: %s%s" % (len(flat), ", ".join(first), " and %d more" % more if more else ""))
    return _typed(v), _typed(v)


def _steps(book, info):
    """The formula's own cell, worked out step by step: for each step, the
    formula with what's been worked out so far swapped in (the newest piece
    between \x01 and \x02, for marking), and a sentence saying what it gave."""
    formula = info.get("formula")
    if not formula:
        return []
    src = formula.strip()[1:] if formula.strip().startswith("=") else formula.strip()
    try:
        parser = _SpanParser(src)
        root = parser.parse()
    except Exception:
        return []
    spans = parser.spans
    sheet = book.sheet(info["sheet"])
    ctx = _Ctx(book, sheet, info["col"], info["row"], 0, 0, None)
    order = []
    try:
        _step_order(root, ctx, order)
    except Exception:
        return []
    if len(order) < 2 or len(order) > 40:
        return []
    # Each step works its piece out from scratch, so a formula over big ranges
    # (a loaded CSV in the Sandbox) would cost several runs of itself on every
    # Run, folded away or not. Past 20,000 cells read in all, it's left out.
    cells = 0
    for node in order:
        if node[0] == "ref":
            try:
                rows, cols = _resolve(node, ctx).dims
            except Exception:
                continue
            cells += rows * cols
    if cells > 20000:
        return []
    done = {}

    def render(node):
        key = id(node)
        if key in done:
            return done[key]
        start, end = spans.get(key, (0, 0))
        pieces, at = [], start
        for kid in sorted((k for k in _kids(node) if id(k) in spans), key=lambda k: spans[id(k)][0]):
            ks, ke = spans[id(kid)]
            pieces.append(src[at:ks])
            pieces.append(render(kid))
            at = ke
        pieces.append(src[at:end])
        return "".join(pieces)

    steps = []
    for node in order:
        if id(node) not in spans:
            continue
        piece = src[spans[id(node)][0]:spans[id(node)][1]]
        if node[0] == "call" and len(piece) > 30:
            piece = "%s(…)" % node[3]          # the formula above shows the rest
        try:
            short, words = _brief(_arg(node, ctx))
        except Exception:
            return steps if len(steps) >= 2 else []
        done[id(node)] = "\x01%s\x02" % short
        text = "=" + render(root)
        done[id(node)] = short
        verb = "holds" if node[0] == "ref" else "gives"
        steps.append({"formula": text, "say": "%s %s %s." % (piece, verb, words)})
    return steps


_RANGE_RE = _xre.compile(r"(?:(?:'([^']+)'|([A-Za-z_]\w*))!)?\$?([A-Z]{1,3})(\$?)(\d+):\$?([A-Z]{1,3})(\$?)(\d+)")


def _short_range(book, info):
    """A range that starts at the top of a sheet's data but stops before the
    end of it, like F2:F100 on a sheet whose data runs to row 121: said under
    the result, not marked wrong, since it may be on purpose, but it's usually
    a miscount. A filled-down formula's relative rows move with it (often a
    window on purpose), so there only a range with fixed rows ($2:$100) counts."""
    formula = _xre.sub(r'"[^"]*"', '""', info.get("formula") or "")
    home = book.sheet(info["sheet"])
    for m in _RANGE_RE.finditer(formula):
        name = m.group(1) or m.group(2)
        sheet = book.sheet(name) if name else home
        if sheet is None or not sheet.n:
            continue
        if info["fill"] and not (m.group(4) and m.group(7)):
            continue
        r1, r2 = int(m.group(5)), int(m.group(8))
        last = sheet.n + 1
        if r1 <= 2 < r2 < last:
            return "%s stops at row %d, but the %s sheet's data runs to row %d." % (
                m.group(0).replace("$", "").split("!")[-1], r2, sheet.name, last)
    return ""


def _show(book, info, blocks):
    sheet = book.sheet(info["sheet"])
    tc, tr = info["col"], info["row"]
    rows_, cols_ = info["spill"] or (1, 1)
    last = sheet.n + 1 if info["fill"] else tr + rows_ - 1
    target = set(range(tc, tc + cols_))
    shown_cols = [c for c in info["refs"] if c not in target][:5]
    extra_cols = sorted({c for c, _ in info["extras"]} - target - set(shown_cols))
    cols = sorted(set(shown_cols) | target | set(extra_cols[:3]))
    deepest = max([last] + [r for _, r in info["extras"]])
    top = min(deepest, 11)
    if info["refs"]:                      # the data it read, for context: ten rows of it
        top = max(top, min(11, sheet.last))
    top = max(top, tr)
    header = [""] + [_col_name(c) for c in cols]
    rows = []
    for r in range(1, top + 1):
        row = [str(r)]
        for c in cols:
            v = book.get(sheet, c, r)
            row.append(None if v is None else _shown(v))
        rows.append(row)
    def numeric(c):
        vals = [book.get(sheet, c, r) for r in range(2, top + 1)]
        vals = [v for v in vals if v is not None]
        return bool(vals) and all(_is_num(v) or isinstance(v, bool) for v in vals)
    align = ["r"] + ["r" if numeric(c) else "l" for c in cols]
    mark = [i + 1 for i, c in enumerate(cols) if c in target]
    cell = info["cell"]
    if info["fill"]:
        note = "Filled from %s down to %s: %d rows%s." % (
            cell, _addr(tc, last), last - tr + 1, ", the first %d shown" % (top - tr + 1) if top < last else "")
    elif info["spill"]:
        note = "Spilled from %s into %s:%s%s." % (cell, cell, _addr(tc + cols_ - 1, tr + rows_ - 1),
                                                  ", the first %d rows shown" % (top - tr + 1) if top < last else "")
    else:
        note = "%s shows %s." % (cell, _said(book.get(sheet, tc, tr)) if info["formula"] or info["literal"] is not None else "nothing yet")
    gaps = any(b - a > 1 for a, b in zip(cols, cols[1:]))
    if gaps:
        note += " Only the columns the formula uses are shown."
    short = _short_range(book, info)
    if short:
        note += " " + short
    formula = info["formula"] if info["formula"] else (_shown(info["literal"]) if info["literal"] is not None else "")
    blocks.append({"sheet": True, "header": header, "rows": rows, "align": align, "mark": mark,
                   "count": len(rows), "note": note, "fx": {"cell": cell, "formula": formula}})
    steps = _steps(book, info)
    if steps:
        blocks.append({"steps": steps, "cell": cell, "fill": bool(info["fill"] or info["spill"])})
    lines = ["%s  %s" % (cell, formula), "\t".join(header)] + ["\t".join("" if v is None else v for v in r) for r in rows]
    errs = []
    for row in info["values"]:
        for v in row:
            if isinstance(v, XErr) and v.code not in errs:
                errs.append(v.code)
    if errs:
        text = _explain(errs, book)
        blocks.append({"text": text})
        lines.append(text)
    if info["formula"] is None and info["literal"] is not None:
        text = "That went in as a value, not a formula. A formula starts with =."
        blocks.append({"text": text})
        lines.append(text)
    lines.append(note)
    return "\n".join(lines)


def _explain(codes, book):
    out = []
    for code in codes:
        line = "%s means %s." % (code, ERROR_MEANS.get(code, "something went wrong"))
        if code == "#NAME?":
            line += _name_hint(book.unknown)
        if code == "#REF!" and book.missing_sheets:
            line += " There's no sheet called %s." % book.missing_sheets[0]
        if code == "#N/A":
            line += " For a lookup, check the value is really there, spelt the same way, and that the match is exact (FALSE, or XLOOKUP)."
        if code == "#SPILL!":
            line += " A formula that fills down needs one value per row, so it can't hand back a whole column."
        out.append(line)
    return "\n".join(out)


def _name_hint(unknown):
    """For #NAME?: which word Excel didn't know, and the likely fix."""
    names = list(dict.fromkeys(unknown or []))
    if not names:
        return ""
    word = names[0]
    close = [f for f in sorted(FUNCS) if _close(word.upper(), f)]
    if close:
        return " Excel doesn't know %s: did you mean %s?" % (word, close[0])
    return " Excel doesn't know %s. If it's text, it needs double quotes: \"%s\"." % (word, word)


def _close(a, b):
    """Two names a typo apart: one letter added, dropped, swapped or changed."""
    if a == b or abs(len(a) - len(b)) > 1:
        return False
    if len(a) == len(b):
        diff = [i for i in range(len(a)) if a[i] != b[i]]
        return len(diff) == 1 or (len(diff) == 2 and diff[1] == diff[0] + 1 and a[diff[0]] == b[diff[1]] and a[diff[1]] == b[diff[0]])
    short, long_ = (a, b) if len(a) < len(b) else (b, a)
    return any(long_[:i] + long_[i + 1:] == short for i in range(len(long_)))


def _xl_unexpected(err):
    if isinstance(err, RecursionError):
        return "That goes round in circles too deeply to work out. Does a cell end up reading itself?"
    return "That couldn't be worked out (%s). Check what's going into each function." % err


def _excel_exec(code, ns):
    ns["_query"] = code
    blocks = []
    ns["_excel_blocks"] = blocks
    ns["_excel_result"] = None
    try:
        book, info = _build(code, ns)
        ns["_excel_result"] = info
        print(_show(book, info, blocks))
    except ExcelError as err:
        raise _SQLFailure(str(err))
    except Exception as err:
        raise _SQLFailure(_xl_unexpected(err))


# ── Lesson checks ───────────────────────────────────────────────────

def _same_value(a, b):
    if isinstance(a, XErr) or isinstance(b, XErr):
        return a == b
    if a is None or b is None:
        return (a is None or a == "") and (b is None or b == "")
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if _is_num(a) and _is_num(b):
        return abs(float(a) - float(b)) <= 1e-9 * max(1.0, abs(float(b)))
    return isinstance(a, str) and isinstance(b, str) and a == b


def _excel_expect(ns, reference, uses=()):
    """Lesson check: what the learner's code put in the lesson's cell (every
    row of it, when it fills down) must match what the reference formula
    gives there. uses: functions the formula must call, so a lesson about
    SUMIFS is done with SUMIFS."""
    info = ns.get("_excel_result")
    if not info:
        raise AssertionError("Type a formula in the editor. It starts with =.")
    try:
        _, ref = _build(reference, ns, info["cfg"])
    except ExcelError as err:
        raise AssertionError("The lesson's own answer didn't work out (%s)." % err)
    got, want = info["values"], ref["values"]
    cell = info["cell"]
    tc, tr = info["col"], info["row"]
    if info["formula"] is None:
        if info["literal"] is None:
            raise AssertionError("%s is still empty. Type a formula, starting with =." % cell)
        if got.dims == want.dims and all(_same_value(g, w) for gr, wr in zip(got, want) for g, w in zip(gr, wr)):
            raise AssertionError("That's the right answer, typed in as a value. Type it as a formula, starting "
                                 "with =, so it works itself out again when the data changes.")
        raise AssertionError("That went into %s as %s, not a formula. A formula starts with =, at the very front." % (
            cell, "text" if isinstance(info["literal"], str) else "a typed value"))
    if got.dims != want.dims:
        gr, gc = got.dims
        wr, wc = want.dims
        if (wr, wc) == (1, 1):
            raise AssertionError("Your formula gives a block of values (it spills over %d row%s); this one "
                                 "should give a single value." % (gr, "" if gr == 1 else "s"))
        if (gr, gc) == (1, 1):
            if isinstance(got[0][0], XErr):
                raise AssertionError("%s shows %s: %s." % (cell, got[0][0].code, ERROR_MEANS.get(got[0][0].code, "an error")))
            raise AssertionError("This one should spill into a list: %d row%s from %s." % (wr, "" if wr == 1 else "s", cell))
        raise AssertionError("Your formula spills into %d row%s and %d column%s; it should be %d row%s and %d column%s." % (
            gr, "" if gr == 1 else "s", gc, "" if gc == 1 else "s", wr, "" if wr == 1 else "s", wc, "" if wc == 1 else "s"))
    wrong = []
    for i, (grow, wrow) in enumerate(zip(got, want)):
        for j, (g, w) in enumerate(zip(grow, wrow)):
            if not _same_value(g, w):
                wrong.append((_addr(tc + j, tr + i), g, w))
    if wrong:
        where, g, w = wrong[0]
        if isinstance(g, XErr):
            msg = "%s shows %s: %s." % (where, g.code, ERROR_MEANS.get(g.code, "an error"))
            if g.code == "#NAME?":
                msg += _name_hint(info.get("unknown"))
        elif isinstance(g, str) and isinstance(w, str) and g.lower() == w.lower():
            msg = "Nearly: check the capitals. %s shows %s; it should be %s." % (where, _said(g), _said(w))
        elif isinstance(g, str) and _is_num(w) and _parse_number(g) is not None:
            msg = "%s shows %s as text, not a number. Leave the quotes off numbers." % (where, _said(g))
        else:
            msg = "%s shows %s; it should be %s." % (where, _said(g), _said(w))
        if len(wrong) > 1:
            msg += " (%d cells are off.)" % len(wrong)
        raise AssertionError(msg)
    formula = info["formula"]
    for name in uses:
        if name == "$":
            if "$" not in formula:
                raise AssertionError("Right numbers. Now lock the range with $ (like $F$2), so it can't slide when the formula is copied.")
        elif _CELL.match(name):
            m = _CELL.match(name)
            if not _xre.search(r"(?<![A-Za-z$])\$?%s\$?%s(?![0-9])" % (m.group(1), m.group(2)), formula, _xre.I):
                raise AssertionError("Right answer. Now make the formula read %s instead of typing its value in, so "
                                     "changing %s changes the answer." % (name.upper(), name.upper()))
        elif not _xre.search(r"(?<![A-Za-z0-9_.])" + _xre.escape(name) + r"\s*\(", formula, _xre.I):
            raise AssertionError("That gives the right answer. This lesson is practising %s, though: write it with %s." % (name, name))
    return True


# ── Practice problems ───────────────────────────────────────────────
# A practice formula is judged on more than the data you can see: the open
# sheet's rows in another order, then a fresh draw of its rows (some twice,
# some not at all, so totals, counts and the biggest day all move), then
# the problem's own edge case if it has one. A number typed in, or a
# formula that only works for this exact data, gets caught. Whole rows are
# drawn, so revenue still equals cups times price on every row.

def _xl_cases(ns, cfg, edge=None, edge_about=None):
    import pandas as pd
    import numpy as np
    frames = _frames(ns)
    name = cfg.get("sheet") or "cafe"
    key = next((k for k in frames if k.lower() == name.lower()), None)
    cases = [("The %s sheet as you see it." % name, frames)]
    if key is None:
        return cases
    base = frames[key]
    shuffled = dict(frames)
    shuffled[key] = base.sample(frac=1, random_state=11).reset_index(drop=True)
    cases.append(("The %s sheet with its rows in another order." % name, shuffled))
    drawn = dict(frames)
    drawn[key] = base.sample(n=len(base), replace=True, random_state=29).reset_index(drop=True)
    cases.append(("The %s sheet with different rows in it: the same kind of data, new amounts." % name, drawn))
    if edge:
        book = {k: v.copy() for k, v in frames.items()}
        exec(edge, {"pd": pd, "np": np, "book": book})
        cases.append((edge_about or "One more case.", book))
    return cases


def _xl_text(info):
    """A practice answer as text: each cell it filled and what it shows,
    the first rows of a fill or a spill."""
    vals = info["values"]
    tc, tr = info["col"], info["row"]
    rows, cols = vals.dims
    show = lambda v: _shown(v) if _shown(v) != "" else "(empty)"
    lines = []
    for i in range(min(rows, 8)):
        if cols == 1:
            lines.append("%s  %s" % (_addr(tc, tr + i), show(vals[i][0])))
        else:
            lines.append("%s  %s" % (_addr(tc, tr + i), "  |  ".join(show(v) for v in vals[i])))
    if rows > 8:
        lines.append("... %d rows in all" % rows)
    return "\n".join(lines)


def _xl_where(info):
    cell = info["cell"]
    if info.get("fill"):
        return "Your formula goes in %s and is filled down." % cell
    return "Your formula goes in %s." % cell


def _judge_excel(ns, code, reference, reveal=False, edge=None, edge_about=None):
    cfg = dict(ns.get("_XL") or {})
    cases = _xl_cases(ns, cfg, edge, edge_about)
    if reveal:
        cases = cases[:1]
    total = len(cases)
    label = lambda i: "Example" if reveal else "Test %d of %d" % (i + 1, total)
    report = {"ok": False, "passed": 0, "total": total, "summary": "", "case": None,
              "mode": "run" if reveal else "submit"}
    try:
        _, first = _build(code, ns, cfg)
    except ExcelError as err:
        report["summary"] = "Excel won't take that formula: %s" % err
        return report
    if first["formula"] is None:
        report["summary"] = ("Type a formula for %s. It starts with =." % first["cell"] if first["literal"] is None else
                             "That went into %s as a value, not a formula. A formula starts with =, and it has to "
                             "work the answer out, so it still holds when the data changes." % first["cell"])
        return report
    for i, (about, frames) in enumerate(cases):
        where = "%s\n%s" % (about, _xl_where(first))
        try:
            _, ref = _build(reference, frames, cfg)
        except ExcelError as err:
            report["summary"] = "The problem's own answer didn't work out (%s)." % err
            return report
        try:
            _, mine = _build(code, frames, cfg)
        except ExcelError as err:
            report["summary"] = "%s: Excel won't take that formula: %s" % (label(i), err)
            report["case"] = {"n": i + 1, "input": where, "expected": _xl_text(ref), "got": str(err)}
            return report
        got, want = mine["values"], ref["values"]
        wrong = None
        if got.dims != want.dims:
            gr, wr = got.dims[0], want.dims[0]
            wrong = ("it should give a single value, and yours gives a block of %d rows" % gr if (wr, want.dims[1]) == (1, 1)
                     else "it should give %d row%s, and yours gives %d" % (wr, "" if wr == 1 else "s", gr))
        else:
            for r, (grow, wrow) in enumerate(zip(got, want)):
                for c, (g, w) in enumerate(zip(grow, wrow)):
                    if not _same_value(g, w):
                        wrong = "%s shows %s; it should be %s" % (_addr(mine["col"] + c, mine["row"] + r), _said(g), _said(w))
                        if isinstance(g, XErr):
                            wrong += " (%s means %s)" % (g.code, ERROR_MEANS.get(g.code, "an error"))
                        break
                if wrong:
                    break
        if wrong or reveal:
            report["case"] = {"n": i + 1, "input": where, "expected": _xl_text(ref), "got": _xl_text(mine)}
        if wrong:
            report["summary"] = "%s failed: %s." % (label(i), wrong)
            return report
        report["passed"] += 1
    report["ok"] = True
    report["summary"] = "Matches the expected output." if reveal else "All %d tests passed." % total
    return report


# ── A look at the sheet, before any formula ─────────────────────────
# Excel is visual: lessons, practice problems and the Sandbox show the sheet
# as it looks in Excel (letters across, row numbers down, headings in row 1)
# with the cell the formula goes in outlined, before anything is typed.

def _peek(ns, cfg, rows=5, target=True):
    frames = _frames(ns)
    book = _Book(frames)
    sheet = book.sheet(cfg.get("sheet") or "cafe")
    if sheet is None:
        return None
    width = len(sheet.full)
    tc = tr = None
    if target:
        tc, tr = _cell_ref(cfg["cell"]) if cfg.get("cell") else (width, 2)
    cols = list(range(max(width - 1, tc if tc is not None else 0) + 1))
    shown = min(sheet.n, rows)
    top = max(1 + shown, tr or 0)
    label = cfg.get("label") if target else None
    body = []
    for r in range(1, top + 1):
        row = [str(r)]
        for c in cols:
            v = sheet.raw(c, r)
            if label and c == tc and r == tr - 1 and v is None:
                v = label                      # the heading a lesson types above its cell
            row.append(None if v is None else _shown(v))
        body.append(row)

    def numeric(c):
        vals = [sheet.raw(c, r) for r in range(2, top + 1)]
        vals = [v for v in vals if v is not None]
        return bool(vals) and all(_is_num(v) or isinstance(v, bool) for v in vals)

    # How far the data runs, and each column's whole range, so nobody counts
    # rows to write D2:D121 (ui.sheetGrid shows it above the sheet, and a tap
    # puts one in the formula; from another sheet, as orders!B2:B151).
    span = {"rows": sheet.n, "last": sheet.n + 1, "sheet": sheet.name, "other": not target,
            "cols": [[_col_name(c), str(sheet.full[c][0])] for c in range(width)]}
    block = {"sheet": True, "tab": sheet.name, "header": [""] + [_col_name(c) for c in cols], "rows": body,
             "align": ["r"] + ["r" if numeric(c) else "l" for c in cols], "count": len(body), "span": span}
    notes = ["The first %d rows shown." % shown] if sheet.n > shown else []
    if target:
        i = cols.index(tc) + 1
        block["mark"] = [i] if cfg.get("fill") else []
        block["target"] = [tr - 1, i]
        block["fx"] = {"cell": _addr(tc, tr), "formula": "", "hint": "your formula goes here"}
        notes.append("Your formula goes in %s%s." % (
            _addr(tc, tr), ", and is filled down to row %d" % (sheet.n + 1) if cfg.get("fill") else ""))
    if notes:
        block["note"] = " ".join(notes)
    return block


def _excel_peek(ns, sheet=None, fill=None, extra=()):
    """The open sheet with its target cell, then any other sheets named in
    `extra` (the ones a formula reads), as sheet blocks for ui.sheetGrid."""
    cfg = dict(ns.get("_XL") or {})
    if sheet:
        cfg["sheet"] = sheet
    if fill is not None:
        cfg["fill"] = fill
    blocks = [_peek(ns, cfg)]
    name = (cfg.get("sheet") or "cafe").lower()
    for other in dict.fromkeys(extra):
        if other.lower() != name:
            blocks.append(_peek(ns, {"sheet": other}, target=False))
    return [b for b in blocks if b]


def _xl_expected_block(info):
    """What the answer should put on the sheet: the cells it fills, as cells."""
    vals = info["values"]
    tc, tr = info["col"], info["row"]
    rows, cols = vals.dims
    shown = min(rows, 6)
    body = [[str(tr + i)] + [(_shown(vals[i][j]) or None) for j in range(cols)] for i in range(shown)]
    align = ["r"] + ["r" if all(_is_num(vals[i][j]) for i in range(shown) if vals[i][j] is not None) else "l"
                     for j in range(cols)]
    cell = info["cell"]
    if info.get("fill"):
        note = "Filled down from %s to %s, %d rows%s." % (cell, _addr(tc, tr + rows - 1), rows,
                                                         ", the first %d shown" % shown if rows > shown else "")
    elif (rows, cols) != (1, 1):
        note = "Spills from %s into %s:%s%s." % (cell, cell, _addr(tc + cols - 1, tr + rows - 1),
                                                ", the first %d rows shown" % shown if rows > shown else "")
    else:
        note = "%s should show %s." % (cell, _said(vals[0][0]))
    return {"sheet": True, "compact": True, "header": [""] + [_col_name(tc + j) for j in range(cols)], "rows": body,
            "align": align, "mark": list(range(1, cols + 1)), "count": len(body), "note": note}


def _preview_excel(ns, reference):
    """The example: the sheet you start from, where the formula goes, and
    what should land there."""
    cfg = dict(ns.get("_XL") or {})
    frames = _frames(ns)
    name = cfg.get("sheet") or "cafe"
    _, ref = _build(reference, ns, cfg)

    def about(sheet_name):
        key = next((k for k in frames if k.lower() == sheet_name.lower()), None)
        if key is None:
            return None
        f = frames[key]
        cols = ", ".join("%s %s" % (_col_name(i), c) for i, c in enumerate(f.columns))
        return "The %s sheet: %s. Data in rows 2 to %d." % (key, cols, len(f) + 1)

    lines = [about(name)]
    for other in dict.fromkeys(_xre.findall(r"([A-Za-z_]\w*)!", reference)):
        if other.lower() != name.lower() and about(other):
            lines.append(about(other))
    lines.append(_xl_where(ref))
    return {"mode": "preview", "input": "\n".join(l for l in lines if l), "expected": _xl_text(ref),
            "grids": _excel_peek(ns, extra=_xre.findall(r"([A-Za-z_]\w*)!", reference)),
            "expected_grid": _xl_expected_block(ref)}


# ── Suggestions in the editor ───────────────────────────────────────

def _arg_index(text):
    depth, quoted, n = 0, False, 0
    for ch in text:
        if ch == '"':
            quoted = not quoted
        elif quoted:
            continue
        elif ch in "({":
            depth += 1
        elif ch in ")}":
            depth -= 1
        elif ch == "," and depth == 0:
            n += 1
    return n


def _excel_complete(text, after, ns, force):
    result = {"items": [], "replace": 0, "signature": None, "context": "none"}
    if text.count('"') % 2:
        return result
    stack, quoted = [], False
    for i, ch in enumerate(text):
        if ch == '"':
            quoted = not quoted
        elif not quoted and ch == "(":
            stack.append(i)
        elif not quoted and ch == ")" and stack:
            stack.pop()
    if stack:
        k = stack[-1]
        m = _xre.search(r"([A-Za-z_][A-Za-z0-9_.]*)\s*$", text[:k])
        if m and m.group(1).upper() in SIGS:
            name = m.group(1).upper()
            params, doc = SIGS[name]
            active = _arg_index(text[k + 1:])
            if params and params[-1] == "..." and active >= len(params) - 1:
                active = len(params) - 2 if len(params) > 1 else 0
            result["signature"] = {"name": name, "params": list(params), "more": False,
                                   "active": active if active < len(params) else -1, "doc": doc}
    m = _xre.search(r"[A-Za-z_][A-Za-z0-9_.]*$", text)
    prefix = m.group(0) if m else ""
    head = text[:len(text) - len(prefix)]
    if head.endswith("!") or head.endswith("$") or any(ch.isdigit() for ch in prefix):
        return result
    if not prefix and not force:
        return result
    low = prefix.lower()
    items = []
    for f in sorted(SIGS):
        if f.lower().startswith(low):
            params, doc = SIGS[f]
            items.append({"label": f, "kind": "function", "detail": _signature(f), "doc": doc,
                          "call": True, "args": bool(params)})
    for name, frame in sorted(_frames(ns).items()):
        if name.lower().startswith(low):
            cols = ", ".join("%s %s" % (_col_name(i), c) for i, c in enumerate(list(frame.columns)[:4]))
            items.append({"label": name, "kind": "table", "detail": "sheet · " + cols, "insert": name + "!"})
    common = ["SUM", "IF", "XLOOKUP", "SUMIFS", "COUNTIFS", "AVERAGE", "VLOOKUP", "ROUND", "IFERROR", "INDEX", "MATCH"]
    items.sort(key=lambda it: (it["label"].lower() != low, it["label"] not in common, it["label"]))
    result.update(items=items[:60], replace=len(prefix), context="sql")
    return result


# ── The engine's own tests ──────────────────────────────────────────

_SELFTEST = [
    ("=1+2*3", 7), ("=(1+2)*3", 9), ("=-2^2", 4), ("=2^3^2", 64), ("=10/4", 2.5), ("=50%", 0.5),
    ("=1/0", "#DIV/0!"), ("=\"a\"&1&TRUE", "a1TRUE"), ("=\"3\"+4", 7), ("=\"x\"+1", "#VALUE!"),
    ("=0.1+0.2=0.3", True), ("=\"abc\"=\"ABC\"", True), ("=5<\"a\"", True), ("=TRUE>\"z\"", True),
    ("=ROUND(2.5,0)", 3), ("=ROUND(-2.5,0)", -3), ("=ROUND(2.675,2)", 2.68), ("=ROUND(1234,-2)", 1200),
    ("=ROUNDUP(1.21,1)", 1.3), ("=ROUNDDOWN(-1.29,1)", -1.2), ("=INT(-1.5)", -2), ("=MOD(-7,3)", 2),
    ("=CEILING(7,5)", 10), ("=FLOOR(7,5)", 5), ("=MROUND(7,5)", 5), ("=SQRT(-1)", "#NUM!"),
    ("=IF(1>2,\"y\",\"n\")", "n"), ("=IF(FALSE,1)", False), ("=IFS(5>9,\"a\",5>3,\"b\")", "b"), ("=IFS(1>2,\"a\")", "#N/A"),
    ("=IFERROR(1/0,\"none\")", "none"), ("=IFNA(NA(),0)", 0), ("=IFNA(1/0,0)", "#DIV/0!"), ("=ISERROR(1/0)", True),
    ("=AND(TRUE,1>0)", True), ("=OR(FALSE,0)", False), ("=NOT(0)", True), ("=SWITCH(2,1,\"a\",2,\"b\",\"c\")", "b"),
    ("=LET(x,3,y,x*2,x+y)", 9), ("=CHOOSE(2,\"a\",\"b\")", "b"),
    ("=LEFT(\"Lagos\",3)", "Lag"), ("=RIGHT(\"Lagos\",2)", "os"), ("=MID(\"Nairobi\",2,3)", "air"), ("=LEN(\" a \")", 3),
    ("=PROPER(\"cold brew\")", "Cold Brew"), ("=TRIM(\"  a   b \")", "a b"), ("=SUBSTITUTE(\"a-b-c\",\"-\",\"/\",2)", "a-b/c"),
    ("=FIND(\"b\",\"abc\")", 2), ("=FIND(\"B\",\"abc\")", "#VALUE!"), ("=SEARCH(\"B\",\"abc\")", 2), ("=SEARCH(\"?c\",\"abcd\")", 2),
    ("=TEXTJOIN(\", \",TRUE,\"a\",\"\",\"b\")", "a, b"), ("=TEXTBEFORE(\"ab@cd\",\"@\")", "ab"), ("=TEXTAFTER(\"ab@cd\",\"@\")", "cd"),
    ("=TEXT(1234.5,\"#,##0.00\")", "1,234.50"), ("=TEXT(0.256,\"0.0%\")", "25.6%"), ("=TEXT(3.5,\"£0.00\")", "£3.50"),
    ("=TEXT(-3.5,\"0.0\")", "-3.5"), ("=TEXT(DATE(2024,3,9),\"dd/mm/yyyy\")", "09/03/2024"), ("=TEXT(DATE(2024,3,9),\"mmm\")", "Mar"),
    ("=TEXT(DATE(2024,3,9),\"dddd d mmmm yyyy\")", "Saturday 9 March 2024"), ("=TEXT(7,\"000\")", "007"), ("=TEXT(0.5,\"#.##\")", ".5"),
    ("=DATE(2024,1,1)", 45292), ("=DATE(2024,13,1)=DATE(2025,1,1)", True), ("=DATE(2024,3,0)=DATE(2024,2,29)", True),
    ("=YEAR(45292)", 2024), ("=MONTH(DATE(2024,7,4))", 7), ("=WEEKDAY(DATE(2024,1,1))", 2), ("=WEEKDAY(DATE(2024,1,1),2)", 1),
    ("=EOMONTH(DATE(2024,2,10),0)=DATE(2024,2,29)", True), ("=EDATE(DATE(2024,1,31),1)=DATE(2024,2,29)", True),
    ("=DATEDIF(DATE(2023,5,20),DATE(2024,5,19),\"Y\")", 0), ("=DATEDIF(DATE(2023,5,20),DATE(2024,5,20),\"M\")", 12),
    ("=NETWORKDAYS(DATE(2024,1,1),DATE(2024,1,7))", 5), ("=DAYS(DATE(2024,3,1),DATE(2024,2,1))", 29),
    ("=WEEKNUM(DATE(2024,1,7))", 2), ("=\"Day \"&DATE(2024,1,1)", "Day 45292"), ("=DATE(2024,1,1)+7=DATE(2024,1,8)", True),
    ("=SUM(1,\"2\",TRUE)", 4), ("=AVERAGE(2,4)", 3), ("=MAX()", "parse"), ("=SUMM(1)", "#NAME?"), ("=SUM(1,2", "parse"),
    ("=SUM(1;2)", "parse"), ("=Lagos", "#NAME?"), ("=1+", "parse"), ("=", "parse"),
    ("=SUM({1,2;3,4})", 10), ("=INDEX({10,20,30},2)", 20), ("=MATCH(25,{10,20,30})", 2), ("=MATCH(\"b*\",{\"a\",\"bc\"},0)", 2),
    ("=XLOOKUP(2,{1,2,3},{\"a\",\"b\",\"c\"})", "b"), ("=XLOOKUP(9,{1,2,3},{\"a\",\"b\",\"c\"},\"none\")", "none"),
    ("=XLOOKUP(2.5,{1,2,3},{\"a\",\"b\",\"c\"},,-1)", "b"), ("=XLOOKUP(2.5,{1,2,3},{\"a\",\"b\",\"c\"},,1)", "c"),
    ("=MEDIAN(1,3,2,4)", 2.5), ("=LARGE({5,1,9},2)", 5), ("=SMALL({5,1,9},1)", 1), ("=RANK.EQ(5,{5,1,9})", 2),
    ("=RANK.EQ(5,{5,1,9},1)", 2), ("=PERCENTILE.INC({1,2,3,4,5},0.25)", 2), ("=STDEV.P(2,4,4,4,5,5,7,9)", 2),
    ("=SUMPRODUCT({1,2},{3,4})", 11), ("=ROWS(SEQUENCE(4))", 4), ("=SUM(SEQUENCE(3,1,10,5))", 45),
    ("=COUNTIF({\"latte\",\"Latte\",\"tea\"},\"latte\")", 2), ("=COUNTIF({1,5,9},\">=5\")", 2), ("=COUNTIF({\"latte\",\"lungo\",\"tea\"},\"l*\")", 2),
    ("=COUNTIF({\"a\",\"b\"},\"<>a\")", 1), ("=SUMIF({1,2,3},\">1\",{10,20,30})", 50),
]


def _excel_selftest(ns):
    fails = []
    for formula, want in _SELFTEST:
        try:
            _, info = _build(formula, ns, {"sheet": "cafe", "cell": "J2"})
            got = info["values"][0][0]
        except ExcelError:
            got = "parse"
        if isinstance(want, str) and want.startswith("#"):
            ok = isinstance(got, XErr) and got.code == want
        elif want == "parse":
            ok = got == "parse"
        else:
            ok = _same_value(got, want)
        if not ok:
            fails.append("%s gave %s, not %s" % (formula, _said(got) if got != "parse" else "a refusal", _said(want)))
    # Against pandas, on the real data
    cafe = ns["cafe"]
    cities = ns["cities"]
    n = len(cafe) + 1
    march = cafe[(cafe["date"] >= "2024-03-01") & (cafe["date"] < "2024-04-01")]["cups"].mean()
    data = [
        ("=SUM(F2:F%d)" % n, float(cafe["revenue"].sum())),
        ("=SUM(F:F)", float(cafe["revenue"].sum())),
        ("=COUNTBLANK(G2:G%d)" % n, int(cafe["rating"].isna().sum())),
        ("=COUNT(G:G)", int(cafe["rating"].notna().sum())),
        ("=COUNTA(B:B)", len(cafe) + 1),
        ("=AVERAGE(G:G)", float(cafe["rating"].mean())),
        ("=COUNTIF(B:B,\"Lagos\")", int((cafe["city"] == "Lagos").sum())),
        ("=SUMIFS(F:F,B:B,\"Lagos\",C:C,\"latte\")", float(cafe[(cafe["city"] == "Lagos") & (cafe["drink"] == "latte")]["revenue"].sum())),
        ("=AVERAGEIFS(D:D,A:A,\">=\"&DATE(2024,3,1),A:A,\"<\"&DATE(2024,4,1))", float(march)),
        ("=VLOOKUP(\"Accra\",cities!A:C,3,FALSE)", 2.6),
        ("=XLOOKUP(\"Kigali\",cities!A:A,cities!B:B)", "Rwanda"),
        ("=INDEX(A2:A%d,MATCH(MAX(D2:D%d),D2:D%d,0))=DATE(%d,%d,%d)" % ((n, n, n) + tuple(
            cafe.loc[cafe["cups"].idxmax(), "date"].timetuple()[:3])), True),
        ("=ROWS(UNIQUE(C2:C%d))" % n, int(cafe["drink"].nunique())),
        ("=MAXIFS(D:D,B:B,\"Accra\")", int(cafe[cafe["city"] == "Accra"]["cups"].max())),
        ("=SUMPRODUCT((B2:B%d=\"Nairobi\")*F2:F%d)" % (n, n), float(cafe[cafe["city"] == "Nairobi"]["revenue"].sum())),
        ("=COUNT(FILTER(D2:D%d,D2:D%d>=50))" % (n, n), int((cafe["cups"] >= 50).sum())),
    ]
    for formula, want in data:
        try:
            _, info = _build(formula, ns, {"sheet": "cafe", "cell": "J2"})
            got = info["values"][0][0]
        except ExcelError as err:
            got = "refused: %s" % err
        if not _same_value(got, want) and not (_is_num(got) and _is_num(want) and abs(got - want) < 1e-6):
            fails.append("%s gave %s, not %s" % (formula, _said(got) if not isinstance(got, str) or not got.startswith("refused") else got, _said(want)))
    # Filling down, and a running total that reads the row above
    _, info = _build("=D2*E2", ns, {"sheet": "cafe", "cell": "H2", "fill": True})
    want = (cafe["cups"] * cafe["price"]).tolist()
    if len(info["values"]) != len(cafe) or any(abs(r[0] - w) > 1e-9 for r, w in zip(info["values"], want)):
        fails.append("=D2*E2 filled down didn't give cups x price on every row")
    _, info = _build("=SUM($F$2:F2)", ns, {"sheet": "cafe", "cell": "H2", "fill": True})
    if abs(info["values"][-1][0] - float(cafe["revenue"].sum())) > 1e-6:
        fails.append("=SUM($F$2:F2) filled down doesn't end at the total")
    _, info = _build("=IF(ROW()=2,F2,H1+F2)", ns, {"sheet": "cafe", "cell": "H2", "fill": True})
    if abs(info["values"][-1][0] - float(cafe["revenue"].sum())) > 1e-6:
        fails.append("a running total reading the row above doesn't end at the total")
    try:
        _build("=SUM(H:H)", ns, {"sheet": "cafe", "cell": "H2"})
        fails.append("=SUM(H:H) in H2 should be refused as circular")
    except ExcelError:
        pass
    _, info = _build("J1: Lagos\n=SUMIF(B:B,J1,F:F)", ns, {"sheet": "cafe", "cell": "J2"})
    if abs(info["values"][0][0] - float(cafe[cafe["city"] == "Lagos"]["revenue"].sum())) > 1e-6:
        fails.append("a criteria cell typed as J1: Lagos isn't read")
    _, info = _build("=SORT(UNIQUE(B2:B%d))" % n, ns, {"sheet": "cafe", "cell": "J2"})
    if [r[0] for r in info["values"]] != sorted(cafe["city"].unique()):
        fails.append("SORT(UNIQUE()) doesn't spill the cities in order")
    if fails:
        raise AssertionError("\n".join(fails))
    return True
