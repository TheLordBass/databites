/* Statistics — the uncertainty around the numbers: typical values and spread,
   sampling and standard error, intervals by formula and by bootstrap, then
   comparing groups honestly: intervals for a difference, t-tests, an A/B
   test, many comparisons, and effect size.

   Every check works its answer out from the data, never a typed number. */

const NAI_LAG = `nai = cafe.loc[cafe["city"] == "Nairobi", "cups"]
lag = cafe.loc[cafe["city"] == "Lagos", "cups"]`;

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
    'The standard deviation (`.std()`) feels the extremes. The **interquartile range**, the 75th percentile minus the 25th, covers the middle half and ignores them.',
    '"68% of values within one standard deviation" only holds for bell-shaped data. Check it rather than assume it.',
  ],
  starter: `cafe["cups"].describe()`,
  task: 'Set `std_cups`, `iqr_cups` (75th percentile minus 25th), and `within_one`: the % of days whose cups are within one standard deviation of the mean, rounded to 1. Is it near 68?',
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
    'Draw many samples and their means spread out by about σ ÷ √n: the **standard error**. Bigger samples wobble less, but only by the square root.',
    '`np.random.default_rng(1)` makes the draws repeatable, so the result can be checked.',
  ],
  starter: `rng = np.random.default_rng(1)
one = rng.choice(cafe["cups"], size=30, replace=True)
one.mean()`,
  task: 'Draw 500 samples of 30 days, with replacement, and keep their means in `sample_means`. Then set `standard_error` by the formula: the std of cups divided by √30. Compare the two.',
  hint: 'A list comprehension: `[rng.choice(cafe["cups"], size=30, replace=True).mean() for _ in range(500)]`. The formula is `cafe["cups"].std() / np.sqrt(30)`.',
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
    'The ±1.96 formula leans on assumptions. The **bootstrap** leans on the data instead: resample the days with replacement and recompute the mean, many times.',
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
    'A difference between two means has its own standard error: √(s₁²/n₁ + s₂²/n₂). Its 95% interval is the difference ± 1.96 of those.',
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
  task: 'Run Welch\'s t-test on cups for every pair of drinks. Set `pairs_under_05`: the pairs with p below 0.05, and `pairs_after_correction`: those below 0.05 divided by the number of pairs. Keep each pair as the tuple `combinations` gives.',
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
  task: 'Set `d`: Cohen\'s d for Nairobi against Lagos, with the pooled standard deviation. Then `size`, by the absolute value of d: `"negligible"` under 0.2, `"small"` under 0.5, `"medium"` under 0.8, otherwise `"large"`.',
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
];
