/* Messy data (ms-01 to ms-20): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Examples use a tiny mess made
   on the spot, never the task's own table or answer. */

const SURVEY = {
  ' Name ': "the customer's name, sometimes all in lower case",
  'City ': 'Lagos, Accra or Nairobi, spelled with stray spaces and capitals',
  'Signed Up': 'the sign-up date, written three different ways, or the word unknown',
  'Spend (GBP)': 'what they spent, as text like £18.00, or n/a',
  'Subscribed?': 'Yes, y, N, no or YES',
  'Note': 'a short sentence with a reference number after ref#',
};
const GOT_SURVEY = ['`survey` is loaded: 32 answers to a customer survey, exported by someone else and never tidied.', SURVEY];

export const MESSY_DETAIL = {
'ms-01': {
  explain: [
    'Until now, every table has been neat and tidy. This course is about the ones that turn up messy, which, honestly, is most of them.',
    '`survey` holds answers to a customer survey, exported by someone else and never cleaned up.',
    'Get to know a new table with three quick looks: `.columns` (the names), `.dtypes` (what kind of data each column holds) and `.head()` (the first few rows).',
    'A column shown as `object` holds **text**. Numbers stored as text look perfectly fine, but they won\'t add up.',
    '`repr(name)` prints a name with its quotes, so a hidden space at either end gives itself away.',
  ],
  example: {
    say: 'Here\'s a small table where the prices were typed in as text.',
    code: `menu = pd.DataFrame({"drink": ["latte", "tea"], "price ": ["4.50", "2.75"]})
print(menu.dtypes)
print(repr(menu.columns[1]))`,
    lines: [
      ['menu.dtypes', 'both columns are object: text. The prices only look like numbers.'],
      ['repr(menu.columns[1])', "shows the second column's name in quotes, so the space at its end is plain to see."],
    ],
  },
  brief: {
    story: 'You have just been sent a survey export, and before anything else you want to see what the columns are really called.',
    get: [GOT_SURVEY],
    want: ['Put the column names in `cols`, exactly as they are, spaces and all'],
    out: '`cols` is a list of six names.',
  },
},
'ms-02': {
  explain: [
    'Names like `" Name "` and `"Signed Up"` are a pain to type exactly right every time. Tidy them once, at the start, and forget about them.',
    'The column names behave like a text column, so all the `.str` tools work on them.',
    '`.str.strip()` trims spaces off both ends, `.str.lower()` makes everything small, and `.str.replace(" ", "_")` swaps any spaces left inside for underscores.',
    'Chain them one after another, each working on what the one before gave it.',
    'Set `clean.columns = ...` on a copy, so the original keeps its names for you to check against.',
  ],
  example: {
    say: 'Here three awkward column names are tidied in one chain.',
    code: `names = pd.Index([" Order ID", "Drink Name ", "CUPS"])
names.str.strip().str.lower().str.replace(" ", "_")`,
    lines: [
      ['.str.strip()', 'takes the spaces off the ends.'],
      ['.str.lower()', 'makes them all lower case.'],
      ['.str.replace(" ", "_")', 'turns the space inside into an underscore: order_id.'],
    ],
  },
  brief: {
    story: 'Every query on this table means typing `" Name "` with its spaces. Time to fix the names for good.',
    get: [GOT_SURVEY],
    want: ['Make `clean`: a copy of `survey`', 'Its column names trimmed, lower case, with `_` in place of the spaces inside'],
    out: '`clean` has every row, and names like `name` and `signed_up`.',
  },
},
'ms-03': {
  explain: [
    'To pandas, `" Lagos"`, `"lagos"` and `"LAGOS"` are three different places. One stray space or capital is all it takes.',
    '`.value_counts()` is how you catch it: the same place shows up several times, spelled slightly differently.',
    '`.str.strip()` trims away the spaces.',
    '`.str.title()` gives each word a capital first letter and makes the rest small.',
    'Together they fold all the variations back into one value, and the counts finally add up.',
  ],
  example: {
    say: 'Here four spellings of two drinks become just two values.',
    code: `drinks = pd.Series(["Latte", " latte", "LATTE ", "Tea"])
print(drinks.value_counts())
drinks.str.strip().str.title().value_counts()`,
    lines: [
      ['drinks.value_counts()', 'four different values, each counted once.'],
      ['.str.strip().str.title()', 'all three lattes become Latte.'],
      ['.value_counts()', 'now Latte is counted 3 times.'],
    ],
  },
  brief: {
    story: 'The survey says the café has five cities. It has three.',
    get: [GOT_SURVEY],
    want: ['Make `cities_fixed`: the `"City "` column tidied, so only 3 different places are left'],
    out: 'A column with just Lagos, Accra and Nairobi in it.',
    fine: ['The column is called `"City "`, with a space on the end.'],
  },
},
'ms-04': {
  explain: [
    '`"£18.00"` and `"n/a"` are text, not numbers, so you can\'t add them up.',
    'Take the `£` out first, with `.str.replace("£", "", regex=False)`.',
    '`pd.to_numeric(...)` then turns the text into real numbers.',
    'With `errors="coerce"`, anything it can\'t read as a number, like "n/a", becomes `NaN`, the mark for missing, instead of stopping with an error.',
    'From there, `.sum()` and `.mean()` skip the missing values, which is just what you want.',
  ],
  example: {
    say: 'Here some amounts typed as text become real numbers, and a word that isn\'t a number becomes missing.',
    code: `amounts = pd.Series(["12", "7.5", "none", "3"])
numbers = pd.to_numeric(amounts, errors="coerce")
print(numbers)
print("total:", numbers.sum())`,
    lines: [
      ['pd.to_numeric(amounts, errors="coerce")', 'turns each one into a number, and "none" into NaN.'],
      ['numbers.sum()', 'now it adds up, skipping the missing one: 22.5.'],
    ],
  },
  brief: {
    story: 'Finance wants the average survey spend, and the column will not add up.',
    get: [GOT_SURVEY],
    want: ['Make `spend`: the `Spend (GBP)` column as real numbers', 'The `£` taken out', '`n/a` becoming missing (NaN)'],
    out: '`spend` is a column of numbers, with 6 missing.',
  },
},
'ms-05': {
  explain: [
    '`survey` writes its dates three different ways: `2024-01-05`, `05/02/2024` and the word `unknown`.',
    '`pd.to_datetime(...)` turns text into real dates, which you can sort and compare.',
    'With `errors="coerce"`, anything it can\'t read becomes `NaT` ("not a time"), the date version of missing.',
    '`format="mixed"` lets it cope with more than one style in the same column.',
    '`dayfirst=True` says that in 05/02, the day comes first: 5 February, not 2 May. British dates, in other words.',
  ],
  example: {
    say: 'Here three pieces of text are read as dates, day first.',
    code: `when = pd.Series(["03/04/2024", "2024-12-25", "not yet"])
pd.to_datetime(when, format="mixed", dayfirst=True, errors="coerce")`,
    lines: [
      ['"03/04/2024"', 'with dayfirst=True, that is 3 April.'],
      ['"not yet"', "can't be read, so it becomes NaT."],
    ],
  },
  brief: {
    story: 'Marketing wants to know when people signed up, and the dates are a mess.',
    get: [GOT_SURVEY],
    want: ['Make `signed`: the `Signed Up` column as real dates', 'Anything unreadable left missing (NaT)'],
    out: '`signed` is a column of dates, with 6 missing.',
  },
},
'ms-06': {
  explain: [
    'Five spellings, only two meanings: Yes, y, YES, N and no.',
    'First make them look alike. `.str.strip().str.lower()` gives "yes", "y", "n", "no".',
    '`.str[0]` keeps just the first character of each, the same way `[0]` gives the first item of a list. Now every answer is either "y" or "n".',
    'Compare with `== "y"` and you get a real True or False for each row.',
    'And True and False can be counted: `.sum()` counts the Trues.',
  ],
  example: {
    say: 'Here four spellings of two sizes are tidied, then compared.',
    code: `sizes = pd.Series([" Large", "large", "SMALL", "small "])
tidy = sizes.str.strip().str.lower()
print(tidy.tolist())
print((tidy == "large").tolist())`,
    lines: [
      ['.str.strip().str.lower()', 'every size now looks alike.'],
      ['tidy == "large"', 'True for the two larges, False for the smalls.'],
    ],
  },
  brief: {
    story: 'The newsletter team needs to know who said yes to emails.',
    get: [GOT_SURVEY],
    want: ['Make `subscribed`: a True/False column from `Subscribed?`', 'True for every kind of yes'],
    out: '`subscribed` holds only True and False.',
  },
},
'ms-07': {
  explain: [
    '`.duplicated()` marks every row that\'s an exact copy of an earlier one, and `.sum()` counts them.',
    'Exports repeat rows more often than you\'d think: a file added twice, a form sent twice.',
    'With `subset=["name"]`, rows count as copies when just those columns match.',
    '`.drop_duplicates()` removes the copies and keeps the first of each.',
    '`keep="last"` keeps the newest copy instead.',
  ],
  example: {
    say: 'Here\'s a visit log with one exact copy, and a name that comes up more than once.',
    code: `visits = pd.DataFrame({"name": ["Ada", "Kofi", "Ada", "Ada"],
                       "drink": ["latte", "tea", "latte", "mocha"]})
print(visits.duplicated().sum(), "exact copy")
print(visits.duplicated(subset=["name"]).sum(), "repeat names")
visits.drop_duplicates(subset=["name"], keep="last")`,
    lines: [
      ['visits.duplicated().sum()', 'one row is an exact copy: Ada with a latte.'],
      ['subset=["name"]', 'Ada comes up three times, so two are repeats by name.'],
      ['keep="last"', "keeps each name's last row: Ada's mocha."],
    ],
  },
  brief: {
    story: 'Two survey answers were sent twice, and they are throwing the counts off.',
    get: [GOT_SURVEY],
    want: ['Make `deduped`: `survey` with the exact copies removed'],
    out: '`deduped` has 30 rows.',
  },
},
'ms-08': {
  explain: [
    'The `Note` column has a reference number tucked inside a sentence, after `ref#`.',
    '`.str.extract(...)` pulls out a piece of text that fits a **pattern**, also called a regular expression.',
    'In a pattern, `\\d` means "a digit" and `+` means "one or more", so `\\d+` is a whole number.',
    'Round brackets mark the part you want back, so `r"ref#(\\d+)"` gives you the digits after ref#. The `r` before the quotes keeps the `\\` as it is.',
    '`.str.extract` hands back a table, one column per pair of brackets, and `[0]` takes the first column.',
    'What comes out is still text, so `.astype(int)` turns it into whole numbers.',
  ],
  example: {
    say: 'Here the table numbers are pulled out of some order notes.',
    code: `notes = pd.Series(["table 4, two lattes", "table 12, one tea", "table 7, cake"])
notes.str.extract(r"table (\\d+)")`,
    lines: [
      ['r"table (\\d+)"', 'the word table and a space, then the digits after it, which are kept.'],
      ['.str.extract(...)', 'a table with one column, 0, holding 4, 12 and 7, still as text.'],
    ],
  },
  brief: {
    story: 'Customer service wants the survey linked to their tickets, by reference number.',
    get: [GOT_SURVEY],
    want: ['Make `refs`: the numbers after `ref#` in `Note`', 'As whole numbers, not text'],
    out: '`refs` runs from 1000 to 1029.',
  },
},
'ms-09': {
  explain: [
    'Exported files often write "missing" as a word: `"n/a"`, `"unknown"`, `"-"`.',
    'pandas takes those as real values, so `.isna()` can\'t see them, and your count of the gaps comes out too low.',
    '`.replace([...], np.nan)` swaps every one of those for a genuine missing value.',
    '`np.nan` is how you write "missing" in code. It comes from numpy, which pandas is built on.',
    'After that, `.isna().sum()` gives you an honest count.',
  ],
  example: {
    say: 'Here two gaps in disguise are found and made real.',
    code: `scores = pd.Series([4, "-", 5, "none", 3])
print(scores.isna().sum(), "missing, before")
fixed = scores.replace(["-", "none"], np.nan)
print(fixed.isna().sum(), "missing, after")`,
    lines: [
      ['scores.isna().sum()', '0: "-" and "none" look like values to pandas.'],
      ['.replace(["-", "none"], np.nan)', 'turns both into real missing values, so the count is 2.'],
    ],
  },
  brief: {
    story: 'Your manager asks how much of the survey is missing, and `isna` says none of it. That is not true.',
    get: [GOT_SURVEY],
    want: ['Make `honest`: `survey` with every `"n/a"` and `"unknown"` turned into a real missing value', 'Then look at `honest.isna().sum()`'],
    out: 'The count of missing values per column, no longer all zeros.',
  },
},
'ms-10': {
  explain: [
    'This is everything from the course so far, in one go: tidy names, tidy text, numbers from text, yes or no as True or False, and no duplicates.',
    'Build the clean table column by column from the messy one, with `pd.DataFrame({...})`.',
    'Each line inside reads `"new name": the cleaned column`.',
    'Leave the original untouched, so you can always check a cleaned value against where it came from.',
    'Finish off with `.drop_duplicates()` on the new table.',
  ],
  example: {
    say: 'Here a tiny messy table is rebuilt clean, one column per line.',
    code: `raw = pd.DataFrame({" Drink": [" latte", "TEA"], "Cups ": ["3", "x"]})
neat = pd.DataFrame({
    "drink": raw[" Drink"].str.strip().str.title(),
    "cups": pd.to_numeric(raw["Cups "], errors="coerce"),
})
neat`,
    lines: [
      ['"drink": ...', 'a new, tidy name, holding the tidied text.'],
      ['"cups": pd.to_numeric(...)', 'the counts as numbers. The x becomes missing.'],
    ],
  },
  brief: {
    story: 'The survey is going into the monthly report, so it needs to be clean from end to end.',
    get: [GOT_SURVEY],
    want: ['`name` and `city`: spaces stripped, Title Case', '`spend`: a number, the £ gone, n/a missing', '`subscribed`: True or False', 'Drop the exact duplicate rows'],
    out: '`tidy` has four columns and 30 rows.',
  },
},
'ms-11': {
  explain: [
    '**Data integrity** asks whether the data hangs together. A quantity below 1, or a delivery before its order, means something somewhere went wrong.',
    'Write down the rules every row should follow, then go and find the rows that break them.',
    'Each rule is a True/False column. `deliveries["qty"] < 1` is True on the rows with no quantity.',
    '`|` means "or", so `rule1 | rule2` marks rows that break either. `&` means "and", and `~` flips True and False.',
    'A missing value isn\'t broken, just missing, so use `.notna()` to keep it out of a rule.',
    'Look at the rule-breakers before deleting anything. A pattern in them often points to a fault further back.',
  ],
  example: {
    say: 'Here a stock list is checked against two rules.',
    code: `stock = pd.DataFrame({"item": ["beans", "milk", "cups", "lids"],
                      "on_hand": [12, -3, 40, 0]})
negative = stock["on_hand"] < 0
empty = stock["on_hand"] == 0
stock[negative | empty]`,
    lines: [
      ['negative', 'True where the count is below zero: impossible.'],
      ['empty', 'True where there is none left.'],
      ['stock[negative | empty]', 'the rows breaking either rule: milk and lids.'],
    ],
  },
  brief: {
    story: 'Deliveries look odd this week, and the operations lead wants to know which orders to check.',
    get: [['The starter makes `deliveries`, eight orders:', { order_id: 'the order', qty: 'how many', rating: '1 to 5, or missing', ordered: 'the day it was ordered', delivered: 'the day it arrived' }]],
    want: ['`bad_qty`: qty below 1', '`bad_rating`: a rating that is there, but outside 1 to 5', '`bad_dates`: delivered before it was ordered', '`broken`: the rows breaking any of them'],
    out: '`broken` holds orders 102, 103, 104 and 105.',
  },
},
'ms-12': {
  explain: [
    'Whenever the same fact is stored twice, the two copies should agree. A receipt\'s total ought to equal its lines added up.',
    'When they don\'t, one of them is wrong, and you need to know which receipts.',
    'So rebuild the figure yourself with `groupby` and `sum`.',
    '`.map(sums)` looks each receipt number up in the sums, so they line up next to the stored totals.',
    'Compare money with a small allowance, `(a - b).abs() > 0.005`, rather than `!=`. Decimals are stored in binary, so two amounts can be a hair apart even when they look the same.',
  ],
  example: {
    say: 'Here two orders get their lines added up next to the stored totals, and the hair-width gap is shown.',
    code: `bills = pd.DataFrame({"order": [1, 2], "total": [9.0, 6.5]})
items = pd.DataFrame({"order": [1, 1, 2], "price": [4.5, 4.5, 5.0]})
bills["from_lines"] = bills["order"].map(items.groupby("order")["price"].sum())
print(0.1 + 0.2 == 0.3, abs(0.1 + 0.2 - 0.3) < 0.005)
bills`,
    lines: [
      ['items.groupby("order")["price"].sum()', 'each order\'s lines added up.'],
      ['.map(...)', 'puts each order\'s sum on its own row.'],
      ['0.1 + 0.2 == 0.3', 'False, by a hair. With an allowance, it is True.'],
    ],
  },
  brief: {
    story: 'The till and the receipt printer disagree, and the accountant wants to know which receipts.',
    get: [['The starter makes `receipts` (receipt, total), `lines` (receipt, item, price) and `sums`, each receipt\'s prices added up.']],
    want: ['`rebuilt`: a copy of `receipts` with `from_lines`, each receipt\'s lines added up', '`mismatched`: the rows where `total` and `from_lines` differ by more than 0.005'],
    out: '`mismatched` holds receipts 2 and 4.',
  },
},
'ms-13': {
  explain: [
    'An **outlier** is a value far away from the rest. It might be a typo, like an extra zero, or something real and important, like a huge catering order.',
    'So flag it, look at it, then decide. Never delete one without looking.',
    'A common yardstick uses **quartiles**: a quarter of the values sit below Q1, and a quarter sit above Q3.',
    'The gap between them, Q3 − Q1, is the **IQR**, which tells you how spread out the middle half is.',
    'Anything more than 1.5 × IQR below Q1, or above Q3, gets flagged.',
    'Quartiles barely move when one huge value turns up. The average jumps, which is why it makes a poor yardstick here.',
  ],
  example: {
    say: 'Here are some waiting times with one very long one, and how the average and the quartiles react.',
    code: `waits = pd.Series([3, 4, 4, 5, 5, 6, 7, 30])
q1, q3 = waits.quantile(0.25), waits.quantile(0.75)
print("Q1:", q1, " Q3:", q3, " IQR:", q3 - q1)
print("mean:", waits.mean(), " median:", waits.median())`,
    lines: [
      ['waits.quantile(0.25)', 'a quarter of the waits are below this.'],
      ['q3 - q1', 'the spread of the middle half, the IQR.'],
      ['waits.mean()', 'the one 30 pulls the average well above most waits. The median stays put.'],
    ],
  },
  brief: {
    story: 'One customer seems to have spent a fortune, and another almost nothing. Typos, or real?',
    get: [['The starter makes `spend`: twelve amounts.']],
    want: ['`q1` and `q3` with `.quantile`', '`iqr`: the gap between them', '`outliers`: the values below `q1 - 1.5 * iqr` or above `q3 + 1.5 * iqr`'],
    out: '`outliers` holds 0.5 and 135.0.',
  },
},
'ms-14': {
  explain: [
    'Typed-in names drift: "Lagoss", "Niarobi", "Kigalli". Stripping spaces and fixing capitals can\'t mend a spelling mistake.',
    '`difflib` is a toolkit that comes with Python for comparing pieces of text.',
    '`difflib.get_close_matches(word, choices, n=1, cutoff=0.8)` finds the choice that looks most like the word.',
    'It scores how alike two words are, from 0 to 1, and ignores anything under the cutoff. It gives back a list, which is empty when nothing is close enough.',
    'Match against a list of correct names, and put anything that matches nothing aside for a person to check.',
  ],
  example: {
    say: 'Here two typed drinks are matched against the menu, with a score for how alike they are.',
    code: `import difflib
drinks = ["latte", "mocha", "espresso"]
print(difflib.get_close_matches("expresso", drinks, n=1, cutoff=0.8))
print(difflib.get_close_matches("cocoa", drinks, n=1, cutoff=0.8))
print(round(difflib.SequenceMatcher(None, "expresso", "espresso").ratio(), 2))`,
    lines: [
      ['"expresso"', 'close enough to espresso, so a list holding it comes back.'],
      ['"cocoa"', 'nothing scores 0.8 or more, so an empty list.'],
      ['SequenceMatcher(...).ratio()', 'the score itself: how alike the two words are.'],
    ],
  },
  brief: {
    story: 'Branch names were typed in by hand, and the report needs them matched to the real four.',
    get: [['The starter makes `branches`, the four real names, and `typed`, eight names as people typed them.']],
    want: ['Write `fix(name)`: the closest branch to the name, stripped and in title case, with `cutoff=0.8`, or `None`', '`fixed`: `fix` applied to every name in `typed`', '`unmatched`: the typed names that came back as `None`'],
    out: '`unmatched` holds just London.',
  },
},
'ms-15': {
  explain: [
    'Before you share a dataset, or trust one, sum up its health in a few numbers.',
    'How many rows? How many exact repeats? How much is missing, and where?',
    '`df.duplicated().sum()` counts the repeated rows, and `df.isna().sum()` counts the gaps in each column.',
    '`.items()` gives you each column\'s name with its count, ready to loop over.',
    'Put the checks in a function and you can run the same report on every file that arrives, and compare this month\'s with last month\'s.',
  ],
  example: {
    say: 'Here the gaps in a small rota are listed, column by column.',
    code: `team = pd.DataFrame({"name": ["Ada", "Kofi", None], "shift": ["am", None, None]})
gaps = team.isna().sum()
for col, n in gaps.items():
    print(col, "has", n, "missing")`,
    lines: [
      ['team.isna().sum()', 'the number of gaps in each column.'],
      ['for col, n in gaps.items()', "goes through them, each column's name with its count."],
    ],
  },
  brief: {
    story: 'New sign-up files arrive every week, and the data lead wants a one-line health check for each.',
    get: [['The starter makes `signups`: six sign-ups, with some gaps and one repeat.']],
    want: ['`quality(df)` gives back a dict', '`"rows"`: how many', '`"duplicates"`: how many exact repeated rows', '`"missing"`: a dict of each column that has gaps, with how many', 'Then `report = quality(signups)`'],
    out: "`report` is `{'rows': 6, 'duplicates': 1, 'missing': {...}}`.",
    fine: ['Columns with no gaps stay out of `"missing"`.'],
  },
},
'ms-16': {
  explain: [
    'Older systems often export **fixed-width** text. There are no commas: each column just takes up a set number of characters, padded out with spaces.',
    'A comma reader can\'t split that, so everything lands in one column.',
    '`pd.read_fwf(file, widths=[...])` cuts every line at the widths you give.',
    'Count the widths from the heading line, or take them from the system\'s documentation.',
    '`io.StringIO(text)` makes a piece of text behave like a file, so you can try a reader without saving anything.',
  ],
  example: {
    say: 'Here two columns of 5 characters each are read.',
    code: `import io
text = """code name
A1   latte
B22  tea"""
pd.read_fwf(io.StringIO(text), widths=[5, 5])`,
    lines: [
      ['io.StringIO(text)', 'the text, treated as if it were a file.'],
      ['widths=[5, 5]', 'the first 5 characters of each line are code, the next 5 are name.'],
    ],
  },
  brief: {
    story: 'The old stock system can only export fixed-width text, and the café wants the takings.',
    get: [['The starter makes `text`: a header and four branches, in columns of fixed width.']],
    want: ['Read it into `stock` with `pd.read_fwf` and `widths=[10, 10, 4, 6]`', '`takings`: cups times price, added up'],
    out: '`stock` has four columns, and `takings` is 436.25.',
  },
},
'ms-17': {
  explain: [
    'Spreadsheets store a date as a count of days. Export one carelessly and 15 March 2024 turns up as `45366`.',
    'Excel counts from 30 December 1899, an old quirk kept so that ancient files still work.',
    '`pd.to_datetime(counts, unit="D", origin="1899-12-30")` turns the counts back into dates. `unit="D"` says they\'re days.',
    'A real date comes with handy extras, like `.day_name()` for the weekday.',
    'Take one date from another to get a gap, and `.days` turns the gap into a number.',
    'Always sanity-check the result. The dates should land somewhere sensible.',
  ],
  example: {
    say: 'Here two day counts are turned back into dates.',
    code: `print(pd.to_datetime(45292, unit="D", origin="1899-12-30"))
print(pd.to_datetime(1, unit="D", origin="1899-12-30"))`,
    lines: [
      ['45292', 'comes out as 1 January 2024.'],
      ['1', 'is one day after the starting point: 31 December 1899.'],
    ],
  },
  brief: {
    story: 'An order export arrived with numbers where the dates should be.',
    get: [['The starter makes `export`:', { order: 'the order', ordered: 'the order day, as a count of days' }]],
    want: ['Turn `export["ordered"]` into real dates, counted from Excel\'s starting day', '`weekday`: the day name of the first order', '`span`: the days from the first order to the last, as a number'],
    out: '`weekday` is Friday and `span` is 17.',
  },
},
'ms-18': {
  explain: [
    'Exports often wrap the table in extras: a title above it, and a Total row and a note below.',
    'Numbers may be written with commas too, like "5,580.00", which a reader takes as text.',
    '`skiprows=3` ignores the first 3 lines. `skipfooter=2` ignores the last 2, and needs `engine="python"` as well.',
    '`thousands=","` reads "5,580.00" as the number 5580.0.',
    'Fix it in the reader, not afterwards. It\'s fewer steps, and the numbers arrive as numbers. Then check your total against the file\'s own Total line.',
  ],
  example: {
    say: 'Here a title line is skipped, and a count with a comma in it is read as a number.',
    code: `import io
text = """Weekly stock
item,count
beans,"1,200"
cups,850"""
pd.read_csv(io.StringIO(text), skiprows=1, thousands=",")`,
    lines: [
      ['skiprows=1', 'skips the title, so the header row is item,count.'],
      ['thousands=","', '"1,200" is read as the number 1200.'],
    ],
  },
  brief: {
    story: 'The till system exports a branch report with a title, a total and a note wrapped around the table.',
    get: [['The starter makes `text`: two title lines, a blank line, the table, a Total row and a note.']],
    want: ['Read it into `report`, skipping the 3 lines above the header and the last 2 lines', 'The takings read as numbers', '`total`: the takings added up'],
    out: '`total` is 13461.75, the same as the Total line.',
  },
},
'ms-19': {
  explain: [
    'Data from websites and apps usually comes as **JSON**: dicts inside dicts, and lists inside those.',
    'A table needs it flat, with one value per cell.',
    '`pd.json_normalize(data)` flattens dicts inside dicts into columns with dotted names, like `customer.city`.',
    'For a list inside, `record_path="items"` makes one row per item in the list.',
    '`meta=[...]` copies fields from the outer record onto each of its rows. A field further in is written as a list: `["customer", "city"]`.',
  ],
  example: {
    say: 'Here a dict inside a dict is flattened, then a list inside an order becomes rows.',
    code: `person = [{"name": "Ada", "address": {"city": "Lagos", "street": "Marina"}}]
print(pd.json_normalize(person))
order = [{"id": 7, "items": [{"drink": "tea"}, {"drink": "latte"}]}]
pd.json_normalize(order, record_path="items", meta=["id"])`,
    lines: [
      ['pd.json_normalize(person)', 'the address dict becomes two columns, address.city and address.street.'],
      ['record_path="items"', 'one row per item: tea, then latte.'],
      ['meta=["id"]', "the order's id is copied onto both rows."],
    ],
  },
  brief: {
    story: 'The ordering app sends its orders as nested JSON, and finance wants takings by city.',
    get: [['The starter makes `feed`: three orders, each with a customer and a list of items (drink, qty, price).']],
    want: ["`items`: one row per item, carrying the order's `id` and the customer's city", '`cost`: qty times price', '`by_city`: the cost added up for each city'],
    out: '`by_city` is Accra 8.25 and Lagos 21.75.',
  },
},
'ms-20': {
  explain: [
    'Clean data can still be the wrong data. **Data fit** asks whether it can actually answer your question.',
    'Does it cover the right dates? Every branch? Enough rows?',
    'Gaps are easy to miss, because a missing day simply isn\'t there. Nothing marks it.',
    'So build the full list you expected with `pd.date_range(start, end)`, and compare.',
    '`expected.difference(actual)` gives you what should be there but isn\'t.',
    'Report the gaps alongside your result, so nobody mistakes "no data" for "no sales".',
  ],
  example: {
    say: 'Here a week is checked against the days a stall actually opened.',
    code: `week = pd.date_range("2024-03-04", "2024-03-10")
open_days = pd.to_datetime(["2024-03-04", "2024-03-05", "2024-03-07"])
print(len(week), "days expected")
week.difference(open_days)`,
    lines: [
      ['pd.date_range(...)', 'every day from 4 to 10 March: seven days.'],
      ['week.difference(open_days)', 'the four days with nothing recorded.'],
    ],
  },
  brief: {
    story: 'The owner asks for March sales so far. Before answering, you check what the data actually covers.',
    get: [['The starter makes `sales`:', { day: 'a day in 1 to 14 March 2024', cups: 'cups sold that day' }]],
    want: ['`expected`: every day from 1 to 14 March 2024', '`missing`: the days in `expected` that aren\'t in `sales["day"]`', '`coverage`: the share of the expected days that have sales'],
    out: '`missing` is 4, 8, 9 and 13 March, and `coverage` is 10 out of 14.',
  },
},
};
