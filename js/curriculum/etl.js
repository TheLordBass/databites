/* ETL and pipelines: one nightly export from the cafe tills, carried from
   raw text to a database the way a data team would do it. Read it as sent,
   check it's what was promised, clean it with every bad row set aside and
   explained, load it so a rerun can't double it, then wrap the stages in a
   pipeline that logs, retries, runs its steps in order and checks itself.

   Builds on pandas, SQL and the Python course's own small ETL program
   (py-80). The data is made up and lives in the lessons (TILL below), so
   every number is fixed. From part 2 on, a lesson's `setup` carries the
   pipeline built so far (curriculum/index.js lessonPrelude runs it first),
   so the editor holds only the new step. */

const SQLITE = ['sqlite3'];

// The tills' nightly export, as sent: a messy header, ids with leading zeros,
// a shop in the wrong case, cups as a word and as nothing, a resent order
// (0104, corrected) and a date in another layout.
const TILL = `TILL = """Order ID, Date ,Shop,Drink,Cups,Price
0101,2024-05-01,Lagos,latte,40,4.50
0102,2024-05-01,accra ,tea,25,2.75
0103,2024-05-02,Lagos,mocha,twelve,5.00
0104,2024-05-02,Nairobi,latte,30,4.25
0105,2024-05-02,Accra,latte,,4.50
0104,2024-05-02,Nairobi,latte,32,4.25
0106,2024-05-03,Accra,flat white,18,4.75
0107,2024-05-03,Lagos,latte,22,4.50
0108,05/03/2024,Nairobi,tea,15,2.75
0109,2024-05-04,Lagos,mocha,9,5.00
"""`;

// The same export after someone renamed a column and added one.
const CHANGED = `CHANGED = """Order ID,Date,Shop,Drink,Cups,Unit Price,Staff
0110,2024-05-05,Lagos,latte,20,4.50,Ada
0111,2024-05-05,Accra,tea,12,2.75,Kofi
"""`;

const API = `API = """{"page": 1, "orders": [
  {"id": "D-501", "placed": "2024-05-01", "shop": {"city": "Lagos"}, "items": 3, "total": 13.5},
  {"id": "D-502", "placed": "2024-05-01", "shop": {"city": "Accra"}, "items": 1, "total": 4.75},
  {"id": "D-503", "placed": "2024-05-02", "shop": {"city": "Lagos"}, "items": 2, "total": 9.0}
]}"""`;

const READ = `import io

${TILL}
raw = pd.read_csv(io.StringIO(TILL), dtype=str, keep_default_na=False)`;

const CONTRACT = `${READ}
${CHANGED}
EXPECTED = ["order id", "date", "shop", "drink", "cups", "price"]
changed = pd.read_csv(io.StringIO(CHANGED), dtype=str, keep_default_na=False)`;

const CHECK_COLUMNS = `def check_columns(df):
    cols = [c.strip().lower() for c in df.columns]
    missing = sorted(set(EXPECTED) - set(cols))
    extra = sorted(set(cols) - set(EXPECTED))
    return missing, extra`;

const NAMES = `def clean_names(df):
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df`;

const TYPES = `def fix_types(df):
    df = df.copy()
    df["shop"] = df["shop"].str.strip().str.title()
    df["cups"] = pd.to_numeric(df["cups"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d", errors="coerce")
    return df`;

const SPLIT = `def split_bad(df):
    reason = pd.Series("", index=df.index)
    reason.loc[df["date"].isna()] = "date unreadable"
    reason.loc[df["cups"].isna()] = "cups missing or not a number"
    bad = reason != ""
    return df[~bad], df[bad].assign(reason=reason[bad])`;

const TRANSFORM = `def transform(raw):
    df = fix_types(clean_names(raw))
    good, rejects = split_bad(df)
    clean = good.drop_duplicates(subset="order_id", keep="last").copy()
    clean["cups"] = clean["cups"].astype(int)
    clean["date"] = clean["date"].dt.strftime("%Y-%m-%d")
    return clean.reset_index(drop=True), rejects.reset_index(drop=True)`;

const EXTRACT = `EXPECTED = ["order id", "date", "shop", "drink", "cups", "price"]

def extract(text):
    df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
    cols = [c.strip().lower() for c in df.columns]
    missing = sorted(set(EXPECTED) - set(cols))
    if missing:
        raise ValueError("missing columns: " + ", ".join(missing))
    return df`;

const LOAD = `def load(df, con):
    with con:
        con.execute("""CREATE TABLE IF NOT EXISTS orders (order_id TEXT, date TEXT,
            shop TEXT, drink TEXT, cups INTEGER, price REAL)""")
        con.executemany("DELETE FROM orders WHERE order_id = ?", [(i,) for i in df["order_id"]])
        df.to_sql("orders", con, index=False, if_exists="append")`;

// The pipeline so far, at each stage of the course.
const NAMED = `${READ}

${NAMES}

named = clean_names(raw)`;

const TYPED = `${NAMED}

${TYPES}

typed = fix_types(named)`;

const GOOD = `${TYPED}

${SPLIT}

good, rejects = split_bad(typed)`;

const PARTS = `${READ}

${NAMES}

${TYPES}

${SPLIT}`;

const CLEAN = `${PARTS}

${TRANSFORM}

clean, rejects = transform(raw)`;

const DB = `import sqlite3
${CLEAN}`;

const PIPE = `import sqlite3
${PARTS}

${TRANSFORM}

${EXTRACT}

${LOAD}`;

const FIXES = `fixes = pd.DataFrame([
    {"order_id": "0109", "date": "2024-05-04", "shop": "Lagos", "drink": "mocha", "cups": 11, "price": 5.0},
    {"order_id": "0110", "date": "2024-05-05", "shop": "Accra", "drink": "latte", "cups": 27, "price": 4.5},
])`;

const TONIGHT = `tonight = pd.DataFrame([
    {"order_id": "0109", "date": "2024-05-04", "shop": "Lagos", "drink": "mocha", "cups": 9, "price": 5.0},
    {"order_id": "0111", "date": "2024-05-05", "shop": "Nairobi", "drink": "tea", "cups": 14, "price": 2.75},
    {"order_id": "0112", "date": "2024-05-06", "shop": "Lagos", "drink": "latte", "cups": 35, "price": 4.5},
])`;

