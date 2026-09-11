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
];
