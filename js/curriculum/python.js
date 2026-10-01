import { expect } from './checks.js';

/* The Python course, parts 3 to 12 (py-11 to py-60). Parts 1 and 2 are the
   first-steps lessons in basics.js; together they are one track.

   Plain Python only: numbers and text, loops, lists, dicts and sets,
   functions, errors, files and formats, classes, iterators and decorators,
   and regular expressions. Everything is in the café, every term is
   explained where it first appears, and the checks name what went wrong.

   Escaping: these are JavaScript template literals, so a Python backslash
   is written \\ here (\\n, \\d, \\1) to reach Python as one. */

export const PYTHON = [

/* ── Numbers and text ──────────────────────────────────── */
{
  id: 'py-11', mins: 3,
  title: 'Whole numbers and decimals',
  concept: [
    'Python has two kinds of number: whole numbers, called **int** (like `30`), and decimals, called **float** (like `4.5`). `type(x)` tells you which.',
    'Decimals are stored in binary, so some are a hair off: `0.1 + 0.2` gives `0.30000000000000004`. `round(x, 2)` tidies them for showing.',
    '`//` divides and drops the remainder; `%` gives just the remainder. `130 // 60` is 2 and `130 % 60` is 10: 130 minutes is 2 hours and 10 minutes.',
  ],
  starter: `print(type(30), type(4.5))
print(0.1 + 0.2)

minutes = 130
print(minutes // 60, "hours and", minutes % 60, "minutes")

shift = 487          # a barista's shift, in minutes`,
  task: 'Make `hours` and `mins`: the shift in hours and minutes, using `//` and `%`.',
  hint: '`hours = shift // 60` and `mins = shift % 60`.',
  solution: `shift = 487

hours = shift // 60
mins = shift % 60
print(hours, "hours and", mins, "minutes")`,
  check: `assert "hours" in globals() and "mins" in globals(), "Make hours and mins from shift."
assert isinstance(hours, int) and isinstance(mins, int), "Use // and %, which keep whole numbers. hours is %r." % (hours,)
assert (hours, mins) == (8, 7), "487 minutes is 8 hours and 7 minutes: shift // 60 and shift % 60."`,
},
{
  id: 'py-12', mins: 3,
  title: 'Turning text into numbers',
  concept: [
    'Numbers that arrive as text (from a form, a file or a website) can\'t be added up. `"12" + "3"` joins them into `"123"`, and `"12" + 3` is an error.',
    '`int("12")` turns text into a whole number, `float("4.50")` into a decimal, and `str(7)` turns a number back into text.',
    'If the text isn\'t a number at all, `int("ten")` stops with a ValueError. Part 8 shows how to deal with that.',
  ],
  starter: `prices = ["4.50", "3.00", "2.75"]
print(prices[0] + prices[1])        # joined, not added`,
  task: 'Make `total`: the three prices added up as real numbers.',
  hint: 'Start `total = 0`, then `for p in prices:` and, under it, `total = total + float(p)`.',
  solution: `prices = ["4.50", "3.00", "2.75"]

total = 0
for p in prices:
    total = total + float(p)
print(total)`,
  check: `assert "total" in globals(), "Make total: the three prices added up."
assert not isinstance(total, str), "total is still text. Turn each price into a number with float(...) before adding."
assert abs(float(total) - 10.25) < 1e-9, "The three prices add up to 10.25."`,
},
{
  id: 'py-13', mins: 4,
  title: 'Picking out characters',
  concept: [
    'A string is a row of characters, numbered from 0 like a list: `code[0]` is the first character and `code[-1]` the last.',
    'A **slice** takes a run of them: `code[4:8]` goes from position 4 up to, but not including, 8. Leave a number out to go from the start or to the end: `code[:3]`, `code[9:]`.',
    '`len(code)` counts the characters, and `code[::-1]` gives the whole thing backwards.',
  ],
  starter: `code = "LAG-2024-0153"       # city, year, order number
print(code[0], code[-1])
print(code[:3])`,
  task: 'Make `city`, `year` and `number`: the three parts of the code, as text, using slices. `year` should be `"2024"`.',
  hint: '`city = code[:3]`, `year = code[4:8]` and `number = code[9:]`. Count the positions: the dashes sit at 3 and 8.',
  solution: `code = "LAG-2024-0153"

city = code[:3]
year = code[4:8]
number = code[9:]
print(city, year, number)`,
  check: `for _n, _v in (("city", "LAG"), ("year", "2024"), ("number", "0153")):
    assert _n in globals(), "Make %s with a slice of code." % _n
    assert globals()[_n] == _v, "%s should be %r, but it is %r." % (_n, _v, globals()[_n])`,
},
{
  id: 'py-14', mins: 4,
  title: 'Formatting with f-strings',
  concept: [
    'Put an `f` before the quotes and you can drop values straight into text, inside `{ }`: `f"{name} owes {total}"`.',
    'After a colon, say how it should look: `{total:.2f}` is 2 decimal places, `{big:,}` adds commas between thousands, and `{name:<10}` pads it out to 10 characters.',
    'Formatting only changes how a number looks, never the number itself.',
  ],
  starter: `name = "Ada"
total = 12.5
takings = 1234567

print(f"{name} owes {total}")`,
  task: 'Make `line`, reading exactly `Ada owes £12.50`, and `big`, reading `Takings: 1,234,567`. Use f-strings for both.',
  hint: '`line = f"{name} owes £{total:.2f}"` and `big = f"Takings: {takings:,}"`.',
  solution: `name = "Ada"
total = 12.5
takings = 1234567

line = f"{name} owes £{total:.2f}"
big = f"Takings: {takings:,}"
print(line)
print(big)`,
  check: `assert "line" in globals() and line == "Ada owes £12.50", "line should read exactly: Ada owes £12.50. You have %r." % (globals().get("line"),)
assert "big" in globals() and big == "Takings: 1,234,567", "big should read exactly: Takings: 1,234,567. You have %r." % (globals().get("big"),)`,
},
{
  id: 'py-15', mins: 4,
  title: 'Splitting and joining',
  concept: [
    '`text.split(",")` cuts a string wherever there is a comma, and gives back a list of the pieces. With nothing in the brackets, it splits on spaces.',
    '`", ".join(items)` goes the other way: it glues a list of strings together, with `", "` between each.',
    'Together they turn a line of text into data and back again. That is most of what reading a simple file means.',
  ],
  starter: `line = "latte,3,4.50"
parts = line.split(",")
print(parts)`,
  task: 'From `parts`, make `drink`, `cups` (a whole number) and `price` (a decimal), then `cost`: cups times price. Finally make `menu` by joining `["latte", "tea", "mocha"]` with `" / "`.',
  hint: '`drink = parts[0]`, `cups = int(parts[1])`, `price = float(parts[2])`, `cost = cups * price`. Then `menu = " / ".join(["latte", "tea", "mocha"])`.',
  solution: `line = "latte,3,4.50"
parts = line.split(",")

drink = parts[0]
cups = int(parts[1])
price = float(parts[2])
cost = cups * price
print(drink, cost)

menu = " / ".join(["latte", "tea", "mocha"])
print(menu)`,
  check: `assert globals().get("drink") == "latte", "drink is the first part: parts[0]."
assert globals().get("cups") == 3 and isinstance(cups, int), "cups is the second part as a whole number: int(parts[1])."
assert globals().get("price") == 4.5 and isinstance(price, float), "price is the third part as a decimal: float(parts[2])."
assert abs(float(globals().get("cost", 0)) - 13.5) < 1e-9, "cost is cups times price: 13.5."
assert globals().get("menu") == "latte / tea / mocha", 'menu should read: latte / tea / mocha. Use " / ".join([...]).'`,
},

/* ── Loops in depth ────────────────────────────────────── */
{
  id: 'py-16', mins: 3,
  title: 'Counting with range',
  concept: [
    '`range(5)` gives 0, 1, 2, 3, 4: five numbers, starting at 0 and stopping before 5.',
    '`range(1, 6)` starts at 1 and stops before 6. `range(0, 20, 5)` counts in steps of 5: 0, 5, 10, 15.',
    '`for i in range(3):` repeats something exactly 3 times, whether or not you use `i`. `list(range(...))` shows the numbers.',
  ],
  starter: `for i in range(5):
    print(i)`,
  task: 'Make `total`: every whole number from 1 to 100 added up, with a loop over a `range`. Then `evens`: a list of the even numbers from 2 to 20, using a step.',
  hint: '`total = 0`, then `for n in range(1, 101):` / `total = total + n`. Then `evens = list(range(2, 21, 2))`.',
  solution: `total = 0
for n in range(1, 101):
    total = total + n
print(total)

evens = list(range(2, 21, 2))
print(evens)`,
  check: `assert globals().get("total") == 5050, "1 to 100 adds up to 5050. Is the range range(1, 101)? It stops before the second number."
assert list(globals().get("evens", [])) == list(range(2, 21, 2)), "evens should be 2, 4, 6 and so on up to 20: list(range(2, 21, 2))."`,
},
{
  id: 'py-17', mins: 4,
  title: 'Loop until: while',
  concept: [
    '`while condition:` repeats for as long as the condition is True. Use it when you don\'t know in advance how many times.',
    'Something inside has to change, or it never stops. (If that happens here, Python gets stopped after a while and says so.)',
    '`x += 1` is short for `x = x + 1`. The same works with `-=`, `*=` and `/=`.',
  ],
  starter: `savings = 0
day = 0
# put 7.50 away each day until there is at least 100
print(day, savings)`,
  task: 'Write a `while` loop that adds 7.50 to `savings` and 1 to `day` until `savings` reaches at least 100. How many days does it take?',
  hint: '`while savings < 100:`, then indented under it, `savings += 7.50` and `day += 1`.',
  solution: `savings = 0
day = 0
while savings < 100:
    savings += 7.50
    day += 1
print(day, savings)`,
  check: `assert globals().get("day") == 14, "It takes 14 days: 13 days is only 97.50. day is %r." % (globals().get("day"),)
assert globals().get("savings") == 105.0, "After 14 days, savings is 105.0."`,
},
{
  id: 'py-18', mins: 4,
  title: 'Stop early, or skip: break and continue',
  concept: [
    '`break` leaves a loop straight away: handy once you have found what you were looking for.',
    '`continue` skips the rest of this turn and goes on to the next item: handy for leaving things out.',
    'A `for` loop can have an `else:` that runs only if the loop was never broken. It is a neat way to say "not found".',
  ],
  starter: `orders = [12.0, 8.5, -1, 23.0, 4.0, 31.5]       # -1 marks a cancelled order

for o in orders:
    print(o)`,
  task: 'Make `first_big`: the first order over 20, found with a loop and `break`. Then make `total`: all the orders added up, skipping the cancelled one with `continue`.',
  hint: '`for o in orders:` / `if o > 20:` / `first_big = o` / `break`. For the total: `total = 0`, then in a loop, `if o == -1:` / `continue`, then `total += o`.',
  solution: `orders = [12.0, 8.5, -1, 23.0, 4.0, 31.5]

for o in orders:
    if o > 20:
        first_big = o
        break

total = 0
for o in orders:
    if o == -1:
        continue
    total += o
print(first_big, total)`,
  check: `assert globals().get("first_big") == 23.0, "first_big is the first order over 20: 23.0."
assert globals().get("total") == 79.0, "total should leave out the cancelled -1: 79.0. You have %r." % (globals().get("total"),)`,
},
{
  id: 'py-19', mins: 4,
  title: 'Loops inside loops',
  concept: [
    'A loop inside a loop runs the inner loop all the way through, once for every turn of the outer one.',
    'Two drinks in three sizes make 2 × 3 = 6 combinations: the outer loop picks a drink, and the inner loop goes through every size.',
    'The work multiplies: 100 by 100 is 10,000 turns. Worth remembering when the lists are long.',
  ],
  starter: `drinks = ["latte", "tea"]
sizes = ["small", "medium", "large"]`,
  task: 'Make `options`: a list of strings like `"small latte"`, one for every size of every drink, with the drinks in the outer loop.',
  hint: '`options = []`, `for d in drinks:`, then indented, `for s in sizes:`, then indented again, `options.append(f"{s} {d}")`.',
  solution: `drinks = ["latte", "tea"]
sizes = ["small", "medium", "large"]

options = []
for d in drinks:
    for s in sizes:
        options.append(f"{s} {d}")
print(options)`,
  check: `assert "options" in globals(), "Make options: one string per size of each drink."
_want = ["small latte", "medium latte", "large latte", "small tea", "medium tea", "large tea"]
assert list(options) == _want, "options should be %r. Drinks in the outer loop, sizes in the inner one." % (_want,)`,
},
{
  id: 'py-20', mins: 4,
  title: 'Looping helpers: enumerate and zip',
  concept: [
    '`enumerate(items)` gives each item with its position: `for i, name in enumerate(names):`. Add `start=1` to count from 1.',
    '`zip(a, b)` walks two lists side by side, pairing the first with the first, the second with the second, and so on.',
    '`reversed(items)` goes backwards and `sorted(items)` in order, both without changing the list itself.',
  ],
  starter: `names = ["Ada", "Kofi", "Zola"]
spent = [12.5, 30.0, 8.25]

for name, s in zip(names, spent):
    print(name, s)`,
  task: 'Make `lines`: a list like `"1. Ada: 12.50"`, one per customer, using `enumerate` with `start=1` together with `zip`, and 2 decimal places.',
  hint: '`for i, (name, s) in enumerate(zip(names, spent), start=1):` / `lines.append(f"{i}. {name}: {s:.2f}")`. The brackets round `(name, s)` unpack each pair.',
  solution: `names = ["Ada", "Kofi", "Zola"]
spent = [12.5, 30.0, 8.25]

lines = []
for i, (name, s) in enumerate(zip(names, spent), start=1):
    lines.append(f"{i}. {name}: {s:.2f}")
print(lines)`,
  check: `_want = ["1. Ada: 12.50", "2. Kofi: 30.00", "3. Zola: 8.25"]
assert list(globals().get("lines", [])) == _want, "lines should be %r." % (_want,)`,
},

/* ── Lists and tuples ──────────────────────────────────── */
{
  id: 'py-21', mins: 4,
  title: 'Changing a list',
  concept: [
    'Lists can change after they are made. `.append(x)` adds to the end, `.insert(0, x)` puts x at the front, and `items[1] = x` replaces an item.',
    '`.remove(x)` takes out the first x it finds. `.pop()` takes the last item off and gives it back; `.pop(0)` takes the first.',
    'These change the list itself and give back `None` (apart from pop), so `queue = queue.append(x)` loses the list.',
  ],
  starter: `queue = ["Ada", "Kofi", "Zola"]`,
  task: 'In order: Femi joins the end; Nia jumps in at the front; Kofi leaves; then the first person is served: take them off with `pop(0)` into `served`. `queue` should end as `["Ada", "Zola", "Femi"]`.',
  hint: '`queue.append("Femi")`, `queue.insert(0, "Nia")`, `queue.remove("Kofi")`, then `served = queue.pop(0)`.',
  solution: `queue = ["Ada", "Kofi", "Zola"]

queue.append("Femi")
queue.insert(0, "Nia")
queue.remove("Kofi")
served = queue.pop(0)
print(served, queue)`,
  check: `assert globals().get("served") == "Nia", "Nia jumped in at the front, so she is served first: served = queue.pop(0)."
assert queue == ["Ada", "Zola", "Femi"], "queue should end as ['Ada', 'Zola', 'Femi']. You have %r." % (queue,)`,
},
{
  id: 'py-22', mins: 5,
  title: 'A copy, or the same list twice?',
  concept: [
    '`b = a` doesn\'t copy a list. It gives the same list a second name. Change it through `b` and `a` changes too, because there is only one list.',
    'To get a separate list, copy it: `b = a.copy()`, `b = a[:]` or `b = list(a)`.',
    'This catches everyone once. It matters for dicts too, and when you hand a list to a function that changes it.',
  ],
  starter: `prices = [4.5, 3.0, 2.75]
sale = prices
for i in range(len(sale)):
    sale[i] = round(sale[i] * 0.8, 2)

print("sale:", sale)
print("prices:", prices)       # changed too!`,
  task: 'Fix it so `sale` gets 20% off, but `prices` stays as `[4.5, 3.0, 2.75]`.',
  hint: 'Make `sale` a copy: `sale = prices.copy()`.',
  solution: `prices = [4.5, 3.0, 2.75]
sale = prices.copy()
for i in range(len(sale)):
    sale[i] = round(sale[i] * 0.8, 2)

print("sale:", sale)
print("prices:", prices)`,
  check: `assert prices == [4.5, 3.0, 2.75], "prices changed. sale is the same list under another name: make sale a copy with prices.copy()."
assert sale == [3.6, 2.4, 2.2], "sale should be every price with 20% off: [3.6, 2.4, 2.2]."
assert sale is not prices, "sale and prices are still one list."`,
},
{
  id: 'py-23', mins: 4,
  title: 'Sorting, finding and counting',
  concept: [
    '`sorted(items)` gives a new sorted list and leaves the old one alone; `items.sort()` sorts the list itself. Add `reverse=True` for biggest first.',
    '`x in items` asks whether x is there, `items.index(x)` says where (the first time), and `items.count(x)` how many times.',
    '`min`, `max` and `sum` work on any list of numbers, and `key=` says what to sort by: `sorted(names, key=len)` sorts by length.',
  ],
  starter: `cups = [31, 48, 12, 55, 40, 61, 9, 48]`,
  task: 'Make `top3`: the three biggest values, biggest first. `busiest_day`: the position of the biggest value. `repeats`: how many times 48 appears.',
  hint: '`top3 = sorted(cups, reverse=True)[:3]`, `busiest_day = cups.index(max(cups))`, `repeats = cups.count(48)`.',
  solution: `cups = [31, 48, 12, 55, 40, 61, 9, 48]

top3 = sorted(cups, reverse=True)[:3]
busiest_day = cups.index(max(cups))
repeats = cups.count(48)
print(top3, busiest_day, repeats)`,
  check: `assert list(globals().get("top3", [])) == [61, 55, 48], "top3 is the three biggest, biggest first: [61, 55, 48]."
assert globals().get("busiest_day") == 5, "busiest_day is where the biggest value sits: position 5."
assert globals().get("repeats") == 2, "48 appears twice."
assert cups == [31, 48, 12, 55, 40, 61, 9, 48], "Leave cups as it was: sorted() gives a new list, .sort() changes the old one."`,
},
{
  id: 'py-24', mins: 4,
  title: 'Tuples and unpacking',
  concept: [
    'A **tuple** is like a list in round brackets, `("Ada", 12.5)`, except it can\'t be changed once made. It suits a fixed bundle, like a name with its total.',
    '**Unpacking** splits a tuple into names in one go: `name, total = pair`. It also swaps two values with no spare name: `a, b = b, a`.',
    'A function can give back several values as a tuple, `return low, high`, and you unpack them where you call it.',
  ],
  starter: `order = ("Ada", "latte", 2, 4.5)
print(order[0])

def cheapest_and_dearest(prices):
    return None

print(cheapest_and_dearest([4.5, 3.0, 6.25, 2.75]))`,
  task: 'Unpack `order` into `name`, `drink`, `cups` and `price`. Then make `cheapest_and_dearest` return the smallest and biggest price as a tuple, and unpack its answer for `[4.5, 3.0, 6.25, 2.75]` into `low, high`.',
  hint: '`name, drink, cups, price = order`. In the function, `return min(prices), max(prices)`. Then `low, high = cheapest_and_dearest([4.5, 3.0, 6.25, 2.75])`.',
  solution: `order = ("Ada", "latte", 2, 4.5)
name, drink, cups, price = order

def cheapest_and_dearest(prices):
    return min(prices), max(prices)

low, high = cheapest_and_dearest([4.5, 3.0, 6.25, 2.75])
print(name, drink, cups, price, low, high)`,
  check: `assert (globals().get("name"), globals().get("drink"), globals().get("cups"), globals().get("price")) == ("Ada", "latte", 2, 4.5), "Unpack order in one line: name, drink, cups, price = order."
` + expect('cheapest_and_dearest', '[(([4.5, 3.0, 6.25, 2.75],), (2.75, 6.25)), (([5.0],), (5.0, 5.0))]') + `
assert (globals().get("low"), globals().get("high")) == (2.75, 6.25), "Unpack the answer: low, high = cheapest_and_dearest([...])."`,
},
{
  id: 'py-25', mins: 4,
  title: 'List comprehensions',
  concept: [
    'A **list comprehension** builds a list in one line: `[p * 2 for p in prices]` is every price, doubled.',
    'Add a test to keep only some: `[p for p in prices if p > 3]` keeps the prices over 3.',
    'Read it left to right as "this, for each item, if that". It does what a loop with `.append` does, more briefly.',
  ],
  starter: `prices = [4.5, 3.0, 2.75, 6.0, 1.25]

doubled = [p * 2 for p in prices]
print(doubled)`,
  task: 'Make `with_vat` in one list comprehension: each price over 2, times 1.2, rounded to 2 places.',
  hint: '`with_vat = [round(p * 1.2, 2) for p in prices if p > 2]`',
  solution: `prices = [4.5, 3.0, 2.75, 6.0, 1.25]

with_vat = [round(p * 1.2, 2) for p in prices if p > 2]
print(with_vat)`,
  check: `assert "with_vat" in globals(), "Make with_vat with one list comprehension."
assert list(with_vat) == [round(p * 1.2, 2) for p in prices if p > 2], "with_vat should be each price over 2, times 1.2, rounded to 2: [5.4, 3.6, 3.3, 7.2]."`,
},

/* ── Dicts and sets ────────────────────────────────────── */
{
  id: 'py-26', mins: 4,
  title: 'Dicts in depth',
  concept: [
    'Loop over a dict three ways: `for key in d:` gives the keys, `d.values()` the values, and `for key, value in d.items():` both.',
    '`key in d` asks whether a key is there. `d.get(key, 0)` gives its value, or 0 if it isn\'t there, where `d[key]` would stop with a KeyError.',
    '`d[key] = value` adds or changes an entry, and `del d[key]` removes one.',
  ],
  starter: `stock = {"latte": 40, "tea": 25, "mocha": 0, "chai": 12}

for drink, left in stock.items():
    print(drink, left)`,
  task: 'Make `out_of_stock`: a list of the drinks with 0 left. Then `cold_brew`: how many cold brews are in stock, using `.get` (there are none). Then remove mocha from `stock`.',
  hint: '`out_of_stock = [d for d, left in stock.items() if left == 0]`, `cold_brew = stock.get("cold brew", 0)`, then `del stock["mocha"]`.',
  solution: `stock = {"latte": 40, "tea": 25, "mocha": 0, "chai": 12}

out_of_stock = [d for d, left in stock.items() if left == 0]
cold_brew = stock.get("cold brew", 0)
del stock["mocha"]
print(out_of_stock, cold_brew, stock)`,
  check: `assert list(globals().get("out_of_stock", [])) == ["mocha"], "out_of_stock is the drinks with 0 left: ['mocha']."
assert globals().get("cold_brew") == 0, 'cold_brew should be 0: stock.get("cold brew", 0).'
assert stock == {"latte": 40, "tea": 25, "chai": 12}, "Remove mocha from stock: del stock['mocha']."`,
},
{
  id: 'py-27', mins: 5,
  title: 'Records: a list of dicts',
  concept: [
    'Real data often comes as a list of **records**: one dict per order, with the same keys in each. JSON from websites looks exactly like this.',
    'Loop over the list, and read each record\'s fields by key: `order["total"]`.',
    'Collecting into a dict as you go, customer to total, is grouping: the same thing a pivot table or pandas\' groupby does.',
  ],
  starter: `orders = [
    {"customer": "Ada", "total": 12.5, "status": "delivered"},
    {"customer": "Kofi", "total": 30.0, "status": "cancelled"},
    {"customer": "Ada", "total": 8.0, "status": "delivered"},
    {"customer": "Zola", "total": 15.25, "status": "delivered"},
    {"customer": "Kofi", "total": 9.5, "status": "delivered"},
]`,
  task: 'Make `spend`: a dict of each customer and the total of their orders that weren\'t cancelled.',
  hint: '`spend = {}`, then `for o in orders:` / `if o["status"] != "cancelled":` / `spend[o["customer"]] = spend.get(o["customer"], 0) + o["total"]`.',
  solution: `orders = [
    {"customer": "Ada", "total": 12.5, "status": "delivered"},
    {"customer": "Kofi", "total": 30.0, "status": "cancelled"},
    {"customer": "Ada", "total": 8.0, "status": "delivered"},
    {"customer": "Zola", "total": 15.25, "status": "delivered"},
    {"customer": "Kofi", "total": 9.5, "status": "delivered"},
]

spend = {}
for o in orders:
    if o["status"] != "cancelled":
        spend[o["customer"]] = spend.get(o["customer"], 0) + o["total"]
print(spend)`,
  check: `assert "spend" in globals(), "Make spend: a dict of customer to total."
assert spend == {"Ada": 20.5, "Zola": 15.25, "Kofi": 9.5}, "spend should be %r, leaving out Kofi's cancelled order. You have %r." % ({"Ada": 20.5, "Zola": 15.25, "Kofi": 9.5}, spend)`,
},
{
  id: 'py-28', mins: 4,
  title: 'Sets: unique, both, either',
  concept: [
    'A **set** holds each value once, in no particular order: `set(["tea", "tea", "latte"])` is `{"tea", "latte"}`.',
    '`a & b` is what is in both, `a | b` what is in either, and `a - b` what is in a but not in b.',
    'Asking `x in a_set` is instant however big the set is, unlike a list.',
  ],
  starter: `latte_fans = {"Ada", "Kofi", "Zola", "Nia"}
tea_fans = {"Kofi", "Femi", "Nia", "Tunde"}`,
  task: 'Make `both` (customers who drink both), `either` (everyone who drinks either) and `latte_only` (latte fans who never have tea).',
  hint: '`both = latte_fans & tea_fans`, `either = latte_fans | tea_fans`, `latte_only = latte_fans - tea_fans`.',
  solution: `latte_fans = {"Ada", "Kofi", "Zola", "Nia"}
tea_fans = {"Kofi", "Femi", "Nia", "Tunde"}

both = latte_fans & tea_fans
either = latte_fans | tea_fans
latte_only = latte_fans - tea_fans
print(both, either, latte_only)`,
  check: `assert set(globals().get("both", ())) == {"Kofi", "Nia"}, "both: latte_fans & tea_fans."
assert set(globals().get("either", ())) == {"Ada", "Kofi", "Zola", "Nia", "Femi", "Tunde"}, "either: latte_fans | tea_fans."
assert set(globals().get("latte_only", ())) == {"Ada", "Zola"}, "latte_only: latte_fans - tea_fans."`,
},
{
  id: 'py-29', mins: 4,
  title: 'Dict comprehensions',
  concept: [
    'Comprehensions build dicts too: `{name: len(name) for name in names}`.',
    'Use `.items()` to work from an existing dict: `{drink: price * 0.9 for drink, price in menu.items()}`.',
    'A set comprehension uses curly brackets with single values: `{w.lower() for w in words}`.',
  ],
  starter: `menu = {"latte": 4.5, "tea": 3.0, "mocha": 5.0}`,
  task: 'Make `sale`: the menu with 10% off every price, rounded to 2 places, in one dict comprehension. Then `by_price`: the menu turned round, price to drink.',
  hint: '`sale = {d: round(p * 0.9, 2) for d, p in menu.items()}` and `by_price = {p: d for d, p in menu.items()}`.',
  solution: `menu = {"latte": 4.5, "tea": 3.0, "mocha": 5.0}

sale = {d: round(p * 0.9, 2) for d, p in menu.items()}
by_price = {p: d for d, p in menu.items()}
print(sale, by_price)`,
  check: `assert globals().get("sale") == {d: round(p * 0.9, 2) for d, p in menu.items()}, "sale should be each drink with 10% off, rounded to 2 places."
assert globals().get("by_price") == {4.5: "latte", 3.0: "tea", 5.0: "mocha"}, "by_price turns the menu round: {4.5: 'latte', 3.0: 'tea', 5.0: 'mocha'}."`,
},
{
  id: 'py-30', mins: 5,
  title: 'Nested data',
  concept: [
    'Data can nest: a dict whose values are dicts, like each city with its sales by drink. Reach in with two keys: `sales["Lagos"]["latte"]`.',
    'Loop over the outer dict, then the inner one, to visit every number.',
    'When a shape gets deep and repeats a lot, that is the moment a table (pandas) or a class (part 10) is worth it.',
  ],
  starter: `sales = {
    "Lagos": {"latte": 40, "tea": 12, "mocha": 7},
    "Accra": {"latte": 22, "tea": 30},
    "Nairobi": {"tea": 18, "mocha": 25, "latte": 9},
}
print(sales["Lagos"]["latte"])`,
  task: 'Make `per_city`: each city with its total cups. Then `drink_totals`: each drink with its total across every city, and `top_drink`: the drink that sold most overall.',
  hint: '`per_city = {city: sum(d.values()) for city, d in sales.items()}`. For drinks, two loops, adding into a dict with `.get(drink, 0)`. Then `top_drink = max(drink_totals, key=drink_totals.get)`.',
  solution: `sales = {
    "Lagos": {"latte": 40, "tea": 12, "mocha": 7},
    "Accra": {"latte": 22, "tea": 30},
    "Nairobi": {"tea": 18, "mocha": 25, "latte": 9},
}

per_city = {city: sum(d.values()) for city, d in sales.items()}

drink_totals = {}
for city, drinks in sales.items():
    for drink, cups in drinks.items():
        drink_totals[drink] = drink_totals.get(drink, 0) + cups

top_drink = max(drink_totals, key=drink_totals.get)
print(per_city, drink_totals, top_drink)`,
  check: `assert globals().get("per_city") == {"Lagos": 59, "Accra": 52, "Nairobi": 52}, "per_city is each city's cups added up."
assert globals().get("drink_totals") == {"latte": 71, "tea": 60, "mocha": 32}, "drink_totals is each drink across every city."
assert globals().get("top_drink") == "latte", "top_drink is the drink with the biggest total: latte."`,
},

/* ── Functions in depth ────────────────────────────────── */
{
  id: 'py-31', mins: 4,
  title: 'Writing your own functions',
  concept: [
    '`def name(parameters):` makes a function, and `return` hands its answer back. Nothing runs until the function is called.',
    'A function you write is used just like a built-in one, and it can call other functions, including ones you wrote.',
    'Small functions that each do one thing are easy to test and to reuse. Name them for what they give back.',
  ],
  starter: `def vat(price):
    return price               # should add 20%, rounded to 2 places

def total_with_vat(prices):
    return 0                   # each price with VAT, added up

print(vat(4.5))
print(total_with_vat([4.5, 3.0, 2.75]))`,
  task: 'Make `vat` return the price plus 20%, rounded to 2 places. Make `total_with_vat` use `vat` on every price and add them up.',
  hint: '`return round(price * 1.2, 2)`. Then in the other: `total = 0`, `for p in prices:` / `total += vat(p)`, and `return total`.',
  solution: `def vat(price):
    return round(price * 1.2, 2)

def total_with_vat(prices):
    total = 0
    for p in prices:
        total += vat(p)
    return total

print(vat(4.5))
print(total_with_vat([4.5, 3.0, 2.75]))`,
  check: `assert callable(globals().get("vat")) and callable(globals().get("total_with_vat")), "Keep both functions: vat and total_with_vat."
for _p, _w in ((4.5, 5.4), (3.0, 3.6), (2.75, 3.3), (0, 0)):
    assert abs(vat(_p) - _w) < 1e-9, "vat(%r) gave %r, but it should give %r." % (_p, vat(_p), _w)
assert abs(total_with_vat([4.5, 3.0, 2.75]) - 12.3) < 1e-9, "total_with_vat([4.5, 3.0, 2.75]) should come to 12.3."
assert total_with_vat([]) == 0, "total_with_vat([]) should be 0."`,
},
{
  id: 'py-32', mins: 4,
  title: 'Any number of values: *args',
  concept: [
    '`def average(*numbers):` takes any number of values, gathered up into a tuple called `numbers`. `print` works this way, which is why it takes as many things as you give it.',
    'Parameters after a lone `*` have to be named when called: `def price(amount, *, vat=0.2)` makes `price(10, vat=0)` the only way to change vat, so values can\'t land in the wrong place.',
    'Good functions handle the edges. The average of no numbers isn\'t 0: it doesn\'t exist. Returning `None` says so honestly.',
  ],
  starter: `def average(numbers):
    return sum(numbers) / len(numbers)

print(average([4, 8, 6]))`,
  task: 'Change `average` so it takes the numbers one by one, `average(4, 8, 6)`, and returns `None` when it is given none at all.',
  hint: '`def average(*numbers):`, then `if not numbers:` / `return None`, then the same sum over len.',
  solution: `def average(*numbers):
    if not numbers:
        return None
    return sum(numbers) / len(numbers)

print(average(4, 8, 6))
print(average())`,
  check: `import inspect as _inspect
assert callable(globals().get("average")), "Keep the function called average."
assert any(_p.kind == _p.VAR_POSITIONAL for _p in _inspect.signature(average).parameters.values()), "Take the numbers one by one: def average(*numbers):"
` + expect('average', '[((4, 8, 6), 6.0), ((5,), 5.0), ((), None), ((1, 2), 1.5)]'),
},
{
  id: 'py-33', mins: 4,
  title: 'Inside and outside: scope',
  concept: [
    'Names made inside a function belong to it, and vanish when it ends. That keeps functions from tripping over each other.',
    'A function can read a name from outside, but assigning to that name inside makes a new, local one instead, and Python complains if you used it first: an UnboundLocalError.',
    'The clean fix is nearly always the same: pass the value in as a parameter, and return the new value out.',
  ],
  starter: `tab = 0

def add_to_tab(amount):
    tab = tab + amount        # tab is local here, and has no value yet
    return tab

add_to_tab(4.5)`,
  task: 'Rewrite `add_to_tab` to take the tab as a parameter, `add_to_tab(tab, amount)`, and return the new tab. Then run `tab = add_to_tab(tab, 4.5)` and `tab = add_to_tab(tab, 3.0)`.',
  hint: '`def add_to_tab(tab, amount):` / `return tab + amount`. Calling it, store the answer back into `tab` each time.',
  solution: `tab = 0

def add_to_tab(tab, amount):
    return tab + amount

tab = add_to_tab(tab, 4.5)
tab = add_to_tab(tab, 3.0)
print(tab)`,
  check: expect('add_to_tab', '[((0, 4.5), 4.5), ((10, 2.5), 12.5)]') + `
assert tab == 7.5, "After adding 4.5 and 3.0, tab should be 7.5: tab = add_to_tab(tab, ...) each time."`,
},
{
  id: 'py-34', mins: 4,
  title: 'Functions are values',
  concept: [
    'A function is a value like any other: you can store it under a name, put it in a list, or hand it to another function.',
    '`lambda p: p * 0.9` makes a small function on the spot, with no name. It suits one-line rules handed to other functions.',
    '`sorted(items, key=...)`, `map(fn, items)` and `filter(fn, items)` all take a function. `list(...)` round them gives the results.',
  ],
  starter: `def apply_rule(prices, rule):
    return []                  # rule applied to every price

prices = [4.5, 3.0, 6.0]
print(apply_rule(prices, round))`,
  task: 'Finish `apply_rule` so it returns `rule(p)` for every price. Then make `discounted` with `apply_rule` and a lambda taking 10% off, and `cheap`: the prices under 4, using `filter`.',
  hint: '`return [rule(p) for p in prices]`. Then `discounted = apply_rule(prices, lambda p: p * 0.9)` and `cheap = list(filter(lambda p: p < 4, prices))`.',
  solution: `def apply_rule(prices, rule):
    return [rule(p) for p in prices]

prices = [4.5, 3.0, 6.0]
discounted = apply_rule(prices, lambda p: p * 0.9)
cheap = list(filter(lambda p: p < 4, prices))
print(discounted, cheap)`,
  check: `assert callable(globals().get("apply_rule")), "Keep the function called apply_rule."
assert apply_rule([4.5, 3.0], lambda p: p * 2) == [9.0, 6.0], "apply_rule(prices, rule) should give rule(p) for every p, in order."
assert apply_rule([], abs) == [], "apply_rule on an empty list gives an empty list."
assert "discounted" in globals() and all(abs(a - b) < 1e-9 for a, b in zip(discounted, [4.05, 2.7, 5.4])) and len(discounted) == 3, "discounted is every price times 0.9."
assert list(globals().get("cheap", [])) == [3.0], "cheap is the prices under 4: list(filter(lambda p: p < 4, prices))."`,
},
{
  id: 'py-35', mins: 4,
  title: 'Docstrings and type hints',
  concept: [
    'A **docstring** is a string on the first line inside a function, saying what it does. `help(fn)` shows it, and so do code editors when you hover over the name.',
    '**Type hints** note what goes in and what comes out: `def vat(price: float) -> float:`. Python doesn\'t enforce them, but editors and checkers use them to catch mistakes.',
    'Both are for the next person to read the code, and that is usually you, three months from now.',
  ],
  starter: `def per_cup(revenue, cups):
    return round(revenue / cups, 2)

help(per_cup)`,
  task: 'Add a docstring saying what `per_cup` gives back, and type hints: `revenue` is a float, `cups` an int, and it returns a float.',
  hint: '`def per_cup(revenue: float, cups: int) -> float:`, then on the next line, indented, `"""Revenue per cup, to 2 decimal places."""`.',
  solution: `def per_cup(revenue: float, cups: int) -> float:
    """Revenue per cup, to 2 decimal places."""
    return round(revenue / cups, 2)

help(per_cup)`,
  check: `assert callable(globals().get("per_cup")), "Keep the function called per_cup."
assert per_cup.__doc__ and per_cup.__doc__.strip(), "Add a docstring: a string on the first line inside the function."
_a = per_cup.__annotations__
assert _a.get("revenue") is float and _a.get("cups") is int, "Hint the parameters: revenue: float, cups: int."
assert _a.get("return") is float, "Hint what it returns: -> float, before the colon."
assert per_cup(10.0, 4) == 2.5, "Keep what it does the same: per_cup(10.0, 4) is 2.5."`,
},

/* ── When things go wrong ──────────────────────────────── */
{
  id: 'py-36', mins: 5,
  title: 'Reading an error',
  concept: [
    'An error message names the **kind** of error and the line it happened on. Read the last line first: it says what went wrong.',
    'The usual ones: **NameError** (a name Python doesn\'t know, often a typo), **TypeError** (an action that doesn\'t suit the type, like text + a number), **IndexError** (a position past the end of a list), **KeyError** (a key that isn\'t in a dict) and **ValueError** (the right type with a wrong value, like `int("ten")`).',
    'Python stops at the first error, so fix one, run again, and repeat. The Tip under each error here says what to try.',
  ],
  starter: `cups = [31, 48, 12]
prices = [4.5, 3.0, 2.75]

total = 0
for i in range(len(cups) + 1):
    total = total + cups[i] * prices[i]

report = "Takings: " + round(totl, 2)
print(report)`,
  task: 'Run it, fix the error it stops on, and run it again: there are three. In the end `report` should read `Takings: 316.5`.',
  hint: 'The range goes one past the end: `range(len(cups))`. `totl` is a typo for `total`. Text + a number needs the number turned into text: `str(round(total, 2))`.',
  solution: `cups = [31, 48, 12]
prices = [4.5, 3.0, 2.75]

total = 0
for i in range(len(cups)):
    total = total + cups[i] * prices[i]

report = "Takings: " + str(round(total, 2))
print(report)`,
  check: `assert globals().get("report") == "Takings: 316.5", "report should read: Takings: 316.5. You have %r." % (globals().get("report"),)`,
},
{
  id: 'py-37', mins: 4,
  title: 'try and except',
  concept: [
    '`try:` runs some code. If it hits an error, `except ValueError:` catches it and runs a backup plan instead of stopping.',
    'Name the error you expect. A bare `except:` catches everything, including mistakes you would want to see.',
    'Use it where bad input is normal, like numbers typed by people, and let real bugs still stop the program.',
  ],
  starter: `def safe_float(text):
    return float(text)

print(safe_float("4.50"))
print(safe_float("n/a"))         # stops with a ValueError`,
  task: 'Make `safe_float` return the number, or `None` when the text isn\'t a number.',
  hint: '`try:` / `return float(text)`, then `except ValueError:` / `return None`.',
  solution: `def safe_float(text):
    try:
        return float(text)
    except ValueError:
        return None

print(safe_float("4.50"))
print(safe_float("n/a"))`,
  check: expect('safe_float', '[(("4.50",), 4.5), (("n/a",), None), ((" 7 ",), 7.0), (("",), None), (("1e3",), 1000.0)]'),
},
{
  id: 'py-38', mins: 4,
  title: 'Raising your own errors',
  concept: [
    '`raise ValueError("price can\'t be negative")` stops with your own error and message. It is how a function refuses input that makes no sense.',
    'Whoever calls it can catch it: `except ValueError as e:` puts the error in `e`, and `str(e)` is your message.',
    '`finally:` runs whether or not there was an error, which suits tidying up.',
  ],
  starter: `def set_price(price):
    return round(price, 2)

print(set_price(4.567))
print(set_price(-2))              # should be refused`,
  task: 'Make `set_price` raise a `ValueError` with a message for a negative price, and return the price rounded to 2 places otherwise. Then catch the error from `set_price(-2)` and make `message` its text.',
  hint: 'In the function: `if price < 0:` / `raise ValueError("price can\'t be negative")`. Then `try:` / `set_price(-2)`, `except ValueError as e:` / `message = str(e)`.',
  solution: `def set_price(price):
    if price < 0:
        raise ValueError("price can't be negative")
    return round(price, 2)

print(set_price(4.567))
try:
    set_price(-2)
except ValueError as e:
    message = str(e)
print(message)`,
  check: `assert callable(globals().get("set_price")), "Keep the function called set_price."
assert set_price(4.567) == 4.57 and set_price(0) == 0, "A price that isn't negative comes back rounded to 2 places."
try:
    set_price(-1)
except ValueError as _e:
    assert str(_e).strip(), "Give the ValueError a message saying why."
else:
    raise AssertionError("set_price(-1) should raise a ValueError.")
assert isinstance(globals().get("message"), str) and message.strip(), "Catch the error from set_price(-2) with except ValueError as e, and set message = str(e)."`,
},
{
  id: 'py-39', mins: 5,
  title: 'Keeping the good rows',
  concept: [
    'Real data has bad rows. One bad line shouldn\'t stop a whole file: catch the error for that line, keep a note of it, and carry on.',
    'A `try` can have several `except`s, one for each kind of problem. Here a missing field is an IndexError, and a field that isn\'t a number is a ValueError.',
    'Keep the bad rows where you can see them. Quietly dropping them hides problems that someone needs to fix.',
  ],
  starter: `lines = ["latte,3,4.50", "tea,x,2.75", "mocha,2", "chai,1,3.25", ""]

def parse(lines):
    good, bad = [], []
    for line in lines:
        parts = line.split(",")
        good.append((parts[0], int(parts[1]), float(parts[2])))
    return good, bad

print(parse(lines))`,
  task: 'Wrap the work for each line in `try`, catching `ValueError` and `IndexError`: good lines go in `good` as before, bad ones in `bad` as they were. Then set `good, bad = parse(lines)`.',
  hint: 'Indent the two lines into `try:`, then `except (ValueError, IndexError):` / `bad.append(line)`. One `except` can name both errors in brackets.',
  solution: `lines = ["latte,3,4.50", "tea,x,2.75", "mocha,2", "chai,1,3.25", ""]

def parse(lines):
    good, bad = [], []
    for line in lines:
        try:
            parts = line.split(",")
            good.append((parts[0], int(parts[1]), float(parts[2])))
        except (ValueError, IndexError):
            bad.append(line)
    return good, bad

good, bad = parse(lines)
print(good)
print("bad:", bad)`,
  check: `assert callable(globals().get("parse")), "Keep the function called parse."
_g, _b = parse(["latte,3,4.50", "tea,x,2.75", "mocha,2", "chai,1,3.25", ""])
assert _g == [("latte", 3, 4.5), ("chai", 1, 3.25)], "The good rows should be latte and chai, as (name, cups, price). You have %r." % (_g,)
assert _b == ["tea,x,2.75", "mocha,2", ""], "The bad rows, as they were: %r. You have %r." % (["tea,x,2.75", "mocha,2", ""], _b)
assert globals().get("good") == _g and globals().get("bad") == _b, "Set good, bad = parse(lines)."`,
},
{
  id: 'py-40', mins: 4,
  title: 'Files: write, then read',
  concept: [
    '`open("today.txt", "w")` opens a file for writing, making it if needed and emptying it if not. `"a"` adds to the end, and `"r"`, the default, reads.',
    'Use it with `with`: `with open(...) as f:` closes the file for you when the block ends, even if something goes wrong inside.',
    '`f.write(text)` writes (add `"\\n"` for a new line); `f.read()` reads it all. Files here live in the browser\'s memory, and vanish when you close the app.',
  ],
  starter: `orders = ["latte", "tea", "mocha"]

with open("today.txt", "w") as f:
    for o in orders:
        f.write(o + "\\n")`,
  task: 'Add `"chai"` to the end of the file, using mode `"a"`. Then read the file back into `lines`: a list of the four names, without their newlines.',
  hint: '`with open("today.txt", "a") as f:` / `f.write("chai\\n")`. Then `with open("today.txt") as f:` / `lines = f.read().splitlines()`.',
  solution: `orders = ["latte", "tea", "mocha"]

with open("today.txt", "w") as f:
    for o in orders:
        f.write(o + "\\n")

with open("today.txt", "a") as f:
    f.write("chai\\n")

with open("today.txt") as f:
    lines = f.read().splitlines()
print(lines)`,
  check: `with open("today.txt") as _f:
    _text = _f.read()
assert _text == "latte\\ntea\\nmocha\\nchai\\n", "The file should hold the four names, one per line, chai last. It holds %r." % (_text,)
assert list(globals().get("lines", [])) == ["latte", "tea", "mocha", "chai"], "lines is the file read back, without newlines: f.read().splitlines()."`,
},

/* ── Files, formats and the standard library ───────────── */
{
  id: 'py-41', mins: 5,
  title: 'CSV files with the csv module',
  concept: [
    'A CSV file is a table in plain text. The `csv` module reads and writes it properly, including values with a comma inside, in quotes, which `split(",")` gets wrong.',
    '`csv.writer(f).writerows(rows)` writes a list of rows. `csv.DictReader(f)` reads each row back as a dict, keyed by the header line.',
    'Everything comes back as text, so turn numbers into numbers yourself. pandas\' `read_csv` does all this and more.',
  ],
  starter: `import csv

rows = [["customer", "drink", "total"],
        ["Ada", "latte", "12.50"],
        ["Kofi", "flat white, oat", "4.20"],
        ["Zola", "tea", "3.00"]]

with open("orders.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)

with open("orders.csv") as f:
    print(f.read())`,
  task: 'Read the file back with `csv.DictReader`, and make `total`: the `total` column added up as numbers, and `drinks`: the list of drinks. Notice the one with a comma inside.',
  hint: '`with open("orders.csv") as f:` / `records = list(csv.DictReader(f))`. Then `total = sum(float(r["total"]) for r in records)` and `drinks = [r["drink"] for r in records]`.',
  solution: `import csv

rows = [["customer", "drink", "total"],
        ["Ada", "latte", "12.50"],
        ["Kofi", "flat white, oat", "4.20"],
        ["Zola", "tea", "3.00"]]

with open("orders.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)

with open("orders.csv") as f:
    records = list(csv.DictReader(f))

total = sum(float(r["total"]) for r in records)
drinks = [r["drink"] for r in records]
print(total, drinks)`,
  check: `assert "total" in globals() and abs(float(total) - 19.7) < 1e-9, "total is the total column added up as numbers: 19.7."
assert list(globals().get("drinks", [])) == ["latte", "flat white, oat", "tea"], "drinks should be ['latte', 'flat white, oat', 'tea']: read with csv.DictReader, and the comma stays inside."`,
},
{
  id: 'py-42', mins: 4,
  title: 'JSON',
  concept: [
    '**JSON** is how most websites and apps pass data around: text that looks like Python dicts and lists, always with double quotes.',
    '`json.loads(text)` turns JSON text into dicts and lists; `json.dumps(data, indent=2)` turns them back into neat text.',
    'JSON is often nested, so you reach in a step at a time: `order["items"][0]["price"]`.',
  ],
  starter: `import json

text = '{"id": 5012, "customer": {"name": "Ada", "city": "Lagos"}, "items": [{"name": "latte", "qty": 2, "price": 4.5}, {"name": "croissant", "qty": 1, "price": 3.25}]}'
order = json.loads(text)
print(order["customer"]["name"])`,
  task: 'Make `total`: qty times price for every item, added up. Then `summary`: `json.dumps` of a dict holding the order\'s `id` and that `total`.',
  hint: '`total = sum(i["qty"] * i["price"] for i in order["items"])`, then `summary = json.dumps({"id": order["id"], "total": total})`.',
  solution: `import json

text = '{"id": 5012, "customer": {"name": "Ada", "city": "Lagos"}, "items": [{"name": "latte", "qty": 2, "price": 4.5}, {"name": "croissant", "qty": 1, "price": 3.25}]}'
order = json.loads(text)

total = sum(i["qty"] * i["price"] for i in order["items"])
summary = json.dumps({"id": order["id"], "total": total})
print(summary)`,
  check: `import json as _json
assert "total" in globals() and abs(float(total) - 12.25) < 1e-9, "total is 2 lattes at 4.5 and a croissant at 3.25: 12.25."
assert isinstance(globals().get("summary"), str), "summary should be text: json.dumps(...)."
assert _json.loads(summary) == {"id": 5012, "total": 12.25}, "summary should be the JSON of {'id': 5012, 'total': 12.25}."`,
},
{
  id: 'py-43', mins: 5,
  title: 'Dates and times',
  concept: [
    '`date(2024, 3, 15)` is a date. Take one from another and you get a **timedelta**, whose `.days` is the gap. Add `timedelta(days=30)` to move a date on.',
    '`d.strftime("%A %d %B")` writes a date as text: `%A` is the weekday, `%d` the day, `%B` the month\'s name and `%Y` the year.',
    '`datetime.strptime("05/02/2024", "%d/%m/%Y")` reads text into a date and time, with the format saying which part is which.',
  ],
  starter: `from datetime import date, datetime, timedelta

joined = date(2024, 1, 15)
first_order = date(2024, 3, 2)
print(first_order - joined)`,
  task: 'Make `gap`: the days between `joined` and `first_order`, as a number. `renewal`: the date 30 days after `first_order`. `day_name`: the weekday of `first_order`, like "Saturday". And `parsed`: the date in the text `"05/02/2024"`, read day first.',
  hint: '`gap = (first_order - joined).days`, `renewal = first_order + timedelta(days=30)`, `day_name = first_order.strftime("%A")`, `parsed = datetime.strptime("05/02/2024", "%d/%m/%Y")`.',
  solution: `from datetime import date, datetime, timedelta

joined = date(2024, 1, 15)
first_order = date(2024, 3, 2)

gap = (first_order - joined).days
renewal = first_order + timedelta(days=30)
day_name = first_order.strftime("%A")
parsed = datetime.strptime("05/02/2024", "%d/%m/%Y")
print(gap, renewal, day_name, parsed.date())`,
  check: `from datetime import date as _date, datetime as _dt
assert globals().get("gap") == 47, "gap is (first_order - joined).days: 47."
assert globals().get("renewal") == _date(2024, 4, 1), "renewal is first_order + timedelta(days=30): 1 April 2024."
assert globals().get("day_name") == "Saturday", "2 March 2024 was a Saturday: first_order.strftime('%A')."
_p = globals().get("parsed")
_p = _p.date() if isinstance(_p, _dt) else _p
assert _p == _date(2024, 2, 5), "05/02/2024 read day first is 5 February: '%d/%m/%Y'."`,
},
{
  id: 'py-44', mins: 4,
  title: 'Modules and the standard library',
  concept: [
    '`import math` brings in a module, and you use what\'s inside with a dot: `math.ceil(2.1)` rounds up to 3. `from math import ceil` brings in just `ceil`, to use on its own.',
    'Python comes with a big **standard library**: `math`, `statistics`, `random`, `datetime`, `json`, `csv`, `re` and many more, all ready to import.',
    '`random` gives different results every run, unless you fix its **seed**: `random.Random(7)` makes the same "random" choices every time, so results can be checked.',
  ],
  starter: `import math
import statistics
import random

cups = [31, 48, 12, 55, 40, 61, 9]
print(math.ceil(7 / 3))`,
  task: 'Make `boxes`: how many boxes of 12 cups you need for 100 cups, rounding up with `math.ceil`. `middle`: the median of `cups`, from `statistics`. `pick`: a drink chosen from `["latte", "tea", "mocha"]` by `random.Random(7).choice`.',
  hint: '`boxes = math.ceil(100 / 12)`, `middle = statistics.median(cups)`, `pick = random.Random(7).choice(["latte", "tea", "mocha"])`.',
  solution: `import math
import statistics
import random

cups = [31, 48, 12, 55, 40, 61, 9]

boxes = math.ceil(100 / 12)
middle = statistics.median(cups)
pick = random.Random(7).choice(["latte", "tea", "mocha"])
print(boxes, middle, pick)`,
  check: `import random as _random
assert globals().get("boxes") == 9, "100 cups in boxes of 12 needs 9 boxes: math.ceil(100 / 12)."
assert globals().get("middle") == 40, "The median of cups is 40: statistics.median(cups)."
assert globals().get("pick") == _random.Random(7).choice(["latte", "tea", "mocha"]), "pick is random.Random(7).choice(['latte', 'tea', 'mocha']), so it comes out the same every time."`,
},
{
  id: 'py-45', mins: 5,
  title: 'Putting it together',
  concept: [
    'A small program is a few small steps in a row: read the data, tidy it, work out the numbers, present them.',
    'Give each step its own function, and the program reads like a list of what it does.',
    'A data project has the same shape. pandas, SQL and the rest of this app make each step shorter.',
  ],
  starter: `raw = """city,drink,cups,price
Lagos,latte,40,4.5
Accra,tea,25,2.75
Lagos,mocha,12,5.0
Nairobi,latte,30,4.25
Accra,latte,18,4.5"""

def read_rows(text):
    return []          # a dict per line after the header: cups as int, price as float

def takings_by_city(rows):
    return {}          # city -> cups times price, added up

def report(totals):
    return ""          # one line per city, biggest first, like "Lagos: 240.00"

print(report(takings_by_city(read_rows(raw))))`,
  task: 'Fill in the three functions. The report has one line per city, biggest takings first, like `Lagos: 240.00`, joined with newlines.',
  hint: 'read_rows: `lines = text.splitlines()`, then for each line after the first, split it and build a dict. takings_by_city: add into a dict with `.get`. report: `sorted(totals.items(), key=lambda kv: kv[1], reverse=True)`, then `"\\n".join(f"{c}: {t:.2f}" for c, t in ...)`.',
  solution: `raw = """city,drink,cups,price
Lagos,latte,40,4.5
Accra,tea,25,2.75
Lagos,mocha,12,5.0
Nairobi,latte,30,4.25
Accra,latte,18,4.5"""

def read_rows(text):
    rows = []
    for line in text.splitlines()[1:]:
        city, drink, cups, price = line.split(",")
        rows.append({"city": city, "drink": drink, "cups": int(cups), "price": float(price)})
    return rows

def takings_by_city(rows):
    totals = {}
    for r in rows:
        totals[r["city"]] = totals.get(r["city"], 0) + r["cups"] * r["price"]
    return totals

def report(totals):
    ranked = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)
    return "\\n".join(f"{c}: {t:.2f}" for c, t in ranked)

print(report(takings_by_city(read_rows(raw))))`,
  check: `for _f in ("read_rows", "takings_by_city", "report"):
    assert callable(globals().get(_f)), "Keep the function called %s." % _f
_rows = read_rows(raw)
assert len(_rows) == 5 and _rows[0] == {"city": "Lagos", "drink": "latte", "cups": 40, "price": 4.5}, "read_rows should give a dict for each of the 5 lines after the header, with cups as int and price as float, starting {'city': 'Lagos', 'drink': 'latte', 'cups': 40, 'price': 4.5}. It gave %r." % (_rows[:1],)
_t = takings_by_city(_rows)
assert _t == {"Lagos": 240.0, "Accra": 149.75, "Nairobi": 127.5}, "takings_by_city should give %r. You have %r." % ({"Lagos": 240.0, "Accra": 149.75, "Nairobi": 127.5}, _t)
assert report(_t) == "Lagos: 240.00\\nAccra: 149.75\\nNairobi: 127.50", "The report should be three lines, biggest first, 2 decimal places. You have %r." % (report(_t),)`,
},

/* ── Classes and objects ───────────────────────────────── */
{
  id: 'py-46', mins: 4,
  title: 'A class is a blueprint',
  concept: [
    'A **class** describes a kind of thing; an **object** is one of them. `class Order:` describes orders, and `Order("Ada")` makes one.',
    '`__init__` runs whenever an object is made, and sets up its **attributes**: `self.customer = customer`. `self` is the object being built.',
    'Read an attribute with a dot: `order.customer`. Each object keeps its own.',
  ],
  starter: `class Order:
    def __init__(self, customer):
        self.customer = customer

first = Order("Ada")
print(first.customer)`,
  task: 'Give `Order` two more attributes: `city`, passed in when it is made, and `items`, which starts as an empty list. Then make `first = Order("Ada", "Lagos")` and `second = Order("Kofi", "Accra")`.',
  hint: '`def __init__(self, customer, city):`, then `self.city = city` and `self.items = []`.',
  solution: `class Order:
    def __init__(self, customer, city):
        self.customer = customer
        self.city = city
        self.items = []

first = Order("Ada", "Lagos")
second = Order("Kofi", "Accra")
print(first.customer, first.city, second.customer, second.city, second.items)`,
  check: `assert isinstance(globals().get("second"), Order), "Make second = Order('Kofi', 'Accra')."
assert (second.customer, second.city, second.items) == ("Kofi", "Accra", []), "second should have customer 'Kofi', city 'Accra' and an empty items list."
_a, _b = Order("A", "x"), Order("B", "y")
_a.items.append("tea")
assert _b.items == [], "Each order needs its own items list: set self.items = [] inside __init__."`,
},
{
  id: 'py-47', mins: 4,
  title: 'Methods',
  concept: [
    'A **method** is a function that belongs to a class, written inside it. Its first parameter is always `self`: the object it was called on.',
    '`order.add("latte", 4.5)` calls the `add` method, with `order` as `self`.',
    'Methods keep the data and what you can do with it together: an order knows how to total itself.',
  ],
  starter: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        pass               # put (name, price) on this order's items

    def total(self):
        return 0           # all the prices, added up

o = Order("Ada")
o.add("latte", 4.5)
o.add("croissant", 3.25)
print(o.total())`,
  task: 'Finish the two methods: `add` puts `(name, price)` on the order\'s `items`, and `total` adds up the prices.',
  hint: 'In add: `self.items.append((name, price))`. In total: `return sum(price for name, price in self.items)`.',
  solution: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for name, price in self.items)

o = Order("Ada")
o.add("latte", 4.5)
o.add("croissant", 3.25)
print(o.total())`,
  check: `_o = Order("Test")
assert _o.total() == 0, "An order with nothing on it totals 0."
_o.add("tea", 3.0)
_o.add("cake", 2.5)
assert _o.items == [("tea", 3.0), ("cake", 2.5)], "add should put (name, price) on self.items. items is %r." % (_o.items,)
assert _o.total() == 5.5, "total should add up the prices: 5.5 here, not %r." % (_o.total(),)`,
},
{
  id: 'py-48', mins: 4,
  title: 'Printing an object: __repr__',
  concept: [
    'Printing an object you made shows something like `<__main__.Order object at 0x10a2c>`. Not much use.',
    'Write a `__repr__` method that returns a string, and Python uses it whenever the object is shown or printed.',
    'Methods with two underscores each side, like `__init__` and `__repr__`, are Python\'s hooks: write one, and the built-in behaviour uses yours.',
  ],
  starter: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for name, price in self.items)

o = Order("Ada")
o.add("latte", 4.5)
o.add("croissant", 3.25)
print(o)`,
  task: 'Add a `__repr__` so `print(o)` shows `Order(Ada, 2 items, £7.75)`.',
  hint: '`def __repr__(self):` / `return f"Order({self.customer}, {len(self.items)} items, £{self.total():.2f})"`.',
  solution: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for name, price in self.items)

    def __repr__(self):
        return f"Order({self.customer}, {len(self.items)} items, £{self.total():.2f})"

o = Order("Ada")
o.add("latte", 4.5)
o.add("croissant", 3.25)
print(o)`,
  check: `_o = Order("Kofi")
assert repr(_o) == "Order(Kofi, 0 items, £0.00)", "An empty order should show as Order(Kofi, 0 items, £0.00). It shows %r." % (repr(_o),)
_o.add("tea", 3.0)
_o.add("cake", 2.5)
assert repr(_o) == "Order(Kofi, 2 items, £5.50)", "It should show Order(Kofi, 2 items, £5.50). It shows %r." % (repr(_o),)`,
},
{
  id: 'py-49', mins: 5,
  title: 'Inheritance',
  concept: [
    'A class can build on another: `class Delivery(Order):` gets everything an Order has, then adds or changes what it needs. That is **inheritance**.',
    '`super().__init__(customer)` runs the parent\'s set-up first; then you add attributes of your own.',
    'A method with the same name replaces the parent\'s, and can still call the parent\'s version with `super().total()`.',
  ],
  starter: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for name, price in self.items)

