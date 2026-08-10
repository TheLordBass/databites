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

/* Shown on the "what's in cafe?" reference card. */
export const COLUMNS = [
  ['date', 'datetime', 'one row per day, Jan–Apr 2024'],
  ['city', 'text', 'Lagos, Nairobi or Accra'],
  ['drink', 'text', 'latte, espresso, cold brew, tea'],
  ['cups', 'int', 'cups sold that day'],
  ['price', 'float', 'price per cup'],
  ['revenue', 'float', 'cups × price'],
  ['rating', 'float', 'customer rating — has 9 missing values'],
];
