/* The capstone. One question — "which drink should we push, and where?" —
   carried from framing through cleaning, modelling and the final chart.
   Lessons with `needs` pull those packages on first run, not at boot. */

export const ANALYSIS = [
{
  id: 'an-01', mins: 4,
  title: 'Make the question answerable',
  concept: [
    '"Which drink is best?" cannot be answered. "Which earns the most per day?" can.',
    'Choose the metric **before** you look, or you will pick whichever one flatters your hunch.',
    'Everything in this track chases one question: which drink should we push, and where?',
  ],
  starter: `question = "Which drink earns the most, and in which city?"

cafe.groupby("drink")["revenue"].sum().sort_values(ascending=False)`,
  task: 'Build `scoreboard`: per drink, total `revenue`, total `cups` and mean `rating` — best revenue first.',
  hint: 'Named aggregation, then sort: `.agg(revenue=("revenue","sum"), ...)` then `.sort_values("revenue", ascending=False)`',
  solution: `scoreboard = cafe.groupby("drink").agg(
    revenue=("revenue", "sum"),
    cups=("cups", "sum"),
    rating=("rating", "mean"),
).sort_values("revenue", ascending=False)

scoreboard.round(1)`,
  check: `assert "scoreboard" in globals(), "Make a variable called scoreboard."
assert set(scoreboard.columns) == {"revenue", "cups", "rating"}, "Name the columns revenue, cups and rating."
assert len(scoreboard) == 4, "One row per drink — that's 4."
_rev = list(scoreboard["revenue"])
assert _rev == sorted(_rev, reverse=True), "Sort it so the biggest earner is on top."`,
},
{
  id: 'an-02', mins: 4,
  title: 'Trust nothing until you profile it',
  concept: [
    'Before any conclusion: how big is it, what types, what is missing, what repeats.',
    '`.info()` answers most of that in one line.',
    '`.isna().sum()` and `.duplicated().sum()` are the two you should run every single time.',
  ],
  starter: `cafe.info()`,
  task: 'Make `missing` = the count of missing values per column, and print the number of duplicate rows.',
  hint: '`missing = cafe.isna().sum()` and `print(cafe.duplicated().sum())`',
  solution: `missing = cafe.isna().sum()

print("duplicate rows:", cafe.duplicated().sum())
missing`,
  check: `assert "missing" in globals(), "Make a variable called missing."
assert int(missing.sum()) == 9, "There are 9 missing values in total — all in rating."
assert int(missing["rating"]) == 9, "All 9 gaps are in the rating column."
assert "duplicate" in _out.lower() or "0" in _out, "Print the duplicate row count too."`,
},
{
  id: 'an-03', mins: 5,
  title: 'Suspects, not culprits',
  concept: [
    'The IQR rule: flag anything below `Q1 − 1.5×IQR` or above `Q3 + 1.5×IQR`.',
    '`.quantile(0.25)` and `.quantile(0.75)` give you the fence posts.',
    'A flagged row is a **suspect**, not an error. Look at it before you delete it.',
  ],
  starter: `q1 = cafe["revenue"].quantile(0.25)
q3 = cafe["revenue"].quantile(0.75)
iqr = q3 - q1

print("Q1", round(q1, 1), " Q3", round(q3, 1), " IQR", round(iqr, 1))`,
  task: 'Make `outliers` = the rows whose `revenue` falls outside that 1.5×IQR fence.',
  hint: 'Build `low = q1 - 1.5*iqr` and `high = q3 + 1.5*iqr`, then filter with `<` or `>` joined by `|`.',
  solution: `q1 = cafe["revenue"].quantile(0.25)
q3 = cafe["revenue"].quantile(0.75)
iqr = q3 - q1

low = q1 - 1.5 * iqr
high = q3 + 1.5 * iqr

outliers = cafe[(cafe["revenue"] < low) | (cafe["revenue"] > high)]

print(len(outliers), "suspect days")
outliers[["date", "drink", "cups", "price", "revenue"]]`,
  check: `assert "outliers" in globals(), "Make a variable called outliers."
_q1 = cafe["revenue"].quantile(0.25)
_q3 = cafe["revenue"].quantile(0.75)
_iqr = _q3 - _q1
_want = cafe[(cafe["revenue"] < _q1 - 1.5 * _iqr) | (cafe["revenue"] > _q3 + 1.5 * _iqr)]
assert len(outliers) == len(_want), "Expected %d suspects, you found %d — check the 1.5 multiplier and both fences." % (len(_want), len(outliers))`,
},
{
  id: 'an-04', mins: 4,
  title: 'The overall winner is not the winner everywhere',
  concept: [
    'An average across all cities can hide the fact that each city behaves differently.',
    '`.idxmax(axis=1)` returns the **column name** of the biggest value in each row.',
    'That turns a grid of numbers into a direct answer.',
  ],
  starter: `grid = cafe.pivot_table(index="city", columns="drink", values="revenue", aggfunc="mean")

grid.round(1)`,
  task: 'Make `best_per_city` = the highest-earning drink in each city.',
  hint: 'Build the same `grid`, then `grid.idxmax(axis=1)`.',
  solution: `grid = cafe.pivot_table(index="city", columns="drink", values="revenue", aggfunc="mean")
best_per_city = grid.idxmax(axis=1)

print(grid.round(1))
best_per_city`,
  check: `assert "best_per_city" in globals(), "Make a variable called best_per_city."
assert len(best_per_city) == 3, "One answer per city — that's 3."
assert set(best_per_city.index) == {"Lagos", "Nairobi", "Accra"}, "The cities should be the index."
assert set(best_per_city) <= {"latte", "espresso", "cold brew", "tea"}, "The values should be drink names — use idxmax, not max."`,
},
{
  id: 'an-05', mins: 4,
  title: 'Signal or noise?',
  concept: [
    'Two columns can move together without one causing the other.',
    '`.corr()` scores every pair: 1 is lockstep, 0 is unrelated, −1 is opposite.',
    'Always check group size too — an average over 6 rows is not a fact.',
  ],
  starter: `cafe[["cups", "price", "revenue", "rating"]].corr().round(2)`,
  task: 'Pull the single `cups` ↔ `revenue` correlation out into `cups_rev`.',
  hint: '`corr.loc["cups", "revenue"]` picks one cell out of the matrix.',
  solution: `corr = cafe[["cups", "price", "revenue", "rating"]].corr()
cups_rev = corr.loc["cups", "revenue"]

print("cups vs revenue:", round(cups_rev, 3))
print("rows per city+drink:")
print(cafe.groupby(["city", "drink"]).size().describe()[["min", "mean", "max"]])

corr.round(2)`,
  check: `assert "cups_rev" in globals(), "Make a variable called cups_rev."
_want = cafe[["cups", "revenue"]].corr().loc["cups", "revenue"]
assert abs(float(cups_rev) - float(_want)) < 1e-9, "That isn't the cups-to-revenue correlation."
assert 0.5 < float(cups_rev) < 1.0, "It should be a strong positive number — revenue is built from cups, after all."`,
},
{
  id: 'an-06', mins: 4,
  title: 'Fitting a line by hand',
  concept: [
    '`np.polyfit(x, y, 1)` fits a straight line and hands back `[slope, intercept]`.',
    'The slope is the answer to "one more cup is worth how much?"',
    'Always draw the line over the points — a bad fit is obvious the moment you see it.',
  ],
  starter: `x = cafe["cups"]
y = cafe["revenue"]

print(np.polyfit(x, y, 1))`,
  task: 'Unpack the fit into `slope` and `intercept`, then plot the line over a scatter of the points.',
  hint: '`slope, intercept = np.polyfit(x, y, 1)`, then `plt.plot(x, slope * x + intercept)`.',
  solution: `x = cafe["cups"]
y = cafe["revenue"]

slope, intercept = np.polyfit(x, y, 1)
print("each extra cup is worth about", round(slope, 2))

plt.scatter(x, y, alpha=0.5)
plt.plot(x, slope * x + intercept, color="red", linewidth=2)
plt.xlabel("Cups")
plt.ylabel("Revenue")
plt.title("One more cup is worth ~%.2f" % slope)
plt.show()`,
  check: `assert "slope" in globals() and "intercept" in globals(), "Unpack both slope and intercept."
_s, _i = np.polyfit(cafe["cups"], cafe["revenue"], 1)
assert abs(float(slope) - float(_s)) < 1e-6, "That slope doesn't match a straight-line fit of revenue on cups."
_ax = _axes()
assert _ax, "Draw the chart too."
assert _ax[0].collections, "I can't see the scattered points."
assert _ax[0].lines, "Plot the fitted line over the points."`,
},
{
  id: 'an-07', mins: 5,
  title: 'Is that slope even real?',
  needs: ['statsmodels'],
  concept: [
    'A slope always exists. **statsmodels** tells you whether to believe it.',
    '`sm.add_constant(X)` adds the intercept term — forget it and the fit is wrong.',
    'Read two things: R² (how much it explains) and the p-value (could this be luck?).',
  ],
  starter: `import statsmodels.api as sm

X = sm.add_constant(cafe[["cups"]])
model = sm.OLS(cafe["revenue"], X).fit()

print(model.summary().tables[1])`,
  task: 'Now fit `cups` against `price` instead, and store the R² in `r2`. Look hard at the result.',
  hint: '`X = sm.add_constant(cafe[["price"]])`, `model = sm.OLS(cafe["cups"], X).fit()`, `r2 = model.rsquared`',
  solution: `import statsmodels.api as sm

X = sm.add_constant(cafe[["price"]])
model = sm.OLS(cafe["cups"], X).fit()
r2 = model.rsquared

print("R-squared:", round(r2, 4))
print("p-value for price:", round(model.pvalues["price"], 3))
print(model.summary().tables[1])`,
  check: `assert "r2" in globals(), "Store the R-squared in a variable called r2."
_r = float(np.corrcoef(cafe["price"], cafe["cups"])[0, 1])
assert abs(float(r2) - _r ** 2) < 1e-6, "That R-squared isn't from regressing cups on price."
assert float(r2) < 0.1, "Which is the point: price explains almost none of the variation in cups. A near-zero result is still a result."`,
},
{
  id: 'an-08', mins: 5,
  title: 'Predicting with scikit-learn',
  needs: ['scikit-learn'],
  concept: [
    'Every scikit-learn model has the same two moves: `.fit(X, y)` then `.predict(X)`.',
    '`X` is a 2-D table of inputs, `y` is the single thing you want to predict.',
    'Score it on rows the model has **never seen**, or you are just grading its memory.',
  ],
  starter: `from sklearn.linear_model import LinearRegression

X = cafe[["cups", "price"]]
y = cafe["revenue"]

model = LinearRegression().fit(X, y)
print("R^2 on the very same data:", round(model.score(X, y), 3))`,
  task: 'Train on the first 100 days, then score on the final 20 it has never seen. Put that score in `holdout`.',
  hint: 'Split with `.iloc[:100]` and `.iloc[100:]`, fit on the first, then `model.score(test[["cups","price"]], test["revenue"])`.',
  solution: `from sklearn.linear_model import LinearRegression

train = cafe.iloc[:100]
test = cafe.iloc[100:]

model = LinearRegression().fit(train[["cups", "price"]], train["revenue"])
holdout = model.score(test[["cups", "price"]], test["revenue"])

print("trained on", len(train), "days, tested on", len(test))
print("R^2 on unseen days:", round(holdout, 3))`,
  check: `assert "holdout" in globals(), "Make a variable called holdout."
assert "model" in globals(), "Keep the fitted model in a variable called model."
assert hasattr(model, "coef_"), "The model needs to be fitted before it can score anything."
assert 0.0 < float(holdout) < 1.0, "A held-out R-squared should land between 0 and 1, not %.3f." % float(holdout)
assert len(model.coef_) == 2, "Train on both inputs — cups and price."`,
},
{
  id: 'an-09', mins: 5,
  title: 'The chart that answers the question',
  concept: [
    'The last step is one picture a stranger can read without you narrating it.',
    'Sort the bars, drop the clutter, and put the **finding** in the title — not the chart type.',
    'If someone still has to ask "so what?", it is not finished.',
  ],
  starter: `import seaborn as sns
sns.set_theme(style="whitegrid")

sns.barplot(data=cafe, x="revenue", y="drink", hue="city", errorbar=None)
plt.show()`,
  task: 'Order the drinks by average revenue (best on top), and write the finding into the title.',
  hint: 'Build `order = cafe.groupby("drink")["revenue"].mean().sort_values(ascending=False).index`, pass `order=order`, then `plt.title("…")`.',
  solution: `import seaborn as sns
sns.set_theme(style="whitegrid")

order = cafe.groupby("drink")["revenue"].mean().sort_values(ascending=False).index
top = order[0]

sns.barplot(data=cafe, x="revenue", y="drink", hue="city", order=order, errorbar=None)
plt.title("%s earns the most per day" % top.title())
plt.xlabel("Average revenue per day")
plt.ylabel("")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_legend() is not None, 'Keep hue="city" so each city is visible.'
_title = _ax[0].get_title().strip()
assert _title, "The title is where the finding goes."
assert _title.lower() not in ("bar chart", "revenue", "revenue by drink"), "Say what you found, not what the chart is."
_labels_y = [t.get_text() for t in _ax[0].get_yticklabels()]
_want = list(cafe.groupby("drink")["revenue"].mean().sort_values(ascending=False).index)
assert _labels_y == _want, "The drinks aren't in order yet — pass order= to barplot."`,
},
];