class Delivery(Order):
    def __init__(self, customer, fee):
        super().__init__(customer)
        # remember the fee

    # a total that includes the fee

d = Delivery("Ada", 2.5)
d.add("latte", 4.5)
print(d.total())`,
  task: 'Make `Delivery` keep its `fee`, and give it a `total` that is an order\'s total plus the fee, using `super().total()`.',
  hint: 'In `__init__`, `self.fee = fee`. Then `def total(self):` / `return super().total() + self.fee`.',
  solution: `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for name, price in self.items)

class Delivery(Order):
    def __init__(self, customer, fee):
        super().__init__(customer)
        self.fee = fee

    def total(self):
        return super().total() + self.fee

d = Delivery("Ada", 2.5)
d.add("latte", 4.5)
print(d.total())`,
  check: `_d = Delivery("Test", 2.5)
assert isinstance(_d, Order), "Delivery should build on Order: class Delivery(Order)."
assert getattr(_d, "fee", None) == 2.5, "Keep the fee: self.fee = fee."
_d.add("latte", 4.5)
_d.add("cake", 3.0)
assert _d.total() == 10.0, "A delivery's total is its items plus the fee: 10.0 here, not %r." % (_d.total(),)
_o = Order("Plain")
_o.add("tea", 3.0)
assert _o.total() == 3.0, "A plain Order's total shouldn't change."`,
},
{
  id: 'py-50', mins: 4,
  title: 'Dataclasses',
  concept: [
    'Many classes just hold data. Put `@dataclass` above one, list its fields with their types, and Python writes `__init__`, `__repr__` and `==` for you.',
    '`qty: int = 1` gives a field a default. Fields with defaults go after the ones without.',
    'Two dataclass objects with the same fields are equal, which two plain objects aren\'t. Methods work as usual.',
  ],
  starter: `from dataclasses import dataclass

