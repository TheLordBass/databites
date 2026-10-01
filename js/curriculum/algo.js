import { expect } from './checks.js';

/* Algorithms — how to think about the work a program does. Your own
   functions first (taught fully in the Python course; a quick start here
   for anyone who comes straight in), then counting steps and Big-O,
   searching, sorting, the everyday data structures, recursion, and graphs,
   greedy choices and dynamic programming.

   Plain Python throughout: nothing to download, and quick to run. Work is
   counted in steps rather than timed wherever a check depends on it, since
   timings wobble; the one timing lesson checks only that the gap is huge.

   Most checks call the learner's function on a list of cases and name the
   exact call that went wrong, with what came back and what should have. */

const FIND = `def find(items, target):
    steps = 0
    for i, item in enumerate(items):
        steps = steps + 1
        if item == target:
            return i, steps
    return -1, steps`;

const MERGE = `def merge(a, b):
    out = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        work["comparisons"] = work["comparisons"] + 1
        if a[i] <= b[j]:
            out.append(a[i])
            i = i + 1
        else:
            out.append(b[j])
            j = j + 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`;

/* The café's branches and the roads between them. The same map throughout
   the graph lessons; the Depot has no roads, to test "can't get there". */
const ROADS = `roads = [("Market", "Station"), ("Market", "Harbour"), ("Station", "Campus"), ("Harbour", "Campus"),
         ("Campus", "Airport"), ("Harbour", "Stadium"), ("Campus", "Stadium")]`;

const GRAPH = `graph = {
    "Market": ["Station", "Harbour"],
    "Station": ["Market", "Campus"],
    "Harbour": ["Market", "Campus", "Stadium"],
    "Campus": ["Station", "Harbour", "Airport", "Stadium"],
    "Airport": ["Campus"],
    "Stadium": ["Harbour", "Campus"],
    "Depot": [],
}`;

// Minutes per road. Market to Harbour direct is 15; round by Station and Campus, 12.
const TIMED = `timed = {
    "Market": [("Station", 4), ("Harbour", 15)],
    "Station": [("Market", 4), ("Campus", 5)],
    "Harbour": [("Market", 15), ("Campus", 3), ("Stadium", 6)],
    "Campus": [("Station", 5), ("Harbour", 3), ("Airport", 9), ("Stadium", 10)],
    "Airport": [("Campus", 9)],
    "Stadium": [("Harbour", 6), ("Campus", 10)],
    "Depot": [],
}`;

