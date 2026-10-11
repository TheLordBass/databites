/* Every lesson starts from the same little world: 120 days of café sales.
   One dataset you get to know well beats five you half-remember. */

export const PRELUDE = `
import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

# Lessons import seaborn themselves — this is just so a lesson never
# breaks because the *previous* one is the place sns got imported.
try:
    import seaborn as sns
except Exception:
    sns = None

np.random.seed(7)
_n = 120

cafe = pd.DataFrame({
    "date":  pd.date_range("2024-01-01", periods=_n, freq="D"),
    "city":  np.random.choice(["Lagos", "Nairobi", "Accra"], _n),
    "drink": np.random.choice(["latte", "espresso", "cold brew", "tea"], _n),
    "cups":  np.random.randint(8, 60, _n),
    "price": np.round(np.random.uniform(2.0, 5.5, _n), 2),
})
cafe["revenue"] = (cafe["cups"] * cafe["price"]).round(2)
cafe["rating"]  = np.round(np.random.uniform(3.0, 5.0, _n), 1)
cafe.loc[cafe.sample(9, random_state=3).index, "rating"] = np.nan

# A lookup table to join against. Kigali is deliberately missing from
# cafe — that gap is what makes inner vs outer joins visible.
cities = pd.DataFrame({
    "city":         ["Lagos", "Nairobi", "Accra", "Kigali"],
    "country":      ["Nigeria", "Kenya", "Ghana", "Rwanda"],
    "population_m": [15.4, 4.4, 2.6, 1.2],
})

# ── Further tables ──────────────────────────────────────────────────
# Defined AFTER cafe so cafe's values never shift. cafe stays the home
# dataset for learning mechanics; these exist for lessons where meeting
# unfamiliar data is the point.

# survey: deliberately filthy. Every mess here is one people actually hit.
_people = ["Ada Lovelace", "Kofi Mensah", "Zola Nkosi", "Ife Okonkwo", "Tunde Bello", "Amara Eze"]
_m = 30
survey = pd.DataFrame({
    " Name ":       [_people[i % 6] if i % 4 else _people[i % 6].lower() for i in range(_m)],
    "City ":        [[" Lagos", "lagos", "Accra", "NAIROBI", "Nairobi "][i % 5] for i in range(_m)],
    "Signed Up":    [["2024-01-05", "05/02/2024", "2024-03-11", "12/04/2024", "unknown"][i % 5] for i in range(_m)],
    "Spend (GBP)":  [["12.50", "£18.00", "7", "n/a", "23.10"][i % 5] for i in range(_m)],
    "Subscribed?":  [["Yes", "y", "N", "no", "YES"][i % 5] for i in range(_m)],
    "Note":         ["ref#%d priority %s" % (1000 + i, "high" if i % 3 == 0 else "low") for i in range(_m)],
})
survey = pd.concat([survey, survey.iloc[[0, 1]]], ignore_index=True)   # two exact duplicates

# weather: a full year of daily numbers, with a real seasonal shape
_days = 365
_season = 12 + 9 * np.sin((np.arange(_days) - 100) / _days * 2 * np.pi)
weather = pd.DataFrame({
    "date":     pd.date_range("2024-01-01", periods=_days, freq="D"),
    "temp_c":   np.round(_season + np.random.normal(0, 2.2, _days), 1),
    "rain_mm":  np.round(np.clip(np.random.gamma(1.4, 2.0, _days) - 0.6, 0, None), 1),
    "wind_kph": np.round(np.random.uniform(4, 38, _days), 1),
})

# marks: wide on purpose — one column per subject, waiting to be melted
students = pd.DataFrame({
    "student_id": [1, 2, 3, 4, 5, 6, 7, 8],
    "name":       ["Ada", "Kofi", "Zola", "Ife", "Tunde", "Amara", "Nia", "Kwame"],
    "year":       [1, 1, 2, 2, 3, 3, 1, 2],
})
marks = pd.DataFrame({
    "student_id": [1, 2, 3, 4, 5, 6, 7, 8],
    "maths":      [72, 65, 88, 54, 91, 60, 77, 83],
    "physics":    [68, 71, 79, 61, 85, 58, 74, 80],
    "history":    [55, 82, 64, 73, 60, 88, 69, 58],
})

# ── The shop: four linked tables, for SQL ───────────────────────────
# The cafe also sells beans and kit online. It gets its own random
# generator, so adding it never shifts a single value in the tables above.
_r = np.random.default_rng(2024)
_first = ["Ada", "Kofi", "Zola", "Ife", "Tunde", "Amara", "Nia", "Kwame", "Chidi", "Esi",
          "Yaw", "Ngozi", "Sipho", "Lindiwe", "Tariq", "Halima", "Jomo", "Wanjiru", "Femi", "Abena"]
_last = ["Okafor", "Mensah", "Nkosi", "Bello", "Eze", "Kamau", "Owusu", "Diallo", "Banda", "Achieng"]
customers = pd.DataFrame({
    "customer_id": np.arange(1, 41),
    "name": [_first[i % 20] + " " + _last[(i * 7 + i // 20) % 10] for i in range(40)],
    "city": _r.choice(["Lagos", "Nairobi", "Accra", "Kigali"], 40, p=[.35, .3, .25, .1]),
    "joined": pd.Timestamp("2023-05-01") + pd.to_timedelta(_r.integers(0, 240, 40), unit="D"),
})
customers["city"] = customers["city"].astype(object)
customers.loc[[6, 23], "city"] = None               # two never said where they live

products = pd.DataFrame({
    "product_id": np.arange(101, 113),
    "name": ["house beans", "dark roast", "decaf beans", "cold brew kit", "mug", "travel mug",
             "hand grinder", "pour-over cone", "filter papers", "espresso cups", "gift card", "tote bag"],
    "category": ["beans", "beans", "beans", "kit", "merch", "merch",
                 "kit", "kit", "kit", "merch", "gift", "merch"],
    "price": [12.5, 14.0, 13.0, 29.0, 9.5, 18.0, 45.0, 22.0, 4.5, 16.0, 25.0, 11.0],
})

orders = pd.DataFrame({
    "order_id": np.arange(5001, 5151),
    "customer_id": _r.choice(np.arange(1, 35), 150),     # customers 35-40 have never ordered
    "order_date": pd.Timestamp("2024-01-01") + pd.to_timedelta(np.sort(_r.integers(0, 182, 150)), unit="D"),
    "status": _r.choice(["delivered", "shipped", "cancelled"], 150, p=[.78, .12, .10]),
})
# np.intp: Pyodide is 32-bit WebAssembly, and np.repeat refuses int64 counts there
_lines = _r.integers(1, 4, 150).astype(np.intp)
order_items = pd.DataFrame({
    "order_id": np.repeat(orders["order_id"].to_numpy(), _lines),
    "product_id": _r.choice(np.arange(101, 112), int(_lines.sum())),   # 112, the tote bag, never sells
    "qty": _r.integers(1, 4, int(_lines.sum())),
})
order_items = order_items.drop_duplicates(["order_id", "product_id"]).reset_index(drop=True)

# ── Reviews: short texts marked happy or unhappy, for the AI track ───
# Written by hand, no randomness, so nothing above can shift.
reviews = pd.DataFrame({
    "text": [
        "Lovely latte and a warm welcome", "Best cold brew in Lagos, smooth and strong",
        "Friendly staff and fresh pastries", "Great coffee, quick service, will come back",
        "The espresso was rich and perfect", "Cosy seats and a lovely view of the street",
        "Tea was hot and the cake was delicious", "Quick, friendly and the latte was great",
        "Perfect spot to work, fast wifi and good coffee", "Delicious cold brew on a hot day",
        "Staff remembered my order, lovely touch", "Fresh beans, great smell, great espresso",
        "Warm, friendly and never too busy", "The best tea in Nairobi, will come back",
        "Smooth latte and a very kind barista", "Good prices and delicious pastries",
        "Clean tables and fast, friendly service", "Rich coffee and a relaxed, happy room",
        "Loved the new mocha, sweet and smooth", "Great music, great coffee, great staff",
        "Cold latte and a long wait", "Rude staff and dirty tables",
        "The espresso was bitter and burnt", "Waited twenty minutes for a small tea",
        "Too expensive for such weak coffee", "Noisy, crowded and nowhere to sit",
        "My order was wrong and nobody said sorry", "Stale pastries and slow service",
        "The cold brew tasted watery and flat", "The wifi never worked and the music was loud",
        "Burnt coffee again, very disappointing", "Long queue, cold tea, grumpy barista",
        "Sticky tables and a dirty cup", "Slow service and the latte was lukewarm",
        "Overpriced cake that was dry and stale", "Nobody cleaned the tables all morning",
        "Weak espresso and a rude welcome", "They forgot my order twice",
        "Bitter mocha with far too much syrup", "Crowded, loud, and the wait was long",
    ],
    "mood": ["happy"] * 20 + ["unhappy"] * 20,
})

# ── Business metrics, forecasting and machine learning ──────────────
# Added later, with their own generator, so not one value above shifts.
_g = np.random.default_rng(31)

# ab_test: a checkout experiment. B is a redesign; mobile converts less.
_u = 4000
ab_test = pd.DataFrame({
    "user_id": np.arange(1, _u + 1),
    "group": _g.choice(["A", "B"], _u),
    "device": _g.choice(["mobile", "desktop"], _u, p=[.62, .38]),
})
_p = np.where(ab_test["group"] == "B", 0.118, 0.10) * np.where(ab_test["device"] == "mobile", 0.85, 1.25)
ab_test["converted"] = (_g.random(_u) < _p).astype(int)
ab_test["revenue"] = np.where(ab_test["converted"] == 1, np.round(_g.gamma(4.0, 7.0, _u), 2), 0.0)

# sessions: visits to the online shop, and how far each got down the funnel
_s = 3000
sessions = pd.DataFrame({
    "session_id": np.arange(1, _s + 1),
    "date": pd.Timestamp("2024-03-01") + pd.to_timedelta(_g.integers(0, 61, _s), unit="D"),
    "channel": _g.choice(["search", "social", "email", "direct"], _s, p=[.4, .25, .15, .2]),
    "device": _g.choice(["mobile", "desktop"], _s, p=[.65, .35]),
})
_viewed = _g.random(_s) < .55
_carted = _viewed & (_g.random(_s) < np.where(sessions["channel"] == "email", .45, .3))
_paid = _carted & (_g.random(_s) < np.where(sessions["device"] == "mobile", .45, .62))
sessions["viewed_product"] = _viewed
sessions["added_to_cart"] = _carted
sessions["purchased"] = _paid
sessions["revenue"] = np.where(_paid, np.round(_g.gamma(3.0, 12.0, _s), 2), 0.0)
sessions = sessions.sort_values(["date", "session_id"]).reset_index(drop=True)

# subs: a coffee subscription, one row per customer per month they paid
_k = 900
_start = np.datetime64("2023-07") + _g.integers(0, 12, _k).astype("timedelta64[M]")
_plan = _g.choice(["monthly", "annual"], _k, p=[.72, .28])
_life = np.where(_plan == "annual", _g.geometric(.06, _k), _g.geometric(.22, _k)).astype(np.intp)
_who = np.repeat(np.arange(_k), _life)
_step = np.arange(int(_life.sum())) - np.repeat(np.cumsum(_life) - _life, _life)
_month = _start[_who] + _step.astype("timedelta64[M]")
_keep = _month <= np.datetime64("2024-12")
subs = pd.DataFrame({
    "customer_id": _who[_keep] + 1,
    "start": _start[_who][_keep].astype("datetime64[ns]"),
    "month": _month[_keep].astype("datetime64[ns]"),
    "plan": _plan[_who][_keep],
})
subs["revenue"] = np.where(subs["plan"] == "annual", 15.0, 18.0)

# calls: two years of daily calls to a contact centre, busy on Mondays
_d = pd.date_range("2023-01-01", "2024-12-31", freq="D")
_week = np.array([1.18, 1.10, 1.05, 1.02, 0.98, 0.72, 0.60])[_d.dayofweek]
_year = 1 + 0.12 * np.sin((_d.dayofyear.to_numpy() - 30) / 365.25 * 2 * np.pi)
calls = pd.DataFrame({"date": _d, "calls": np.round((420 + 0.18 * np.arange(len(_d))) * _week * _year
                                                     + _g.normal(0, 18, len(_d))).astype(int)})

# churn: subscription customers, and who left. For machine learning.
_c = 800
churn = pd.DataFrame({
    "customer_id": np.arange(1, _c + 1),
    "tenure_months": _g.integers(1, 49, _c),
    "monthly_spend": np.round(np.clip(_g.normal(32, 9, _c), 8, None), 2),
    "visits_last_month": _g.poisson(6, _c),
    "support_tickets": _g.poisson(0.8, _c),
    "plan": _g.choice(["basic", "plus", "pro"], _c, p=[.5, .35, .15]),
    "contract": _g.choice(["monthly", "annual"], _c, p=[.7, .3]),
    "city": _g.choice(["Lagos", "Nairobi", "Accra"], _c),
})
_z = (-0.4 - 0.06 * churn["tenure_months"] + 0.6 * churn["support_tickets"] - 0.15 * churn["visits_last_month"]
      + 1.4 * (churn["contract"] == "monthly") + 0.4 * (churn["plan"] == "basic") + _g.normal(0, 0.6, _c))
churn["churned"] = (_g.random(_c) < 1 / (1 + np.exp(-_z))).astype(int)

# deliveries: how many minutes each delivery took. For predicting a number.
_n2 = 600
deliveries = pd.DataFrame({
    "distance_km": np.round(_g.uniform(0.5, 12, _n2), 1),
    "items": _g.integers(1, 9, _n2),
    "hour": _g.integers(7, 23, _n2),
    "raining": (_g.random(_n2) < .25).astype(int),
})
_rush = deliveries["hour"].isin([12, 13, 17, 18, 19]).astype(int)
deliveries["minutes"] = np.round(8 + 3.1 * deliveries["distance_km"] + 0.9 * deliveries["items"]
                                 + 6 * deliveries["raining"] + 5 * _rush + _g.normal(0, 4, _n2), 1)

pd.set_option("display.width", 88)
pd.set_option("display.max_columns", 12)
pd.set_option("display.max_rows", 14)

# sns.set_theme() mutates matplotlib globally, so start every lesson clean.
plt.rcdefaults()
plt.rcParams["figure.figsize"] = (6.2, 3.7)
plt.rcParams["figure.dpi"] = 110
plt.rcParams["axes.spines.top"] = False
plt.rcParams["axes.spines.right"] = False
`;

