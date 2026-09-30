export const TIMESERIES = [
{
  id: 'ts-01', mins: 4,
  title: 'Dates in the index',
  concept: [
    'The row labels down the left of a table are its **index**. `cafe.set_index("date")` makes the dates the index, and pandas starts to understand time.',
    'Then `ts.loc["2024-02"]` picks a whole month by name.',
    '`ts.loc["2024-02-01":"2024-02-14"]` picks a range of dates, and **includes** the end date.',
  ],
  starter: `ts = cafe.set_index("date")

print(ts.shape)
ts.head(3)`,
  task: 'Make `feb`: only the February rows, picked by date with `.loc` rather than with a filter.',
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
  title: 'resample: groupby for time',
  concept: [
    '`.resample("W")` gathers the days into buckets, here one per week. The dates have to be the index.',
    'The letters say how big a bucket is: `D` day, `W` week, `ME` month, `QE` quarter.',
    'Always follow it with a summary for each bucket: `.sum()`, `.mean()`, `.max()`.',
  ],
  starter: `ts = cafe.set_index("date")

ts["revenue"].resample("W").sum().head()`,
  task: 'Make `monthly`: the total revenue for each month, using resample.',
  hint: '`monthly = cafe.set_index("date")["revenue"].resample("ME").sum()`',
  solution: `ts = cafe.set_index("date")
monthly = ts["revenue"].resample("ME").sum()

monthly.round(2)`,
  check: `assert "monthly" in globals(), "Make a variable called monthly."
assert len(monthly) == 4, "Jan to Apr is 4 buckets, you got %d. Check the letters inside resample(...): ME for months." % len(monthly)
assert abs(float(monthly.sum()) - float(cafe["revenue"].sum())) < 1.0, "The months should add back up to total revenue — use .sum()."`,
},
{
  id: 'ts-03', mins: 4,
  title: 'Rolling windows',
  concept: [
    '`.rolling(7).mean()` averages the latest 7 rows, at every row: a moving average.',
    'It smooths out the day-to-day ups and downs, so the trend underneath shows through.',
    'The first 6 values are `NaN` (missing): there aren\'t 7 days to average yet.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
smooth = daily.rolling(7).mean()

print(smooth.head(9))`,
  task: 'Make `smooth30`: the 30-day moving average of daily revenue.',
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
    '`.shift(1)` slides every value down one row, which puts yesterday next to today.',
    'Today minus yesterday is the change. `.pct_change()` gives it as a fraction of yesterday: 0.12 means 12% up.',
    'This is how every "up 12% on last week" number gets made.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()

print(daily.head(3))
print(daily.shift(1).head(3))`,
  task: 'Make `growth`: the **percentage change** in daily revenue from each day to the next.',
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
    'This is for dates in a **column**. When the dates are the index, leave out the `.dt`.',
  ],
  starter: `cafe["weekday"] = cafe["date"].dt.day_name()

cafe[["date", "weekday"]].head()`,
  task: 'Make `by_weekday`: the average `revenue` for each day of the week.',
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
    '`.expanding().mean()` averages everything from the start up to each day.',
    '`.ewm(span=14).mean()` is a moving average where recent days count for more, fading out over about 14 days. ewm stands for "exponentially weighted mean".',
    'Neither leaves missing values at the start, the way `.rolling()` does.',
  ],
  starter: `daily = cafe.set_index("date")["revenue"].resample("D").sum()

print(daily.expanding().mean().head(4))`,
  task: 'Make `ewma`: the `.ewm(span=14)` average of daily revenue.',
  hint: '`ewma = daily.ewm(span=14).mean()`',
  solution: `daily = cafe.set_index("date")["revenue"].resample("D").sum()
ewma = daily.ewm(span=14).mean()

print("NaNs:", int(ewma.isna().sum()))
ewma.tail(3).round(2)`,
  check: `assert "ewma" in globals(), "Make a variable called ewma."
assert len(ewma) == 120, "You should still have one value per day."
assert int(ewma.isna().sum()) == 0, "ewm doesn't wait for a full window, so nothing should be missing at the start."
_daily = cafe.set_index("date")["revenue"].resample("D").sum()
assert (ewma - _daily.ewm(span=14).mean()).abs().max() < 1e-6, "Check the span — it should be 14."`,
},
{
  id: 'ts-07', mins: 4,
  title: 'A whole year of weather',
  concept: [
    'A new table: `weather` — 365 days of temperature, rain and wind.',
    'Same moves as before, just more of it. Index by date, then resample.',
    'A year is long enough to show a shape that four months of café sales cannot.',
  ],
  starter: `print(weather.shape)
weather.head()`,
  task: 'Make `monthly_temp`: the average `temp_c` for each month of the year.',
  hint: '`weather.set_index("date")["temp_c"].resample("ME").mean()`',
  solution: `monthly_temp = (
    weather.set_index("date")["temp_c"]
           .resample("ME")
           .mean()
           .round(1)
)

monthly_temp`,
  check: `assert "monthly_temp" in globals(), "Make a variable called monthly_temp."
assert len(monthly_temp) == 12, "A year is 12 monthly buckets, you got %d." % len(monthly_temp)
assert float(monthly_temp.max()) > float(monthly_temp.min()) + 5, "There should be a clear summer and winter in there."`,
},
{
  id: 'ts-08', mins: 5,
  title: 'Seeing the shape through the noise',
  concept: [
    'Daily temperature jumps around. The **season** underneath it does not.',
    'A 30-day moving average flattens the day-to-day wobble and leaves the curve.',
    'Draw both on one chart and the point makes itself.',
  ],
  starter: `temp = weather.set_index("date")["temp_c"]

temp.plot(linewidth=.8)
plt.show()`,
  task: 'Make `smooth`, the 30-day moving average of `temp_c`, and draw it on the same chart as the daily line.',
  hint: '`smooth = temp.rolling(30).mean()`. Then `temp.plot()` and `smooth.plot()`, one after the other, before `plt.show()`.',
  solution: `temp = weather.set_index("date")["temp_c"]
smooth = temp.rolling(30).mean()

temp.plot(linewidth=.7, alpha=.45, label="daily")
smooth.plot(linewidth=2.5, label="30-day mean")
plt.legend()
plt.title("The season under the noise")
plt.tight_layout()
plt.show()`,
  check: `assert "smooth" in globals(), "Make a variable called smooth."
assert len(smooth) == 365, "You should still have one value per day."
assert int(smooth.isna().sum()) == 29, "A 30-day window leaves exactly 29 NaNs at the start, not %d." % int(smooth.isna().sum())
_ax = _axes()
assert _ax, "Draw the chart too."
assert len(_ax[0].lines) >= 2, "Plot the smoothed line over the raw daily one — I only see one line."`,
},
{
  id: 'ts-09', mins: 4,
  title: 'Which month is wettest?',
  concept: [
    '`.dt.month_name()` turns a date into "January", "February" and so on.',
    'Group by it and you get a seasonal answer rather than a daily one.',
    '`.idxmax()` gives the label of the biggest value (here, the month\'s name), not the value itself.',
  ],
  starter: `weather["month"] = weather["date"].dt.month_name()

weather.groupby("month")["rain_mm"].sum().head()`,
  task: 'Make `rain_by_month`: the total `rain_mm` for each month. Then print the name of the wettest month.',
  hint: 'Add the month column, group and sum, then `.idxmax()` on the result.',
  solution: `weather["month"] = weather["date"].dt.month_name()
rain_by_month = weather.groupby("month")["rain_mm"].sum()

print("wettest:", rain_by_month.idxmax())
rain_by_month.sort_values(ascending=False).round(1)`,
  check: `assert "rain_by_month" in globals(), "Make a variable called rain_by_month."
assert len(rain_by_month) == 12, "There are 12 month names, you got %d." % len(rain_by_month)
assert "January" in rain_by_month.index, "The index should hold month names — use .dt.month_name()."
_want = weather.groupby(weather["date"].dt.month_name())["rain_mm"].sum()
assert abs(float(rain_by_month.sum()) - float(_want.sum())) < 0.01, "Every day's rain should be counted once."`,
},
{
  id: 'ts-10', mins: 4,
  title: 'Days with nothing still count',
  concept: [
    "`orders` only has rows for days when somebody ordered. A quiet day simply isn't there.",
    '`.resample("D").size()` counts rows per calendar day — and gives **0** for the empty days instead of skipping them.',
    'An average per day is only honest once the zeros are in.',
  ],
  starter: `per_day = orders.groupby("order_date").size()
print(len(per_day), "days with at least one order")
per_day.mean()`,
  task: 'Make `daily`: the number of orders on **every** calendar day from the first order to the last, with 0 for the days with none. Compare its mean with the starter\'s.',
  hint: 'Put the dates in the index, then resample by day: `orders.set_index("order_date").resample("D").size()`',
  solution: `daily = orders.set_index("order_date").resample("D").size()

print(len(daily), "calendar days,", int((daily == 0).sum()), "with no orders")
daily.mean()`,
  check: `assert "daily" in globals(), "Make a variable called daily."
_span = (orders["order_date"].max() - orders["order_date"].min()).days + 1
assert len(daily) == _span, "Every calendar day from the first order to the last should be there: %d days." % _span
assert int(daily.sum()) == len(orders), "Every order should be counted exactly once."
assert int((daily == 0).sum()) > 0, "The quiet days should show up as 0."`,
},
];
