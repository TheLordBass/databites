/* More SQL practice problems, s13 to s50. Same format as the SQL problems in
   problems.js: setup defines _ref_sql, and _example / _cases return dicts of
   {table name: DataFrame}. Each case gets its own fresh SQLite database. */

export const MORE_SQL = [

/* ── Easy ──────────────────────────────────────────────── */
{
  id: 's13', difficulty: 'easy', lang: 'sql', tags: ['DISTINCT', 'NULL', 'ordering'],
  title: 'Every city, once',
  prompt: [
    '`customers` has `name` and `city`. Some customers never gave a city (NULL).',
    'Return each city **once**, in alphabetical order, as one column `city`. Leave out the NULLs.',
  ],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT DISTINCT city FROM customers WHERE city IS NOT NULL ORDER BY city"

def _example():
    return {"customers": pd.DataFrame({"name": ["Ada", "Kofi", "Zola", "Ife", "Tunde", "Nia"],
                                       "city": ["Lagos", "Accra", None, "Lagos", "Nairobi", "Accra"]})}

def _cases():
    return [
        _example(),
        {"customers": pd.DataFrame({"name": ["Esi", "Yaw", "Ama"], "city": ["Tema", "Tema", "Kumasi"]})},
        {"customers": pd.DataFrame({"name": ["Esi", "Yaw"], "city": ["Tema", None]})},
    ]
`,
  hint: '`SELECT DISTINCT city`, filter with `WHERE city IS NOT NULL`, and finish with ORDER BY.',
  solution: 'SELECT DISTINCT city\nFROM customers\nWHERE city IS NOT NULL\nORDER BY city;\n',
  alt: ['SELECT city FROM customers WHERE city IS NOT NULL GROUP BY city ORDER BY city;\n'],
  wrong: [
    'SELECT DISTINCT city\nFROM customers\nORDER BY city;\n',
    'SELECT city\nFROM customers\nWHERE city IS NOT NULL\nORDER BY city;\n',
  ],
},
{
  id: 's14', difficulty: 'easy', lang: 'sql', tags: ['counting', 'strings'],
  title: 'How many got cancelled?',
  prompt: [
    "`orders` has `order_id` and `status`. Statuses were typed by hand, so `'Cancelled'` and `' CANCELLED'` mean cancelled too.",
    'Return one row with one column, `cancelled`: how many orders were cancelled.',
  ],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT COUNT(*) AS cancelled FROM orders WHERE LOWER(TRIM(status)) = 'cancelled'"

def _example():
    return {"orders": pd.DataFrame({"order_id": [1, 2, 3, 4, 5],
                                    "status": ["delivered", "cancelled", "Cancelled", " CANCELLED", "shipped"]})}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1, 2], "status": ["delivered", "shipped"]})},
        {"orders": pd.DataFrame({"order_id": [1, 2, 3], "status": ["cancelled ", "CANCELLED", "cancelled"]})},
    ]
`,
  hint: 'Clean before you compare: `LOWER(TRIM(status)) = \'cancelled\'`.',
  solution: "SELECT COUNT(*) AS cancelled\nFROM orders\nWHERE LOWER(TRIM(status)) = 'cancelled';\n",
  alt: ["SELECT SUM(CASE WHEN UPPER(TRIM(status)) = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled FROM orders;\n"],
  wrong: [
    "SELECT COUNT(*) AS cancelled\nFROM orders\nWHERE status = 'cancelled';\n",
    "SELECT COUNT(*) AS cancelled\nFROM orders\nWHERE LOWER(status) = 'cancelled';\n",
  ],
},
{
  id: 's15', difficulty: 'easy', lang: 'sql', tags: ['LIKE', 'strings'],
  title: 'Anything with "mug"',
  prompt: [
    '`products` has `name` and `price`.',
    'Return `name` and `price` of every product whose name contains **mug** anywhere, in any capitals — cheapest first, then by name.',
  ],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT name, price FROM products WHERE LOWER(name) LIKE '%mug%' ORDER BY price, name"

def _example():
    return {"products": pd.DataFrame({
        "name": ["mug", "Travel Mug", "house beans", "Mug set", "mugwort tea", "filter papers"],
        "price": [9.5, 18.0, 12.5, 24.0, 6.0, 4.5],
    })}

def _cases():
    return [
        _example(),
        {"products": pd.DataFrame({"name": ["beans", "grinder"], "price": [12.0, 45.0]})},
        {"products": pd.DataFrame({"name": ["mug b", "Mug A", "big MUG"], "price": [10.0, 10.0, 7.0]})},
    ]
`,
  hint: "`%` in a LIKE pattern means \"anything at all\", so `'%mug%'` finds mug anywhere. SQLite's LIKE ignores capitals for plain letters.",
  solution: "SELECT name, price\nFROM products\nWHERE name LIKE '%mug%'\nORDER BY price, name;\n",
  alt: ["SELECT name, price FROM products WHERE LOWER(name) LIKE '%mug%' ORDER BY price, name;\n"],
  wrong: [
    "SELECT name, price\nFROM products\nWHERE name LIKE 'mug%'\nORDER BY price, name;\n",
    "SELECT name, price\nFROM products\nWHERE name GLOB '*mug*'\nORDER BY price, name;\n",
  ],
},
{
  id: 's16', difficulty: 'easy', lang: 'sql', tags: ['dates', 'boundaries'],
  title: 'The whole of March',
  prompt: [
    "`orders` has `order_id`, `placed_at` (text like `'2024-03-31 18:20'` — a date **and** a time) and `total`.",
    'Return `order_id` and `placed_at` for every order placed in March 2024, in time order.',
  ],
  notes: ['An order at 18:20 on the 31st is still in March.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT order_id, placed_at FROM orders WHERE placed_at >= '2024-03-01' AND placed_at < '2024-04-01' ORDER BY placed_at"

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [11, 12, 13, 14, 15, 16],
        "placed_at": ["2024-02-29 23:50", "2024-03-01 08:05", "2024-03-15 12:00",
                      "2024-03-31 18:20", "2024-04-01 00:10", "2023-03-10 09:00"],
        "total": [12.0, 30.5, 8.0, 22.0, 15.0, 9.5],
    })}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1, 2], "placed_at": ["2024-02-01 10:00", "2024-04-02 10:00"],
                                 "total": [1.0, 2.0]})},
    ]
`,
  hint: "`BETWEEN '2024-03-01' AND '2024-03-31'` stops at midnight on the 31st. Use `>= '2024-03-01' AND < '2024-04-01'` instead.",
  solution: "SELECT order_id, placed_at\nFROM orders\nWHERE placed_at >= '2024-03-01'\n  AND placed_at < '2024-04-01'\nORDER BY placed_at;\n",
  alt: ["SELECT order_id, placed_at FROM orders WHERE strftime('%Y-%m', placed_at) = '2024-03' ORDER BY placed_at;\n"],
  wrong: [
    "SELECT order_id, placed_at\nFROM orders\nWHERE placed_at BETWEEN '2024-03-01' AND '2024-03-31'\nORDER BY placed_at;\n",
    "SELECT order_id, placed_at\nFROM orders\nWHERE strftime('%m', placed_at) = '03'\nORDER BY placed_at;\n",
  ],
},
{
  id: 's17', difficulty: 'easy', lang: 'sql', tags: ['group by', 'aggregation'],
  title: 'Cheapest and dearest',
  prompt: [
    '`products` has `name`, `category` and `price`. A price not set yet is NULL.',
    'For each category: `category`, `cheapest` and `dearest` price.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT category, MIN(price) AS cheapest, MAX(price) AS dearest FROM products GROUP BY category"

def _example():
    return {"products": pd.DataFrame({
        "name": ["house beans", "dark roast", "grinder", "cone", "mug", "tote", "decaf"],
        "category": ["beans", "beans", "kit", "kit", "merch", "merch", "beans"],
        "price": [12.5, 14.0, 45.0, 22.0, 9.5, None, 13.0],
    })}

def _cases():
    return [
        _example(),
        {"products": pd.DataFrame({"name": ["gift card"], "category": ["gift"], "price": [25.0]})},
    ]
`,
  hint: 'GROUP BY category, with `MIN(price)` and `MAX(price)` — both skip NULLs by themselves.',
  solution: 'SELECT category, MIN(price) AS cheapest, MAX(price) AS dearest\nFROM products\nGROUP BY category;\n',
  alt: ['SELECT category, MIN(price) AS cheapest, MAX(price) AS dearest FROM products GROUP BY 1;\n'],
  wrong: [
    'SELECT category, MAX(price) AS cheapest, MIN(price) AS dearest\nFROM products\nGROUP BY category;\n',
    'SELECT category, MIN(price) AS cheapest, AVG(price) AS dearest\nFROM products\nGROUP BY category;\n',
  ],
},
{
  id: 's18', difficulty: 'easy', lang: 'sql', tags: ['aggregation', 'filtering'],
  title: 'Average of real sales',
  prompt: [
    '`payments` has `payment_id` and `amount`. Refunds are negative amounts, and a 0 is a voided payment.',
    'Return one row: `avg_sale`, the average of the actual sales (positive amounts), rounded to 2.',
  ],
  stub: 'SELECT *\nFROM payments;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT ROUND(AVG(amount), 2) AS avg_sale FROM payments WHERE amount > 0"

def _example():
    return {"payments": pd.DataFrame({"payment_id": [1, 2, 3, 4, 5, 6],
                                      "amount": [20.0, -5.0, 15.5, 0.0, 30.0, -20.0]})}

def _cases():
    return [
        _example(),
        {"payments": pd.DataFrame({"payment_id": [1, 2], "amount": [10.0, 11.0]})},
    ]
`,
  hint: 'Keep the positive amounts with `WHERE amount > 0`, then `ROUND(AVG(amount), 2)`.',
  solution: 'SELECT ROUND(AVG(amount), 2) AS avg_sale\nFROM payments\nWHERE amount > 0;\n',
  alt: ['SELECT ROUND(AVG(CASE WHEN amount > 0 THEN amount END), 2) AS avg_sale FROM payments;\n'],
  wrong: [
    'SELECT ROUND(AVG(amount), 2) AS avg_sale\nFROM payments;\n',
    'SELECT ROUND(AVG(amount), 2) AS avg_sale\nFROM payments\nWHERE amount >= 0;\n',
  ],
},
{
  id: 's19', difficulty: 'easy', lang: 'sql', tags: ['group by', 'ties', 'LIMIT'],
  title: 'The biggest category',
  prompt: [
    '`products` has `name` and `category`.',
    'Return one row: the `category` with the most products, and `products` — how many. If categories tie, the one first in the alphabet wins.',
  ],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT category, COUNT(*) AS products FROM products GROUP BY category ORDER BY products DESC, category LIMIT 1"

def _example():
    return {"products": pd.DataFrame({
        "name": ["a", "b", "c", "d", "e", "f", "g", "h"],
        "category": ["merch", "kit", "beans", "merch", "kit", "merch", "kit", "beans"],
    })}

def _cases():
    return [
        _example(),
        {"products": pd.DataFrame({"name": ["a", "b", "c"], "category": ["tea", "gift", "tea"]})},
    ]
`,
  hint: 'Count per category, ORDER BY the count high to low **and then** the category A to Z, and LIMIT 1.',
  solution: 'SELECT category, COUNT(*) AS products\nFROM products\nGROUP BY category\nORDER BY products DESC, category\nLIMIT 1;\n',
  alt: ['SELECT category, COUNT(*) AS products FROM products GROUP BY category ORDER BY COUNT(*) DESC, category ASC LIMIT 1;\n'],
  wrong: [
    'SELECT category, COUNT(*) AS products\nFROM products\nGROUP BY category\nORDER BY products DESC, category DESC\nLIMIT 1;\n',
    'SELECT category, COUNT(*) AS products\nFROM products\nGROUP BY category\nORDER BY products\nLIMIT 1;\n',
  ],
},
{
  id: 's20', difficulty: 'easy', lang: 'sql', tags: ['strings', 'ordering'],
  title: 'Full names',
  prompt: [
    '`people` has `first` and `last`. Some were saved with spaces around them.',
    "Return one column `full_name` — first, a space, last, with no stray spaces — sorted by last name, then first name.",
  ],
  stub: 'SELECT *\nFROM people;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT TRIM(first) || ' ' || TRIM(last) AS full_name FROM people ORDER BY TRIM(last), TRIM(first)"

def _example():
    return {"people": pd.DataFrame({"first": [" Ada", "Kofi", "Ama ", "Zola"],
                                    "last": ["Mensah", " Annan", "Mensah", "Nkosi "]})}

def _cases():
    return [
        _example(),
        {"people": pd.DataFrame({"first": ["Yaw"], "last": ["Boateng"]})},
    ]
`,
  hint: "`||` joins text: `TRIM(first) || ' ' || TRIM(last)`. Sort on the trimmed names too.",
  solution: "SELECT TRIM(first) || ' ' || TRIM(last) AS full_name\nFROM people\nORDER BY TRIM(last), TRIM(first);\n",
  alt: ["SELECT printf('%s %s', TRIM(first), TRIM(last)) AS full_name FROM people ORDER BY TRIM(last), TRIM(first);\n"],
  wrong: [
    "SELECT first || ' ' || last AS full_name\nFROM people\nORDER BY last, first;\n",
    "SELECT TRIM(first) || ' ' || TRIM(last) AS full_name\nFROM people\nORDER BY full_name;\n",
  ],
},
{
  id: 's21', difficulty: 'easy', lang: 'sql', tags: ['strings', 'DISTINCT'],
  title: 'Clean voucher codes',
  prompt: [
    '`vouchers` has `id` and `code`. The codes were typed by hand: `"save10"`, `" SAVE10"` and `"Save10 "` are all the same code.',
    'Return each cleaned code once — no surrounding spaces, in capitals — as one sorted column, `code`.',
  ],
  stub: 'SELECT *\nFROM vouchers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT DISTINCT UPPER(TRIM(code)) AS code FROM vouchers ORDER BY 1"

def _example():
    return {"vouchers": pd.DataFrame({"id": [1, 2, 3, 4, 5, 6],
                                      "code": ["save10", " SAVE10", "Welcome", "WELCOME ", "free-ship", "Save10 "]})}

def _cases():
    return [
        _example(),
        {"vouchers": pd.DataFrame({"id": [1], "code": ["x"]})},
    ]
`,
  hint: 'Clean first, then de-duplicate: `SELECT DISTINCT UPPER(TRIM(code)) AS code`.',
  solution: 'SELECT DISTINCT UPPER(TRIM(code)) AS code\nFROM vouchers\nORDER BY code;\n',
  alt: ['SELECT UPPER(TRIM(code)) AS code FROM vouchers GROUP BY 1 ORDER BY 1;\n'],
  wrong: [
    'SELECT DISTINCT UPPER(code) AS code\nFROM vouchers\nORDER BY code;\n',
    'SELECT DISTINCT code\nFROM vouchers\nORDER BY code;\n',
  ],
},
{
  id: 's22', difficulty: 'easy', lang: 'sql', tags: ['ordering', 'OFFSET', 'ties'],
  title: 'Second and third',
  prompt: [
    '`products` has `name` and `price`.',
    'Return the **2nd and 3rd** most expensive products — `name` and `price`, dearest first. Products at the same price go in alphabetical order.',
  ],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT name, price FROM products ORDER BY price DESC, name LIMIT 2 OFFSET 1"

def _example():
    return {"products": pd.DataFrame({"name": ["mug", "grinder", "kit", "beans", "tote"],
                                      "price": [9.5, 45.0, 29.0, 29.0, 11.0]})}

def _cases():
    return [
        _example(),
        {"products": pd.DataFrame({"name": ["a", "b"], "price": [5.0, 6.0]})},
    ]
`,
  hint: '`OFFSET 1` skips the first row after sorting; `LIMIT 2` keeps the next two.',
  solution: 'SELECT name, price\nFROM products\nORDER BY price DESC, name\nLIMIT 2 OFFSET 1;\n',
  alt: ['SELECT name, price FROM (SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC, name) AS rn FROM products) WHERE rn IN (2, 3) ORDER BY rn;\n'],
  wrong: [
    'SELECT name, price\nFROM products\nORDER BY price DESC, name\nLIMIT 3;\n',
    'SELECT name, price\nFROM products\nORDER BY price DESC, name\nLIMIT 2 OFFSET 2;\n',
    'SELECT name, price\nFROM products\nORDER BY price DESC, name DESC\nLIMIT 2 OFFSET 1;\n',
  ],
},
{
  id: 's23', difficulty: 'easy', lang: 'sql', tags: ['NULL', 'COALESCE'],
  title: 'Unknown city',
  prompt: [
    "`customers` has `name` and `city`. A missing city is NULL — and a blank city (`''`) counts as missing too.",
    "Return `name` and `city`, with every missing city shown as `'unknown'`, sorted by name.",
  ],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT name, COALESCE(NULLIF(TRIM(city), ''), 'unknown') AS city FROM customers ORDER BY name"

def _example():
    return {"customers": pd.DataFrame({"name": ["Zola", "Ada", "Kofi", "Ife"],
                                       "city": ["Lagos", None, "", "Accra"]})}

def _cases():
    return [
        _example(),
        {"customers": pd.DataFrame({"name": ["Esi", "Yaw"], "city": ["  ", "Tema"]})},
    ]
`,
  hint: "`NULLIF(TRIM(city), '')` turns a blank into NULL; then `COALESCE(..., 'unknown')` fills every NULL.",
  solution: "SELECT name, COALESCE(NULLIF(TRIM(city), ''), 'unknown') AS city\nFROM customers\nORDER BY name;\n",
  alt: ["SELECT name, CASE WHEN city IS NULL OR TRIM(city) = '' THEN 'unknown' ELSE city END AS city FROM customers ORDER BY name;\n"],
  wrong: [
    "SELECT name, COALESCE(city, 'unknown') AS city\nFROM customers\nORDER BY name;\n",
    "SELECT name, COALESCE(NULLIF(TRIM(city), ''), 'unknown') AS city\nFROM customers;\n",
  ],
},
{
  id: 's24', difficulty: 'easy', lang: 'sql', tags: ['dates', 'group by'],
  title: 'Orders per day',
  prompt: [
    "`orders` has `order_id` and `placed_at` (text like `'2024-03-02 09:15'`).",
    "Return `day` (like `'2024-03-02'`) and `orders` — how many were placed that day — in date order.",
  ],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT date(placed_at) AS day, COUNT(*) AS orders FROM orders GROUP BY day ORDER BY day"

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5],
        "placed_at": ["2024-03-02 09:15", "2024-03-01 18:00", "2024-03-02 11:40", "2024-03-02 11:40", "2024-03-04 08:00"],
    })}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1], "placed_at": ["2024-12-31 23:59"]})},
    ]
`,
  hint: "`date(placed_at)` keeps just the date part. Group by that, not by the full timestamp.",
  solution: 'SELECT date(placed_at) AS day, COUNT(*) AS orders\nFROM orders\nGROUP BY day\nORDER BY day;\n',
  alt: ['SELECT substr(placed_at, 1, 10) AS day, COUNT(*) AS orders FROM orders GROUP BY 1 ORDER BY 1;\n'],
  wrong: [
    'SELECT placed_at AS day, COUNT(*) AS orders\nFROM orders\nGROUP BY placed_at\nORDER BY placed_at;\n',
    "SELECT strftime('%d', placed_at) AS day, COUNT(*) AS orders\nFROM orders\nGROUP BY day\nORDER BY day;\n",
  ],
},
{
  id: 's25', difficulty: 'easy', lang: 'sql', tags: ['IN', 'filtering', 'precedence'],
  title: 'Beans or kit, under 20',
  prompt: [
    '`products` has `name`, `category` and `price`.',
    'Return `name`, `category` and `price` for products in the `beans` **or** `kit` category that cost **less than 20** — cheapest first, then by name.',
  ],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT name, category, price FROM products WHERE category IN ('beans', 'kit') AND price < 20 ORDER BY price, name"

def _example():
    return {"products": pd.DataFrame({
        "name": ["house beans", "dark roast", "cone", "grinder", "mug", "filters", "decaf"],
        "category": ["beans", "beans", "kit", "kit", "merch", "kit", "beans"],
        "price": [12.5, 22.0, 18.0, 45.0, 9.5, 4.5, 20.0],
    })}

def _cases():
    return [_example()]
`,
  hint: "AND is worked out before OR, so `category = 'beans' OR category = 'kit' AND price < 20` doesn't mean what it looks like. `IN ('beans', 'kit')` sidesteps it.",
  solution: "SELECT name, category, price\nFROM products\nWHERE category IN ('beans', 'kit')\n  AND price < 20\nORDER BY price, name;\n",
  alt: ["SELECT name, category, price FROM products WHERE (category = 'beans' OR category = 'kit') AND price < 20 ORDER BY price, name;\n"],
  wrong: [
    "SELECT name, category, price\nFROM products\nWHERE category = 'beans' OR category = 'kit' AND price < 20\nORDER BY price, name;\n",
    "SELECT name, category, price\nFROM products\nWHERE category IN ('beans', 'kit') AND price <= 20\nORDER BY price, name;\n",
  ],
},
{
  id: 's26', difficulty: 'easy', lang: 'sql', tags: ['dates', 'group by', 'ties'],
  title: 'Busiest hour',
  prompt: [
    "`orders` has `order_id` and `placed_at` (text like `'2024-03-02 09:15'`).",
    'Return one row: `hour` (a whole number, 0–23) with the most orders, and `orders`. If two hours tie, the earlier hour wins.',
  ],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT CAST(strftime('%H', placed_at) AS INTEGER) AS hour, COUNT(*) AS orders
FROM orders
GROUP BY hour
ORDER BY orders DESC, hour
LIMIT 1
"""

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5, 6],
        "placed_at": ["2024-03-01 09:10", "2024-03-01 14:05", "2024-03-02 09:40",
                      "2024-03-02 14:59", "2024-03-03 18:00", "2024-03-03 11:30"],
    })}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1, 2, 3], "placed_at": ["2024-01-01 23:00", "2024-01-02 23:30", "2024-01-02 07:00"]})},
    ]
`,
  hint: "`strftime('%H', placed_at)` is text like '09' — wrap it in `CAST(... AS INTEGER)` for a number. Then count, sort by the count and then the hour, LIMIT 1.",
  solution: "SELECT CAST(strftime('%H', placed_at) AS INTEGER) AS hour, COUNT(*) AS orders\nFROM orders\nGROUP BY hour\nORDER BY orders DESC, hour\nLIMIT 1;\n",
  alt: ['SELECT CAST(substr(placed_at, 12, 2) AS INTEGER) AS hour, COUNT(*) AS orders FROM orders GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 1;\n'],
  wrong: [
    "SELECT strftime('%H', placed_at) AS hour, COUNT(*) AS orders\nFROM orders\nGROUP BY hour\nORDER BY orders DESC, hour\nLIMIT 1;\n",
    "SELECT CAST(strftime('%H', placed_at) AS INTEGER) AS hour, COUNT(*) AS orders\nFROM orders\nGROUP BY hour\nORDER BY orders DESC, hour DESC\nLIMIT 1;\n",
  ],
},

/* ── Medium ────────────────────────────────────────────── */
{
  id: 's27', difficulty: 'medium', lang: 'sql', tags: ['subquery', 'NULL', 'DISTINCT'],
  title: 'Second-highest price',
  prompt: [
    '`menu` has `drink` and `price`. Several drinks can share a price.',
    'Return one row with one column, `price`: the second-highest **different** price on the menu. If there is no second price, the row holds NULL.',
  ],
  stub: 'SELECT *\nFROM menu;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT (SELECT DISTINCT price FROM menu ORDER BY price DESC LIMIT 1 OFFSET 1) AS price"

def _example():
    return {"menu": pd.DataFrame({"drink": ["latte", "mocha", "tea", "water"], "price": [5.0, 5.0, 4.5, 3.0]})}

def _cases():
    return [
        _example(),
        {"menu": pd.DataFrame({"drink": ["tea"], "price": [3.0]})},
        {"menu": pd.DataFrame({"drink": ["a", "b"], "price": [2.0, 2.0]})},
    ]
`,
  hint: 'Two traps: a repeated top price, and a menu with only one price. `DISTINCT` handles the first; wrapping the query in `SELECT (...) AS price` turns "no rows" into one NULL row.',
  solution: 'SELECT (\n  SELECT DISTINCT price\n  FROM menu\n  ORDER BY price DESC\n  LIMIT 1 OFFSET 1\n) AS price;\n',
  alt: ['SELECT MAX(price) AS price FROM menu WHERE price < (SELECT MAX(price) FROM menu);\n'],
  wrong: [
    'SELECT price\nFROM menu\nORDER BY price DESC\nLIMIT 1 OFFSET 1;\n',
    'SELECT DISTINCT price\nFROM menu\nORDER BY price DESC\nLIMIT 1 OFFSET 1;\n',
  ],
},
{
  id: 's28', difficulty: 'medium', lang: 'sql', tags: ['duplicates', 'strings', 'HAVING'],
  title: 'Signed up twice',
  prompt: [
    '`signups` has `signup_id` and `email`. Emails that differ only in capitals or surrounding spaces belong to the same person.',
    'Return every email used more than once: `email` (cleaned — trimmed and lower case) and `n`, how many times.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM signups;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n FROM signups GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1"

def _example():
    return {"signups": pd.DataFrame({
        "signup_id": [1, 2, 3, 4, 5, 6],
        "email": ["ada@mail.com", "ADA@mail.com ", "kofi@mail.com", "zola@mail.com", " zola@mail.com", "zola@MAIL.com"],
    })}

def _cases():
    return [
        _example(),
        {"signups": pd.DataFrame({"signup_id": [1, 2], "email": ["a@x.com", "b@x.com"]})},
    ]
`,
  hint: 'Group on the cleaned email, `LOWER(TRIM(email))`, and keep the groups with `HAVING COUNT(*) > 1`.',
  solution: 'SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n\nFROM signups\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) > 1;\n',
  alt: ['SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n FROM signups GROUP BY 1 HAVING n > 1;\n'],
  wrong: [
    'SELECT email, COUNT(*) AS n\nFROM signups\nGROUP BY email\nHAVING COUNT(*) > 1;\n',
    'SELECT LOWER(email) AS email, COUNT(*) AS n\nFROM signups\nGROUP BY LOWER(email)\nHAVING COUNT(*) > 1;\n',
    'SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n\nFROM signups\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) >= 1;\n',
  ],
},
{
  id: 's29', difficulty: 'medium', lang: 'sql', tags: ['joins', 'group by', 'HAVING'],
  title: 'Big orders',
  prompt: [
    '`order_items` has `order_id`, `product_id` and `qty`. `products` has `product_id`, `name` and `price`.',
    'Return `order_id` and `total` (qty × price over all the order\'s lines) for every order whose total is **over 50**.',
  ],
  notes: ['Exactly 50 is not over 50.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM order_items;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT oi.order_id, SUM(oi.qty * p.price) AS total
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY oi.order_id
HAVING SUM(oi.qty * p.price) > 50
"""

def _example():
    return {
        "products": pd.DataFrame({"product_id": [1, 2, 3], "name": ["beans", "grinder", "mug"], "price": [12.5, 45.0, 9.5]}),
        "order_items": pd.DataFrame({"order_id": [1, 1, 2, 2, 3, 4],
                                     "product_id": [1, 3, 2, 3, 1, 2],
                                     "qty": [2, 1, 1, 1, 4, 2]}),
    }

def _cases():
    r = np.random.default_rng(129)
    items = pd.DataFrame({"order_id": r.integers(1, 15, 40).tolist(),
                          "product_id": r.integers(1, 4, 40).tolist(),
                          "qty": r.integers(1, 4, 40).tolist()})
    return [_example(), {"products": _example()["products"], "order_items": items}]
`,
  hint: 'Join the lines to their prices, GROUP BY order, and filter the totals with HAVING — WHERE only ever sees one line at a time.',
  solution: 'SELECT oi.order_id, SUM(oi.qty * p.price) AS total\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY oi.order_id\nHAVING SUM(oi.qty * p.price) > 50;\n',
  alt: ['SELECT oi.order_id, SUM(oi.qty * p.price) AS total FROM order_items oi JOIN products p USING (product_id) GROUP BY oi.order_id HAVING total > 50;\n'],
  wrong: [
    'SELECT oi.order_id, SUM(oi.qty * p.price) AS total\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nWHERE oi.qty * p.price > 50\nGROUP BY oi.order_id;\n',
    'SELECT oi.order_id, SUM(p.price) AS total\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY oi.order_id\nHAVING SUM(p.price) > 50;\n',
    'SELECT oi.order_id, SUM(oi.qty * p.price) AS total\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nGROUP BY oi.order_id\nHAVING SUM(oi.qty * p.price) >= 50;\n',
  ],
},
{
  id: 's30', difficulty: 'medium', lang: 'sql', tags: ['joins', 'anti-join', 'dates'],
  title: 'Quiet in March',
  prompt: [
    '`customers` has `customer_id` and `name`. `orders` has `order_id`, `customer_id` and `order_date` (text like `\'2024-03-05\'`).',
    'Return the `name` of every customer who placed **no order in March 2024** — whether or not they ordered in other months — in alphabetical order.',
  ],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT c.name
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.order_date >= '2024-03-01' AND o.order_date < '2024-04-01'
WHERE o.order_id IS NULL
ORDER BY c.name
"""

def _example():
    return {
        "customers": pd.DataFrame({"customer_id": [1, 2, 3, 4, 5], "name": ["Zola", "Tunde", "Kofi", "Ada", "Ife"]}),
        "orders": pd.DataFrame({"order_id": [10, 11, 12, 13, 14],
                                "customer_id": [1, 2, 3, 3, 1],
                                "order_date": ["2024-03-05", "2024-02-10", "2024-03-20", "2024-04-02", "2024-01-15"]}),
    }

def _cases():
    ex = _example()
    return [
        ex,
        {"customers": ex["customers"], "orders": pd.DataFrame({"order_id": [1], "customer_id": [4], "order_date": ["2024-05-01"]})},
    ]
`,
  hint: "The March condition belongs in the LEFT JOIN's `ON`, not in WHERE. In WHERE it throws away the customers the LEFT JOIN kept for you.",
  solution: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o\n  ON o.customer_id = c.customer_id\n AND o.order_date >= '2024-03-01'\n AND o.order_date < '2024-04-01'\nWHERE o.order_id IS NULL\nORDER BY c.name;\n",
  alt: ["SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND strftime('%Y-%m', o.order_date) = '2024-03') ORDER BY name;\n"],
  wrong: [
    "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_date >= '2024-03-01' AND o.order_date < '2024-04-01'\n  AND o.order_id IS NULL\nORDER BY c.name;\n",
    "SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE strftime('%Y-%m', o.order_date) <> '2024-03'\nORDER BY c.name;\n",
  ],
},
{
  id: 's31', difficulty: 'medium', lang: 'sql', tags: ['conditional aggregation', 'NULL', 'pivot'],
  title: 'Status by city',
  prompt: [
    '`orders` has `order_id`, `city` and `status`. Some orders have no status at all (NULL).',
    'Per city: `city`, `delivered`, `cancelled` and `other` — how many orders fall in each. `other` is everything else, **including** orders with no status.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT city,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       COUNT(*) - SUM(CASE WHEN status IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS other
FROM orders
GROUP BY city
"""

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5, 6, 7],
        "city": ["Lagos", "Lagos", "Lagos", "Accra", "Accra", "Accra", "Lagos"],
        "status": ["delivered", "cancelled", None, "delivered", "shipped", "delivered", "delivered"],
    })}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1, 2], "city": ["Tema", "Tema"], "status": ["shipped", "cancelled"]})},
    ]
`,
  hint: "`SUM(CASE WHEN ... THEN 1 ELSE 0 END)` counts matches. For `other`, careful: `status NOT IN (...)` is never true for a NULL status — taking the known ones away from `COUNT(*)` avoids that.",
  solution: "SELECT city,\n       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       COUNT(*) - SUM(CASE WHEN status IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS other\nFROM orders\nGROUP BY city;\n",
  alt: ["SELECT city, SUM(status = 'delivered') AS delivered, SUM(status = 'cancelled') AS cancelled, SUM(CASE WHEN status IS NULL OR status NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS other FROM orders GROUP BY city;\n"],
  wrong: [
    "SELECT city,\n       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       SUM(CASE WHEN status NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS other\nFROM orders\nGROUP BY city;\n",
    "SELECT city,\n       COUNT(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n       COUNT(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       0 AS other\nFROM orders\nGROUP BY city;\n",
  ],
},
{
  id: 's32', difficulty: 'medium', lang: 'sql', tags: ['percentages', 'integer division'],
  title: 'Cancellation rate',
  prompt: [
    '`orders` has `order_id`, `city` and `status`.',
    "Per city: `city` and `cancel_pct` — the percentage of that city's orders that were cancelled, rounded to 1 (so `33.3`, not `0.333` or `33`).",
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT city, ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct FROM orders GROUP BY city"

def _example():
    return {"orders": pd.DataFrame({
        "order_id": list(range(1, 10)),
        "city": ["Lagos", "Lagos", "Lagos", "Accra", "Accra", "Accra", "Accra", "Tema", "Tema"],
        "status": ["cancelled", "delivered", "delivered", "delivered", "cancelled", "shipped", "delivered", "delivered", "shipped"],
    })}

def _cases():
    return [_example()]
`,
  hint: 'In SQLite a whole number divided by a whole number drops the fraction: `100 * 1 / 3` is 33. Start with `100.0` and it stays a decimal.',
  solution: "SELECT city,\n       ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders\nGROUP BY city;\n",
  alt: ["SELECT city, ROUND(AVG(CASE WHEN status = 'cancelled' THEN 100.0 ELSE 0 END), 1) AS cancel_pct FROM orders GROUP BY city;\n"],
  wrong: [
    "SELECT city,\n       ROUND(100 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders\nGROUP BY city;\n",
    "SELECT city,\n       ROUND(1.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct\nFROM orders\nGROUP BY city;\n",
  ],
},
{
  id: 's33', difficulty: 'medium', lang: 'sql', tags: ['window functions', 'ties'],
  title: 'Latest order per customer',
  prompt: [
    '`orders` has `order_id`, `customer_id` and `order_date`. Order ids were not handed out in date order.',
    "For each customer, return `customer_id`, `order_id` and `order_date` of their latest order. Two orders on the same latest day: the larger `order_id` wins.",
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH r AS (
  SELECT order_id, customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, order_date FROM r WHERE rn = 1
"""

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [7, 3, 9, 4, 8],
        "customer_id": [1, 1, 1, 2, 2],
        "order_date": ["2024-03-01", "2024-03-05", "2024-03-05", "2024-02-01", "2024-01-20"],
    })}

def _cases():
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [1], "customer_id": [9], "order_date": ["2024-06-06"]})},
    ]
`,
  hint: '`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC)` numbers each customer\'s orders newest first — keep number 1.',
  solution: 'WITH r AS (\n  SELECT order_id, customer_id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date\nFROM r\nWHERE rn = 1;\n',
  alt: ['SELECT customer_id, order_id, order_date FROM orders o WHERE NOT EXISTS (SELECT 1 FROM orders x WHERE x.customer_id = o.customer_id AND (x.order_date > o.order_date OR (x.order_date = o.order_date AND x.order_id > o.order_id)));\n'],
  wrong: [
    'SELECT customer_id, MAX(order_id) AS order_id, MAX(order_date) AS order_date\nFROM orders\nGROUP BY customer_id;\n',
    'WITH r AS (\n  SELECT order_id, customer_id, order_date,\n         RANK() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date FROM r WHERE rn = 1;\n',
  ],
},
{
  id: 's34', difficulty: 'medium', lang: 'sql', tags: ['self-join', 'NULL'],
  title: 'Who manages whom',
  prompt: [
    "`staff` has `staff_id`, `name` and `manager_id` — the `staff_id` of that person's manager. The person at the top has no manager (NULL).",
    "Return `name` and `manager` (the manager's name, NULL for the top person) for everyone, sorted by name.",
  ],
  stub: 'SELECT *\nFROM staff;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT s.name, m.name AS manager FROM staff s LEFT JOIN staff m ON m.staff_id = s.manager_id ORDER BY s.name"

def _example():
    return {"staff": pd.DataFrame({"staff_id": [1, 2, 3, 4, 5],
                                   "name": ["Amara", "Kofi", "Zola", "Ife", "Tunde"],
                                   "manager_id": pd.array([None, 1, 1, 2, 2], dtype="Int64")})}

def _cases():
    return [
        _example(),
        {"staff": pd.DataFrame({"staff_id": [7], "name": ["Solo"], "manager_id": pd.array([None], dtype="Int64")})},
    ]
`,
  hint: 'Join the table to itself: `FROM staff s LEFT JOIN staff m ON m.staff_id = s.manager_id`. LEFT, so the top person stays.',
  solution: 'SELECT s.name, m.name AS manager\nFROM staff s\nLEFT JOIN staff m ON m.staff_id = s.manager_id\nORDER BY s.name;\n',
  alt: ['SELECT s.name, (SELECT m.name FROM staff m WHERE m.staff_id = s.manager_id) AS manager FROM staff s ORDER BY s.name;\n'],
  wrong: [
    'SELECT s.name, m.name AS manager\nFROM staff s\nJOIN staff m ON m.staff_id = s.manager_id\nORDER BY s.name;\n',
    'SELECT s.name, m.name AS manager\nFROM staff s\nLEFT JOIN staff m ON s.staff_id = m.manager_id\nORDER BY s.name;\n',
  ],
},
{
  id: 's35', difficulty: 'medium', lang: 'sql', tags: ['self-join', 'dates'],
  title: 'Two days running',
  prompt: [
    "`logins` has `username` and `day` (text like `'2024-01-31'`). Someone can log in several times a day.",
    'Return every `username` that logged in on **two consecutive calendar days** at least once, in alphabetical order, each once.',
  ],
  stub: 'SELECT *\nFROM logins;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT DISTINCT a.username FROM logins a JOIN logins b ON b.username = a.username AND b.day = date(a.day, '+1 day') ORDER BY a.username"

def _example():
    return {"logins": pd.DataFrame({
        "username": ["ada", "ada", "ada", "kofi", "kofi", "kofi", "zola", "zola", "nia"],
        "day": ["2024-01-30", "2024-01-31", "2024-02-01", "2024-02-01", "2024-02-03", "2024-02-01",
                "2024-01-31", "2024-02-01", "2024-02-05"],
    })}

def _cases():
    return [
        _example(),
        {"logins": pd.DataFrame({"username": ["esi", "esi"], "day": ["2024-03-01", "2024-03-03"]})},
    ]
`,
  hint: "Join logins to itself where it's the same user and the second day is `date(a.day, '+1 day')`. date() knows that 31 January is followed by 1 February.",
  solution: "SELECT DISTINCT a.username\nFROM logins a\nJOIN logins b\n  ON b.username = a.username\n AND b.day = date(a.day, '+1 day')\nORDER BY a.username;\n",
  alt: ['WITH d AS (SELECT DISTINCT username, day FROM logins),\ng AS (SELECT username, julianday(day) - julianday(LAG(day) OVER (PARTITION BY username ORDER BY day)) AS gap FROM d)\nSELECT DISTINCT username FROM g WHERE gap = 1 ORDER BY username;\n'],
  wrong: [
    'SELECT DISTINCT a.username\nFROM logins a\nJOIN logins b ON b.username = a.username AND b.day > a.day\nORDER BY a.username;\n',
    "SELECT a.username\nFROM logins a\nJOIN logins b ON b.username = a.username AND b.day = date(a.day, '+1 day')\nORDER BY a.username;\n",
    'SELECT DISTINCT a.username\nFROM logins a\nJOIN logins b ON b.username = a.username\n AND CAST(substr(b.day, 9, 2) AS INTEGER) = CAST(substr(a.day, 9, 2) AS INTEGER) + 1\nORDER BY a.username;\n',
  ],
},
{
  id: 's36', difficulty: 'medium', lang: 'sql', tags: ['pivot', 'conditional aggregation'],
  title: 'Months as columns',
  prompt: [
    "`sales` has `product`, `sale_date` (text, January to March 2024) and `amount`.",
    "Return one row per product: `product`, `jan`, `feb`, `mar` — that month's total, and **0** (not NULL) for a month with no sales.",
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT product,
       SUM(CASE WHEN strftime('%m', sale_date) = '01' THEN amount ELSE 0 END) AS jan,
       SUM(CASE WHEN strftime('%m', sale_date) = '02' THEN amount ELSE 0 END) AS feb,
       SUM(CASE WHEN strftime('%m', sale_date) = '03' THEN amount ELSE 0 END) AS mar
FROM sales
GROUP BY product
"""

def _example():
    return {"sales": pd.DataFrame({
        "product": ["beans", "beans", "beans", "mug", "mug", "grinder"],
        "sale_date": ["2024-01-05", "2024-01-20", "2024-03-02", "2024-02-14", "2024-02-15", "2024-03-30"],
        "amount": [10.0, 5.0, 8.0, 9.0, 9.0, 45.0],
    })}

def _cases():
    return [_example()]
`,
  hint: "One `SUM(CASE WHEN strftime('%m', sale_date) = '01' THEN amount ELSE 0 END)` per month. Without the `ELSE 0`, a month with nothing sums to NULL.",
  solution: "SELECT product,\n       SUM(CASE WHEN strftime('%m', sale_date) = '01' THEN amount ELSE 0 END) AS jan,\n       SUM(CASE WHEN strftime('%m', sale_date) = '02' THEN amount ELSE 0 END) AS feb,\n       SUM(CASE WHEN strftime('%m', sale_date) = '03' THEN amount ELSE 0 END) AS mar\nFROM sales\nGROUP BY product;\n",
  alt: ["SELECT product, SUM(amount * (strftime('%m', sale_date) = '01')) AS jan, SUM(amount * (strftime('%m', sale_date) = '02')) AS feb, SUM(amount * (strftime('%m', sale_date) = '03')) AS mar FROM sales GROUP BY product;\n"],
  wrong: [
    "SELECT product,\n       SUM(CASE WHEN strftime('%m', sale_date) = '01' THEN amount END) AS jan,\n       SUM(CASE WHEN strftime('%m', sale_date) = '02' THEN amount END) AS feb,\n       SUM(CASE WHEN strftime('%m', sale_date) = '03' THEN amount END) AS mar\nFROM sales\nGROUP BY product;\n",
    "SELECT product,\n       COUNT(CASE WHEN strftime('%m', sale_date) = '01' THEN amount END) AS jan,\n       COUNT(CASE WHEN strftime('%m', sale_date) = '02' THEN amount END) AS feb,\n       COUNT(CASE WHEN strftime('%m', sale_date) = '03' THEN amount END) AS mar\nFROM sales\nGROUP BY product;\n",
  ],
},
{
  id: 's37', difficulty: 'medium', lang: 'sql', tags: ['subquery', 'window functions'],
  title: 'Pricier than the category',
  prompt: [
    '`products` has `name`, `category` and `price`.',
    "Return `name`, `category` and `price` of every product priced **above its own category's average**.",
  ],
  notes: ['Equal to the average is not above it.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM products;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT name, category, price FROM products p WHERE price > (SELECT AVG(price) FROM products q WHERE q.category = p.category)"

def _example():
    return {"products": pd.DataFrame({
        "name": ["house", "dark", "decaf", "grinder", "cone", "filters", "mug", "tote"],
        "category": ["beans", "beans", "beans", "kit", "kit", "kit", "merch", "merch"],
        "price": [12.5, 14.0, 13.0, 45.0, 22.0, 4.5, 10.0, 10.0],
    })}

def _cases():
    return [_example()]
`,
  hint: "A correlated subquery works out each row's own category average: `WHERE price > (SELECT AVG(price) FROM products q WHERE q.category = p.category)`.",
  solution: 'SELECT name, category, price\nFROM products p\nWHERE price > (\n  SELECT AVG(price) FROM products q WHERE q.category = p.category\n);\n',
  alt: ['SELECT name, category, price FROM (SELECT *, AVG(price) OVER (PARTITION BY category) AS avg_p FROM products) WHERE price > avg_p;\n'],
  wrong: [
    'SELECT name, category, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);\n',
    'SELECT name, category, price\nFROM products p\nWHERE price >= (SELECT AVG(price) FROM products q WHERE q.category = p.category);\n',
  ],
},
{
  id: 's38', difficulty: 'medium', lang: 'sql', tags: ['joins', 'group by', 'NULL'],
  title: 'First order, and how many',
  prompt: [
    '`customers` has `customer_id` and `name`. `orders` has `order_id`, `customer_id` and `order_date`.',
    'For **every** customer — including the ones who never ordered — return `name`, `first_order` (their earliest order date, NULL if none) and `orders` (how many, 0 if none).',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT c.name, MIN(o.order_date) AS first_order, COUNT(o.order_id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
"""

def _example():
    return {
        "customers": pd.DataFrame({"customer_id": [1, 2, 3], "name": ["Ada", "Kofi", "Zola"]}),
        "orders": pd.DataFrame({"order_id": [10, 11, 12], "customer_id": [1, 1, 3],
                                "order_date": ["2024-02-03", "2024-01-15", "2024-03-01"]}),
    }

def _cases():
    return [_example()]
`,
  hint: 'LEFT JOIN keeps the customers with no orders. Then count a column from orders — `COUNT(o.order_id)` — because `COUNT(*)` counts their empty row as 1.',
  solution: 'SELECT c.name,\n       MIN(o.order_date) AS first_order,\n       COUNT(o.order_id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name;\n',
  alt: ['SELECT name, (SELECT MIN(order_date) FROM orders o WHERE o.customer_id = c.customer_id) AS first_order, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS orders FROM customers c;\n'],
  wrong: [
    'SELECT c.name, MIN(o.order_date) AS first_order, COUNT(o.order_id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name;\n',
    'SELECT c.name, MIN(o.order_date) AS first_order, COUNT(*) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name;\n',
  ],
},
{
  id: 's39', difficulty: 'medium', lang: 'sql', tags: ['window functions', 'dates'],
  title: 'Days until the next sale',
  prompt: [
    '`sales` has `sale_id`, `product` and `sale_date`, in no order.',
    'For every sale: `sale_id`, `product` and `days_to_next` — days until the **next** sale of the same product (NULL for its last sale). Sort by product, date, then sale_id; two sales on one day go in sale_id order, 0 days apart.',
  ],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT sale_id, product,
       julianday(LEAD(sale_date) OVER (PARTITION BY product ORDER BY sale_date, sale_id)) - julianday(sale_date) AS days_to_next
FROM sales
ORDER BY product, sale_date, sale_id
"""

def _example():
    return {"sales": pd.DataFrame({
        "sale_id": [5, 2, 7, 1, 3, 4],
        "product": ["beans", "beans", "mug", "beans", "mug", "beans"],
        "sale_date": ["2024-01-10", "2024-01-03", "2024-02-01", "2024-01-03", "2024-01-28", "2024-01-31"],
    })}

def _cases():
    return [_example()]
`,
  hint: '`LEAD(sale_date) OVER (PARTITION BY product ORDER BY sale_date, sale_id)` is the next sale\'s date for the same product. Subtract through julianday.',
  solution: 'SELECT sale_id, product,\n       julianday(LEAD(sale_date) OVER (PARTITION BY product ORDER BY sale_date, sale_id))\n         - julianday(sale_date) AS days_to_next\nFROM sales\nORDER BY product, sale_date, sale_id;\n',
  alt: ['SELECT sale_id, product, (SELECT MIN(julianday(x.sale_date)) FROM sales x WHERE x.product = s.product AND (x.sale_date > s.sale_date OR (x.sale_date = s.sale_date AND x.sale_id > s.sale_id))) - julianday(s.sale_date) AS days_to_next FROM sales s ORDER BY product, sale_date, sale_id;\n'],
  wrong: [
    'SELECT sale_id, product,\n       julianday(sale_date) - julianday(LAG(sale_date) OVER (PARTITION BY product ORDER BY sale_date, sale_id)) AS days_to_next\nFROM sales\nORDER BY product, sale_date, sale_id;\n',
    'SELECT sale_id, product,\n       julianday(LEAD(sale_date) OVER (ORDER BY sale_date, sale_id)) - julianday(sale_date) AS days_to_next\nFROM sales\nORDER BY product, sale_date, sale_id;\n',
  ],
},
{
  id: 's40', difficulty: 'medium', lang: 'sql', tags: ['CASE', 'group by', 'boundaries'],
  title: 'Order size bands',
  prompt: [
    '`orders` has `order_id` and `total` (never negative).',
    'Put each order in a band of width 10 — `0` for totals under 10, `10` for 10 up to (not including) 20, and so on — then return `band` and `orders` (how many), in band order.',
  ],
  notes: ['A total of exactly 10.00 is in band 10.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT CAST(total / 10 AS INTEGER) * 10 AS band, COUNT(*) AS orders FROM orders GROUP BY band ORDER BY band"

def _example():
    return {"orders": pd.DataFrame({"order_id": list(range(1, 8)),
                                    "total": [4.5, 10.0, 19.99, 25.0, 9.99, 31.2, 20.0]})}

def _cases():
    r = np.random.default_rng(140)
    return [_example(), {"orders": pd.DataFrame({"order_id": list(range(30)),
                                                 "total": np.round(r.uniform(0, 60, 30), 2).tolist()})}]
`,
  hint: '`CAST(x AS INTEGER)` chops off the decimals. So `CAST(total / 10 AS INTEGER) * 10` drops 19.99 to 10 — ROUND would push it up to 20.',
  solution: 'SELECT CAST(total / 10 AS INTEGER) * 10 AS band, COUNT(*) AS orders\nFROM orders\nGROUP BY band\nORDER BY band;\n',
  alt: ['SELECT (CAST(total AS INTEGER) / 10) * 10 AS band, COUNT(*) AS orders FROM orders GROUP BY 1 ORDER BY 1;\n'],
  wrong: [
    'SELECT ROUND(total / 10) * 10 AS band, COUNT(*) AS orders\nFROM orders\nGROUP BY band\nORDER BY band;\n',
    'SELECT CAST(total AS INTEGER) / 10 AS band, COUNT(*) AS orders\nFROM orders\nGROUP BY band\nORDER BY band;\n',
  ],
},
{
  id: 's41', difficulty: 'medium', lang: 'sql', tags: ['UNION', 'strings', 'DISTINCT'],
  title: 'Everyone who signed up',
  prompt: [
    '`web` and `app` each have `email` and `signed_up` — people who joined on the website and in the app. Some joined on both, and the emails were typed with different capitals and spaces.',
    'Return one row: `people`, the number of different people across both (compare emails trimmed and in lower case).',
  ],
  stub: 'SELECT *\nFROM web;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT COUNT(*) AS people FROM (SELECT LOWER(TRIM(email)) AS e FROM web UNION SELECT LOWER(TRIM(email)) FROM app)"

def _example():
    return {
        "web": pd.DataFrame({"email": ["ada@mail.com", "kofi@mail.com", " ADA@mail.com"],
                             "signed_up": ["2024-01-01", "2024-01-02", "2024-01-05"]}),
        "app": pd.DataFrame({"email": ["Kofi@mail.com", "zola@mail.com", "zola@mail.com"],
                             "signed_up": ["2024-02-01", "2024-02-03", "2024-02-04"]}),
    }

def _cases():
    return [_example()]
`,
  hint: '`UNION` (not UNION ALL) stacks the two lists and drops the repeats — but only exact repeats, so clean the emails inside each SELECT first.',
  solution: 'SELECT COUNT(*) AS people\nFROM (\n  SELECT LOWER(TRIM(email)) AS e FROM web\n  UNION\n  SELECT LOWER(TRIM(email)) FROM app\n);\n',
  alt: ['SELECT COUNT(DISTINCT e) AS people FROM (SELECT LOWER(TRIM(email)) AS e FROM web UNION ALL SELECT LOWER(TRIM(email)) FROM app);\n'],
  wrong: [
    'SELECT COUNT(*) AS people\nFROM (\n  SELECT LOWER(TRIM(email)) AS e FROM web\n  UNION ALL\n  SELECT LOWER(TRIM(email)) FROM app\n);\n',
    'SELECT COUNT(*) AS people\nFROM (\n  SELECT email FROM web\n  UNION\n  SELECT email FROM app\n);\n',
  ],
},

/* ── Hard ──────────────────────────────────────────────── */
{
  id: 's42', difficulty: 'hard', lang: 'sql', tags: ['gaps and islands', 'window functions'],
  title: 'Longest login streak',
  prompt: [
    "`logins` has `username` and `day` (text like `'2024-01-31'`). Several logins on one day count as one day.",
    'For each user: `username` and `longest` — their longest run of consecutive calendar days with a login.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM logins;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH d AS (SELECT DISTINCT username, day FROM logins),
g AS (
  SELECT username, julianday(day) - ROW_NUMBER() OVER (PARTITION BY username ORDER BY day) AS grp
  FROM d
)
SELECT username, MAX(n) AS longest
FROM (SELECT username, grp, COUNT(*) AS n FROM g GROUP BY username, grp)
GROUP BY username
"""

def _example():
    return {"logins": pd.DataFrame({
        "username": ["ada"] * 6 + ["kofi"] + ["zola"] * 4,
        "day": ["2024-01-01", "2024-01-02", "2024-01-02", "2024-01-03", "2024-01-05", "2024-01-06",
                "2024-01-10",
                "2024-01-30", "2024-01-31", "2024-02-01", "2024-02-03"],
    })}

def _cases():
    r = np.random.default_rng(142)
    rows = []
    for user in ["ada", "kofi", "zola", "nia"]:
        for day in pd.date_range("2024-03-01", periods=30, freq="D"):
            if r.random() < 0.55:
                rows.append({"username": user, "day": day.strftime("%Y-%m-%d")})
    return [_example(), {"logins": pd.DataFrame(rows)}]
`,
  hint: 'The trick: in a run of consecutive days, the day minus its position in the run is the same number all the way through. `julianday(day) - ROW_NUMBER() OVER (...)` labels each run — after removing repeated days with DISTINCT.',
  solution: 'WITH d AS (SELECT DISTINCT username, day FROM logins),\ng AS (\n  SELECT username,\n         julianday(day) - ROW_NUMBER() OVER (PARTITION BY username ORDER BY day) AS grp\n  FROM d\n)\nSELECT username, MAX(n) AS longest\nFROM (SELECT username, grp, COUNT(*) AS n FROM g GROUP BY username, grp)\nGROUP BY username;\n',
  alt: ['WITH d AS (SELECT DISTINCT username, day FROM logins),\nf AS (SELECT username, day, CASE WHEN julianday(day) - julianday(LAG(day) OVER (PARTITION BY username ORDER BY day)) = 1 THEN 0 ELSE 1 END AS new FROM d),\nh AS (SELECT username, SUM(new) OVER (PARTITION BY username ORDER BY day) AS island FROM f)\nSELECT username, MAX(c) AS longest FROM (SELECT username, island, COUNT(*) AS c FROM h GROUP BY username, island) GROUP BY username;\n'],
  wrong: [
    'WITH g AS (\n  SELECT username, julianday(day) - ROW_NUMBER() OVER (PARTITION BY username ORDER BY day) AS grp\n  FROM logins\n)\nSELECT username, MAX(n) AS longest\nFROM (SELECT username, grp, COUNT(*) AS n FROM g GROUP BY username, grp)\nGROUP BY username;\n',
    'SELECT username, COUNT(DISTINCT day) AS longest\nFROM logins\nGROUP BY username;\n',
  ],
},
{
  id: 's43', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'statistics'],
  title: 'The median',
  prompt: [
    '`scores` has `team` and `points`. SQLite has no MEDIAN function.',
    'For each team: `team` and `median` — the middle value of its points, or for an even count, the mean of the two middle values.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM scores;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH r AS (
  SELECT team, points,
         ROW_NUMBER() OVER (PARTITION BY team ORDER BY points) AS rn,
         COUNT(*) OVER (PARTITION BY team) AS n
  FROM scores
)
SELECT team, AVG(points) AS median
FROM r
WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
GROUP BY team
"""

def _example():
    return {"scores": pd.DataFrame({
        "team": ["A", "A", "A", "A", "B", "B", "B", "C", "D", "D", "D", "D", "D"],
        "points": [10, 30, 20, 40, 7, 3, 5, 8, 2, 2, 9, 9, 9],
    })}

def _cases():
    r = np.random.default_rng(143)
    return [_example(), {"scores": pd.DataFrame({"team": r.choice(["X", "Y", "Z"], 25).tolist(),
                                                 "points": r.integers(0, 50, 25).tolist()})}]
`,
  hint: 'Number each team\'s points in order with ROW_NUMBER, and count them with `COUNT(*) OVER (PARTITION BY team)`. The middle rows are `(n + 1) / 2` and `(n + 2) / 2` — the same row when n is odd — and averaging them gives the median.',
  solution: 'WITH r AS (\n  SELECT team, points,\n         ROW_NUMBER() OVER (PARTITION BY team ORDER BY points) AS rn,\n         COUNT(*) OVER (PARTITION BY team) AS n\n  FROM scores\n)\nSELECT team, AVG(points) AS median\nFROM r\nWHERE rn IN ((n + 1) / 2, (n + 2) / 2)\nGROUP BY team;\n',
  alt: ['WITH r AS (SELECT team, points, ROW_NUMBER() OVER (PARTITION BY team ORDER BY points) AS rn, COUNT(*) OVER (PARTITION BY team) AS n FROM scores)\nSELECT team, AVG(points) AS median FROM r WHERE rn BETWEEN n / 2.0 AND n / 2.0 + 1 GROUP BY team;\n'],
  wrong: [
    'SELECT team, AVG(points) AS median\nFROM scores\nGROUP BY team;\n',
    'WITH r AS (\n  SELECT team, points,\n         ROW_NUMBER() OVER (PARTITION BY team ORDER BY points) AS rn,\n         COUNT(*) OVER (PARTITION BY team) AS n\n  FROM scores\n)\nSELECT team, AVG(points) AS median\nFROM r\nWHERE rn = (n + 1) / 2\nGROUP BY team;\n',
  ],
},
{
  id: 's44', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'dates', 'gaps'],
  title: 'Rolling seven days',
  prompt: [
    "`daily` has `day` (text like `'2024-01-08'`) and `sales` — one row per trading day, and some days have no row at all.",
    'For every row: `day` and `week_sales` — the sales over the **7 calendar days** ending on that day (that day and the 6 before). Sort by day.',
  ],
  notes: ['Seven calendar days, not seven rows.'],
  stub: 'SELECT *\nFROM daily;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT day,
       SUM(sales) OVER (ORDER BY julianday(day) RANGE BETWEEN 6 PRECEDING AND CURRENT ROW) AS week_sales
FROM daily
ORDER BY day
"""

def _example():
    return {"daily": pd.DataFrame({
        "day": ["2024-01-01", "2024-01-02", "2024-01-05", "2024-01-08", "2024-01-09", "2024-01-20"],
        "sales": [10.0, 20.0, 30.0, 40.0, 5.0, 7.0],
    })}

def _cases():
    r = np.random.default_rng(144)
    days = pd.date_range("2024-02-01", periods=40, freq="D")
    keep = days[r.random(40) > 0.35]
    return [_example(), {"daily": pd.DataFrame({"day": keep.strftime("%Y-%m-%d").tolist(),
                                                "sales": np.round(r.uniform(5, 50, len(keep)), 2).tolist()})}]
`,
  hint: '`ROWS BETWEEN 6 PRECEDING` counts rows, which skips over missing days. `RANGE` measures the ORDER BY value itself — order by `julianday(day)` and `RANGE BETWEEN 6 PRECEDING AND CURRENT ROW` means the last seven days.',
  solution: 'SELECT day,\n       SUM(sales) OVER (\n         ORDER BY julianday(day)\n         RANGE BETWEEN 6 PRECEDING AND CURRENT ROW\n       ) AS week_sales\nFROM daily\nORDER BY day;\n',
  alt: ['SELECT day, (SELECT SUM(x.sales) FROM daily x WHERE julianday(x.day) BETWEEN julianday(d.day) - 6 AND julianday(d.day)) AS week_sales FROM daily d ORDER BY day;\n'],
  wrong: [
    'SELECT day,\n       SUM(sales) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS week_sales\nFROM daily\nORDER BY day;\n',
    'SELECT day,\n       SUM(sales) OVER (ORDER BY julianday(day) RANGE BETWEEN 7 PRECEDING AND CURRENT ROW) AS week_sales\nFROM daily\nORDER BY day;\n',
  ],
},
{
  id: 's45', difficulty: 'hard', lang: 'sql', tags: ['funnels', 'conditional aggregation'],
  title: 'Checkout funnel',
  prompt: [
    "`events` has `username` and `step` — `'view'`, `'cart'` or `'buy'`. A user can have any mix of steps, in any number.",
    "Count the users at each stage of the funnel, where each stage needs **all the ones before it**: `view` = users who viewed; `cart` = users who viewed and carted; `buy` = users who viewed, carted and bought. Return `step` and `users`, one row per step.",
  ],
  notes: ["Someone who bought through a direct link without viewing doesn't count towards buy.", 'Row order does not matter.'],
  stub: 'SELECT *\nFROM events;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH u AS (
  SELECT username,
         MAX(step = 'view') AS v, MAX(step = 'cart') AS c, MAX(step = 'buy') AS b
  FROM events
  GROUP BY username
)
SELECT 'view' AS step, SUM(v) AS users FROM u
UNION ALL SELECT 'cart', SUM(v * c) FROM u
UNION ALL SELECT 'buy', SUM(v * c * b) FROM u
"""

def _example():
    return {"events": pd.DataFrame({
        "username": ["ada", "ada", "ada", "kofi", "kofi", "zola", "nia", "ife", "ife", "tunde", "tunde", "ada"],
        "step": ["view", "cart", "buy", "view", "cart", "view", "buy", "cart", "buy", "view", "buy", "view"],
    })}

def _cases():
    r = np.random.default_rng(145)
    rows = [{"username": "u%d" % int(r.integers(0, 12)), "step": str(r.choice(["view", "cart", "buy"]))}
            for _ in range(40)]
    return [_example(), {"events": pd.DataFrame(rows)}]
`,
  hint: "First one row per user with a flag per step: `MAX(step = 'view')` is 1 if they ever viewed. Then the funnel is products of flags — `SUM(v * c)` counts users with both — and three SELECTs joined with UNION ALL.",
  solution: "WITH u AS (\n  SELECT username,\n         MAX(step = 'view') AS v,\n         MAX(step = 'cart') AS c,\n         MAX(step = 'buy') AS b\n  FROM events\n  GROUP BY username\n)\nSELECT 'view' AS step, SUM(v) AS users FROM u\nUNION ALL\nSELECT 'cart', SUM(v * c) FROM u\nUNION ALL\nSELECT 'buy', SUM(v * c * b) FROM u;\n",
  alt: ["SELECT 'view' AS step, COUNT(*) AS users FROM (SELECT username FROM events WHERE step = 'view' GROUP BY username)\nUNION ALL SELECT 'cart', COUNT(*) FROM (SELECT username FROM events WHERE step = 'view' INTERSECT SELECT username FROM events WHERE step = 'cart')\nUNION ALL SELECT 'buy', COUNT(*) FROM (SELECT username FROM events WHERE step = 'view' INTERSECT SELECT username FROM events WHERE step = 'cart' INTERSECT SELECT username FROM events WHERE step = 'buy');\n"],
  wrong: [
    'SELECT step, COUNT(DISTINCT username) AS users\nFROM events\nGROUP BY step;\n',
    "WITH u AS (\n  SELECT username, MAX(step = 'view') AS v, MAX(step = 'cart') AS c, MAX(step = 'buy') AS b\n  FROM events GROUP BY username\n)\nSELECT 'view' AS step, SUM(v) AS users FROM u\nUNION ALL SELECT 'cart', SUM(c) FROM u\nUNION ALL SELECT 'buy', SUM(b) FROM u;\n",
  ],
},
{
  id: 's46', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'dates', 'retention'],
  title: 'Came back within 30 days',
  prompt: [
    '`orders` has `order_id`, `customer_id` and `order_date`, in no order.',
    "Return the `customer_id` of every customer whose **second** order came within 30 days of their first, sorted. Day 30 counts; a second order on the same day as the first counts too.",
  ],
  notes: ['Two orders on the same day go in order_id order.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
WITH r AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn
  FROM orders
)
SELECT a.customer_id
FROM r a
JOIN r b ON b.customer_id = a.customer_id AND b.rn = 2
WHERE a.rn = 1 AND julianday(b.order_date) - julianday(a.order_date) <= 30
ORDER BY a.customer_id
"""

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "customer_id": [1, 1, 2, 2, 2, 3, 4, 4, 4, 5, 5],
        "order_date": ["2024-01-01", "2024-01-31", "2024-01-01", "2024-02-01", "2024-02-10",
                       "2024-03-05", "2024-02-01", "2024-02-01", "2024-05-01", "2024-04-01", "2024-01-10"],
    })}

def _cases():
    return [_example()]
`,
  hint: 'Number each customer\'s orders by date with ROW_NUMBER. Then join order 1 to order 2 for the same customer and compare their dates through julianday.',
  solution: 'WITH r AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn\n  FROM orders\n)\nSELECT a.customer_id\nFROM r a\nJOIN r b ON b.customer_id = a.customer_id AND b.rn = 2\nWHERE a.rn = 1\n  AND julianday(b.order_date) - julianday(a.order_date) <= 30\nORDER BY a.customer_id;\n',
  alt: ['WITH f AS (SELECT customer_id, order_date, LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS nxt, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn FROM orders)\nSELECT customer_id FROM f WHERE rn = 1 AND julianday(nxt) - julianday(order_date) <= 30 ORDER BY customer_id;\n'],
  wrong: [
    'WITH r AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn\n  FROM orders\n)\nSELECT a.customer_id\nFROM r a\nJOIN r b ON b.customer_id = a.customer_id AND b.rn = 2\nWHERE a.rn = 1 AND julianday(b.order_date) - julianday(a.order_date) < 30\nORDER BY a.customer_id;\n',
    'SELECT customer_id\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) >= 2 AND julianday(MAX(order_date)) - julianday(MIN(order_date)) <= 30\nORDER BY customer_id;\n',
  ],
},
{
  id: 's47', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'ties'],
  title: 'Top two, ties at the cut',
  prompt: [
    '`sales` has `category`, `product` and `units` — one row per sale.',
    "Return each category's top two products by **total** units: `category`, `product`, `units`. Tied products share a rank and the next rank is skipped (1, 1, 3), so a tie for second keeps everyone tied — and two tied for first leave no room for a third.",
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH t AS (SELECT category, product, SUM(units) AS units FROM sales GROUP BY category, product),
r AS (SELECT category, product, units, RANK() OVER (PARTITION BY category ORDER BY units DESC) AS rk FROM t)
SELECT category, product, units FROM r WHERE rk <= 2
"""

def _example():
    return {"sales": pd.DataFrame({
        "category": ["A", "A", "A", "A", "B", "B", "B", "B", "C"],
        "product":  ["x", "x", "y", "z", "p", "q", "q", "r", "s"],
        "units":    [6, 4, 10, 8, 9, 3, 4, 7, 5],
    })}

def _cases():
    return [_example()]
`,
  hint: 'Total per category and product first. `RANK()` gives ties the same number and skips the next — exactly the rule here. DENSE_RANK and ROW_NUMBER each break it one way.',
  solution: 'WITH t AS (\n  SELECT category, product, SUM(units) AS units\n  FROM sales\n  GROUP BY category, product\n), r AS (\n  SELECT category, product, units,\n         RANK() OVER (PARTITION BY category ORDER BY units DESC) AS rk\n  FROM t\n)\nSELECT category, product, units\nFROM r\nWHERE rk <= 2;\n',
  alt: ['WITH t AS (SELECT category, product, SUM(units) AS units FROM sales GROUP BY category, product)\nSELECT category, product, units FROM t WHERE (SELECT COUNT(*) FROM t u WHERE u.category = t.category AND u.units > t.units) < 2;\n'],
  wrong: [
    'WITH t AS (SELECT category, product, SUM(units) AS units FROM sales GROUP BY category, product),\nr AS (SELECT category, product, units, DENSE_RANK() OVER (PARTITION BY category ORDER BY units DESC) AS rk FROM t)\nSELECT category, product, units FROM r WHERE rk <= 2;\n',
    'WITH t AS (SELECT category, product, SUM(units) AS units FROM sales GROUP BY category, product),\nr AS (SELECT category, product, units, ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC) AS rk FROM t)\nSELECT category, product, units FROM r WHERE rk <= 2;\n',
  ],
},
{
  id: 's48', difficulty: 'hard', lang: 'sql', tags: ['recursive CTE', 'hierarchies'],
  title: 'Levels of the org chart',
  prompt: [
    "`staff` has `staff_id`, `name` and `manager_id` (NULL for the person at the top). The chart can be any number of levels deep.",
    'Return `name` and `level` for everyone — the top person is level 1, their reports level 2, and so on — sorted by level, then name.',
  ],
  stub: 'SELECT *\nFROM staff;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
WITH RECURSIVE tree(staff_id, name, level) AS (
  SELECT staff_id, name, 1 FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.staff_id, s.name, t.level + 1 FROM staff s JOIN tree t ON s.manager_id = t.staff_id
)
SELECT name, level FROM tree ORDER BY level, name
"""

def _example():
    return {"staff": pd.DataFrame({"staff_id": [1, 2, 3, 4, 5, 6],
                                   "name": ["Amara", "Kofi", "Zola", "Ife", "Tunde", "Nia"],
                                   "manager_id": pd.array([None, 1, 1, 2, 4, 3], dtype="Int64")})}

def _cases():
    return [
        _example(),
        {"staff": pd.DataFrame({"staff_id": [10, 11, 12, 13], "name": ["D", "C", "B", "A"],
                                "manager_id": pd.array([11, 12, 13, None], dtype="Int64")})},
    ]
`,
  hint: 'WITH RECURSIVE: start with the person whose manager_id IS NULL at level 1, then repeatedly add the staff whose manager is already in the tree, at level + 1.',
  solution: 'WITH RECURSIVE tree(staff_id, name, level) AS (\n  SELECT staff_id, name, 1\n  FROM staff\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.staff_id, s.name, t.level + 1\n  FROM staff s\n  JOIN tree t ON s.manager_id = t.staff_id\n)\nSELECT name, level\nFROM tree\nORDER BY level, name;\n',
  alt: ['WITH RECURSIVE up(staff_id, name, boss, level) AS (\n  SELECT staff_id, name, manager_id, 1 FROM staff\n  UNION ALL\n  SELECT u.staff_id, u.name, s.manager_id, u.level + 1 FROM up u JOIN staff s ON s.staff_id = u.boss\n)\nSELECT name, MAX(level) AS level FROM up GROUP BY staff_id, name ORDER BY level, name;\n'],
  wrong: [
    'WITH RECURSIVE tree(staff_id, name, level) AS (\n  SELECT staff_id, name, 0 FROM staff WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.staff_id, s.name, t.level + 1 FROM staff s JOIN tree t ON s.manager_id = t.staff_id\n)\nSELECT name, level FROM tree ORDER BY level, name;\n',
    'SELECT name, CASE WHEN manager_id IS NULL THEN 1 ELSE 2 END AS level\nFROM staff\nORDER BY level, name;\n',
  ],
},
{
  id: 's49', difficulty: 'hard', lang: 'sql', tags: ['self-join', 'counting', 'duplicates'],
  title: 'Bought together, in SQL',
  prompt: [
    '`order_items` has `order_id` and `product`. A product can appear twice in one order — count it once.',
    'Return pairs of products bought in the same order in **at least 2** orders: `product_a`, `product_b` (alphabetically, a before b) and `n` — sorted by `n` high to low, then `product_a`, then `product_b`.',
  ],
  stub: 'SELECT *\nFROM order_items;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
WITH d AS (SELECT DISTINCT order_id, product FROM order_items)
SELECT a.product AS product_a, b.product AS product_b, COUNT(*) AS n
FROM d a
JOIN d b ON a.order_id = b.order_id AND a.product < b.product
GROUP BY a.product, b.product
HAVING COUNT(*) >= 2
ORDER BY n DESC, product_a, product_b
"""

def _example():
    return {"order_items": pd.DataFrame({
        "order_id": [1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5],
        "product":  ["beans", "mug", "beans", "beans", "mug", "mug", "grinder", "beans",
                     "grinder", "filters", "filters", "grinder"],
    })}

def _cases():
    r = np.random.default_rng(149)
    rows = []
    for oid in range(1, 26):
        for p in r.choice(["beans", "mug", "grinder", "filters", "cups", "tote"], int(r.integers(1, 5))):
            rows.append({"order_id": oid, "product": str(p)})
    return [_example(), {"order_items": pd.DataFrame(rows)}]
`,
  hint: 'De-duplicate the lines first (a DISTINCT in a WITH). Then join the table to itself on order_id with `a.product < b.product`, so every pair appears once and in order.',
  solution: 'WITH d AS (SELECT DISTINCT order_id, product FROM order_items)\nSELECT a.product AS product_a, b.product AS product_b, COUNT(*) AS n\nFROM d a\nJOIN d b ON a.order_id = b.order_id AND a.product < b.product\nGROUP BY a.product, b.product\nHAVING COUNT(*) >= 2\nORDER BY n DESC, product_a, product_b;\n',
  alt: ['SELECT a.product AS product_a, b.product AS product_b, COUNT(DISTINCT a.order_id) AS n FROM order_items a JOIN order_items b ON a.order_id = b.order_id AND a.product < b.product GROUP BY a.product, b.product HAVING n >= 2 ORDER BY n DESC, product_a, product_b;\n'],
  wrong: [
    'SELECT a.product AS product_a, b.product AS product_b, COUNT(*) AS n\nFROM order_items a\nJOIN order_items b ON a.order_id = b.order_id AND a.product < b.product\nGROUP BY a.product, b.product\nHAVING COUNT(*) >= 2\nORDER BY n DESC, product_a, product_b;\n',
    'WITH d AS (SELECT DISTINCT order_id, product FROM order_items)\nSELECT a.product AS product_a, b.product AS product_b, COUNT(*) AS n\nFROM d a\nJOIN d b ON a.order_id = b.order_id AND a.product <> b.product\nGROUP BY a.product, b.product\nHAVING COUNT(*) >= 2\nORDER BY n DESC, product_a, product_b;\n',
  ],
},
{
  id: 's50', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'running totals'],
  title: 'First time overdrawn',
  prompt: [
    "`moves` has `move_id`, `account`, `ts` (text like `'2024-01-01 10:00'`) and `amount`. Move ids were handed out later, so they are not in time order. Each account starts at 0.",
    'For every account whose running balance ever goes **below zero**: `account` and `first_negative` — the `ts` of the move that first took it below zero.',
  ],
  notes: ['A balance of exactly 0 is not overdrawn.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM moves;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH b AS (
  SELECT account, ts, SUM(amount) OVER (PARTITION BY account ORDER BY ts) AS bal
  FROM moves
)
SELECT account, MIN(ts) AS first_negative FROM b WHERE bal < 0 GROUP BY account
"""

def _example():
    return {"moves": pd.DataFrame({
        "move_id": [4, 1, 2, 5, 3, 6, 7],
        "account": ["A", "A", "A", "B", "B", "B", "C"],
        "ts": ["2024-01-01 09:00", "2024-01-01 10:00", "2024-01-01 11:00",
               "2024-01-01 09:00", "2024-01-01 10:00", "2024-01-01 11:00", "2024-01-01 09:00"],
        "amount": [100.0, -60.0, -50.0, 30.0, -30.0, -5.0, 20.0],
    })}

def _cases():
    r = np.random.default_rng(150)
    rows = []
    for acct in ["A", "B", "C", "D"]:
        for i, t in enumerate(pd.date_range("2024-02-01 08:00", periods=8, freq="h")):
            rows.append({"account": acct, "ts": t.strftime("%Y-%m-%d %H:%M"), "amount": float(r.choice([-40, -15, 10, 25]))})
    moves = pd.DataFrame(rows).sample(frac=1, random_state=4).reset_index(drop=True)
    moves.insert(0, "move_id", r.permutation(len(moves)) + 1)
    return [_example(), {"moves": moves}]
`,
  hint: 'A running balance is `SUM(amount) OVER (PARTITION BY account ORDER BY ts)` — ordered by time, not by move_id. Keep the rows below zero and take each account\'s earliest ts.',
  solution: 'WITH b AS (\n  SELECT account, ts,\n         SUM(amount) OVER (PARTITION BY account ORDER BY ts) AS bal\n  FROM moves\n)\nSELECT account, MIN(ts) AS first_negative\nFROM b\nWHERE bal < 0\nGROUP BY account;\n',
  alt: ['SELECT m.account, MIN(m.ts) AS first_negative FROM moves m WHERE (SELECT SUM(x.amount) FROM moves x WHERE x.account = m.account AND x.ts <= m.ts) < 0 GROUP BY m.account;\n'],
  wrong: [
    'WITH b AS (\n  SELECT account, ts, SUM(amount) OVER (PARTITION BY account ORDER BY ts) AS bal\n  FROM moves\n)\nSELECT account, MIN(ts) AS first_negative FROM b WHERE bal <= 0 GROUP BY account;\n',
    'WITH b AS (\n  SELECT account, ts, SUM(amount) OVER (PARTITION BY account ORDER BY move_id) AS bal\n  FROM moves\n)\nSELECT account, MIN(ts) AS first_negative FROM b WHERE bal < 0 GROUP BY account;\n',
  ],
},
];
