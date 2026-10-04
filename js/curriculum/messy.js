import { expect } from './checks.js';

/* Every mess in `survey` is one that turns up in real exports.
   This is the track where you stop being handed clean data.

   Parts 3 and 4 (ms-11 to ms-20) follow the data quality half of
   "Practical Python: Data Wrangling and Data Quality" as a syllabus:
   integrity (rules, totals, outliers, spellings, a health report), then
   files that fight back (fixed width, spreadsheet dates, junk lines,
   nested JSON) and fit (does it cover what you need?). Each of those
   lessons brings its own small table, so the mess is plain to see. Every
   lesson, example and exercise here is original. */

export const MESSY = [
{
  id: 'ms-01', mins: 4,
  title: "A table you didn't make",
  concept: [
    'A new table called `survey` is loaded: answers to a customer survey, exported by someone else and never tidied.',
    'Look at three things first: `.columns` (the names), `.dtypes` (what kind of data each column holds) and `.head()`.',
    'Almost every column shows as `object`, which is pandas\' word for **text**. Numbers stored as text can\'t be added up.',
  ],
  starter: `print(survey.shape)
print(survey.dtypes)

survey.head()`,
  task: 'Put the column names in `cols` exactly as they are — spaces and all.',
  hint: '`cols = list(survey.columns)`. `list(...)` turns the names into a plain list. Look closely at the spaces in what it shows.',
  solution: `cols = list(survey.columns)

for c in cols:
    print(repr(c))

survey.head(3)`,
  check: `assert "cols" in globals(), "Make a variable called cols."
assert list(cols) == list(survey.columns), "cols should be the column names, untouched."
assert " Name " in cols, "Leave them exactly as they are — one of them really does have spaces around it."`,
},
{
  id: 'ms-02', mins: 4,
  title: 'Column names that fight you',
  concept: [
    'Names like `" Name "` and `"Signed Up"` are a pain to type exactly. Tidy them once, up front.',
    'The column names work like a text column, so `.str` works on them. Do the fixes one after another: `.str.strip().str.lower().str.replace(" ", "_")`.',
    'Then `clean["signed_up"]` is easy to type, spaces and capitals gone.',
  ],
  starter: `print(survey.columns.str.strip())

survey.columns.str.strip().str.lower()`,
  task: 'Make `clean`: a copy of `survey` whose column names have the spaces trimmed off the ends, are all lower case, and have `_` in place of the spaces left inside.',
  hint: '`clean = survey.copy()`, then store the tidied names into its columns: `clean.columns = survey.columns.str.strip().str.lower().str.replace(" ", "_")`',
  solution: `clean = survey.copy()
clean.columns = (
    survey.columns.str.strip()
                  .str.lower()
                  .str.replace(" ", "_")
)

print(list(clean.columns))
clean.head(3)`,
  check: `assert "clean" in globals(), "Make a variable called clean."
assert len(clean) == len(survey), "Only the names change — keep every row."
assert "name" in clean.columns, "The padded ' Name ' should end up as 'name'."
assert "signed_up" in clean.columns, "'Signed Up' should end up as 'signed_up'."
assert not any(" " in c for c in clean.columns), "No spaces should be left in any column name."`,
},
{
  id: 'ms-03', mins: 4,
  title: 'Text that only looks the same',
  concept: [
    'To pandas, `" Lagos"`, `"lagos"` and `"LAGOS"` are three different values: a stray space or capital is enough.',
    '`.value_counts()` is how you spot it: the same place turns up several times.',
    '`.str.strip()` trims the spaces and `.str.title()` fixes the capitals, which folds them back into one.',
  ],
  starter: `print(survey["City "].value_counts())`,
  task: 'Make `cities_fixed`: the city column tidied so only 3 different places are left. The column is called `"City "`, with a space on the end.',
  hint: '`survey["City "].str.strip().str.title()`',
  solution: `cities_fixed = survey["City "].str.strip().str.title()

print(cities_fixed.value_counts())
print(cities_fixed.nunique(), "distinct cities")`,
  check: `assert "cities_fixed" in globals(), "Make a variable called cities_fixed."
assert cities_fixed.nunique() == 3, "Expected 3 distinct cities, got %d — check both the spaces and the capitals." % cities_fixed.nunique()
assert set(cities_fixed.unique()) == {"Lagos", "Accra", "Nairobi"}, "The three should come out as Lagos, Accra and Nairobi."`,
},
{
  id: 'ms-04', mins: 4,
  title: 'Numbers stored as text',
  concept: [
    '`"£18.00"` and `"n/a"` are text, not numbers, so they can\'t be added up.',
    'Take out the £ first. Then `pd.to_numeric(...)` turns the text into numbers.',
    'With `errors="coerce"`, anything it can\'t read as a number, like "n/a", becomes `NaN` (missing) instead of stopping with an error.',
  ],
  starter: `print(survey["Spend (GBP)"].unique())

pd.to_numeric(survey["Spend (GBP)"], errors="coerce").head()`,
  task: 'Make `spend`: that column as real numbers, with the `£` taken out and `n/a` becoming missing (NaN).',
  hint: 'Strip the symbol first: `.str.replace("£", "", regex=False)`, then `pd.to_numeric(..., errors="coerce")`.',
  solution: `spend = pd.to_numeric(
    survey["Spend (GBP)"].str.replace("£", "", regex=False),
    errors="coerce",
)

print(spend.describe())
print("unparseable:", int(spend.isna().sum()))`,
  check: `assert "spend" in globals(), "Make a variable called spend."
assert str(spend.dtype).startswith("float"), "spend should be numbers, not text: use pd.to_numeric."
assert int(spend.isna().sum()) == 6, "The six 'n/a' rows should be NaN — got %d." % int(spend.isna().sum())
assert abs(float(spend.max()) - 23.10) < 0.001, "The £18.00 rows should come out as 18.0, so the biggest should be 23.10."`,
},
{
  id: 'ms-05', mins: 5,
  title: 'Dates in three formats',
  concept: [
    '`survey` mixes three kinds of date: `2024-01-05`, `05/02/2024` and the word `unknown`.',
    '`pd.to_datetime(...)` turns text into real dates. With `errors="coerce"`, anything it can\'t read becomes `NaT` ("not a time"), the date version of missing.',
    '`format="mixed"` lets it cope with more than one style, and `dayfirst=True` says 05/02 is day first: 5 February.',
  ],
  starter: `print(survey["Signed Up"].unique())`,
  task: 'Make `signed`: the `Signed Up` column as real dates, with anything unreadable left missing (NaT).',
  hint: '`pd.to_datetime(survey["Signed Up"], format="mixed", dayfirst=True, errors="coerce")`',
  solution: `signed = pd.to_datetime(
    survey["Signed Up"],
    format="mixed",
    dayfirst=True,
    errors="coerce",
)

print(signed.head(6))
print("failed to parse:", int(signed.isna().sum()))`,
  check: `assert "signed" in globals(), "Make a variable called signed."
assert "datetime" in str(signed.dtype), "signed should be real dates, not text: use pd.to_datetime."
assert int(signed.isna().sum()) == 6, "The six 'unknown' rows should come out as NaT — got %d." % int(signed.isna().sum())
_feb = signed.dropna()
assert (_feb.dt.year == 2024).all(), "Every date it could read should be in 2024. Is dayfirst=True there?"`,
},
{
  id: 'ms-06', mins: 4,
  title: 'Yes, y, YES, N, no',
  concept: [
    'Five spellings, two meanings. Make them all look alike first, then compare.',
    '`.str.strip().str.lower().str[0]` keeps just the first letter of each, in lower case: `y` or `n`. `[0]` is the first character, the way it is the first item of a list.',
    'Comparing that with `"y"` gives a real True/False column.',
  ],
  starter: `print(survey["Subscribed?"].value_counts())`,
  task: 'Make `subscribed`: a True/False column from that mess, True for every kind of yes.',
  hint: '`survey["Subscribed?"].str.strip().str.lower().str[0] == "y"`',
  solution: `subscribed = (
    survey["Subscribed?"].str.strip().str.lower().str[0] == "y"
)

print(subscribed.value_counts())
subscribed.head()`,
  check: `assert "subscribed" in globals(), "Make a variable called subscribed."
assert subscribed.dtype == bool, 'subscribed should be a column of True and False: compare the first letter with == "y".'
_want = survey["Subscribed?"].str.strip().str.lower().str[0] == "y"
assert (subscribed == _want).all(), "Yes, y and YES should all be True; N and no should be False."`,
},
{
  id: 'ms-07', mins: 4,
  title: "Duplicates that aren't obvious",
  concept: [
    '`.duplicated().sum()` counts the rows that are exact copies of an earlier row.',
    'With `subset=["name", "city"]`, rows count as copies when just those columns match.',
    '`.drop_duplicates()` removes the copies. `keep="last"` keeps the newest copy instead of the first.',
  ],
  starter: `print("exact duplicate rows:", survey.duplicated().sum())

survey[survey.duplicated(keep=False)]`,
  task: 'Make `deduped`: `survey` with the exact copies removed.',
  hint: '`deduped = survey.drop_duplicates()`',
  solution: `print("before:", len(survey))
deduped = survey.drop_duplicates()
print("after: ", len(deduped))

deduped.head()`,
  check: `assert "deduped" in globals(), "Make a variable called deduped."
assert len(deduped) == 30, "survey has 32 rows with 2 exact duplicates, so 30 should remain — got %d." % len(deduped)
assert not deduped.duplicated().any(), "There are still duplicate rows in deduped."`,
},
{
  id: 'ms-08', mins: 5,
  title: 'Pulling values out of text',
  concept: [
    'The `Note` column hides a reference number inside a sentence, after `ref#`.',
    '`.str.extract(r"ref#(\\d+)")` pulls out the part inside the round brackets. The text in quotes is a **pattern**, also called a regular expression.',
    'In a pattern, `\\d` means "a digit" and `+` means "one or more", so `\\d+` is a whole number. The `r` before the quotes keeps the `\\` as it is.',
  ],
  starter: `print(survey["Note"].head(3).tolist())

survey["Note"].str.extract(r"ref#(\\d+)").head()`,
  task: 'Make `refs`: those reference numbers as **whole numbers**, not text.',
  hint: '`.str.extract(...)` gives back a table. Take its first column with `[0]`, then turn the text into whole numbers with `.astype(int)`.',
  solution: `refs = survey["Note"].str.extract(r"ref#(\\d+)")[0].astype(int)

print(refs.head())
print("range:", refs.min(), "to", refs.max())`,
  check: `assert "refs" in globals(), "Make a variable called refs."
assert "int" in str(refs.dtype), "refs should be whole numbers, not text: add .astype(int)."
assert int(refs.iloc[0]) == 1000, "The first row's reference is 1000."
assert int(refs.max()) == 1029, "The highest reference in the file is 1029."`,
},
{
  id: 'ms-09', mins: 4,
  title: 'Missing values in disguise',
  concept: [
    'Exported files often spell "missing" as text: `"n/a"`, `"unknown"`, `"-"`. pandas takes those as real values.',
    "`.isna()` can't see them, so a count of the gaps comes out too low — here it says zero.",
    '`.replace(["n/a", "unknown"], np.nan)` turns them into real missing values. `np.nan` is how you write "missing" in code.',
  ],
  starter: `survey.isna().sum()`,
  task: 'Make `honest` = `survey` with every `"n/a"` and `"unknown"` turned into a real missing value. Then look at `honest.isna().sum()`.',
  hint: '`honest = survey.replace(["n/a", "unknown"], np.nan)`',
  solution: `honest = survey.replace(["n/a", "unknown"], np.nan)

honest.isna().sum()`,
  check: `assert "honest" in globals(), "Make a variable called honest."
_want = int(survey.isin(["n/a", "unknown"]).sum().sum())
assert len(honest) == len(survey), "Keep every row — only swap the fake values."
assert int(honest.isna().sum().sum()) == _want, "There are %d disguised gaps: n/a in the spend column and unknown in the sign-up dates." % _want`,
},
{
  id: 'ms-10', mins: 5,
  title: 'Clean it, start to finish',
  concept: [
    'Everything from this track, in one go: tidy names, tidy text, numbers from text, yes/no as True/False, no duplicates.',
    'Build the clean table column by column from the messy one: `pd.DataFrame({...})`, with one `"name": values` line per column.',
    'Keep the original untouched, so you can always check a cleaned value against where it came from.',
  ],
  starter: `survey.head()`,
  task: 'Make `tidy` with four columns: `name` and `city` (spaces stripped, Title Case), `spend` (a number — the £ gone, n/a missing) and `subscribed` (True or False). Drop the exact duplicate rows.',
  hint: 'One line per column: `.str.strip().str.title()` for the text, `pd.to_numeric(... .str.replace("£", ""), errors="coerce")` for spend, and `.str.strip().str.lower().str.startswith("y")` for subscribed. Finish with `.drop_duplicates()`.',
  solution: `tidy = pd.DataFrame({
    "name": survey[" Name "].str.strip().str.title(),
    "city": survey["City "].str.strip().str.title(),
    "spend": pd.to_numeric(survey["Spend (GBP)"].str.replace("£", "", regex=False), errors="coerce"),
    "subscribed": survey["Subscribed?"].str.strip().str.lower().str.startswith("y"),
}).drop_duplicates()

tidy.head()`,
  check: `assert "tidy" in globals(), "Make a variable called tidy."
assert set(tidy.columns) == {"name", "city", "spend", "subscribed"}, "tidy needs exactly name, city, spend and subscribed."
assert len(tidy) == 30, "32 rows minus the 2 exact duplicates is 30 — you have %d." % len(tidy)
assert set(tidy["city"]) == {"Lagos", "Accra", "Nairobi"}, "Cities should be tidy: Lagos, Accra, Nairobi — strip and Title Case them."
assert tidy["name"].str[0].str.isupper().all(), "Every name should start with a capital — .str.title()."
assert str(tidy["spend"].dtype).startswith("float"), "spend should be a number: take out the £, then pd.to_numeric(..., errors='coerce')."
assert int(tidy["spend"].isna().sum()) == 6, "The six n/a spends should be missing, not zero."
assert tidy["subscribed"].dtype == bool, "subscribed should be True or False."
assert int(tidy["subscribed"].sum()) == 18, "Yes, y and YES all mean subscribed — that's 18 rows."`,
},

/* ── Can you trust it? ─────────────────────────────────── */
{
  id: 'ms-11', mins: 5,
  title: 'Rules every row should follow',
  concept: [
    '**Data integrity** asks whether the data holds together. Before analysing anything, write down rules every row should obey, then find the rows that break them.',
    'Each rule is a True/False column: `deliveries["qty"] < 1` marks the rows with no quantity. `|` means "or", so `rule1 | rule2` marks rows that break either; `~` flips True and False.',
    'Don\'t delete the rule-breakers straight away. Look at them first: a pattern in the bad rows often points to a fault further back, in the system that made them.',
  ],
  starter: `deliveries = pd.DataFrame({
    "order_id":  [101, 102, 103, 104, 105, 106, 107, 108],
    "qty":       [2, 0, 1, 3, -1, 2, 1, 4],
    "rating":    [5, 4, 9, 3, 5, None, 2, 5],
    "ordered":   pd.to_datetime(["2024-03-01", "2024-03-01", "2024-03-02", "2024-03-02",
                                 "2024-03-03", "2024-03-03", "2024-03-04", "2024-03-04"]),
    "delivered": pd.to_datetime(["2024-03-02", "2024-03-03", "2024-03-02", "2024-03-01",
                                 "2024-03-05", "2024-03-04", "2024-03-06", "2024-03-05"]),
})
deliveries`,
  task: 'Make three rules: `bad_qty` (qty below 1), `bad_rating` (a rating that is there, but outside 1 to 5) and `bad_dates` (delivered before it was ordered). Then `broken`: the rows of `deliveries` that break any of them.',
  hint: '`bad_qty = deliveries["qty"] < 1`, `bad_rating = deliveries["rating"].notna() & ~deliveries["rating"].between(1, 5)`, `bad_dates = deliveries["delivered"] < deliveries["ordered"]`. Then `broken = deliveries[bad_qty | bad_rating | bad_dates]`.',
  solution: `deliveries = pd.DataFrame({
    "order_id":  [101, 102, 103, 104, 105, 106, 107, 108],
    "qty":       [2, 0, 1, 3, -1, 2, 1, 4],
    "rating":    [5, 4, 9, 3, 5, None, 2, 5],
    "ordered":   pd.to_datetime(["2024-03-01", "2024-03-01", "2024-03-02", "2024-03-02",
                                 "2024-03-03", "2024-03-03", "2024-03-04", "2024-03-04"]),
    "delivered": pd.to_datetime(["2024-03-02", "2024-03-03", "2024-03-02", "2024-03-01",
                                 "2024-03-05", "2024-03-04", "2024-03-06", "2024-03-05"]),
})

bad_qty = deliveries["qty"] < 1
bad_rating = deliveries["rating"].notna() & ~deliveries["rating"].between(1, 5)
bad_dates = deliveries["delivered"] < deliveries["ordered"]

broken = deliveries[bad_qty | bad_rating | bad_dates]
print(bad_qty.sum(), "bad quantities,", bad_rating.sum(), "bad ratings,", bad_dates.sum(), "bad dates")
broken`,
  check: `for _n in ("bad_qty", "bad_rating", "bad_dates"):
    assert _n in globals(), "Make the rule %s: a True/False column, one value per row." % _n
assert list(bad_qty) == [False, True, False, False, True, False, False, False], "bad_qty marks a qty below 1: orders 102 and 105."
assert list(bad_rating) == [False, False, True, False, False, False, False, False], "bad_rating marks a rating that's there but outside 1 to 5: only order 103. A missing rating isn't broken, just missing, so add .notna()."
assert list(bad_dates) == [False, False, False, True, False, False, False, False], "bad_dates marks delivered before ordered: order 104."
assert "broken" in globals() and list(broken["order_id"]) == [102, 103, 104, 105], "broken should be orders 102, 103, 104 and 105: deliveries[bad_qty | bad_rating | bad_dates]."`,
},
{
  id: 'ms-12', mins: 5,
  title: "Totals that don't add up",
  concept: [
    'When the same fact is stored twice, the two copies should agree: a receipt\'s total ought to equal its lines added up. When they don\'t, one of them is wrong.',
    'Rebuild the figure yourself with `groupby` and `sum`, then line it up beside the stored one: `.map(sums)` looks each receipt number up in the sums.',
    'Compare money with a small allowance, `(a - b).abs() > 0.005`, rather than `!=`. Decimals are stored in binary, so two equal-looking amounts can be a hair apart.',
  ],
  starter: `receipts = pd.DataFrame({"receipt": [1, 2, 3, 4], "total": [12.25, 7.50, 11.00, 15.75]})
lines = pd.DataFrame({
    "receipt": [1, 1, 2, 2, 3, 3, 3, 4, 4],
    "item":    ["latte", "cake", "tea", "tea", "mocha", "cake", "tea", "latte", "brownie"],
    "price":   [4.50, 7.75, 2.75, 2.75, 5.00, 3.25, 2.75, 4.50, 3.75],
})
sums = lines.groupby("receipt")["price"].sum()
sums`,
  task: 'Make `rebuilt`: a copy of `receipts` with a new column `from_lines`, each receipt\'s line prices added up. Then `mismatched`: the rows of `rebuilt` where `total` and `from_lines` differ by more than 0.005.',
  hint: '`rebuilt = receipts.copy()`, then `rebuilt["from_lines"] = rebuilt["receipt"].map(sums)`. Then `mismatched = rebuilt[(rebuilt["total"] - rebuilt["from_lines"]).abs() > 0.005]`.',
  solution: `receipts = pd.DataFrame({"receipt": [1, 2, 3, 4], "total": [12.25, 7.50, 11.00, 15.75]})
lines = pd.DataFrame({
    "receipt": [1, 1, 2, 2, 3, 3, 3, 4, 4],
    "item":    ["latte", "cake", "tea", "tea", "mocha", "cake", "tea", "latte", "brownie"],
    "price":   [4.50, 7.75, 2.75, 2.75, 5.00, 3.25, 2.75, 4.50, 3.75],
})
sums = lines.groupby("receipt")["price"].sum()

rebuilt = receipts.copy()
rebuilt["from_lines"] = rebuilt["receipt"].map(sums)
mismatched = rebuilt[(rebuilt["total"] - rebuilt["from_lines"]).abs() > 0.005]
mismatched`,
  check: `assert "rebuilt" in globals() and "from_lines" in rebuilt.columns, "Make rebuilt: a copy of receipts with a from_lines column."
assert list(rebuilt["from_lines"].round(2)) == [12.25, 5.5, 11.0, 8.25], "from_lines should be each receipt's prices added up: 12.25, 5.5, 11.0 and 8.25. Use rebuilt['receipt'].map(sums)."
assert "from_lines" not in receipts.columns, "Work on a copy, receipts.copy(), so the stored figures stay as they arrived."
assert "mismatched" in globals() and list(mismatched["receipt"]) == [2, 4], "mismatched should be receipts 2 and 4, where the totals and lines disagree. You have %r." % (list(mismatched["receipt"]) if "mismatched" in globals() else None,)`,
},
{
  id: 'ms-13', mins: 5,
  title: 'Unlikely, not impossible: outliers',
  concept: [
    'An **outlier** is a value far from the rest. It might be a typo (an extra zero) or real and important (a huge catering order). Flag it, look at it, then decide.',
    'A common yardstick uses **quartiles**: a quarter of the values lie below Q1, and a quarter above Q3. The gap between them, Q3 − Q1, is the **IQR**: the spread of the middle half.',
    'Anything more than 1.5 × IQR below Q1, or above Q3, gets flagged. Unlike the average, quartiles hardly move when an outlier turns up, so they make a steady yardstick.',
  ],
  starter: `spend = pd.Series([12.5, 9.0, 14.25, 11.0, 8.75, 135.0, 10.5, 13.0, 0.5, 12.0, 9.75, 11.5], name="spend")
print("average:", round(spend.mean(), 2), " median:", spend.median())
spend.describe()`,
  task: 'Work out `q1` and `q3` with `.quantile`, and `iqr`: the gap between them. Then `outliers`: the values below `q1 - 1.5 * iqr` or above `q3 + 1.5 * iqr`.',
  hint: '`q1 = spend.quantile(0.25)`, `q3 = spend.quantile(0.75)`, `iqr = q3 - q1`, then `outliers = spend[(spend < q1 - 1.5 * iqr) | (spend > q3 + 1.5 * iqr)]`.',
  solution: `spend = pd.Series([12.5, 9.0, 14.25, 11.0, 8.75, 135.0, 10.5, 13.0, 0.5, 12.0, 9.75, 11.5], name="spend")

q1 = spend.quantile(0.25)
q3 = spend.quantile(0.75)
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
outliers = spend[(spend < low) | (spend > high)]

print("keep between", round(low, 2), "and", round(high, 2))
outliers`,
  check: `assert "q1" in globals() and "q3" in globals(), "Make q1 and q3 with spend.quantile(0.25) and spend.quantile(0.75)."
assert abs(float(q1) - spend.quantile(0.25)) < 1e-9 and abs(float(q3) - spend.quantile(0.75)) < 1e-9, "q1 is spend.quantile(0.25) and q3 is spend.quantile(0.75)."
assert "iqr" in globals() and abs(float(iqr) - 3.0625) < 1e-9, "iqr is q3 - q1."
assert "outliers" in globals() and sorted(outliers.tolist()) == [0.5, 135.0], "outliers should be 0.5 and 135.0: the values below q1 - 1.5 * iqr or above q3 + 1.5 * iqr."`,
},
{
  id: 'ms-14', mins: 5,
  title: 'Same name, different spellings',
  concept: [
    'Typed-in names drift: "Lagoss", "Niarobi", "Kigalli". Stripping spaces and fixing capitals can\'t mend a misspelling.',
    '`difflib.get_close_matches(word, choices, n=1, cutoff=0.8)` finds the choice most like the word. It scores how alike two words are from 0 to 1, and ignores anything under the cutoff.',
    'Match against a list of correct names, and set aside anything that matches nothing for a person to check. Never let a near-match change data without anyone seeing.',
  ],
  starter: `import difflib

branches = ["Lagos", "Accra", "Nairobi", "Kigali"]
typed = pd.Series(["Lagos", "Lagoss", "acra", "Nairobi", "Niarobi", "Kigali", "Kigalli", "London"])

print(difflib.get_close_matches("Lagoss", branches, n=1, cutoff=0.8))
print(difflib.get_close_matches("acra", branches, n=1, cutoff=0.8))      # nothing: capitals count`,
  task: 'Write `fix(name)`: the closest branch to the name, stripped and in title case, with `cutoff=0.8`, or `None` if nothing is close enough. Then make `fixed`: `fix` applied to every name in `typed`, and `unmatched`: the typed names that came back as `None`.',
  hint: 'Inside `fix`: `found = difflib.get_close_matches(name.strip().title(), branches, n=1, cutoff=0.8)`, then `return found[0] if found else None`. Then `fixed = typed.apply(fix)` and `unmatched = typed[fixed.isna()]`.',
  solution: `import difflib

branches = ["Lagos", "Accra", "Nairobi", "Kigali"]
typed = pd.Series(["Lagos", "Lagoss", "acra", "Nairobi", "Niarobi", "Kigali", "Kigalli", "London"])

def fix(name):
    found = difflib.get_close_matches(name.strip().title(), branches, n=1, cutoff=0.8)
    return found[0] if found else None

fixed = typed.apply(fix)
unmatched = typed[fixed.isna()]
print(pd.DataFrame({"typed": typed, "fixed": fixed}))
unmatched`,
  check: expect('fix', '[(("Lagoss",), "Lagos"), (("acra",), "Accra"), (("Niarobi",), "Nairobi"), (("London",), None), (("kigali ",), "Kigali")]') + `
assert "fixed" in globals(), "Make fixed: typed.apply(fix)."
assert [None if pd.isna(_x) else _x for _x in fixed] == ["Lagos", "Lagos", "Accra", "Nairobi", "Nairobi", "Kigali", "Kigali", None], "fixed should match every typed name to a branch, except London."
assert "unmatched" in globals() and list(unmatched) == ["London"], "unmatched should be the typed names that matched nothing: just London."`,
},
{
  id: 'ms-15', mins: 5,
  title: 'A health report for a table',
  concept: [
    'Before you share a dataset, or trust one, sum up its health in a few numbers: how many rows, how many exact repeats, and how much is missing in each column.',
    '`df.duplicated().sum()` counts repeated rows. `df.isna().sum()` counts the gaps in each column; `.items()` then gives each column\'s name with its count.',
    'Put the checks in a function and you can run the same report on every file that arrives, and compare this month\'s with last month\'s.',
  ],
  starter: `signups = pd.DataFrame({
    "name":  ["Ada", "Kofi", "Zola", "Kofi", "Nia", None],
    "city":  ["Lagos", "Accra", None, "Accra", None, "Lagos"],
    "email": ["ada@example.com", "kofi@example.com", "zola@example.com", "kofi@example.com", None, "amara@example.com"],
})

def quality(df):
    return {}

quality(signups)`,
  task: 'Make `quality(df)` give back a dict with `"rows"` (how many), `"duplicates"` (how many exact repeated rows) and `"missing"`: a dict of each column that has gaps, with how many. Columns with no gaps stay out. Then `report = quality(signups)`.',
  hint: 'Inside: `gaps = df.isna().sum()`, then `return {"rows": len(df), "duplicates": int(df.duplicated().sum()), "missing": {col: int(n) for col, n in gaps.items() if n > 0}}`.',
  solution: `signups = pd.DataFrame({
    "name":  ["Ada", "Kofi", "Zola", "Kofi", "Nia", None],
    "city":  ["Lagos", "Accra", None, "Accra", None, "Lagos"],
    "email": ["ada@example.com", "kofi@example.com", "zola@example.com", "kofi@example.com", None, "amara@example.com"],
})

def quality(df):
    gaps = df.isna().sum()
    return {
        "rows": len(df),
        "duplicates": int(df.duplicated().sum()),
        "missing": {col: int(n) for col, n in gaps.items() if n > 0},
    }

report = quality(signups)
print(report)
print(quality(cafe))`,
  check: `assert callable(globals().get("quality")), "Keep the function called quality."
_r = quality(signups)
assert isinstance(_r, dict), "quality should give back a dict."
assert _r.get("rows") == 6, "rows is len(df): 6 here."
assert _r.get("duplicates") == 1, "duplicates is df.duplicated().sum(): Kofi's row appears twice, so 1."
assert _r.get("missing") == {"name": 1, "city": 2, "email": 1}, "missing should be {'name': 1, 'city': 2, 'email': 1}. You have %r." % (_r.get("missing"),)
assert quality(pd.DataFrame({"a": [1, 2], "b": ["x", "y"]})) == {"rows": 2, "duplicates": 0, "missing": {}}, "A clean table should give 0 duplicates and an empty missing dict: leave out columns with no gaps."
assert globals().get("report") == _r, "Set report = quality(signups)."`,
},

/* ── Files that fight back ─────────────────────────────── */
{
  id: 'ms-16', mins: 5,
  title: 'Columns by position: fixed-width files',
  concept: [
    'Older systems often export **fixed-width** text: no commas at all, just each column taking up a set number of characters, padded out with spaces.',
    '`pd.read_fwf(file, widths=[...])` cuts every line at those widths. Count them from the header line, or take them from the system\'s documentation.',
    '`io.StringIO(text)` makes a piece of text behave like a file, so you can try a reader on a sample without saving anything.',
  ],
  starter: `import io

text = """branch    drink     cups price
Lagos     latte       40  4.50
Accra     tea         25  2.75
Nairobi   flat white  30  4.25
Kigali    mocha       12  5.00"""

pd.read_csv(io.StringIO(text))        # one column holding everything`,
  task: 'Read `text` into `stock` with `pd.read_fwf` and `widths=[10, 10, 4, 6]`: branch and drink get 10 characters each, cups 4 and price 6. Then `takings`: cups times price, added up.',
  hint: '`stock = pd.read_fwf(io.StringIO(text), widths=[10, 10, 4, 6])`, then `takings = (stock["cups"] * stock["price"]).sum()`.',
  solution: `import io

text = """branch    drink     cups price
Lagos     latte       40  4.50
Accra     tea         25  2.75
Nairobi   flat white  30  4.25
Kigali    mocha       12  5.00"""

stock = pd.read_fwf(io.StringIO(text), widths=[10, 10, 4, 6])
takings = (stock["cups"] * stock["price"]).sum()
print("takings:", takings)
stock`,
  check: `assert "stock" in globals() and list(stock.columns) == ["branch", "drink", "cups", "price"], "stock should have four columns, branch, drink, cups and price: pd.read_fwf(io.StringIO(text), widths=[10, 10, 4, 6])."
assert list(stock["drink"]) == ["latte", "tea", "flat white", "mocha"], "The drinks should be latte, tea, flat white and mocha. You have %r." % (list(stock["drink"]),)
assert "takings" in globals() and abs(float(takings) - 436.25) < 1e-9, "takings is cups times price, added up: 436.25."`,
},
{
  id: 'ms-17', mins: 4,
  title: 'Dates that arrive as numbers',
  concept: [
    'Spreadsheets store a date as a count of days. Export one carelessly and 15 March 2024 turns up as `45366`.',
    'Excel counts from 30 December 1899 (a quirk kept for old compatibility), so `pd.to_datetime(counts, unit="D", origin="1899-12-30")` turns the counts back into dates.',
    'Always sanity-check the result: the dates should land in a sensible range. Counts from a different system would give dates decades out.',
  ],
  starter: `export = pd.DataFrame({"order": [1, 2, 3, 4], "ordered": [45366, 45367, 45371, 45383]})
print(export.dtypes)
export`,
  task: 'Turn `export["ordered"]` into real dates, counted from Excel\'s starting day. Then make `weekday`: the day name of the first order, and `span`: the days from the first order to the last, as a number.',
  hint: '`export["ordered"] = pd.to_datetime(export["ordered"], unit="D", origin="1899-12-30")`. Then `weekday = export["ordered"].iloc[0].day_name()` and `span = (export["ordered"].max() - export["ordered"].min()).days`.',
  solution: `export = pd.DataFrame({"order": [1, 2, 3, 4], "ordered": [45366, 45367, 45371, 45383]})

export["ordered"] = pd.to_datetime(export["ordered"], unit="D", origin="1899-12-30")
weekday = export["ordered"].iloc[0].day_name()
span = (export["ordered"].max() - export["ordered"].min()).days
print(weekday, span)
export`,
  check: `assert pd.api.types.is_datetime64_any_dtype(export["ordered"]), "Turn ordered into dates: pd.to_datetime(export['ordered'], unit='D', origin='1899-12-30')."
assert export["ordered"].iloc[0] == pd.Timestamp("2024-03-15"), "45366 should come out as 15 March 2024, not %s. Check the origin: '1899-12-30'." % export["ordered"].iloc[0].date()
assert globals().get("weekday") == "Friday", "15 March 2024 was a Friday: export['ordered'].iloc[0].day_name()."
assert globals().get("span") == 17, "span is (last - first).days: 17."`,
},
{
  id: 'ms-18', mins: 5,
  title: 'Junk around the table',
  concept: [
    'Exports often wrap the table in extras: a title and a blank line above it, a Total row and a note below it, and numbers written with commas, like "5,580.00".',
    '`read_csv` can skip all of it. `skiprows=3` ignores the first 3 lines; `skipfooter=2` ignores the last 2 (it needs `engine="python"` too); and `thousands=","` reads "5,580.00" as 5580.0.',
    'Fix it in the reader, not afterwards: fewer steps, and the numbers arrive as numbers. Then check your total against the file\'s own Total line.',
  ],
  starter: `import io

text = '''Branch report, March 2024
Exported by the till system

branch,cups,takings
Lagos,1240,"5,580.00"
Accra,980,"3,185.50"
Nairobi,1105,"4,696.25"
Total,3325,"13,461.75"
End of report'''

print(text)

# Skipping the top 3 lines gets the header right. Now look at the bottom
# two rows, and at the takings: text, not numbers.
pd.read_csv(io.StringIO(text), skiprows=3)`,
  task: 'Read `text` into `report`, skipping the 3 lines above the header and the last 2 lines, with the takings read as numbers. Then make `total`: the takings added up. It should match the report\'s own Total line.',
  hint: '`report = pd.read_csv(io.StringIO(text), skiprows=3, skipfooter=2, engine="python", thousands=",")`, then `total = report["takings"].sum()`.',
  solution: `import io

text = '''Branch report, March 2024
Exported by the till system

branch,cups,takings
Lagos,1240,"5,580.00"
Accra,980,"3,185.50"
Nairobi,1105,"4,696.25"
Total,3325,"13,461.75"
End of report'''

report = pd.read_csv(io.StringIO(text), skiprows=3, skipfooter=2, engine="python", thousands=",")
total = report["takings"].sum()
print("total:", total)
report`,
  check: `assert "report" in globals() and list(report.columns) == ["branch", "cups", "takings"], "report's columns should be branch, cups and takings: skiprows=3 skips the title, the export line and the blank line."
assert list(report["branch"]) == ["Lagos", "Accra", "Nairobi"], "report should hold just the three branches: skipfooter=2 (with engine='python') drops the Total row and the note."
assert pd.api.types.is_numeric_dtype(report["takings"]), "takings should be numbers: add thousands=','."
assert "total" in globals() and abs(float(total) - 13461.75) < 1e-9, "total should be 13461.75, the same as the report's Total line."`,
},
{
  id: 'ms-19', mins: 5,
  title: 'Nested JSON into a table',
  concept: [
    'Data from websites and apps usually comes as JSON, and nested: each order holds a customer, and a list of items inside it. A table needs it flat.',
    '`pd.json_normalize(data)` flattens nested dicts into columns with dotted names, like `customer.city`.',
    'For a list inside, `record_path="items"` makes one row per item, and `meta=[...]` copies fields from the order onto each of its rows. A field further in is written as a list: `["customer", "city"]`.',
  ],
  starter: `feed = [
    {"id": 1, "customer": {"name": "Ada", "city": "Lagos"},
     "items": [{"drink": "latte", "qty": 2, "price": 4.5}, {"drink": "cake", "qty": 1, "price": 3.25}]},
    {"id": 2, "customer": {"name": "Kofi", "city": "Accra"},
     "items": [{"drink": "tea", "qty": 3, "price": 2.75}]},
    {"id": 3, "customer": {"name": "Zola", "city": "Lagos"},
     "items": [{"drink": "mocha", "qty": 1, "price": 5.0}, {"drink": "latte", "qty": 1, "price": 4.5}]},
]

pd.json_normalize(feed)            # the items are still stuck in lists`,
  task: 'Make `items`: one row per item, carrying the order\'s `id` and the customer\'s city, using `record_path` and `meta`. Then add a `cost` column (qty times price) and make `by_city`: the cost added up for each city.',
  hint: '`items = pd.json_normalize(feed, record_path="items", meta=["id", ["customer", "city"]])`. Then `items["cost"] = items["qty"] * items["price"]` and `by_city = items.groupby("customer.city")["cost"].sum()`.',
  solution: `feed = [
    {"id": 1, "customer": {"name": "Ada", "city": "Lagos"},
     "items": [{"drink": "latte", "qty": 2, "price": 4.5}, {"drink": "cake", "qty": 1, "price": 3.25}]},
    {"id": 2, "customer": {"name": "Kofi", "city": "Accra"},
     "items": [{"drink": "tea", "qty": 3, "price": 2.75}]},
    {"id": 3, "customer": {"name": "Zola", "city": "Lagos"},
     "items": [{"drink": "mocha", "qty": 1, "price": 5.0}, {"drink": "latte", "qty": 1, "price": 4.5}]},
]

items = pd.json_normalize(feed, record_path="items", meta=["id", ["customer", "city"]])
items["cost"] = items["qty"] * items["price"]
by_city = items.groupby("customer.city")["cost"].sum()
print(by_city)
items`,
  check: `assert "items" in globals() and isinstance(items, pd.DataFrame) and len(items) == 5, "items should have one row per item: 5 rows. Use record_path='items'."
assert "id" in items.columns and "customer.city" in items.columns, "Carry the order's id and the customer's city onto each item: meta=['id', ['customer', 'city']]."
assert "by_city" in globals() and dict(by_city.round(2)) == {"Accra": 8.25, "Lagos": 21.75}, "by_city should be Accra 8.25 and Lagos 21.75: the cost column grouped by customer.city."`,
},
{
  id: 'ms-20', mins: 4,
  title: 'Does it cover what you need?',
  concept: [
    'Clean data can still be the wrong data. **Data fit** asks whether it can answer your question: does it cover the right dates, every branch, enough rows?',
    'Gaps are easy to miss, because a missing day simply isn\'t there. Build the full list you expected with `pd.date_range(start, end)`, and compare.',
    '`expected.difference(actual)` gives what should be there but isn\'t. Report gaps alongside any result, so nobody mistakes "no data" for "no sales".',
  ],
  starter: `sales = pd.DataFrame({
    "day": pd.to_datetime(["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-05", "2024-03-06",
                           "2024-03-07", "2024-03-10", "2024-03-11", "2024-03-12", "2024-03-14"]),
    "cups": [120, 135, 98, 142, 130, 125, 160, 118, 127, 133],
})
print(len(sales), "days of sales, for 1 to 14 March")`,
  task: 'Make `expected`: every day from 1 to 14 March 2024, with `pd.date_range`. Then `missing`: the days in `expected` that aren\'t in `sales["day"]`, and `coverage`: the share of the expected days that have sales.',
  hint: '`expected = pd.date_range("2024-03-01", "2024-03-14")`, `missing = expected.difference(sales["day"])`, `coverage = 1 - len(missing) / len(expected)`.',
  solution: `sales = pd.DataFrame({
    "day": pd.to_datetime(["2024-03-01", "2024-03-02", "2024-03-03", "2024-03-05", "2024-03-06",
                           "2024-03-07", "2024-03-10", "2024-03-11", "2024-03-12", "2024-03-14"]),
    "cups": [120, 135, 98, 142, 130, 125, 160, 118, 127, 133],
})

expected = pd.date_range("2024-03-01", "2024-03-14")
missing = expected.difference(sales["day"])
coverage = 1 - len(missing) / len(expected)
print("missing:", [d.strftime("%a %d %b") for d in missing])
print("coverage:", round(coverage * 100), "%")`,
  check: `assert "expected" in globals() and len(expected) == 14, "expected should hold all 14 days, 1 to 14 March 2024: pd.date_range('2024-03-01', '2024-03-14')."
assert "missing" in globals() and [pd.Timestamp(_d).day for _d in missing] == [4, 8, 9, 13], "missing should be 4, 8, 9 and 13 March: expected.difference(sales['day'])."
assert "coverage" in globals() and abs(float(coverage) - 10 / 14) < 1e-9, "coverage is the share of expected days with sales: 10 of 14."`,
},
];
