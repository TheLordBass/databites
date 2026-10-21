/* NumPy (np-01 to np-15): the fuller teaching, a worked example and the task
   as a brief (see detail/index.js). Examples use a few numbers made on the
   spot, so the idea is plain and the task's answer stays hidden. */

const CAFE = ['`cafe` has one row per day, 120 days, with `cups`, `price` and `revenue` among its columns.'];
const MARKS = ['`marks` has one row per student, 8 students, with a column each for `maths`, `physics` and `history`.'];

export const NUMPY_DETAIL = {
'np-01': {
  explain: [
    '**NumPy** is Python\'s toolkit for working with lots of numbers at once. It\'s already loaded as `np`, and pandas is built on top of it.',
    'Its basic building block is an **array**: `np.array([2.5, 3.0, 4.2])`.',
    'It looks like a list, but maths on it happens to every value at once.',
    'Here\'s the difference: a list times 2 repeats the list, while an array times 2 doubles every number.',
    '`np.round(arr, 2)` rounds every value to 2 places.',
  ],
  example: {
    say: 'Here the same three numbers get added to, first as a list, then as an array.',
    code: `nums = [1, 2, 3]
print(nums + [10])
arr = np.array(nums)
print(arr + 10)`,
    lines: [
      ['nums + [10]', 'a list joined to a list: 10 is tacked on the end.'],
      ['arr + 10', 'an array: 10 is added to every value.'],
    ],
  },
  brief: {
    story: 'The menu board needs every price with VAT added.',
    get: [['The starter sets `prices`: a list of four prices.']],
    want: ['Make `prices` an array', '`with_vat`: every price times 1.2, rounded to 2 places with `np.round`'],
    out: '`with_vat` is an array of four prices.',
  },
},
'np-02': {
  explain: [
    '`cafe["cups"].to_numpy()` turns a pandas column into a plain NumPy array of its values.',
    '`.size` tells you how many values it holds.',
    '`.dtype` tells you what kind they are: whole numbers (int) or decimals (float). An array only ever holds one kind.',
    'Arrays can sum themselves up, just like columns: `.sum()`, `.mean()`, `.max()`, `.min()`.',
  ],
  example: {
    say: 'Here the price column becomes an array, and describes itself.',
    code: `price = cafe["price"].to_numpy()
print(price.size, price.dtype)
print(price.min(), price.max())`,
    lines: [
      ['.to_numpy()', 'just the values, no row labels.'],
      ['price.size, price.dtype', '120 values, all decimals (float).'],
    ],
  },
  brief: {
    story: 'An engineer wants the cups as a plain array for a faster calculation.',
    get: [CAFE],
    want: ['Make `cups` an array from the `cups` column', '`how_many`: how many values it holds', '`biggest`: its largest value'],
    out: 'An array and two numbers.',
  },
},
'np-03': {
  explain: [
    '`cups > 40` asks the question of every value and gives back an array of True and False, the same length.',
    'Put that inside the brackets, `cups[cups > 40]`, and you keep only the values that said True.',
    'True counts as 1 and False as 0.',
    'So `(cups > 40).sum()` counts them, and `(cups > 40).mean()` is the share.',
    'Combine questions with `&` (and) and `|` (or), each one in its own brackets.',
  ],
  example: {
    say: 'Here five numbers are asked one question, then filtered, counted and given a share.',
    code: `a = np.array([5, 12, 8, 20, 3])
print(a > 7)
print(a[a > 7])
print((a > 7).sum(), (a > 7).mean())`,
    lines: [
      ['a > 7', 'True or False for each value.'],
      ['a[a > 7]', 'just 12, 8 and 20.'],
      ['.sum(), .mean()', '3 of them: a share of 0.6.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know how often the café is busy.',
    get: [CAFE],
    want: ['`busy`: just the cups values over 40', '`share_busy`: the share of days over 40, rounded to 3 places'],
    out: 'An array and a share.',
  },
},
'np-04': {
  explain: [
    '`np.arange(start, stop, step)` counts up in steps and stops **before** stop, just like Python\'s range.',
    'Unlike range, though, the steps can be decimals.',
    'To include the end, set stop a little way past it.',
    '`np.linspace(start, stop, n)` gives exactly n evenly spaced numbers, and includes both ends.',
    'Use arange when you know the step, and linspace when you know how many you want.',
  ],
  example: {
    say: 'Here the same range is made both ways.',
    code: `print(np.arange(1, 2, 0.25))
print(np.linspace(1, 2, 5))`,
    lines: [
      ['np.arange(1, 2, 0.25)', 'steps of 0.25, stopping before 2.'],
      ['np.linspace(1, 2, 5)', 'five numbers from 1 to 2, both ends included.'],
    ],
  },
  brief: {
    story: 'The owner wants a price ladder to test, and five marks for a scale.',
    get: [['Nothing to load.']],
    want: ['`steps`: prices from 2.0 to 5.0 in steps of 0.5, including 5.0', '`marks_at`: 5 evenly spaced numbers from 0 to 100'],
    out: 'Two arrays.',
  },
},
'np-05': {
  explain: [
    '`np.percentile(values, 75)` is the value three quarters of the way up the sorted values.',
    'The 50th percentile is the median.',
    'Hand it a list, `np.percentile(values, [25, 50, 75])`, and you get all three quartiles in one array.',
    'The gap between the 75th and the 25th is the **interquartile range**.',
    'It shows how spread out the middle half is, without a few extreme days pushing it around.',
  ],
  example: {
    say: 'Here the quartiles of eight numbers are found in a single call.',
    code: `a = np.array([1, 2, 3, 4, 5, 6, 7, 100])
np.percentile(a, [25, 50, 75])`,
    lines: [
      ['[25, 50, 75]', 'three percentiles at once.'],
      ['the 100', 'barely moves them: the middle half still runs from about 3 to 6.'],
    ],
  },
  brief: {
    story: 'The planner wants a quick picture of a typical day\'s cups, ignoring the odd extreme.',
    get: [CAFE],
    want: ['`quartiles`: the 25th, 50th and 75th percentiles of cups', '`middle_spread`: the 75th minus the 25th'],
    out: 'An array of three, and one number.',
  },
},
'np-06': {
  explain: [
    'Several columns at once, `cafe[["cups", "price", "revenue"]].to_numpy()`, make a **2D array**: rows and columns, like a table without names.',
    '`.shape` gives you (rows, columns).',
    'Pick one value with `grid[row, column]`, counting from 0.',
    '`:` means "all of them", so `grid[0]` is the first row, and `grid[:, 1]` is every row of column 1.',
  ],
  example: {
    say: 'Here a small 2D array is picked apart.',
    code: `g = np.array([[1, 2, 3], [4, 5, 6]])
print(g.shape)
print(g[1, 2])
print(g[:, 0])`,
    lines: [
      ['g.shape', '(2, 3): two rows, three columns.'],
      ['g[1, 2]', 'row 1, column 2: 6.'],
      ['g[:, 0]', 'every row of column 0: 1 and 4.'],
    ],
  },
  brief: {
    story: 'A model needs the numbers as a grid, and you want to check it.',
    get: [CAFE, ['The starter makes `grid`: cups, price and revenue as a 2D array.']],
    want: ['`first_day`: the first row', '`prices`: the whole price column, column 1'],
    out: 'Two arrays: 3 values, and 120.',
  },
},
'np-07': {
  explain: [
    'On a 2D array, `.mean()` on its own averages everything into one number.',
    '`axis` tells it which way to go.',
    '`axis=0` works **down** the rows, giving one answer per column.',
    '`axis=1` works **across** the columns, giving one answer per row.',
    'So with students in rows and subjects in columns, axis=0 gives each subject\'s average and axis=1 gives each student\'s.',
  ],
  example: {
    say: 'Here a 2 by 3 array is added up three different ways.',
    code: `g = np.array([[1, 2, 3], [4, 5, 6]])
print(g.sum())
print(g.sum(axis=0))
print(g.sum(axis=1))`,
    lines: [
      ['g.sum()', 'everything: 21.'],
      ['axis=0', 'down each column: 5, 7, 9.'],
      ['axis=1', 'across each row: 6 and 15.'],
    ],
  },
  brief: {
    story: 'The school wants each subject\'s average and each student\'s.',
    get: [MARKS, ['The starter makes `scores`: the three subjects as a 2D array.']],
    want: ['`per_subject`: the average of each column', '`per_student`: the average of each row'],
    out: 'Two arrays: 3 values, and 8.',
  },
},
'np-08': {
  explain: [
    '`.reshape(rows, columns)` lays the same values out in a new shape, row by row.',
    'The counts have to match. 12 values fold neatly into 3 rows of 4, but not into 5 rows.',
    'Use `-1` for one of them and NumPy works it out for you, so `.reshape(-1, 7)` means "rows of 7, as many as it takes".',
    'Fold days into weeks, then sum across each row with `axis=1`, and you\'ve got weekly totals without a single loop.',
  ],
  example: {
    say: 'Here twelve numbers are folded into rows of four, then each row is added up.',
    code: `a = np.arange(1, 13)
rows = a.reshape(-1, 4)
print(rows)
print(rows.sum(axis=1))`,
    lines: [
      ['reshape(-1, 4)', 'rows of 4: three of them.'],
      ['sum(axis=1)', 'each row\'s total: 10, 26 and 42.'],
    ],
  },
  brief: {
    story: 'The owner wants weekly totals, and there is no date column to group by.',
    get: [CAFE],
    want: ['`weeks`: the first 119 days of cups, one row of 7 days per week', '`weekly`: the total for each week'],
    out: '`weeks` is 17 by 7, and `weekly` has 17 totals.',
  },
},
'np-09': {
  explain: [
    'Take a 3-value array away from an (8, 3) array, and NumPy repeats the short one down every row.',
    'That stretching is called **broadcasting**.',
    'So `scores - scores.mean(axis=0)` takes each subject\'s own average away from its own column, in one line.',
    'Divide by `scores.std(axis=0)` too and you\'ve got **z-scores**: how far each mark sits from its subject\'s average, in standard deviations.',
    'Now a 70 in a hard subject can be fairly compared with a 70 in an easy one.',
  ],
  example: {
    say: 'Here one row of three numbers is taken away from every row of a grid.',
    code: `g = np.array([[1, 2, 3], [4, 5, 6]])
g - np.array([1, 2, 3])`,
    lines: [
      ['np.array([1, 2, 3])', 'one row, stretched down both rows of g.'],
      ['the result', 'the first row becomes all 0, the second all 3.'],
    ],
  },
  brief: {
    story: 'The school wants marks that can be compared across subjects.',
    get: [MARKS, ['The starter makes `scores`.']],
    want: ["`z`: every mark's z-score within its own subject: the mark minus that column's mean, divided by that column's standard deviation"],
    out: '`z` is 8 by 3, and each column averages 0.',
  },
},
'np-10': {
  explain: [
    '`np.concatenate([a, b])` puts one array after the other, making a longer one.',
    '`np.column_stack([a, b])` stands arrays side by side as columns.',
    'So two 120-value arrays become a (120, 2) table.',
    'The arrays have to agree, so they need the same length to stand side by side.',
    'Slices pick out the parts: `a[31:60]` is positions 31 up to, but not including, 60.',
  ],
  example: {
    say: 'Here two short arrays are joined end to end, then side by side.',
    code: `a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
print(np.concatenate([a, b]))
print(np.column_stack([a, b]))`,
    lines: [
      ['np.concatenate', 'six values in a row.'],
      ['np.column_stack', 'three rows of two: a beside b.'],
    ],
  },
  brief: {
    story: 'An analyst wants January and February together, and cups beside price for a model.',
    get: [CAFE],
    want: ['`jan_feb`: the first 31 days of cups followed by the next 29', '`pairs`: cups and price side by side as two columns'],
    out: '`jan_feb` has 60 values, and `pairs` is 120 by 2.',
  },
},
'np-11': {
  explain: [
    '`np.where(test, a, b)` picks between two answers, value by value.',
    'For more than two, use `np.select([test1, test2], [answer1, answer2], default=...)`.',
    'select tries the tests in order and takes the first one that\'s true.',
    'If none of them is true, you get the default.',
    'So order matters. Put the narrowest test first.',
  ],
  example: {
    say: 'Here five temperatures each get one of three words.',
    code: `t = np.array([2, 15, 28, 9, 31])
np.select([t < 10, t < 25], ["cold", "mild"], default="hot")`,
    lines: [
      ['t < 10', 'tried first: 2 and 9 are cold.'],
      ['t < 25', 'only reached if the first failed: 15 is mild.'],
      ['default="hot"', 'the rest: 28 and 31.'],
    ],
  },
  brief: {
    story: 'The rota planner wants three kinds of day.',
    get: [CAFE],
    want: ['`size`: "quiet" under 20 cups, "steady" under 40, "busy" otherwise', '`n_busy`: how many busy days'],
    out: 'An array of 120 words, and a count.',
  },
},
'np-12': {
  explain: [
    '`np.argmax(values)` gives the **position** of the biggest value, not the value itself. `np.argmin` does the smallest.',
    'A position lets you pick the matching row anywhere else: `cafe["date"].iloc[position]`.',
    '`np.argsort(values)` gives every position in order, smallest first.',
    'Flip it with `[::-1]` for biggest first.',
    'Then `[:3]` takes the first three, for a top three.',
  ],
  example: {
    say: 'Here five numbers give up the position of their biggest, and their order.',
    code: `a = np.array([30, 10, 50, 20, 40])
print(np.argmax(a))
print(np.argsort(a))
print(np.argsort(a)[::-1][:2])`,
    lines: [
      ['np.argmax(a)', '2: the 50 is at position 2.'],
      ['np.argsort(a)', 'positions from the smallest value to the biggest.'],
      ['[::-1][:2]', 'reversed, first two: positions 2 and 4.'],
    ],
  },
  brief: {
    story: 'The owner wants the best day, and the top three days.',
    get: [CAFE],
    want: ['`best_day`: the date of the highest revenue', '`top3`: the positions of the three highest revenues, biggest first'],
    out: 'A date and three positions.',
  },
},
'np-13': {
  explain: [
    '`rng = np.random.default_rng(42)` makes a random number generator.',
    'The 42 is the **seed**. The same seed gives the same "random" numbers every time, so results can be checked.',
    '`rng.integers(1, 7, size=1000)` is 1,000 dice rolls: 1 up to, but not including, 7.',
    '`rng.normal(0, 1, 1000)` draws 1,000 numbers from a bell curve.',
    'Simulating thousands of tries is a great way to get a feel for chance.',
  ],
  example: {
    say: 'Here two generators with the same seed give exactly the same coin tosses.',
    code: `print(np.random.default_rng(7).integers(0, 2, size=8))
print(np.random.default_rng(7).integers(0, 2, size=8))`,
    lines: [
      ['default_rng(7)', 'a generator seeded 7.'],
      ['the two lines', 'exactly the same: the seed makes it repeatable.'],
    ],
  },
  brief: {
    story: 'The café wants to check that its dice game is fair before running it.',
    get: [['Nothing to load.']],
    want: ['With a generator seeded 42, `rolls`: 1,000 dice rolls', '`share_six`: the share that came up 6'],
    out: '`share_six` is close to 1 in 6.',
  },
},
'np-14': {
  explain: [
    'A Python loop handles one value at a time.',
    'NumPy runs the same sum over the whole array at once, in fast compiled code. This is called **vectorising**.',
    'On 120 rows you won\'t notice. On 10 million, the loop takes minutes and the array takes moments.',
    'Most loops over numbers can become a single line of maths on arrays.',
    '`np.where` takes the place of the "if".',
  ],
  example: {
    say: 'Here a loop that caps numbers at 10 becomes one line.',
    code: `a = np.array([4, 15, 8, 22])
capped = []
for x in a:
    capped.append(10 if x > 10 else x)
print(capped)
print(np.where(a > 10, 10, a))`,
    lines: [
      ['the loop', 'one value at a time, with an if.'],
      ['np.where(a > 10, 10, a)', 'the same answer, all at once.'],
    ],
  },
  brief: {
    story: 'The discount calculation is a loop, and it will be run on years of data.',
    get: [CAFE, ['The starter does it with a loop.']],
    want: ['Make `discounted` without a loop: 10% off the revenue on days over 40 cups, unchanged on other days'],
    out: 'An array of 120 values, the same as the loop gives.',
  },
},
'np-15': {
  explain: [
    'A course grade might count maths 50%, physics 30% and history 20%.',
    'Each student\'s grade is each mark times its weight, all added up.',
    '`scores @ weights` does exactly that, for every student at once.',
    '`@` is matrix multiplication, also written `np.dot`.',
    'This one move, multiply-and-add, is at the heart of linear regression and of every neural network.',
  ],
  example: {
    say: 'Here two baskets are priced in one step: quantities times prices, added up.',
    code: `baskets = np.array([[2, 1, 0], [0, 3, 1]])
prices = np.array([4.5, 2.75, 3.0])
baskets @ prices`,
    lines: [
      ['the first basket', '2 × 4.5 + 1 × 2.75 + 0 × 3.0 = 11.75.'],
      ['the second', '3 × 2.75 + 1 × 3.0 = 11.25.'],
    ],
  },
  brief: {
    story: 'The school weights its subjects, and wants each student\'s overall grade.',
    get: [MARKS, ['The starter makes `scores` and `weights` (0.5, 0.3, 0.2).']],
    want: ['`grade`: each student\'s weighted grade, `scores @ weights`', '`top`: the position of the student with the highest grade'],
    out: 'An array of 8 grades, and a position.',
  },
},
};