@dataclass
class Item:
    name: str

tea = Item("tea")
print(tea)`,
  task: 'Give `Item` a `price` (a float) and a `qty` (an int, 1 by default), and a method `cost` that returns price times qty. Then `Item("latte", 4.5, 2).cost()` should be 9.0.',
  hint: 'Under `name: str`, add `price: float` and `qty: int = 1`. Then `def cost(self):` / `return self.price * self.qty`.',
  solution: `from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: float
    qty: int = 1

    def cost(self):
        return self.price * self.qty

tea = Item("tea", 3.0)
print(tea, Item("latte", 4.5, 2).cost())`,
  check: `import dataclasses as _dc
_fields = [_f.name for _f in _dc.fields(Item)]
assert _fields == ["name", "price", "qty"], "Item's fields should be name, price and qty, in that order. It has %r." % (_fields,)
assert callable(getattr(Item, "cost", None)), "Give Item a method called cost."
assert Item("latte", 4.5, 2).cost() == 9.0, "Item('latte', 4.5, 2).cost() should be 9.0."
assert Item("tea", 3.0).qty == 1, "qty should default to 1."
assert Item("a", 1.0) == Item("a", 1.0), "Two Items with the same fields should be equal: is it still a @dataclass?"
assert "price=3.0" in repr(Item("tea", 3.0)), "The repr should show the fields, as a dataclass does."`,
},

/* ── Iterators, generators and more ────────────────────── */
{
  id: 'py-51', mins: 4,
  title: 'How for really works: iter and next',
  concept: [
    'A `for` loop quietly asks for the next item, again and again, until there are none left. You can do the same by hand: `it = iter(items)`, then `next(it)`.',
    'When an iterator runs out, `next` raises StopIteration. `for` catches that, and stops.',
    'A handy trick: take the first item off with `next`, like a header row, then loop over the rest.',
  ],
  starter: `lines = ["customer,total", "Ada,12.5", "Kofi,30.0", "Zola,8.25"]
