/* Time series (ts-01 to ts-10): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Examples use a tiny series made
   on the spot, or a different column, never the task's answer. */

const CAFE = { date: 'the day, 1 January to 29 April 2024', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const WEATHER = { date: 'every day of 2024', temp_c: 'the temperature, in °C', rain_mm: 'rain that day, in millimetres', wind_kph: 'wind speed, in km per hour' };
const GOT_CAFE = ['`cafe` has one row per day:', CAFE];
const GOT_WEATHER = ['`weather` has one row per day of 2024:', WEATHER];

export const TIMESERIES_DETAIL = {
'ts-01': {
  explain: [
    'The row labels down the left of a table are called its **index**.',
    '`cafe.set_index("date")` makes the dates the index, and suddenly pandas starts to understand time.',
    'Then `ts.loc["2024-02"]` picks a whole month, just by naming it.',
    '`ts.loc["2024-02-01":"2024-02-14"]` picks a range of dates, and **includes** the end date.',
    'You can pick columns at the same time: `ts.loc["2024-02", ["cups"]]`.',
  ],
  example: {
    say: 'Here are the first five days of March, picked by date, with two columns.',
    code: `ts = cafe.set_index("date")
ts.loc["2024-03-01":"2024-03-05", ["city", "cups"]]`,
    lines: [
      ['cafe.set_index("date")', 'the dates become the row labels.'],
      ['"2024-03-01":"2024-03-05"', 'from 1 March up to and including 5 March.'],
      ['["city", "cups"]', 'just these two columns.'],
    ],
  },
  brief: {
    story: 'The accountant wants February on its own.',
    get: [GOT_CAFE],
    want: ['Make `feb`: only the February rows', 'Picked by date with `.loc`, not with a filter'],
    out: '`feb` has 29 rows.',
  },
},
'ts-02': {
  explain: [
    '`.resample("W")` gathers the days into buckets of time, here one bucket per week.',
    'Think of it as groupby for time. The dates have to be the index.',
    'The letters set the size of each bucket: `D` for day, `W` week, `ME` month, `QE` quarter.',
    'Always follow it with a summary for each bucket: `.sum()`, `.mean()` or `.max()`.',
    'Each bucket is labelled with its last day.',
  ],
  example: {
    say: 'Here are the cups added up for each quarter of the year.',
    code: `ts = cafe.set_index("date")
ts["cups"].resample("QE").sum()`,
    lines: [
      ['resample("QE")', 'one bucket per quarter. The data runs to April, so there are two.'],
      ['.sum()', 'adds up the cups in each bucket.'],
    ],
  },
  brief: {
    story: 'The finance lead wants takings month by month.',
    get: [GOT_CAFE],
    want: ['Make `monthly`: the total revenue for each month', 'Use resample'],
    out: '`monthly` has four values, January to April.',
  },
},
'ts-03': {
  explain: [
    '`.rolling(7).mean()` averages the latest 7 rows, over and over at every row. It\'s called a **moving average**.',
    'It smooths out the day-to-day ups and downs, so the trend underneath shows through.',
    'The first 6 values come out `NaN`, missing, because there aren\'t 7 rows to average yet.',
    'A bigger window gives a smoother line, but it\'s slower to react when things change.',
    'Other summaries work too: `.rolling(7).sum()`, `.rolling(7).max()`.',
  ],
  example: {
    say: 'Here\'s a 3-row moving average of five numbers.',
    code: `s = pd.Series([10, 20, 30, 40, 50])
s.rolling(3).mean()`,
    lines: [
      ['rolling(3)', 'the latest 3 values at each row.'],
      ['the first two', 'NaN: there are not yet 3 values to average.'],
      ['row 2', '(10 + 20 + 30) / 3 = 20.'],
    ],
  },
  brief: {
    story: 'The owner wants a much smoother line, to see the trend over the season.',
    get: [GOT_CAFE],
    want: ['Make `smooth30`: the 30-day moving average of daily revenue'],
    out: '`smooth30` starts with 29 NaNs.',
  },
},
'ts-04': {
  explain: [
    '`.shift(1)` slides every value down one row, which puts yesterday right next to today.',
    'Today minus yesterday is the change.',
    '`.pct_change()` gives the change as a fraction of yesterday: 0.12 means 12% up, and -0.1 means 10% down.',
    'The first row has no yesterday, so it comes out as NaN.',
    'This is how every "up 12% on last week" headline number gets made.',
  ],
  example: {
    say: 'Here three days sit next to the day before, with the change as a fraction.',
    code: `s = pd.Series([100, 110, 99])
pd.DataFrame({"today": s, "yesterday": s.shift(1), "change": s.pct_change()})`,
    lines: [
      ['s.shift(1)', 'each value moved down a row: yesterday\'s number on today\'s row.'],
      ['s.pct_change()', '110 is 0.1 up on 100, and 99 is 0.1 down on 110.'],
    ],
  },
  brief: {
    story: 'The owner wants to know how much each day went up or down on the day before.',
    get: [GOT_CAFE],
    want: ['Make `growth`: the percentage change in daily revenue from each day to the next'],
    out: '`growth` is a fraction for each day, NaN on the first.',
  },
},
'ts-05': {
  explain: [
    'A date can be turned into a label. `.dt.day_name()` gives "Monday", `.dt.quarter` gives 1 to 4, and `.dt.is_month_end` is True on the last day of a month.',
    'Group by that label to answer questions like "which weekday is busiest?"',
    'Save the label as a column first, so you can see it and group by it.',
    'This is for dates in a **column**. When the dates are the index, leave out the `.dt`.',
  ],
  example: {
    say: 'Here the last days of each month are compared with the rest.',
    code: `cafe["month_end"] = cafe["date"].dt.is_month_end
cafe.groupby("month_end")["cups"].mean().round(1)`,
    lines: [
      ['.dt.is_month_end', 'True on 31 January, 29 February and 31 March, False on the rest.'],
      ['groupby("month_end")', 'two groups: the month ends, and every other day.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know which day of the week needs the most staff.',
    get: [GOT_CAFE],
    want: ['Make `by_weekday`: the average `revenue` for each day of the week'],
    out: '`by_weekday` has seven values, Monday to Sunday.',
  },
},
'ts-06': {
  explain: [
    '`.expanding().mean()` averages everything from the very start up to each row. It\'s a running average.',
    '`.ewm(span=14).mean()` is a moving average where recent rows count for more, and older ones fade out over about 14 rows.',
    'ewm stands for "exponentially weighted mean". It reacts to change faster than a plain moving average.',
    'Neither one leaves missing values at the start, the way `.rolling()` does.',
  ],
  example: {
    say: 'Here three steady values are followed by a jump, and the two averages react differently.',
    code: `s = pd.Series([10, 10, 10, 40])
pd.DataFrame({"value": s, "expanding": s.expanding().mean(), "ewm": s.ewm(span=3).mean().round(2)})`,
    lines: [
      ['s.expanding().mean()', 'the average of everything so far: the jump only lifts it to 17.5.'],
      ['s.ewm(span=3).mean()', 'the newest value counts most, so it moves much further towards 40.'],
    ],
  },
  brief: {
    story: 'The owner wants a trend line that reacts quickly when things change.',
    get: [GOT_CAFE],
    want: ['Make `ewma`: the `.ewm(span=14)` average of daily revenue'],
    out: '`ewma` has a value on every day, with no NaNs.',
  },
},
'ts-07': {
  explain: [
    'Meet a new table, `weather`: 365 days of temperature, rain and wind.',
    'The moves are the same as before. Make the dates the index, then resample.',
    'A whole year is long enough to show a seasonal shape, which four months of café sales can\'t.',
    'Pick the summary that suits the measure. Rain adds up, so use `.sum()`. Temperature doesn\'t, so use `.mean()`.',
  ],
  example: {
    say: 'Here\'s the rain added up for each quarter of the year.',
    code: `weather.set_index("date")["rain_mm"].resample("QE").sum().round(1)`,
    lines: [
      ['set_index("date")', 'the dates become the index, so resample works.'],
      ['resample("QE").sum()', 'the total rain in each quarter.'],
    ],
  },
  brief: {
    story: 'The café is planning an iced-drinks menu, and wants to know how warm each month is.',
    get: [GOT_WEATHER],
    want: ['Make `monthly_temp`: the average `temp_c` for each month of the year'],
    out: '`monthly_temp` has twelve values.',
  },
},
'ts-08': {
  explain: [
    'Daily temperature jumps all over the place. The **season** underneath it doesn\'t.',
    'A 30-day moving average irons out the day-to-day wobble and leaves the curve.',
    'Plot two lines before one `plt.show()` and they share a chart.',
    'Make the daily line thin and faint with `linewidth=` and `alpha=`, and the smooth one thick.',
    'Put `label=` on each, then call `plt.legend()`, so it\'s clear which is which.',
  ],
  example: {
    say: 'Here the rain is smoothed with a 30-day moving average.',
    code: `rain = weather.set_index("date")["rain_mm"]
rain.rolling(30).mean().plot()
plt.title("Rain, 30-day average")
plt.show()`,
    lines: [
      ['rain.rolling(30).mean()', 'the average rain over the latest 30 days, every day.'],
      ['.plot()', 'pandas draws it, dates along the bottom.'],
    ],
  },
  brief: {
    story: 'The owner wants a chart that shows the season clearly, but keeps the real daily numbers visible.',
    get: [GOT_WEATHER],
    want: ['Make `smooth`: the 30-day moving average of `temp_c`', 'Draw it on the same chart as the daily line'],
    out: 'One chart with two lines: the daily temperature and the smooth one.',
  },
},
'ts-09': {
  explain: [
    '`.dt.month_name()` turns a date into "January", "February" and so on.',
    'Group by it and you get a seasonal answer instead of a daily one.',
    '`.idxmax()` gives the label of the biggest value (here, the month\'s name), not the value itself.',
    '`.idxmin()` gives the label of the smallest.',
    'Month names sort A to Z, not by the calendar, so sort by the values when you show them.',
  ],
  example: {
    say: 'Here\'s the average wind in each month, and the calmest month.',
    code: `wind = weather.groupby(weather["date"].dt.month_name())["wind_kph"].mean()
print("calmest:", wind.idxmin())
wind.round(1).head(4)`,
    lines: [
      ['weather["date"].dt.month_name()', 'a month name for each day, used straight away to group.'],
      ['wind.idxmin()', 'the month with the lowest average wind.'],
      ['.head(4)', 'the first four, in alphabetical order: April, August, December, February.'],
    ],
  },
  brief: {
    story: 'The café wants to know when to have the umbrellas ready.',
    get: [GOT_WEATHER],
    want: ['Make `rain_by_month`: the total `rain_mm` for each month', 'Print the name of the wettest month'],
    out: 'The wettest month\'s name, then the twelve totals.',
  },
},
'ts-10': {
  explain: [
    '`orders` only has rows for days when somebody ordered. A quiet day simply isn\'t there.',
    'So an average per day taken straight from it leaves the quiet days out, and comes out too high.',
    '`.resample("D").size()` counts rows per calendar day, and gives **0** for the empty days instead of skipping them.',
    'The dates need to be the index first: `set_index("order_date")`.',
    'An average per day is only honest once the zeros are in.',
  ],
  example: {
    say: 'Here three visits over four days are counted per day, empty days included.',
    code: `visits = pd.Series(1, index=pd.to_datetime(["2024-03-01", "2024-03-01", "2024-03-04"]))
visits.resample("D").size()`,
    lines: [
      ['pd.Series(1, index=...)', 'one row per visit, with its date as the index.'],
      ['resample("D").size()', 'a count for every day: 2, then 0, 0, then 1.'],
    ],
  },
  brief: {
    story: 'The shop manager wants an honest number of orders per day, quiet days included.',
    get: [['`orders`:', { order_id: 'the order', customer_id: 'who placed it', order_date: 'the day it was placed', status: 'delivered, shipped or cancelled' }]],
    want: ['Make `daily`: the number of orders on every calendar day from the first to the last', '0 for the days with none', 'Compare its mean with the starter\'s'],
    out: '`daily` has a count for every day, and a lower mean than the starter\'s.',
  },
},
};
