/* NumPy — the arrays under pandas and every machine learning library.
   Plain arrays first, then shapes and axes, then the everyday tools.
   Every lesson uses data already loaded: cafe and marks, as arrays. */

export const NUMPY = [

/* ── Arrays ────────────────────────────────────────────── */
{
  id: 'np-01', mins: 3,
  title: 'A list that does maths',
  concept: [
    '**NumPy** is the Python toolkit for numbers in bulk. It is already loaded as `np`, and pandas is built on top of it.',
    "Its basic thing is an **array**: `np.array([2.5, 3.0, 4.2])`. It looks like a list, but maths on it happens to every value at once.",
    'A list times 2 repeats the list. An array times 2 doubles every number. That is the whole point.',
  ],
  starter: `prices = [2.5, 3.0, 4.2, 3.8]
prices * 2`,
  task: 'Make `prices` an array, then make `with_vat`: every price with 20% added (times 1.2), rounded to 2 places with `np.round`.',
  hint: '`prices = np.array([2.5, 3.0, 4.2, 3.8])`, then `with_vat = np.round(prices * 1.2, 2)`.',
  solution: `prices = np.array([2.5, 3.0, 4.2, 3.8])
with_vat = np.round(prices * 1.2, 2)

with_vat`,
  check: `assert isinstance(globals().get("prices"), np.ndarray), "Make prices an array: np.array([...])."
assert isinstance(globals().get("with_vat"), np.ndarray), "Make with_vat from the array, so it is an array too."
assert np.allclose(with_vat, [3.0, 3.6, 5.04, 4.56]), "with_vat is every price times 1.2, rounded to 2 places."`,
},
{
  id: 'np-02', mins: 3,
  title: 'From a column to an array',
  concept: [
    '`cafe["cups"].to_numpy()` turns a pandas column into a plain NumPy array of its values.',
    '`.size` is how many values it holds, and `.dtype` what kind they are: whole numbers (int) or decimals (float). An array holds one kind only.',
    'Arrays can summarise themselves, like columns: `.sum()`, `.mean()`, `.max()`, `.min()`.',
  ],
  starter: `cups = cafe["cups"]
cups.head()`,
  task: 'Make `cups` an array from the `cups` column. Then set `how_many` (how many values it holds) and `biggest` (its largest value).',
  hint: '`cups = cafe["cups"].to_numpy()`, then `how_many = cups.size` and `biggest = cups.max()`.',
  solution: `cups = cafe["cups"].to_numpy()
how_many = cups.size
biggest = cups.max()

how_many, biggest`,
  check: `assert isinstance(globals().get("cups"), np.ndarray), "Make cups an array with .to_numpy()."
assert int(how_many) == len(cafe), "how_many is the number of values: cups.size."
assert int(biggest) == int(cafe["cups"].max()), "biggest is the largest value: cups.max()."`,
},
{
  id: 'np-03', mins: 3,
  title: 'Ask every value at once',
  concept: [
    '`cups > 40` asks the question of every value and gives an array of True and False, the same length.',
    'Put that inside the brackets, `cups[cups > 40]`, and you keep only the values that said True.',
    'True counts as 1 and False as 0, so `(cups > 40).sum()` counts them and `(cups > 40).mean()` is the share.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
cups > 40`,
  task: 'Make `busy`: just the cups values over 40. Then set `share_busy`: the share of days over 40, rounded to 3 places.',
  hint: '`busy = cups[cups > 40]` and `share_busy = round(float((cups > 40).mean()), 3)`.',
  solution: `cups = cafe["cups"].to_numpy()
busy = cups[cups > 40]
share_busy = round(float((cups > 40).mean()), 3)

share_busy`,
  check: `_c = cafe["cups"].to_numpy()
assert isinstance(globals().get("busy"), np.ndarray) and (busy > 40).all() and len(busy) == int((_c > 40).sum()), "busy keeps exactly the values over 40: cups[cups > 40]."
assert abs(float(share_busy) - round(float((_c > 40).mean()), 3)) < 1e-9, "share_busy is (cups > 40).mean(), rounded to 3 places."`,
},
{
  id: 'np-04', mins: 3,
  title: 'Ranges and evenly spaced steps',
  concept: [
    '`np.arange(start, stop, step)` counts up in steps and stops **before** stop, like Python\'s range, but steps can be decimals.',
    '`np.linspace(start, stop, n)` gives exactly n evenly spaced numbers, and includes both ends.',
    'Use arange when you know the step, linspace when you know how many you want.',
  ],
  starter: `np.arange(0, 10, 2)`,
  task: 'Make `steps`: prices from 2.0 to 5.0 in steps of 0.5, including 5.0. Then make `marks_at`: 5 evenly spaced numbers from 0 to 100.',
  hint: 'arange stops before its stop, so go a step past: `np.arange(2.0, 5.5, 0.5)`. Then `np.linspace(0, 100, 5)`.',
  solution: `steps = np.arange(2.0, 5.5, 0.5)
marks_at = np.linspace(0, 100, 5)

steps, marks_at`,
  check: `assert np.allclose(globals().get("steps", []), [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]), "steps runs 2.0, 2.5 ... 5.0. arange stops before its stop, so set it to 5.5."
assert np.allclose(globals().get("marks_at", []), [0, 25, 50, 75, 100]), "marks_at is 0, 25, 50, 75, 100: np.linspace(0, 100, 5)."`,
},
{
  id: 'np-05', mins: 4,
  title: 'Quartiles in one call',
  concept: [
    '`np.percentile(cups, 75)` is the value three quarters of the way up the sorted values. 50 is the median.',
    'Give it a list, `np.percentile(cups, [25, 50, 75])`, and you get all three quartiles in one array.',
    'The gap between the 75th and 25th is the **interquartile range**: how spread out the middle half is, untouched by a few extreme days.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
cups.mean()`,
  task: 'Make `quartiles`: the 25th, 50th and 75th percentiles of cups. Then set `middle_spread`: the 75th minus the 25th.',
  hint: '`quartiles = np.percentile(cups, [25, 50, 75])`, then `middle_spread = quartiles[2] - quartiles[0]`.',
  solution: `cups = cafe["cups"].to_numpy()
quartiles = np.percentile(cups, [25, 50, 75])
middle_spread = quartiles[2] - quartiles[0]

quartiles, middle_spread`,
  check: `_q = np.percentile(cafe["cups"].to_numpy(), [25, 50, 75])
assert np.allclose(globals().get("quartiles", []), _q), "quartiles is np.percentile(cups, [25, 50, 75])."
assert abs(float(middle_spread) - float(_q[2] - _q[0])) < 1e-9, "middle_spread is the 75th percentile minus the 25th."`,
},

/* ── Shapes and axes ───────────────────────────────────── */
{
  id: 'np-06', mins: 4,
  title: 'Two dimensions',
  concept: [
    'Several columns at once, `cafe[["cups", "price", "revenue"]].to_numpy()`, make a **2D array**: rows and columns, like a table with no names.',
    '`.shape` gives (rows, columns). Pick one value with `grid[row, column]`, counting from 0.',
    '`:` means "all of them": `grid[0]` is the first row, and `grid[:, 1]` is every row of column 1, here the price.',
  ],
  starter: `grid = cafe[["cups", "price", "revenue"]].to_numpy()
grid.shape`,
  task: 'From `grid`, make `first_day` (the first row) and `prices` (the whole price column, column 1).',
  hint: '`first_day = grid[0]` and `prices = grid[:, 1]`.',
  solution: `grid = cafe[["cups", "price", "revenue"]].to_numpy()
first_day = grid[0]
prices = grid[:, 1]

first_day, prices[:5]`,
  check: `_g = cafe[["cups", "price", "revenue"]].to_numpy()
assert np.allclose(globals().get("first_day", []), _g[0]), "first_day is the first row: grid[0]."
assert np.shape(globals().get("prices", [])) == (len(cafe),) and np.allclose(prices, _g[:, 1]), "prices is every row of column 1: grid[:, 1]."`,
},
{
  id: 'np-07', mins: 4,
  title: 'Down or across: axis',
  concept: [
    'On a 2D array, `.mean()` alone averages everything into one number. `axis` says which way to go.',
    '`axis=0` works **down** the rows, one answer per column. `axis=1` works **across** the columns, one answer per row.',
    'With students in rows and subjects in columns, axis=0 gives each subject\'s average and axis=1 each student\'s.',
  ],
  starter: `scores = marks[["maths", "physics", "history"]].to_numpy()
scores.mean()`,
  task: 'Make `per_subject` (the average of each column) and `per_student` (the average of each row) from `scores`.',
  hint: '`per_subject = scores.mean(axis=0)` and `per_student = scores.mean(axis=1)`.',
  solution: `scores = marks[["maths", "physics", "history"]].to_numpy()
per_subject = scores.mean(axis=0)
per_student = scores.mean(axis=1)

per_subject, per_student`,
  check: `_s = marks[["maths", "physics", "history"]].to_numpy()
assert np.allclose(globals().get("per_subject", []), _s.mean(axis=0)), "per_subject has one average per column: axis=0."
assert np.allclose(globals().get("per_student", []), _s.mean(axis=1)), "per_student has one average per row: axis=1."`,
},
{
  id: 'np-08', mins: 4,
  title: 'Fold it into weeks',
  concept: [
    '`.reshape(rows, columns)` lays the same values out in a new shape, row by row. The counts must match: 119 values fold into 17 rows of 7.',
    'Use `-1` for one of them and NumPy works it out: `.reshape(-1, 7)` is "rows of 7, as many as it takes".',
    'Days folded into weeks, then summed across each row with `axis=1`, gives weekly totals without a single loop.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
cups[:119].shape`,
  task: 'Fold the first 119 days of cups into `weeks`, one row of 7 days per week. Then make `weekly`: the total for each week.',
  hint: '`weeks = cups[:119].reshape(-1, 7)` (or `(17, 7)`), then `weekly = weeks.sum(axis=1)`.',
  solution: `cups = cafe["cups"].to_numpy()
weeks = cups[:119].reshape(-1, 7)
weekly = weeks.sum(axis=1)

weekly`,
  check: `_w = cafe["cups"].to_numpy()[:119].reshape(17, 7)
assert np.shape(globals().get("weeks", [])) == (17, 7), "weeks should be 17 rows of 7: cups[:119].reshape(-1, 7)."
assert np.array_equal(weeks, _w), "Fold the days in order, the first 7 in row one."
assert np.array_equal(globals().get("weekly", []), _w.sum(axis=1)), "weekly sums across each row: weeks.sum(axis=1)."`,
},
{
  id: 'np-09', mins: 5,
  title: 'Broadcasting: one row against many',
  concept: [
    'Take a (8, 3) array minus a 3-value array, and NumPy repeats the short one down every row. That stretching is called **broadcasting**.',
    'So `scores - scores.mean(axis=0)` takes each subject\'s own average away from its own column, in one line.',
    'Divide by `scores.std(axis=0)` too and you have **z-scores**: how far each mark is from its subject\'s average, in standard deviations. Now a 70 in a hard subject can be compared with a 70 in an easy one.',
  ],
  starter: `scores = marks[["maths", "physics", "history"]].to_numpy()
scores.mean(axis=0)`,
  task: "Make `z`: every mark's z-score within its own subject: the mark minus that column's mean, divided by that column's standard deviation.",
  hint: '`z = (scores - scores.mean(axis=0)) / scores.std(axis=0)`',
  solution: `scores = marks[["maths", "physics", "history"]].to_numpy()
z = (scores - scores.mean(axis=0)) / scores.std(axis=0)

z.round(2)`,
  check: `_s = marks[["maths", "physics", "history"]].to_numpy()
assert np.shape(globals().get("z", [])) == _s.shape, "z keeps the shape of scores: one z-score per mark."
assert np.allclose(z.mean(axis=0), 0) and np.allclose(z.std(axis=0), 1), "Each column of z should average 0 with a spread of 1: take away the column mean, divide by the column std."
assert np.allclose(z, (_s - _s.mean(axis=0)) / _s.std(axis=0)), "Use each column's own mean and std (axis=0)."`,
},
{
  id: 'np-10', mins: 3,
  title: 'Join arrays together',
  concept: [
    '`np.concatenate([a, b])` puts one array after the other, making a longer one.',
    '`np.column_stack([a, b])` puts arrays side by side as columns, so two 120-value arrays become a (120, 2) table.',
    'Arrays have to agree: the same length to stand side by side.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
price = cafe["price"].to_numpy()
cups[:3], price[:3]`,
  task: 'Make `jan_feb`: the first 31 days of cups followed by the next 29 (days 31 to 59). Then make `pairs`: cups and price side by side as two columns.',
  hint: '`jan_feb = np.concatenate([cups[:31], cups[31:60]])` and `pairs = np.column_stack([cups, price])`.',
  solution: `cups = cafe["cups"].to_numpy()
price = cafe["price"].to_numpy()
jan_feb = np.concatenate([cups[:31], cups[31:60]])
pairs = np.column_stack([cups, price])

pairs.shape`,
  check: `_c = cafe["cups"].to_numpy()
_p = cafe["price"].to_numpy()
assert np.array_equal(globals().get("jan_feb", []), _c[:60]), "jan_feb is cups[:31] followed by cups[31:60]: np.concatenate."
assert np.shape(globals().get("pairs", [])) == (len(cafe), 2) and np.allclose(pairs, np.column_stack([_c, _p])), "pairs has cups in column 0 and price in column 1: np.column_stack."`,
},

/* ── NumPy at work ─────────────────────────────────────── */
{
  id: 'np-11', mins: 4,
  title: 'Three or more choices: select',
  concept: [
    '`np.where(test, a, b)` picks between two answers. For more, `np.select([test1, test2], [answer1, answer2], default=...)`.',
    'select tries the tests in order and takes the first that is true, then falls back to the default.',
    'So `np.select([cups < 20, cups < 40], ["quiet", "steady"], default="busy")` labels every day at once.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
np.where(cups < 20, "quiet", "not quiet")[:6]`,
  task: 'Make `size`: "quiet" under 20 cups, "steady" under 40, "busy" otherwise. Then set `n_busy`: how many busy days.',
  hint: '`size = np.select([cups < 20, cups < 40], ["quiet", "steady"], default="busy")` and `n_busy = (size == "busy").sum()`.',
  solution: `cups = cafe["cups"].to_numpy()
size = np.select([cups < 20, cups < 40], ["quiet", "steady"], default="busy")
n_busy = (size == "busy").sum()

n_busy`,
  check: `_c = cafe["cups"].to_numpy()
_want = np.where(_c < 20, "quiet", np.where(_c < 40, "steady", "busy"))
assert np.shape(globals().get("size", [])) == _c.shape and all(str(a) == str(b) for a, b in zip(size, _want)), "Label every day: quiet under 20, steady under 40, busy otherwise. Put the tests in that order."
assert int(n_busy) == int((_c >= 40).sum()), "n_busy counts the busy days: (size == 'busy').sum()."`,
},
{
  id: 'np-12', mins: 4,
  title: 'Where is the biggest?',
  concept: [
    '`np.argmax(revenue)` gives the **position** of the biggest value, not the value itself. argmin does the smallest.',
    'A position picks the matching row anywhere else: `cafe["date"].iloc[np.argmax(revenue)]` is the best day\'s date.',
    '`np.argsort(revenue)` gives every position in order, smallest first. Reverse it with `[::-1]` and take the first three for a top three.',
  ],
  starter: `revenue = cafe["revenue"].to_numpy()
revenue.max()`,
  task: 'Set `best_day`: the date of the highest revenue. Then make `top3`: the positions of the three highest revenues, biggest first.',
  hint: '`best_day = cafe["date"].iloc[np.argmax(revenue)]` and `top3 = np.argsort(revenue)[::-1][:3]`.',
  solution: `revenue = cafe["revenue"].to_numpy()
best_day = cafe["date"].iloc[np.argmax(revenue)]
top3 = np.argsort(revenue)[::-1][:3]

best_day, top3`,
  check: `_r = cafe["revenue"].to_numpy()
assert pd.Timestamp(globals().get("best_day")) == cafe["date"].iloc[int(np.argmax(_r))], "best_day is the date at np.argmax(revenue)."
assert list(np.asarray(globals().get("top3", []))) == list(np.argsort(_r)[::-1][:3]), "top3 is the three positions with the highest revenue, biggest first."`,
},
{
  id: 'np-13', mins: 4,
  title: 'Random, but repeatable',
  concept: [
    '`rng = np.random.default_rng(42)` makes a random number generator. The 42 is the **seed**: the same seed gives the same "random" numbers every time, so results can be checked.',
    '`rng.integers(1, 7, size=1000)` is 1,000 dice rolls (1 up to, not including, 7). `rng.normal(0, 1, 1000)` draws from a bell curve.',
    'Simulating thousands of tries is how you get a feel for chance, and it is how many statistics are worked out in practice.',
  ],
  starter: `rng = np.random.default_rng(42)
rng.integers(1, 7, size=10)`,
  task: 'With a generator seeded 42, make `rolls`: 1,000 dice rolls. Then set `share_six`: the share of rolls that came up 6.',
  hint: '`rng = np.random.default_rng(42)`, `rolls = rng.integers(1, 7, size=1000)`, then `share_six = (rolls == 6).mean()`.',
  solution: `rng = np.random.default_rng(42)
rolls = rng.integers(1, 7, size=1000)
share_six = (rolls == 6).mean()

share_six`,
  check: `_r = np.random.default_rng(42).integers(1, 7, size=1000)
assert np.shape(globals().get("rolls", [])) == (1000,) and set(np.unique(rolls)) <= {1, 2, 3, 4, 5, 6}, "rolls is 1,000 dice rolls: rng.integers(1, 7, size=1000)."
assert np.array_equal(rolls, _r), "Seed the generator with 42 and draw the rolls straight after, so they match."
assert abs(float(share_six) - float((_r == 6).mean())) < 1e-9, "share_six is (rolls == 6).mean()."`,
},
{
  id: 'np-14', mins: 4,
  title: 'No loop needed',
  concept: [
    'A Python loop handles one value at a time. NumPy runs the same sum over the whole array in fast compiled code. This is called **vectorising**.',
    'On 120 rows you will not notice. On 10 million, the loop takes minutes and the array takes moments.',
    'Most loops over numbers turn into one line: maths on arrays, plus `np.where` for the "if".',
  ],
  starter: `cups = cafe["cups"].to_numpy()
revenue = cafe["revenue"].to_numpy()
discounted = []
for c, r in zip(cups, revenue):
    if c > 40:
        discounted.append(r * 0.9)
    else:
        discounted.append(r)
discounted[:5]`,
  task: 'Do the same without a loop: make `discounted` an array with 10% off the revenue on days over 40 cups, and the revenue unchanged on other days.',
  hint: '`discounted = np.where(cups > 40, revenue * 0.9, revenue)`',
  solution: `cups = cafe["cups"].to_numpy()
revenue = cafe["revenue"].to_numpy()
discounted = np.where(cups > 40, revenue * 0.9, revenue)

discounted[:5]`,
  check: `_c = cafe["cups"].to_numpy()
_r = cafe["revenue"].to_numpy()
assert isinstance(globals().get("discounted"), np.ndarray), "Make discounted an array, with np.where rather than a loop."
assert np.allclose(discounted, np.where(_c > 40, _r * 0.9, _r)), "Take 10% off the revenue on days over 40 cups; leave the rest as they are."`,
},
{
  id: 'np-15', mins: 4,
  title: 'Weighted totals: the dot product',
  concept: [
    "A course grade might count maths 50%, physics 30% and history 20%. Each student's grade is each mark times its weight, all added up.",
    '`scores @ weights` does exactly that for every student at once. `@` is matrix multiplication, also written `np.dot`.',
    'This one operation, multiply-and-add, is the heart of linear regression and of every neural network.',
  ],
  starter: `scores = marks[["maths", "physics", "history"]].to_numpy()
weights = np.array([0.5, 0.3, 0.2])
scores[0], weights`,
  task: "Make `grade`: each student's weighted grade, `scores @ weights`. Then set `top`: the position of the student with the highest grade.",
  hint: '`grade = scores @ weights` and `top = int(np.argmax(grade))`.',
  solution: `scores = marks[["maths", "physics", "history"]].to_numpy()
weights = np.array([0.5, 0.3, 0.2])
grade = scores @ weights
top = int(np.argmax(grade))

grade, marks["student_id"].iloc[top]`,
  check: `_s = marks[["maths", "physics", "history"]].to_numpy()
_g = _s @ np.array([0.5, 0.3, 0.2])
assert np.shape(globals().get("grade", [])) == (len(marks),) and np.allclose(grade, _g), "grade is scores @ weights: one weighted grade per student."
assert int(top) == int(np.argmax(_g)), "top is the position of the highest grade: np.argmax(grade)."`,
},
];