rows = iter(lines)
print(next(rows))
print(next(rows))`,
  task: 'From a fresh `rows = iter(lines)`, take the header with `next` into `header`. Then make `totals`: the total from each remaining line, as numbers.',
  hint: '`rows = iter(lines)`, `header = next(rows)`, then `totals = [float(line.split(",")[1]) for line in rows]`: the loop carries on from where next stopped.',
  solution: `lines = ["customer,total", "Ada,12.5", "Kofi,30.0", "Zola,8.25"]

rows = iter(lines)
header = next(rows)
totals = [float(line.split(",")[1]) for line in rows]
print(header, totals)`,
  check: `assert globals().get("header") == "customer,total", "header is the first line: next(rows) on a fresh iter(lines)."
assert list(globals().get("totals", [])) == [12.5, 30.0, 8.25], "totals is the total from each line after the header: [12.5, 30.0, 8.25]."`,
},
{
  id: 'py-52', mins: 4,
  title: 'Generators: one value at a time',
  concept: [
    'A function that uses `yield` instead of `return` is a **generator**. Each `yield` hands out one value and pauses, until the next is asked for.',
    'It makes values one at a time, on demand, so it can describe a stream far too long to keep in a list.',
    '`list(gen)` collects everything it makes, and a `for` loop takes the values one by one.',
  ],
  starter: `def running_totals(amounts):
    total = 0
    for a in amounts:
        total += a
    return total               # only the final total

