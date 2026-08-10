export const TIMESERIES = [
{
  id: 'ts-01', mins: 4,
  title: 'Dates in the index',
  concept: [
    'Move the dates into the index and pandas gets time-aware.',
    '`ts.loc["2024-02"]` then selects a whole month by name.',
    '`ts.loc["2024-02-01":"2024-02-14"]` slices a range — and **includes** the end.',
  ],
  starter: `ts = cafe.set_index("date")

print(ts.shape)
ts.head(3)`,
  task: 'Make `feb` = only the February rows, selected by label rather than filtering.',
  hint: '`ts = cafe.set_index("date")` then `feb = ts.loc["2024-02"]`',
  solution: `ts = cafe.set_index("date")
feb = ts.loc["2024-02"]

print(len(feb))
feb.head()`,
  check: `assert "feb" in globals(), "Make a variable called feb."
assert len(feb) == 29, "2024 was a leap year — February has 29 rows, you got %d." % len(feb)
assert set(feb.index.month) == {2}, "Some non-February rows slipped in."`,
},
{
  id: 'ts-02', mins: 4,
  title: 'resample — groupby for time',
  concept: [
    '`.resample("W")` regroups a date index into new buckets.',
    'Codes: `D` day, `W` week, `ME` month end, `QE` quarter end.',
    'Always follow it with an aggregation — `.sum()`, `.mean()`, `.max()`.',
  ],
  starter: `ts = cafe.set_index("date")

ts["revenue"].resample("W").sum().head()`,
  task: 'Make `monthly` = total revenue per month, using resample.',
  hint: '`monthly = cafe.set_index("date")["revenue"].resample("ME").sum()`',
  solution: `ts = cafe.set_index("date")
monthly = ts["revenue"].resample("ME").sum()

monthly.round(2)`,
  check: `assert "monthly" in globals(), "Make a variable called monthly."
assert len(monthly) == 4, "Jan to Apr is 4 buckets, you got %d — check the frequency code." % len(monthly)
assert abs(float(monthly.sum()) - float(cafe["revenue"].sum())) < 1.0, "The months should add back up to total revenue — use .sum()."`,
},
{
  id: 'ts-03', mins: 4,
  title: 'Rolling windows',
  concept: [
    '`.rolling(7).mean()` averages the last 7 rows, at every row.',
    'It smooths daily noise so the underlying trend shows through.',
    'The first 6 values are `NaN` — there is no full window yet.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
smooth = daily.rolling(7).mean()

print(smooth.head(9))`,
  task: 'Make `smooth30` = the 30-day rolling mean of daily revenue.',
  hint: 'Same shape, bigger window: `daily.rolling(30).mean()`',
  solution: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
smooth30 = daily.rolling(30).mean()

print(smooth30.isna().sum(), "NaNs at the start")
smooth30.tail(3)`,
  check: `assert "smooth30" in globals(), "Make a variable called smooth30."
assert len(smooth30) == 120, "You should still have one value per day."
assert int(smooth30.isna().sum()) == 29, "A 30-day window leaves exactly 29 NaNs at the start, not %d." % int(smooth30.isna().sum())`,
},
{
  id: 'ts-04', mins: 4,
  title: 'Comparing to yesterday',
  concept: [
    '`.shift(1)` slides values down a row, putting yesterday next to today.',
    '`today - yesterday` is the change; `.pct_change()` gives it as a fraction.',
    'This is how every "up 12% on last week" number gets made.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()

print(daily.head(3))
print(daily.shift(1).head(3))`,
  task: 'Make `growth` = the day-over-day **percent change** in daily revenue.',
  hint: '`growth = daily.pct_change()`',
  solution: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
growth = daily.pct_change()

print(growth.head(4))
print("best day:", growth.idxmax().date())`,
  check: `assert "growth" in globals(), "Make a variable called growth."
_daily = cafe.set_index("date")["revenue"].resample("D").sum()
_want = _daily.pct_change()
assert len(growth) == 120, "You should get one value per day."
assert bool(pd.isna(growth.iloc[0])), "The very first day has nothing to compare against, so it must be NaN."
assert (growth.iloc[1:] - _want.iloc[1:]).abs().max() < 1e-9, "Those aren't percent changes — try .pct_change()."`,
},
{
  id: 'ts-05', mins: 4,
  title: 'Slicing time into categories',
  concept: [
    '`.dt.day_name()`, `.dt.quarter`, `.dt.is_month_end` turn a date into a label.',
    'Group by that label to answer "which weekday is busiest?"',
    'This works on a date **column**; `.dt` is not needed on a date **index**.',
  ],
  starter: `cafe["weekday"] = cafe["date"].dt.day_name()

cafe[["date", "weekday"]].head()`,
  task: 'Make `by_weekday` = the mean `revenue` for each day name.',
  hint: 'Add the weekday column, then `cafe.groupby("weekday")["revenue"].mean()`',
  solution: `cafe["weekday"] = cafe["date"].dt.day_name()
by_weekday = cafe.groupby("weekday")["revenue"].mean()

by_weekday.sort_values(ascending=False).round(1)`,
  check: `assert "by_weekday" in globals(), "Make a variable called by_weekday."
assert len(by_weekday) == 7, "There are 7 day names, you got %d." % len(by_weekday)
assert "Monday" in by_weekday.index, "The index should hold day names like Monday — use .dt.day_name()."`,
},
{
  id: 'ts-06', mins: 4,
  title: 'Weighting recent days more',
  concept: [
    '`.expanding().mean()` averages everything up to each point.',
    '`.ewm(span=14).mean()` is like rolling, but recent days count for more.',
    'Neither has the NaN warm-up that `.rolling()` gives you.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()

print(daily.expanding().mean().head(4))`,
  task: 'Make `ewma` = the exponentially weighted mean of daily revenue with a span of 14.',
  hint: '`ewma = daily.ewm(span=14).mean()`',
  solution: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
ewma = daily.ewm(span=14).mean()

print("NaNs:", int(ewma.isna().sum()))
ewma.tail(3).round(2)`,
  check: `assert "ewma" in globals(), "Make a variable called ewma."
assert len(ewma) == 120, "You should still have one value per day."
assert int(ewma.isna().sum()) == 0, "ewm has no warm-up period, so there should be no NaNs at all."
_daily = cafe.set_index("date")["revenue"].resample("D").sum()
assert (ewma - _daily.ewm(span=14).mean()).abs().max() < 1e-6, "Check the span — it should be 14."`,
},
];
