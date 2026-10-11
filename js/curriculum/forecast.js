/* Forecasting — how many calls tomorrow, and how sure can we be?
   One series throughout: `calls`, two years of a contact centre's daily
   calls, with a weekly rhythm, a yearly swing and slow growth. Train on
   everything to 31 October 2024, test on November and December, and every
   method is scored the same way, so they can be compared honestly. */

const SM = ['statsmodels'];

const SPLIT = `train = calls[calls["date"] <= "2024-10-31"]
test = calls[calls["date"] > "2024-10-31"]
actual = test["calls"].to_numpy()`;

const SEASONAL = `seasonal = np.resize(train["calls"].iloc[-7:].to_numpy(), len(test))`;

const HW = `from statsmodels.tsa.holtwinters import ExponentialSmoothing
model = ExponentialSmoothing(train["calls"].to_numpy(), trend="add", seasonal="add", seasonal_periods=7).fit()
hw = model.forecast(len(test))`;

const FEATS = `def feats(d):
    X = pd.get_dummies(d["date"].dt.dayofweek, prefix="day").reindex(columns=["day_%d" % i for i in range(7)], fill_value=0).astype(int)
    X["t"] = (d["date"] - pd.Timestamp("2023-01-01")).dt.days.to_numpy()
    return X`;

const WAVE = `def feats(d):
    X = pd.get_dummies(d["date"].dt.dayofweek, prefix="day").reindex(columns=["day_%d" % i for i in range(7)], fill_value=0).astype(int)
    X["t"] = (d["date"] - pd.Timestamp("2023-01-01")).dt.days.to_numpy()
    doy = d["date"].dt.dayofyear.to_numpy()
    X["year_sin"] = np.sin(2 * np.pi * doy / 365.25)
    X["year_cos"] = np.cos(2 * np.pi * doy / 365.25)
    return X`;

// The reference split, rebuilt inside checks.
const REF = `_tr = calls[calls["date"] <= "2024-10-31"]
_te = calls[calls["date"] > "2024-10-31"]
_y = _te["calls"].to_numpy()`;