print(running_totals([4.5, 3.0, 2.5]))`,
  task: 'Turn it into a generator that yields the total after every amount, so `list(running_totals([4.5, 3.0, 2.5]))` is `[4.5, 7.5, 10.0]`.',
  hint: 'Move the output inside the loop: `yield total` after adding, and delete the `return`.',
  solution: `def running_totals(amounts):
    total = 0
    for a in amounts:
        total += a
        yield total

print(list(running_totals([4.5, 3.0, 2.5])))`,
  check: `import inspect as _inspect
assert _inspect.isgeneratorfunction(globals().get("running_totals")), "running_totals should yield its totals, which makes it a generator."
for _xs, _want in (([4.5, 3.0, 2.5], [4.5, 7.5, 10.0]), ([], []), ([1, 1, 1], [1, 2, 3])):
    assert list(running_totals(_xs)) == _want, "list(running_totals(%r)) gave %r, but it should give %r." % (_xs, list(running_totals(_xs)), _want)`,
},
{
  id: 'py-53', mins: 4,
  title: 'any, all, and sums without lists',
  concept: [
    '`sum(o for o in orders if o > 10)` adds up without building a list first: a **generator expression**, a comprehension in round brackets.',
    '`any(...)` is True if at least one is True; `all(...)` only if every one is. Both stop as soon as they know.',
    'They make questions read like English: `any(o > 30 for o in orders)`.',
  ],
  starter: `orders = [12.0, 8.5, 23.0, 2.5, 31.5]`,
  task: 'Make `big_total`: the total of the orders over 10, in one `sum(...)`. `any_over_30`: whether any order is over 30. `all_over_3`: whether every order is over 3.',
  hint: '`big_total = sum(o for o in orders if o > 10)`, `any_over_30 = any(o > 30 for o in orders)`, `all_over_3 = all(o > 3 for o in orders)`.',
  solution: `orders = [12.0, 8.5, 23.0, 2.5, 31.5]

