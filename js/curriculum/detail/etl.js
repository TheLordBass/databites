/* ETL and pipelines (et-01 to et-20): the fuller teaching, a worked example
   and the task as a brief (see detail/index.js). Each example tries the move
   on something tiny of its own, never on the till export the task builds. */

const TILL = ["`TILL` is tonight's export from the café tills, as text: an order id, date, shop, drink, cups and price per row. It has a few problems in it, on purpose."];
const SO_FAR = ['The pipeline so far is ready, from the lessons before.'];
const STORY = 'Every night the café tills send an export, and it has to reach the reporting database clean.';

export const ETL_DETAIL = {
'et-01': {
  explain: [
    'A **pipeline** moves data from where it starts to where it gets used, the same way every time.',
    'Three stages: **extract** it, **transform** it (tidy and check), then **load** it into a database. ETL for short.',
    'This course follows one: each night the café tills send an export, `TILL`, as text, and it has to end up in the database the reports read.',
    '`io.StringIO(text)` wraps a string so that anything that reads files can read it.',
    'So `pd.read_csv(io.StringIO(TILL))` reads the text as if it were a CSV file.',
  ],
  example: {
    say: 'Here three lines of text are read as a table.',
    code: `import io
text = """drink,cups
latte,40
tea,25"""
pd.read_csv(io.StringIO(text))`,
    lines: [
      ['"""..."""', 'text over several lines: a header, then two rows.'],
      ['io.StringIO(text)', 'the text, treated as a file.'],
      ['pd.read_csv(...)', 'a table with columns drink and cups.'],
    ],
  },
  brief: {
    story: STORY,
    get: [TILL],
    want: ['Read `TILL` into `raw` with `pd.read_csv(io.StringIO(TILL))`', 'Set `rows`: how many rows arrived'],
    out: '`raw` is a table and `rows` a number.',
  },
},
'et-02': {
  explain: [
    "Left to itself, `read_csv` guesses each column's type.",
    'It reads ids like `0101` as numbers, so they become `101`: the zero that was part of the id is gone.',
    '`dtype=str` reads every column as text, exactly as sent.',
    '`keep_default_na=False` keeps an empty cell as empty text, instead of turning it into NaN.',
    'Extract should change nothing. Fix the types on purpose later, where every change can be seen and counted.',
  ],
  example: {
    say: 'Here the same two rows are read twice: with guessing, then exactly as sent.',
    code: `import io
text = """code,qty
007,3
012,"""
print(pd.read_csv(io.StringIO(text)))
pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)`,
    lines: [
      ['the first read', '007 became 7, and the empty qty became NaN.'],
      ['dtype=str, keep_default_na=False', '007 stays 007, and the empty qty stays empty.'],
    ],
  },
  brief: {
    story: 'The order ids lost their leading zeros on the way in. Read them exactly as sent.',
    get: [TILL],
    want: ['Read `TILL` into `raw` with `dtype=str` and `keep_default_na=False`', '`first_id`: the first order id'],
    out: '`first_id` is the text `"0101"`.',
  },
},
'et-03': {
  explain: [
    'Many sources are web **APIs**, which answer in **JSON**: text made of `{...}` objects and `[...]` lists.',
    "JSON looks just like Python's dicts and lists.",
    '`json.loads(text)` turns JSON text into Python dicts and lists.',
    '`pd.json_normalize(list_of_dicts)` makes a table of them.',
    'An object inside an object becomes columns with dotted names, like `shop.city`.',
  ],
  example: {
    say: 'Here a JSON list of two people becomes a table, with the nested city flattened.',
    code: `import json
text = '[{"name": "Ada", "home": {"city": "Lagos"}}, {"name": "Kofi", "home": {"city": "Accra"}}]'
pd.json_normalize(json.loads(text))`,
    lines: [
      ['json.loads(text)', 'a list of two dicts.'],
      ['pd.json_normalize(...)', 'a table with name and home.city.'],
    ],
  },
  brief: {
    story: 'The delivery app sends its orders through an API, as JSON. Bring them in too.',
    get: [['`API` is the delivery app\'s answer, as JSON text: a page number and a list of `orders`, each with a `shop` inside it.']],
    want: ['`data`: `API` turned into Python with `json.loads`', '`deliveries`: a table of `data["orders"]`, made with `pd.json_normalize`'],
    out: '`deliveries` has a `shop.city` column.',
  },
},
'et-04': {
  explain: [
    'A **data contract** is the promise about what a source sends: these columns, with this meaning.',
    'Check it first, and a changed export is caught before it does any damage.',
    'A **set** holds each value once, with no order. `set(list)` makes one.',
    "Subtract sets: `set(EXPECTED) - set(cols)` is what's **missing**, and `set(cols) - set(EXPECTED)` is what's **extra**.",
    'Compare the names stripped and in lower case, so `" Date "` still counts as `date`.',
  ],
  example: {
    say: 'Here the columns a file promised are compared with the ones it sent.',
    code: `want = {"date", "shop", "cups"}
got = {"date", "store", "cups", "note"}
print(sorted(want - got))
print(sorted(got - want))`,
    lines: [
      ['want - got', 'promised but missing: shop.'],
      ['got - want', 'sent but not promised: note and store.'],
      ['sorted(...)', 'a sorted list, so the answer is always in the same order.'],
    ],
  },
  brief: {
    story: 'Someone changed the till export without telling anyone. Catch it on arrival.',
    get: [SO_FAR, ['`raw` (from the tills), `changed` (an altered export) and `EXPECTED` (the promised column names) are ready.']],
    want: ['Finish `check_columns(df)`: it returns two sorted lists, the missing columns and the extra ones', '`ok`: it run on `raw`', '`broken`: it run on `changed`'],
    out: '`ok` has two empty lists; `broken` doesn\'t.',
  },
},
'et-05': {
  explain: [
    'When the contract is broken, the safest move is to **stop**: load nothing, and say why.',
    "A half-loaded table is worse than a missing one, because nobody can tell it's wrong.",
    '`raise ValueError("...")` stops a function with a message.',
    'Whoever called it can catch that with `try:` and `except ValueError as e:`, and read the message as `str(e)`.',
    'A pipeline that fails loudly, with a clear reason, gets fixed in minutes. One that quietly loads bad data can go unnoticed for weeks.',
  ],
  example: {
    say: 'Here a function refuses a bad value, and the caller catches the message.',
    code: `def check_age(age):
    if age < 0:
        raise ValueError(f"age can't be negative: {age}")
    return age

try:
    check_age(-3)
except ValueError as e:
    message = str(e)
message`,
    lines: [
      ['raise ValueError(...)', 'stops the function, with a reason.'],
      ['except ValueError as e', 'catches it, so the program carries on.'],
      ['str(e)', 'the reason, as text.'],
    ],
  },
  brief: {
    story: 'A broken export went straight through last night. Make the pipeline refuse it.',
    get: [SO_FAR, ['`TILL` and `CHANGED` (an export with a column missing) are ready, and so is `check_columns`.']],
    want: ['Make `extract` raise `ValueError("missing columns: price")` when columns are missing', '`raw`: extract run on `TILL`', '`problem`: the message when extract is run on `CHANGED` inside `try`/`except`'],
    out: '`problem` is the text `missing columns: price`.',
  },
},
'et-06': {
  explain: [
    'Exports come with names like `" Date "` and `"Order ID"`.',
    'Put them all in one style at the start of the transform, and every later step can rely on them.',
    'The usual style is **snake_case**: lower case, no spaces at either end, underscores between words.',
    '`c.strip().lower().replace(" ", "_")` does that to one name.',
    'Write it as a function that takes a table and returns a new one, starting with `df = df.copy()` so the table passed in is left alone.',
  ],
  example: {
    say: 'Here three awkward names are put into snake_case, one by one.',
    code: `[c.strip().lower().replace(" ", "_") for c in [" First Name ", "Total Spend", "ID"]]`,
    lines: [
      ['c.strip()', 'takes the spaces off the ends.'],
      ['.lower().replace(" ", "_")', 'lower case, with underscores between the words.'],
    ],
  },
  brief: {
    story: STORY,
    get: [SO_FAR, ['`raw`, read as text, is ready.']],
    want: ['Finish `clean_names(df)`: it returns a copy with every column name in snake_case', '`named = clean_names(raw)`'],
    out: '`named` has columns like `order_id` and `date`.',
  },
},
'et-07': {
  explain: [
    'Now turn text into real types.',
    "`pd.to_numeric(col, errors=\"coerce\")` makes numbers, and anything that isn't one becomes NaN, instead of stopping the whole run.",
    '`pd.to_datetime(col, format="%Y-%m-%d", errors="coerce")` reads dates in exactly that layout.',
    "A date sent as `05/03/2024` doesn't match the layout, so it becomes NaT, the missing date.",
    'Coercing hides problems unless you count them: always check `col.isna().sum()`.',
  ],
  example: {
    say: 'Here three dates are read in one exact layout, and the failures are counted.',
    code: `d = pd.to_datetime(pd.Series(["2024-05-01", "01/05/2024", "2024-05-03"]),
                   format="%Y-%m-%d", errors="coerce")
print(d)
print(d.isna().sum(), "didn't convert")`,
    lines: [
      ['format="%Y-%m-%d"', 'year, month, day, with dashes. Nothing else is accepted.'],
      ['"01/05/2024"', "doesn't fit, so it becomes NaT, and the count says 1."],
    ],
  },
  brief: {
    story: STORY,
    get: [SO_FAR, ['`named`, with tidy column names, is ready.']],
    want: ['Finish `fix_types`: cups and price as numbers, date as a date, all with `errors="coerce"`', '`typed = fix_types(named)`', '`bad_cups` and `bad_dates`: how many of each came out missing'],
    out: 'Two counts.',
  },
},
'et-08': {
  explain: [
    "A row that fails its checks shouldn't reach the database, and it shouldn't vanish either.",
    'Put it in **quarantine**: a table of rejects, each with its reason, for someone to fix at the source.',
    'Build the reasons as a column: start with `""` for every row, then fill in a reason wherever a check fails, with `reason.loc[mask] = "..."`.',
    'A row with any reason is a reject.',
    '`df[~bad]` keeps the good rows and `df[bad]` the rest, so every row lands in exactly one of the two.',
  ],
  example: {
    say: 'Here three rows are checked, and each failure gets its reason.',
    code: `t = pd.DataFrame({"name": ["Ada", "", "Kofi"], "age": [30, 25, -1]})
reason = pd.Series("", index=t.index)
reason.loc[t["name"] == ""] = "no name"
reason.loc[t["age"] < 0] = "age below 0"
t.assign(reason=reason)`,
    lines: [
      ['pd.Series("", index=t.index)', 'an empty reason for every row.'],
      ['reason.loc[...] = "..."', 'filled in only where a check fails.'],
      ['.assign(reason=reason)', 'the reasons shown as a column. Ada\'s is still empty: she is fine.'],
    ],
  },
  brief: {
    story: 'Bad rows have been reaching the reports. Set them aside, with a reason, instead.',
    get: [SO_FAR, ['`typed`, with real types, is ready.']],
    want: ['Finish `split_bad(df)`: no date gets `"date unreadable"`, no cups gets `"cups missing or not a number"`', '`good, rejects = split_bad(typed)`'],
    out: 'Two tables that hold every row between them.',
  },
},
'et-09': {
  explain: [
    'Sources resend rows. A till that lost its connection sends the same order again, sometimes corrected.',
    'Decide which column makes a row unique: its **key**. Here, the order id.',
    '`df.drop_duplicates(subset="order_id", keep="last")` keeps one row per order id: the last one sent, the newest version.',
    'Dropping only rows that match in every column would keep both versions of a corrected order.',
    'Say the key in the code, so the next person knows what "duplicate" means here.',
  ],
  example: {
    say: 'Here an id that arrives twice keeps only its last version.',
    code: `t = pd.DataFrame({"id": ["a", "b", "a"], "qty": [1, 2, 5]})
t.drop_duplicates(subset="id", keep="last")`,
    lines: [
      ['subset="id"', 'rows count as copies when their id matches.'],
      ['keep="last"', 'a keeps its second row, with qty 5.'],
    ],
  },
  brief: {
    story: 'Order 0104 arrived twice, the second time corrected. Keep only the newest version.',
    get: [SO_FAR, ['`good`, the rows that passed, is ready.']],
    want: ['`deduped`: `good` with one row per order id, keeping the last one sent', '`dropped`: how many rows that removed', '`cups_0104`: the cups that order now has'],
    out: 'Three answers.',
  },
},
'et-10': {
  explain: [
    'Put the steps in one function, `transform(raw)`, that returns the clean table and the rejects.',
    "Same input in, same output out, every time: that's what makes a pipeline safe to rerun.",
    'The last touches go here too: `.astype(int)` makes whole numbers.',
    '`.dt.strftime("%Y-%m-%d")` turns dates back into text like `2024-05-01`, the way SQLite stores them.',
    'Count as you go: rows in, clean, rejected and duplicates dropped. Those four numbers say whether a run went well.',
  ],
  example: {
    say: 'Here a decimal count becomes a whole number, and a date becomes text.',
    code: `t = pd.DataFrame({"day": pd.to_datetime(["2024-05-01"]), "cups": [40.0]})
t["cups"] = t["cups"].astype(int)
t["day"] = t["day"].dt.strftime("%Y-%m-%d")
print(t.dtypes)
t`,
    lines: [
      ['.astype(int)', '40.0 becomes 40.'],
      ['.dt.strftime("%Y-%m-%d")', 'the date written out as text.'],
    ],
  },
  brief: {
    story: 'The transform steps work. Now make them one function that can run every night.',
    get: [SO_FAR, ['`clean_names`, `fix_types` and `split_bad` are ready.']],
    want: ['Finish `transform`: drop the duplicates, make cups whole numbers, turn the dates into text', '`clean, rejects = transform(raw)`', '`counts`: a dict with `"in"`, `"clean"`, `"rejected"` and `"duplicates"`'],
    out: 'Two tables and a dict of four counts.',
  },
},
'et-11': {
  explain: [
    'The load step puts the clean table where reports can use it. Here that is SQLite.',
    '`con = sqlite3.connect(":memory:")` makes a database that lives in memory.',
    '`df.to_sql("orders", con, index=False)` writes a DataFrame as a table. `index=False` leaves out the row numbers.',
    'Then ask it a question in SQL to prove the data landed.',
    '`pd.read_sql("SELECT ...", con)` runs a query and gives back a DataFrame.',
  ],
  example: {
    say: 'Here a tiny table is loaded, then added up in SQL.',
    code: `import sqlite3
db = sqlite3.connect(":memory:")
pd.DataFrame({"drink": ["latte", "tea", "latte"], "cups": [3, 1, 2]}).to_sql("sales", db, index=False)
pd.read_sql("SELECT drink, SUM(cups) AS cups FROM sales GROUP BY drink", db)`,
    lines: [
      ['.to_sql("sales", db, index=False)', 'the table is now in the database, called sales.'],
      ['pd.read_sql(...)', 'a query back out: latte 5, tea 1.'],
    ],
  },
  brief: {
    story: 'The clean data is ready. Load it where the reports can read it.',
    get: [SO_FAR, ['`clean`, from your transform, is ready.']],
    want: ['Load `clean` into a table called `orders`', '`by_shop` with SQL: each shop and its total cups, as `shop` and `cups`, ordered by shop'],
    out: 'One row per shop.',
  },
},
'et-12': {
  explain: [
    "Pipelines get rerun: after a failure, after a fix, by someone who wasn't sure it worked.",
    'A load that just **appends** doubles the data on a second run.',
    'A load that gives the same result however many times it runs is **idempotent**. One way: delete what this batch covers, then insert it.',
    '`with con:` makes everything in the block one **transaction**: either all of it happens, or none of it does.',
    "So a run can't stop halfway with the old rows deleted and the new ones missing.",
  ],
  example: {
    say: 'Here a delete fails halfway inside a transaction, and the table is left as it was.',
    code: `import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE t (x INTEGER)")
db.execute("INSERT INTO t VALUES (1)")
db.commit()
try:
    with db:
        db.execute("DELETE FROM t")
        raise RuntimeError("something broke halfway")
except RuntimeError:
    pass
db.execute("SELECT COUNT(*) FROM t").fetchone()[0]`,
    lines: [
      ['with db:', 'the delete and anything after it are one transaction.'],
      ['raise RuntimeError(...)', 'something fails before the end.'],
      ['the count', 'still 1: the delete was undone.'],
    ],
  },
  brief: {
    story: 'Someone reran last night\'s load, and every order is now in the database twice.',
    get: [SO_FAR, ['`clean` is ready, and the starter makes an empty `orders` table.']],
    want: ['Change `load` so running it twice still leaves 6 rows', 'Inside `with con:`, delete the batch\'s order ids from `orders`, then append `df`'],
    out: '`after_two_runs` is 6.',
  },
},
'et-13': {
  explain: [
    'When a source sends a corrected row, you want to **update** the one you have, and **insert** the ones you don\'t. Both in one statement is an **upsert**.',
    'Give the table a `PRIMARY KEY`: the column no two rows may share.',
    '`INSERT ... ON CONFLICT(key) DO UPDATE SET col = excluded.col` updates the row that is there instead of failing. `excluded` is the row you tried to insert.',
    '`con.executemany(sql, rows)` runs the statement once per row.',
    '`df.to_dict("records")` gives the rows as dicts, and `:name` in the SQL picks each value out by its column name.',
  ],
  example: {
    say: 'Here a stock count is upserted: beans is updated, milk stays.',
    code: `import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE stock (item TEXT PRIMARY KEY, qty INTEGER)")
sql = "INSERT INTO stock VALUES (:item, :qty) ON CONFLICT(item) DO UPDATE SET qty = excluded.qty"
db.executemany(sql, [{"item": "beans", "qty": 5}, {"item": "milk", "qty": 2}])
db.executemany(sql, [{"item": "beans", "qty": 9}])
pd.read_sql("SELECT * FROM stock", db)`,
    lines: [
      ['item TEXT PRIMARY KEY', 'each item can be in the table only once.'],
      ['ON CONFLICT(item) DO UPDATE', 'beans is already there, so its qty becomes 9.'],
    ],
  },
  brief: {
    story: 'The tills sent a correction for one order, and one new order.',
    get: [SO_FAR, ['`clean` is ready, and `fixes` has a correction for 0109 and a new order, 0110.']],
    want: ['Add `ON CONFLICT(order_id) DO UPDATE SET ...` to `UPSERT`, updating every column from `excluded`', '`total_rows` and `cups_0109` afterwards'],
    out: '0109 is corrected and 0110 added.',
  },
},
'et-14': {
  explain: [
    'Reloading everything every night gets slower as the data grows.',
    "An **incremental** load takes only what's new since last time.",
    'The **watermark** is how far the last load got: here, the latest date already in the table, `SELECT MAX(date) FROM orders`.',
    'Tonight, load only the rows dated after it.',
    'Dates stored as text like `2024-05-04` compare correctly as text, because the year comes first, then the month, then the day.',
  ],
  example: {
    say: 'Here text dates are compared, and only the later rows are kept.',
    code: `print("2024-05-04" > "2024-04-30")
t = pd.DataFrame({"day": ["2024-05-03", "2024-05-05"]})
t[t["day"] > "2024-05-04"]`,
    lines: [
      ['"2024-05-04" > "2024-04-30"', 'True: as text, year then month then day sorts correctly.'],
      ['t[t["day"] > "2024-05-04"]', 'only the row after the watermark.'],
    ],
  },
  brief: {
    story: 'The nightly reload is getting slow. Load only what is new.',
    get: [SO_FAR, ['`clean` is loaded, and `tonight` is the next export: one order already loaded, two new ones.']],
    want: ['`watermark`: the latest date already loaded', 'Load only the rows of `tonight` dated after it', '`new_rows` and `total_rows`'],
    out: 'Two new rows loaded.',
  },
},
'et-15': {
  explain: [
    'After a run, **reconcile**: every row that came in should be accounted for.',
    'Rows in = rows loaded + rows rejected + duplicates dropped. If that doesn\'t hold, something went missing.',
    'Check the totals too, not just the counts: the cups in the database should equal the cups in the clean table.',
    'Make the final check an `assert`.',
    'A run that fails it stops with a message, instead of handing out numbers nobody should trust.',
  ],
  example: {
    say: 'Here four counts from a run are checked to balance.',
    code: `rows_in, loaded, rejected, dupes = 10, 6, 3, 1
balanced = rows_in == loaded + rejected + dupes
assert balanced, "the books don't balance"
balanced`,
    lines: [
      ['loaded + rejected + dupes', '6 + 3 + 1 = 10, the same as came in.'],
      ['assert balanced, ...', 'would stop with the message if it were False.'],
    ],
  },
  brief: {
    story: 'Before the reports go out, prove that no row went missing.',
    get: [SO_FAR, ['The load has run, and `counts` is ready.']],
    want: ['`loaded`: the rows in `orders`', '`balanced`: True when rows in equals loaded + rejected + duplicates, and the cups totals match', '`assert balanced, "the books don\'t balance"`'],
    out: '`balanced` is True.',
  },
},
'et-16': {
  explain: [
    'Now join the stages: `run(text, con)` calls extract, transform and load in order.',
    'It returns a **summary**: the counts for that run.',
    'Each stage only talks to the next through what it returns.',
    'That keeps them apart: you can test transform without a database, or change the source without touching the load.',
    'Return the summary rather than printing it, so whatever schedules the pipeline can store it, compare runs or raise an alarm.',
  ],
  example: {
    say: 'Here two small steps are chained into one run, which returns a summary.',
    code: `def double(xs):
    return [x * 2 for x in xs]

def total(xs):
    return sum(xs)

def run(xs):
    doubled = double(xs)
    return {"in": len(xs), "total": total(doubled)}

run([1, 2, 3])`,
    lines: [
      ['doubled = double(xs)', 'one step\'s answer is handed to the next.'],
      ['return {...}', 'the summary of the run, as a dict.'],
    ],
  },
  brief: {
    story: 'The stages work one by one. Now the scheduler needs one call that does the lot.',
    get: [SO_FAR, ['Your `extract`, `transform` and safe `load` are ready.']],
    want: ['Finish `run(text, con)`: extract, transform and load', 'Return `"in"`, `"clean"`, `"rejected"`, `"duplicates"`, and `"loaded"` (the rows in `orders` afterwards)', '`summary = run(TILL, con)`'],
    out: '`summary` is a dict of five counts.',
  },
},
'et-17': {
  explain: [
    'When a nightly run goes wrong at 3am, the **log** is how you find out what happened.',
    'Each stage writes a line: what it did, and to how many rows.',
    'Here the log is a list of dicts, one per stage: `log.append({"step": "extract", "rows": len(raw)})`.',
    '`pd.DataFrame(log)` turns it into a table to read.',
    "Real pipelines use Python's `logging` module or the scheduler's own logs, but the idea is the same.",
  ],
  example: {
    say: 'Here two steps write their lines, and the log is shown as a table.',
    code: `log = []
log.append({"step": "read", "rows": 10})
log.append({"step": "clean", "rows": 8})
pd.DataFrame(log)`,
    lines: [
      ['log.append({...})', 'one dict per step.'],
      ['pd.DataFrame(log)', 'a table with a step column and a rows column.'],
    ],
  },
  brief: {
    story: 'Last week a run lost rows and nobody could tell where. Make it keep a log.',
    get: [SO_FAR],
    want: ['Make `run` add one dict per stage to `log`: `"extract"`, `"transform"`, `"reject"` and `"load"`, each with its `rows`', '`log_table`: the log as a table'],
    out: '`log_table` has four rows.',
  },
},
'et-18': {
  explain: [
    'Sources fail now and then: a timeout, a busy server.',
    'Most of those go away if you simply **retry**, so pipelines try a few times before giving up.',
    'A loop does it: try the call, and stop if it works; if it fails, carry on to the next attempt.',
    'On the last attempt, `raise` on its own passes the error on, so a real outage isn\'t hidden.',
    'Real retries also wait a little longer each time (a **backoff**), so a struggling server gets room to recover.',
  ],
  example: {
    say: 'Here a call fails once, then works on the second try.',
    code: `made = []
def flaky():
    made.append(1)
    if len(made) < 2:
        raise TimeoutError("no answer")
    return "ok"

for attempt in range(1, 4):
    try:
        result = flaky()
        break
    except TimeoutError:
        print("attempt", attempt, "failed")
print(result, "after", len(made), "tries")`,
    lines: [
      ['try: ... break', 'if the call works, stop trying.'],
      ['except TimeoutError', 'if it fails, say so and go round again.'],
    ],
  },
  brief: {
    story: 'The till server is flaky, and one failed call shouldn\'t wreck the whole night.',
    get: [SO_FAR, ['`fetch_till` fails twice, then works.']],
    want: ['Finish `with_retries(fn, tries)`: call `fn()` up to `tries` times, return the first result that works, raise the error if the last attempt fails', '`text = with_retries(fetch_till, 5)`', '`attempts`: `calls["n"]`'],
    out: '`attempts` is 3.',
  },
},
'et-19': {
  explain: [
    'Bigger pipelines have many steps, and some have to wait for others.',
    'Those needs make a **DAG**: a map of what depends on what, with no loops.',
    'Schedulers like Airflow and Dagster work out a safe order from it, and Python can too.',
    '`TopologicalSorter(deps)` takes a dict of each step and the steps it needs; `list(ts.static_order())` gives an order where every step comes after what it needs.',
    'Often more than one order is safe. What matters is that no step runs before anything it depends on.',
  ],
  example: {
    say: 'Here breakfast is put in a safe order.',
    code: `from graphlib import TopologicalSorter
deps = {"eat": ["cook", "set table"], "cook": ["buy food"], "set table": [], "buy food": []}
list(TopologicalSorter(deps).static_order())`,
    lines: [
      ['deps', 'each step, and what it needs first.'],
      ['static_order()', 'buy food comes before cook, and eat comes last.'],
    ],
  },
  brief: {
    story: 'The pipeline now has six steps, and the report keeps running before its data is loaded.',
    get: [['The starter makes `deps`: each step and the steps it needs.']],
    want: ['`order`: a safe order for `deps`, from `TopologicalSorter`', '`last`: its final step'],
    out: '`last` is the sales report.',
  },
},
'et-20': {
  explain: [
    'A pipeline should check its own output, every time it loads.',
    '**Data quality checks** look for what should never happen: an order with no id, the same id twice, cups of 0 or less.',
    'Each check is one test that is True when something is wrong, like `df["order_id"].duplicated().any()`.',
    "If it is, add the check's name to a list of failures.",
    'Return the names, not just True or False: "duplicate ids" says where to look, and "failed" doesn\'t.',
  ],
  example: {
    say: 'Here a tiny table is checked, and each problem is named.',
    code: `t = pd.DataFrame({"id": ["a", "b", "b"], "price": [2.5, -1, 3.0]})
failed = []
if t["id"].duplicated().any():
    failed.append("duplicate ids")
if (t["price"] < 0).any():
    failed.append("negative prices")
failed`,
    lines: [
      ['t["id"].duplicated().any()', 'True: b is there twice.'],
      ['(t["price"] < 0).any()', 'True: one price is below zero.'],
      ['failed', 'both names, so you know where to look.'],
    ],
  },
  brief: {
    story: 'The pipeline runs every night unattended. Make it check its own output.',
    get: [SO_FAR, ['`clean` is ready, and `broken` is a copy with two problems added.']],
    want: ['Finish `quality(df)`: `"missing ids"` if any order_id is empty, `"duplicate ids"` if any repeats, `"cups not positive"` if any cups is 0 or less, in that order', '`clean_report` and `broken_report`'],
    out: '`clean_report` is empty; `broken_report` names two problems.',
  },
},
};
