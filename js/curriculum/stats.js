/* Statistics — the uncertainty around the numbers: typical values and spread,
   sampling and standard error, intervals by formula and by bootstrap, then
   comparing groups honestly: intervals for a difference, t-tests, an A/B
   test, many comparisons, and effect size.

   Then (st-11 to st-35): chance and simulation, the common distributions
   (normal, binomial, Poisson), the central limit theorem, intervals and
   sample sizes for shares, expected value; correlation, regression,
   residuals and lurking variables; chi-square, paired, ANOVA and rank
   tests; and thinking like a statistician, by simulation: permutation
   tests, false alarms, power, peeking and regression to the mean.

   Every check works its answer out from the data, never a typed number.
   Simulations are seeded; where a learner could fairly draw the numbers
   in a different order, the check allows for chance rather than demand
   one exact result. Lessons that use scipy declare `needs`. */

const NAI_LAG = `nai = cafe.loc[cafe["city"] == "Nairobi", "cups"]
lag = cafe.loc[cafe["city"] == "Lagos", "cups"]`;

const SCIPY = ['scipy'];

/* The weather year, with what a seaside kiosk sold each day. Made up, but
   shaped like the real thing: iced drinks rise in a straight line with the
   temperature, hot drinks fall away in a curve, and sun cream follows the
   temperature too, though it has nothing to do with drinks. */
const HEAT = `rng = np.random.default_rng(11)
heat = weather[["date", "temp_c", "rain_mm"]].copy()
heat["iced"] = (5 + 2.2 * heat["temp_c"] + rng.normal(0, 6, len(heat))).round().clip(0)
heat["hot"] = (12 + 70 * np.exp(-heat["temp_c"] / 7) + rng.normal(0, 4, len(heat))).round().clip(0)
heat["suncream"] = (0.8 * heat["temp_c"] + rng.normal(0, 2, len(heat))).round(1).clip(0)`;

/* The two-proportion test from "An A/B test", as a function, for the
   simulation lessons at the end. */
const P_VALUE = `from math import erf, sqrt

def p_value(a, b, n):
    """Two-sided p-value: a conversions out of n against b out of n, as in "An A/B test"."""
    pool = (a + b) / (2 * n)
    if pool in (0, 1):
        return 1.0
    z = (b - a) / n / sqrt(pool * (1 - pool) * 2 / n)
    return 2 * (1 - 0.5 * (1 + erf(abs(z) / sqrt(2))))`;