big_total = sum(o for o in orders if o > 10)
any_over_30 = any(o > 30 for o in orders)
all_over_3 = all(o > 3 for o in orders)
print(big_total, any_over_30, all_over_3)`,
  check: `assert globals().get("big_total") == 66.5, "big_total is the orders over 10 added up: 66.5."
assert globals().get("any_over_30") is True, "any_over_30: is there at least one order over 30? any(o > 30 for o in orders)."
assert globals().get("all_over_3") is False, "all_over_3: is every order over 3? 2.5 isn't, so it is False."`,
},
{
  id: 'py-54', mins: 5,
  title: 'Decorators',
  concept: [
    'A **decorator** wraps a function inside another, to add something before or after it runs: timing it, logging it, counting it, checking its input.',
    'It is a function that takes a function and gives back a new one. `@count_calls` above a `def` means `f = count_calls(f)`.',
    'Inside, a `wrapper(*args, **kwargs)` passes on whatever it is given, so the decorator works on any function.',
  ],
  starter: `def count_calls(fn):
    def wrapper(*args, **kwargs):
        # count this call on wrapper.calls, then run fn and return its answer
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def vat(price):
    return round(price * 1.2, 2)

vat(4.5)
vat(3.0)
print(vat.calls)`,
  task: 'Make the wrapper add 1 to `wrapper.calls` every time it runs. After the two calls, `vat.calls` should be 2.',
  hint: 'Before the `return` inside `wrapper`: `wrapper.calls += 1`.',
  solution: `def count_calls(fn):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def vat(price):
    return round(price * 1.2, 2)