/* Shown on the datasets reference card. */
export const COLUMNS = [
  ['date', 'datetime', 'one row per day, Jan–Apr 2024'],
  ['city', 'text', 'Lagos, Nairobi or Accra'],
  ['drink', 'text', 'latte, espresso, cold brew, tea'],
  ['cups', 'int', 'cups sold that day'],
  ['price', 'float', 'price per cup'],
  ['revenue', 'float', 'cups × price'],
  ['rating', 'float', 'customer rating — has 9 missing values'],
];

export const DATASETS = [
  ['cafe', '120 × 7', 'Café sales. The home dataset — most lessons use this.'],
  ['cities', '4 × 3', 'City → country and population. Kigali is missing from cafe, which is what makes joins interesting.'],
  ['survey', '32 × 6', 'Deliberately filthy: padded names, mixed date formats, "£18.00" as text, Yes/y/YES, two duplicate rows.'],
  ['weather', '365 × 4', 'A full year of daily temperature, rain and wind, with a real seasonal curve.'],
  ['marks', '8 × 4', 'Exam scores, one column per subject — wide on purpose.'],
  ['students', '8 × 3', 'Student id → name and year. Joins onto marks.'],
  ['customers', '40 × 4', 'The shop: who buys online, their city and when they joined. Two never gave a city; six have never ordered.'],
  ['orders', '150 × 4', 'The shop: one row per order, January to June 2024 — who, when, and delivered / shipped / cancelled.'],
  ['order_items', '281 × 3', 'The shop: what was in each order. Links orders to products, with a quantity.'],
  ['products', '12 × 4', 'The shop: beans, kit and merch, with prices. The tote bag has never sold.'],
  ['reviews', '40 × 2', 'Short café reviews, each marked happy or unhappy. For the AI track\'s text lessons.'],
  ['ab_test', '4,000 × 5', 'A checkout experiment: each user saw design A or B. Did they buy, and for how much? Mobile converts less.'],
  ['sessions', '3,000 × 9', 'Visits to the online shop, March and April 2024: channel, device, and how far each got: viewed a product, added to cart, bought.'],
  ['subs', '≈5,000 × 5', 'A coffee subscription: one row per customer per month they paid, July 2023 to December 2024. Monthly or annual plans.'],
  ['calls', '731 × 2', 'Two years of daily calls to a contact centre: busy on Mondays, quiet at weekends, with a yearly swing and slow growth.'],
  ['churn', '800 × 9', 'Subscription customers and whether they left: tenure, spend, visits, support tickets, plan, contract and city.'],
  ['deliveries', '600 × 5', 'Deliveries: distance, items, hour and rain, and how many minutes each took.'],
];