const UPSERT = `UPSERT = """INSERT INTO orders VALUES (:order_id, :date, :shop, :drink, :cups, :price)
ON CONFLICT(order_id) DO UPDATE SET date = excluded.date, shop = excluded.shop,
    drink = excluded.drink, cups = excluded.cups, price = excluded.price"""`;

const DEPS = `deps = {
    "sales_report": ["load_orders", "load_shops"],
    "load_orders": ["transform_orders"],
    "transform_orders": ["extract_orders"],
    "load_shops": ["extract_shops"],
    "extract_orders": [],
    "extract_shops": [],
}`;

const RUN = `def run(text, con):
    raw = extract(text)
    clean, rejects = transform(raw)
    load(clean, con)
    return {
        "in": len(raw),
        "clean": len(clean),
        "rejected": len(rejects),
        "duplicates": len(raw) - len(clean) - len(rejects),
        "loaded": con.execute("SELECT COUNT(*) FROM orders").fetchone()[0],
    }`;

const FLAKY = `calls = {"n": 0}

def fetch_till():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("the till didn't answer")
    return TILL`;

const BROKEN = `broken = pd.concat([clean, clean.head(1)], ignore_index=True)
broken.loc[1, "cups"] = 0`;

export const ETL = [

/* ── Getting data in ───────────────────────────────────── */
{
  id: 'et-01', mins: 3,
  title: 'What a pipeline does',
  concept: [
    'A **pipeline** moves data from where it starts to where it gets used, the same way every time: **extract** it, **transform** it (tidy and check), then **load** it into a database. ETL for short.',
    'This course follows one. Each night the cafe tills send an export, `TILL`, as text, and it has to end up in the database the reports read.',
    '`pd.read_csv(io.StringIO(TILL))` reads text as if it were a file. `io.StringIO` wraps a string so that anything that reads files can read it.',
  ],
  starter: `import io

${TILL}
print(TILL[:80])
raw = None    # read TILL into a table here`,
  task: 'Read `TILL` into `raw` with `pd.read_csv(io.StringIO(TILL))`, then set `rows` to how many rows arrived.',
  hint: '`raw = pd.read_csv(io.StringIO(TILL))`, then `rows = len(raw)`.',
  solution: `import io

${TILL}
raw = pd.read_csv(io.StringIO(TILL))
rows = len(raw)

print(rows, "rows arrived")
raw`,
  check: `assert isinstance(globals().get("raw"), pd.DataFrame), "Make raw a DataFrame: pd.read_csv(io.StringIO(TILL))."
assert len(raw) == 10, "TILL has 10 rows under its header line. Read all of it."
assert int(globals().get("rows", -1)) == 10, "rows is how many rows arrived: len(raw)."`,
},
{
  id: 'et-02', mins: 3,
  title: 'Read it exactly as sent',
  concept: [
    'Left to itself, `read_csv` guesses each column\'s type. It read the order ids as numbers, so `0101` became `101`: the zero that was part of the id is gone.',
    '`dtype=str` reads every column as text, exactly as sent. `keep_default_na=False` keeps an empty cell as empty text, instead of turning it into NaN.',
    'Extract should change nothing. Read the data as it is, then fix the types on purpose in the transform step, where every change can be seen and counted.',
  ],
  starter: `import io

${TILL}
raw = pd.read_csv(io.StringIO(TILL))
print(raw["Order ID"].head(3).tolist())`,
  task: 'Read `TILL` into `raw` again, this time with `dtype=str` and `keep_default_na=False`. Then set `first_id` to the first order id, which should be the text `"0101"`.',
  hint: '`raw = pd.read_csv(io.StringIO(TILL), dtype=str, keep_default_na=False)`, then `first_id = raw["Order ID"].iloc[0]`.',
  solution: `import io

${TILL}
raw = pd.read_csv(io.StringIO(TILL), dtype=str, keep_default_na=False)
first_id = raw["Order ID"].iloc[0]

print("first id:", first_id)
print("cups as sent:", raw["Cups"].tolist())`,
  check: `assert isinstance(globals().get("raw"), pd.DataFrame) and len(raw) == 10, "Read all of TILL into raw."
assert all(raw[c].dtype == object for c in raw.columns), "Read every column as text: dtype=str."
assert globals().get("first_id") == "0101", 'first_id is the first order id as sent, with its zero: "0101". That needs dtype=str.'
assert raw["Cups"].iloc[4] == "", "Keep an empty cell as empty text with keep_default_na=False, not NaN."`,
},
{
  id: 'et-03', mins: 3,
  title: 'Extract from an API',
  concept: [
    'Many sources are web **APIs**, which answer in **JSON**: text made of `{...}` objects and `[...]` lists, just like Python\'s dicts and lists.',
    '`json.loads(text)` turns JSON text into Python dicts and lists. `pd.json_normalize(list_of_dicts)` makes a table of them, and turns a nested object into columns with dotted names, like `shop.city`.',
    'The delivery app sends its orders this way, in `API`. Same pipeline idea, a different way in.',
  ],
  starter: `import json

${API}
data = json.loads(API)
data["orders"][0]`,
  task: 'Turn `API` into `data` with `json.loads`, then make `deliveries`: a table of `data["orders"]`, made with `pd.json_normalize`. It should have a `shop.city` column.',
  hint: '`deliveries = pd.json_normalize(data["orders"])`.',
  solution: `import json

${API}
data = json.loads(API)
deliveries = pd.json_normalize(data["orders"])

deliveries`,
  check: `assert isinstance(globals().get("data"), dict) and "orders" in data, "data is json.loads(API): a dict with an orders list in it."
assert isinstance(globals().get("deliveries"), pd.DataFrame), 'Make deliveries with pd.json_normalize(data["orders"]).'
assert len(deliveries) == 3, "There are 3 orders in the API's answer."
assert "shop.city" in deliveries.columns, "json_normalize turns the nested shop object into a shop.city column."
assert deliveries["shop.city"].tolist() == ["Lagos", "Accra", "Lagos"], "shop.city should read Lagos, Accra, Lagos."`,
},
{
  id: 'et-04', mins: 4, setup: CONTRACT,
  title: 'Check what arrived',
  concept: [
    'A **data contract** is the promise about what a source sends: these columns, with this meaning. Check it first, and a changed export is caught before it does any damage.',
    'Turn the column names into sets and subtract: `set(EXPECTED) - set(cols)` is what\'s **missing**, and `set(cols) - set(EXPECTED)` is what\'s **extra**.',
    '`raw` (from the tills), `changed` (an export someone altered) and `EXPECTED` (the columns the tills promise) are ready. Compare names stripped and in lower case, so `" Date "` still counts as `date`.',
  ],
  starter: `def check_columns(df):
    cols = [c.strip().lower() for c in df.columns]
    missing = []    # expected, but not there
    extra = []      # there, but not expected
    return missing, extra

print(check_columns(changed))`,
  task: 'Finish `check_columns(df)`: it returns two sorted lists, the expected columns that are missing and the columns nobody expected. Run it on `raw` into `ok` and on `changed` into `broken`.',
  hint: '`missing = sorted(set(EXPECTED) - set(cols))` and `extra = sorted(set(cols) - set(EXPECTED))`. Then `ok = check_columns(raw)` and `broken = check_columns(changed)`.',
  solution: `def check_columns(df):
    cols = [c.strip().lower() for c in df.columns]
    missing = sorted(set(EXPECTED) - set(cols))
    extra = sorted(set(cols) - set(EXPECTED))
    return missing, extra

ok = check_columns(raw)
broken = check_columns(changed)

print("tills:", ok)
print("changed export:", broken)`,
  check: `assert callable(globals().get("check_columns")), "Write the function check_columns(df)."
_m, _e = check_columns(changed)
assert list(_m) == ["price"], "On changed, price is missing: sorted(set(EXPECTED) - set(cols))."
assert list(_e) == ["staff", "unit price"], "On changed, the extras are staff and unit price, sorted: sorted(set(cols) - set(EXPECTED))."
assert [list(x) for x in check_columns(raw)] == [[], []], "On raw nothing is missing or extra, once names are stripped and in lower case."
assert [list(x) for x in globals().get("ok", ([0], []))] == [[], []] and list(globals().get("broken", ([], []))[0]) == ["price"], "Keep the two results in ok and broken."`,
},
{
  id: 'et-05', mins: 4, setup: `${CONTRACT}

${CHECK_COLUMNS}`,
  title: 'Stop early on bad input',
  concept: [
    'When the contract is broken, the safest move is to **stop**: load nothing, and say why. A half-loaded table is worse than a missing one, because nobody can tell it\'s wrong.',
    '`raise ValueError("...")` stops a function with a message. Whoever called it can catch that with `try:` and `except ValueError as e:`, and read the message as `str(e)`.',
    'A pipeline that fails loudly, with a clear reason, gets fixed in minutes. One that quietly loads bad data can go unnoticed for weeks. `check_columns` from the last lesson is ready.',
  ],
  starter: `def extract(text):
    df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
    missing, extra = check_columns(df)
    # stop here, with a ValueError, if anything is missing
    return df

raw = extract(TILL)
broken = extract(CHANGED)
print(len(broken), "rows: a broken export went through without a word")`,
  task: 'Make `extract` raise `ValueError("missing columns: price")` (the missing names after the colon, joined by `", "`) when columns are missing. Run it on `TILL` into `raw`, and on `CHANGED` inside `try`/`except`, keeping the message in `problem`.',
  hint: 'In extract: `if missing:` / `raise ValueError("missing columns: " + ", ".join(missing))`. Then `try:` / `extract(CHANGED)` / `except ValueError as e:` / `problem = str(e)`.',
  solution: `def extract(text):
    df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
    missing, extra = check_columns(df)
    if missing:
        raise ValueError("missing columns: " + ", ".join(missing))
    return df

raw = extract(TILL)
try:
    extract(CHANGED)
    problem = None
except ValueError as e:
    problem = str(e)

print(len(raw), "rows extracted from the tills")
print("the changed export stopped with:", problem)`,
  check: `assert callable(globals().get("extract")), "Write extract(text)."
assert len(extract(TILL)) == 10, "extract(TILL) returns all 10 rows: nothing is missing there."
try:
    extract(CHANGED)
    _raised = None
except ValueError as _err:
    _raised = str(_err)
assert _raised is not None, "extract(CHANGED) should raise a ValueError, because price is missing."
assert _raised == "missing columns: price", 'The message should be "missing columns: price": "missing columns: " + ", ".join(missing).'
assert globals().get("problem") == "missing columns: price", "Catch it with try and except ValueError as e, and keep str(e) in problem."`,
},

/* ── Cleaning on the way ───────────────────────────────── */
{
  id: 'et-06', mins: 3, setup: READ,
  title: 'One style for column names',
  concept: [
    'Exports come with names like `" Date "` and `"Order ID"`. Put them all in one style at the start of the transform, and every later step can rely on them.',
    'The usual style is **snake_case**: lower case, no spaces at either end, and underscores between words. `c.strip().lower().replace(" ", "_")` does that to one name.',
    'Write it as a function that takes a table and returns a new one. `df = df.copy()` first, so the table passed in is left as it was. `raw`, read as text, is ready.',
  ],
  starter: `def clean_names(df):
    df = df.copy()
    # make every column name snake_case here
    return df

named = clean_names(raw)
list(named.columns)`,
  task: 'Finish `clean_names(df)`: it returns a copy with every column name in snake_case. Then set `named = clean_names(raw)`.',
  hint: '`df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]`.',
  solution: `def clean_names(df):
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df

named = clean_names(raw)
print("before:", list(raw.columns))
print("after: ", list(named.columns))`,
  check: `assert callable(globals().get("clean_names")), "Write clean_names(df)."
assert isinstance(globals().get("named"), pd.DataFrame), "Set named = clean_names(raw)."
assert list(named.columns) == ["order_id", "date", "shop", "drink", "cups", "price"], "Each name stripped, in lower case, with spaces as underscores: c.strip().lower().replace(' ', '_')."
assert list(raw.columns)[0] == "Order ID", "Leave raw as it was: df = df.copy() first, then change the copy."`,
},
{
  id: 'et-07', mins: 4, setup: NAMED,
  title: 'Fix the types, and count what failed',
  concept: [
    'Now turn text into real types. `pd.to_numeric(col, errors="coerce")` makes numbers, and anything that isn\'t one becomes NaN, instead of stopping the whole run.',
    '`pd.to_datetime(col, format="%Y-%m-%d", errors="coerce")` reads dates in exactly that layout. A date sent as `05/03/2024` doesn\'t match, so it becomes NaT, the missing date.',
    'Coercing hides problems unless you count them, so always check how many values didn\'t convert: `col.isna().sum()`. `named`, with tidy column names, is ready.',
  ],
  starter: `def fix_types(df):
    df = df.copy()
    df["shop"] = df["shop"].str.strip().str.title()
    # cups and price as numbers, date as a date
    return df

typed = fix_types(named)
typed.dtypes`,
  task: 'Finish `fix_types`: cups and price with `pd.to_numeric(..., errors="coerce")`, date with `pd.to_datetime(..., format="%Y-%m-%d", errors="coerce")`. Make `typed = fix_types(named)`, then set `bad_cups` and `bad_dates`: how many of each came out missing.',
  hint: '`df["cups"] = pd.to_numeric(df["cups"], errors="coerce")`, the same for price, and `df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d", errors="coerce")`. Then `bad_cups = int(typed["cups"].isna().sum())`.',
  solution: `def fix_types(df):
    df = df.copy()
    df["shop"] = df["shop"].str.strip().str.title()
    df["cups"] = pd.to_numeric(df["cups"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d", errors="coerce")
    return df

typed = fix_types(named)
bad_cups = int(typed["cups"].isna().sum())
bad_dates = int(typed["date"].isna().sum())

print(bad_cups, "cups and", bad_dates, "date didn't convert")
typed`,
  check: `assert callable(globals().get("fix_types")), "Write fix_types(df)."
assert pd.api.types.is_numeric_dtype(typed["cups"]) and pd.api.types.is_numeric_dtype(typed["price"]), "cups and price should be numbers: pd.to_numeric(..., errors='coerce')."
assert pd.api.types.is_datetime64_any_dtype(typed["date"]), "date should be a date: pd.to_datetime(..., format='%Y-%m-%d', errors='coerce')."
assert int(globals().get("bad_cups", -1)) == 2, "Two cups values didn't convert: 'twelve' and an empty one. Count them with typed['cups'].isna().sum()."
assert int(globals().get("bad_dates", -1)) == 1, "One date is in another layout, 05/03/2024, so it becomes NaT. Count it with typed['date'].isna().sum()."
assert sorted(typed["shop"].unique()) == ["Accra", "Lagos", "Nairobi"], "Keep the shop line, so 'accra ' becomes 'Accra'."`,
},
{
  id: 'et-08', mins: 4, setup: TYPED,
  title: 'Set bad rows aside, with a reason',
  concept: [
    'A row that fails its checks shouldn\'t reach the database, and it shouldn\'t vanish either. Put it in **quarantine**: a table of rejects, each with its reason, for someone to fix at the source.',
    'Build the reasons as a column. Start with `""` for every row, then fill in a reason wherever a check fails, with `reason.loc[mask] = "..."`. A row with any reason is a reject.',
    '`df[~bad]` keeps the rows that are fine and `df[bad]` the rest, so between them the two tables hold every row exactly once. `typed`, with real types, is ready.',
  ],
  starter: `def split_bad(df):
    reason = pd.Series("", index=df.index)
    # fill in a reason where the date or the cups is missing
    bad = reason != ""
    return df[~bad], df[bad].assign(reason=reason[bad])

good, rejects = split_bad(typed)
print(len(good), "good,", len(rejects), "set aside")`,
  task: 'Finish `split_bad(df)`: a row with no date gets the reason `"date unreadable"`, and a row with no cups `"cups missing or not a number"`. Then set `good, rejects = split_bad(typed)`.',
  hint: '`reason.loc[df["date"].isna()] = "date unreadable"` and `reason.loc[df["cups"].isna()] = "cups missing or not a number"`.',
  solution: `def split_bad(df):
    reason = pd.Series("", index=df.index)
    reason.loc[df["date"].isna()] = "date unreadable"
    reason.loc[df["cups"].isna()] = "cups missing or not a number"
    bad = reason != ""
    return df[~bad], df[bad].assign(reason=reason[bad])

good, rejects = split_bad(typed)
print(len(good), "good,", len(rejects), "set aside")
rejects[["order_id", "reason"]]`,
  check: `assert len(rejects) == 3 and "reason" in rejects.columns, "3 rows go to rejects, each with a reason column."
assert len(good) == 7, "7 rows pass: all but the bad date and the two bad cups. (0104 is still there twice; that's the next lesson.)"
_why = dict(zip(rejects["order_id"], rejects["reason"]))
assert _why == {"0103": "cups missing or not a number", "0105": "cups missing or not a number", "0108": "date unreadable"}, "0103 and 0105 have bad cups, and 0108 an unreadable date. Use the exact reasons from the task."
assert len(good) + len(rejects) == len(typed), "Between them, good and rejects hold every row exactly once."`,
},
{
  id: 'et-09', mins: 3, setup: GOOD,
  title: 'Remove duplicates, on purpose',
  concept: [
    'Sources resend rows. A till that lost its connection sends the same order again, sometimes corrected: order `0104` arrives twice, the second time with 32 cups.',
    '`df.drop_duplicates(subset="order_id", keep="last")` keeps one row per order id, the last one sent, which is the newest version.',
    'Decide which column makes a row unique (its **key**), and say so in the code. Dropping only rows that match in every column would keep both versions of `0104`. `good`, the rows that passed, is ready.',
  ],
  starter: `print(good["order_id"].tolist())
deduped = good`,
  task: 'Make `deduped`: `good` with one row per order id, keeping the last one sent. Set `dropped` to how many rows that removed, and `cups_0104` to the cups that order now has.',
  hint: '`deduped = good.drop_duplicates(subset="order_id", keep="last")`, `dropped = len(good) - len(deduped)`, then pick 0104\'s cups with `deduped.loc[deduped["order_id"] == "0104", "cups"].iloc[0]`.',
  solution: `deduped = good.drop_duplicates(subset="order_id", keep="last")
dropped = len(good) - len(deduped)
cups_0104 = int(deduped.loc[deduped["order_id"] == "0104", "cups"].iloc[0])

print(dropped, "duplicate dropped; 0104 now has", cups_0104, "cups")
deduped`,
  check: `assert len(deduped) == 6 and deduped["order_id"].is_unique, "One row per order id: good.drop_duplicates(subset='order_id', keep='last')."
assert int(globals().get("dropped", -1)) == 1, "dropped is how many rows went: len(good) - len(deduped)."
assert int(globals().get("cups_0104", -1)) == 32, "Keep the last version of 0104, the corrected one with 32 cups: keep='last'."`,
},
{
  id: 'et-10', mins: 4, setup: PARTS,
  title: 'One transform, start to finish',
  concept: [
    'Put the steps in one function, `transform(raw)`, that returns the clean table and the rejects. Same input in, same output out, every time: that\'s what makes a pipeline safe to rerun.',
    'The last touches go here too: cups as whole numbers with `.astype(int)`, and dates back to text like `2024-05-01` with `.dt.strftime("%Y-%m-%d")`, the way SQLite stores them.',
    'Count as you go: rows in, clean, rejected and duplicates dropped. Those four numbers say whether a run went well. `clean_names`, `fix_types` and `split_bad` are ready.',
  ],
  starter: `def transform(raw):
    df = fix_types(clean_names(raw))
    good, rejects = split_bad(df)
    clean = good    # one row per order, cups as whole numbers, dates as text
    return clean.reset_index(drop=True), rejects.reset_index(drop=True)

clean, rejects = transform(raw)
counts = {}`,
  task: 'Finish `transform`: drop the duplicates, make cups whole numbers and turn the dates into text. Run it into `clean` and `rejects`, then make `counts`: a dict with the keys `"in"`, `"clean"`, `"rejected"` and `"duplicates"`.',
  hint: '`clean = good.drop_duplicates(subset="order_id", keep="last").copy()`, then `clean["cups"] = clean["cups"].astype(int)` and `clean["date"] = clean["date"].dt.strftime("%Y-%m-%d")`. Duplicates are `len(raw) - len(clean) - len(rejects)`.',
  solution: `def transform(raw):
    df = fix_types(clean_names(raw))
    good, rejects = split_bad(df)
    clean = good.drop_duplicates(subset="order_id", keep="last").copy()
    clean["cups"] = clean["cups"].astype(int)
    clean["date"] = clean["date"].dt.strftime("%Y-%m-%d")
    return clean.reset_index(drop=True), rejects.reset_index(drop=True)

clean, rejects = transform(raw)
counts = {
    "in": len(raw),
    "clean": len(clean),
    "rejected": len(rejects),
    "duplicates": len(raw) - len(clean) - len(rejects),
}

print(counts)
clean`,
  check: `assert callable(globals().get("transform")), "Write transform(raw)."
_c, _r = transform(raw)
assert len(_c) == 6 and _c["order_id"].is_unique, "transform keeps one row per order: 6 clean rows."
assert len(_r) == 3, "transform returns the 3 rejects too."
assert pd.api.types.is_integer_dtype(_c["cups"]), "Make cups whole numbers: .astype(int)."
assert _c["date"].tolist()[0] == "2024-05-01", "Turn the dates back into text like 2024-05-01: .dt.strftime('%Y-%m-%d')."
assert dict(globals().get("counts", {})) == {"in": 10, "clean": 6, "rejected": 3, "duplicates": 1}, "counts should be in 10, clean 6, rejected 3 and duplicates 1."`,
},

/* ── Loading it safely ─────────────────────────────────── */
{
  id: 'et-11', mins: 3, needs: SQLITE, setup: DB,
  title: 'Load it into a database',
  concept: [
    'The load step puts the clean table where reports can use it. Here that\'s SQLite: `con = sqlite3.connect(":memory:")` makes a database that lives in memory.',
    '`clean.to_sql("orders", con, index=False)` writes a DataFrame as a table. `index=False` leaves out the row numbers, which aren\'t data.',
    'Then ask it a question in SQL to prove the data landed: `pd.read_sql("SELECT ...", con)` runs a query and gives back a DataFrame. `clean`, from your `transform`, is ready.',
  ],
  starter: `con = sqlite3.connect(":memory:")
# load clean into a table called orders here

pd.read_sql("SELECT name FROM sqlite_master WHERE type = 'table'", con)`,
  task: 'Load `clean` into a table called `orders`. Then make `by_shop` with SQL: each shop and its total cups, as columns `shop` and `cups`, ordered by shop.',
  hint: '`clean.to_sql("orders", con, index=False)`, then `by_shop = pd.read_sql("SELECT shop, SUM(cups) AS cups FROM orders GROUP BY shop ORDER BY shop", con)`.',
  solution: `con = sqlite3.connect(":memory:")
clean.to_sql("orders", con, index=False)

by_shop = pd.read_sql("SELECT shop, SUM(cups) AS cups FROM orders GROUP BY shop ORDER BY shop", con)
by_shop`,
  check: `assert "con" in globals(), "Keep the database connection in con."
_tables = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type = 'table'")]
assert "orders" in _tables, "Load clean into a table called orders: clean.to_sql('orders', con, index=False)."
assert con.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 6, "orders should hold the 6 clean rows."
assert "index" not in [r[1] for r in con.execute("PRAGMA table_info(orders)")], "Leave the row numbers out: index=False."
assert isinstance(globals().get("by_shop"), pd.DataFrame), "Make by_shop with pd.read_sql(...)."
assert by_shop["shop"].tolist() == ["Accra", "Lagos", "Nairobi"] and [int(v) for v in by_shop["cups"]] == [43, 71, 32], "by_shop: SELECT shop, SUM(cups) AS cups ... GROUP BY shop ORDER BY shop."`,
},
{
  id: 'et-12', mins: 4, needs: SQLITE, setup: DB,
  title: 'Safe to run twice',
  concept: [
    'Pipelines get rerun: after a failure, after a fix, by someone who wasn\'t sure it worked. A load that just **appends** doubles the data on a second run.',
    'A load that leaves the same result however many times it runs is **idempotent**. One way: delete what this batch covers, then insert it.',
    '`with con:` makes everything in the block one **transaction**: either all of it happens, or, if anything fails, none of it does. So a run can\'t stop halfway with the old rows deleted and the new ones missing.',
  ],
  starter: `con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE orders (order_id TEXT, date TEXT, shop TEXT, drink TEXT, cups INTEGER, price REAL)")

def load(df, con):
    df.to_sql("orders", con, index=False, if_exists="append")

load(clean, con)
load(clean, con)    # a rerun
after_two_runs = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
print(after_two_runs, "rows after two runs")`,
  task: 'Change `load` so running it twice still leaves 6 rows: inside `with con:`, delete the batch\'s order ids from `orders`, then append `df`.',
  hint: '`with con:` / `con.executemany("DELETE FROM orders WHERE order_id = ?", [(i,) for i in df["order_id"]])` / `df.to_sql("orders", con, index=False, if_exists="append")`.',
  solution: `con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE orders (order_id TEXT, date TEXT, shop TEXT, drink TEXT, cups INTEGER, price REAL)")

def load(df, con):
    with con:
        con.executemany("DELETE FROM orders WHERE order_id = ?", [(i,) for i in df["order_id"]])
        df.to_sql("orders", con, index=False, if_exists="append")

load(clean, con)
load(clean, con)    # a rerun
after_two_runs = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
print(after_two_runs, "rows after two runs")`,
  check: `assert int(globals().get("after_two_runs", -1)) == 6, "Two runs should still leave 6 rows: delete the batch's order ids, then append."
load(clean, con)
assert con.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 6, "A third run should leave 6 rows too."`,
},
{
  id: 'et-13', mins: 5, needs: SQLITE, setup: `${DB}

${FIXES}`,
  title: 'Insert or update: the upsert',
  concept: [
    'When a source sends a corrected row, you want to **update** the one you have and **insert** the ones you don\'t. Doing both in one statement is an **upsert**. `fixes` has a correction for 0109 and a new order, 0110.',
    'Give the table a `PRIMARY KEY`, the column no two rows may share. Then `INSERT ... ON CONFLICT(order_id) DO UPDATE SET cups = excluded.cups` updates the row that\'s there instead of failing. `excluded` is the row you tried to insert.',
    '`con.executemany(sql, rows)` runs the statement once per row. `df.to_dict("records")` gives the rows as dicts, and `:name` in the SQL picks each value out by its column name.',
  ],
  starter: `con = sqlite3.connect(":memory:")
con.execute("""CREATE TABLE orders (order_id TEXT PRIMARY KEY, date TEXT, shop TEXT,
    drink TEXT, cups INTEGER, price REAL)""")

UPSERT = """INSERT INTO orders VALUES (:order_id, :date, :shop, :drink, :cups, :price)"""

with con:
    con.executemany(UPSERT, clean.to_dict("records"))
    con.executemany(UPSERT, fixes.to_dict("records"))    # 0109 is already there`,
  task: 'Add `ON CONFLICT(order_id) DO UPDATE SET ...` to `UPSERT`, updating every column from `excluded`, so 0109 is corrected and 0110 added. Then set `total_rows` and `cups_0109`.',
  hint: 'After the VALUES line: `ON CONFLICT(order_id) DO UPDATE SET date = excluded.date, shop = excluded.shop, drink = excluded.drink, cups = excluded.cups, price = excluded.price`. Then `cups_0109 = con.execute("SELECT cups FROM orders WHERE order_id = \'0109\'").fetchone()[0]`.',
  solution: `con = sqlite3.connect(":memory:")
con.execute("""CREATE TABLE orders (order_id TEXT PRIMARY KEY, date TEXT, shop TEXT,
    drink TEXT, cups INTEGER, price REAL)""")

${UPSERT}

with con:
    con.executemany(UPSERT, clean.to_dict("records"))
    con.executemany(UPSERT, fixes.to_dict("records"))    # 0109 is already there

total_rows = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
cups_0109 = con.execute("SELECT cups FROM orders WHERE order_id = '0109'").fetchone()[0]
pd.read_sql("SELECT * FROM orders ORDER BY order_id", con)`,
  check: `_pk = [r[1] for r in con.execute("PRAGMA table_info(orders)") if r[5]]
assert _pk == ["order_id"], "Keep order_id as the PRIMARY KEY, so the database knows two rows can't share it."
assert con.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 7, "The table should hold 7 rows: the 6 clean ones with 0109 updated, and 0110 added."
assert int(globals().get("total_rows", -1)) == 7, "total_rows is the table's size: SELECT COUNT(*) FROM orders."
assert int(globals().get("cups_0109", -1)) == 11, "0109 should now have 11 cups: ON CONFLICT(order_id) DO UPDATE SET cups = excluded.cups."`,
},
{
  id: 'et-14', mins: 4, needs: SQLITE, setup: `${DB}

${TONIGHT}`,
  title: 'Only what\'s new: incremental loads',
  concept: [
    'Reloading everything every night gets slower as the data grows. An **incremental** load takes only what\'s new since last time. `tonight` is the next export: one order already loaded, and two new ones.',
    'The **watermark** is how far the last load got: here, the latest date already in the table, `SELECT MAX(date) FROM orders`. Tonight, load only the rows dated after it.',
    'Dates stored as text like `2024-05-04` compare correctly as text, because the year comes first, then the month, then the day. It\'s one reason to store them that way.',
  ],
  starter: `con = sqlite3.connect(":memory:")
clean.to_sql("orders", con, index=False)

watermark = None    # the latest date already loaded
new = tonight       # only the rows dated after it
new.to_sql("orders", con, index=False, if_exists="append")
print(con.execute("SELECT COUNT(*) FROM orders").fetchone()[0], "rows")`,
  task: 'Read the watermark into `watermark`, then load only the rows of `tonight` dated after it. Set `new_rows` to how many that was, and `total_rows` to the table\'s size afterwards.',
  hint: '`watermark = con.execute("SELECT MAX(date) FROM orders").fetchone()[0]`, then `new = tonight[tonight["date"] > watermark]`.',
  solution: `con = sqlite3.connect(":memory:")
clean.to_sql("orders", con, index=False)

watermark = con.execute("SELECT MAX(date) FROM orders").fetchone()[0]
new = tonight[tonight["date"] > watermark]
new.to_sql("orders", con, index=False, if_exists="append")

new_rows = len(new)
total_rows = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
print("watermark:", watermark)
print(new_rows, "new rows loaded,", total_rows, "in the table")`,
  check: `assert globals().get("watermark") == "2024-05-04", "The watermark is the latest date already loaded: SELECT MAX(date) FROM orders, which is 2024-05-04."
assert int(globals().get("new_rows", -1)) == 2, "Only 0111 and 0112 are dated after the watermark: tonight[tonight['date'] > watermark]."
assert int(globals().get("total_rows", -1)) == 8 and con.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 8, "The table should end with 8 rows: 6 plus the 2 new ones."`,
},
{
  id: 'et-15', mins: 4, needs: SQLITE, setup: `${DB}

${LOAD}

counts = {"in": len(raw), "clean": len(clean), "rejected": len(rejects),
          "duplicates": len(raw) - len(clean) - len(rejects)}
con = sqlite3.connect(":memory:")
load(clean, con)`,
  title: 'Check the books balance',
  concept: [
    'After a run, **reconcile**: every row that came in should be accounted for. Rows in = rows loaded + rows rejected + duplicates dropped. If that doesn\'t hold, something went missing.',
    'Check the totals too, not just the counts. The cups in the database should equal the cups in the clean table: `SELECT SUM(cups)` against `clean["cups"].sum()`.',
    'Make the final check an `assert`, so a run that fails it stops with a message instead of handing out numbers nobody should trust. The load has run, and `counts` is ready.',
  ],
  starter: `print(counts)
loaded = 0
balanced = None`,
  task: 'Set `loaded` to the rows in `orders`, and `balanced` to True when rows in equals loaded + rejected + duplicates and the cups totals match. Then `assert balanced, "the books don\'t balance"`.',
  hint: '`loaded = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]`, `db_cups = con.execute("SELECT SUM(cups) FROM orders").fetchone()[0]`, then `balanced = (counts["in"] == loaded + counts["rejected"] + counts["duplicates"] and db_cups == clean["cups"].sum())`.',
  solution: `loaded = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
db_cups = con.execute("SELECT SUM(cups) FROM orders").fetchone()[0]

balanced = (counts["in"] == loaded + counts["rejected"] + counts["duplicates"]
            and db_cups == clean["cups"].sum())
assert balanced, "the books don't balance"

print(counts["in"], "in =", loaded, "loaded +", counts["rejected"], "rejected +", counts["duplicates"], "duplicate")
print("cups:", db_cups, "in the database,", clean["cups"].sum(), "in the clean table")`,
  check: `assert int(globals().get("loaded", -1)) == 6, "loaded is the rows in the table: SELECT COUNT(*) FROM orders."
assert globals().get("balanced") is not None and bool(balanced), "balanced should be True: 10 in = 6 loaded + 3 rejected + 1 duplicate, and the cups totals match."`,
},

/* ── A pipeline you can trust ──────────────────────────── */
{
  id: 'et-16', mins: 4, needs: SQLITE, setup: PIPE,
  title: 'Run it as one pipeline',
  concept: [
    'Now join the stages: `run(text, con)` calls extract, transform and load in order, and returns a **summary**, the counts for that run.',
    'Each stage only talks to the next through what it returns. That keeps them apart: you can test transform without a database, or change the source without touching the load.',
    'Return the summary rather than printing it, so whatever schedules the pipeline can store it, compare runs or raise an alarm. Your `extract`, `transform` and safe `load` are ready.',
  ],
  starter: `def run(text, con):
    raw = extract(text)
    # transform, load, and return the counts
    return {}

con = sqlite3.connect(":memory:")
summary = run(TILL, con)
summary`,
  task: 'Finish `run(text, con)`: extract, transform and load, then return the counts `"in"`, `"clean"`, `"rejected"` and `"duplicates"`, plus `"loaded"`, the rows in `orders` afterwards. Set `summary = run(TILL, con)`.',
  hint: '`clean, rejects = transform(raw)`, then `load(clean, con)`, then return a dict like the one in the last part, with `"loaded": con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]`.',
  solution: `${RUN}

con = sqlite3.connect(":memory:")
summary = run(TILL, con)
summary`,
  check: `_want = {"in": 10, "clean": 6, "rejected": 3, "duplicates": 1, "loaded": 6}
assert dict(globals().get("summary", {})) == _want, "summary should be in 10, clean 6, rejected 3, duplicates 1 and loaded 6."
assert dict(run(TILL, con)) == _want, "Running it again should give the same summary, because load is safe to rerun."`,
},
{
  id: 'et-17', mins: 4, needs: SQLITE, setup: PIPE,
  title: 'Keep a run log',
  concept: [
    'When a nightly run goes wrong at 3am, the **log** is how you find out what happened. Each stage writes a line: what it did, and to how many rows.',
    'Here the log is a list of dicts, one per stage: `log.append({"step": "extract", "rows": len(raw)})`. `pd.DataFrame(log)` turns it into a table to read.',
    'Real pipelines use Python\'s `logging` module or the scheduler\'s own logs, but the idea is the same: a line per step, with numbers in it.',
  ],
  starter: `def run(text, con, log):
    raw = extract(text)
    clean, rejects = transform(raw)
    load(clean, con)
    # add one dict per step: extract, transform, reject, load
    return log

log = []
run(TILL, sqlite3.connect(":memory:"), log)
log_table = pd.DataFrame(log)
log_table`,
  task: 'Make `run` add one dict per stage to `log`, with the steps `"extract"`, `"transform"`, `"reject"` and `"load"`, each with its `rows`: rows extracted, clean, rejected and in the table after loading. Then make `log_table`.',
  hint: 'After each stage: `log.append({"step": "extract", "rows": len(raw)})`, then `"transform"` with `len(clean)`, `"reject"` with `len(rejects)`, and `"load"` with the table\'s row count.',
  solution: `def run(text, con, log):
    raw = extract(text)
    log.append({"step": "extract", "rows": len(raw)})
    clean, rejects = transform(raw)
    log.append({"step": "transform", "rows": len(clean)})
    log.append({"step": "reject", "rows": len(rejects)})
    load(clean, con)
    loaded = con.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    log.append({"step": "load", "rows": loaded})
    return log

log = []
run(TILL, sqlite3.connect(":memory:"), log)
log_table = pd.DataFrame(log)
log_table`,
  check: `assert isinstance(globals().get("log_table"), pd.DataFrame) and "step" in log_table.columns, "Make log_table = pd.DataFrame(log), from dicts with a step and rows."
assert log_table["step"].tolist() == ["extract", "transform", "reject", "load"], "One row per step, in order: extract, transform, reject, load."
assert [int(v) for v in log_table["rows"]] == [10, 6, 3, 6], "The rows: 10 extracted, 6 clean, 3 rejected and 6 loaded."`,
},
{
  id: 'et-18', mins: 4, setup: TILL,
  title: 'Try again when the source hiccups',
  concept: [
    'Sources fail now and then: a timeout, a busy server. Most of those go away if you simply **retry**, so pipelines try a few times before giving up.',
    'A loop does it: `for attempt in range(1, tries + 1):`, `try` the call and `return` if it works; in `except`, carry on to the next attempt. On the last attempt, `raise` passes the error on.',
    'Real retries also wait a little longer each time (a **backoff**), so a struggling server gets room to recover. Here there\'s no waiting, so the lesson stays quick. `fetch_till` fails twice, then works.',
  ],
  starter: `${FLAKY}

def with_retries(fn, tries):
    return fn()    # one go, no second chance

text = with_retries(fetch_till, 5)`,
  task: 'Finish `with_retries(fn, tries)`: call `fn()` up to `tries` times, return the first result that works, and raise the error if the last attempt fails too. Get `text = with_retries(fetch_till, 5)`, then set `attempts` to `calls["n"]`.',
  hint: '`for attempt in range(1, tries + 1):` / `try:` / `return fn()` / `except ConnectionError as e:` / `print("attempt", attempt, "failed:", e)` / `if attempt == tries: raise`.',
  solution: `${FLAKY}

def with_retries(fn, tries):
    for attempt in range(1, tries + 1):
        try:
            return fn()
        except ConnectionError as e:
            print("attempt", attempt, "failed:", e)
            if attempt == tries:
                raise

text = with_retries(fetch_till, 5)
attempts = calls["n"]
print("got", len(text.splitlines()) - 1, "rows after", attempts, "attempts")`,
  check: `assert globals().get("text") == TILL, "text should be what fetch_till returns once it works."
assert int(globals().get("attempts", -1)) == 3, "It took 3 attempts: two failures, then success. attempts = calls['n']."
def _never():
    raise ConnectionError("down")
try:
    with_retries(_never, 2)
    _gave_up = False
except ConnectionError:
    _gave_up = True
assert _gave_up, "When every attempt fails, raise the error rather than returning None."`,
},
{
  id: 'et-19', mins: 4,
  title: 'Steps in the right order',
  concept: [
    'Bigger pipelines have many steps, and some have to wait for others: the sales report needs the orders and the shops loaded first. Those needs make a **DAG**, a map of what depends on what, with no loops.',
    'Schedulers like Airflow and Dagster work out a safe order from it, and Python can too. `TopologicalSorter(deps)` takes a dict of each step and the steps it needs, and `list(ts.static_order())` gives an order where every step comes after what it needs.',
    'Often more than one order is safe. What matters is that no step runs before anything it depends on.',
  ],
  starter: `from graphlib import TopologicalSorter

${DEPS}

order = list(deps)    # in the order they're written
order`,
  task: 'Make `order`: a safe order for `deps`, from `TopologicalSorter`. Then set `last` to its final step.',
  hint: '`order = list(TopologicalSorter(deps).static_order())`, then `last = order[-1]`.',
  solution: `from graphlib import TopologicalSorter

${DEPS}

order = list(TopologicalSorter(deps).static_order())
last = order[-1]

for i, step in enumerate(order, 1):
    print(i, step)`,
  check: `assert isinstance(globals().get("order"), list) and sorted(order) == sorted(deps), "order should list every step once."
for _step, _needs in deps.items():
    for _n in _needs:
        assert order.index(_n) < order.index(_step), _step + " needs " + _n + ", so " + _n + " has to come first. Use TopologicalSorter(deps).static_order()."
assert globals().get("last") == "sales_report", "last is the final step, order[-1]: the sales report, which needs everything else."`,
},
{
  id: 'et-20', mins: 5, setup: CLEAN,
  title: 'Checks that run every time',
  concept: [
    'A pipeline should check its own output. **Data quality checks** run on every load and look for what should never happen: an order with no id, the same id twice, cups of 0 or less.',
    'Each check is one test that\'s True when something is wrong, like `df["order_id"].duplicated().any()`. If it is, add the check\'s name to a list of failures.',
    'Return the names of the checks that failed, not just True or False: "duplicate ids" says where to look, and "failed" doesn\'t. `clean` is ready, and `broken` is a copy with two problems added.',
  ],
  starter: `${BROKEN}

def quality(df):
    failed = []
    # add a check's name to failed when it finds a problem
    return failed

clean_report = quality(clean)
broken_report = quality(broken)
print(clean_report, broken_report)`,
  task: 'Finish `quality(df)`: add `"missing ids"` if any order_id is empty, `"duplicate ids"` if any repeats and `"cups not positive"` if any cups is 0 or less, in that order. Run it on `clean` into `clean_report` and on `broken` into `broken_report`.',
  hint: '`if df["order_id"].isna().any() or (df["order_id"] == "").any(): failed.append("missing ids")`, then `df["order_id"].duplicated().any()` and `(df["cups"] <= 0).any()` the same way.',
  solution: `${BROKEN}

def quality(df):
    failed = []
    if df["order_id"].isna().any() or (df["order_id"] == "").any():
        failed.append("missing ids")
    if df["order_id"].duplicated().any():
        failed.append("duplicate ids")
    if (df["cups"] <= 0).any():
        failed.append("cups not positive")
    return failed

clean_report = quality(clean)
broken_report = quality(broken)
print("clean:", clean_report)
print("broken:", broken_report)`,
  check: `assert callable(globals().get("quality")), "Write quality(df)."
assert list(quality(clean)) == [], "The clean table passes every check, so quality(clean) is an empty list."
assert list(quality(broken)) == ["duplicate ids", "cups not positive"], "broken repeats an order id and has a row with 0 cups: ['duplicate ids', 'cups not positive'], in that order."
_gap = clean.copy()
_gap.loc[0, "order_id"] = ""
assert "missing ids" in quality(_gap), "An empty order_id should fail 'missing ids'."
assert list(globals().get("clean_report", [None])) == [] and list(globals().get("broken_report", [])) == ["duplicate ids", "cups not positive"], "Keep the results in clean_report and broken_report."`,
},
];