vat(4.5)
vat(3.0)
print(vat.calls)`,
  check: `assert callable(globals().get("count_calls")), "Keep the decorator called count_calls."
@count_calls
def _f(x):
    return x + 1
assert _f(1) == 2 and _f(5) == 6, "The wrapper should still return what the function returns."
assert _f.calls == 2, "After two calls, .calls should be 2: add 1 to wrapper.calls each time it runs."
assert vat.calls == 2, "vat.calls should be 2 after the two calls."`,
},
{
  id: 'py-55', mins: 4,
  title: 'Unpacking with * and **',
  concept: [
    '`first, *rest = items` puts the first item in `first`, and everything after it into the list `rest`: the star collects whatever is left over.',
    '`{**a, **b}` merges two dicts into a new one. Where both have a key, b wins.',
    'In a call, `f(*items)` spreads a list out as separate values, and `f(**options)` spreads a dict out as named ones.',
  ],
  starter: `queue = ["Ada", "Kofi", "Zola", "Nia"]
defaults = {"size": "medium", "milk": "whole", "shots": 1}
wanted = {"milk": "oat", "shots": 2}

def describe(size, milk, shots):
    return f"{size} {milk}, {shots} shot(s)"`,
  task: 'Make `served, waiting` with one starred unpacking of `queue`. Then `order`: `defaults` with `wanted` merged over it. Then `line = describe(**order)`.',
  hint: '`served, *waiting = queue`, `order = {**defaults, **wanted}`, `line = describe(**order)`.',
  solution: `queue = ["Ada", "Kofi", "Zola", "Nia"]