export const ALGO = [

/* ── Your own functions ────────────────────────────────── */
{
  id: 'al-01', mins: 3,
  title: 'Write your own function',
  concept: [
    'A **function** you write yourself starts with `def`, then its name, then brackets holding its **parameters**: names for the values it will be given.',
    'The indented lines under it are its body. `return` hands a value back to whoever called it, and ends the function there.',
    'Writing it only defines it: nothing happens until you **call** it, like `takings(30, 4.5)`. Call it as often as you like, with different values each time.',
  ],
  starter: `def takings(cups, price):
    return 0             # replace 0 with the real sum

print(takings(30, 4.5))
print(takings(12, 3.0))`,
  task: 'Make `takings` return cups times price. Both prints should then show real money.',
  hint: '`return cups * price`',
  solution: `def takings(cups, price):
    return cups * price

print(takings(30, 4.5))
print(takings(12, 3.0))`,
  check: expect('takings', '[((30, 4.5), 135.0), ((12, 3.0), 36.0), ((0, 2.5), 0.0), ((7, 1), 7)]'),
},
{
  id: 'al-02', mins: 4,
  title: 'Return, not print, and defaults',
  concept: [
    '`print` only shows a value. `return` hands it back, so the caller can store it and keep using it. A function that prints instead gives back `None`: Python\'s word for "nothing".',
    'A parameter can have a **default**: `def with_tip(bill, rate=0.1):`. Leave `rate` out when you call it and it is 0.1; give one, and yours is used.',
    'You can name what you pass, as in `with_tip(20, rate=0.15)`. Named values make a call easy to read.',
  ],
  starter: `def with_tip(bill):
    print(bill * 1.1)

total = with_tip(20)
print("total is", total)      # None: with_tip showed it, but gave nothing back`,
  task: 'Rewrite `with_tip` so it takes a `rate` that defaults to 0.1, and **returns** the bill plus that tip, rounded to 2 decimal places.',
  hint: '`def with_tip(bill, rate=0.1):`, and inside it `return round(bill * (1 + rate), 2)`.',
  solution: `def with_tip(bill, rate=0.1):
    return round(bill * (1 + rate), 2)

total = with_tip(20)
print("total is", total)
print("with a bigger tip:", with_tip(20, rate=0.15))`,
  check: expect('with_tip', '[((20,), 22.0), ((20, 0.15), 23.0), ((9.99,), 10.99), ((50, 0), 50.0)]') + `
assert with_tip(10, rate=0.2) == 12.0, "with_tip(10, rate=0.2) should give 12.0: call the parameter rate."`,
},
{
  id: 'al-03', mins: 4,
  title: 'Build a list in a loop',
  concept: [
    'Many answers are built up a piece at a time: start with an empty list, `[]`, and add to it in a loop with `.append(item)`.',
    '`enumerate(items)` hands over each item together with its position: `for i, cups in enumerate(week):` gets 0 and the first value, then 1 and the second, and so on.',
    'Start empty, loop, keep what passes a test, return it: this shape turns up in almost every algorithm.',
  ],
  starter: `week = [31, 48, 12, 55, 40, 61, 9]

for i, cups in enumerate(week):
    print(i, cups)

def busy_days(cups_per_day, limit):
    found = []
    # loop, and add the position of every day over the limit
    return found

print(busy_days(week, 45))`,
  task: 'Finish `busy_days`: return the positions of the days with **more than** `limit` cups. For this week and 45, that is `[1, 3, 5]`.',
  hint: 'Inside the function: `for i, cups in enumerate(cups_per_day):`, then `if cups > limit:`, then `found.append(i)`, each indented one step further than the last.',
  solution: `week = [31, 48, 12, 55, 40, 61, 9]

def busy_days(cups_per_day, limit):
    found = []
    for i, cups in enumerate(cups_per_day):
        if cups > limit:
            found.append(i)
    return found

print(busy_days(week, 45))`,
  check: expect('busy_days', '[(([31, 48, 12, 55, 40, 61, 9], 45), [1, 3, 5]), (([10, 20], 50), []), (([], 5), []), (([45, 46], 45), [1])]'),
},
{
  id: 'al-04', mins: 4,
  title: 'Loop until: while',
  concept: [
    '`for` repeats once for each item. `while condition:` repeats for as long as the condition stays True, however many times that takes.',
    'Something inside the loop has to move towards making it False, or it never stops. (If that happens here, Python gets stopped after a while and says so.)',
    '`//` divides and drops the remainder: `9 // 2` is 4. Halving again and again gets small surprisingly fast. Remember that: it comes back.',
  ],
  starter: `def halvings(n):
    steps = 0
    # while n is bigger than 1: halve it with // and count a step
    return steps

print(halvings(8))         # 8, 4, 2, 1: three halvings
print(halvings(1000))`,
  task: 'Finish `halvings`: how many times can you halve `n` (with `//`) before it gets down to 1? Then try a million, and see how few it takes.',
  hint: '`while n > 1:`, and under it `n = n // 2` and `steps = steps + 1`.',
  solution: `def halvings(n):
    steps = 0
    while n > 1:
        n = n // 2
        steps = steps + 1
    return steps

print(halvings(8))
print(halvings(1000))
print(halvings(1_000_000))`,
  check: expect('halvings', '[((8,), 3), ((1,), 0), ((2,), 1), ((3,), 1), ((1000,), 9), ((1000000,), 19)]'),
},
{
  id: 'al-05', mins: 5,
  title: 'Edge cases, and testing your own code',
  concept: [
    'Code that works on the example can still fail on an **edge case**: an empty list, a single item, all negative numbers, a tie.',
    '`assert condition, "message"` checks that something is True, and stops with your message if it isn\'t. A few asserts under a function make a quick set of tests.',
    'When a test fails, don\'t patch the answer. Ask what the code assumes that isn\'t always true.',
  ],
  starter: `def biggest(values):
    best = 0
    for v in values:
        if v > best:
            best = v
    return best

assert biggest([3, 9, 4]) == 9, "an ordinary list"
print("the ordinary test passed")
assert biggest([-5, -2, -8]) == -2, "all below zero"
assert biggest([]) is None, "an empty list has no biggest"
print("all tests passed")`,
  task: 'Two tests fail. Fix `biggest` so it works on any list: start from the first value instead of 0, and give back `None` for an empty list.',
  hint: 'First `if not values:` and, under it, `return None` (an empty list counts as False). Then `best = values[0]` instead of `best = 0`.',
  solution: `def biggest(values):
    if not values:
        return None
    best = values[0]
    for v in values:
        if v > best:
            best = v
    return best

assert biggest([3, 9, 4]) == 9, "an ordinary list"
assert biggest([-5, -2, -8]) == -2, "all below zero"
assert biggest([]) is None, "an empty list has no biggest"
print("all tests passed")`,
  check: expect('biggest', '[(([3, 9, 4],), 9), (([-5, -2, -8],), -2), (([],), None), (([7],), 7), (([0, -1],), 0), (([-3, -3],), -3)]'),
},

/* ── Counting the work ─────────────────────────────────── */
{
  id: 'al-06', mins: 4,
  title: 'Count the steps',
  concept: [
    'To compare two ways of doing something, count the **steps** each takes, not the seconds. Seconds depend on the phone; steps don\'t.',
    'A **linear search** checks the items one at a time from the start, until it finds the target. Each check is one step.',
    'A function can return two values with a comma, `return i, steps`, and you unpack them the same way: `where, steps = find(...)`.',
  ],
  starter: `orders = [512, 87, 301, 44, 990, 13, 675, 250]

def find(items, target):
    steps = 0
    for i, item in enumerate(items):
        pass      # count this check; if it matches, return the position and the steps
    return -1, steps           # not there: -1, after checking everything

print(find(orders, 44))
print(find(orders, 7))`,
  task: 'Finish `find`: count one step for every item it checks, and return the position and the steps as soon as it finds the target. Not found gives -1 and every step it took.',
  hint: 'Replace `pass` with `steps = steps + 1`, then `if item == target:` and, under it, `return i, steps`.',
  solution: `orders = [512, 87, 301, 44, 990, 13, 675, 250]

${FIND}

print(find(orders, 44))
print(find(orders, 7))`,
  check: expect('find', `[(([512, 87, 301, 44, 990, 13, 675, 250], 44), (3, 4)), (([512, 87, 301, 44, 990, 13, 675, 250], 7), (-1, 8)),
     (([512, 87, 301, 44, 990, 13, 675, 250], 512), (0, 1)), (([], 1), (-1, 0)), (([512, 87, 301, 44, 990, 13, 675, 250], 250), (7, 8))]`),
},
{
  id: 'al-07', mins: 4,
  title: 'Best, worst and average',
  concept: [
    'The same search can be quick or slow depending on the input. The **best case** is the target sitting first: 1 step. The **worst case** is last or missing: every item.',
    'The **average case** is what you expect over many searches. For targets spread evenly through the list, it is about half the list.',
    'When people talk about an algorithm\'s speed, they usually mean the worst case: the promise it keeps whatever happens.',
  ],
  starter: `${FIND}

orders = list(range(100, 200))       # 100 order numbers

best = find(orders, 100)[1]
worst = find(orders, 7)[1]
print("best:", best, " worst:", worst)`,
  task: 'Predict it first, then set `average`: the mean number of steps to find each of the 100 orders in turn. Is it close to half the list?',
  hint: 'Start `total = 0`. Loop `for o in orders:` adding `find(orders, o)[1]` to `total`. Then `average = total / len(orders)`.',
  solution: `${FIND}

orders = list(range(100, 200))

total = 0
for o in orders:
    total = total + find(orders, o)[1]
average = total / len(orders)
print("average:", average)`,
  check: `assert "average" in globals(), "Set average: the mean number of steps over all 100 orders."
assert abs(float(average) - 50.5) < 1e-9, "Add up find(orders, o)[1] for every o in orders, then divide by how many there are. You have %s." % average`,
},
{
  id: 'al-08', mins: 5,
  title: 'How the work grows',
  concept: [
    'What matters most isn\'t the steps for one size, but how they **grow** as the data grows. Double the list: does the work double, stay the same, or quadruple?',
    'Checking every **pair** of items (does any pair add up to £10?) takes about n × n ÷ 2 steps for n items. A thousand items: half a million pairs.',
    'Draw steps against size and the shapes tell the story: a straight line for one pass, a curve bending upwards for every pair.',
  ],
  starter: `def search_steps(n):          # the worst case for searching n items
    return n

def pair_steps(n):            # every pair of n items, each pair once
    steps = 0
    for i in range(n):
        for j in range(i + 1, n):
            steps = steps + 1
    return steps

sizes = [10, 20, 40, 80, 160]
search = []
for n in sizes:
    search.append(search_steps(n))
print(search)`,
  task: 'Make `pairs`: the pair steps for each size, built the same way as `search`. Then plot both against `sizes` on one chart, with a legend. Each time the size doubles, what happens to each?',
  hint: 'A loop like the one for `search`, but calling `pair_steps`. Then `plt.plot(sizes, search, label="search")`, `plt.plot(sizes, pairs, label="pairs")`, `plt.legend()` and `plt.show()`.',
  solution: `def search_steps(n):
    return n

def pair_steps(n):
    steps = 0
    for i in range(n):
        for j in range(i + 1, n):
            steps = steps + 1
    return steps

sizes = [10, 20, 40, 80, 160]
search = []
pairs = []
for n in sizes:
    search.append(search_steps(n))
    pairs.append(pair_steps(n))
print(search)
print(pairs)

plt.plot(sizes, search, marker="o", label="search")
plt.plot(sizes, pairs, marker="o", label="pairs")
plt.xlabel("items")
plt.ylabel("steps")
plt.legend()
plt.show()`,
  check: `assert "pairs" in globals(), "Make pairs: pair_steps for each size."
assert list(pairs) == [n * (n - 1) // 2 for n in [10, 20, 40, 80, 160]], "pairs should hold pair_steps(n) for each n in sizes, in order."
_ax = _axes()
assert _ax and len(_ax[0].lines) >= 2, "Plot both lists on one chart: plt.plot(sizes, search, ...) and plt.plot(sizes, pairs, ...)."
assert _ax[0].get_legend() is not None, "Add a legend, so the two lines can be told apart: plt.legend()."`,
},
{
  id: 'al-09', mins: 4,
  title: 'Big-O, in plain words',
  concept: [
    '**Big-O** is shorthand for how the work grows with the size of the input, n. It drops the small details and keeps the shape.',
    '`O(1)`: the same work whatever the size. `O(log n)`: one more step each time n doubles. `O(n)`: work grows in step with n. `O(n²)`: n doubles, the work quadruples.',
    'Spotting it in code: one loop over the data is usually O(n); a loop inside a loop over the same data, O(n²); halving each time round, O(log n).',
  ],
  starter: `def first(items):
    return items[0]

def total(items):
    t = 0
    for x in items:
        t = t + x
    return t

def has_pair_sum(items, target):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] + items[j] == target:
                return True
    return False

def halvings(n):
    steps = 0
    while n > 1:
        n = n // 2
        steps = steps + 1
    return steps

growth = {
    "first": "?",
    "total": "?",
    "has_pair_sum": "?",
    "halvings": "?",
}`,
  task: 'Fill in `growth`: for each function, how its work grows, as one of `"1"`, `"log n"`, `"n"` or `"n^2"`.',
  hint: '`first` looks at one item whatever the size. `total` visits every item once. `has_pair_sum` has a loop inside a loop. `halvings` halves until it reaches 1.',
  solution: `growth = {
    "first": "1",
    "total": "n",
    "has_pair_sum": "n^2",
    "halvings": "log n",
}
print(growth)`,
  check: `_want = {"first": "1", "total": "n", "has_pair_sum": "n^2", "halvings": "log n"}
assert "growth" in globals() and set(growth) == set(_want), "Keep the four names in growth: first, total, has_pair_sum and halvings."
for _k, _v in _want.items():
    _g = str(growth[_k]).lower().replace(" ", "").replace("²", "^2").replace("o(", "").replace(")", "")
    assert _g == _v.replace(" ", ""), "%s isn't %r. Picture its work when the list doubles in size." % (_k, growth[_k])`,
},
{
  id: 'al-10', mins: 5,
  title: 'Timing it for real: list or set?',
  concept: [
    '`x in some_list` checks the items one by one: O(n). A **set** files each item under a code worked out from the item itself, its **hash**, so `x in some_set` goes straight to the right place: O(1).',
    'A list keeps order and allows repeats; a set doesn\'t. When all you need is "have I seen this before?", use a set.',
    '`time.perf_counter()` reads a stopwatch: take it before and after, and subtract. Timings wobble, so time a lot of work and share it out per lookup.',
  ],
  starter: `import time

ids = list(range(100_000))
id_set = set(ids)
lookups = [99_999, -1] * 20          # the worst cases: the last one, and one that's missing

start = time.perf_counter()
for x in lookups:
    x in ids
list_each = (time.perf_counter() - start) / len(lookups)
print("list: about", round(list_each * 1_000_000), "microseconds per lookup")`,
  task: 'Time lookups in `id_set` the same way, into `set_each`. A set is so fast the stopwatch can barely see one lookup, so time 1,000 times as many: `lookups * 1000`. Then set `speedup = list_each / set_each`.',
  hint: '`many = lookups * 1000`, then the same three timing lines looping over `many` and checking `x in id_set`, dividing by `len(many)`. Then the speedup.',
  solution: `import time

ids = list(range(100_000))
id_set = set(ids)
lookups = [99_999, -1] * 20

start = time.perf_counter()
for x in lookups:
    x in ids
list_each = (time.perf_counter() - start) / len(lookups)

many = lookups * 1000
start = time.perf_counter()
for x in many:
    x in id_set
set_each = (time.perf_counter() - start) / len(many)

speedup = list_each / set_each
print("list: about", round(list_each * 1_000_000), "microseconds per lookup")
print("set:  about", round(set_each * 1_000_000, 3), "microseconds per lookup")
print("the set is about", round(speedup), "times faster")`,
  check: `assert "set_each" in globals() and float(set_each) > 0, "Time the set lookups into set_each, over lookups * 1000 so the stopwatch can see them."
assert "speedup" in globals() and abs(float(speedup) - list_each / set_each) < 1e-6 * max(1.0, float(speedup)), "speedup is list_each / set_each."
assert float(speedup) > 20, "The set should be far faster than the list. Did set_each time lookups in id_set?"`,
},

/* ── Searching ─────────────────────────────────────────── */
{
  id: 'al-11', mins: 4,
  title: 'Guess the number',
  concept: [
    'I\'m thinking of a number from 1 to 100. Guessing 1, 2, 3 and so on could take 100 goes. Guess the **middle** instead, and each "higher" or "lower" rules out half of what\'s left.',
    'That is **binary search**: keep a `low` and a `high`, guess `(low + high) // 2`, and move one end just past the guess.',
    'Halving 100 gets down to 1 in 7 steps, so it never takes more than 7 guesses. A million numbers? 20.',
  ],
  starter: `def guesses(secret, low=1, high=100):
    count = 0
    while low <= high:
        guess = (low + high) // 2
        count = count + 1
        if guess == secret:
            return count
        # too low: move low up past the guess. Too high: move high down past it.
        break
    return count

print(guesses(37))`,
  task: 'Replace the `break` with the two moves: if the guess is below the secret, set `low` to one above it; otherwise set `high` to one below it. Then set `most`: the most guesses any number from 1 to 100 needs.',
  hint: '`if guess < secret:` then `low = guess + 1`; `else:` then `high = guess - 1`. For `most`, loop over `range(1, 101)` keeping the biggest, or `most = max(guesses(s) for s in range(1, 101))`.',
  solution: `def guesses(secret, low=1, high=100):
    count = 0
    while low <= high:
        guess = (low + high) // 2
        count = count + 1
        if guess == secret:
            return count
        if guess < secret:
            low = guess + 1
        else:
            high = guess - 1
    return count

print(guesses(37))
most = max(guesses(s) for s in range(1, 101))
print("never more than", most, "guesses")`,
  check: `def _ref(secret, low=1, high=100):
    c = 0
    while low <= high:
        g = (low + high) // 2
        c += 1
        if g == secret:
            return c
        if g < secret:
            low = g + 1
        else:
            high = g - 1
    return c
assert callable(globals().get("guesses")), "Keep the function called guesses."
for _s in range(1, 101):
    assert guesses(_s) == _ref(_s), "guesses(%d) gave %r, but halving finds it in %d." % (_s, guesses(_s), _ref(_s))
assert "most" in globals() and most == 7, "Set most: the biggest guesses(s) for s from 1 to 100."`,
},
{
  id: 'al-12', mins: 5,
  title: 'Binary search in a sorted list',
  concept: [
    'Binary search works on any **sorted** list: look at the middle item, and throw away the half that can\'t hold the target.',
    'It is O(log n). A sorted list of a million order numbers takes at most 20 looks, where a linear search might take a million.',
    'The catch: the list has to be sorted, and sorting costs time too. It pays off when the same list gets searched many times.',
  ],
  starter: `def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        # found it? return mid. Too small? search the right half. Too big? the left.
        return -1
    return -1

orders = [13, 44, 87, 250, 301, 512, 675, 990]
print(binary_search(orders, 301))      # should be 4`,
  task: 'Finish it: return `mid` when `items[mid]` is the target; if it is smaller, move `low` to `mid + 1`; if bigger, move `high` to `mid - 1`. Return -1 if the target isn\'t there.',
  hint: 'Replace the inner `return -1` with `if items[mid] == target:` / `return mid`, then `elif items[mid] < target:` / `low = mid + 1`, then `else:` / `high = mid - 1`.',
  solution: `def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

orders = [13, 44, 87, 250, 301, 512, 675, 990]
print(binary_search(orders, 301))`,
  check: expect('binary_search', `[(([13, 44, 87, 250, 301, 512, 675, 990], 301), 4), (([13, 44, 87, 250, 301, 512, 675, 990], 13), 0),
     (([13, 44, 87, 250, 301, 512, 675, 990], 990), 7), (([13, 44, 87, 250, 301, 512, 675, 990], 50), -1),
     (([13, 44, 87, 250, 301, 512, 675, 990], 1), -1), (([13, 44, 87, 250, 301, 512, 675, 990], 1000), -1),
     (([], 5), -1), (([5], 5), 0), (([5], 4), -1)]`) + `
_big = list(range(0, 3000, 3))
for _t in (0, 2997, 1500, 1501, 3000):
    assert binary_search(_big, _t) == (_t // 3 if _t % 3 == 0 and _t < 3000 else -1), "On a list of 1,000 numbers, looking for %d went wrong." % _t`,
},
{
  id: 'al-13', mins: 5,
  title: 'Where would it go?',
  concept: [
    'Often you want a place rather than an exact match: the first price that is at least £10, or where a new order number belongs so the list stays sorted.',
    'That is a **lower bound**: the first position whose item is at least the target. If every item is smaller, it is the length of the list, just past the end.',
    'The same halving, with one change: when an item is big enough, keep it as a candidate and carry on looking left, in case an earlier one is big enough too.',
  ],
  starter: `def first_at_least(items, target):
    low, high = 0, len(items)            # high starts one past the end: "nowhere yet"
    while low < high:
        mid = (low + high) // 2
        # big enough? the answer is mid or to its left. Too small? it's to the right.
        break
    return low

prices = [2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0]
print(first_at_least(prices, 3.0))      # should be 1, the first 3.0
print(first_at_least(prices, 10))       # should be 6`,
  task: 'Replace the `break` with the two moves: if `items[mid] >= target`, set `high = mid`; otherwise set `low = mid + 1`.',
  hint: '`if items[mid] >= target:` / `high = mid`, then `else:` / `low = mid + 1`. Keeping `mid` (not `mid - 1`) is what stops it skipping past the answer.',
  solution: `def first_at_least(items, target):
    low, high = 0, len(items)
    while low < high:
        mid = (low + high) // 2
        if items[mid] >= target:
            high = mid
        else:
            low = mid + 1
    return low

prices = [2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0]
print(first_at_least(prices, 3.0))
print(first_at_least(prices, 10))`,
  check: expect('first_at_least', `[(([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 3.0), 1), (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 10), 6),
     (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 1), 0), (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 12.0), 6),
     (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 12.5), 7), (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 4), 3),
     (([], 5), 0), (([5, 5, 5], 5), 0)]`),
},
{
  id: 'al-14', mins: 4,
  title: 'Let Python do it: bisect',
  concept: [
    'The `bisect` module has binary search built in. `bisect_left(items, x)` is exactly the lower bound you just wrote. `bisect_right(items, x)` is the position just after any items equal to x.',
    'So `bisect_right(items, hi) - bisect_left(items, lo)` counts the items from lo to hi, in O(log n), however long the list.',
    '`insort(items, x)` puts x in its place, so the list stays sorted.',
  ],
  starter: `from bisect import bisect_left, bisect_right, insort

prices = [2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0]
print(bisect_left(prices, 3.0), bisect_right(prices, 3.0))

def count_between(items, lo, hi):
    return 0

print(count_between(prices, 3.0, 6.0))      # 3.0, 3.0, 4.5 and 6.0: 4`,
  task: 'Make `count_between` return how many items are from `lo` to `hi`, both included, using the two bisect functions.',
  hint: '`return bisect_right(items, hi) - bisect_left(items, lo)`',
  solution: `from bisect import bisect_left, bisect_right, insort

prices = [2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0]

def count_between(items, lo, hi):
    return bisect_right(items, hi) - bisect_left(items, lo)

print(count_between(prices, 3.0, 6.0))
insort(prices, 5.0)
print(prices)`,
  check: expect('count_between', `[(([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 3.0, 6.0), 4), (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 0, 100), 7),
     (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 7, 9), 0), (([2.5, 3.0, 3.0, 4.5, 6.0, 9.5, 12.0], 12.0, 12.0), 1), (([], 1, 5), 0)]`) + `
import random as _rnd
_r = _rnd.Random(14)
for _ in range(20):
    _xs = sorted(_r.randint(0, 50) for _ in range(_r.randint(0, 30)))
    _lo, _hi = sorted((_r.randint(0, 50), _r.randint(0, 50)))
    assert count_between(_xs, _lo, _hi) == sum(1 for _x in _xs if _lo <= _x <= _hi), "On a random sorted list, counting from %d to %d came out wrong." % (_lo, _hi)`,
},
{
  id: 'al-15', mins: 5,
  title: 'Search for the answer',
  concept: [
    'Binary search works on more than lists. If you can ask "is this number big enough?", and the answer flips from no to yes just once as the number grows, you can halve your way to the smallest yes.',
    'The bakery makes each café\'s pastry order in batches of one size. Bigger batches mean fewer bakes, and there is only time for 8 bakes. What is the smallest batch size that fits?',
    'An order of 30 with batches of 12 needs 3 bakes: `(order + size - 1) // size` rounds the division up.',
  ],
  starter: `orders = [30, 11, 23, 4, 20]         # pastries for each café today

def bakes(size):
    total = 0
    for o in orders:
        total = total + (o + size - 1) // size
    return total

def smallest_batch(limit):
    low, high = 1, max(orders)         # 1 is surely too small; the biggest order surely fits
    # halve: if bakes(mid) fits within the limit, try smaller; if not, go bigger
    return high

print(bakes(12), bakes(30))
print(smallest_batch(8))`,
  task: 'Finish `smallest_batch`: binary-search between `low` and `high` for the smallest size where `bakes(size) <= limit`, and return it.',
  hint: '`while low < high:` then `mid = (low + high) // 2`, then `if bakes(mid) <= limit:` / `high = mid`, `else:` / `low = mid + 1`. After the loop, `return low`.',
  solution: `orders = [30, 11, 23, 4, 20]

def bakes(size):
    total = 0
    for o in orders:
        total = total + (o + size - 1) // size
    return total

def smallest_batch(limit):
    low, high = 1, max(orders)
    while low < high:
        mid = (low + high) // 2
        if bakes(mid) <= limit:
            high = mid
        else:
            low = mid + 1
    return low

print(smallest_batch(8), "per batch fits in 8 bakes")`,
  check: `assert callable(globals().get("smallest_batch")), "Keep the function called smallest_batch."
for _limit in (5, 6, 7, 8, 10, 20, 88, 100):
    _want = next(_s for _s in range(1, max(orders) + 1) if bakes(_s) <= _limit)
    assert smallest_batch(_limit) == _want, "smallest_batch(%d) gave %r, but the smallest size that fits is %d." % (_limit, smallest_batch(_limit), _want)`,
},

/* ── Sorting ───────────────────────────────────────────── */
{
  id: 'al-16', mins: 5,
  title: 'Sort it yourself: selection sort',
  concept: [
    'To sort by hand, you might find the smallest and put it first, then the smallest of the rest, and so on. That is **selection sort**.',
    'Swapping two items in Python takes one line: `items[i], items[j] = items[j], items[i]`.',
    'For every position it scans everything after it: about n × n ÷ 2 comparisons, so O(n²). Fine for ten items, painful for a million.',
  ],
  starter: `def selection_sort(items):
    items = list(items)                  # work on a copy
    for i in range(len(items)):
        smallest = i
        # look at every position after i, remembering where the smallest item is;
        # then swap items[i] with items[smallest]
    return items

print(selection_sort([55, 12, 48, 9, 31]))`,
  task: 'Finish it: an inner loop over the positions after `i` updates `smallest` whenever it finds a smaller item. After that loop, swap position `i` with `smallest`.',
  hint: '`for j in range(i + 1, len(items)):` / `if items[j] < items[smallest]:` / `smallest = j`. Then, back level with the `for j` line, `items[i], items[smallest] = items[smallest], items[i]`.',
  solution: `def selection_sort(items):
    items = list(items)
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            if items[j] < items[smallest]:
                smallest = j
        items[i], items[smallest] = items[smallest], items[i]
    return items

print(selection_sort([55, 12, 48, 9, 31]))`,
  check: expect('selection_sort', '[(([55, 12, 48, 9, 31],), [9, 12, 31, 48, 55]), (([],), []), (([7],), [7]), (([3, 1, 3, 2, 1],), [1, 1, 2, 3, 3]), (([5, 4, 3, 2, 1],), [1, 2, 3, 4, 5])]') + `
import random as _rnd
_r = _rnd.Random(16)
for _ in range(15):
    _xs = [_r.randint(-20, 20) for _ in range(_r.randint(0, 25))]
    assert selection_sort(_xs) == sorted(_xs), "A random list didn't come out sorted."`,
},
{
  id: 'al-17', mins: 5,
  title: 'Insertion sort, and nearly sorted data',
  concept: [
    '**Insertion sort** works like sorting a hand of cards: take the next card, and slide it left past every bigger card until it fits.',
    'On a list that is already nearly in order, each card hardly moves: close to O(n). On a list in reverse order, every card slides all the way: O(n²).',
    'Counting the slides shows it: the same algorithm, very different work, depending on the input.',
  ],
  starter: `def insertion_sort(items):
    items = list(items)
    shifts = 0
    for i in range(1, len(items)):
        card = items[i]
        j = i - 1
        # while j is still in the list and items[j] is bigger than the card:
        #     move items[j] one place right, count a shift, and step j left
        items[j + 1] = card
    return items, shifts

print(insertion_sort([5, 2, 4, 1, 3]))`,
  task: 'Write the `while` loop that slides the card left. Then set `sorted_shifts` and `reversed_shifts`: the shifts for `list(range(100))` and for `list(range(100, 0, -1))`.',
  hint: '`while j >= 0 and items[j] > card:` / `items[j + 1] = items[j]` / `shifts = shifts + 1` / `j = j - 1`. Then `sorted_shifts = insertion_sort(list(range(100)))[1]`, and the same for the reversed list.',
  solution: `def insertion_sort(items):
    items = list(items)
    shifts = 0
    for i in range(1, len(items)):
        card = items[i]
        j = i - 1
        while j >= 0 and items[j] > card:
            items[j + 1] = items[j]
            shifts = shifts + 1
            j = j - 1
        items[j + 1] = card
    return items, shifts

print(insertion_sort([5, 2, 4, 1, 3]))
sorted_shifts = insertion_sort(list(range(100)))[1]
reversed_shifts = insertion_sort(list(range(100, 0, -1)))[1]
print("already sorted:", sorted_shifts, " reversed:", reversed_shifts)`,
  check: `def _inv(xs):
    return sum(1 for _i in range(len(xs)) for _j in range(_i + 1, len(xs)) if xs[_i] > xs[_j])
assert callable(globals().get("insertion_sort")), "Keep the function called insertion_sort."
for _xs in ([5, 2, 4, 1, 3], [], [1], [2, 2, 1], [9, 8, 7, 6], [1, 2, 3]):
    _got = insertion_sort(list(_xs))
    assert _got == (sorted(_xs), _inv(_xs)), "insertion_sort(%r) gave %r, but it should give %r." % (list(_xs), _got, (sorted(_xs), _inv(_xs)))
assert "sorted_shifts" in globals() and sorted_shifts == 0, "sorted_shifts is the shifts for list(range(100)): an already sorted list."
assert "reversed_shifts" in globals() and reversed_shifts == 4950, "reversed_shifts is the shifts for list(range(100, 0, -1))."`,
},
{
  id: 'al-18', mins: 4,
  title: 'Merging two sorted lists',
  concept: [
    'Two lists that are each already sorted can be combined in a single pass: compare the front of each, take the smaller, and move along that list.',
    'When one list runs out, what is left of the other is already in order, so it goes on the end as it is. `a[i:]` is everything from position i on, and `.extend()` adds a whole list.',
    'Each item is looked at once: O(n). This one step is the heart of merge sort, coming up in the recursion part.',
  ],
  starter: `def merge(a, b):
    out = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        # take the smaller front item into out, and move past it
        break
    # add whatever is left of a and of b
    return out

print(merge([9, 31, 55], [12, 48, 60, 70]))`,
  task: 'Finish `merge` so it returns one sorted list holding everything from both.',
  hint: 'In the loop: `if a[i] <= b[j]:` / `out.append(a[i])` / `i = i + 1`, `else:` the same with `b` and `j`. After it: `out.extend(a[i:])` and `out.extend(b[j:])`.',
  solution: `def merge(a, b):
    out = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i = i + 1
        else:
            out.append(b[j])
            j = j + 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out

print(merge([9, 31, 55], [12, 48, 60, 70]))`,
  check: expect('merge', '[(([9, 31, 55], [12, 48, 60, 70]), [9, 12, 31, 48, 55, 60, 70]), (([], [1, 2]), [1, 2]), (([1, 2], []), [1, 2]), (([], []), []), (([2, 2, 5], [2, 3]), [2, 2, 2, 3, 5]), (([10, 20, 30], [1, 2, 3]), [1, 2, 3, 10, 20, 30])]'),
},
{
  id: 'al-19', mins: 4,
  title: 'Sorting with a key',
  concept: [
    '`sorted(items)` gives back a new sorted list; `items.sort()` sorts the list itself. Both take O(n log n): far quicker than the sorts you wrote.',
    '`key=` says what to sort **by**: `sorted(orders, key=lambda o: o["total"])`. A key that gives a tuple, like `(city, total)`, sorts by the first part and breaks ties with the next.',
    'Python\'s sort is **stable**: items that tie keep the order they arrived in. `reverse=True` flips the whole order.',
  ],
  starter: `orders = [
    {"id": 1, "city": "Lagos", "total": 18.0},
    {"id": 2, "city": "Accra", "total": 42.5},
    {"id": 3, "city": "Lagos", "total": 42.5},
    {"id": 4, "city": "Nairobi", "total": 9.0},
    {"id": 5, "city": "Accra", "total": 18.0},
]
by_total = sorted(orders, key=lambda o: o["total"])
print([o["id"] for o in by_total])`,
  task: 'Make `ranked`: the orders sorted by city from A to Z, and within each city by total, biggest first. Then `ids`: their ids in that order.',
  hint: '`key=lambda o: (o["city"], -o["total"])`. The minus sign flips the totals, so bigger comes first. Then `ids = [o["id"] for o in ranked]`.',
  solution: `orders = [
    {"id": 1, "city": "Lagos", "total": 18.0},
    {"id": 2, "city": "Accra", "total": 42.5},
    {"id": 3, "city": "Lagos", "total": 42.5},
    {"id": 4, "city": "Nairobi", "total": 9.0},
    {"id": 5, "city": "Accra", "total": 18.0},
]
ranked = sorted(orders, key=lambda o: (o["city"], -o["total"]))
ids = [o["id"] for o in ranked]
print(ids)`,
  check: `assert "ids" in globals(), "Make ids: the id of each order in ranked, in order."
assert list(ids) == [2, 5, 3, 1, 4], "ids should be [2, 5, 3, 1, 4]: Accra first (its biggest total first), then Lagos, then Nairobi. You have %r." % (list(ids),)`,
},
{
  id: 'al-20', mins: 5,
  title: 'The top few, without sorting everything',
  concept: [
    'To find the 3 busiest days of a year, sorting all 365 does more work than needed. A **heap** always keeps its smallest item at the front, ready to take, and adding one costs only O(log n).',
    '`heapq` turns a plain list into a heap. Keep a heap of the best k seen so far: push each new value, and when it grows past k, pop the smallest off.',
    'Whatever is left at the end is the top k, for about O(n log k) work. `heapq.nlargest(k, values)` does the same in one call.',
  ],
  starter: `import heapq

rng = np.random.default_rng(3)
year = [int(x) for x in rng.integers(0, 500, 365)]      # cups sold each day

def top_k(values, k):
    heap = []
    for v in values:
        pass      # push v onto the heap; if it now holds more than k, pop the smallest
    return sorted(heap, reverse=True)

print(top_k(year, 3))`,
  task: 'Finish `top_k` with `heapq.heappush` and `heapq.heappop`. Then check it against `heapq.nlargest(3, year)`.',
  hint: 'Replace `pass` with `heapq.heappush(heap, v)`, then `if len(heap) > k:` / `heapq.heappop(heap)`.',
  solution: `import heapq

rng = np.random.default_rng(3)
year = [int(x) for x in rng.integers(0, 500, 365)]

def top_k(values, k):
    heap = []
    for v in values:
        heapq.heappush(heap, v)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)

print(top_k(year, 3))
print(heapq.nlargest(3, year))`,
  check: expect('top_k', '[(([5, 1, 9, 3, 7], 2), [9, 7]), (([5, 1, 9, 3, 7], 0), []), (([4, 4, 1], 2), [4, 4]), (([2, 8], 5), [8, 2]), (([], 3), [])]') + `
assert top_k(year, 3) == sorted(year, reverse=True)[:3], "top_k(year, 3) should match the three biggest days."`,
},

/* ── Data structures ───────────────────────────────────── */
{
  id: 'al-21', mins: 4,
  title: 'Counting with a dict',
  concept: [
    'A dict looks a key up in O(1), just like a set, and keeps a value with it. That makes it the tool for counting.',
    '`counts.get(word, 0)` gives the count so far, or 0 for a word not seen yet. Add 1 and store it back.',
    '`collections.Counter` does the same counting in one line, and `.most_common(3)` gives the top three as pairs of (item, count).',
  ],
  starter: `drinks = ["latte", "tea", "latte", "mocha", "latte", "tea", "espresso", "tea", "latte"]

def tally(items):
    counts = {}
    for item in items:
        pass      # add one to this item's count
    return counts

print(tally(drinks))`,
  task: 'Finish `tally` so it returns each item with how many times it appears. Then set `top` to the most common drink, using `Counter`.',
  hint: '`counts[item] = counts.get(item, 0) + 1`. Then `from collections import Counter` and `top = Counter(drinks).most_common(1)[0][0]`: the first pair, then its item.',
  solution: `from collections import Counter

drinks = ["latte", "tea", "latte", "mocha", "latte", "tea", "espresso", "tea", "latte"]

def tally(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts

print(tally(drinks))
top = Counter(drinks).most_common(1)[0][0]
print("most common:", top)`,
  check: expect('tally', `[((["latte", "tea", "latte"],), {"latte": 2, "tea": 1}), (([],), {}), ((["a", "a", "a"],), {"a": 3}), (([3, 1, 3],), {3: 2, 1: 1})]`) + `
assert "top" in globals() and top == "latte", "top is the most common drink: Counter(drinks).most_common(1)[0][0]."`,
},
{
  id: 'al-22', mins: 5,
  title: 'Two that add up',
  concept: [
    'Two things on the menu that together cost exactly the voucher? Checking every pair is O(n²).',
    'Faster: walk through once, and for each price ask "have I already seen the price that would make it up?" A dict of price to position answers that in O(1), so one pass does it: O(n).',
    'Spending a little memory to save a lot of time is one of the most useful trades in algorithms.',
  ],
  starter: `menu = [4.5, 3.0, 2.75, 6.0, 1.25, 5.5]     # all in quarters, so sums are exact

def pair_for(prices, voucher):
    seen = {}                   # price -> the position it was at
    for i, p in enumerate(prices):
        need = voucher - p
        # if need is in seen, return (seen[need], i); otherwise remember p's position
    return None

print(pair_for(menu, 7.25))      # 4.5 and 2.75: (0, 2)`,
  task: 'Finish `pair_for`: return the positions of the first pair that adds up to the voucher (the earlier position first), or `None` if no pair does. One item can\'t be used twice.',
  hint: '`if need in seen:` / `return (seen[need], i)`. Then, level with the `if`, `seen[p] = i`. Checking before storing is what stops one item pairing with itself.',
  solution: `menu = [4.5, 3.0, 2.75, 6.0, 1.25, 5.5]

def pair_for(prices, voucher):
    seen = {}
    for i, p in enumerate(prices):
        need = voucher - p
        if need in seen:
            return (seen[need], i)
        seen[p] = i
    return None

print(pair_for(menu, 7.25))
print(pair_for(menu, 100))`,
  check: expect('pair_for', `[(([4.5, 3.0, 2.75, 6.0, 1.25, 5.5], 7.25), (0, 2)), (([4.5, 3.0, 2.75, 6.0, 1.25, 5.5], 8.5), (1, 5)),
     (([4.5, 3.0, 2.75, 6.0, 1.25, 5.5], 100), None), (([2.0, 2.0], 4.0), (0, 1)), (([5.0], 10.0), None), (([], 1.0), None)]`),
},
{
  id: 'al-23', mins: 4,
  title: 'Grouping into lists',
  concept: [
    'To group things, keep a dict whose values are lists: each city, with the list of its orders.',
    'Each order here is a pair in round brackets, a **tuple**, and `for city, total in pairs:` takes both parts at once. `defaultdict(list)` makes an empty list the first time a new key is used, so there\'s no "is it there yet?" check.',
    'One pass over the data, O(n), and every group is ready. This is what pandas\' groupby does underneath.',
  ],
  starter: `from collections import defaultdict

orders = [("Lagos", 18.0), ("Accra", 42.5), ("Lagos", 42.5), ("Nairobi", 9.0), ("Accra", 30.0)]

def group_totals(pairs):
    groups = defaultdict(list)
    for city, total in pairs:
        pass      # add total to this city's list
    return dict(groups)

print(group_totals(orders))`,
  task: 'Finish `group_totals` so each city maps to the list of its totals, in the order they came. Then set `busiest`: the city whose totals add up to the most.',
  hint: '`groups[city].append(total)`. Then `g = group_totals(orders)` and `busiest = max(g, key=lambda c: sum(g[c]))`.',
  solution: `from collections import defaultdict

orders = [("Lagos", 18.0), ("Accra", 42.5), ("Lagos", 42.5), ("Nairobi", 9.0), ("Accra", 30.0)]

def group_totals(pairs):
    groups = defaultdict(list)
    for city, total in pairs:
        groups[city].append(total)
    return dict(groups)

g = group_totals(orders)
print(g)
busiest = max(g, key=lambda c: sum(g[c]))
print("busiest:", busiest)`,
  check: expect('group_totals', `[(([("Lagos", 18.0), ("Accra", 42.5), ("Lagos", 42.5)],), {"Lagos": [18.0, 42.5], "Accra": [42.5]}), (([],), {}), (([("A", 1), ("A", 2), ("A", 3)],), {"A": [1, 2, 3]})]`) + `
assert "busiest" in globals() and busiest == "Accra", "busiest is the city with the biggest sum of totals. Accra's add up to 72.5."`,
},
{
  id: 'al-24', mins: 5,
  title: 'Stacks: do the brackets match?',
  concept: [
    'A **stack** is a pile: you add to the top and take from the top, so the last thing in is the first out. A list does it with `.append()` and `.pop()`.',
    'Brackets have to close in the reverse order they opened, which is exactly what a stack remembers. Push each opener; on a closer, the top of the stack must be its partner.',
    'Your code editor, a calculator and the Undo button all keep stacks.',
  ],
  starter: `PAIRS = {")": "(", "]": "[", "}": "{"}

def balanced(text):
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            pass      # the top of the stack must be its partner (pop it off); if not, False
    return True       # but what if something is still open?

print(balanced("print(cups[0])"))
print(balanced("print((cups[0])"))`,
  task: 'Finish `balanced`: a closer needs a stack that isn\'t empty, with its partner on top (popped off). At the end, everything opened must have been closed.',
  hint: 'Replace `pass` with `if not stack or stack.pop() != PAIRS[ch]:` / `return False`. Replace the last line with `return not stack`: True only if the stack is empty.',
  solution: `PAIRS = {")": "(", "]": "[", "}": "{"}

def balanced(text):
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            if not stack or stack.pop() != PAIRS[ch]:
                return False
    return not stack

print(balanced("print(cups[0])"))
print(balanced("print((cups[0])"))`,
  check: expect('balanced', `[(("",), True), (("()",), True), (("([]{})",), True), (("(]",), False), (("(()",), False),
     (("())",), False), (("print(cups[0])",), True), (("{[}]",), False), (("a(b)c",), True), ((")(",), False)]`),
},
{
  id: 'al-25', mins: 5,
  title: 'Queues: the barista takes turns',
  concept: [
    'A **queue** is a line: join at the back, get served from the front. First in, first out.',
    'Taking from the front of a list is slow (everything shuffles up a place), so `collections.deque` is built for it: `.append()` at the back and `.popleft()` from the front, both O(1).',
    'A barista with several orders on the go can take turns: make one drink for the order at the front, and if that order needs more, send it to the back of the line.',
  ],
  starter: `from collections import deque

def finish_order(orders):
    line = deque(orders)             # each order: (name, drinks)
    finished = []
    while line:
        name, drinks = line.popleft()
        # make one drink. The last one? add the name to finished. More to make? back of the line.
    return finished

print(finish_order([("Ada", 3), ("Kofi", 1), ("Zola", 2)]))`,
  task: 'Finish the loop: take one drink off, then either add the name to `finished` or put `(name, drinks)` back at the end of the line. Who finishes first, and why?',
  hint: '`drinks = drinks - 1`, then `if drinks == 0:` / `finished.append(name)`, `else:` / `line.append((name, drinks))`.',
  solution: `from collections import deque

def finish_order(orders):
    line = deque(orders)
    finished = []
    while line:
        name, drinks = line.popleft()
        drinks = drinks - 1
        if drinks == 0:
            finished.append(name)
        else:
            line.append((name, drinks))
    return finished

print(finish_order([("Ada", 3), ("Kofi", 1), ("Zola", 2)]))`,
  check: expect('finish_order', `[(([("Ada", 3), ("Kofi", 1), ("Zola", 2)],), ["Kofi", "Zola", "Ada"]), (([],), []), (([("Ada", 1)],), ["Ada"]),
     (([("Ada", 2), ("Kofi", 2)],), ["Ada", "Kofi"]), (([("Ada", 4), ("Kofi", 1), ("Zola", 1)],), ["Kofi", "Zola", "Ada"])]`),
},

/* ── Recursion ─────────────────────────────────────────── */
{
  id: 'al-26', mins: 5,
  title: 'A function that calls itself',
  concept: [
    'A **recursive** function solves a problem by calling itself on a smaller piece of it: the total of a list is its first item, plus the total of the rest.',
    'It needs a **base case**: a piece so small the answer is obvious (the total of an empty list is 0). Without one, it would call itself forever.',
    'Each call waits for the one it made to answer, then finishes its own sum. Python allows about a thousand calls deep, so recursion suits problems that shrink fast or branch.',
  ],
  starter: `def total(values):
    if not values:            # the base case: nothing left
        return 0
    return 0                  # replace with: the first value, plus the total of the rest

print(total([4, 8, 15, 16, 23, 42]))`,
  task: 'Finish `total` recursively: the first value plus `total` of the rest. `values[1:]` is everything after the first.',
  hint: '`return values[0] + total(values[1:])`',
  solution: `def total(values):
    if not values:
        return 0
    return values[0] + total(values[1:])

print(total([4, 8, 15, 16, 23, 42]))`,
  check: expect('total', '[(([4, 8, 15, 16, 23, 42],), 108), (([],), 0), (([7],), 7), (([-2, 2, -5],), -5)]'),
},
{
  id: 'al-27', mins: 5,
  title: 'Nested data',
  concept: [
    'Recursion shines on data that nests: a menu whose sections hold smaller sections, which hold smaller ones again, down to lists of items.',
    'A loop would need to know how deep the nesting goes. A recursive function doesn\'t: for each part, if it is a list, count its items; if it is another section, call yourself on it.',
    '`isinstance(x, list)` asks whether x is a list. JSON from websites and apps nests just like this.',
  ],
  starter: `menu = {
    "drinks": {
        "hot": ["latte", "espresso", "tea"],
        "cold": {"coffee": ["cold brew", "iced latte"], "other": ["lemonade"]},
    },
    "food": {"pastries": ["croissant", "muffin"], "cakes": ["carrot", "lemon", "chocolate"]},
}

def count_items(section):
    if isinstance(section, list):        # a plain list of items: the base case
        return len(section)
    total = 0
    # a dict of smaller sections: count each one and add them up
    return total

print(count_items(menu))`,
  task: 'Finish `count_items`: for a dict, loop over its values and add up `count_items` of each. It should find all 11 items, however deep they sit.',
  hint: '`for part in section.values():` / `total = total + count_items(part)`.',
  solution: `menu = {
    "drinks": {
        "hot": ["latte", "espresso", "tea"],
        "cold": {"coffee": ["cold brew", "iced latte"], "other": ["lemonade"]},
    },
    "food": {"pastries": ["croissant", "muffin"], "cakes": ["carrot", "lemon", "chocolate"]},
}

def count_items(section):
    if isinstance(section, list):
        return len(section)
    total = 0
    for part in section.values():
        total = total + count_items(part)
    return total

print(count_items(menu))`,
  check: expect('count_items', `[(({"a": ["x", "y"], "b": {"c": ["z"], "d": {"e": ["p", "q", "r"]}}},), 6), (({},), 0), ((["x"],), 1),
     (({"a": {"b": {"c": {"d": ["deep"]}}}},), 1)]`) + `
assert count_items(menu) == 11, "The café menu has 11 items in all."`,
},
{
  id: 'al-28', mins: 5,
  title: 'Merge sort',
  concept: [
    '**Merge sort** splits the list in half, sorts each half by calling itself, and joins the two sorted halves with `merge`.',
    'A list of one item (or none) is already sorted: that is the base case.',
    'The list halves about log n times, and at each level of halving, merging handles all n items: O(n log n), even in the worst case. That is the speed of Python\'s own sort.',
  ],
  starter: `work = {"comparisons": 0}

${MERGE}

def merge_sort(items):
    if len(items) <= 1:
        return list(items)
    mid = len(items) // 2
    # sort the left half and the right half with merge_sort, then merge them
    return list(items)

print(merge_sort([55, 12, 48, 9, 31, 70, 2]))`,
  task: 'Finish `merge_sort`. Then sort 1,000 random numbers and look at `work["comparisons"]`: selection sort would make 499,500.',
  hint: '`left = merge_sort(items[:mid])`, `right = merge_sort(items[mid:])`, `return merge(left, right)`. Then `work["comparisons"] = 0`, sort `list(np.random.default_rng(0).integers(0, 10_000, 1000))`, and print the count.',
  solution: `work = {"comparisons": 0}

${MERGE}

def merge_sort(items):
    if len(items) <= 1:
        return list(items)
    mid = len(items) // 2
    left = merge_sort(items[:mid])
    right = merge_sort(items[mid:])
    return merge(left, right)

print(merge_sort([55, 12, 48, 9, 31, 70, 2]))

work["comparisons"] = 0
merge_sort(list(np.random.default_rng(0).integers(0, 10_000, 1000)))
print(work["comparisons"], "comparisons for 1,000 items; selection sort makes 499,500")`,
  check: expect('merge_sort', '[(([55, 12, 48, 9, 31, 70, 2],), [2, 9, 12, 31, 48, 55, 70]), (([],), []), (([1],), [1]), (([3, 3, 1],), [1, 3, 3])]') + `
import random as _rnd
_r = _rnd.Random(28)
for _ in range(10):
    _xs = [_r.randint(0, 99) for _ in range(_r.randint(0, 60))]
    assert merge_sort(_xs) == sorted(_xs), "A random list didn't come out sorted."
work["comparisons"] = 0
merge_sort(list(range(1000, 0, -1)))
assert work["comparisons"] < 20000, "merge_sort should split in half and merge, far under the 499,500 comparisons selection sort makes."`,
},
{
  id: 'al-29', mins: 5,
  title: 'Remember the answers',
  concept: [
    'Some recursive functions ask the same question again and again. How many ways are there up 30 stairs, taking 1 or 2 at a time? `ways(30)` asks `ways(29)` and `ways(28)`, and each of those asks again.',
    'The calls nearly double at each level: over a million calls for 30 stairs. Yet there are only 30 different questions.',
    '**Memoisation** stores each answer in a dict the first time, and looks it up after that. Every question gets worked out once: O(n).',
  ],
  starter: `calls = 0

def ways(n):
    global calls              # lets the function add to calls, which lives outside it
    calls = calls + 1
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)

print(ways(20), "ways, in", calls, "calls")

memo = {}

def fast_ways(n):
    if n <= 1:
        return 1
    # if n is already in memo, return it; otherwise work it out, store it in memo, return it
    return fast_ways(n - 1) + fast_ways(n - 2)`,
  task: 'Finish `fast_ways` with the memo, then print `fast_ways(90)`: an answer the slow version would still be working on next year.',
  hint: '`if n in memo:` / `return memo[n]`. Then `memo[n] = fast_ways(n - 1) + fast_ways(n - 2)` and `return memo[n]`.',
  solution: `calls = 0

def ways(n):
    global calls
    calls = calls + 1
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)

print(ways(20), "ways, in", calls, "calls")

memo = {}

def fast_ways(n):
    if n <= 1:
        return 1
    if n in memo:
        return memo[n]
    memo[n] = fast_ways(n - 1) + fast_ways(n - 2)
    return memo[n]

print(fast_ways(90))`,
  check: `assert callable(globals().get("fast_ways")), "Keep the function called fast_ways."
_a, _b = 1, 1
for _ in range(24):
    _a, _b = _b, _a + _b
assert fast_ways(25) == _b, "fast_ways(25) should give %d." % _b
assert len(memo) >= 20, "fast_ways isn't storing its answers: put each one in memo[n] before returning it."
_a, _b = 1, 1
for _ in range(89):
    _a, _b = _b, _a + _b
assert fast_ways(90) == _b, "fast_ways(90) should give %d." % _b`,
},
{
  id: 'al-30', mins: 5,
  title: 'Every combination',
  concept: [
    'Some questions need every possibility. Which items could you buy that use a £10 voucher exactly?',
    'Each item has two choices: take it or leave it. Recursion walks both branches, item by item, and keeps the baskets that land exactly on the target.',
    'n items make 2ⁿ paths: 20 items is a million. Stopping a branch as soon as it goes over cuts many of them off, which is called **pruning**.',
  ],
  starter: `prices = [4.5, 3.0, 2.5, 6.0, 5.5, 1.0]      # all in steps of 50p, so sums are exact

def exact_baskets(prices, target):
    found = []

    def walk(i, basket, total):
        if total == target:
            found.append(list(basket))
            return
        if i == len(prices) or total > target:
            return
        # take prices[i]: add it to the basket, walk on from i + 1, then take it back out
        # leave prices[i]: walk on from i + 1 without it

    walk(0, [], 0)
    return found

print(exact_baskets(prices, 10.0))`,
  task: 'Fill in the two branches of `walk`. Then set `ways`: how many baskets make exactly £10.',
  hint: '`basket.append(prices[i])`, `walk(i + 1, basket, total + prices[i])`, `basket.pop()`, then `walk(i + 1, basket, total)`. Then `ways = len(exact_baskets(prices, 10.0))`.',
  solution: `prices = [4.5, 3.0, 2.5, 6.0, 5.5, 1.0]

def exact_baskets(prices, target):
    found = []

    def walk(i, basket, total):
        if total == target:
            found.append(list(basket))
            return
        if i == len(prices) or total > target:
            return
        basket.append(prices[i])
        walk(i + 1, basket, total + prices[i])
        basket.pop()
        walk(i + 1, basket, total)

    walk(0, [], 0)
    return found

baskets = exact_baskets(prices, 10.0)
for b in baskets:
    print(b)
ways = len(baskets)
print(ways, "ways to spend exactly 10")`,
  check: `from itertools import combinations as _comb
def _ref(xs, target):
    out = set()
    for _n in range(1, len(xs) + 1):
        for _c in _comb(xs, _n):
            if sum(_c) == target:
                out.add(tuple(sorted(_c)))
    return sorted(out)
assert callable(globals().get("exact_baskets")), "Keep the function called exact_baskets."
for _xs, _t in (([4.5, 3.0, 2.5, 6.0, 5.5, 1.0], 10.0), ([1, 2, 3, 4], 5), ([5, 10], 3), ([1, 2, 3], 6)):
    _got = sorted(tuple(sorted(b)) for b in exact_baskets(list(_xs), _t))
    assert _got == _ref(_xs, _t), "exact_baskets(%r, %r) found %r, but the baskets that add up exactly are %r." % (_xs, _t, _got, _ref(_xs, _t))
assert "ways" in globals() and ways == len(_ref([4.5, 3.0, 2.5, 6.0, 5.5, 1.0], 10.0)), "ways is how many baskets make exactly 10: len(exact_baskets(prices, 10.0))."`,
},

/* ── Graphs, greedy and dynamic programming ────────────── */
{
  id: 'al-31', mins: 4,
  title: 'Places and roads: graphs',
  concept: [
    'A **graph** is a set of places (**nodes**) joined by links (**edges**): cafés and the roads between them, people and who knows whom, web pages and their links.',
    'The handiest way to store one is a dict of lists, each place with its neighbours: an **adjacency list**.',
    'A road goes both ways, so it goes into both places\' lists. `graph.setdefault(a, [])` gives a\'s list, first putting in an empty one if there isn\'t one yet.',
  ],
  starter: `${ROADS}

def build_graph(pairs):
    graph = {}
    for a, b in pairs:
        pass      # add b to a's neighbours, and a to b's
    return graph

graph = build_graph(roads)
print(graph)`,
  task: 'Finish `build_graph` so each place maps to the list of places it has a road to. Then set `most_connected`: the place with the most roads.',
  hint: '`graph.setdefault(a, []).append(b)` and `graph.setdefault(b, []).append(a)`. Then `most_connected = max(graph, key=lambda p: len(graph[p]))`.',
  solution: `${ROADS}

def build_graph(pairs):
    graph = {}
    for a, b in pairs:
        graph.setdefault(a, []).append(b)
        graph.setdefault(b, []).append(a)
    return graph

graph = build_graph(roads)
print(graph)
most_connected = max(graph, key=lambda p: len(graph[p]))
print("most roads:", most_connected)`,
  check: `assert callable(globals().get("build_graph")), "Keep the function called build_graph."
_g = build_graph([("a", "b"), ("b", "c")])
assert isinstance(_g, dict) and {k: sorted(v) for k, v in _g.items()} == {"a": ["b"], "b": ["a", "c"], "c": ["b"]}, "build_graph([('a', 'b'), ('b', 'c')]) gave %r. Each road goes into both places' lists." % (_g,)
assert build_graph([]) == {}, "No roads means an empty dict."
assert "most_connected" in globals() and most_connected == "Campus", "most_connected is the place with the longest list of neighbours: Campus, with 4 roads."`,
},
{
  id: 'al-32', mins: 5,
  title: 'Fewest stops: breadth-first search',
  concept: [
    '**Breadth-first search** (BFS) explores a graph in rings: every place one road away, then every place two away, and so on outwards.',
    'A queue keeps the rings in order, and a set of places already seen stops it going round in circles.',
    'Because it goes ring by ring, the first time it reaches a place is by the fewest roads possible. Each place and road is handled once: O(places + roads).',
  ],
  starter: `from collections import deque

${GRAPH}

def fewest_stops(graph, start, goal):
    seen = {start}
    line = deque([(start, 0)])           # (place, roads taken to get there)
    while line:
        place, dist = line.popleft()
        if place == goal:
            return dist
        # queue each neighbour not seen yet, one road further on, and mark it seen
    return -1                            # there's no way there

print(fewest_stops(graph, "Market", "Airport"))`,
  task: 'Finish the loop so every neighbour not seen before gets marked seen and queued with `dist + 1`. Market to Airport should take 3 roads; the Depot can\'t be reached at all.',
  hint: '`for nxt in graph[place]:` / `if nxt not in seen:` / `seen.add(nxt)` / `line.append((nxt, dist + 1))`.',
  solution: `from collections import deque

${GRAPH}

def fewest_stops(graph, start, goal):
    seen = {start}
    line = deque([(start, 0)])
    while line:
        place, dist = line.popleft()
        if place == goal:
            return dist
        for nxt in graph[place]:
            if nxt not in seen:
                seen.add(nxt)
                line.append((nxt, dist + 1))
    return -1

print(fewest_stops(graph, "Market", "Airport"))
print(fewest_stops(graph, "Market", "Depot"))`,
  check: `assert callable(globals().get("fewest_stops")), "Keep the function called fewest_stops."
for _s, _g, _want in (("Market", "Airport", 3), ("Market", "Market", 0), ("Stadium", "Station", 2), ("Market", "Depot", -1), ("Airport", "Stadium", 2), ("Station", "Harbour", 2), ("Market", "Stadium", 2)):
    _got = fewest_stops(graph, _s, _g)
    assert _got == _want, "fewest_stops(graph, %r, %r) gave %r, but it should give %r." % (_s, _g, _got, _want)`,
},
{
  id: 'al-33', mins: 5,
  title: 'Quickest route: Dijkstra',
  concept: [
    'When roads take different times, the fewest stops isn\'t always quickest. **Dijkstra\'s algorithm** always carries on from whichever place is currently closest to the start.',
    'A heap hands over that closest place in O(log n). When a place comes off the heap, its time is final: nothing still waiting could reach it any sooner.',
    'From there, it offers each neighbour "my time plus this road". A neighbour keeps the offer only if it beats the best it had.',
  ],
  starter: `import heapq

${TIMED}

def quickest(graph, start, goal):
    best = {start: 0}
    heap = [(0, start)]
    while heap:
        time, place = heapq.heappop(heap)
        if place == goal:
            return time
        if time > best.get(place, float("inf")):
            continue                     # an old, slower entry for this place: skip it
        # for each (nxt, minutes): if time + minutes beats best.get(nxt, inf),
        # record it in best and push (time + minutes, nxt) onto the heap
    return -1

print(quickest(timed, "Market", "Harbour"))`,
  task: 'Finish the neighbour loop. The direct road from Market to Harbour takes 15 minutes, but going round by Station and Campus takes 4 + 5 + 3 = 12: more stops, less time. `quickest` should find the 12.',
  hint: '`for nxt, minutes in graph[place]:` / `new = time + minutes` / `if new < best.get(nxt, float("inf")):` / `best[nxt] = new` / `heapq.heappush(heap, (new, nxt))`.',
  solution: `import heapq

${TIMED}

def quickest(graph, start, goal):
    best = {start: 0}
    heap = [(0, start)]
    while heap:
        time, place = heapq.heappop(heap)
        if place == goal:
            return time
        if time > best.get(place, float("inf")):
            continue
        for nxt, minutes in graph[place]:
            new = time + minutes
            if new < best.get(nxt, float("inf")):
                best[nxt] = new
                heapq.heappush(heap, (new, nxt))
    return -1

print(quickest(timed, "Market", "Harbour"))
print(quickest(timed, "Market", "Depot"))`,
  check: `assert callable(globals().get("quickest")), "Keep the function called quickest."
_roads = {"a": [("b", 1), ("c", 10)], "b": [("a", 1), ("c", 2)], "c": [("a", 10), ("b", 2), ("d", 1)], "d": [("c", 1)], "e": []}
for _gr, _s, _g, _want in ((timed, "Market", "Harbour", 12), (timed, "Market", "Airport", 18), (timed, "Market", "Stadium", 18), (timed, "Stadium", "Station", 14),
                           (timed, "Market", "Market", 0), (timed, "Market", "Depot", -1), (_roads, "a", "c", 3), (_roads, "a", "d", 4), (_roads, "a", "e", -1)):
    _got = quickest(_gr, _s, _g)
    assert _got == _want, "quickest(%s, %r, %r) gave %r, but it should give %r." % ("timed" if _gr is timed else "graph", _s, _g, _got, _want)`,
},
{
  id: 'al-34', mins: 4,
  title: 'Greedy: change at the till',
  concept: [
    'A **greedy** algorithm makes whatever choice looks best right now, and never looks back. For change, that means: always hand over the biggest coin that still fits.',
    'With pounds and pence (200, 100, 50, 20, 10, 5, 2 and 1) greedy always gives the fewest coins. It is quick and simple, which is its charm.',
    'But "best right now" isn\'t always best overall. The next lesson breaks it.',
  ],
  starter: `COINS = [200, 100, 50, 20, 10, 5, 2, 1]        # in pence

def greedy_change(amount, coins=COINS):
    given = []
    for coin in coins:                 # biggest first
        pass      # while this coin still fits: give it, and take it off the amount
    return given

print(greedy_change(386))`,
  task: 'Finish `greedy_change` so it returns the coins handed over, biggest first.',
  hint: 'Replace `pass` with `while amount >= coin:` / `given.append(coin)` / `amount = amount - coin`.',
  solution: `COINS = [200, 100, 50, 20, 10, 5, 2, 1]

def greedy_change(amount, coins=COINS):
    given = []
    for coin in coins:
        while amount >= coin:
            given.append(coin)
            amount = amount - coin
    return given

print(greedy_change(386))
print(greedy_change(6, [4, 3, 1]))`,
  check: expect('greedy_change', '[((386,), [200, 100, 50, 20, 10, 5, 1]), ((0,), []), ((4,), [2, 2]), ((99,), [50, 20, 20, 5, 2, 2]), ((6, [4, 3, 1]), [4, 1, 1])]'),
},
{
  id: 'al-35', mins: 5,
  title: 'When greedy fails: dynamic programming',
  concept: [
    'A café abroad has coins of 1, 3 and 4. For 6, greedy gives 4 + 1 + 1: three coins. But 3 + 3 is only two. Grabbing the biggest coin first was a trap.',
    '**Dynamic programming** builds the answer from smaller answers: the fewest coins for every amount from 0 up. For each amount, try each coin as the last one, and take the best of "the fewest for what\'s left, plus this coin".',
    'Each amount is worked out once, from answers already known: O(amount × coins). It is memoisation, built bottom-up in a list instead of top-down with recursion.',
  ],
  starter: `def fewest_coins(coins, amount):
    INF = float("inf")
    best = [0] + [INF] * amount          # best[a]: the fewest coins that make a; 0 needs none
    for a in range(1, amount + 1):
        for coin in coins:
            pass      # if coin fits in a, maybe best[a - coin] + 1 beats best[a]
    return best[amount] if best[amount] != INF else -1

print(fewest_coins([1, 3, 4], 6))`,
  task: 'Finish the inner loop. `fewest_coins([1, 3, 4], 6)` should give 2, and an amount that can\'t be made at all gives -1.',
  hint: 'Replace `pass` with `if coin <= a and best[a - coin] + 1 < best[a]:` / `best[a] = best[a - coin] + 1`.',
  solution: `def fewest_coins(coins, amount):
    INF = float("inf")
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a and best[a - coin] + 1 < best[a]:
                best[a] = best[a - coin] + 1
    return best[amount] if best[amount] != INF else -1

print(fewest_coins([1, 3, 4], 6))
print(fewest_coins([200, 100, 50, 20, 10, 5, 2, 1], 386))`,
  check: expect('fewest_coins', '[(([1, 3, 4], 6), 2), (([1, 3, 4], 0), 0), (([2], 3), -1), (([200, 100, 50, 20, 10, 5, 2, 1], 386), 7), (([5, 10], 3), -1), (([1, 5, 6, 9], 11), 2), (([3, 7], 20), 4)]'),
},
];
