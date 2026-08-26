/* Every mess in `survey` is one that turns up in real exports.
   This is the track where you stop being handed clean data. */

export const MESSY = [
{
  id: 'ms-01', mins: 4,
  title: "A table you didn't make",
  concept: [
    'A new table called `survey` is loaded. Nobody tidied it for you.',
    '`.columns`, `.dtypes` and `.head()` are the first three things to look at.',
    'Note the dtypes: almost everything is `object`, which means **text**.',
  ],
  starter: `print(survey.shape)
print(survey.dtypes)

survey.head()`,
  task: 'Put the column names in `cols` exactly as they are — spaces and all.',
  hint: '`cols = list(survey.columns)` — look closely at the strings it prints.',
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
    '`survey.columns` is itself a string index, so `.str` works on it.',
    'Chain the fixes: `.str.strip().str.lower().str.replace(" ", "_")`.',
    'Tidy names mean `df.spend` works instead of `df["Spend (GBP) "]`.',
  ],
  starter: `print(survey.columns.str.strip())

survey.columns.str.strip().str.lower()`,
  task: 'Make `clean` — a copy of `survey` whose columns are stripped, lowercased and underscored.',
  hint: '`clean = survey.copy()` then assign `clean.columns = survey.columns.str.strip().str.lower().str.replace(" ", "_")`',
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
    '`" Lagos"`, `"lagos"` and `"LAGOS"` are three different values to pandas.',
    '`.value_counts()` is how you spot it — you will see the same place several times.',
    '`.str.strip().str.title()` collapses them back into one.',
  ],
  starter: `print(survey["City "].value_counts())`,
  task: 'Make `cities_fixed` — the `City ` column tidied so only 3 distinct places remain.',
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
    '`"£18.00"` and `"n/a"` are strings — you cannot add them up.',
    'Strip the junk first, then `pd.to_numeric(..., errors="coerce")`.',
    '`errors="coerce"` turns whatever it cannot parse into `NaN` instead of crashing.',
  ],
  starter: `print(survey["Spend (GBP)"].unique())

pd.to_numeric(survey["Spend (GBP)"], errors="coerce").head()`,
  task: 'Make `spend` — that column as real numbers, with the `£` removed and `n/a` becoming NaN.',
  hint: 'Strip the symbol first: `.str.replace("£", "", regex=False)`, then `pd.to_numeric(..., errors="coerce")`.',
  solution: `spend = pd.to_numeric(
    survey["Spend (GBP)"].str.replace("£", "", regex=False),
    errors="coerce",
)

print(spend.describe())
print("unparseable:", int(spend.isna().sum()))`,
  check: `assert "spend" in globals(), "Make a variable called spend."
assert str(spend.dtype).startswith("float"), "spend should be numeric, not text."
assert int(spend.isna().sum()) == 6, "The six 'n/a' rows should be NaN — got %d." % int(spend.isna().sum())
assert abs(float(spend.max()) - 23.10) < 0.001, "The £18.00 rows should parse to 18.0, so the max should be 23.10."`,
},
{
  id: 'ms-05', mins: 5,
  title: 'Dates in three formats',
  concept: [
    '`survey` mixes `2024-01-05`, `05/02/2024` and the word `unknown`.',
    '`pd.to_datetime(..., errors="coerce")` parses what it can and NaTs the rest.',
    '`format="mixed"` with `dayfirst=True` tells it the slashed ones are day-first.',
  ],
  starter: `print(survey["Signed Up"].unique())`,
  task: 'Make `signed` — the column parsed to real dates, with unparseable values as NaT.',
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
assert "datetime" in str(signed.dtype), "signed should be a datetime column, not text."
assert int(signed.isna().sum()) == 6, "The six 'unknown' rows should come out as NaT — got %d." % int(signed.isna().sum())
_feb = signed.dropna()
assert (_feb.dt.year == 2024).all(), "Every parsed date should land in 2024."`,
},
{
  id: 'ms-06', mins: 4,
  title: 'Yes, y, YES, N, no',
  concept: [
    'Five spellings, two meanings. Normalise the case first, then map.',
    '`.str.strip().str.lower().str[0]` reduces them all to `y` or `n`.',
    'Comparing to `"y"` gives you a real boolean column.',
  ],
  starter: `print(survey["Subscribed?"].value_counts())`,
  task: 'Make `subscribed` — a True/False column from that mess.',
  hint: '`survey["Subscribed?"].str.strip().str.lower().str[0] == "y"`',
  solution: `subscribed = (
    survey["Subscribed?"].str.strip().str.lower().str[0] == "y"
)

print(subscribed.value_counts())
subscribed.head()`,
  check: `assert "subscribed" in globals(), "Make a variable called subscribed."
assert subscribed.dtype == bool, "subscribed should be a boolean column of True/False."
_want = survey["Subscribed?"].str.strip().str.lower().str[0] == "y"
assert (subscribed == _want).all(), "Yes, y and YES should all be True; N and no should be False."`,
},
{
  id: 'ms-07', mins: 4,
  title: "Duplicates that aren't obvious",
  concept: [
    '`.duplicated().sum()` counts rows repeated in full.',
    '`subset=[...]` catches rows that repeat on the columns you care about.',
    '`keep="last"` keeps the newest copy instead of the first.',
  ],
  starter: `print("exact duplicate rows:", survey.duplicated().sum())

survey[survey.duplicated(keep=False)]`,
  task: 'Make `deduped` — `survey` with exact duplicate rows removed.',
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
    'The `Note` column hides a reference number inside a sentence.',
    '`.str.extract(r"ref#(\\d+)")` pulls out whatever the brackets capture.',
    '`\\d+` means "one or more digits". The brackets say "this is the bit I want".',
  ],
  starter: `print(survey["Note"].head(3).tolist())

survey["Note"].str.extract(r"ref#(\\d+)").head()`,
  task: 'Make `refs` — those reference numbers as **integers**.',
  hint: 'Extract with `[0]` to get a Series, then `.astype(int)`.',
  solution: `refs = survey["Note"].str.extract(r"ref#(\\d+)")[0].astype(int)

print(refs.head())
print("range:", refs.min(), "to", refs.max())`,
  check: `assert "refs" in globals(), "Make a variable called refs."
assert "int" in str(refs.dtype), "refs should be integers, not text — try .astype(int)."
assert int(refs.iloc[0]) == 1000, "The first row's reference is 1000."
assert int(refs.max()) == 1029, "The highest reference in the file is 1029."`,
},
];
