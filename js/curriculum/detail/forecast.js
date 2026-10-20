/* Forecasting (fc-01 to fc-15): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Examples use a few numbers made
   on the spot, so the idea is plain and the task's answer stays hidden. */

const CALLS = { date: 'every day of 2023 and 2024', calls: 'calls to the contact centre that day' };
const GOT_CALLS = ['`calls` has one row per day, 731 days:', CALLS];
const GOT_SPLIT = ['The starter splits `calls` into `train` (up to 31 October 2024) and `test` (November and December), and `actual` holds the test days\' real calls.'];

export const FORECAST_DETAIL = {
'fc-01': {
  explain: [
    '`calls` is two years of daily calls to a contact centre. A **forecast** says how many calls to expect, so the right number of people are on shift.',
    'To test a forecast honestly, hide the most recent stretch, forecast it, then compare with what really happened.',
    'The part you learn from is the **training** set; the hidden part is the **test** set.',
    'Here: learn from everything up to 31 October 2024, and test on November and December.',
    'Never shuffle a time series before splitting it. A model that has peeked at the future looks brilliant, then fails tomorrow.',
  ],
  example: {
    say: 'Here six days are split by date: the first four to learn from, the last two to test on.',
    code: `days = pd.DataFrame({"date": pd.date_range("2024-01-01", periods=6),
                     "sales": [5, 7, 6, 8, 9, 7]})
before = days[days["date"] <= "2024-01-04"]
after = days[days["date"] > "2024-01-04"]
print(len(before), len(after))
after`,
    lines: [
      ['<= "2024-01-04"', 'every day up to and including 4 January.'],
      ['> "2024-01-04"', 'every day after it: the future, kept hidden.'],
    ],
  },
  brief: {
    story: 'The contact centre wants a forecast it can trust, so it has to be tested on days the model never saw.',
    get: [GOT_CALLS],
    want: ['Make `train`: every day up to and including 31 October 2024', 'Make `test`: every day after it'],
    out: '`train` has 670 days and `test` has 61.',
  },
},
'fc-02': {
  explain: [
    'The **naive forecast** says every future day will be like the last day you saw.',
    'It sounds silly, and that is the point: it is the bar every real model has to beat.',
    '`np.repeat(value, n)` makes an array of n copies of one value.',
    '**Mean absolute error** (MAE) is the average size of the misses, ignoring which way: `np.abs(actual - forecast).mean()`.',
    'Lower is better, and it is measured in calls, so anyone can read it.',
  ],
  example: {
    say: 'Here three days are forecast as copies of the last day seen, and the misses are averaged.',
    code: `history = np.array([40, 42, 45])
real = np.array([47, 44, 50])
guess = np.repeat(history[-1], 3)
print(guess)
print("MAE:", round(np.abs(real - guess).mean(), 2))`,
    lines: [
      ['np.repeat(history[-1], 3)', 'the last value, 45, three times.'],
      ['np.abs(real - guess)', 'the misses, 2, 1 and 5, all counted as positive.'],
      ['.mean()', 'their average: about 2.67.'],
    ],
  },
  brief: {
    story: 'Before trying anything clever, the team wants to know how good the laziest forecast is.',
    get: [GOT_SPLIT],
    want: ["Make `naive`: the last training day's calls, repeated for every test day", "Set `mae_naive`: its MAE against `actual`, rounded to 1"],
    out: '`mae_naive` is one number, in calls.',
  },
},
'fc-03': {
  explain: [
    'Calls follow the week: Mondays are busy and Sundays quiet.',
    'The **seasonal naive** forecast copies the same weekday from the last week you saw.',
    '`train["calls"].iloc[-7:]` is the last 7 days of training.',
    '`np.resize(last_week, n)` repeats those 7 over and over until there are n values.',
    'One line of logic, and the error drops by more than half. Knowing the rhythm of your data is most of forecasting.',
  ],
  example: {
    say: 'Here one week of seven numbers is stretched to ten days.',
    code: `last_week = np.array([10, 12, 11, 13, 15, 6, 4])
np.resize(last_week, 10)`,
    lines: [
      ['np.resize(last_week, 10)', 'the 7 values, then the first 3 again: the week starts over.'],
    ],
  },
  brief: {
    story: 'A supervisor points out that Mondays are always busy. Can the forecast use that?',
    get: [GOT_SPLIT],
    want: ['Make `seasonal`: the last 7 training days repeated across the whole test period', 'Set `mae_seasonal`, rounded to 1'],
    out: '`mae_seasonal` is well below the naive forecast\'s error.',
  },
},
'fc-04': {
  explain: [
    '**MAPE**, mean absolute percentage error, divides each miss by the real value before averaging.',
    'In code: `(np.abs(actual - forecast) / actual).mean() * 100`.',
    'It reads as "about 6% out on a typical day", which managers like.',
    'It breaks down when real values get near zero, because dividing by a tiny number blows up.',
    'Report it beside MAE, not instead of it.',
  ],
  example: {
    say: 'Here three misses of 10 calls each are scored both ways.',
    code: `real = np.array([100, 200, 50])
forecast = np.array([90, 210, 60])
print("MAE:", np.abs(real - forecast).mean())
print("MAPE:", round((np.abs(real - forecast) / real).mean() * 100, 1))`,
    lines: [
      ['MAE', 'every miss is 10 calls, so the MAE is 10.'],
      ['MAPE', '10 out of 100 is 10%, of 200 is 5%, of 50 is 20%: about 11.7% on average.'],
    ],
  },
  brief: {
    story: 'The manager asks for the seasonal forecast\'s error as a percentage.',
    get: [GOT_SPLIT, ['`seasonal` is the seasonal naive forecast from the last lesson.']],
    want: ['Set `mape_seasonal`: the MAPE of the seasonal naive forecast, rounded to 1'],
    out: '`mape_seasonal` is one number, a percentage.',
  },
},
'fc-05': {
  explain: [
    'One week can be odd: a holiday, a system outage. Averaging each weekday over the last 4 weeks steadies the forecast.',
    '`.dt.dayofweek` turns a date into a number: 0 is Monday, 6 is Sunday.',
    '`last4.groupby(last4["date"].dt.dayofweek)["calls"].mean()` gives one average per weekday.',
    "`.map(...)` then looks each test day's weekday up in that table.",
    '`.to_numpy()` turns the result into a plain array, ready to compare with `actual`.',
  ],
  example: {
    say: 'Here two weeks give an average for each weekday, then three future days look theirs up.',
    code: `recent = pd.DataFrame({"date": pd.date_range("2024-03-04", periods=14),
                       "calls": np.arange(14) * 10})
avg = recent.groupby(recent["date"].dt.dayofweek)["calls"].mean()
future = pd.Series(pd.date_range("2024-03-18", periods=3))
future.dt.dayofweek.map(avg)`,
    lines: [
      ['groupby(...dt.dayofweek)', 'one average per weekday. 4 March is a Monday, so Monday is (0 + 70) / 2 = 35.'],
      ['future.dt.dayofweek.map(avg)', '18 to 20 March are Monday to Wednesday, so 35, 45 and 55.'],
    ],
  },
  brief: {
    story: 'Last week had a bank holiday in it, and copied straight it would spoil the forecast.',
    get: [GOT_SPLIT],
    want: ['Make `by_weekday` from the last 28 training days', "Make `recent_avg`: each test day's weekday average, as an array", 'Set `mae_recent`, rounded to 1'],
    out: '`mae_recent` is one number, in calls.',
  },
},
'fc-06': {
  explain: [
    'An **index** compares each group with an average: 1.2 means 20% busier than usual, and 0.8 means 20% quieter.',
    "Divide each weekday's average calls by the overall average to get a weekday index.",
    '`.dt.day_name()` gives the weekday names, but groupby sorts them alphabetically.',
    '`.reindex(days)` puts them back in calendar order, Monday to Sunday.',
    'Rotas are built on exactly this: staff for the Monday peak, not for the average day.',
  ],
  example: {
    say: 'Here is the same idea for months: how busy each month is against the average day.',
    code: `month_index = (calls.groupby(calls["date"].dt.month)["calls"].mean()
               / calls["calls"].mean()).round(2)
month_index`,
    lines: [
      ['groupby(calls["date"].dt.month)', 'one average per month number, 1 to 12.'],
      ['/ calls["calls"].mean()', 'divided by the average day, so 1.0 means a normal month.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know how much busier each weekday is than an average day.',
    get: [GOT_CALLS],
    want: ["Make `week_index`: each weekday's average calls divided by the overall average", 'Monday to Sunday, rounded to 2', "Set `busiest`: the busiest day's name"],
    out: '`week_index` has seven values in calendar order.',
  },
},
'fc-07': {
  explain: [
    'A **trend** is the slow drift under the daily ups and downs.',
    'Fit a straight line through the days, and its slope is the trend: how many calls it adds each day.',
    '`np.polyfit(x, y, 1)` fits a straight line and gives back [slope, intercept]. The 1 means a straight line.',
    'Here x is the day number: 0, 1, 2 and on, made with `np.arange(len(calls))`.',
    'A slope of 0.1 calls a day sounds tiny. Over a year it is nearly 40 more calls every day, which is a new hire.',
  ],
  example: {
    say: 'Here a line is fitted through five points that rise by 2 each time.',
    code: `x = np.arange(5)
y = np.array([10, 12, 14, 16, 18])
np.polyfit(x, y, 1)`,
    lines: [
      ['np.arange(5)', 'the day numbers 0 to 4.'],
      ['np.polyfit(x, y, 1)', 'the slope is 2 (up 2 a day) and the intercept 10 (where it starts).'],
    ],
  },
  brief: {
    story: 'The head of the centre asks whether calls are growing, and by how much a year.',
    get: [GOT_CALLS],
    want: ['Set `slope`: the trend in calls per day, rounded to 3', '`per_year`: the unrounded slope × 365, rounded to 0'],
    out: 'Two numbers: calls per day, and calls per year.',
  },
},
'fc-08': {
  explain: [
    '`seasonal_decompose(series, period=7)` splits a series into three parts.',
    'The **trend** is the slow drift; the **seasonal** part is the repeating weekly pattern; the **residual** is whatever is left.',
    'It comes from `statsmodels.tsa.seasonal`, and needs the dates as the index: `train.set_index("date")["calls"]`.',
    'The residual is the honest measure of how unpredictable a day is.',
    'Its spread is roughly the least any forecast will be wrong by.',
  ],
  example: {
    say: 'Here a series that swaps between 10 and 20 is pulled apart with a period of 2.',
    code: `from statsmodels.tsa.seasonal import seasonal_decompose
s = pd.Series([10, 20, 10, 20, 10, 20, 10, 20], index=pd.date_range("2024-01-01", periods=8))
parts = seasonal_decompose(s, period=2)
print(parts.trend.tolist())
print(parts.seasonal.round(1).tolist())`,
    lines: [
      ['parts.trend', 'a flat 15 in the middle, NaN at the ends where there is not enough either side.'],
      ['parts.seasonal', '-5, then +5, repeating: the swing around the trend.'],
    ],
  },
  brief: {
    story: 'The planners want the weekly pattern on its own, and a sense of how noisy a day is.',
    get: [GOT_SPLIT],
    want: ['Decompose the training calls with `period=7`, as `parts`', '`weekly`: the first 7 values of `parts.seasonal`, rounded to 1', '`noise`: the standard deviation of `parts.resid`, rounded to 1'],
    out: 'Seven weekly values, and one noise number.',
  },
},
'fc-09': {
  explain: [
    '**Autocorrelation** is a series compared with itself, shifted.',
    '`calls["calls"].autocorr(7)` compares each day with the same day a week before.',
    'A value near 1 means knowing that earlier day tells you a lot about this one. Near 0 means it tells you little.',
    'A value near -1 means they move in opposite directions.',
    'Lag 7 far above lag 1 is the weekly cycle showing itself.',
  ],
  example: {
    say: 'Here a series that flips between 1 and 5 is compared with itself one step back and two steps back.',
    code: `s = pd.Series([1, 5, 1, 5, 1, 5, 1, 5])
print(round(s.autocorr(1), 2), round(s.autocorr(2), 2))`,
    lines: [
      ['s.autocorr(1)', '-1: each value is the opposite of the one before.'],
      ['s.autocorr(2)', '1: each value is the same as the one two steps back.'],
    ],
  },
  brief: {
    story: 'A new analyst asks why "same day last week" works so well. Show them.',
    get: [GOT_CALLS],
    want: ['Set `lag1`: the autocorrelation at 1 day, rounded to 3', 'Set `lag7`: at 7 days, rounded to 3'],
    out: 'Two numbers, with `lag7` the bigger.',
  },
},
'fc-10': {
  explain: [
    'A regression can forecast too. Give it columns that describe each day, and it learns how each one moves the calls.',
    'The weekday becomes seven columns of 1 or 0, and a day number captures the trend.',
    'A yearly rise and fall needs a wave: `np.sin` and `np.cos` of the day of the year, scaled so a year is one full turn.',
    'Sin and cos together give every day of the year its own smooth position on that turn, so 31 December sits next to 1 January.',
    'This is **feature engineering**: the model is simple, and the columns do the clever part.',
  ],
  example: {
    say: 'Here four days, a quarter of a year apart, get their place on the yearly wave.',
    code: `doy = np.array([1, 92, 183, 274])
pd.DataFrame({"day_of_year": doy,
              "sin": np.sin(2 * np.pi * doy / 365.25).round(2),
              "cos": np.cos(2 * np.pi * doy / 365.25).round(2)})`,
    lines: [
      ['2 * np.pi * doy / 365.25', 'the day of the year as a fraction of a full turn.'],
      ['sin and cos', 'together they go round a circle once a year: (0, 1), (1, 0), (0, -1), (-1, 0).'],
    ],
  },
  brief: {
    story: 'The planners want a forecast whose workings they can explain to the board.',
    get: [GOT_SPLIT, ['The starter\'s `feats(d)` makes the weekday and day-number columns.']],
    want: ['Add `year_sin` and `year_cos` to `feats` (sin and cos of 2π × day of year ÷ 365.25)', 'Fit a LinearRegression on the training days', '`reg`: its forecast for the test days', 'Set `mae_reg`, rounded to 1'],
    out: '`mae_reg` is one number, in calls.',
  },
},
'fc-11': {
  explain: [
    '**Exponential smoothing** forecasts with a weighted average of the past: yesterday counts most, and each older day a little less.',
    '`SimpleExpSmoothing(values).fit()` from `statsmodels.tsa.holtwinters` picks the weighting itself.',
    '`.forecast(n)` gives the next n days.',
    'Simple smoothing knows nothing about weekdays or trends, so its forecast is one flat line.',
    'Expect it to lose to "same day last week" here.',
  ],
  example: {
    say: 'Here six values, which jump halfway, are smoothed and forecast three days ahead.',
    code: `from statsmodels.tsa.holtwinters import SimpleExpSmoothing
fit = SimpleExpSmoothing(np.array([20.0, 22, 21, 30, 31, 29])).fit()
fit.forecast(3).round(1)`,
    lines: [
      ['.fit()', 'works out how much weight the recent values should get.'],
      ['.forecast(3)', 'the same number three times: a flat line, close to the recent values.'],
    ],
  },
  brief: {
    story: 'A vendor says their smoothing tool is all you need. Test the idea.',
    get: [GOT_SPLIT],
    want: ['Fit `SimpleExpSmoothing` on the training calls', '`smooth`: a forecast for every test day', 'Set `mae_smooth`, rounded to 1'],
    out: '`mae_smooth` is one number, in calls.',
  },
},
'fc-12': {
  explain: [
    '**Holt-Winters** adds a trend and a repeating season to exponential smoothing.',
    '`ExponentialSmoothing(values, trend="add", seasonal="add", seasonal_periods=7)` sets it up for a weekly pattern.',
    '"add" means the weekly pattern adds the same number of calls each week, rather than growing with the level.',
    '`.fit()` learns it, and `.forecast(n)` looks ahead.',
    'It is a classic for contact centres and shops: quick to fit, easy to explain, hard to beat.',
  ],
  example: {
    say: 'Here three cycles of a 4-step pattern, climbing a little each time, are learned and continued.',
    code: `from statsmodels.tsa.holtwinters import ExponentialSmoothing
values = np.array([10, 20, 30, 15, 12, 22, 32, 17, 14, 24, 34, 19], dtype=float)
fit = ExponentialSmoothing(values, trend="add", seasonal="add", seasonal_periods=4).fit()
fit.forecast(4).round(1)`,
    lines: [
      ['seasonal_periods=4', 'the pattern repeats every 4 values.'],
      ['trend="add"', 'each cycle sits 2 higher than the last.'],
      ['.forecast(4)', 'the next cycle: the same shape, a little higher again.'],
    ],
  },
  brief: {
    story: 'The centre wants a proper forecasting model that knows about both the week and the growth.',
    get: [GOT_SPLIT],
    want: ['Fit Holt-Winters on the training calls: additive trend and season, period 7', '`hw`: its forecast for the test days', 'Set `mae_hw`, rounded to 1'],
    out: '`mae_hw` is one number, in calls.',
  },
},
'fc-13': {
  explain: [
    '**ARIMA** predicts each day from the days just before it.',
    '`ARIMA(values, order=(7, 1, 0))` uses the last 7 days (the 7), after taking day-to-day differences (the 1).',
    'A difference is today minus yesterday. Working on differences takes the trend out first.',
    'It is famous and flexible, but famous is not the same as best.',
    'Always compare with the simple ones. A model has to earn its complexity.',
  ],
  example: {
    say: 'Here are the day-to-day differences of four numbers: what the 1 in the order works on.',
    code: `np.diff([100, 104, 103, 110])`,
    lines: [
      ['np.diff(...)', 'each value minus the one before: 4, -1 and 7.'],
    ],
  },
  brief: {
    story: 'A consultant insists ARIMA will beat Holt-Winters. Put it to the test.',
    get: [GOT_SPLIT, ['The starter fits Holt-Winters and sets `mae_hw`.']],
    want: ['Fit `ARIMA` with `order=(7, 1, 0)` on the training calls', '`arima`: its forecast for the test days', 'Set `mae_arima`, rounded to 1', 'Set `winner`: "Holt-Winters" if `mae_hw` is lower, otherwise "ARIMA"'],
    out: 'Two errors, and the name of the winner.',
  },
},
'fc-14': {
  explain: [
    'One test period can flatter or punish a model by luck: an odd holiday week, a quiet spell.',
    '**Backtesting** repeats the test from several starting points, and averages the errors.',
    'It is also called rolling-origin evaluation: the point where training stops moves forward each time.',
    'A `for` loop does it: for each cut, split, forecast, score, and add the score to a list.',
    'The average of the list is a fairer score than any single month.',
  ],
  example: {
    say: 'Here the cut point moves forward three times, and each time the next day is forecast as the last one seen.',
    code: `sales = pd.Series([5, 6, 7, 8, 9, 10, 11, 12])
for cut in [4, 5, 6]:
    guess = sales.iloc[cut - 1]
    real = sales.iloc[cut]
    print("train on", cut, "days: guess", guess, "real", real)`,
    lines: [
      ['for cut in [4, 5, 6]', 'three different points where training stops.'],
      ['sales.iloc[cut - 1]', 'the last day of training, used as the guess.'],
      ['sales.iloc[cut]', 'the first day after it: what really happened.'],
    ],
  },
  brief: {
    story: 'The board asks whether the weekday-average forecast is really that good, or just lucky in one month.',
    get: [GOT_CALLS, ['The starter sets `cuts`: the ends of August, September, October and November 2024.']],
    want: ['For each cut: train on the days up to it, test on the next 30 days', 'Forecast with the weekday average of the last 28 training days', 'Add the MAE, rounded to 1, to `maes`', 'Set `average`: the mean of `maes`, rounded to 1'],
    out: '`maes` holds four errors, and `average` is their mean.',
  },
},
'fc-15': {
  explain: [
    'A forecast of 512 calls will be wrong. A range, "between 470 and 550, 95% of the time", is far more use for planning a rota.',
    "A simple range: the forecast plus or minus 1.96 × the standard deviation of the model's errors on the training days.",
    "The errors are the training calls minus what the model would have said: `model.fittedvalues`.",
    '**Coverage** checks the range: the share of test days whose real calls landed inside it.',
    'Aim for about 95%. Much lower, and the range is too narrow to trust.',
  ],
  example: {
    say: 'Here three forecasts get a range from a spread of 8, and the real values are checked against it.',
    code: `forecast = np.array([100, 120, 110])
real = np.array([104, 140, 108])
lower, upper = forecast - 1.96 * 8, forecast + 1.96 * 8
print(lower.round(1), upper.round(1))
print("coverage:", round(((real >= lower) & (real <= upper)).mean(), 2))`,
    lines: [
      ['forecast - 1.96 * 8', 'the bottom of each range, about 15.7 below the forecast.'],
      ['(real >= lower) & (real <= upper)', 'True where the real value fell inside. 140 did not.'],
      ['.mean()', 'the share inside: 2 out of 3.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know how many calls to plan for on a bad day, not just a typical one.',
    get: [GOT_SPLIT, ['The starter fits Holt-Winters as `model` and forecasts `hw`.']],
    want: ['Set `spread`: the standard deviation of the training errors (training calls minus `model.fittedvalues`)', 'Make `lower` and `upper`: hw minus and plus 1.96 × spread', 'Set `coverage`: the share of test days inside, rounded to 3'],
    out: '`coverage` is a share between 0 and 1.',
  },
},
};