defaults = {"size": "medium", "milk": "whole", "shots": 1}
wanted = {"milk": "oat", "shots": 2}

def describe(size, milk, shots):
    return f"{size} {milk}, {shots} shot(s)"

served, *waiting = queue
order = {**defaults, **wanted}
line = describe(**order)
print(served, waiting, line)`,
  check: `assert globals().get("served") == "Ada" and globals().get("waiting") == ["Kofi", "Zola", "Nia"], "served, *waiting = queue puts Ada in served and the rest in waiting."
assert globals().get("order") == {"size": "medium", "milk": "oat", "shots": 2}, "order is defaults with wanted merged over it: {**defaults, **wanted}."
assert globals().get("line") == "medium oat, 2 shot(s)", "line is describe(**order): 'medium oat, 2 shot(s)'."`,
},

/* ── Regular expressions ───────────────────────────────── */
{
  id: 'py-56', mins: 4,
  title: 'Finding patterns: re.findall',
  concept: [
    'A **regular expression** (regex) is a pattern for finding text. `re.findall(pattern, text)` gives back every piece of the text that matches it.',
    'In a pattern, `\\d` means any digit and `+` means "one or more of that", so `\\d+` finds whole numbers. Most other characters just match themselves.',
    'Write patterns as **raw strings**, with an `r` before the quotes, like `r"\\d+"`, so Python leaves the backslashes for the regex.',
  ],
  starter: `import re

note = "Table 4 ordered 2 lattes and 3 croissants; table 12 wants 1 tea."
print(re.findall(r"table", note))`,
  task: 'Make `numbers`: every number in the note, as whole numbers (ints), using `re.findall`. Notice the first search missed "Table": patterns care about capitals.',
  hint: '`numbers = [int(n) for n in re.findall(r"\\d+", note)]`',
  solution: `import re

note = "Table 4 ordered 2 lattes and 3 croissants; table 12 wants 1 tea."
numbers = [int(n) for n in re.findall(r"\\d+", note)]
print(numbers)`,
  check: `assert list(globals().get("numbers", [])) == [4, 2, 3, 12, 1], "numbers should be [4, 2, 3, 12, 1], as ints: re.findall(r'\\\\d+', note), then int() each."`,
},
{
  id: 'py-57', mins: 4,
  title: 'Character classes and repeats',
  concept: [
    'Square brackets match any one of a set of characters: `[A-Z]` is any capital letter, `[aeiou]` any vowel. `\\w` is any letter, digit or underscore, and `\\s` any space.',
    'Then say how many: `+` one or more, `*` none or more, `?` none or one, `{3}` exactly three, `{2,4}` two to four.',
    'So `[A-Z]{3}-\\d{4}` matches three capitals, a dash and four digits: a product code like `BNS-1024`.',
  ],
  starter: `import re

stock = "Restock BNS-1024 and KIT-0042, not bns-77 or MUGS-3; also MRC-9001."
print(re.findall(r"[A-Z]{3}", stock))`,
  task: 'Make `codes`: every product code in `stock`, written as exactly three capitals, a dash and four digits.',
  hint: '`codes = re.findall(r"[A-Z]{3}-\\d{4}", stock)`',
  solution: `import re

stock = "Restock BNS-1024 and KIT-0042, not bns-77 or MUGS-3; also MRC-9001."
codes = re.findall(r"[A-Z]{3}-\\d{4}", stock)
print(codes)`,
  check: `assert list(globals().get("codes", [])) == ["BNS-1024", "KIT-0042", "MRC-9001"], "codes should be ['BNS-1024', 'KIT-0042', 'MRC-9001']: three capitals, a dash, four digits. You have %r." % (globals().get("codes"),)`,
},
{
  id: 'py-58', mins: 5,
  title: 'Groups: pulling parts out',
  concept: [
    'Round brackets in a pattern make a **group**: the part you want to keep. With two groups, `re.findall` gives back a pair for every match.',
    '`\\.` means a real full stop. A plain `.` means "any one character", which is a common slip.',
    '`re.search` finds only the first match, and `m.group(1)` is its first group. If nothing matches, it gives `None`.',
  ],
  starter: `import re

log = """Ada paid £12.50 at 09:14
Kofi paid £4.20 at 09:31
Zola tipped £1.00
Nia paid £30.00 at 10:02"""
print(re.findall(r"paid", log))`,
  task: 'Make `payments`: a list of (name, amount) pairs for every "paid" line, with the amount as a float. Zola tipped, so she isn\'t in it.',
  hint: '`re.findall(r"(\\w+) paid £(\\d+\\.\\d\\d)", log)` gives pairs of text. Then `payments = [(name, float(amount)) for name, amount in ...]`.',
  solution: `import re

log = """Ada paid £12.50 at 09:14
Kofi paid £4.20 at 09:31
Zola tipped £1.00
Nia paid £30.00 at 10:02"""

payments = [(name, float(amount)) for name, amount in re.findall(r"(\\w+) paid £(\\d+\\.\\d\\d)", log)]
print(payments)`,
  check: `assert list(globals().get("payments", [])) == [("Ada", 12.5), ("Kofi", 4.2), ("Nia", 30.0)], "payments should be [('Ada', 12.5), ('Kofi', 4.2), ('Nia', 30.0)]. You have %r." % (globals().get("payments"),)`,
},
{
  id: 'py-59', mins: 4,
  title: 'Checking a whole string',
  concept: [
    '`^` means "the start" and `$` "the end". `re.fullmatch(pattern, text)` only matches if the pattern covers the **whole** text: the right tool for checking a format.',
    'Without that, `re.search(r"\\d{4}", "12345")` happily finds four digits inside five.',
    '`flags=re.IGNORECASE` makes capitals and small letters count the same.',
  ],
  starter: `import re

def is_code(text):
    return re.search(r"[A-Z]{3}-\\d{4}", text) is not None

print(is_code("BNS-1024"), is_code("XBNS-10245"))      # both True: too loose`,
  task: 'Make `is_code` True only when the **whole** text is a code (three capitals, a dash, four digits), using `re.fullmatch`. Then write `is_code_any_case`: the same check, with small letters allowed too, using `flags=re.IGNORECASE`.',
  hint: '`return re.fullmatch(r"[A-Z]{3}-\\d{4}", text) is not None`, and the same with `, flags=re.IGNORECASE` before the closing bracket.',
  solution: `import re

def is_code(text):
    return re.fullmatch(r"[A-Z]{3}-\\d{4}", text) is not None

def is_code_any_case(text):
    return re.fullmatch(r"[A-Z]{3}-\\d{4}", text, flags=re.IGNORECASE) is not None

print(is_code("BNS-1024"), is_code("XBNS-10245"), is_code_any_case("bns-1024"))`,
  check: expect('is_code', `[(("BNS-1024",), True), (("XBNS-10245",), False), (("BNS-102",), False), (("bns-1024",), False), (("BNS-1024 ",), False), (("",), False)]`) + `
` + expect('is_code_any_case', `[(("bns-1024",), True), (("BnS-0001",), True), (("bns-10245",), False), (("BNS-1024",), True)]`),
},
{
  id: 'py-60', mins: 5,
  title: 'Search and replace: re.sub',
  concept: [
    '`re.sub(pattern, replacement, text)` swaps every match for the replacement. `re.sub(r"\\s+", " ", text)` squashes every run of spaces into one.',
    'In the replacement, `\\1`, `\\2` and so on put back what each group caught, so parts can be rearranged.',
    'So `re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", text)` turns 05/02/2024 into 2024-02-05, everywhere it appears.',
  ],
  starter: `import re

note = "Signed up   05/02/2024,  first order 17/03/2024,   last   02/06/2024."
print(re.sub(r"\\s+", " ", note))`,
  task: 'Make `tidy`: the note with every run of spaces squashed to one, and every date rewritten from day/month/year to year-month-day.',
  hint: 'Two `re.sub`s, one after the other: first the spaces, then `re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", ...)`.',
  solution: `import re

note = "Signed up   05/02/2024,  first order 17/03/2024,   last   02/06/2024."
tidy = re.sub(r"\\s+", " ", note)
tidy = re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", tidy)
print(tidy)`,
  check: `assert globals().get("tidy") == "Signed up 2024-02-05, first order 2024-03-17, last 2024-06-02.", "tidy should read: Signed up 2024-02-05, first order 2024-03-17, last 2024-06-02. You have %r." % (globals().get("tidy"),)`,
},
];
