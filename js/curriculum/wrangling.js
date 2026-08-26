export const WRANGLING = [
{
  id: 'wr-01', mins: 4,
  title: 'Joining two tables',
  concept: [
    '`pd.merge(left, right, on="col")` glues two tables together on a shared column.',
    'A second table called `cities` is already loaded — city, country, population.',
    'Every row of `cafe` picks up the matching row from `cities`.',
  ],
  starter: `cities`,
  task: 'Make `joined` = `cafe` merged with `cities` on the `city` column.',
  hint: '`joined = pd.merge(cafe, cities, on="city")`',
  solution: `joined = pd.merge(cafe, cities, on="city")

print(joined.shape)
joined[["city", "country", "population_m", "cups"]].head()`,
  check: `assert "joined" in globals(), "Make a variable called joined."
assert "country" in joined.columns, "joined should have picked up the country column."
assert len(joined) == 120, "All 120 rows should survive — every cafe city exists in cities."
assert joined.loc[joined["city"] == "Lagos", "country"].iloc[0] == "Nigeria", "Lagos should line up with Nigeria."`,
},
{
  id: 'wr-02', mins: 4,
  title: 'Who survives the join',
  concept: [
    '`how="inner"` (the default) keeps only rows that matched **both** sides.',
    '`how="left"` keeps every left row; `how="outer"` keeps everything from both.',
    'Kigali is in `cities` but never in `cafe` — so the join style decides its fate.',
  ],
  starter: `small = cafe.head(5)

print(pd.merge(small, cities, on="city").shape)
print(pd.merge(small, cities, on="city", how="outer").shape)`,
  task: 'Make `outer` = the first 5 cafe rows outer-joined to `cities`, so Kigali survives.',
  hint: 'Add `how="outer"`: `pd.merge(cafe.head(5), cities, on="city", how="outer")`',
  solution: `outer = pd.merge(cafe.head(5), cities, on="city", how="outer")

print(outer[["city", "country", "cups"]])
outer[outer["cups"].isna()]`,
  check: `assert "outer" in globals(), "Make a variable called outer."
assert "Kigali" in set(outer["city"]), 'Kigali is missing — an inner join drops it. Use how="outer".'
assert outer.loc[outer["city"] == "Kigali", "cups"].isna().all(), "Kigali has no sales, so its cups should be NaN."`,
},
{
  id: 'wr-03', mins: 4,
  title: 'Stacking tables',
  concept: [
    '`pd.concat([a, b])` stacks rows on top of each other.',
    '`ignore_index=True` renumbers the result 0, 1, 2… instead of repeating labels.',
    '`axis=1` glues side by side instead of end to end.',
  ],
  starter: `jan = cafe[cafe["date"].dt.month == 1]
feb = cafe[cafe["date"].dt.month == 2]
print(len(jan), len(feb))

both = pd.concat([jan, feb])
both.index[:5]`,
  task: 'Make `q1` = January, February and March stacked, with a clean index starting at 0.',
  hint: 'Add `mar`, then `pd.concat([jan, feb, mar], ignore_index=True)`.',
  solution: `jan = cafe[cafe["date"].dt.month == 1]
feb = cafe[cafe["date"].dt.month == 2]
mar = cafe[cafe["date"].dt.month == 3]

q1 = pd.concat([jan, feb, mar], ignore_index=True)

print(len(q1))
q1.tail(3)`,
  check: `assert "q1" in globals(), "Make a variable called q1."
assert len(q1) == 91, "January + February + March is 91 days in 2024, not %d." % len(q1)
assert list(q1.index) == list(range(91)), "The index still repeats — pass ignore_index=True."`,
},
{
  id: 'wr-04', mins: 3,
  title: 'Duplicates and replacements',
  concept: [
    '`.drop_duplicates()` throws away repeat rows, keeping the first.',
    '`subset=[...]` decides which columns count as "the same".',
    '`.replace({"old": "new"})` swaps values wherever they appear.',
  ],
  starter: `print(cafe["drink"].replace({"tea": "chai"}).unique())

cafe.drop_duplicates(subset=["city"])[["city", "drink"]]`,
  task: 'Make `pairs` = one row per unique **city + drink** combination, keeping just those two columns.',
  hint: '`cafe.drop_duplicates(subset=["city", "drink"])[["city", "drink"]]`',
  solution: `pairs = cafe.drop_duplicates(subset=["city", "drink"])[["city", "drink"]]

print(len(pairs))
pairs.sort_values(["city", "drink"])`,
  check: `assert "pairs" in globals(), "Make a variable called pairs."
assert list(pairs.columns) == ["city", "drink"], "Keep only the city and drink columns."
assert not pairs.duplicated().any(), "There are still repeated city+drink pairs."
assert len(pairs) == len(cafe.drop_duplicates(subset=["city", "drink"])), "Some combinations went missing."`,
},
{
  id: 'wr-05', mins: 4,
  title: 'Wide to long with melt',
  concept: [
    '**Wide** = one column per measure. **Long** = one row per measurement.',
    '`.melt(id_vars=..., value_vars=[...])` turns wide into long.',
    'Seaborn and most plotting tools secretly want long data.',
  ],
  starter: `wide = cafe.head(4)[["date", "cups", "revenue"]]
print(wide)

wide.melt(id_vars="date")`,
  task: 'Melt the first 6 rows on `cups` and `rating`, naming the new columns `measure` and `amount`.',
  hint: '`cafe.head(6).melt(id_vars="date", value_vars=["cups", "rating"], var_name="measure", value_name="amount")`',
  solution: `long = cafe.head(6).melt(
    id_vars="date",
    value_vars=["cups", "rating"],
    var_name="measure",
    value_name="amount",
)

print(long.shape)
long`,
  check: `assert "long" in globals(), "Put the result in a variable called long."
assert list(long.columns) == ["date", "measure", "amount"], "Name the new columns measure and amount."
assert len(long) == 12, "6 rows x 2 measures = 12 rows, not %d." % len(long)
assert set(long["measure"]) == {"cups", "rating"}, "Melt cups and rating."`,
},
{
  id: 'wr-06', mins: 4,
  title: 'unstack — pivoting an index',
  concept: [
    'Grouping by **two** columns gives a Series with a MultiIndex.',
    '`.unstack()` lifts the inner index level up into columns.',
    '`.stack()` does the reverse. This is `pivot_table` from the other direction.',
  ],
  starter: `g = cafe.groupby(["city", "drink"])["cups"].sum()
print(g.head())

g.unstack()`,
  task: 'Make `table` = mean `revenue` grouped by city **and** drink, unstacked so drinks are the columns.',
  hint: '`cafe.groupby(["city", "drink"])["revenue"].mean().unstack()`',
  solution: `table = cafe.groupby(["city", "drink"])["revenue"].mean().unstack()

table.round(1)`,
  check: `assert "table" in globals(), "Make a variable called table."
assert set(table.index) == {"Lagos", "Nairobi", "Accra"}, "Cities should be the rows."
assert set(table.columns) == {"latte", "espresso", "cold brew", "tea"}, "Drinks should be the columns — did you unstack?"`,
},
{
  id: 'wr-07', mins: 4,
  title: 'transform — compare a row to its group',
  concept: [
    '`.agg` gives one number **per group**. `.transform` gives one **per original row**.',
    'That means the result lines up with the table and can become a new column.',
    'Perfect for "how does this day compare to its city\'s normal?"',
  ],
  starter: `cafe["city_avg"] = cafe.groupby("city")["revenue"].transform("mean")

cafe[["city", "revenue", "city_avg"]].head()`,
  task: 'Add `vs_city` = how far this row\'s revenue sits above or below its own city average.',
  hint: 'Subtract the transform from the column: `cafe["revenue"] - cafe.groupby("city")["revenue"].transform("mean")`',
  solution: `cafe["city_avg"] = cafe.groupby("city")["revenue"].transform("mean")
cafe["vs_city"] = cafe["revenue"] - cafe["city_avg"]

cafe[["city", "revenue", "city_avg", "vs_city"]].head()`,
  check: `assert "vs_city" in cafe.columns, "cafe has no vs_city column yet."
_want = cafe["revenue"] - cafe.groupby("city")["revenue"].transform("mean")
assert (cafe["vs_city"] - _want).abs().max() < 1e-6, "vs_city should be revenue minus the city's own average."
assert abs(float(cafe.groupby("city")["vs_city"].mean().abs().max())) < 1e-6, "Within each city these differences should cancel out to zero."`,
},
{
  id: 'wr-08', mins: 3,
  title: 'crosstab — counting pairs',
  concept: [
    '`pd.crosstab(a, b)` counts how often each combination shows up.',
    '`normalize="index"` turns those counts into proportions per row.',
    'Add `values=` and `aggfunc=` and it becomes a pivot table.',
  ],
  starter: `pd.crosstab(cafe["city"], cafe["drink"], normalize="index").round(2)`,
  task: 'Make `ct` = the plain **counts** of each city / drink combination.',
  hint: '`ct = pd.crosstab(cafe["city"], cafe["drink"])` — no normalize this time.',
  solution: `ct = pd.crosstab(cafe["city"], cafe["drink"])

print(ct.sum().sum())
ct`,
  check: `assert "ct" in globals(), "Make a variable called ct."
assert ct.shape == (3, 4), "Expected 3 cities by 4 drinks, got %s." % (ct.shape,)
assert int(ct.to_numpy().sum()) == 120, "Plain counts should add up to all 120 rows — drop the normalize argument."`,
},
{
  id: 'wr-09', mins: 4,
  title: 'Wide data in the wild',
  concept: [
    'Two new tables: `marks` (one column per subject) and `students`.',
    '`marks` is **wide** — the subject names are column headers, not data.',
    'Almost nothing in pandas wants that shape. Melt it and everything opens up.',
  ],
  starter: `print(marks)

students`,
  task: 'Melt `marks` on `student_id` into `long_marks`, with columns `subject` and `score`.',
  hint: '`marks.melt(id_vars="student_id", var_name="subject", value_name="score")`',
  solution: `long_marks = marks.melt(
    id_vars="student_id",
    var_name="subject",
    value_name="score",
)

print(long_marks.shape)
long_marks.head(6)`,
  check: `assert "long_marks" in globals(), "Make a variable called long_marks."
assert list(long_marks.columns) == ["student_id", "subject", "score"], "Name the new columns subject and score."
assert len(long_marks) == 24, "8 students x 3 subjects = 24 rows, you got %d." % len(long_marks)
assert set(long_marks["subject"]) == {"maths", "physics", "history"}, "All three subjects should appear in the subject column."`,
},
{
  id: 'wr-10', mins: 5,
  title: 'Long data, then joined, then answered',
  concept: [
    'Melt first, **then** join. Long data merges cleanly; wide data does not.',
    'Once the names are attached you can group by anything in either table.',
    'This melt → merge → groupby chain is most of real data work.',
  ],
  starter: `long_marks = marks.melt(id_vars="student_id", var_name="subject", value_name="score")

pd.merge(long_marks, students, on="student_id").head()`,
  task: 'Make `by_year` — the mean `score` for each school `year`.',
  hint: 'Merge `long_marks` with `students` on `student_id`, then `.groupby("year")["score"].mean()`.',
  solution: `long_marks = marks.melt(id_vars="student_id", var_name="subject", value_name="score")
joined = pd.merge(long_marks, students, on="student_id")

by_year = joined.groupby("year")["score"].mean().round(1)

print(joined.head())
by_year`,
  check: `assert "by_year" in globals(), "Make a variable called by_year."
assert set(by_year.index) == {1, 2, 3}, "There are three school years — 1, 2 and 3."
_lm = marks.melt(id_vars="student_id", var_name="subject", value_name="score")
_want = pd.merge(_lm, students, on="student_id").groupby("year")["score"].mean()
assert (by_year - _want.round(1)).abs().max() < 0.06, "Those aren't the mean scores per year — check the merge key."`,
},
];
