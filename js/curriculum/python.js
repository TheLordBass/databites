import { expect } from './checks.js';

/* The Python course, parts 3 to 16 (py-11 to py-80). Parts 1 and 2 are the
   first-steps lessons in basics.js; together they are one track.

   Plain Python only: numbers and text, loops, lists, dicts and sets,
   functions, choices and the collections module, errors, files and
   formats, classes and the hooks that make them behave, iterators and
   decorators, testing, regular expressions, and small programs to finish.
   Everything is in the café, every term is explained where it first
   appears, and the checks name what went wrong.

   Ids are in the order lessons were written, not the order they're taken:
   py-61 to py-80 slot in as whole parts between the earlier ones, so
   progress on py-01 to py-60 is untouched. The array order is the course.

   The later parts take their syllabus from Think Python (3rd ed.),
   Introducing Python (3rd ed.), Learning Python (6th ed.), Professional
   Python and Job Ready Python, among others. Every lesson, example and
   exercise here is original.

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

/* ── Choices and collections ───────────────────────────── */
{
  id: 'py-61', mins: 4,
  title: 'Choices in one line',
  concept: [
    '`"big" if cups > 30 else "small"` picks one of two values in a single line: a **conditional expression**. Read it like English: this, if that, otherwise the other.',
    'Asked a yes-or-no question, some values count as False: `0`, `""` (empty text), `[]`, `{}` and `None`. Everything else counts as True. This is called **truthiness**.',
    'So `if orders:` means "if there are any orders", and `name or "guest"` gives `name`, or `"guest"` when the name is empty.',
  ],
  starter: `cups = 42
size = "big" if cups > 30 else "small"
print(size)

orders = []
print("busy" if orders else "quiet")

names = ["Ada", "", "Kofi", ""]      # two customers didn't give a name`,
  task: 'Make `labels`: each name in `names`, or `"guest"` where it is empty, with a list comprehension. Then `sizes`: `"big"` or `"small"` for each of `[12, 45, 31, 30]`, where big means over 30.',
  hint: '`labels = [n or "guest" for n in names]` and `sizes = ["big" if c > 30 else "small" for c in [12, 45, 31, 30]]`.',
  solution: `names = ["Ada", "", "Kofi", ""]

labels = [n or "guest" for n in names]
sizes = ["big" if c > 30 else "small" for c in [12, 45, 31, 30]]
print(labels)
print(sizes)`,
  check: `assert list(globals().get("labels", [])) == ["Ada", "guest", "Kofi", "guest"], "labels should be ['Ada', 'guest', 'Kofi', 'guest']: n or 'guest' for each name. You have %r." % (globals().get("labels"),)
assert list(globals().get("sizes", [])) == ["small", "big", "big", "small"], "sizes should be ['small', 'big', 'big', 'small']: 30 itself isn't over 30. You have %r." % (globals().get("sizes"),)`,
},
{
  id: 'py-62', mins: 5,
  title: 'match: choosing by shape',
  concept: [
    '`match command:` compares one value with a list of `case`s, top to bottom, and runs the first that fits. It reads more clearly than a long chain of `elif`s.',
    '`case "tea" | "coffee":` matches either one. `case _:` matches anything at all, so it goes last, as the catch-all.',
    'A case can match a **shape** and pull parts out of it: `case ["refund", amount]:` fits any two-item list that starts with "refund", and puts the second item in `amount`.',
  ],
  starter: `def handle(command):
    match command:
        case ["sell", item]:
            return f"sold a {item}"
        case _:
            return "not sure what that means"

print(handle(["sell", "latte"]))
print(handle(["refund", 4.5]))
print(handle(["close"]))`,
  task: 'Add two cases above the catch-all: `["refund", amount]` gives back `refunded £4.50` (the amount to 2 decimal places), and `["close"]` gives back `till closed`.',
  hint: '`case ["refund", amount]:` then, indented under it, `return f"refunded £{amount:.2f}"`. Then `case ["close"]:` and `return "till closed"`. Both go before `case _:`.',
  solution: `def handle(command):
    match command:
        case ["sell", item]:
            return f"sold a {item}"
        case ["refund", amount]:
            return f"refunded £{amount:.2f}"
        case ["close"]:
            return "till closed"
        case _:
            return "not sure what that means"

print(handle(["sell", "latte"]))
print(handle(["refund", 4.5]))
print(handle(["close"]))`,
  check: expect('handle', `[((["sell", "latte"],), "sold a latte"), ((["refund", 4.5],), "refunded £4.50"), ((["refund", 3],), "refunded £3.00"),
     ((["close"],), "till closed"), ((["dance"],), "not sure what that means"), ((["close", "now"],), "not sure what that means")]`),
},
{
  id: 'py-63', mins: 4,
  title: 'Counting with Counter',
  concept: [
    'Counting how often things turn up is so common that Python has a tool for it: `Counter`, from the `collections` module. `Counter(items)` gives a tally: each item, and how many times it appeared.',
    '`.most_common(2)` gives the top 2 as (item, count) pairs, biggest first. Ask for something it never saw and you get 0, not an error.',
    'Counters add up: `monday + tuesday` combines two tallies into one.',
  ],
  starter: `from collections import Counter

monday = ["latte", "tea", "latte", "mocha", "latte", "tea"]
tuesday = ["tea", "chai", "tea", "latte"]

print(Counter(monday))`,
  task: 'Make `mon` and `tue`: Counters of each day\'s drinks. Then `both`: the two added together, `top`: the top 2 of `both`, and `chai_monday`: how many chais `mon` counted.',
  hint: '`mon = Counter(monday)`, `tue = Counter(tuesday)`, `both = mon + tue`, `top = both.most_common(2)`, `chai_monday = mon["chai"]`.',
  solution: `from collections import Counter

monday = ["latte", "tea", "latte", "mocha", "latte", "tea"]
tuesday = ["tea", "chai", "tea", "latte"]

mon = Counter(monday)
tue = Counter(tuesday)
both = mon + tue
top = both.most_common(2)
chai_monday = mon["chai"]
print(both)
print(top, chai_monday)`,
  check: `from collections import Counter as _Counter
assert isinstance(globals().get("mon"), _Counter) and isinstance(globals().get("tue"), _Counter), "Make mon and tue with Counter(monday) and Counter(tuesday)."
assert globals().get("both") == _Counter({"latte": 4, "tea": 4, "mocha": 1, "chai": 1}), "both is mon + tue: 4 lattes, 4 teas, a mocha and a chai."
assert list(globals().get("top", [])) == [("latte", 4), ("tea", 4)], "top is both.most_common(2): [('latte', 4), ('tea', 4)]. You have %r." % (globals().get("top"),)
assert globals().get("chai_monday") == 0, "Nobody had chai on Monday, so mon['chai'] is 0."`,
},
{
  id: 'py-64', mins: 4,
  title: 'defaultdict: groups without the checks',
  concept: [
    'Grouping by hand means checking every time whether a key is there yet: `if city not in groups: groups[city] = []`.',
    '`defaultdict(list)`, from `collections`, does it for you: the first time you use a key it hasn\'t got, it puts an empty list there. `defaultdict(float)` starts missing keys at 0.0 instead, which suits totals.',
    'Otherwise it behaves like an ordinary dict. `dict(groups)` turns it into a plain one, for showing.',
  ],
  starter: `from collections import defaultdict

orders = [("Lagos", "Ada"), ("Accra", "Kofi"), ("Lagos", "Nia"), ("Nairobi", "Zola"), ("Accra", "Ama")]

groups = {}
for city, name in orders:
    if city not in groups:
        groups[city] = []
    groups[city].append(name)
print(groups)

sales = [("latte", 4.5), ("tea", 2.75), ("latte", 4.5), ("mocha", 5.0)]`,
  task: 'Make `by_city`: the same grouping, with `defaultdict(list)` and no `if`. Then `takings`: a `defaultdict(float)` holding the total for each drink in `sales`.',
  hint: '`by_city = defaultdict(list)`, then loop `for city, name in orders:` with `by_city[city].append(name)`. Then `takings = defaultdict(float)`, and loop `for drink, price in sales:` with `takings[drink] += price`.',
  solution: `from collections import defaultdict

orders = [("Lagos", "Ada"), ("Accra", "Kofi"), ("Lagos", "Nia"), ("Nairobi", "Zola"), ("Accra", "Ama")]
sales = [("latte", 4.5), ("tea", 2.75), ("latte", 4.5), ("mocha", 5.0)]

by_city = defaultdict(list)
for city, name in orders:
    by_city[city].append(name)

takings = defaultdict(float)
for drink, price in sales:
    takings[drink] += price

print(dict(by_city))
print(dict(takings))`,
  check: `from collections import defaultdict as _dd
assert isinstance(globals().get("by_city"), _dd) and by_city.default_factory is list, "Make by_city = defaultdict(list)."
assert dict(by_city) == {"Lagos": ["Ada", "Nia"], "Accra": ["Kofi", "Ama"], "Nairobi": ["Zola"]}, "by_city should group the names by city, in order. You have %r." % (dict(by_city),)
assert isinstance(globals().get("takings"), _dd), "Make takings = defaultdict(float)."
assert dict(takings) == {"latte": 9.0, "tea": 2.75, "mocha": 5.0}, "takings should total each drink: latte 9.0, tea 2.75, mocha 5.0. You have %r." % (dict(takings),)`,
},
{
  id: 'py-65', mins: 4,
  title: 'Tuples with names',
  concept: [
    'A tuple like `("latte", 4.5, 2)` keeps values in order, but `sale[1]` doesn\'t say what the 4.5 is.',
    '`namedtuple("Sale", ["drink", "price", "qty"])` makes a kind of tuple whose items have names as well: `s.price` reads far better than `s[1]`, and it still works as a tuple.',
    'Like any tuple, a named tuple can\'t be changed. `s._replace(qty=3)` gives a new one with one value swapped.',
  ],
  starter: `from collections import namedtuple

sales = [("latte", 4.5, 2), ("tea", 2.75, 1), ("mocha", 5.0, 3)]
print(sales[0][1] * sales[0][2])        # what are [1] and [2]?

Sale = namedtuple("Sale", ["drink", "price", "qty"])`,
  task: 'Make `named`: each sale as a `Sale`. Then `total`: price times qty for each, added up, using the names. Then `bigger`: the first sale with its qty changed to 4, using `_replace`.',
  hint: '`named = [Sale(d, p, q) for d, p, q in sales]`, `total = sum(s.price * s.qty for s in named)`, `bigger = named[0]._replace(qty=4)`.',
  solution: `from collections import namedtuple

sales = [("latte", 4.5, 2), ("tea", 2.75, 1), ("mocha", 5.0, 3)]
Sale = namedtuple("Sale", ["drink", "price", "qty"])

named = [Sale(d, p, q) for d, p, q in sales]
total = sum(s.price * s.qty for s in named)
bigger = named[0]._replace(qty=4)
print(named[0])
print(total, bigger)`,
  check: `_n = globals().get("named")
assert _n is not None and len(_n) == 3 and all(type(s).__name__ == "Sale" for s in _n), "named should hold the three sales, each made with Sale(...)."
assert _n[1].drink == "tea" and _n[1].price == 2.75 and _n[1].qty == 1, "Keep the order of the values: drink, price, qty."
assert abs(float(globals().get("total", 0)) - 26.75) < 1e-9, "total is price times qty for each sale, added up: 26.75."
_b = globals().get("bigger")
assert _b is not None and tuple(_b) == ("latte", 4.5, 4), "bigger is named[0]._replace(qty=4), which gives Sale(drink='latte', price=4.5, qty=4)."
assert _n[0].qty == 2, "_replace gives back a new Sale; the first one should still have qty 2."`,
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

/* ── Classes that behave ───────────────────────────────── */
{
  id: 'py-66', mins: 5,
  title: 'Comparing objects: == and <',
  concept: [
    'Two objects you made aren\'t equal just because their attributes match: unless you say otherwise, `==` asks "is this the very same object?"',
    'Write `__eq__(self, other)` to decide what equal means, and `__lt__(self, other)` for "less than". Once `<` works, `sorted()`, `min()` and `max()` work on your objects too.',
    'Check that the other thing is the same kind first, with `isinstance(other, Drink)`, so comparing a drink with some text gives False rather than an error.',
  ],
  starter: `class Drink:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"{self.name} £{self.price:.2f}"

a = Drink("latte", 4.5)
b = Drink("latte", 4.5)
print(a == b)                     # False: two separate objects

menu = [Drink("mocha", 5.0), Drink("tea", 2.75), Drink("latte", 4.5)]`,
  task: 'Give `Drink` an `__eq__`: two drinks are equal when the name and the price both match. And an `__lt__`: a drink is less than another when it is cheaper. Then make `by_price = sorted(menu)` and `cheapest = min(menu)`.',
  hint: '`def __eq__(self, other):` / `return isinstance(other, Drink) and (self.name, self.price) == (other.name, other.price)`. Then `def __lt__(self, other):` / `return self.price < other.price`.',
  solution: `class Drink:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"{self.name} £{self.price:.2f}"

    def __eq__(self, other):
        return isinstance(other, Drink) and (self.name, self.price) == (other.name, other.price)

    def __lt__(self, other):
        return self.price < other.price

a = Drink("latte", 4.5)
b = Drink("latte", 4.5)
print(a == b)

menu = [Drink("mocha", 5.0), Drink("tea", 2.75), Drink("latte", 4.5)]
by_price = sorted(menu)
cheapest = min(menu)
print(by_price, cheapest)`,
  check: `assert Drink("tea", 2.75) == Drink("tea", 2.75), "Two drinks with the same name and price should be equal: write __eq__."
assert Drink("tea", 2.75) != Drink("tea", 3.0) and Drink("tea", 3.0) != Drink("chai", 3.0), "Both the name and the price have to match for two drinks to be equal."
try:
    _same = Drink("tea", 2.75) == "tea"
except AttributeError:
    raise AssertionError("Comparing a drink with something that isn't a drink should give False, not an error: check isinstance(other, Drink) first.")
assert not _same, "A drink and the text 'tea' shouldn't be equal."
try:
    _lt = Drink("tea", 2.75) < Drink("latte", 4.5)
except TypeError:
    raise AssertionError("< doesn't work on drinks yet: write __lt__, returning self.price < other.price.")
assert _lt and not Drink("mocha", 5.0) < Drink("tea", 2.75), "a < b should mean a is cheaper than b."
assert [d.name for d in globals().get("by_price", [])] == ["tea", "latte", "mocha"], "by_price is sorted(menu): cheapest first."
assert getattr(globals().get("cheapest"), "name", None) == "tea", "cheapest is min(menu): the tea."`,
},
{
  id: 'py-67', mins: 5,
  title: 'Acting like a list: len, in and for',
  concept: [
    'Python\'s built-ins call hooks too: `len(x)` calls `x.__len__()`, `item in x` calls `x.__contains__(item)`, and a `for` loop calls `x.__iter__()`.',
    'Write those, and your object works with them just as a list does, while keeping its own rules inside: this menu refuses repeats.',
    '`__iter__` can simply hand back an iterator over something the object holds: `return iter(self.drinks)`.',
  ],
  starter: `class Menu:
    def __init__(self):
        self.drinks = []

    def add(self, name):
        if name not in self.drinks:      # no repeats on a menu
            self.drinks.append(name)

menu = Menu()
for d in ["latte", "tea", "latte", "mocha"]:
    menu.add(d)
print(menu.drinks)
# len(menu), "tea" in menu and for d in menu don't work yet`,
  task: 'Give `Menu` three hooks: `__len__` (how many drinks), `__contains__` (whether a name is on it) and `__iter__` (to loop over the names). Then set `count = len(menu)`, `has_tea = "tea" in menu` and `names = [d for d in menu]`.',
  hint: '`def __len__(self):` / `return len(self.drinks)`. `def __contains__(self, name):` / `return name in self.drinks`. `def __iter__(self):` / `return iter(self.drinks)`.',
  solution: `class Menu:
    def __init__(self):
        self.drinks = []

    def add(self, name):
        if name not in self.drinks:
            self.drinks.append(name)

    def __len__(self):
        return len(self.drinks)

    def __contains__(self, name):
        return name in self.drinks

    def __iter__(self):
        return iter(self.drinks)

menu = Menu()
for d in ["latte", "tea", "latte", "mocha"]:
    menu.add(d)

count = len(menu)
has_tea = "tea" in menu
names = [d for d in menu]
print(count, has_tea, names)`,
  check: `_m = Menu()
for _d in ["chai", "tea", "chai"]:
    _m.add(_d)
try:
    _n = len(_m)
except TypeError:
    raise AssertionError("len(menu) needs a __len__ method that returns how many drinks there are.")
assert _n == 2, "len should count the drinks: 2 here (no repeats), not %r." % (_n,)
try:
    _names = list(_m)
except TypeError:
    raise AssertionError("A for loop over the menu needs __iter__: return iter(self.drinks).")
assert _names == ["chai", "tea"], "Looping should give the names in order: %r, not %r." % (["chai", "tea"], _names)
assert "tea" in _m and "latte" not in _m, "'in' should say whether a name is on the menu: write __contains__."
assert globals().get("count") == 3 and globals().get("has_tea") is True, "Set count = len(menu) and has_tea = 'tea' in menu."
assert globals().get("names") == ["latte", "tea", "mocha"], "names is [d for d in menu]: ['latte', 'tea', 'mocha']."`,
},
{
  id: 'py-68', mins: 4,
  title: 'Adding objects together: __add__',
  concept: [
    '`a + b` calls `a.__add__(b)`. Write it, and `+` can mean whatever makes sense for your objects: two baskets added make one bigger basket.',
    'It should give back a **new** object and leave both originals alone, the way `2 + 3` doesn\'t change the 2.',
    '`sum(baskets)` starts from 0, and 0 + a basket makes no sense. Give `sum` somewhere else to start, an empty basket: `sum(baskets, Basket())`.',
  ],
  starter: `class Basket:
    def __init__(self, items=None):
        self.items = list(items or [])

    def total(self):
        return sum(price for name, price in self.items)

    def __repr__(self):
        return f"Basket({len(self.items)} items, £{self.total():.2f})"

ada = Basket([("latte", 4.5)])
kofi = Basket([("tea", 2.75), ("cake", 3.0)])
print(ada, kofi)`,
  task: 'Write `__add__` so that `ada + kofi` gives a new Basket holding both lots of items. Then make `shared = ada + kofi` and `everyone = sum([ada, kofi, ada], Basket())`.',
  hint: '`def __add__(self, other):` / `return Basket(self.items + other.items)`. Adding two lists makes a new list.',
  solution: `class Basket:
    def __init__(self, items=None):
        self.items = list(items or [])

    def total(self):
        return sum(price for name, price in self.items)

    def __repr__(self):
        return f"Basket({len(self.items)} items, £{self.total():.2f})"

    def __add__(self, other):
        return Basket(self.items + other.items)

ada = Basket([("latte", 4.5)])
kofi = Basket([("tea", 2.75), ("cake", 3.0)])

shared = ada + kofi
everyone = sum([ada, kofi, ada], Basket())
print(shared, everyone, ada)`,
  check: `_a, _b = Basket([("x", 1.0)]), Basket([("y", 2.0)])
try:
    _c = _a + _b
except TypeError:
    raise AssertionError("ada + kofi needs an __add__ method that returns a new Basket.")
assert isinstance(_c, Basket), "__add__ should return a Basket."
assert _c.items == [("x", 1.0), ("y", 2.0)], "The new basket holds both lots of items, the first basket's then the second's. It holds %r." % (_c.items,)
assert _a.items == [("x", 1.0)] and _b.items == [("y", 2.0)], "Adding shouldn't change either basket: build a new one."
assert repr(globals().get("shared")) == "Basket(3 items, £10.25)", "shared is ada + kofi: Basket(3 items, £10.25)."
assert repr(globals().get("everyone")) == "Basket(4 items, £14.75)", "everyone is sum([ada, kofi, ada], Basket()): Basket(4 items, £14.75)."`,
},
{
  id: 'py-69', mins: 5,
  title: 'Properties: attributes with rules',
  concept: [
    '`@property` above a method lets you read it like an attribute, with no brackets: `drink.with_vat` instead of `drink.with_vat()`. It is worked out fresh every time, so it is never out of date.',
    'A property can guard a value too. A **setter**, marked `@price.setter`, runs whenever something is assigned to `price`, and can refuse a bad value.',
    'The real value is kept under a slightly different name, by habit with an underscore in front: `self._price`. The underscore means "for inside the class only".',
  ],
  starter: `class Drink:
    def __init__(self, name, price):
        self.name = name
        self.price = price

latte = Drink("latte", 4.5)
latte.price = -3                # nothing stops this
print(latte.price)`,
  task: 'Make `price` a property: reading it gives `self._price`, and setting it raises a `ValueError` for a negative price, and otherwise stores it rounded to 2 places. Keep `self.price = price` in `__init__`, so new drinks get checked too. Add a read-only property `with_vat`: the price times 1.2, rounded to 2 places. Then delete the `latte.price = -3` line, which would now be refused.',
  hint: 'Inside the class: `@property` / `def price(self):` / `return self._price`. Then `@price.setter` / `def price(self, value):`, with `if value < 0:` / `raise ValueError("price can\'t be negative")`, then `self._price = round(value, 2)`. And `@property` / `def with_vat(self):` / `return round(self._price * 1.2, 2)`.',
  solution: `class Drink:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price can't be negative")
        self._price = round(value, 2)

    @property
    def with_vat(self):
        return round(self._price * 1.2, 2)

latte = Drink("latte", 4.5)
print(latte.price, latte.with_vat)`,
  check: `assert isinstance(getattr(Drink, "price", None), property), "Make price a property: @property above a method called price."
_d = Drink("tea", 2.754)
assert _d.price == 2.75, "Setting a price should store it rounded to 2 places: Drink('tea', 2.754).price should be 2.75, not %r." % (_d.price,)
_d.price = 3
assert _d.price == 3, "Setting price to 3 should work."
for _bad in (lambda: Drink("x", -1), lambda: setattr(_d, "price", -0.5)):
    try:
        _bad()
    except ValueError:
        pass
    else:
        raise AssertionError("A negative price should raise a ValueError, whether it's given to Drink(...) or set on .price later.")
assert isinstance(getattr(Drink, "with_vat", None), property), "Make with_vat a property too: @property above def with_vat(self):"
assert Drink("latte", 4.5).with_vat == 5.4, "with_vat is the price times 1.2, rounded to 2 places: 5.4 for a 4.5 latte."`,
},
{
  id: 'py-70', mins: 4,
  title: 'Another way in: classmethods',
  concept: [
    'Data doesn\'t always arrive in the shape `__init__` wants: here it\'s a line of text, `"Ada,Lagos,12.5"`. A **classmethod** gives the class a second way to build an object: `Order.from_line(...)`.',
    'Put `@classmethod` above it. Its first parameter is the class itself, called `cls` by habit, and `cls(...)` makes the object.',
    'A value set in the class body, outside any method, is a **class attribute**, shared by every object: handy for a setting like the VAT rate.',
  ],
  starter: `class Order:
    vat = 0.2                         # a class attribute: shared by every order

    def __init__(self, customer, city, amount):
        self.customer = customer
        self.city = city
        self.amount = amount

    def with_vat(self):
        return round(self.amount * (1 + Order.vat), 2)

lines = ["Ada,Lagos,12.5", "Kofi,Accra,30", "Zola,Nairobi,8.25"]`,
  task: 'Add a classmethod `from_line` that splits a line like `"Ada,Lagos,12.5"` and returns an Order, with the amount as a float. Then make `orders`: an Order from each line, made with it.',
  hint: '`@classmethod` / `def from_line(cls, line):` / `customer, city, amount = line.split(",")` / `return cls(customer, city, float(amount))`. Then `orders = [Order.from_line(l) for l in lines]`.',
  solution: `class Order:
    vat = 0.2

    def __init__(self, customer, city, amount):
        self.customer = customer
        self.city = city
        self.amount = amount

    @classmethod
    def from_line(cls, line):
        customer, city, amount = line.split(",")
        return cls(customer, city, float(amount))

    def with_vat(self):
        return round(self.amount * (1 + Order.vat), 2)

lines = ["Ada,Lagos,12.5", "Kofi,Accra,30", "Zola,Nairobi,8.25"]
orders = [Order.from_line(l) for l in lines]
for o in orders:
    print(o.customer, o.city, o.with_vat())`,
  check: `assert isinstance(Order.__dict__.get("from_line"), classmethod), "Make from_line a classmethod: @classmethod on the line above def from_line(cls, line):"
_o = Order.from_line("Nia,Kigali,4.5")
assert isinstance(_o, Order) and (_o.customer, _o.city, _o.amount) == ("Nia", "Kigali", 4.5), "Order.from_line('Nia,Kigali,4.5') should give an Order for Nia in Kigali, with the amount 4.5 as a float."
_os = globals().get("orders")
assert isinstance(_os, list) and [getattr(o, "customer", None) for o in _os] == ["Ada", "Kofi", "Zola"], "orders should be a list with an Order from each line, in order."
assert _os[1].amount == 30.0 and _os[1].with_vat() == 36.0, "Kofi's amount should be 30.0, which is 36.0 with VAT."`,
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

/* ── Code you can trust ────────────────────────────────── */
{
  id: 'py-71', mins: 5,
  title: 'Your own kinds of error',
  concept: [
    'You can make a kind of error of your own by building on `Exception`: `class OutOfStock(Exception): pass`. It works like ValueError, but its name says exactly what went wrong.',
    'Then whoever calls your code can catch just that one: `except OutOfStock:` deals with a sold-out drink, while a real bug still stops the program.',
    'A `try` can also have an `else:`, which runs only if nothing went wrong, and a `finally:`, which runs either way.',
  ],
  starter: `stock = {"latte": 2, "tea": 0, "mocha": 5}

def sell(drink):
    if stock.get(drink, 0) == 0:
        raise ValueError(drink + " is sold out")
    stock[drink] -= 1
    return drink

log = []
for d in ["latte", "tea", "mocha"]:
    sell(d)                           # stops at the tea`,
  task: 'Make a class `OutOfStock`, built on `Exception`, and have `sell` raise it instead of ValueError. Then `try` each sale in the loop: when it works (in `else`), add `"sold " + d` to `log`; on `OutOfStock`, add `"no " + d`.',
  hint: '`class OutOfStock(Exception):` with `pass` indented under it. In `sell`, `raise OutOfStock(drink + " is sold out")`. In the loop: `try:` / `sell(d)`, then `except OutOfStock:` / `log.append("no " + d)`, then `else:` / `log.append("sold " + d)`.',
  solution: `class OutOfStock(Exception):
    pass

stock = {"latte": 2, "tea": 0, "mocha": 5}

def sell(drink):
    if stock.get(drink, 0) == 0:
        raise OutOfStock(drink + " is sold out")
    stock[drink] -= 1
    return drink

log = []
for d in ["latte", "tea", "mocha"]:
    try:
        sell(d)
    except OutOfStock:
        log.append("no " + d)
    else:
        log.append("sold " + d)
print(log)`,
  check: `assert isinstance(globals().get("OutOfStock"), type) and issubclass(OutOfStock, Exception), "Make class OutOfStock(Exception): with pass inside it."
stock["_none"] = 0
try:
    sell("_none")
except OutOfStock:
    pass
except Exception as _e:
    raise AssertionError("sell should raise OutOfStock for a sold-out drink, not %s." % type(_e).__name__)
else:
    raise AssertionError("sell should raise OutOfStock when a drink has none left.")
finally:
    stock.pop("_none", None)
assert globals().get("log") == ["sold latte", "no tea", "sold mocha"], "log should be ['sold latte', 'no tea', 'sold mocha']. You have %r." % (globals().get("log"),)`,
},
{
  id: 'py-72', mins: 5,
  title: 'Your own with: context managers',
  concept: [
    '`with open(...)` promises the file gets closed at the end, even if something inside goes wrong. Anything that sets up and tidies away like that is a **context manager**.',
    'The easy way to write one is a generator marked `@contextmanager`, from `contextlib`. The code before its `yield` runs on the way into the `with`, and the code after it on the way out.',
    'Put the `yield` inside `try:` and the tidying-up inside `finally:`, and it runs even when the code in the `with` fails.',
  ],
  starter: `from contextlib import contextmanager

events = []

@contextmanager
def till_open(name):
    events.append("open " + name)
    yield
    events.append("close " + name)

with till_open("front"):
    events.append("sell latte")

try:
    with till_open("back"):
        events.append("sell tea")
        raise ValueError("card machine down")
except ValueError:
    events.append("error noted")

print(events)          # the back till never closed`,
  task: 'Make `till_open` close the till even when something goes wrong inside the `with`: put its `yield` inside `try:`, and the closing line in `finally:`.',
  hint: 'Inside `till_open`, after the "open" line: `try:` / `yield` (indented), then `finally:` / `events.append("close " + name)` (indented).',
  solution: `from contextlib import contextmanager

events = []

@contextmanager
def till_open(name):
    events.append("open " + name)
    try:
        yield
    finally:
        events.append("close " + name)

with till_open("front"):
    events.append("sell latte")

try:
    with till_open("back"):
        events.append("sell tea")
        raise ValueError("card machine down")
except ValueError:
    events.append("error noted")

print(events)`,
  check: `assert globals().get("events") == ["open front", "sell latte", "close front", "open back", "sell tea", "close back", "error noted"], "The back till should close before the error is noted. events is %r." % (globals().get("events"),)
_saved = list(events)
events.clear()
try:
    with till_open("test"):
        raise KeyError("test")
except KeyError:
    pass
_got = list(events)
events[:] = _saved
assert _got == ["open test", "close test"], "The till should close whatever goes wrong inside the with: yield inside try, and the closing line in finally."`,
},
{
  id: 'py-73', mins: 5,
  title: 'Tests that catch bugs',
  concept: [
    'A **test** is a small function that calls your code with inputs whose answers you already know, and checks them with `assert`. By habit, its name starts with `test_`.',
    'A good test is one that a broken version would fail. Pick inputs where a mistake would show: nothing at all, an exact boundary like 10, a value well past it.',
    'Run the tests after every change. When one fails, either the code broke or the test was wrong, and both are worth knowing.',
  ],
  starter: `def loyalty_stamps(cups):
    """One stamp per cup, plus a bonus stamp for every full 10 cups."""
    return cups + cups // 10

def test_loyalty_stamps():
    assert loyalty_stamps(3) == 3
    # add more: what should 0 cups give? 10 cups? 25?

test_loyalty_stamps()
print("tests passed")`,
  task: 'Add three asserts to `test_loyalty_stamps`: for 0 cups, 10 cups and 25 cups, working the answers out from the docstring. When you check, your test is also tried against some broken versions of the function, and it should catch every one.',
  hint: '0 cups earn nothing; 10 cups earn 10 stamps plus 1 bonus; 25 cups earn 25 plus 2 bonuses. So `assert loyalty_stamps(0) == 0`, `assert loyalty_stamps(10) == 11` and `assert loyalty_stamps(25) == 27`.',
  solution: `def loyalty_stamps(cups):
    """One stamp per cup, plus a bonus stamp for every full 10 cups."""
    return cups + cups // 10

def test_loyalty_stamps():
    assert loyalty_stamps(3) == 3
    assert loyalty_stamps(0) == 0
    assert loyalty_stamps(10) == 11
    assert loyalty_stamps(25) == 27

test_loyalty_stamps()
print("tests passed")`,
  check: `assert callable(globals().get("test_loyalty_stamps")), "Keep the test function called test_loyalty_stamps."
_real = loyalty_stamps
assert _real(25) == 27 and _real(0) == 0 and _real(10) == 11, "Leave loyalty_stamps as it was: it's the test that changes."
try:
    test_loyalty_stamps()
except AssertionError:
    raise AssertionError("Your test fails on the working function, so one of its answers is off. 0 cups give 0, 10 give 11, 25 give 27.")
_bugs = [
    (lambda cups: max(1, cups + cups // 10), "gives 1 stamp for 0 cups. Add an assert for 0 cups."),
    (lambda cups: cups + (cups - 1) // 10 if cups else 0, "misses the bonus at exactly 10 cups. Add an assert for 10 cups."),
    (lambda cups: cups + min(cups // 10, 1), "never gives more than one bonus stamp. Add an assert for 25 cups."),
]
try:
    for _bug, _why in _bugs:
        globals()["loyalty_stamps"] = _bug
        try:
            test_loyalty_stamps()
        except AssertionError:
            continue
        raise AssertionError("Your test passed a broken version that " + _why)
finally:
    globals()["loyalty_stamps"] = _real`,
},
{
  id: 'py-74', mins: 4,
  title: 'Examples that check themselves: doctest',
  concept: [
    'A docstring can show examples, written as if typed into Python: a line starting `>>> ` with the call, and the answer on the line under it.',
    'The `doctest` module runs those examples and checks the answers still match. So the examples in your documentation can\'t quietly go out of date.',
    '`doctest.run_docstring_examples(fn, globals(), verbose=True)` runs one function\'s examples and reports on each.',
  ],
  starter: `import doctest

def price_label(price):
    """Show a price with a pound sign and 2 decimal places.

    >>> price_label(4.5)
    '£4.50'
    """
    return f"£{price:.2f}"

doctest.run_docstring_examples(price_label, globals(), verbose=True)`,
  task: 'Add two more examples to the docstring, for `price_label(3)` and `price_label(12.499)`. Work out what each should show, run it, and make sure all three pass.',
  hint: 'Under the first example, add `>>> price_label(3)` with `\'£3.00\'` on the next line, and `>>> price_label(12.499)` with `\'£12.50\'` under it. Keep the same indent, quotes included.',
  solution: `import doctest

def price_label(price):
    """Show a price with a pound sign and 2 decimal places.

    >>> price_label(4.5)
    '£4.50'
    >>> price_label(3)
    '£3.00'
    >>> price_label(12.499)
    '£12.50'
    """
    return f"£{price:.2f}"

doctest.run_docstring_examples(price_label, globals(), verbose=True)`,
  check: `import doctest as _doctest
import io as _io
assert callable(globals().get("price_label")), "Keep the function called price_label."
_tests = _doctest.DocTestFinder(verbose=False).find(price_label, "price_label", module=False, globs=dict(globals()))
_examples = [_e for _t in _tests for _e in _t.examples]
assert len(_examples) >= 3, "Add two more examples to the docstring, each a >>> line with the answer on the line under it. It has %d." % len(_examples)
_sources = "".join(_e.source for _e in _examples).replace(" ", "")
assert "price_label(3)" in _sources and "price_label(12.499)" in _sources, "Add examples for price_label(3) and price_label(12.499)."
_runner = _doctest.DocTestRunner(verbose=False)
for _t in _tests:
    _runner.run(_t, out=_io.StringIO().write)
assert _runner.failures == 0, "%d example(s) show a different answer from the one price_label gives. Read the report above it, and fix the expected answers." % _runner.failures
assert price_label(4.5) == "£4.50", "Leave price_label working as it was."`,
},
{
  id: 'py-75', mins: 5,
  title: 'A set of tests: unittest',
  concept: [
    'As tests pile up, `unittest` keeps them in order: a class built on `unittest.TestCase`, with one method per test, each named `test_...`.',
    'Instead of a bare `assert`, use its own checks, like `self.assertEqual(got, want)`. When one fails, the report shows both values side by side.',
    '`with self.assertRaises(ValueError):` checks that the code inside it raises the error it should.',
  ],
  starter: `import sys
import unittest

def split_bill(total, people):
    """Each person's share, to 2 places. Refuses fewer than 1 person."""
    if people < 1:
        raise ValueError("need at least one person")
    return round(total / people, 2)

class TestSplitBill(unittest.TestCase):
    def test_even_split(self):
        self.assertEqual(split_bill(30, 3), 10.0)

def run_tests():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestSplitBill)
    unittest.TextTestRunner(stream=sys.stdout, verbosity=2).run(suite)

run_tests()`,
  task: 'Add two test methods to `TestSplitBill`: `test_rounding`, checking that 10 split 3 ways is 3.33, and `test_no_people`, checking that splitting between 0 people raises a ValueError. Run them: all three should pass.',
  hint: '`def test_rounding(self):` / `self.assertEqual(split_bill(10, 3), 3.33)`. Then `def test_no_people(self):` / `with self.assertRaises(ValueError):` / `split_bill(20, 0)`, each a level further in.',
  solution: `import sys
import unittest

def split_bill(total, people):
    """Each person's share, to 2 places. Refuses fewer than 1 person."""
    if people < 1:
        raise ValueError("need at least one person")
    return round(total / people, 2)

class TestSplitBill(unittest.TestCase):
    def test_even_split(self):
        self.assertEqual(split_bill(30, 3), 10.0)

    def test_rounding(self):
        self.assertEqual(split_bill(10, 3), 3.33)

    def test_no_people(self):
        with self.assertRaises(ValueError):
            split_bill(20, 0)

def run_tests():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestSplitBill)
    unittest.TextTestRunner(stream=sys.stdout, verbosity=2).run(suite)

run_tests()`,
  check: `import unittest as _ut
import io as _io
_names = [n for n in dir(TestSplitBill) if n.startswith("test")]
assert "test_rounding" in _names and "test_no_people" in _names, "Add test_rounding and test_no_people inside TestSplitBill, each starting def test_...(self):"
def _suite_ok():
    _s = _ut.defaultTestLoader.loadTestsFromTestCase(TestSplitBill)
    return _ut.TextTestRunner(stream=_io.StringIO(), verbosity=0).run(_s).wasSuccessful()
assert _suite_ok(), "Some tests fail on the working split_bill. Check the expected answers: 10 split 3 ways is 3.33."
def _no_round(total, people):
    if people < 1:
        raise ValueError("no people")
    return total / people
def _no_guard(total, people):
    return round(total / people, 2) if people else 0
_real = split_bill
try:
    for _bug, _why in ((_no_round, "doesn't round: test_rounding should check split_bill(10, 3) is 3.33."),
                       (_no_guard, "doesn't refuse 0 people: test_no_people should use assertRaises(ValueError).")):
        globals()["split_bill"] = _bug
        assert not _suite_ok(), "Your tests passed a broken version that " + _why
finally:
    globals()["split_bill"] = _real`,
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

/* ── Small programs ────────────────────────────────────── */
{
  id: 'py-76', mins: 5,
  title: 'Counting words',
  concept: [
    'Counting words is where most text analysis starts: the words that come up most tell you what people talk about.',
    'Real text needs tidying first. Make it lower case, so "Great" and "great" count as one, and leave the punctuation behind: `re.findall(r"[a-z\']+", text.lower())` keeps only runs of letters (and apostrophes).',
    'Little words like "the" and "and" swamp everything else. Leave them out with a set of **stop words** before you count.',
  ],
  starter: `import re
from collections import Counter

text = """The latte was great. Great service, and the cake was fresh!
The queue was slow, but the staff were great and the latte was hot.
Slow wifi. The cake was dry, and the tea was cold."""

stop = {"the", "was", "and", "but", "were", "a"}

words = text.split()
print(Counter(words).most_common(5))     # "The" and "the" count apart, and "great." isn't "great"`,
  task: 'Make `words`: the words in `text`, lower case and without punctuation, using `re.findall`. Then `top`: the 3 most common words that aren\'t in `stop`, as (word, count) pairs.',
  hint: '`words = re.findall(r"[a-z\']+", text.lower())`, then `top = Counter(w for w in words if w not in stop).most_common(3)`.',
  solution: `import re
from collections import Counter

text = """The latte was great. Great service, and the cake was fresh!
The queue was slow, but the staff were great and the latte was hot.
Slow wifi. The cake was dry, and the tea was cold."""

stop = {"the", "was", "and", "but", "were", "a"}

words = re.findall(r"[a-z']+", text.lower())
top = Counter(w for w in words if w not in stop).most_common(3)
print(len(words), "words")
print(top)`,
  check: `import re as _re
assert "words" in globals() and list(words) == _re.findall(r"[a-z']+", text.lower()), "words should be the lower-case words with no punctuation: re.findall with the pattern [a-z']+ on text.lower(). Yours starts %r." % (list(globals().get("words", []))[:5],)
assert list(globals().get("top", [])) == [("great", 3), ("latte", 2), ("cake", 2)], "top should be [('great', 3), ('latte', 2), ('cake', 2)]: count only the words not in stop, then .most_common(3). You have %r." % (globals().get("top"),)`,
},
{
  id: 'py-77', mins: 5,
  title: 'Which word comes next?',
  concept: [
    'A **bigram** is a pair of words side by side. `zip(words, words[1:])` pairs each word with the one after it.',
    'Collect, for every word, the words that came straight after it: `{"the": ["latte", "cake", ...], ...}`. That map is a tiny **language model**: it knows what tends to come next.',
    'Count a word\'s followers and the most common is the likeliest next word. The word suggestions on a phone keyboard grew from this idea.',
  ],
  starter: `import re
from collections import Counter, defaultdict

text = """the latte was great and the cake was fresh and the latte was hot
the queue was slow and the latte was dry and the tea was cold"""
words = re.findall(r"[a-z]+", text)

pairs = list(zip(words, words[1:]))
print(pairs[:4])`,
  task: 'Make `followers`: a `defaultdict(list)` holding, for every word, the list of words that came straight after it. Then `after_the`: the most common word after "the", and `after_was`: a Counter of the words after "was".',
  hint: '`followers = defaultdict(list)`, then `for a, b in zip(words, words[1:]):` / `followers[a].append(b)`. Then `after_the = Counter(followers["the"]).most_common(1)[0][0]` and `after_was = Counter(followers["was"])`.',
  solution: `import re
from collections import Counter, defaultdict

text = """the latte was great and the cake was fresh and the latte was hot
the queue was slow and the latte was dry and the tea was cold"""
words = re.findall(r"[a-z]+", text)

followers = defaultdict(list)
for a, b in zip(words, words[1:]):
    followers[a].append(b)

after_the = Counter(followers["the"]).most_common(1)[0][0]
after_was = Counter(followers["was"])
print(followers["the"])
print(after_the, after_was)`,
  check: `from collections import Counter as _Counter
_f = {}
for _a, _b in zip(words, words[1:]):
    _f.setdefault(_a, []).append(_b)
_got = {k: v for k, v in dict(globals().get("followers", {})).items() if v}
assert _got.get("the") == _f["the"], "followers['the'] should list every word that came straight after 'the', in order: %r. You have %r." % (_f["the"], _got.get("the"))
assert _got == _f, "followers should hold the words after every word, not only 'the'."
assert globals().get("after_the") == "latte", "after_the is the most common word after 'the': Counter(followers['the']).most_common(1)[0][0]."
assert globals().get("after_was") == _Counter(_f["was"]), "after_was is Counter(followers['was'])."`,
},
{
  id: 'py-78', mins: 5,
  title: 'Writing like the reviews',
  concept: [
    'Run the followers map forwards and it writes: start from a word, pick one of the words that followed it, then one that followed that one, and so on. This is a **Markov chain**.',
    'Picking with `rng.choice(...)` from the list makes common followers likelier, since they appear in the list more often.',
    'With a fixed seed, `random.Random(4)`, the "random" picks come out the same every run. That is how you test code that relies on chance.',
  ],
  starter: `import random
import re
from collections import defaultdict

text = """the latte was great and the cake was fresh and the latte was hot
the queue was slow and the latte was dry and the tea was cold"""
words = re.findall(r"[a-z]+", text)

followers = defaultdict(list)
for a, b in zip(words, words[1:]):
    followers[a].append(b)

def babble(start, length, rng):
    out = [start]
    # keep adding a word that followed the last one, until out has length words
    # (stop early if the last word never had anything after it)
    return out

print(babble("the", 8, random.Random(4)))`,
  task: 'Finish `babble`: while `out` is shorter than `length`, pick the next word with `rng.choice` from the followers of the last word in `out`, and add it on. Stop early if the last word has no followers. Then make `line`: `" ".join(babble("the", 8, random.Random(4)))`.',
  hint: '`while len(out) < length:` / `options = followers.get(out[-1])` / `if not options:` then `break` / `out.append(rng.choice(options))`.',
  solution: `import random
import re
from collections import defaultdict

text = """the latte was great and the cake was fresh and the latte was hot
the queue was slow and the latte was dry and the tea was cold"""
words = re.findall(r"[a-z]+", text)

followers = defaultdict(list)
for a, b in zip(words, words[1:]):
    followers[a].append(b)

def babble(start, length, rng):
    out = [start]
    while len(out) < length:
        options = followers.get(out[-1])
        if not options:
            break
        out.append(rng.choice(options))
    return out

line = " ".join(babble("the", 8, random.Random(4)))
print(line)`,
  check: `import random as _random
assert callable(globals().get("babble")), "Keep the function called babble."
def _ref(start, length, rng):
    out = [start]
    while len(out) < length:
        opts = followers.get(out[-1])
        if not opts:
            break
        out.append(rng.choice(opts))
    return out
for _seed, _start, _n in ((4, "the", 8), (1, "queue", 5), (7, "cold", 4), (2, "the", 1), (3, "was", 12)):
    _got = babble(_start, _n, _random.Random(_seed))
    _want = _ref(_start, _n, _random.Random(_seed))
    assert _got == _want, "babble(%r, %d, random.Random(%d)) gave %r, but it should give %r." % (_start, _n, _seed, _got, _want)
assert globals().get("line") == " ".join(_ref("the", 8, _random.Random(4))), "line is ' '.join(babble('the', 8, random.Random(4)))."`,
},
{
  id: 'py-79', mins: 5,
  title: 'A tax calculator',
  concept: [
    'Lots of charges work in **bands**: the first slice of income is taxed at one rate, the next slice at a higher one, and so on. Only the money inside a band pays that band\'s rate.',
    'Keep the bands as data, a list of (upper limit, rate) pairs, rather than a pile of `if`s. Then changing a rate means changing one number. (`12_000` is just 12000: the underscore makes it easier to read. `float("inf")` is infinity, bigger than any number.)',
    'Loop through the bands, tax the part of the income that falls inside each, and stop once the income runs out. These bands are made up, not any real country\'s.',
  ],
  starter: `bands = [(12_000, 0.0), (40_000, 0.2), (float("inf"), 0.4)]    # (up to, rate)

def tax(income):
    owed = 0
    lower = 0
    for upper, rate in bands:
        pass        # tax the slice of income between lower and upper, then move lower up
    return round(owed, 2)

print(tax(30_000))      # should be 3600.0`,
  task: 'Finish `tax`. For each band, the slice taxed is the part of the income above `lower` and up to `upper`. Stop if that slice is 0 or less; otherwise add slice times rate to `owed`, then set `lower = upper`.',
  hint: 'In the loop: `part = min(income, upper) - lower`, then `if part <= 0:` / `break`, then `owed += part * rate` and `lower = upper`.',
  solution: `bands = [(12_000, 0.0), (40_000, 0.2), (float("inf"), 0.4)]

def tax(income):
    owed = 0
    lower = 0
    for upper, rate in bands:
        part = min(income, upper) - lower
        if part <= 0:
            break
        owed += part * rate
        lower = upper
    return round(owed, 2)

for income in (10_000, 30_000, 50_000):
    print(income, tax(income))`,
  check: expect('tax', '[((30000,), 3600.0), ((50000,), 9600.0), ((10000,), 0), ((12000,), 0), ((40000,), 5600.0), ((0,), 0), ((40001,), 5600.4)]'),
},
{
  id: 'py-80', mins: 6, needs: ['sqlite3'],
  title: 'Extract, transform, load',
  concept: [
    '**ETL** is the everyday shape of data work: **extract** the raw data, **transform** it (tidy, check, convert), then **load** it somewhere it can be asked questions, like a database.',
    'Give each stage its own function. Rows that fail the checks go to one side with the reason, rather than vanishing.',
    'Python comes with `sqlite3`, a small database that can live in memory. `db.executemany("INSERT ...", rows)` loads many rows at once, and SQL can then answer questions about them.',
  ],
  starter: `import sqlite3

raw = """date,branch,drink,cups,price
2024-03-01,Lagos,latte,40,4.50
2024-03-01,accra ,tea,25,2.75
2024-03-02,Lagos,mocha,twelve,5.00
2024-03-02,Nairobi,latte,30,4.25
2024-03-02,Accra,latte,-5,4.50
2024-03-03,Accra,latte,18,4.50"""

def extract(text):
    lines = text.splitlines()
    header = lines[0].split(",")
    return [dict(zip(header, line.split(","))) for line in lines[1:]]

def transform(rows):
    good, rejected = [], []
    for r in rows:
        pass      # tidy the branch; cups as an int of 0 or more, price as a float; otherwise reject, with the reason
    return good, rejected

def load(rows, db):
    db.execute("CREATE TABLE sales (date TEXT, branch TEXT, drink TEXT, cups INTEGER, price REAL)")
    db.executemany("INSERT INTO sales VALUES (:date, :branch, :drink, :cups, :price)", rows)

db = sqlite3.connect(":memory:")
good, rejected = transform(extract(raw))
load(good, db)
print(db.execute("SELECT COUNT(*) FROM sales").fetchone()[0], "rows loaded")`,
  task: 'Finish `transform`. For each row, strip the branch and put it in title case, turn cups into an int and price into a float. A row whose cups isn\'t a whole number, or is below 0, goes in `rejected` as a pair, `(row, reason)`. Then make `takings`: `db.execute("SELECT branch, SUM(cups * price) FROM sales GROUP BY branch ORDER BY branch").fetchall()`.',
  hint: 'In the loop: `try:` / `cups = int(r["cups"])`, `except ValueError:` / `rejected.append((r, "cups isn\'t a number"))` / `continue`. Then `if cups < 0:` reject the same way. Otherwise `good.append({**r, "branch": r["branch"].strip().title(), "cups": cups, "price": float(r["price"])})`.',
  solution: `import sqlite3

raw = """date,branch,drink,cups,price
2024-03-01,Lagos,latte,40,4.50
2024-03-01,accra ,tea,25,2.75
2024-03-02,Lagos,mocha,twelve,5.00
2024-03-02,Nairobi,latte,30,4.25
2024-03-02,Accra,latte,-5,4.50
2024-03-03,Accra,latte,18,4.50"""

def extract(text):
    lines = text.splitlines()
    header = lines[0].split(",")
    return [dict(zip(header, line.split(","))) for line in lines[1:]]

def transform(rows):
    good, rejected = [], []
    for r in rows:
        try:
            cups = int(r["cups"])
        except ValueError:
            rejected.append((r, "cups isn't a number"))
            continue
        if cups < 0:
            rejected.append((r, "cups below 0"))
            continue
        good.append({**r, "branch": r["branch"].strip().title(), "cups": cups, "price": float(r["price"])})
    return good, rejected

def load(rows, db):
    db.execute("CREATE TABLE sales (date TEXT, branch TEXT, drink TEXT, cups INTEGER, price REAL)")
    db.executemany("INSERT INTO sales VALUES (:date, :branch, :drink, :cups, :price)", rows)

db = sqlite3.connect(":memory:")
good, rejected = transform(extract(raw))
load(good, db)

takings = db.execute("SELECT branch, SUM(cups * price) FROM sales GROUP BY branch ORDER BY branch").fetchall()
print(takings)
for row, reason in rejected:
    print("rejected:", row["drink"], row["cups"], "-", reason)`,
  check: `assert callable(globals().get("transform")), "Keep the function called transform."
_g, _r = transform(extract(raw))
assert len(_g) == 4 and len(_r) == 2, "4 rows should pass and 2 be rejected (the 'twelve' and the -5). You have %d good and %d rejected." % (len(_g), len(_r))
assert [x["branch"] for x in _g] == ["Lagos", "Accra", "Nairobi", "Accra"], "Tidy each branch: strip the spaces, then title case. You have %r." % ([x["branch"] for x in _g],)
assert all(isinstance(x["cups"], int) and isinstance(x["price"], float) for x in _g), "In the good rows, cups should be an int and price a float."
assert all(isinstance(x, tuple) and len(x) == 2 and isinstance(x[1], str) and x[1] for x in _r), "Each rejected row goes in as a pair, (row, reason), with the reason as text."
assert [x[0]["cups"] for x in _r] == ["twelve", "-5"], "The rejected rows should be the one with 'twelve' cups and the one with -5."
assert list(globals().get("takings", [])) == [("Accra", 149.75), ("Lagos", 180.0), ("Nairobi", 127.5)], "takings should be [('Accra', 149.75), ('Lagos', 180.0), ('Nairobi', 127.5)], from the SELECT with .fetchall(). You have %r." % (globals().get("takings"),)`,
},
];