export const STATS = [

/* ── Describing and sampling ───────────────────────────── */
{
  id: 'st-01', mins: 4,
  title: 'Typical means the median',
  concept: [
    'The mean adds everything up and divides, so one huge value drags it along. The median is the middle value, and a few big orders barely move it.',
    'When the mean sits well above the median, the data is **right-skewed**: lots of ordinary values and a long tail of big ones. Order values usually look like this.',
    'For "a typical order", give the median. Keep the mean for totals and budgets.',
  ],
  starter: `lines = order_items.merge(products, on="product_id")
lines["value"] = lines["qty"] * lines["price"]
lines.head()`,
  task: 'Make `order_value`: one total per order. Then set `mean_order`, `median_order`, and `skewed`: True if the mean is above the median.',
  hint: '`order_value = lines.groupby("order_id")["value"].sum()`, then `.mean()` and `.median()`.',
  solution: `lines = order_items.merge(products, on="product_id")
lines["value"] = lines["qty"] * lines["price"]
order_value = lines.groupby("order_id")["value"].sum()

mean_order = order_value.mean()
median_order = order_value.median()
skewed = mean_order > median_order
print(round(mean_order, 2), median_order, skewed)`,
  check: `for _v in ("order_value", "mean_order", "median_order", "skewed"):
    assert _v in globals(), "Set %s." % _v
_l = order_items.merge(products, on="product_id")
_ov = (_l["qty"] * _l["price"]).groupby(_l["order_id"]).sum()
assert len(order_value) == len(_ov), "order_value needs one total per order: %d of them." % len(_ov)
assert abs(float(mean_order) - _ov.mean()) < 0.01, "mean_order is the mean of the order totals."
assert abs(float(median_order) - _ov.median()) < 0.01, "median_order is the median of the order totals."
assert bool(skewed) == bool(_ov.mean() > _ov.median()), "skewed is whether the mean sits above the median."`,
},
{
  id: 'st-02', mins: 4,
  title: 'How spread out?',
  concept: [
    'Two cities can average the same and still behave nothing alike. Spread says how far values typically sit from the middle.',
    'The standard deviation (`.std()`) is roughly how far a typical value sits from the average, and a few extreme values push it up. The **interquartile range**, the value three quarters of the way up minus the value a quarter of the way up, covers the middle half and ignores the extremes.',
    '"68% of values within one standard deviation" only holds for bell-shaped data. Check it rather than assume it.',
  ],
  starter: `cafe["cups"].describe()`,
  task: 'Set `std_cups`, `iqr_cups` (the 75th percentile minus the 25th: `.quantile(0.75)` minus `.quantile(0.25)`), and `within_one`: the % of days whose cups are within one standard deviation of the mean, rounded to 1. Is it near 68?',
  hint: '`cups.quantile(0.75) - cups.quantile(0.25)`; for the share, `((cups - cups.mean()).abs() <= std_cups).mean() * 100`.',
  solution: `cups = cafe["cups"]
std_cups = cups.std()
iqr_cups = cups.quantile(0.75) - cups.quantile(0.25)
within_one = round(((cups - cups.mean()).abs() <= std_cups).mean() * 100, 1)
print(round(std_cups, 2), iqr_cups, within_one)`,
  check: `for _v in ("std_cups", "iqr_cups", "within_one"):
    assert _v in globals(), "Set %s." % _v
_c = cafe["cups"]
assert abs(float(std_cups) - _c.std()) < 0.01, "std_cups is cafe['cups'].std()."
assert abs(float(iqr_cups) - (_c.quantile(0.75) - _c.quantile(0.25))) < 0.01, "iqr_cups is the 75th percentile minus the 25th."
_w = ((_c - _c.mean()).abs() <= _c.std()).mean() * 100
assert abs(float(within_one) - _w) < 0.06, "within_one is the % of days within one standard deviation of the mean."`,
},
{
  id: 'st-03', mins: 5,
  title: 'One sample is one draw',
  concept: [
    'Any 30 days you pick give a slightly different mean. That wobble is **sampling variation**, and it is why a single number needs an error bar.',
    'Draw many samples and their means spread out by about the standard deviation ÷ √(sample size): the **standard error**. Bigger samples wobble less, but only by the square root.',
    '`np.random.default_rng(1)` makes the random draws come out the same every time, so the result can be checked.',
  ],
  starter: `rng = np.random.default_rng(1)
one = rng.choice(cafe["cups"], size=30, replace=True)
one.mean()`,
  task: 'Draw 500 samples of 30 days each (with replacement: a day can be picked more than once), and keep their means in `sample_means`. Then set `standard_error` by the formula: the standard deviation of cups divided by √30. Compare the two.',
  hint: 'Put the draw inside square brackets with `for _ in range(500)` on the end, and you get a list of 500 means: `[rng.choice(cafe["cups"], size=30, replace=True).mean() for _ in range(500)]`. The formula is `cafe["cups"].std() / np.sqrt(30)`.',
  solution: `rng = np.random.default_rng(1)
sample_means = [rng.choice(cafe["cups"], size=30, replace=True).mean() for _ in range(500)]
standard_error = cafe["cups"].std() / np.sqrt(30)
print("spread of the means:", round(np.std(sample_means), 2), "  formula:", round(standard_error, 2))`,
  check: `for _v in ("sample_means", "standard_error"):
    assert _v in globals(), "Set %s." % _v
assert len(sample_means) == 500, "Keep 500 sample means."
_se = cafe["cups"].std() / np.sqrt(30)
assert abs(float(standard_error) - _se) < 0.01, "standard_error is cups.std() / sqrt(30)."
assert abs(np.mean(sample_means) - cafe["cups"].mean()) < 1.5, "The sample means should centre on the mean of cups."
assert abs(np.std(sample_means) - _se) / _se < 0.2, "Each sample should be 30 days drawn with replacement, so the means spread by about the standard error."`,
},
{
  id: 'st-04', mins: 4,
  title: 'A 95% interval',
  concept: [
    'A 95% confidence interval is the estimate plus or minus about two standard errors: mean ± 1.96 × std ÷ √n.',
    'It says how precisely the data pins the **mean** down. It is not the range where 95% of days fall.',
    'Give the interval with the number. "36 cups a day (33 to 39)" says far more than "36".',
  ],
  starter: `cafe["cups"].mean()`,
  task: 'Set `ci_low` and `ci_high`: the 95% interval for mean cups per day, using all the days.',
  hint: '`se = cups.std() / np.sqrt(len(cups))`, then `cups.mean() - 1.96 * se` and `+ 1.96 * se`.',
  solution: `cups = cafe["cups"]
se = cups.std() / np.sqrt(len(cups))
ci_low = cups.mean() - 1.96 * se
ci_high = cups.mean() + 1.96 * se
print(f"{cups.mean():.1f} cups a day ({ci_low:.1f} to {ci_high:.1f})")`,
  check: `for _v in ("ci_low", "ci_high"):
    assert _v in globals(), "Set %s." % _v
_c = cafe["cups"]
_se = _c.std() / np.sqrt(len(_c))
assert abs(float(ci_low) - (_c.mean() - 1.96 * _se)) < 0.01, "ci_low is the mean minus 1.96 standard errors, with n as every day."
assert abs(float(ci_high) - (_c.mean() + 1.96 * _se)) < 0.01, "ci_high is the mean plus 1.96 standard errors."`,
},
{
  id: 'st-05', mins: 5,
  title: 'Bootstrap it',
  concept: [
    'The ±1.96 formula leans on assumptions. The **bootstrap** leans on the data instead: pick the same number of days again at random, repeats allowed, and work out the mean. Do that many times.',
    'The middle 95% of those resampled means, from the 2.5th to the 97.5th percentile, is the interval.',
    'When it agrees with the formula, both are probably fine. When they disagree, trust the bootstrap more.',
  ],
  starter: `cups = cafe["cups"].to_numpy()
se = cups.std(ddof=1) / np.sqrt(len(cups))
print(round(cups.mean() - 1.96 * se, 1), round(cups.mean() + 1.96 * se, 1))`,
  task: 'With `rng = np.random.default_rng(0)`, take 2000 resamples of all the days, keep their means, and set `boot_low` and `boot_high` to the 2.5th and 97.5th percentiles.',
  hint: '`means = [rng.choice(cups, size=len(cups), replace=True).mean() for _ in range(2000)]`, then `np.percentile(means, [2.5, 97.5])`.',
  solution: `rng = np.random.default_rng(0)
cups = cafe["cups"].to_numpy()
means = [rng.choice(cups, size=len(cups), replace=True).mean() for _ in range(2000)]
boot_low, boot_high = np.percentile(means, [2.5, 97.5])
print(round(boot_low, 1), round(boot_high, 1))`,
  check: `for _v in ("boot_low", "boot_high"):
    assert _v in globals(), "Set %s." % _v
_c = cafe["cups"]
_se = _c.std() / np.sqrt(len(_c))
_lo, _hi = _c.mean() - 1.96 * _se, _c.mean() + 1.96 * _se
assert float(boot_low) < _c.mean() < float(boot_high), "The interval should contain the mean of cups."
assert abs(float(boot_low) - _lo) < 1.0 and abs(float(boot_high) - _hi) < 1.0, "Resample every day (size=len(cups)), 2000 times, and take the 2.5th and 97.5th percentiles of the means."`,
},

/* ── Comparing groups ──────────────────────────────────── */
{
  id: 'st-06', mins: 5,
  title: 'Is the gap real?',
  concept: [
    'Nairobi sells more cups a day than Lagos, on average. Is that the cities, or the luck of which days fell where?',
    'A difference between two means has its own standard error: the square root of (variance₁ ÷ n₁ + variance₂ ÷ n₂). The variance, `.var()`, is the standard deviation squared, and n is how many days. The 95% interval is the difference ± 1.96 of those.',
    'If the interval includes 0, the data can\'t tell the cities apart, even though one number is bigger.',
  ],
  starter: `cafe.groupby("city")["cups"].agg(["mean", "std", "count"])`,
  task: 'Set `gap`: Nairobi\'s mean cups minus Lagos\'s. Then `gap_low` and `gap_high`, its 95% interval, and `clear`: True only if the interval leaves out 0.',
  hint: '`se = np.sqrt(nai.var() / len(nai) + lag.var() / len(lag))`, then `gap ± 1.96 * se`. Clear when `gap_low > 0 or gap_high < 0`.',
  solution: `${NAI_LAG}
gap = nai.mean() - lag.mean()
se = np.sqrt(nai.var() / len(nai) + lag.var() / len(lag))
gap_low, gap_high = gap - 1.96 * se, gap + 1.96 * se
clear = gap_low > 0 or gap_high < 0
print(f"Nairobi minus Lagos: {gap:.2f} cups (95% interval {gap_low:.2f} to {gap_high:.2f}). Clear: {clear}")`,
  check: `for _v in ("gap", "gap_low", "gap_high", "clear"):
    assert _v in globals(), "Set %s." % _v
_n = cafe.loc[cafe["city"] == "Nairobi", "cups"]
_l = cafe.loc[cafe["city"] == "Lagos", "cups"]
_g = _n.mean() - _l.mean()
_se = np.sqrt(_n.var() / len(_n) + _l.var() / len(_l))
assert abs(float(gap) - _g) < 0.01, "gap is Nairobi's mean minus Lagos's."
assert abs(float(gap_low) - (_g - 1.96 * _se)) < 0.01 and abs(float(gap_high) - (_g + 1.96 * _se)) < 0.01, "The interval is gap ± 1.96 × sqrt(var1/n1 + var2/n2)."
assert bool(clear) == bool(_g - 1.96 * _se > 0 or _g + 1.96 * _se < 0), "clear is True only when the interval leaves out 0."`,
},
{
  id: 'st-07', mins: 4, needs: ['scipy'],
  title: 'A t-test in one line',
  concept: [
    '`stats.ttest_ind(a, b, equal_var=False)` runs Welch\'s t-test. It asks how surprising a gap this size would be if the two groups were really the same.',
    'The p-value measures that surprise. Below 0.05 is the usual line for "unlikely to be chance", but it is a convention, not a law.',
    'A big p-value doesn\'t prove the groups are equal. It says this data can\'t show a difference.',
  ],
  starter: `from scipy import stats
${NAI_LAG}
nai.mean(), lag.mean()`,
  task: 'Run the test on Nairobi against Lagos. Set `p_value`, and `significant`: True if it is below 0.05.',
  hint: '`stats.ttest_ind(nai, lag, equal_var=False).pvalue`',
  solution: `from scipy import stats
${NAI_LAG}
p_value = stats.ttest_ind(nai, lag, equal_var=False).pvalue
significant = p_value < 0.05
print(round(p_value, 3), significant)`,
  check: `from scipy import stats as _stats
for _v in ("p_value", "significant"):
    assert _v in globals(), "Set %s." % _v
_p = _stats.ttest_ind(cafe.loc[cafe["city"] == "Nairobi", "cups"], cafe.loc[cafe["city"] == "Lagos", "cups"], equal_var=False).pvalue
assert abs(float(p_value) - _p) < 0.001, "p_value is from ttest_ind(nai, lag, equal_var=False)."
assert bool(significant) == bool(_p < 0.05), "significant is whether p_value is below 0.05."`,
},
{
  id: 'st-08', mins: 5,
  title: 'An A/B test',
  concept: [
    'Version B of a sign-up page converted 66 of 400 visitors. Version A converted 48 of 400. That is a 37.5% lift. Is it real?',
    'For two proportions, z is the difference in rates divided by √(p(1−p)(1/n₁ + 1/n₂)), where p pools both groups together.',
    'A two-sided p-value comes from the normal curve: `2 * (1 - NormalCDF(|z|))`, with `NormalCDF(x) = 0.5 * (1 + erf(x / √2))`.',
  ],
  starter: `from math import erf, sqrt
conversions = {"A": 48, "B": 66}
visitors = {"A": 400, "B": 400}`,
  task: 'Set `lift` (B\'s rate over A\'s, as a % increase), `z`, and `p_value`. Then `ship_b`: True only if p_value is below 0.05.',
  hint: 'Rates are conversions ÷ visitors; `pooled = (48 + 66) / 800`; `se = sqrt(pooled * (1 - pooled) * (1/400 + 1/400))`; `z = (rate_b - rate_a) / se`.',
  solution: `from math import erf, sqrt
conversions = {"A": 48, "B": 66}
visitors = {"A": 400, "B": 400}

rate_a = conversions["A"] / visitors["A"]
rate_b = conversions["B"] / visitors["B"]
lift = (rate_b - rate_a) / rate_a * 100

pooled = (conversions["A"] + conversions["B"]) / (visitors["A"] + visitors["B"])
se = sqrt(pooled * (1 - pooled) * (1 / visitors["A"] + 1 / visitors["B"]))
z = (rate_b - rate_a) / se
p_value = 2 * (1 - 0.5 * (1 + erf(abs(z) / sqrt(2))))
ship_b = p_value < 0.05
print(f"lift {lift:.1f}%, z = {z:.2f}, p = {p_value:.3f}, ship B: {ship_b}")`,
  check: `from math import erf as _erf, sqrt as _sqrt
for _v in ("lift", "z", "p_value", "ship_b"):
    assert _v in globals(), "Set %s." % _v
_a, _b = conversions["A"] / visitors["A"], conversions["B"] / visitors["B"]
_pool = (conversions["A"] + conversions["B"]) / (visitors["A"] + visitors["B"])
_z = (_b - _a) / _sqrt(_pool * (1 - _pool) * (1 / visitors["A"] + 1 / visitors["B"]))
_p = 2 * (1 - 0.5 * (1 + _erf(abs(_z) / _sqrt(2))))
assert abs(float(lift) - (_b - _a) / _a * 100) < 0.01, "lift is (rate B - rate A) / rate A x 100."
assert abs(float(z) - _z) < 0.001, "z is the difference in rates over the pooled standard error."
assert abs(float(p_value) - _p) < 0.001, "p_value is 2 x (1 - NormalCDF(|z|))."
assert bool(ship_b) == bool(_p < 0.05), "ship_b only if p_value is below 0.05, however big the lift looks."`,
},
{
  id: 'st-09', mins: 5, needs: ['scipy'],
  title: 'Many tests, some luck',
  concept: [
    'Test enough pairs and something passes p < 0.05 by chance alone. Four drinks make six pairs.',
    'The **Bonferroni correction** divides the threshold by the number of tests: 0.05 ÷ 6. Stricter, and honest about how many looks you took.',
    'Here one pair clears 0.05 on its own, then fails the corrected line. Reporting it as a finding would be reporting luck.',
  ],
  starter: `from itertools import combinations
from scipy import stats

drinks = sorted(cafe["drink"].unique())
list(combinations(drinks, 2))`,
  task: 'Run Welch\'s t-test on cups for every pair of drinks. Set `pairs_under_05`: the pairs with p below 0.05, and `pairs_after_correction`: those below 0.05 divided by the number of pairs. Keep each pair the way `combinations` gives it, like `("cold brew", "espresso")`.',
  hint: 'Loop over `combinations(drinks, 2)`; for each `(a, b)` take `stats.ttest_ind(cups of a, cups of b, equal_var=False).pvalue`, then filter twice.',
  solution: `from itertools import combinations
from scipy import stats

drinks = sorted(cafe["drink"].unique())
pairs = list(combinations(drinks, 2))
p = {}
for a, b in pairs:
    p[(a, b)] = stats.ttest_ind(cafe.loc[cafe["drink"] == a, "cups"],
                                cafe.loc[cafe["drink"] == b, "cups"], equal_var=False).pvalue

pairs_under_05 = [pair for pair in pairs if p[pair] < 0.05]
pairs_after_correction = [pair for pair in pairs if p[pair] < 0.05 / len(pairs)]
print("under 0.05:", pairs_under_05, "   after correction:", pairs_after_correction)`,
  check: `from itertools import combinations as _comb
from scipy import stats as _stats
for _v in ("pairs_under_05", "pairs_after_correction"):
    assert _v in globals(), "Set %s." % _v
_pairs = list(_comb(sorted(cafe["drink"].unique()), 2))
_p = {pr: _stats.ttest_ind(cafe.loc[cafe["drink"] == pr[0], "cups"], cafe.loc[cafe["drink"] == pr[1], "cups"], equal_var=False).pvalue for pr in _pairs}
_norm = lambda xs: sorted(tuple(sorted(x)) for x in xs)
assert _norm(pairs_under_05) == _norm([pr for pr in _pairs if _p[pr] < 0.05]), "pairs_under_05 is every pair with p below 0.05."
assert _norm(pairs_after_correction) == _norm([pr for pr in _pairs if _p[pr] < 0.05 / len(_pairs)]), "After correction, the line is 0.05 divided by the number of pairs."`,
},
{
  id: 'st-10', mins: 4,
  title: 'Significant is not the same as big',
  concept: [
    'A p-value mixes two things: how big the effect is, and how much data there is. With enough data, a trivial gap becomes "significant".',
    'An **effect size** measures the gap itself. Cohen\'s d is the difference in means divided by the pooled standard deviation.',
    'As a rough guide, 0.2 is small, 0.5 medium and 0.8 large. Say the size first, then the uncertainty.',
  ],
  starter: `${NAI_LAG}
nai.mean() - lag.mean()`,
  task: 'Set `d`: Cohen\'s d for Nairobi against Lagos, with the pooled standard deviation. Then `size`, by how big d is whatever its sign, `abs(d)`: `"negligible"` under 0.2, `"small"` under 0.5, `"medium"` under 0.8, otherwise `"large"`.',
  hint: '`pooled = np.sqrt(((n1 - 1) * nai.var() + (n2 - 1) * lag.var()) / (n1 + n2 - 2))`, then `d = (nai.mean() - lag.mean()) / pooled`.',
  solution: `${NAI_LAG}
n1, n2 = len(nai), len(lag)
pooled = np.sqrt(((n1 - 1) * nai.var() + (n2 - 1) * lag.var()) / (n1 + n2 - 2))
d = (nai.mean() - lag.mean()) / pooled
size = "negligible" if abs(d) < 0.2 else "small" if abs(d) < 0.5 else "medium" if abs(d) < 0.8 else "large"
print(round(d, 2), size)`,
  check: `for _v in ("d", "size"):
    assert _v in globals(), "Set %s." % _v
_n = cafe.loc[cafe["city"] == "Nairobi", "cups"]
_l = cafe.loc[cafe["city"] == "Lagos", "cups"]
_sp = np.sqrt(((len(_n) - 1) * _n.var() + (len(_l) - 1) * _l.var()) / (len(_n) + len(_l) - 2))
_d = (_n.mean() - _l.mean()) / _sp
assert abs(float(d) - _d) < 0.01, "d is the difference in means over the pooled standard deviation."
_want = "negligible" if abs(_d) < 0.2 else "small" if abs(_d) < 0.5 else "medium" if abs(_d) < 0.8 else "large"
assert size == _want, "By |d| = %.2f, the size is %s." % (abs(_d), _want)`,
},

/* ── Chance ────────────────────────────────────────────── */
{
  id: 'st-11', mins: 4,
  title: 'Chance, by trying it',
  concept: [
    'A **probability** is how often something happens in the long run, from 0 (never) to 1 (always). A fair die lands on six 1 time in 6: about 0.167.',
    'You can find one by **simulation**: have the computer try it thousands of times and count. `rng.integers(1, 7, size=10_000)` rolls a die 10,000 times, and `(rolls == 6).mean()` gives the share of sixes, since each True counts as 1.',
    'The more tries, the closer the share gets to the true probability: the **law of large numbers**. Ten rolls can easily give no sixes at all; ten thousand won\'t stray far.',
  ],
  starter: `rng = np.random.default_rng(5)
ten = rng.integers(1, 7, size=10)        # whole numbers from 1 up to 6: the 7 is left out
print(ten)
print("share of sixes in 10 rolls:", (ten == 6).mean())`,
  task: 'Roll 10,000 times into `rolls`, and set `share_six`: the share that are sixes. Then roll two dice 10,000 times each, `first` and `second`, and set `share_seven`: the share of throws where the two add up to 7. The exact answer is 6 in 36. Is yours close?',
  hint: '`rolls = rng.integers(1, 7, size=10_000)` and `share_six = (rolls == 6).mean()`. The same way for `first` and `second`, then `share_seven = ((first + second) == 7).mean()`.',
  solution: `rng = np.random.default_rng(5)
rolls = rng.integers(1, 7, size=10_000)
share_six = (rolls == 6).mean()

first = rng.integers(1, 7, size=10_000)
second = rng.integers(1, 7, size=10_000)
share_seven = ((first + second) == 7).mean()

print("sixes:", share_six, "  exact:", round(1 / 6, 4))
print("two dice making 7:", share_seven, "  exact:", round(6 / 36, 4))`,
  check: `for _v in ("rolls", "share_six", "first", "second", "share_seven"):
    assert _v in globals(), "Set %s." % _v
_r = np.asarray(rolls)
assert len(_r) == 10_000 and _r.min() >= 1 and _r.max() <= 6, "rolls should be 10,000 whole numbers from 1 to 6: rng.integers(1, 7, size=10_000)."
assert abs(float(share_six) - (_r == 6).mean()) < 1e-9, "share_six is the share of rolls that are 6: (rolls == 6).mean()."
assert abs(float(share_six) - 1 / 6) < 0.02, "With 10,000 rolls, the share of sixes should be close to 1 in 6, about 0.167."
_f, _s = np.asarray(first), np.asarray(second)
assert len(_f) == len(_s) == 10_000, "Roll each die 10,000 times: first and second."
assert abs(float(share_seven) - ((_f + _s) == 7).mean()) < 1e-9, "share_seven is the share of throws where first + second is 7."
assert abs(float(share_seven) - 6 / 36) < 0.02, "It should be close to 6 in 36, about 0.167: 6 of the 36 ways two dice can land make 7."`,
},
{
  id: 'st-12', mins: 4,
  title: 'If this, then that',
  concept: [
    'A **conditional probability** is a chance once you know something: the chance of a pastry, given that someone has a loyalty card. It\'s written P(pastry | card).',
    'Narrow down to the rows you know about, then take the share: card holders who bought a pastry, divided by all card holders.',
    'The order matters. P(pastry | card) and P(card | pastry) are different questions with different answers, and mixing them up is one of the commonest mistakes in reading statistics.',
  ],
  starter: `# 1,000 visitors last month: did they have a loyalty card, and did they buy a pastry?
table = pd.DataFrame({"pastry": [180, 120], "no pastry": [220, 480]},
                     index=["card", "no card"])
table`,
  task: 'Set `p_pastry`: the chance that any visitor bought a pastry. Then `p_pastry_given_card`: the chance among card holders, and `p_card_given_pastry`: the chance that a pastry buyer had a card.',
  hint: 'Every visitor: `table.values.sum()`. Pastry buyers: `table["pastry"].sum()`. Card holders: `table.loc["card"].sum()`. Card holders who bought one: `table.loc["card", "pastry"]`. Each answer is one of these divided by another.',
  solution: `table = pd.DataFrame({"pastry": [180, 120], "no pastry": [220, 480]},
                     index=["card", "no card"])

everyone = table.values.sum()
p_pastry = table["pastry"].sum() / everyone
p_pastry_given_card = table.loc["card", "pastry"] / table.loc["card"].sum()
p_card_given_pastry = table.loc["card", "pastry"] / table["pastry"].sum()
print(p_pastry, p_pastry_given_card, p_card_given_pastry)`,
  check: `for _v in ("p_pastry", "p_pastry_given_card", "p_card_given_pastry"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p_pastry) - 0.3) < 1e-9, "p_pastry is every pastry buyer (300) over every visitor (1,000): 0.3."
assert abs(float(p_pastry_given_card) - 0.45) < 1e-9, "p_pastry_given_card looks only at card holders: 180 of their 400 bought a pastry, 0.45."
assert abs(float(p_card_given_pastry) - 0.6) < 1e-9, "p_card_given_pastry looks only at pastry buyers: 180 of the 300 had a card, 0.6."`,
},
{
  id: 'st-13', mins: 4,
  title: 'How unusual is that day?',
  concept: [
    'A **z-score** says how many standard deviations a value sits from the mean: (value − mean) ÷ standard deviation. 0 is exactly average; +2 is two standard deviations above.',
    'It puts different things on one scale. A hot day and a wet day can be compared by how unusual each one is.',
    'In bell-shaped data, about 1 day in 20 lands beyond ±2. Rain isn\'t bell-shaped: most days are dry or damp, a few are downpours, so it goes there more often, and much further.',
  ],
  starter: `weather[["temp_c", "rain_mm"]].describe()`,
  task: 'Make `temp_z` and `rain_z`: every day\'s temperature and rain as z-scores. Then `hottest` and `wettest`: the biggest z-score in each, and `more_unusual`: `"temp"` or `"rain"`, whichever record is further from normal. Last, `rain_far`: the share of days whose rain z-score is beyond ±2.',
  hint: '`temp_z = (weather["temp_c"] - weather["temp_c"].mean()) / weather["temp_c"].std()`, and the same for `"rain_mm"`. `hottest = temp_z.max()`. `rain_far = (rain_z.abs() > 2).mean()`.',
  solution: `temp_z = (weather["temp_c"] - weather["temp_c"].mean()) / weather["temp_c"].std()
rain_z = (weather["rain_mm"] - weather["rain_mm"].mean()) / weather["rain_mm"].std()

hottest = temp_z.max()
wettest = rain_z.max()
more_unusual = "rain" if wettest > hottest else "temp"
rain_far = (rain_z.abs() > 2).mean()
print("hottest day, z =", round(hottest, 2))
print("wettest day, z =", round(wettest, 2))
print("more unusual:", more_unusual)
print("days with rain beyond 2:", round(rain_far * 100, 1), "%")`,
  check: `_t = (weather["temp_c"] - weather["temp_c"].mean()) / weather["temp_c"].std()
_r = (weather["rain_mm"] - weather["rain_mm"].mean()) / weather["rain_mm"].std()
for _v in ("temp_z", "rain_z", "hottest", "wettest", "more_unusual", "rain_far"):
    assert _v in globals(), "Set %s." % _v
assert np.allclose(np.asarray(temp_z, dtype=float), _t), "temp_z is (temp - mean) / standard deviation, for every day."
assert np.allclose(np.asarray(rain_z, dtype=float), _r), "rain_z is (rain - mean) / standard deviation, for every day."
assert abs(float(hottest) - _t.max()) < 1e-9 and abs(float(wettest) - _r.max()) < 1e-9, "hottest and wettest are the biggest z-score in each."
assert more_unusual == ("rain" if _r.max() > _t.max() else "temp"), "more_unusual is whichever record has the bigger z-score: the wettest day is %.1f, the hottest %.1f." % (_r.max(), _t.max())
assert abs(float(rain_far) - (_r.abs() > 2).mean()) < 1e-9, "rain_far is the share of days with a rain z-score beyond 2 either way: (rain_z.abs() > 2).mean()."`,
},
{
  id: 'st-14', mins: 5, needs: SCIPY,
  title: 'The bell curve',
  concept: [
    'Lots of measurements pile up in a **bell shape**: most near the middle, fewer further out, the same on both sides. This is the **normal distribution**, set by just its mean and standard deviation.',
    '`stats.norm.cdf(x, mean, sd)` gives the share of a normal distribution below x, so `1 - cdf` is the share above. `stats.norm.ppf(0.9, mean, sd)` goes the other way: the value that 90% fall below.',
    'It\'s a model, not the data. Before trusting what it predicts, compare it with what really happened.',
  ],
  starter: `from scipy import stats

# 500 espresso shots, timed in seconds
shots = pd.Series(np.random.default_rng(8).normal(27, 3, 500).round(1), name="seconds")
shots.plot.hist(bins=30)
plt.show()`,
  task: 'Set `m` and `s`: the mean and standard deviation of the shots. Then, from the bell curve with those, `predicted_over_32`: the share it expects to take longer than 32 seconds, and `actual_over_32`: the share that really did. Last, `slowest_tenth`: the time that only the slowest 10% go over.',
  hint: '`m, s = shots.mean(), shots.std()`. `predicted_over_32 = 1 - stats.norm.cdf(32, m, s)`, `actual_over_32 = (shots > 32).mean()`, and `slowest_tenth = stats.norm.ppf(0.9, m, s)`.',
  solution: `from scipy import stats

shots = pd.Series(np.random.default_rng(8).normal(27, 3, 500).round(1), name="seconds")
m, s = shots.mean(), shots.std()

predicted_over_32 = 1 - stats.norm.cdf(32, m, s)
actual_over_32 = (shots > 32).mean()
slowest_tenth = stats.norm.ppf(0.9, m, s)
print("over 32 s, predicted:", round(predicted_over_32, 3))
print("over 32 s, actual:   ", actual_over_32)
print("the slowest 10% take over", round(slowest_tenth, 1), "seconds")`,
  check: `from scipy import stats as _stats
for _v in ("m", "s", "predicted_over_32", "actual_over_32", "slowest_tenth"):
    assert _v in globals(), "Set %s." % _v
_m, _s = shots.mean(), shots.std()
assert abs(float(m) - _m) < 1e-9 and abs(float(s) - _s) < 1e-9, "m and s are shots.mean() and shots.std()."
assert abs(float(predicted_over_32) - (1 - _stats.norm.cdf(32, _m, _s))) < 1e-9, "predicted_over_32 is 1 - stats.norm.cdf(32, m, s): the share of the bell above 32."
assert abs(float(actual_over_32) - (shots > 32).mean()) < 1e-9, "actual_over_32 is the share of real shots over 32: (shots > 32).mean()."
assert abs(float(slowest_tenth) - _stats.norm.ppf(0.9, _m, _s)) < 1e-9, "slowest_tenth is stats.norm.ppf(0.9, m, s): 90% are faster than it."`,
},
{
  id: 'st-15', mins: 5, needs: SCIPY,
  title: 'Counting successes',
  concept: [
    'Repeat the same yes-or-no chance a set number of times and count the yeses: that count follows a **binomial distribution**. Here, 20 customers, each with a 30% chance of buying a pastry.',
    '`stats.binom.pmf(k, n, p)` is the chance of exactly k. `stats.binom.sf(k, n, p)` is the chance of **more than** k, so 10 or more is `sf(9, n, p)`.',
    'Check a formula against a simulation whenever you can: `rng.binomial(20, 0.3, size=10_000)` runs the morning 10,000 times.',
  ],
  starter: `from scipy import stats

# 20 customers come in. Each, on their own, has a 30% chance of buying a pastry.
n, p = 20, 0.3
print("on average:", n * p, "pastries a morning")`,
  task: 'Set `exactly_6`: the chance of exactly 6 pastries, and `ten_or_more`: the chance of 10 or more. Then check it by simulation: with `rng = np.random.default_rng(3)`, run 10,000 mornings with `rng.binomial(n, p, size=10_000)`, and set `sim_ten_or_more`: the share of mornings with 10 or more.',
  hint: '`exactly_6 = stats.binom.pmf(6, n, p)` and `ten_or_more = stats.binom.sf(9, n, p)`. Then `mornings = rng.binomial(n, p, size=10_000)` and `sim_ten_or_more = (mornings >= 10).mean()`.',
  solution: `from scipy import stats

n, p = 20, 0.3
exactly_6 = stats.binom.pmf(6, n, p)
ten_or_more = stats.binom.sf(9, n, p)

rng = np.random.default_rng(3)
mornings = rng.binomial(n, p, size=10_000)
sim_ten_or_more = (mornings >= 10).mean()
print("exactly 6:", round(exactly_6, 3))
print("10 or more:", round(ten_or_more, 3), "  simulated:", sim_ten_or_more)`,
  check: `from scipy import stats as _stats
for _v in ("exactly_6", "ten_or_more", "sim_ten_or_more"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(exactly_6) - _stats.binom.pmf(6, 20, 0.3)) < 1e-9, "exactly_6 is stats.binom.pmf(6, n, p)."
_want = _stats.binom.sf(9, 20, 0.3)
assert abs(float(ten_or_more) - _want) < 1e-9, "ten_or_more is stats.binom.sf(9, n, p): sf(9) means more than 9, so 10 or more. sf(10) would leave out exactly 10."
assert abs(float(sim_ten_or_more) - _want) < 0.015, "sim_ten_or_more should be close to %.3f: the share of 10,000 simulated mornings with 10 or more, (mornings >= 10).mean()." % _want`,
},

/* ── Distributions at work ─────────────────────────────── */
{
  id: 'st-16', mins: 5, needs: SCIPY,
  title: 'Customers per hour',
  concept: [
    'Counts of things that happen at random through time, like customers in an hour or orders in a day, usually follow a **Poisson distribution**, set by one number: the average count.',
    '`stats.poisson.cdf(k, mu)` is the chance of k or fewer, and `stats.poisson.sf(k, mu)` the chance of more than k.',
    'It answers staffing questions. If one barista can handle 12 customers an hour, how many hours a month will bring more?',
  ],
  starter: `from scipy import stats

mu = 9                       # customers an hour, on average
# 300 hours from the door counter's log (30 days of 10 hours)
hourly = pd.Series(np.random.default_rng(9).poisson(mu, 300), name="customers")
hourly.value_counts().sort_index().plot.bar()
plt.show()`,
  task: 'Set `p_rush`: the Poisson chance of more than 12 customers in an hour, and `expected_rush_hours`: how many of the 300 hours that predicts. Then `actual_rush_hours`: how many logged hours really had more than 12. Last, `p_quiet`: the chance of 4 or fewer.',
  hint: '`p_rush = stats.poisson.sf(12, mu)` and `expected_rush_hours = 300 * p_rush`. `actual_rush_hours = (hourly > 12).sum()`. `p_quiet = stats.poisson.cdf(4, mu)`.',
  solution: `from scipy import stats

mu = 9
hourly = pd.Series(np.random.default_rng(9).poisson(mu, 300), name="customers")

p_rush = stats.poisson.sf(12, mu)
expected_rush_hours = 300 * p_rush
actual_rush_hours = (hourly > 12).sum()
p_quiet = stats.poisson.cdf(4, mu)
print("rush hours: expected", round(expected_rush_hours, 1), " actual", actual_rush_hours)
print("a quiet hour (4 or fewer):", round(p_quiet, 3))`,
  check: `from scipy import stats as _stats
for _v in ("p_rush", "expected_rush_hours", "actual_rush_hours", "p_quiet"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p_rush) - _stats.poisson.sf(12, 9)) < 1e-9, "p_rush is stats.poisson.sf(12, mu): the chance of more than 12."
assert abs(float(expected_rush_hours) - 300 * _stats.poisson.sf(12, 9)) < 1e-6, "expected_rush_hours is 300 * p_rush."
assert int(actual_rush_hours) == int((hourly > 12).sum()), "actual_rush_hours counts the logged hours with more than 12: (hourly > 12).sum()."
assert abs(float(p_quiet) - _stats.poisson.cdf(4, 9)) < 1e-9, "p_quiet is stats.poisson.cdf(4, mu): 4 or fewer."`,
},
{
  id: 'st-17', mins: 5,
  title: 'Why averages look like bells',
  concept: [
    'Order values are lopsided: lots of small orders and a few big ones. **Skew** measures that: 0 is symmetrical, and above 0 means a long tail of big values.',
    'Yet the **average** of 30 orders, taken again and again, piles up in a bell shape. This is the **central limit theorem**: averages of enough values come out close to normal, whatever shape the values themselves have.',
    'It\'s why the ±1.96 intervals earlier in this track work at all. The bell of averages is also narrower than the data, by the √30 of the standard error.',
  ],
  starter: `lines = order_items.merge(products, on="product_id")
order_value = (lines["qty"] * lines["price"]).groupby(lines["order_id"]).sum()
print("skew of the orders:", round(order_value.skew(), 2))
order_value.plot.hist(bins=25)
plt.show()`,
  task: 'With `rng = np.random.default_rng(2)`, take 1,000 samples of 30 orders (repeats allowed) and keep each sample\'s mean in `sample_means`. Set `skew_means`: their skew. Then draw them side by side: `fig, (left, right) = plt.subplots(1, 2)`, with a histogram of `order_value` on `left` and of `sample_means` on `right`.',
  hint: '`sample_means = pd.Series([rng.choice(order_value, 30).mean() for _ in range(1000)])` and `skew_means = sample_means.skew()`. Then `left.hist(order_value, bins=25)`, `right.hist(sample_means, bins=25)` and `plt.show()`.',
  solution: `lines = order_items.merge(products, on="product_id")
order_value = (lines["qty"] * lines["price"]).groupby(lines["order_id"]).sum()

rng = np.random.default_rng(2)
sample_means = pd.Series([rng.choice(order_value, 30).mean() for _ in range(1000)])
skew_means = sample_means.skew()
print("skew of single orders:", round(order_value.skew(), 2))
print("skew of the averages: ", round(skew_means, 2))

fig, (left, right) = plt.subplots(1, 2, figsize=(7, 3.2))
left.hist(order_value, bins=25)
left.set_title("single orders")
right.hist(sample_means, bins=25)
right.set_title("averages of 30")
plt.show()`,
  check: `assert "sample_means" in globals() and len(sample_means) == 1000, "Keep 1,000 sample means in sample_means."
_sm = pd.Series(np.asarray(sample_means, dtype=float))
assert abs(_sm.mean() - order_value.mean()) < 0.05 * order_value.mean(), "The sample means should centre on the mean order value. Take 30 orders each time, from order_value."
_se = order_value.std() / np.sqrt(30)
assert abs(_sm.std() - _se) / _se < 0.2, "Each sample should be 30 orders, drawn with repeats allowed, so the means spread by about the standard error."
assert "skew_means" in globals() and abs(float(skew_means) - _sm.skew()) < 1e-6, "skew_means is sample_means.skew()."
assert abs(float(skew_means)) < order_value.skew() / 2, "The averages should be far less lopsided than the orders."
assert len([_a for _a in _axes() if _a.patches]) >= 2, "Draw both histograms, side by side: one on left, one on right."`,
},
{
  id: 'st-18', mins: 4,
  title: 'An interval for a share',
  concept: [
    'Shares need error bars too. 31% of rated days scoring 4.5 or more is one sample\'s answer; another stretch of days could give 25% or 37%.',
    'A share\'s standard error is √(p × (1 − p) ÷ n), where p is the share and n how many there are. The 95% interval is p ± 1.96 of those, as for a mean.',
    'With very few values, or a share near 0% or 100%, this simple version gets shaky. More data is the honest fix.',
  ],
  starter: `rated = cafe["rating"].dropna()          # only the days that have a rating
print(len(rated), "rated days")
(rated >= 4.5).value_counts()`,
  task: 'Set `n`: how many rated days there are, `p`: the share rated 4.5 or more, `se`: its standard error, and `low` and `high`: the 95% interval for the share.',
  hint: '`n = len(rated)`, `p = (rated >= 4.5).mean()`, `se = np.sqrt(p * (1 - p) / n)`, then `p - 1.96 * se` and `p + 1.96 * se`.',
  solution: `rated = cafe["rating"].dropna()
n = len(rated)
p = (rated >= 4.5).mean()
se = np.sqrt(p * (1 - p) / n)
low, high = p - 1.96 * se, p + 1.96 * se
print(f"{p:.0%} of rated days score 4.5 or more")
print(f"95% interval: {low:.0%} to {high:.0%}")`,
  check: `_r = cafe["rating"].dropna()
_p = (_r >= 4.5).mean()
_se = np.sqrt(_p * (1 - _p) / len(_r))
for _v in ("n", "p", "se", "low", "high"):
    assert _v in globals(), "Set %s." % _v
assert int(n) == len(_r), "n is how many days have a rating: len(rated), %d." % len(_r)
assert abs(float(p) - _p) < 1e-9, "p is the share of rated days at 4.5 or more: (rated >= 4.5).mean()."
assert abs(float(se) - _se) < 1e-9, "se is np.sqrt(p * (1 - p) / n)."
assert abs(float(low) - (_p - 1.96 * _se)) < 1e-9 and abs(float(high) - (_p + 1.96 * _se)) < 1e-9, "The interval is p - 1.96 * se to p + 1.96 * se."`,
},
{
  id: 'st-19', mins: 4,
  title: 'How many do you need?',
  concept: [
    'Before a survey, decide how precise it must be. The **margin of error** is the ± part of the interval: 1.96 standard errors.',
    'Turn the formula round to get the size. For a mean, n = (1.96 × sd ÷ margin)². For a share, n = 1.96² × p(1 − p) ÷ margin², and p = 0.5 gives the biggest answer, so it\'s the safe guess. Round **up** with `math.ceil`: you can\'t ask 384.2 people.',
    'Halving the margin takes four times the people. Precision is expensive.',
  ],
  starter: `import math

sd = cafe["cups"].std()
print("cups vary by about", round(sd, 1), "a day")`,
  task: 'Set `n_mean`: the days needed to pin mean cups down to within ±2 cups. Then `n_share`: the people a survey needs to get a share within ±5 percentage points (0.05), assuming p = 0.5. Then `n_share_half`: the same within ±2.5 points (0.025). Round each one up.',
  hint: '`n_mean = math.ceil((1.96 * sd / 2) ** 2)`, `n_share = math.ceil(1.96 ** 2 * 0.5 * 0.5 / 0.05 ** 2)`, and the same with `0.025` for `n_share_half`.',
  solution: `import math

sd = cafe["cups"].std()
n_mean = math.ceil((1.96 * sd / 2) ** 2)
n_share = math.ceil(1.96 ** 2 * 0.5 * 0.5 / 0.05 ** 2)
n_share_half = math.ceil(1.96 ** 2 * 0.5 * 0.5 / 0.025 ** 2)
print("the mean, ±2 cups:", n_mean, "days")
print("a share, ±5 points:", n_share, "people")
print("a share, ±2.5 points:", n_share_half, "people")`,
  check: `import math as _math
for _v in ("n_mean", "n_share", "n_share_half"):
    assert _v in globals(), "Set %s." % _v
_want = _math.ceil((1.96 * cafe["cups"].std() / 2) ** 2)
assert int(n_mean) == _want, "n_mean is math.ceil((1.96 * sd / 2) ** 2): %d days. Round up, not to the nearest." % _want
assert int(n_share) == 385, "n_share is math.ceil(1.96 ** 2 * 0.5 * 0.5 / 0.05 ** 2): 385 people."
assert int(n_share_half) == 1537, "n_share_half uses a margin of 0.025: 1537 people, four times as many."`,
},
{
  id: 'st-20', mins: 4,
  title: 'On average, is it worth it?',
  concept: [
    'The **expected value** is the average result if you repeated something many times: each outcome times its chance, all added up.',
    'A scratch card with every coffee: most cards win nothing, some a free cookie, a few a free coffee. The expected cost per card says what the promotion really costs.',
    'It\'s a long-run average. Any one month can land well away from it, which is why a simulation is a good check, and why budgets need some slack.',
  ],
  starter: `# A scratch card with every coffee: what each prize costs the cafe, and how often it comes up
prizes = pd.DataFrame({
    "prize":  ["nothing", "free cookie", "free coffee"],
    "cost":   [0.00, 1.50, 3.20],
    "chance": [0.80, 0.15, 0.05],
})
prizes`,
  task: 'Set `ev`: the expected cost per card. Then `monthly`: the expected cost of 2,000 cards. Check it by simulation: with `rng = np.random.default_rng(4)`, draw 2,000 cards with `rng.choice(prizes["cost"], size=2000, p=prizes["chance"])`, and set `simulated`: their total cost.',
  hint: '`ev = (prizes["cost"] * prizes["chance"]).sum()`, `monthly = 2000 * ev`, and `simulated = rng.choice(prizes["cost"], size=2000, p=prizes["chance"]).sum()`.',
  solution: `prizes = pd.DataFrame({
    "prize":  ["nothing", "free cookie", "free coffee"],
    "cost":   [0.00, 1.50, 3.20],
    "chance": [0.80, 0.15, 0.05],
})

ev = (prizes["cost"] * prizes["chance"]).sum()
monthly = 2000 * ev

rng = np.random.default_rng(4)
simulated = rng.choice(prizes["cost"], size=2000, p=prizes["chance"]).sum()
print(f"expected per card:   £{ev:.3f}")
print(f"expected a month:    £{monthly:.2f}")
print(f"one simulated month: £{simulated:.2f}")`,
  check: `for _v in ("ev", "monthly", "simulated"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(ev) - 0.385) < 1e-9, "ev is each cost times its chance, added up: (prizes['cost'] * prizes['chance']).sum(), 0.385."
assert abs(float(monthly) - 770) < 1e-6, "monthly is 2000 * ev: 770."
assert abs(float(simulated) - 770) < 160, "simulated should be the total cost of 2,000 simulated cards: rng.choice(prizes['cost'], size=2000, p=prizes['chance']).sum()."`,
},

/* ── Relationships ─────────────────────────────────────── */
{
  id: 'st-21', mins: 4,
  title: 'Do they move together?',
  concept: [
    '**Correlation**, written r, measures how closely two numbers move together along a straight line: +1 is a perfect rising line, −1 a perfect falling one, and 0 no straight-line link at all.',
    '`a.corr(b)` works it out. Always look at the scatter too: r is a single number, and very different pictures can share it.',
    'As a rough guide, around 0.1 is weak, 0.3 moderate and 0.5 or more strong. These are habits, not rules.',
  ],
  starter: `# The weather year, with what a seaside kiosk sold each day
${HEAT}
heat.head()`,
  task: 'Set `r_iced`: the correlation between temperature and iced drinks, and `r_rain`: between rain and iced drinks. Then draw a scatter of temperature against iced drinks.',
  hint: '`r_iced = heat["temp_c"].corr(heat["iced"])`, and the same with `"rain_mm"` for `r_rain`. Then `plt.scatter(heat["temp_c"], heat["iced"], s=8)` and `plt.show()`.',
  solution: `${HEAT}

r_iced = heat["temp_c"].corr(heat["iced"])
r_rain = heat["rain_mm"].corr(heat["iced"])
print("temperature:", round(r_iced, 2), "  rain:", round(r_rain, 2))

plt.scatter(heat["temp_c"], heat["iced"], s=8)
plt.xlabel("temperature (°C)")
plt.ylabel("iced drinks sold")
plt.show()`,
  check: `for _v in ("r_iced", "r_rain"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(r_iced) - heat["temp_c"].corr(heat["iced"])) < 1e-9, "r_iced is heat['temp_c'].corr(heat['iced'])."
assert abs(float(r_rain) - heat["rain_mm"].corr(heat["iced"])) < 1e-9, "r_rain is heat['rain_mm'].corr(heat['iced'])."
assert any(_a.collections for _a in _axes()), "Draw the scatter too: plt.scatter(heat['temp_c'], heat['iced'], s=8), then plt.show()."`,
},
{
  id: 'st-22', mins: 4,
  title: 'One wild point',
  concept: [
    'The usual correlation, **Pearson\'s r**, can be dragged about by a single extreme point: one typo can turn a strong link upside down.',
    '**Spearman\'s** correlation ranks the values first (1st, 2nd, 3rd...) and correlates the ranks. A wild value just becomes "the biggest", however big it is.',
    '`a.corr(b, method="spearman")`. When the two disagree a lot, look for an outlier, or a curve that isn\'t a straight line.',
  ],
  starter: `# 12 weeks: what was spent on adverts (in £100s), and how many people signed up.
# Week 1's sign-ups were typed as 300 instead of 30.
weeks = pd.DataFrame({
    "ads":     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "signups": [300, 15, 14, 19, 22, 21, 26, 29, 28, 33, 35, 38],
})
weeks.plot.scatter(x="ads", y="signups")
plt.show()`,
  task: 'Set `pearson`: the usual correlation between ads and sign-ups, and `spearman`: the rank correlation. Then `pearson_fixed`: the usual correlation without week 1.',
  hint: '`pearson = weeks["ads"].corr(weeks["signups"])`, then the same with `method="spearman"` for `spearman`. Without week 1: `fixed = weeks.iloc[1:]`, then `fixed["ads"].corr(fixed["signups"])`.',
  solution: `weeks = pd.DataFrame({
    "ads":     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "signups": [300, 15, 14, 19, 22, 21, 26, 29, 28, 33, 35, 38],
})

pearson = weeks["ads"].corr(weeks["signups"])
spearman = weeks["ads"].corr(weeks["signups"], method="spearman")
fixed = weeks.iloc[1:]
pearson_fixed = fixed["ads"].corr(fixed["signups"])
print("Pearson: ", round(pearson, 2))
print("Spearman:", round(spearman, 2))
print("Pearson, typo gone:", round(pearson_fixed, 2))`,
  check: `for _v in ("pearson", "spearman", "pearson_fixed"):
    assert _v in globals(), "Set %s." % _v
_w = weeks
assert abs(float(pearson) - _w["ads"].corr(_w["signups"])) < 1e-9, "pearson is weeks['ads'].corr(weeks['signups'])."
assert abs(float(spearman) - _w["ads"].corr(_w["signups"], method="spearman")) < 1e-9, "spearman is the same with method='spearman'."
assert abs(float(pearson_fixed) - _w.iloc[1:]["ads"].corr(_w.iloc[1:]["signups"])) < 1e-9, "pearson_fixed leaves out week 1: weeks.iloc[1:], then the usual correlation."`,
},
{
  id: 'st-23', mins: 5, needs: SCIPY,
  title: 'A line through it',
  concept: [
    '`stats.linregress(x, y)` fits the straight line y = intercept + slope × x that sits closest to the points. This is **linear regression**.',
    'The **slope** is the story: here, how many more iced drinks each extra degree brings. **r²**, the correlation squared, is the share of the ups and downs in sales that the line accounts for.',
    'Predict by putting a value into the line, but only inside the range you\'ve seen. This data stops at 26°C; the line knows nothing about a 40°C day.',
  ],
  starter: `from scipy import stats

${HEAT}
print("temperatures from", heat["temp_c"].min(), "to", heat["temp_c"].max(), "°C")`,
  task: 'Fit a line to iced drinks against temperature with `stats.linregress`, into `fit`. Then set `slope`, `r_squared`, and `at_25`: the iced drinks the line predicts for a 25°C day.',
  hint: '`fit = stats.linregress(heat["temp_c"], heat["iced"])`. Then `slope = fit.slope`, `r_squared = fit.rvalue ** 2`, and `at_25 = fit.intercept + fit.slope * 25`.',
  solution: `from scipy import stats

${HEAT}
fit = stats.linregress(heat["temp_c"], heat["iced"])
slope = fit.slope
r_squared = fit.rvalue ** 2
at_25 = fit.intercept + fit.slope * 25
print(f"each degree adds {slope:.1f} iced drinks")
print(f"the line explains {r_squared:.0%} of the ups and downs")
print(f"a 25°C day: about {at_25:.0f} iced drinks")

plt.scatter(heat["temp_c"], heat["iced"], s=8)
xs = np.array([heat["temp_c"].min(), heat["temp_c"].max()])
plt.plot(xs, fit.intercept + fit.slope * xs, color="black")
plt.show()`,
  check: `from scipy import stats as _stats
_f = _stats.linregress(heat["temp_c"], heat["iced"])
for _v in ("fit", "slope", "r_squared", "at_25"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(slope) - _f.slope) < 1e-9, "slope is fit.slope, from stats.linregress(heat['temp_c'], heat['iced']): temperature first, then iced drinks."
assert abs(float(r_squared) - _f.rvalue ** 2) < 1e-9, "r_squared is fit.rvalue ** 2."
assert abs(float(at_25) - (_f.intercept + _f.slope * 25)) < 1e-9, "at_25 is fit.intercept + fit.slope * 25."`,
},
{
  id: 'st-24', mins: 5,
  title: 'Check the leftovers',
  concept: [
    'A **residual** is what a fitted line got wrong for one point: the real value minus the line\'s prediction. `np.polyfit(x, y, 1)` fits a line, and `np.polyval(fit, x)` gives its predictions. With 2 instead of 1, it fits a curve that can bend once.',
    'Plot the residuals against x. A shapeless cloud around 0 means the line caught the pattern. A curve or a funnel means it didn\'t.',
    'Iced drinks rise in a straight line with temperature. Hot drinks don\'t: they\'re busy on cold days and level off once it\'s warm, and a straight line through that leaves a curve behind.',
  ],
  starter: `${HEAT}
plt.scatter(heat["temp_c"], heat["hot"], s=8)
plt.xlabel("temperature (°C)")
plt.ylabel("hot drinks sold")
plt.show()`,
  task: 'Fit a straight line to hot drinks against temperature, and make `residuals`: hot drinks minus what the line predicts. Draw the residuals against temperature. Then fit a curve (2 instead of 1), make `curve_residuals` the same way, and set `line_spread` and `curve_spread`: the standard deviation of each set of residuals.',
  hint: '`line = np.polyfit(heat["temp_c"], heat["hot"], 1)` and `residuals = heat["hot"] - np.polyval(line, heat["temp_c"])`. Draw with `plt.scatter(heat["temp_c"], residuals, s=8)`, `plt.axhline(0)` and `plt.show()`. The same with 2 for the curve; `.std()` for each spread.',
  solution: `${HEAT}
line = np.polyfit(heat["temp_c"], heat["hot"], 1)
residuals = heat["hot"] - np.polyval(line, heat["temp_c"])

curve = np.polyfit(heat["temp_c"], heat["hot"], 2)
curve_residuals = heat["hot"] - np.polyval(curve, heat["temp_c"])

line_spread = residuals.std()
curve_spread = curve_residuals.std()
print("left over by the line: ", round(line_spread, 1))
print("left over by the curve:", round(curve_spread, 1))

plt.scatter(heat["temp_c"], residuals, s=8)
plt.axhline(0, color="black")
plt.xlabel("temperature (°C)")
plt.ylabel("residual")
plt.show()`,
  check: `for _v in ("residuals", "curve_residuals", "line_spread", "curve_spread"):
    assert _v in globals(), "Set %s." % _v
_x, _y = heat["temp_c"], heat["hot"]
_r1 = _y - np.polyval(np.polyfit(_x, _y, 1), _x)
_r2 = _y - np.polyval(np.polyfit(_x, _y, 2), _x)
assert np.allclose(np.asarray(residuals, dtype=float), _r1), "residuals is hot drinks minus the line's prediction: heat['hot'] - np.polyval(line, heat['temp_c'])."
assert np.allclose(np.asarray(curve_residuals, dtype=float), _r2), "curve_residuals is the same with np.polyfit(..., 2)."
assert abs(float(line_spread) - _r1.std()) < 1e-6 and abs(float(curve_spread) - _r2.std()) < 1e-6, "line_spread and curve_spread are the .std() of each set of residuals."
assert any(_a.collections for _a in _axes()), "Draw the residuals against temperature: plt.scatter(heat['temp_c'], residuals, s=8)."`,
},
{
  id: 'st-25', mins: 5,
  title: 'Correlation isn\'t cause',
  concept: [
    'Two things can move together because a third drives both. Hot days sell more iced drinks **and** more sun cream, but sun cream doesn\'t make anyone thirsty.',
    'That third thing is a **lurking variable**, also called a confounder. Hold it steady and look again: among days of similar temperature, does the link survive?',
    '`pd.qcut(values, 8)` splits days into 8 equal-sized temperature bands, so you can work out the correlation inside each one.',
  ],
  starter: `${HEAT}
print("iced drinks and sun cream:", round(heat["iced"].corr(heat["suncream"]), 2))`,
  task: 'Set `overall`: the correlation between iced drinks and sun cream. Then add a column `band`: 8 equal-sized temperature bands, from `pd.qcut(heat["temp_c"], 8)`. Set `within`: a list of the correlation inside each band, and `within_avg`: their average. What\'s left of the link once temperature is held steady?',
  hint: '`heat["band"] = pd.qcut(heat["temp_c"], 8)`. Then `within = [g["iced"].corr(g["suncream"]) for _, g in heat.groupby("band", observed=True)]` and `within_avg = np.mean(within)`.',
  solution: `${HEAT}
overall = heat["iced"].corr(heat["suncream"])

heat["band"] = pd.qcut(heat["temp_c"], 8)
within = [g["iced"].corr(g["suncream"]) for _, g in heat.groupby("band", observed=True)]
within_avg = np.mean(within)
print("overall:", round(overall, 2))
print("within bands, on average:", round(within_avg, 2))`,
  check: `for _v in ("overall", "within", "within_avg"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(overall) - heat["iced"].corr(heat["suncream"])) < 1e-9, "overall is heat['iced'].corr(heat['suncream'])."
_b = pd.qcut(heat["temp_c"], 8)
_w = [g["iced"].corr(g["suncream"]) for _, g in heat.groupby(_b, observed=True)]
assert len(within) == 8, "within should hold 8 correlations, one for each band."
assert np.allclose(sorted(float(x) for x in within), sorted(_w)), "Each value in within is g['iced'].corr(g['suncream']) for one band from pd.qcut(heat['temp_c'], 8)."
assert abs(float(within_avg) - np.mean(_w)) < 1e-9, "within_avg is np.mean(within)."`,
},

/* ── More tests ────────────────────────────────────────── */
{
  id: 'st-26', mins: 5, needs: SCIPY,
  title: 'Counts in a table',
  concept: [
    'To ask whether two categories are linked, like time of day and what people order, count every combination in a table.',
    'The **chi-square test** compares those counts with what you\'d expect if the two had nothing to do with each other. `stats.chi2_contingency(table)` gives back four things: the statistic, the p-value, the degrees of freedom and the expected counts.',
    'A small p says they\'re linked, not where. Set the real counts beside the expected ones to see which cells stand out.',
  ],
  starter: `from scipy import stats

# 280 orders at the counter: time of day against what was ordered
table = pd.DataFrame({"hot coffee": [90, 40], "tea": [30, 35], "cold drink": [20, 65]},
                     index=["morning", "afternoon"])
table`,
  task: 'Run the test on `table`, unpacking it into `chi2, p, dof, expected`. Set `linked`: True if p is below 0.05, and `biggest`: the (time, drink) pair where the real count is furthest above the expected one. Then `cafe_p`: the p-value of the same test for city against drink in `cafe`.',
  hint: '`chi2, p, dof, expected = stats.chi2_contingency(table)`. `(table - expected).stack().idxmax()` gives the pair. For the cafe: `stats.chi2_contingency(pd.crosstab(cafe["city"], cafe["drink"]))[1]`, since the p-value is the second thing it gives back.',
  solution: `from scipy import stats

table = pd.DataFrame({"hot coffee": [90, 40], "tea": [30, 35], "cold drink": [20, 65]},
                     index=["morning", "afternoon"])

chi2, p, dof, expected = stats.chi2_contingency(table)
linked = p < 0.05
biggest = (table - expected).stack().idxmax()
cafe_p = stats.chi2_contingency(pd.crosstab(cafe["city"], cafe["drink"]))[1]

print("p:", "under 0.0001" if p < 0.0001 else round(p, 4))
print("linked:", linked)
print("stands out most:", biggest)
print(pd.DataFrame(expected, index=table.index, columns=table.columns).round(1))
print("cafe, city against drink: p =", round(cafe_p, 3))`,
  check: `from scipy import stats as _stats
_c = _stats.chi2_contingency(table)
for _v in ("chi2", "p", "dof", "expected", "linked", "biggest", "cafe_p"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p) - _c[1]) < 1e-12 and abs(float(chi2) - _c[0]) < 1e-9, "Unpack stats.chi2_contingency(table) into chi2, p, dof, expected, in that order."
assert bool(linked) == bool(_c[1] < 0.05), "linked is whether p is below 0.05."
assert tuple(biggest) == tuple((table - _c[3]).stack().idxmax()), "biggest is the pair where the real count beats the expected one by the most: (table - expected).stack().idxmax()."
assert abs(float(cafe_p) - _stats.chi2_contingency(pd.crosstab(cafe["city"], cafe["drink"]))[1]) < 1e-9, "cafe_p is the p-value for pd.crosstab(cafe['city'], cafe['drink'])."`,
},
{
  id: 'st-27', mins: 4, needs: SCIPY,
  title: 'Is it even?',
  concept: [
    'Sometimes the question is whether counts fit a pattern you had in mind, like "every weekday is equally busy". This is a **goodness-of-fit** test.',
    '`stats.chisquare(counts)` tests the counts against all being equal. Give it `f_exp=` to test against another pattern instead; the expected counts must add up to the same total.',
    'A small p says the pattern doesn\'t fit. Here that\'s useful: if weekends really are busier, staff them.',
  ],
  starter: `from scipy import stats

# A month of the door counter, added up by weekday
door = pd.Series([410, 395, 402, 418, 455, 610, 580],
                 index=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
door.plot.bar()
plt.show()`,
  task: 'Set `p_door`: the p-value for every weekday being equally busy at the door. Then make `by_day`: the shop\'s online `orders` counted by weekday, Monday first, and set `p_orders`: the same test on those.',
  hint: '`p_door = stats.chisquare(door).pvalue`. `by_day = orders["order_date"].dt.dayofweek.value_counts().sort_index()` (0 is Monday), then `p_orders = stats.chisquare(by_day).pvalue`.',
  solution: `from scipy import stats

door = pd.Series([410, 395, 402, 418, 455, 610, 580],
                 index=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
p_door = stats.chisquare(door).pvalue

by_day = orders["order_date"].dt.dayofweek.value_counts().sort_index()
p_orders = stats.chisquare(by_day).pvalue
print("door counter: p is", "under 0.0001" if p_door < 0.0001 else round(p_door, 4))
print("by weekday:", by_day.tolist())
print("orders: p =", round(p_orders, 3))`,
  check: `from scipy import stats as _stats
for _v in ("p_door", "by_day", "p_orders"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p_door) - _stats.chisquare(door).pvalue) < 1e-15, "p_door is stats.chisquare(door).pvalue."
_bd = orders["order_date"].dt.dayofweek.value_counts().sort_index()
assert list(by_day) == list(_bd), "by_day counts orders on each weekday, Monday (0) first: orders['order_date'].dt.dayofweek.value_counts().sort_index()."
assert abs(float(p_orders) - _stats.chisquare(_bd).pvalue) < 1e-9, "p_orders is stats.chisquare(by_day).pvalue."`,
},
{
  id: 'st-28', mins: 4, needs: SCIPY,
  title: 'Before and after',
  concept: [
    'When the same people are measured twice, before and after something, compare each one with themselves. The **paired t-test** works on those differences.',
    'People differ a lot from each other. Pairing cancels that out, so it can spot a small, steady change that comparing two crowds would miss.',
    '`stats.ttest_rel(after, before)` is the paired test. `stats.ttest_ind` would treat them as two groups of strangers and throw the pairing away.',
  ],
  starter: `from scipy import stats

# Drinks an hour made by 12 baristas, before and after a training day
before = np.array([22, 31, 18, 40, 27, 35, 24, 29, 38, 20, 33, 26])
after = np.array([24, 32, 21, 41, 29, 35, 26, 32, 39, 22, 34, 28])
print("each one's change:", after - before)`,
  task: 'Set `mean_gain`: the average change. Then `p_paired`, from `stats.ttest_rel(after, before)`, and `p_unpaired`, from `stats.ttest_ind(after, before)`, which wrongly treats them as two separate groups. Which notices that the training worked?',
  hint: '`mean_gain = (after - before).mean()`, `p_paired = stats.ttest_rel(after, before).pvalue`, `p_unpaired = stats.ttest_ind(after, before).pvalue`.',
  solution: `from scipy import stats

before = np.array([22, 31, 18, 40, 27, 35, 24, 29, 38, 20, 33, 26])
after = np.array([24, 32, 21, 41, 29, 35, 26, 32, 39, 22, 34, 28])

mean_gain = (after - before).mean()
p_paired = stats.ttest_rel(after, before).pvalue
p_unpaired = stats.ttest_ind(after, before).pvalue
print("average gain:", round(mean_gain, 2), "drinks an hour")
print("paired p:", "under 0.0001" if p_paired < 0.0001 else round(p_paired, 4))
print("unpaired p:", round(p_unpaired, 2))`,
  check: `from scipy import stats as _stats
for _v in ("mean_gain", "p_paired", "p_unpaired"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(mean_gain) - (after - before).mean()) < 1e-9, "mean_gain is (after - before).mean()."
assert abs(float(p_paired) - _stats.ttest_rel(after, before).pvalue) < 1e-12, "p_paired is stats.ttest_rel(after, before).pvalue."
assert abs(float(p_unpaired) - _stats.ttest_ind(after, before).pvalue) < 1e-9, "p_unpaired is stats.ttest_ind(after, before).pvalue."`,
},
{
  id: 'st-29', mins: 5, needs: SCIPY,
  title: 'More than two groups',
  concept: [
    'Comparing three branches with t-tests means three pairs, and the many-tests problem again. **ANOVA** asks one question first: could all the group means be the same?',
    '`stats.f_oneway(a, b, c)` weighs how far apart the group means are against how spread out each group is inside.',
    'A small p says at least one group differs, not which one. Then look at the means, and use the corrected pairwise tests from "Many tests, some luck".',
  ],
  starter: `from scipy import stats

rng = np.random.default_rng(13)
# 40 waits timed at each branch, in minutes
waits = pd.DataFrame({
    "branch": np.repeat(["Lagos", "Accra", "Nairobi"], 40),
    "minutes": np.concatenate([rng.normal(6, 2, 40), rng.normal(6.5, 2, 40), rng.normal(8, 2, 40)]).round(1),
})
waits.groupby("branch")["minutes"].mean()`,
  task: 'Set `p_waits`: the ANOVA p-value for waits at the three branches. Then `p_cups`: the same for cups a day across the three cities in `cafe`.',
  hint: 'Make a list of each group\'s values, `groups = [g["minutes"] for _, g in waits.groupby("branch")]`, then `stats.f_oneway(*groups).pvalue`. The `*` hands the list over as separate groups. The same with `cafe` grouped by `"city"`, taking `"cups"`.',
  solution: `from scipy import stats

rng = np.random.default_rng(13)
waits = pd.DataFrame({
    "branch": np.repeat(["Lagos", "Accra", "Nairobi"], 40),
    "minutes": np.concatenate([rng.normal(6, 2, 40), rng.normal(6.5, 2, 40), rng.normal(8, 2, 40)]).round(1),
})

groups = [g["minutes"] for _, g in waits.groupby("branch")]
p_waits = stats.f_oneway(*groups).pvalue
p_cups = stats.f_oneway(*[g["cups"] for _, g in cafe.groupby("city")]).pvalue
print("waits: p =", round(p_waits, 4))
print("cafe cups by city: p =", round(p_cups, 3))
print(waits.groupby("branch")["minutes"].mean().round(2).to_string())`,
  check: `from scipy import stats as _stats
for _v in ("p_waits", "p_cups"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p_waits) - _stats.f_oneway(*[g["minutes"] for _, g in waits.groupby("branch")]).pvalue) < 1e-12, "p_waits is stats.f_oneway(*groups).pvalue, with one group of minutes per branch."
assert abs(float(p_cups) - _stats.f_oneway(*[g["cups"] for _, g in cafe.groupby("city")]).pvalue) < 1e-9, "p_cups is the same for cafe['cups'], grouped by city."`,
},
{
  id: 'st-30', mins: 5, needs: SCIPY,
  title: 'When the data is lopsided',
  concept: [
    'A t-test compares means. With lopsided data and few values, one huge value can swing a mean, and the test with it.',
    'A **rank test** compares the groups by order instead. `stats.mannwhitneyu(a, b)` ranks every value from both groups together and asks whether one group\'s ranks tend to run higher.',
    'It answers "does one group tend to be bigger?" rather than "are the means different?". Reach for it with spending, waiting times and incomes: long tails and few values.',
  ],
  starter: `from scipy import stats

rng = np.random.default_rng(17)
plain = rng.lognormal(3.0, 0.5, 30).round(2)       # 30 baskets without a voucher (£)
plain[0] = 900.0                                    # one office ordered for the whole floor
voucher = rng.lognormal(3.5, 0.5, 30).round(2)      # 30 baskets with one
print("means:  ", round(plain.mean(), 2), round(voucher.mean(), 2))
print("medians:", np.median(plain), np.median(voucher))`,
  task: 'Set `p_t`: Welch\'s t-test p-value for voucher against plain, and `p_rank`: the Mann-Whitney p-value. Then `median_gap`: the voucher median minus the plain median.',
  hint: '`p_t = stats.ttest_ind(voucher, plain, equal_var=False).pvalue`, `p_rank = stats.mannwhitneyu(voucher, plain).pvalue`, and `median_gap = np.median(voucher) - np.median(plain)`.',
  solution: `from scipy import stats

rng = np.random.default_rng(17)
plain = rng.lognormal(3.0, 0.5, 30).round(2)
plain[0] = 900.0
voucher = rng.lognormal(3.5, 0.5, 30).round(2)

p_t = stats.ttest_ind(voucher, plain, equal_var=False).pvalue
p_rank = stats.mannwhitneyu(voucher, plain).pvalue
median_gap = np.median(voucher) - np.median(plain)
print("t-test p =", round(p_t, 2))
print("rank test p =", round(p_rank, 4))
print("typical gap: £%.2f" % median_gap)`,
  check: `from scipy import stats as _stats
for _v in ("p_t", "p_rank", "median_gap"):
    assert _v in globals(), "Set %s." % _v
assert abs(float(p_t) - _stats.ttest_ind(voucher, plain, equal_var=False).pvalue) < 1e-9, "p_t is stats.ttest_ind(voucher, plain, equal_var=False).pvalue."
assert abs(float(p_rank) - _stats.mannwhitneyu(voucher, plain).pvalue) < 1e-12, "p_rank is stats.mannwhitneyu(voucher, plain).pvalue."
assert abs(float(median_gap) - (np.median(voucher) - np.median(plain))) < 1e-9, "median_gap is np.median(voucher) - np.median(plain)."`,
},

/* ── Thinking like a statistician ──────────────────────── */
{
  id: 'st-31', mins: 5,
  title: 'Shuffle the labels',
  concept: [
    'If the city made no difference, the labels "Nairobi" and "Lagos" are just stickers, and shuffling them wouldn\'t matter. That\'s the idea behind a **permutation test**.',
    'Shuffle the labels thousands of times, work out the gap each time, and see how often a shuffled gap is as big as the real one. That share is the p-value, built by hand.',
    'No formulas and no bell-curve assumptions: just the data and a loop. It\'s also the clearest way to see what any p-value means.',
  ],
  starter: `nai = cafe.loc[cafe["city"] == "Nairobi", "cups"].to_numpy()
lag = cafe.loc[cafe["city"] == "Lagos", "cups"].to_numpy()
real_gap = nai.mean() - lag.mean()
both = np.concatenate([nai, lag])              # every day from both cities, labels gone
print("real gap:", round(real_gap, 2), "cups a day")`,
  task: 'With `rng = np.random.default_rng(7)`, shuffle `both` 5,000 times with `rng.permutation(both)`. Each time, call the first `len(nai)` values "Nairobi" and the rest "Lagos", and add the gap between their means to a list, `gaps`. Set `p_perm`: the share of shuffled gaps at least as big as the real one, ignoring the sign.',
  hint: 'Start with `gaps = []`. Inside `for _ in range(5000):`, write `s = rng.permutation(both)`, then `gaps.append(s[:len(nai)].mean() - s[len(nai):].mean())`. After the loop: `p_perm = (np.abs(gaps) >= abs(real_gap)).mean()`.',
  solution: `nai = cafe.loc[cafe["city"] == "Nairobi", "cups"].to_numpy()
lag = cafe.loc[cafe["city"] == "Lagos", "cups"].to_numpy()
real_gap = nai.mean() - lag.mean()
both = np.concatenate([nai, lag])

rng = np.random.default_rng(7)
gaps = []
for _ in range(5000):
    s = rng.permutation(both)
    gaps.append(s[:len(nai)].mean() - s[len(nai):].mean())

p_perm = (np.abs(gaps) >= abs(real_gap)).mean()
print("real gap:", round(real_gap, 2))
print("shuffled gaps that big:", p_perm)

plt.hist(gaps, bins=40)
plt.axvline(real_gap, color="black")
plt.axvline(-real_gap, color="black")
plt.show()`,
  check: `from math import erf as _erf, sqrt as _sqrt
for _v in ("gaps", "p_perm"):
    assert _v in globals(), "Set %s." % _v
_g = np.asarray(gaps, dtype=float)
assert len(_g) == 5000, "Keep 5,000 shuffled gaps in gaps."
assert abs(_g.mean()) < 1.0, "Shuffled gaps should centre on 0. Is each one the first len(nai) shuffled values minus the rest?"
assert abs(float(p_perm) - (np.abs(_g) >= abs(real_gap)).mean()) < 1e-9, "p_perm is the share of gaps at least as big as the real one, either way: (np.abs(gaps) >= abs(real_gap)).mean()."
_se = _sqrt(nai.var(ddof=1) / len(nai) + lag.var(ddof=1) / len(lag))
_p = 2 * (1 - 0.5 * (1 + _erf(abs(real_gap) / _se / _sqrt(2))))
assert abs(float(p_perm) - _p) < 0.06, "p_perm should land near the usual test's p-value, about %.2f. Shuffle all of both each time." % _p`,
},
{
  id: 'st-32', mins: 5,
  title: 'False alarms',
  concept: [
    'An **A/A test** splits visitors between two identical pages. There\'s nothing to find, so any "significant" result is a false alarm.',
    'At the 0.05 line, about 1 test in 20 comes up significant anyway. That\'s what 0.05 means: the false-alarm rate you agreed to put up with.',
    'Simulate it to believe it: 1,000 experiments where nothing changes, and count the alarms. `p_value(a, b, n)` below is the test from "An A/B test", wrapped in a function.',
  ],
  starter: `${P_VALUE}

rng = np.random.default_rng(23)
# One A/A test: both pages convert 10% of their 500 visitors
a = rng.binomial(500, 0.1)
b = rng.binomial(500, 0.1)
print(a, "against", b, "  p =", round(p_value(a, b, 500), 3))`,
  task: 'Run 1,000 A/A tests the same way (both pages at 10%, 500 visitors each) and keep every p-value in `p_values`. Set `false_alarms`: the share below 0.05.',
  hint: '`p_values = [p_value(rng.binomial(500, 0.1), rng.binomial(500, 0.1), 500) for _ in range(1000)]`, then `false_alarms = (np.array(p_values) < 0.05).mean()`.',
  solution: `${P_VALUE}

rng = np.random.default_rng(23)
p_values = [p_value(rng.binomial(500, 0.1), rng.binomial(500, 0.1), 500) for _ in range(1000)]
false_alarms = (np.array(p_values) < 0.05).mean()
print("false alarms:", false_alarms)`,
  check: `for _v in ("p_values", "false_alarms"):
    assert _v in globals(), "Set %s." % _v
_pv = np.asarray(p_values, dtype=float)
assert len(_pv) == 1000 and _pv.min() >= 0 and _pv.max() <= 1, "Keep 1,000 p-values in p_values, one per test."
assert abs(float(false_alarms) - (_pv < 0.05).mean()) < 1e-9, "false_alarms is the share of p-values below 0.05."
assert 0.025 <= float(false_alarms) <= 0.085, "About 5% should be false alarms. Are both pages at 0.1, with 500 visitors each?"`,
},
{
  id: 'st-33', mins: 5,
  title: 'Would you even notice?',
  concept: [
    '**Power** is the chance that a test spots an effect that really is there. A test with low power usually says "nothing found", even when there was something to find.',
    'Simulate it: give page B a real lift, 12% against 10%, run the experiment many times, and count how often p comes in under 0.05.',
    'More visitors give more power. Work it out before the experiment, not after a disappointing result.',
  ],
  starter: `${P_VALUE}

rng = np.random.default_rng(29)

def one_test(n):
    """One experiment, n visitors on each page. Page B really is better. True if the test finds it."""
    a = rng.binomial(n, 0.10)
    b = rng.binomial(n, 0.12)
    return p_value(a, b, n) < 0.05

print(one_test(500), one_test(500), one_test(500))`,
  task: 'Set `power_500`: the share of 1,000 experiments with 500 visitors a page that find the lift. Then `power_2000`: the same with 2,000 visitors a page.',
  hint: '`power_500 = np.mean([one_test(500) for _ in range(1000)])`, then the same with 2000.',
  solution: `${P_VALUE}

rng = np.random.default_rng(29)

def one_test(n):
    """One experiment, n visitors on each page. Page B really is better. True if the test finds it."""
    a = rng.binomial(n, 0.10)
    b = rng.binomial(n, 0.12)
    return p_value(a, b, n) < 0.05

power_500 = np.mean([one_test(500) for _ in range(1000)])
power_2000 = np.mean([one_test(2000) for _ in range(1000)])
print("500 a page finds it", round(power_500 * 100), "% of the time")
print("2,000 a page:", round(power_2000 * 100), "%")`,
  check: `for _v in ("power_500", "power_2000"):
    assert _v in globals(), "Set %s." % _v
assert 0.08 <= float(power_500) <= 0.32, "With 500 a page, the test should find the lift only about 1 time in 5. Use 1,000 runs of one_test(500)."
assert 0.42 <= float(power_2000) <= 0.68, "With 2,000 a page, it should find it about half the time. Use 1,000 runs of one_test(2000)."
assert float(power_2000) > float(power_500), "More visitors should give more power."`,
},
{
  id: 'st-34', mins: 5,
  title: 'Don\'t keep peeking',
  concept: [
    'Checking an A/B test every day and stopping the moment p dips under 0.05 sounds sensible. It isn\'t: every look is another chance for luck to cross the line.',
    'Simulate A/A tests, where nothing changes, checked after each of 20 days. Far more than 5% dip under 0.05 at some point.',
    'Decide the sample size first and look once at the end, or use methods built for repeated looks.',
  ],
  starter: `${P_VALUE}

rng = np.random.default_rng(31)

def one_experiment():
    """20 days of an A/A test, 100 visitors a page a day. The p-value after each day."""
    a = rng.binomial(100, 0.1, 20).cumsum()       # conversions so far, day by day
    b = rng.binomial(100, 0.1, 20).cumsum()
    return [p_value(a[d], b[d], 100 * (d + 1)) for d in range(20)]

print([round(p, 2) for p in one_experiment()])`,
  task: 'Run 500 experiments into `runs`. Set `peeked`: the share where the p-value dipped under 0.05 on **any** of the 20 days, and `looked_once`: the share under 0.05 on the last day.',
  hint: '`runs = [one_experiment() for _ in range(500)]`. Then `peeked = np.mean([min(r) < 0.05 for r in runs])` and `looked_once = np.mean([r[-1] < 0.05 for r in runs])`.',
  solution: `${P_VALUE}

rng = np.random.default_rng(31)

def one_experiment():
    """20 days of an A/A test, 100 visitors a page a day. The p-value after each day."""
    a = rng.binomial(100, 0.1, 20).cumsum()
    b = rng.binomial(100, 0.1, 20).cumsum()
    return [p_value(a[d], b[d], 100 * (d + 1)) for d in range(20)]

runs = [one_experiment() for _ in range(500)]
peeked = np.mean([min(r) < 0.05 for r in runs])
looked_once = np.mean([r[-1] < 0.05 for r in runs])
print("peeking daily:", round(peeked * 100), "% false alarms")
print("looking once: ", round(looked_once * 100), "%")`,
  check: `for _v in ("runs", "peeked", "looked_once"):
    assert _v in globals(), "Set %s." % _v
assert len(runs) == 500 and all(len(r) == 20 for r in runs), "runs should hold 500 experiments, each 20 daily p-values."
assert abs(float(peeked) - np.mean([min(r) < 0.05 for r in runs])) < 1e-9, "peeked is the share of runs whose smallest p-value is under 0.05."
assert abs(float(looked_once) - np.mean([r[-1] < 0.05 for r in runs])) < 1e-9, "looked_once uses only each run's last p-value: r[-1]."
assert float(peeked) > 2 * float(looked_once), "Peeking every day should find far more false alarms than looking once."`,
},
{
  id: 'st-35', mins: 4,
  title: 'The worst get better anyway',
  concept: [
    'Pick the worst performers this month, and next month they usually look better, even if nothing was done. Part of a bad month was bad luck, and luck doesn\'t repeat.',
    'This is **regression to the mean**. It tricks people into crediting whatever happened in between: a new manager, a pep talk, a warning letter. The best performers slip back the same way.',
    'Always compare with a group that got nothing. If the untouched worst improved too, the "fix" may just have been luck.',
  ],
  starter: `rng = np.random.default_rng(21)
quality = rng.normal(100, 5, 40)                  # how good each branch really is: never seen
branches = pd.DataFrame({
    "branch": [f"B{i:02d}" for i in range(1, 41)],
    "month1": (quality + rng.normal(0, 10, 40)).round(1),      # each month's score: quality, plus luck
    "month2": (quality + rng.normal(0, 10, 40)).round(1),
})
branches.head()`,
  task: 'Set `worst`: the 10 branches with the lowest month1 scores, and `worst_m1` and `worst_m2`: their average score in each month. Do the same for the 10 best: `best`, `best_m1` and `best_m2`. Nothing changed between the months. What happened?',
  hint: '`worst = branches.nsmallest(10, "month1")`, then `worst["month1"].mean()` and `worst["month2"].mean()`. `branches.nlargest(10, "month1")` gives the best.',
  solution: `rng = np.random.default_rng(21)
quality = rng.normal(100, 5, 40)
branches = pd.DataFrame({
    "branch": [f"B{i:02d}" for i in range(1, 41)],
    "month1": (quality + rng.normal(0, 10, 40)).round(1),
    "month2": (quality + rng.normal(0, 10, 40)).round(1),
})

worst = branches.nsmallest(10, "month1")
worst_m1, worst_m2 = worst["month1"].mean(), worst["month2"].mean()
best = branches.nlargest(10, "month1")
best_m1, best_m2 = best["month1"].mean(), best["month2"].mean()
print("worst 10:", round(worst_m1, 1), "then", round(worst_m2, 1))
print("best 10: ", round(best_m1, 1), "then", round(best_m2, 1))`,
  check: `for _v in ("worst", "worst_m1", "worst_m2", "best", "best_m1", "best_m2"):
    assert _v in globals(), "Set %s." % _v
_w = branches.nsmallest(10, "month1")
_b = branches.nlargest(10, "month1")
assert sorted(worst["branch"]) == sorted(_w["branch"]), "worst is the 10 lowest month1 scores: branches.nsmallest(10, 'month1')."
assert sorted(best["branch"]) == sorted(_b["branch"]), "best is the 10 highest month1 scores: branches.nlargest(10, 'month1')."
assert abs(float(worst_m1) - _w["month1"].mean()) < 1e-9 and abs(float(worst_m2) - _w["month2"].mean()) < 1e-9, "worst_m1 and worst_m2 are the worst 10's average in each month."
assert abs(float(best_m1) - _b["month1"].mean()) < 1e-9 and abs(float(best_m2) - _b["month2"].mean()) < 1e-9, "best_m1 and best_m2 are the best 10's average in each month."`,
},
];