export const FORECAST = [

/* ── Before any model ──────────────────────────────────── */
{
  id: 'fc-01', mins: 3,
  title: 'Hold back the future',
  concept: [
    '`calls` is two years of daily calls to a contact centre. A **forecast** says how many calls to expect, so the right number of people are on shift.',
    'To test a forecast honestly, hide the most recent stretch, forecast it, and compare. Here: learn from everything up to 31 October 2024, test on November and December.',
    'Never shuffle a time series before splitting it. A model that has peeked at the future looks brilliant, then fails tomorrow.',
  ],
  starter: `calls.tail()`,
  task: 'Make `train` (every day up to and including 31 October 2024) and `test` (every day after it).',
  hint: '`train = calls[calls["date"] <= "2024-10-31"]` and `test = calls[calls["date"] > "2024-10-31"]`.',
  solution: `train = calls[calls["date"] <= "2024-10-31"]
test = calls[calls["date"] > "2024-10-31"]

len(train), len(test)`,
  check: `assert "train" in globals() and "test" in globals(), "Make train and test."
assert len(train) == int((calls["date"] <= "2024-10-31").sum()) and train["date"].max() == pd.Timestamp("2024-10-31"), "train is every day up to and including 31 October 2024."
assert len(test) == int((calls["date"] > "2024-10-31").sum()) and test["date"].min() == pd.Timestamp("2024-11-01"), "test is every day after 31 October 2024."`,
},
{
  id: 'fc-02', mins: 4,
  title: 'Tomorrow equals today',
  concept: [
    'The **naive forecast** says every future day will be like the last day you saw. It sounds silly, and it is the bar every real model has to beat.',
    '`np.repeat(value, n)` makes an array of n copies of one value.',
    '**Mean absolute error** (MAE) is the average size of the misses, ignoring which way: `np.abs(actual - forecast).mean()`. Lower is better, and it is in calls, so anyone can read it.',
  ],
  starter: `${SPLIT}
train.tail(3)`,
  task: "Make `naive`: the last training day's calls, repeated for every test day. Then set `mae_naive`: its mean absolute error against `actual`, rounded to 1.",
  hint: '`naive = np.repeat(train["calls"].iloc[-1], len(test))`, then `mae_naive = round(np.abs(actual - naive).mean(), 1)`.',
  solution: `${SPLIT}
naive = np.repeat(train["calls"].iloc[-1], len(test))
mae_naive = round(np.abs(actual - naive).mean(), 1)

mae_naive`,
  check: `${REF}
_f = np.repeat(_tr["calls"].iloc[-1], len(_te))
assert np.shape(globals().get("naive", [])) == (len(_te),) and np.allclose(naive, _f), "naive is the last training day's calls, once for every test day."
assert abs(float(mae_naive) - round(np.abs(_y - _f).mean(), 1)) < 1e-9, "mae_naive is np.abs(actual - naive).mean(), rounded to 1."`,
},
{
  id: 'fc-03', mins: 4,
  title: 'Same day last week',
  concept: [
    'Calls follow the week: Mondays are busy, Sundays quiet. The **seasonal naive** forecast copies the same weekday from the last week you saw.',
    '`np.resize(last_week, n)` repeats the last 7 days over and over until there are n values.',
    'One line of logic, and the error drops by more than half. Knowing the rhythm of your data is most of forecasting.',
  ],
  starter: `${SPLIT}
train["calls"].iloc[-7:]`,
  task: 'Make `seasonal`: the last 7 training days repeated across the whole test period. Then set `mae_seasonal`, rounded to 1.',
  hint: '`seasonal = np.resize(train["calls"].iloc[-7:].to_numpy(), len(test))`, then the same MAE as before.',
  solution: `${SPLIT}
${SEASONAL}
mae_seasonal = round(np.abs(actual - seasonal).mean(), 1)

mae_seasonal`,
  check: `${REF}
_f = np.resize(_tr["calls"].iloc[-7:].to_numpy(), len(_te))
assert np.shape(globals().get("seasonal", [])) == (len(_te),) and np.allclose(seasonal, _f), "seasonal repeats the last 7 training days across the test period: np.resize."
assert abs(float(mae_seasonal) - round(np.abs(_y - _f).mean(), 1)) < 1e-9, "mae_seasonal is its mean absolute error, rounded to 1."`,
},
{
  id: 'fc-04', mins: 3,
  title: 'Wrong by how many percent?',
  concept: [
    '**MAPE**, mean absolute percentage error, divides each miss by the actual value: `(np.abs(actual - forecast) / actual).mean() * 100`.',
    'It reads as "about 6% out on a typical day", which managers like. But it breaks down when actual values get near zero.',
    'Report it beside MAE, not instead of it. Missing by 25 calls on a quiet Sunday is a bigger miss than 25 on a Monday.',
  ],
  starter: `${SPLIT}
${SEASONAL}
np.abs(actual - seasonal).mean()`,
  task: 'Set `mape_seasonal`: the MAPE of the seasonal naive forecast, rounded to 1.',
  hint: '`mape_seasonal = round((np.abs(actual - seasonal) / actual).mean() * 100, 1)`',
  solution: `${SPLIT}
${SEASONAL}
mape_seasonal = round((np.abs(actual - seasonal) / actual).mean() * 100, 1)

mape_seasonal`,
  check: `${REF}
_f = np.resize(_tr["calls"].iloc[-7:].to_numpy(), len(_te))
assert abs(float(globals().get("mape_seasonal", -1)) - round((np.abs(_y - _f) / _y).mean() * 100, 1)) < 1e-9, "mape_seasonal is (np.abs(actual - seasonal) / actual).mean() * 100, rounded to 1."`,
},
{
  id: 'fc-05', mins: 4,
  title: 'An average of recent weeks',
  concept: [
    'One week can be odd. Averaging each weekday over the last 4 weeks steadies the forecast.',
    '`last4.groupby(last4["date"].dt.dayofweek)["calls"].mean()` gives one average per weekday, where 0 is Monday.',
    "`.map(...)` then looks each test day's weekday up in that table. The same idea as seasonal naive, with less noise.",
  ],
  starter: `${SPLIT}
last4 = train.iloc[-28:]
last4.head()`,
  task: "Make `by_weekday` from the last 28 training days, then `recent_avg`: each test day's weekday average, as an array. Set `mae_recent`, rounded to 1.",
  hint: '`by_weekday = last4.groupby(last4["date"].dt.dayofweek)["calls"].mean()`, then `recent_avg = test["date"].dt.dayofweek.map(by_weekday).to_numpy()`.',
  solution: `${SPLIT}
last4 = train.iloc[-28:]
by_weekday = last4.groupby(last4["date"].dt.dayofweek)["calls"].mean()
recent_avg = test["date"].dt.dayofweek.map(by_weekday).to_numpy()
mae_recent = round(np.abs(actual - recent_avg).mean(), 1)

mae_recent`,
  check: `${REF}
_l4 = _tr.iloc[-28:]
_w = _l4.groupby(_l4["date"].dt.dayofweek)["calls"].mean()
_f = _te["date"].dt.dayofweek.map(_w).to_numpy()
assert np.shape(globals().get("recent_avg", [])) == (len(_te),) and np.allclose(recent_avg, _f), "recent_avg is each test day's weekday average over the last 28 training days."
assert abs(float(mae_recent) - round(np.abs(_y - _f).mean(), 1)) < 1e-9, "mae_recent is its mean absolute error, rounded to 1."`,
},

/* ── Seeing the pattern ────────────────────────────────── */
{
  id: 'fc-06', mins: 4,
  title: 'The shape of a week',
  concept: [
    'A **weekday index** says how busy each day is compared with an average day: 1.2 means 20% busier than usual.',
    "Divide each weekday's average by the overall average, then put the days in order with `reindex`.",
    'Rotas are built on exactly this: staff for the Monday peak, not for the average day.',
  ],
  starter: `calls.groupby(calls["date"].dt.day_name())["calls"].mean()`,
  task: "Make `week_index`: each weekday's average calls divided by the overall average, Monday to Sunday, rounded to 2. Then set `busiest`: the busiest day's name.",
  hint: '`days = ["Monday", "Tuesday", ..., "Sunday"]`, then `(calls.groupby(calls["date"].dt.day_name())["calls"].mean() / calls["calls"].mean()).reindex(days).round(2)` and `.idxmax()`.',
  solution: `days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
week_index = (calls.groupby(calls["date"].dt.day_name())["calls"].mean() / calls["calls"].mean()).reindex(days).round(2)
busiest = week_index.idxmax()

week_index`,
  check: `_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
_w = (calls.groupby(calls["date"].dt.day_name())["calls"].mean() / calls["calls"].mean()).reindex(_days).round(2)
assert isinstance(globals().get("week_index"), pd.Series) and list(week_index.index) == _days, "week_index runs Monday to Sunday: reindex(days)."
assert np.allclose(week_index.astype(float), _w.astype(float)), "Each value is that weekday's average divided by the overall average, rounded to 2."
assert globals().get("busiest") == _w.idxmax(), "busiest is the day with the highest index."`,
},
{
  id: 'fc-07', mins: 4,
  title: 'The trend under the noise',
  concept: [
    'A **trend** is the slow drift under the daily ups and downs. Fit a straight line through the days, and its slope is the trend.',
    '`np.polyfit(x, y, 1)` fits a straight line and returns [slope, intercept]. Here x is the day number: 0, 1, 2 and so on.',
    'A slope of 0.1 calls a day sounds tiny. Over a year it is nearly 40 more calls every day, which is a new hire.',
  ],
  starter: `t = np.arange(len(calls))
t[:5]`,
  task: 'Set `slope`: the trend in calls per day, rounded to 3. Then `per_year`: the unrounded slope × 365, rounded to 0.',
  hint: '`s = np.polyfit(t, calls["calls"], 1)[0]`, then `slope = round(s, 3)` and `per_year = round(s * 365)`.',
  solution: `t = np.arange(len(calls))
s = np.polyfit(t, calls["calls"], 1)[0]
slope = round(s, 3)
per_year = round(s * 365)

slope, per_year`,
  check: `_s = np.polyfit(np.arange(len(calls)), calls["calls"], 1)[0]
assert abs(float(globals().get("slope", -1)) - round(_s, 3)) < 1e-9, "slope is np.polyfit(t, calls, 1)[0], rounded to 3."
assert abs(float(globals().get("per_year", -1)) - round(_s * 365)) < 1e-9, "per_year is the unrounded slope × 365, rounded to 0."`,
},
{
  id: 'fc-08', mins: 4, needs: SM,
  title: 'Pull it apart',
  concept: [
    '`seasonal_decompose(series, period=7)` from `statsmodels.tsa.seasonal` splits a series into three parts: the **trend**, the repeating **weekly pattern**, and the **residual**, whatever is left.',
    'It needs the dates as the index: `train.set_index("date")["calls"]`.',
    'The residual is the honest measure of how unpredictable a day is. Its spread is roughly the least any forecast will be wrong by.',
  ],
  starter: `${SPLIT}
train.set_index("date")["calls"].head()`,
  task: 'Decompose the training calls with `period=7`, as `parts`. Then set `weekly`: the first 7 values of `parts.seasonal`, rounded to 1, and `noise`: the standard deviation of `parts.resid`, rounded to 1.',
  hint: '`from statsmodels.tsa.seasonal import seasonal_decompose`, `parts = seasonal_decompose(train.set_index("date")["calls"], period=7)`, then `parts.seasonal.iloc[:7].round(1)` and `round(parts.resid.std(), 1)`.',
  solution: `from statsmodels.tsa.seasonal import seasonal_decompose

${SPLIT}
parts = seasonal_decompose(train.set_index("date")["calls"], period=7)
weekly = parts.seasonal.iloc[:7].round(1)
noise = round(parts.resid.std(), 1)

weekly, noise`,
  check: `from statsmodels.tsa.seasonal import seasonal_decompose as _sd
${REF}
_p = _sd(_tr.set_index("date")["calls"], period=7)
assert np.allclose(np.asarray(globals().get("weekly", []), dtype=float), _p.seasonal.iloc[:7].round(1).to_numpy()), "weekly is the first 7 values of parts.seasonal, rounded to 1. Decompose the training calls with period=7."
assert abs(float(noise) - round(_p.resid.std(), 1)) < 1e-9, "noise is the standard deviation of parts.resid, rounded to 1."`,
},
{
  id: 'fc-09', mins: 3,
  title: 'Does last week predict this week?',
  concept: [
    '**Autocorrelation** is a series correlated with itself, shifted. `calls["calls"].autocorr(7)` compares each day with the same day a week before.',
    'A value near 1 means knowing that earlier day tells you a lot about this one.',
    'Lag 7 far above lag 1 is the weekly cycle showing itself, and it is why the seasonal naive did so well.',
  ],
  starter: `calls["calls"].autocorr(1)`,
  task: 'Set `lag1` and `lag7`: the autocorrelation at 1 day and at 7 days, rounded to 3.',
  hint: '`lag1 = round(calls["calls"].autocorr(1), 3)` and the same with 7.',
  solution: `lag1 = round(calls["calls"].autocorr(1), 3)
lag7 = round(calls["calls"].autocorr(7), 3)

lag1, lag7`,
  check: `assert abs(float(globals().get("lag1", -9)) - round(calls["calls"].autocorr(1), 3)) < 1e-9, "lag1 is calls['calls'].autocorr(1), rounded to 3."
assert abs(float(globals().get("lag7", -9)) - round(calls["calls"].autocorr(7), 3)) < 1e-9, "lag7 is calls['calls'].autocorr(7), rounded to 3."`,
},
{
  id: 'fc-10', mins: 5, needs: ['scikit-learn'],
  title: 'A forecast you can explain',
  concept: [
    'A regression can forecast too. Give it columns that describe each day: its weekday (one column each, 1 or 0), the day number for the trend, and a yearly wave.',
    'The yearly wave is `np.sin` and `np.cos` of the day of the year, scaled to one full turn a year. Together they let the model learn a smooth yearly rise and fall.',
    'This is **feature engineering**: the model is simple, and the columns do the clever part.',
  ],
  starter: `from sklearn.linear_model import LinearRegression

${SPLIT}
${FEATS}
feats(train).head()`,
  task: 'Add `year_sin` and `year_cos` to `feats` (sin and cos of 2π × day of year ÷ 365.25). Fit a LinearRegression on the training days, make `reg`: its forecast for the test days, and set `mae_reg`, rounded to 1.',
  hint: 'Inside feats: `doy = d["date"].dt.dayofyear.to_numpy()`, `X["year_sin"] = np.sin(2 * np.pi * doy / 365.25)`, the same with cos. Then `m = LinearRegression().fit(feats(train), train["calls"])` and `reg = m.predict(feats(test))`.',
  solution: `from sklearn.linear_model import LinearRegression

${SPLIT}
${WAVE}
m = LinearRegression().fit(feats(train), train["calls"])
reg = m.predict(feats(test))
mae_reg = round(np.abs(actual - reg).mean(), 1)

mae_reg`,
  check: `from sklearn.linear_model import LinearRegression as _LR
${REF}
${WAVE.replace('def feats', 'def _feats')}
_f = _LR().fit(_feats(_tr), _tr["calls"]).predict(_feats(_te))
_X = feats(_te)
assert "year_sin" in _X.columns and "year_cos" in _X.columns, "Add year_sin and year_cos columns inside feats."
assert np.shape(globals().get("reg", [])) == (len(_te),) and np.allclose(reg, _f, atol=1e-6), "reg is the regression's forecast for the test days, fitted on feats(train)."
assert abs(float(mae_reg) - round(np.abs(_y - _f).mean(), 1)) < 1e-9, "mae_reg is its mean absolute error, rounded to 1."`,
},

/* ── Forecasting models ────────────────────────────────── */
{
  id: 'fc-11', mins: 4, needs: SM,
  title: 'Smoothing: recent days count more',
  concept: [
    '**Exponential smoothing** forecasts with a weighted average of the past: yesterday counts most, and each older day a little less.',
    '`SimpleExpSmoothing(values).fit()` from `statsmodels.tsa.holtwinters` picks the weighting itself, and `.forecast(n)` gives the next n days.',
    'Simple smoothing knows nothing about weekdays, so its forecast is one flat line. Watch it lose to "same day last week".',
  ],
  starter: `${SPLIT}
train["calls"].tail(10)`,
  task: 'Fit `SimpleExpSmoothing` on the training calls, make `smooth`: a forecast for every test day, and set `mae_smooth`, rounded to 1.',
  hint: '`from statsmodels.tsa.holtwinters import SimpleExpSmoothing`, then `smooth = SimpleExpSmoothing(train["calls"].to_numpy()).fit().forecast(len(test))`.',
  solution: `from statsmodels.tsa.holtwinters import SimpleExpSmoothing

${SPLIT}
smooth = SimpleExpSmoothing(train["calls"].to_numpy()).fit().forecast(len(test))
mae_smooth = round(np.abs(actual - smooth).mean(), 1)

mae_smooth`,
  check: `from statsmodels.tsa.holtwinters import SimpleExpSmoothing as _SES
${REF}
_f = _SES(_tr["calls"].to_numpy()).fit().forecast(len(_te))
assert np.shape(globals().get("smooth", [])) == (len(_te),) and np.allclose(smooth, _f, atol=1e-6), "smooth is SimpleExpSmoothing fitted on the training calls, forecast for every test day."
assert abs(float(mae_smooth) - round(np.abs(_y - _f).mean(), 1)) < 1e-9, "mae_smooth is its mean absolute error, rounded to 1."`,
},
{
  id: 'fc-12', mins: 4, needs: SM,
  title: 'Holt-Winters: trend and season',
  concept: [
    '**Holt-Winters** adds a trend and a repeating season to the smoothing: `ExponentialSmoothing(values, trend="add", seasonal="add", seasonal_periods=7)`.',
    '"add" means the weekly pattern adds the same number of calls each week, rather than growing with the level.',
    'It is a classic for contact centres and shops: quick to fit, easy to explain, hard to beat.',
  ],
  starter: `from statsmodels.tsa.holtwinters import ExponentialSmoothing

${SPLIT}
len(train)`,
  task: 'Fit Holt-Winters on the training calls (additive trend and season, period 7), make `hw`: its forecast for the test days, and set `mae_hw`, rounded to 1.',
  hint: '`model = ExponentialSmoothing(train["calls"].to_numpy(), trend="add", seasonal="add", seasonal_periods=7).fit()`, then `hw = model.forecast(len(test))`.',
  solution: `${SPLIT}
${HW}
mae_hw = round(np.abs(actual - hw).mean(), 1)

mae_hw`,
  check: `from statsmodels.tsa.holtwinters import ExponentialSmoothing as _ES
${REF}
_f = _ES(_tr["calls"].to_numpy(), trend="add", seasonal="add", seasonal_periods=7).fit().forecast(len(_te))
assert np.shape(globals().get("hw", [])) == (len(_te),) and np.allclose(hw, _f, atol=1e-4), "hw is the Holt-Winters forecast: additive trend and season, seasonal_periods=7."
assert abs(float(mae_hw) - round(np.abs(_y - _f).mean(), 1)) < 0.051, "mae_hw is its mean absolute error, rounded to 1."`,
},
{
  id: 'fc-13', mins: 4, needs: SM,
  title: 'Fancier is not always better',
  concept: [
    '**ARIMA** predicts each day from the days just before it. `ARIMA(values, order=(7, 1, 0))` uses the last 7 days, after taking day-to-day differences (the 1).',
    'It is famous and flexible, and here it does worse than Holt-Winters.',
    'Always compare with the simple ones. A model has to earn its complexity.',
  ],
  starter: `${SPLIT}
${HW}
mae_hw = round(np.abs(actual - hw).mean(), 1)
mae_hw`,
  task: 'Fit `ARIMA` with `order=(7, 1, 0)` on the training calls, forecast the test days as `arima`, and set `mae_arima`, rounded to 1. Then set `winner`: "Holt-Winters" if mae_hw is lower, otherwise "ARIMA".',
  hint: '`from statsmodels.tsa.arima.model import ARIMA`, `arima = ARIMA(train["calls"].to_numpy(), order=(7, 1, 0)).fit().forecast(len(test))`, then compare the two errors.',
  solution: `from statsmodels.tsa.arima.model import ARIMA

${SPLIT}
${HW}
mae_hw = round(np.abs(actual - hw).mean(), 1)
arima = ARIMA(train["calls"].to_numpy(), order=(7, 1, 0)).fit().forecast(len(test))
mae_arima = round(np.abs(actual - arima).mean(), 1)
winner = "Holt-Winters" if mae_hw < mae_arima else "ARIMA"

mae_hw, mae_arima, winner`,
  check: `from statsmodels.tsa.arima.model import ARIMA as _AR
${REF}
_f = _AR(_tr["calls"].to_numpy(), order=(7, 1, 0)).fit().forecast(len(_te))
assert np.shape(globals().get("arima", [])) == (len(_te),) and np.allclose(arima, _f, atol=1e-3), "arima is ARIMA(order=(7, 1, 0)) fitted on the training calls, forecast for the test days."
assert abs(float(mae_arima) - round(np.abs(_y - _f).mean(), 1)) < 0.051, "mae_arima is its mean absolute error, rounded to 1."
assert globals().get("winner") == ("Holt-Winters" if float(mae_hw) < float(mae_arima) else "ARIMA"), "winner is the model with the lower error."`,
},
{
  id: 'fc-14', mins: 5,
  title: 'Test it on more than one month',
  concept: [
    'One test period can flatter or punish a model by luck: an odd holiday week, a quiet spell.',
    '**Backtesting** repeats the test from several starting points and averages the errors. It is also called rolling-origin evaluation.',
    'Here: cut the data at the end of four months in turn, forecast the next 30 days with the 4-week weekday average, and score each one.',
  ],
  starter: `cuts = ["2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30"]
maes = []
cuts`,
  task: 'For each cut: train on the days up to it, test on the next 30 days, forecast with the weekday average of the last 28 training days, and add the MAE (rounded to 1) to `maes`. Then set `average`: the mean of `maes`, rounded to 1.',
  hint: 'In a loop: `tr = calls[calls["date"] <= cut]`, `te = calls[calls["date"] > cut].head(30)`, `last4 = tr.iloc[-28:]`, the weekday averages and `.map` as before, then `maes.append(round(float(np.abs(te["calls"].to_numpy() - f).mean()), 1))`.',
  solution: `cuts = ["2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30"]
maes = []
for cut in cuts:
    tr = calls[calls["date"] <= cut]
    te = calls[calls["date"] > cut].head(30)
    last4 = tr.iloc[-28:]
    by_weekday = last4.groupby(last4["date"].dt.dayofweek)["calls"].mean()
    f = te["date"].dt.dayofweek.map(by_weekday).to_numpy()
    maes.append(round(float(np.abs(te["calls"].to_numpy() - f).mean()), 1))
average = round(float(np.mean(maes)), 1)

maes, average`,
  check: `_m = []
for _cut in ["2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30"]:
    _tr = calls[calls["date"] <= _cut]
    _te = calls[calls["date"] > _cut].head(30)
    _l4 = _tr.iloc[-28:]
    _w = _l4.groupby(_l4["date"].dt.dayofweek)["calls"].mean()
    _f = _te["date"].dt.dayofweek.map(_w).to_numpy()
    _m.append(round(float(np.abs(_te["calls"].to_numpy() - _f).mean()), 1))
assert len(globals().get("maes", [])) == 4, "maes should hold four errors, one per cut."
assert np.allclose([float(x) for x in maes], _m), "Each error is the 4-week weekday average's MAE on the 30 days after that cut, rounded to 1."
assert abs(float(globals().get("average", -1)) - round(float(np.mean(_m)), 1)) < 1e-9, "average is the mean of maes, rounded to 1."`,
},
{
  id: 'fc-15', mins: 5, needs: SM,
  title: 'A range, not a point',
  concept: [
    'A forecast of 512 calls will be wrong. A range, "between 470 and 550, 95% of the time", is far more use for planning a rota.',
    "A simple range: the forecast ± 1.96 × the standard deviation of the model's errors on the training days.",
    '**Coverage** checks it: the share of test days whose actual calls landed inside the range. Aim for about 95%.',
  ],
  starter: `${SPLIT}
${HW}
hw[:5]`,
  task: 'Set `spread`: the standard deviation of the training errors (training calls minus `model.fittedvalues`). Make `lower` and `upper`: hw minus and plus 1.96 × spread. Then set `coverage`: the share of test days inside, rounded to 3.',
  hint: '`spread = (train["calls"].to_numpy() - model.fittedvalues).std()`, then `lower = hw - 1.96 * spread`, `upper = hw + 1.96 * spread`, and `((actual >= lower) & (actual <= upper)).mean()`.',
  solution: `${SPLIT}
${HW}
spread = (train["calls"].to_numpy() - model.fittedvalues).std()
lower = hw - 1.96 * spread
upper = hw + 1.96 * spread
coverage = round(float(((actual >= lower) & (actual <= upper)).mean()), 3)

round(spread, 1), coverage`,
  check: `${REF}
assert abs(float(globals().get("spread", -1)) - float((_tr["calls"].to_numpy() - model.fittedvalues).std())) < 1e-6, "spread is the std of the training errors: training calls minus model.fittedvalues."
assert np.allclose(lower, hw - 1.96 * spread) and np.allclose(upper, hw + 1.96 * spread), "lower and upper are hw minus and plus 1.96 × spread."
assert abs(float(coverage) - round(float(((_y >= lower) & (_y <= upper)).mean()), 3)) < 1e-9, "coverage is the share of test days with actual calls inside the range, rounded to 3."`,
},
];
