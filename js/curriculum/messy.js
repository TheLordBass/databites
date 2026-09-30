/* Every mess in `survey` is one that turns up in real exports.
   This is the track where you stop being handed clean data. */

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
];
