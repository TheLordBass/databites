/* Analysis (an-01 to an-10): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Examples ask a different question
   of the café data, or of a tiny table, never the task's own. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const GOT_CAFE = ['`cafe` has one row per day, 120 days:', CAFE];

export const ANALYSIS_DETAIL = {
'an-01': {
  explain: [
    'This course is one piece of analysis from start to finish: which drink should the café push, and where?',
    '"Which drink is best?" cannot be answered. "Which earns the most per day?" can.',
    'Choose what "best" means **before** you look, or you will pick whichever measure flatters your hunch.',
    'A **scoreboard** puts several measures side by side, so you can see whether they agree.',
    '`.agg(name=("column", "how"))` builds one with named columns in one step.',
  ],
  example: {
    say: 'Here is a small scoreboard for each city: how many days, and the average cups.',
    code: `cafe.groupby("city").agg(days=("date", "count"), avg_cups=("cups", "mean")).round(1)`,
    lines: [
      ['days=("date", "count")', 'a column called days: the dates counted.'],
      ['avg_cups=("cups", "mean")', 'a column called avg_cups: the average of cups.'],
    ],
  },
  brief: {
    story: 'The owner asks which drink to push. First, line up the evidence.',
    get: [GOT_CAFE],
    want: ['`scoreboard`: for each drink, the total `revenue`, the total `cups` and the average `rating`', 'Biggest revenue first'],
    out: 'Four rows, three columns.',
  },
},
'an-02': {
  explain: [
    'Before any conclusion, check the data: how big it is, what kind of data each column holds, what is missing, and what repeats.',
    '`.info()` answers most of that at once.',
    '`.isna().sum()` counts the missing values in each column.',
    '`.duplicated().sum()` counts the rows that repeat an earlier row exactly.',
    'Run those two every time. A conclusion built on gaps or double-counted rows is wrong before it starts.',
  ],
  example: {
    say: 'Here a tiny table with gaps and a repeated row is checked.',
    code: `t = pd.DataFrame({"a": [1, None, 3, 3], "b": ["x", "y", None, None]})
print(t.isna().sum())
print(t.duplicated().sum(), "repeated row")`,
    lines: [
      ['t.isna().sum()', 'one gap in a, two in b.'],
      ['t.duplicated().sum()', 'the last row repeats the one before it: 1.'],
    ],
  },
  brief: {
    story: 'Before the analysis goes to the owner, a colleague asks whether the data has been checked.',
    get: [GOT_CAFE],
    want: ['`missing`: how many values are missing in each column', 'Print how many rows are repeats'],
    out: 'A count per column, then a number.',
  },
},
'an-03': {
  explain: [
    'Sort the values: **Q1** is the one a quarter of the way up, **Q3** the one three quarters up.',
    'The gap between them is the **IQR**: the spread of the middle half.',
    'A common rule flags anything below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR as unusual.',
    '`.quantile(0.25)` and `.quantile(0.75)` give Q1 and Q3.',
    'A flagged row is a **suspect**, not an error. Look at it before you delete it.',
  ],
  example: {
    say: 'Here six numbers, one far bigger than the rest, get their limits worked out.',
    code: `s = pd.Series([10, 12, 11, 13, 12, 50])
q1, q3 = s.quantile(0.25), s.quantile(0.75)
iqr = q3 - q1
print(q1, q3, iqr)
print("keep between", q1 - 1.5 * iqr, "and", q3 + 1.5 * iqr)`,
    lines: [
      ['q1, q3', 'about 11.25 and 12.75.'],
      ['the limits', 'from 9 to 15: the 50 is well outside, so it is a suspect.'],
    ],
  },
  brief: {
    story: 'One or two days look strange in the revenue. Find them before they skew the answer.',
    get: [GOT_CAFE, ['The starter works out `q1`, `q3` and `iqr` for revenue.']],
    want: ['`outliers`: the rows whose `revenue` is below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR'],
    out: 'The suspect rows, if there are any.',
  },
},
'an-04': {
  explain: [
    'An average across all cities can hide the fact that each city behaves differently.',
    'A pivot table puts one city per row and one drink per column.',
    '`.idxmax(axis=1)` looks along each row and gives the **column name** of the biggest value.',
    '`axis=1` means "along each row". Without it, idxmax looks down each column instead.',
    'That turns a grid of numbers into a direct answer.',
  ],
  example: {
    say: "Here two students' marks give each student's best subject.",
    code: `scores = pd.DataFrame({"maths": [70, 90], "art": [85, 60]}, index=["Ada", "Kofi"])
scores.idxmax(axis=1)`,
    lines: [
      ['axis=1', 'along each row: one answer per student.'],
      ['the result', 'Ada does best in art, Kofi in maths.'],
    ],
  },
  brief: {
    story: 'Each city manager wants to know which drink to promote in their own branch.',
    get: [GOT_CAFE, ['The starter makes `grid`: average revenue by city (rows) and drink (columns).']],
    want: ['`best_per_city`: the drink that earns the most in each city'],
    out: 'One drink name per city.',
  },
},
'an-05': {
  explain: [
    'Two columns can move together without one causing the other.',
    '`.corr()` on a table gives a **correlation** for every pair of columns, from −1 to 1.',
    '1 means they rise together in step, 0 means no link, and −1 means one rises as the other falls.',
    "For one pair, `a.corr(b)` gives a single number.",
    'Check how many rows sit behind each number: a correlation from 6 rows is not a fact.',
  ],
  example: {
    say: 'Here is how closely price and rating move together.',
    code: `round(cafe["price"].corr(cafe["rating"]), 3)`,
    lines: [
      ['cafe["price"].corr(cafe["rating"])', 'one correlation for one pair. Missing ratings are skipped.'],
      ['the size', 'close to 0: dearer days are not rated better or worse.'],
    ],
  },
  brief: {
    story: 'The owner wants to know how tightly busy days and good takings go together.',
    get: [GOT_CAFE],
    want: ['`cups_rev`: the correlation between `cups` and `revenue`'],
    out: 'One number between −1 and 1.',
  },
},
'an-06': {
  explain: [
    '`np.polyfit(x, y, 1)` finds the straight line that best fits the points.',
    'It gives back two numbers: `[slope, intercept]`. You can unpack them: `slope, intercept = np.polyfit(...)`.',
    'The **slope** is how much y goes up for each 1 of x.',
    'The **intercept** is where the line crosses x = 0.',
    'Always draw the line over the points: `plt.scatter(x, y)`, then `plt.plot(x, slope * x + intercept)`. A bad fit is obvious the moment you see it.',
  ],
  example: {
    say: 'Here a line is fitted through four points and drawn over them.',
    code: `x = np.array([1, 2, 3, 4])
y = np.array([2, 4.1, 5.9, 8.2])
slope, intercept = np.polyfit(x, y, 1)
print(round(slope, 2), round(intercept, 2))
plt.scatter(x, y)
plt.plot(x, slope * x + intercept)
plt.show()`,
    lines: [
      ['slope, intercept = ...', 'the two numbers, each given a name.'],
      ['slope', 'about 2: y goes up by 2 for each step of x.'],
      ['plt.plot(x, slope * x + intercept)', 'the line, drawn through the dots.'],
    ],
  },
  brief: {
    story: 'The owner asks what one extra cup sold is worth, in money.',
    get: [GOT_CAFE],
    want: ['`slope` and `intercept`: the line through revenue against cups', 'Draw the line over a scatter of the points'],
    out: 'Two numbers and a chart.',
  },
},
'an-07': {
  explain: [
    'A best-fit line always exists, even through random dots. **statsmodels** helps you decide whether to believe it.',
    '`sm.OLS(y, X).fit()` fits the line. OLS stands for "ordinary least squares", the usual way of fitting.',
    '`sm.add_constant(X)` lets the line start somewhere other than zero. Forget it and the fit is wrong.',
    '**R²**, from 0 to 1, is how much of the ups and downs the line explains: `model.rsquared`.',
    'The **p-value** is, roughly, how likely a slope this size would be from luck alone: `model.pvalues`.',
  ],
  example: {
    say: 'Here revenue is fitted against price, and the two key numbers are read off.',
    code: `import statsmodels.api as sm
X = sm.add_constant(cafe[["price"]])
m = sm.OLS(cafe["revenue"], X).fit()
print(round(m.rsquared, 3), round(m.pvalues["price"], 4))`,
    lines: [
      ['sm.add_constant(...)', 'adds the column that lets the line have an intercept.'],
      ['m.rsquared', 'how much of revenue\'s ups and downs price alone explains.'],
      ['m.pvalues["price"]', 'how likely a slope this size would be by luck.'],
    ],
  },
  brief: {
    story: 'Someone claims dearer days sell fewer cups. Test it before it goes in the report.',
    get: [GOT_CAFE],
    want: ['Fit `cups` against `price`', '`r2`: the R²'],
    out: 'One number. Look hard at it.',
  },
},
'an-08': {
  explain: [
    '**scikit-learn** is a toolkit for prediction. Every model in it works the same way.',
    '`.fit(X, y)` learns from examples, then `.predict(X)` makes guesses.',
    '`X` is a table of inputs, and `y` is the one column you want to predict.',
    '`.score(X, y)` gives R² for those rows.',
    'Test it on rows it has **never seen**. Scoring it on the rows it learned from only tests its memory.',
  ],
  example: {
    say: 'Here the days are split into the first 100 and the last 20 with `.iloc`.',
    code: `X = cafe[["cups"]]
first, last = X.iloc[:100], X.iloc[100:]
print(len(first), len(last))
print(cafe["date"].iloc[100].date())`,
    lines: [
      ['X.iloc[:100]', 'rows 0 to 99: the first 100 days, to learn from.'],
      ['X.iloc[100:]', 'row 100 to the end: the last 20, kept back for the test.'],
      ['cafe["date"].iloc[100]', 'the first day of the test: 10 April.'],
    ],
  },
  brief: {
    story: 'The owner wants a revenue predictor, and wants to know how well it does on days it hasn\'t seen.',
    get: [GOT_CAFE],
    want: ['Train on the first 100 days', '`holdout`: its score on the last 20'],
    out: 'One R² score.',
  },
},
'an-09': {
  explain: [
    'The last step is one picture a stranger can read without you explaining it.',
    'Sort the bars, so the order itself tells the story. seaborn takes `order=` a list of the labels, top to bottom.',
    'Drop the clutter: `errorbar=None` removes the thin lines when they aren\'t the point.',
    'Put the **finding** in the title, not the chart type: "Lattes earn the most", not "Revenue by drink".',
    'If someone still has to ask "so what?", it is not finished.',
  ],
  example: {
    say: 'Here the cities are sorted by average cups, and the title says which wins, worked out from the data.',
    code: `import seaborn as sns
order = cafe.groupby("city")["cups"].mean().sort_values(ascending=False).index
sns.barplot(data=cafe, x="cups", y="city", order=order, errorbar=None)
plt.title(f"{order[0]} sells the most cups a day")
plt.show()`,
    lines: [
      ['order = ...', 'the cities, from most cups to fewest.'],
      ['order=order', 'draws the bars in that order, the best on top.'],
      ['f"{order[0]} ..."', 'the title names the winner from the data, so it can never be wrong.'],
    ],
  },
  brief: {
    story: 'The chart is going on the noticeboard. It has to make its point on its own.',
    get: [GOT_CAFE],
    want: ['Order the drinks by average revenue, best on top', 'Write the finding into the title'],
    out: 'A sorted bar chart with a title that says what it shows.',
  },
},
'an-10': {
  explain: [
    'An overall winner can hide months where it lost. Check before you say "always".',
    'Group by month **and** drink, then find the top drink inside each month.',
    '`.dt.month` turns each date into its month number.',
    '`.unstack()` puts the drinks in columns, one row per month.',
    "`.idxmax(axis=1)` names each row's winner.",
  ],
  example: {
    say: 'Here the city that sold the most cups is found for each month.',
    code: `by = cafe.groupby([cafe["date"].dt.month, "city"])["cups"].sum().unstack()
print(by)
by.idxmax(axis=1)`,
    lines: [
      ['groupby([cafe["date"].dt.month, "city"])', 'one total per month per city.'],
      ['.unstack()', 'cities across the top, months down the side.'],
      ['.idxmax(axis=1)', "each month's top city."],
    ],
  },
  brief: {
    story: 'The report says one drink is the winner. The owner asks: every month?',
    get: [GOT_CAFE],
    want: ['`monthly_winner`: for each month (1 to 4), the drink that earned the most revenue that month'],
    out: 'Four drink names, one per month.',
  },
},
};
