/* Algorithm practice problems, alg01 to alg15. Same format as problems.js:
   setup defines _ref, _example and _cases; alt answers must be accepted and
   wrong answers rejected by the hidden cases (tests.html checks both).
   Every one is original, set in the café, and tagged "algorithms", which
   is what the Practice screen's Algorithms chip filters on.

   Pure Python: the answers are values and lists, so mode is scalar or list.
   Big cases stay small enough that a slower but correct alt still passes
   well inside the time limit; the traps are about correctness. */

export const ALGO_PROBLEMS = [

/* ── Easy ──────────────────────────────────────────────── */
{
  id: 'alg01', difficulty: 'easy', tags: ['algorithms', 'strings', 'two pointers'],
  title: 'Same backwards',
  prompt: [
    'An order code reads the same backwards if, ignoring capitals and anything that isn\'t a letter or a digit, it spells the same both ways. `"Tab-4-bat"` does.',
    'Return `True` or `False` for the string `code`.',
  ],
  notes: ['An empty code counts as reading the same both ways.'],
  stub: 'def solution(code):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(code):
    s = [c.lower() for c in code if c.isalnum()]
    return s == s[::-1]

def _example():
    return ("Tab-4-bat",)

def _cases():
    return [_example(), ("",), ("a",), ("Latte",), ("Was it a cat I saw?",), ("ab",),
            ("A1b1a",), ("12-21",), ("never odd or even",), ("abca",), ("No lemon, no melon",)]
`,
  hint: 'Keep only the letters and digits, in lower case, then compare the result with its reverse: `s[::-1]` reverses a list or a string.',
  solution: 'def solution(code):\n    s = [c.lower() for c in code if c.isalnum()]\n    return s == s[::-1]\n',
  alt: [
    'def solution(code):\n    i, j = 0, len(code) - 1\n    while i < j:\n        if not code[i].isalnum():\n            i += 1\n        elif not code[j].isalnum():\n            j -= 1\n        elif code[i].lower() != code[j].lower():\n            return False\n        else:\n            i += 1\n            j -= 1\n    return True\n',
  ],
  wrong: [
    'def solution(code):\n    s = [c for c in code if c.isalnum()]\n    return s == s[::-1]\n',
    'def solution(code):\n    s = code.lower()\n    return s == s[::-1]\n',
  ],
},
{
  id: 'alg02', difficulty: 'easy', tags: ['algorithms', 'running totals'],
  title: 'Running tab',
  prompt: [
    'A customer\'s tab gets a list of `amounts` as the evening goes on. A refund is negative.',
    'Return a list of the same length, where each entry is the tab so far: that amount plus everything before it.',
  ],
  notes: ['An empty list gives an empty list.', 'Adding everything up again for each position works, but one pass is enough.'],
  stub: 'def solution(amounts):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(amounts):
    out, total = [], 0
    for a in amounts:
        total += a
        out.append(total)
    return out

def _example():
    return ([4.5, 3.0, -1.5, 6.0],)

def _cases():
    return [_example(), ([],), ([10],), ([1] * 50,), ([5, -5, 5, -5],), (list(range(1, 201)),)]
`,
  hint: 'Keep a running `total`, starting at 0. For each amount, add it on and append the total so far.',
  solution: 'def solution(amounts):\n    out, total = [], 0\n    for a in amounts:\n        total += a\n        out.append(total)\n    return out\n',
  alt: [
    'from itertools import accumulate\n\ndef solution(amounts):\n    return list(accumulate(amounts))\n',
    'def solution(amounts):\n    return [sum(amounts[:i + 1]) for i in range(len(amounts))]\n',
  ],
  wrong: [
    'def solution(amounts):\n    return [sum(amounts[:i]) for i in range(len(amounts))]\n',
    'def solution(amounts):\n    return [sum(amounts)] * len(amounts)\n',
  ],
},
{
  id: 'alg03', difficulty: 'easy', tags: ['algorithms', 'sets'],
  title: 'First to come back',
  prompt: [
    '`visits` lists customer names in the order they walked in today.',
    'Return the first name to walk in for a **second** time, or `None` if nobody came back.',
  ],
  notes: ['"First" means the earliest second visit. In `["Ada", "Kofi", "Kofi", "Ada"]` it is Kofi, whose second visit comes before Ada\'s.'],
  stub: 'def solution(visits):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(visits):
    seen = set()
    for v in visits:
        if v in seen:
            return v
        seen.add(v)
    return None

def _example():
    return (["Ada", "Kofi", "Zola", "Kofi", "Ada"],)

def _cases():
    many = ["guest%d" % i for i in range(1500)]
    return [_example(), (["Ada", "Kofi", "Kofi", "Ada"],), ([],), (["Ada"],), (["Ada", "Kofi", "Zola"],),
            (["Ada", "Ada"],), (many + ["guest700"],), (many,)]
`,
  hint: 'Keep a set of the names seen so far. The first name that is already in it is the answer.',
  solution: 'def solution(visits):\n    seen = set()\n    for v in visits:\n        if v in seen:\n            return v\n        seen.add(v)\n    return None\n',
  alt: [
    'def solution(visits):\n    seen = []\n    for v in visits:\n        if v in seen:\n            return v\n        seen.append(v)\n    return None\n',
  ],
  wrong: [
    'def solution(visits):\n    for v in visits:\n        if visits.count(v) > 1:\n            return v\n    return None\n',
    'def solution(visits):\n    seen = set()\n    for v in visits:\n        seen.add(v)\n        if v in seen:\n            return v\n    return None\n',
  ],
},
{
  id: 'alg04', difficulty: 'easy', tags: ['algorithms', 'arithmetic'],
  title: 'The missing ticket',
  prompt: [
    'The café hands out tickets numbered from 1 to n. `tickets` holds every number from 1 to n except one, in any order.',
    'Return the missing number.',
  ],
  notes: ['n is one more than the length of the list, so the missing one can be 1, or n itself.', 'It can be done without sorting: what should 1 to n add up to?'],
  stub: 'def solution(tickets):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(tickets):
    n = len(tickets) + 1
    return n * (n + 1) // 2 - sum(tickets)

def _example():
    return ([3, 1, 5, 2],)

def _cases():
    r = np.random.default_rng(4)
    a = [int(x) for x in r.permutation(np.arange(1, 1001)) if x != 637]
    b = [int(x) for x in r.permutation(np.arange(2, 501))]
    return [_example(), ([],), ([1],), ([2],), (a,), (b,), (list(range(1, 1000)),)]
`,
  hint: 'Every number from 1 to n adds up to `n * (n + 1) // 2`. Take away what the list does add up to.',
  solution: 'def solution(tickets):\n    n = len(tickets) + 1\n    return n * (n + 1) // 2 - sum(tickets)\n',
  alt: [
    'def solution(tickets):\n    return (set(range(1, len(tickets) + 2)) - set(tickets)).pop()\n',
  ],
  wrong: [
    'def solution(tickets):\n    return max(tickets) + 1 if tickets else 1\n',
    'def solution(tickets):\n    s = sorted(tickets)\n    for i in range(len(s) - 1):\n        if s[i + 1] != s[i] + 1:\n            return s[i] + 1\n',
  ],
},
{
  id: 'alg05', difficulty: 'easy', tags: ['algorithms', 'merging', 'two pointers'],
  title: 'Merge two queues',
  prompt: [
    '`a` and `b` are the times, in minutes after opening, that customers joined two queues. Each list is already sorted.',
    'Return one sorted list of all the times. Try it by walking along both lists together, rather than sorting again.',
  ],
  notes: ['Either list can be empty.', 'Equal times from both lists both stay.'],
  stub: 'def solution(a, b):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(a, b):
    return sorted(a + b)

def _example():
    return ([2, 9, 15], [4, 9, 20, 31])

def _cases():
    return [_example(), ([], [1, 2]), ([1, 2], []), ([], []), ([5, 5], [5]),
            ([1, 2, 3], [10, 20]), ([10, 20], [1, 2, 3]), (list(range(0, 400, 2)), list(range(1, 400, 3)))]
`,
  hint: 'Keep a position in each list. Take the smaller front item, move past it, and when one list runs out, add what is left of the other.',
  solution: 'def solution(a, b):\n    out, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            j += 1\n    return out + a[i:] + b[j:]\n',
  alt: ['def solution(a, b):\n    return sorted(a + b)\n'],
  wrong: [
    'def solution(a, b):\n    return a + b\n',
    'def solution(a, b):\n    out, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            j += 1\n    return out\n',
  ],
},

/* ── Medium ────────────────────────────────────────────── */
{
  id: 'alg06', difficulty: 'medium', tags: ['algorithms', 'hash maps', 'counting'],
  title: 'Pairs for the voucher',
  prompt: [
    '`prices` lists what each item costs, in pence. How many **pairs** of different items add up to exactly `voucher` pence?',
    'Two items with the same price are still different items, so every pair of positions counts once.',
  ],
  notes: ['`[100, 100, 100]` with a voucher of 200 has 3 pairs.', 'One pass with a dict of how many of each price you have seen beats a loop inside a loop.'],
  stub: 'def solution(prices, voucher):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(prices, voucher):
    seen, pairs = {}, 0
    for p in prices:
        pairs += seen.get(voucher - p, 0)
        seen[p] = seen.get(p, 0) + 1
    return pairs

def _example():
    return ([150, 250, 100, 300, 250], 400)

def _cases():
    r = np.random.default_rng(6)
    big = [int(x) * 50 for x in r.integers(0, 11, 300)]
    return [_example(), ([100, 100, 100], 200), ([], 50), ([200], 400), ([200, 200], 400),
            ([0, 0, 500], 500), (big, 500)]
`,
  hint: 'Walk the prices once. For each price, the pairs it completes is how many times you have already seen `voucher - price`. Then count this price in.',
  solution: 'def solution(prices, voucher):\n    seen, pairs = {}, 0\n    for p in prices:\n        pairs += seen.get(voucher - p, 0)\n        seen[p] = seen.get(p, 0) + 1\n    return pairs\n',
  alt: [
    'def solution(prices, voucher):\n    count = 0\n    for i in range(len(prices)):\n        for j in range(i + 1, len(prices)):\n            if prices[i] + prices[j] == voucher:\n                count += 1\n    return count\n',
  ],
  wrong: [
    'def solution(prices, voucher):\n    s = set(prices)\n    return sum(1 for p in s if voucher - p in s and p < voucher - p)\n',
    'def solution(prices, voucher):\n    count = 0\n    for i in range(len(prices)):\n        for j in range(len(prices)):\n            if i != j and prices[i] + prices[j] == voucher:\n                count += 1\n    return count\n',
  ],
},
{
  id: 'alg07', difficulty: 'medium', tags: ['algorithms', 'sliding window'],
  title: 'Longest stretch without a repeat',
  prompt: [
    '`drinks` lists what one regular ordered, day by day.',
    'Return the length of the longest run of **consecutive** days in which no drink was ordered twice.',
  ],
  notes: ['An empty list gives 0.', 'Keep a window of days with no repeats. When a repeat comes in, move the window\'s start just past the earlier copy, but never backwards.'],
  stub: 'def solution(drinks):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(drinks):
    last, start, best = {}, 0, 0
    for i, d in enumerate(drinks):
        if d in last and last[d] >= start:
            start = last[d] + 1
        last[d] = i
        best = max(best, i - start + 1)
    return best

def _example():
    return (["latte", "tea", "mocha", "tea", "latte", "chai"],)

def _cases():
    r = np.random.default_rng(7)
    kinds = ["latte", "tea", "mocha", "chai", "espresso", "cocoa", "flat white", "juice"]
    big = [kinds[int(i)] for i in r.integers(0, 8, 300)]
    return [_example(), ([],), (["tea"],), (["tea", "tea", "tea"],), (["a", "b", "c", "a", "b", "c", "d"],),
            (["a", "b", "b", "a"],), (["a", "b", "c", "b", "a", "d", "e"],),
            (["tea", "latte", "tea", "mocha", "tea", "chai", "tea"],), (big,)]
`,
  hint: 'Remember the last day each drink was seen. If this drink was last seen inside the current window, the window has to start the day after it.',
  solution: 'def solution(drinks):\n    last, start, best = {}, 0, 0\n    for i, d in enumerate(drinks):\n        if d in last and last[d] >= start:\n            start = last[d] + 1\n        last[d] = i\n        best = max(best, i - start + 1)\n    return best\n',
  alt: [
    'def solution(drinks):\n    best = 0\n    for s in range(len(drinks)):\n        seen = set()\n        for d in drinks[s:]:\n            if d in seen:\n                break\n            seen.add(d)\n        best = max(best, len(seen))\n    return best\n',
  ],
  wrong: [
    'def solution(drinks):\n    last, start, best = {}, 0, 0\n    for i, d in enumerate(drinks):\n        if d in last:\n            start = last[d] + 1\n        last[d] = i\n        best = max(best, i - start + 1)\n    return best\n',
    'def solution(drinks):\n    return len(set(drinks))\n',
  ],
},
{
  id: 'alg08', difficulty: 'medium', tags: ['algorithms', 'sliding window'],
  title: 'Busiest few hours',
  prompt: [
    '`cups` holds the cups sold in each hour of a day, in order. The café wants an extra barista on for `k` hours in a row.',
    'Return the most cups sold in any `k` consecutive hours.',
  ],
  notes: ['With fewer than k hours, return the total of them all.', 'Slide a window along: add the hour coming in and take off the hour going out.'],
  stub: 'def solution(cups, k):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(cups, k):
    if len(cups) <= k:
        return sum(cups)
    window = sum(cups[:k])
    best = window
    for i in range(k, len(cups)):
        window += cups[i] - cups[i - k]
        best = max(best, window)
    return best

def _example():
    return ([12, 30, 45, 41, 20, 8, 35, 50], 3)

def _cases():
    r = np.random.default_rng(8)
    day = [int(x) for x in r.integers(0, 60, 24)]
    return [_example(), ([5, 1, 3], 5), ([], 2), ([7], 1), ([3, 3, 3, 3], 2),
            ([1, 1, 1, 9, 9], 2), ([9, 9, 1, 1], 2), (day, 4)]
`,
  hint: 'Add up the first k hours. Then for each next hour, add it and take away the hour that has just dropped out, keeping the best total seen.',
  solution: 'def solution(cups, k):\n    if len(cups) <= k:\n        return sum(cups)\n    window = sum(cups[:k])\n    best = window\n    for i in range(k, len(cups)):\n        window += cups[i] - cups[i - k]\n        best = max(best, window)\n    return best\n',
  alt: [
    'def solution(cups, k):\n    if len(cups) <= k:\n        return sum(cups)\n    return max(sum(cups[i:i + k]) for i in range(len(cups) - k + 1))\n',
  ],
  wrong: [
    'def solution(cups, k):\n    if len(cups) <= k:\n        return sum(cups)\n    return max(sum(cups[i:i + k]) for i in range(len(cups) - k))\n',
    'def solution(cups, k):\n    return sum(sorted(cups, reverse=True)[:k])\n',
  ],
},
{
  id: 'alg09', difficulty: 'medium', tags: ['algorithms', 'stacks'],
  title: 'Undo at the till',
  prompt: [
    'The till gets a list of `commands`. `"add 350"` adds 350 pence. `"undo"` cancels the most recent add that is still standing. `"clear"` wipes the whole bill.',
    'Return the total, in pence, after all the commands. An undo with nothing left to undo does nothing.',
  ],
  notes: ['After a clear there is nothing to undo.', 'Two undos in a row cancel the last two adds.'],
  stub: 'def solution(commands):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(commands):
    stack = []
    for c in commands:
        if c.startswith("add "):
            stack.append(int(c[4:]))
        elif c == "undo":
            if stack:
                stack.pop()
        elif c == "clear":
            stack = []
    return sum(stack)

def _example():
    return (["add 350", "add 200", "undo", "add 450"],)

def _cases():
    r = np.random.default_rng(9)
    long = []
    for _ in range(300):
        pick = int(r.integers(0, 10))
        long.append("undo" if pick < 3 else "clear" if pick == 3 else "add %d" % int(r.integers(1, 900)))
    return [_example(), ([],), (["undo"],), (["add 100", "add 200", "undo", "undo"],),
            (["add 100", "add 200", "undo", "undo", "undo"],), (["add 100", "clear", "undo", "add 50"],),
            (["add 5", "add 6", "undo", "add 7", "undo", "undo"],), (long,)]
`,
  hint: 'Keep the standing adds on a stack (a list). add pushes, undo pops if there is anything, clear empties it. The total is the sum of the stack.',
  solution: 'def solution(commands):\n    stack = []\n    for c in commands:\n        if c.startswith("add "):\n            stack.append(int(c[4:]))\n        elif c == "undo":\n            if stack:\n                stack.pop()\n        elif c == "clear":\n            stack = []\n    return sum(stack)\n',
  alt: [
    'def solution(commands):\n    stack, total = [], 0\n    for c in commands:\n        if c.startswith("add "):\n            n = int(c.split()[1])\n            stack.append(n)\n            total += n\n        elif c == "undo" and stack:\n            total -= stack.pop()\n        elif c == "clear":\n            stack, total = [], 0\n    return total\n',
  ],
  wrong: [
    'def solution(commands):\n    total, last = 0, 0\n    for c in commands:\n        if c.startswith("add "):\n            last = int(c[4:])\n            total += last\n        elif c == "undo":\n            total -= last\n            last = 0\n        elif c == "clear":\n            total = 0\n    return total\n',
    'def solution(commands):\n    stack, total = [], 0\n    for c in commands:\n        if c.startswith("add "):\n            stack.append(int(c[4:]))\n            total += int(c[4:])\n        elif c == "undo":\n            if stack:\n                total -= stack.pop()\n        elif c == "clear":\n            total = 0\n    return total\n',
  ],
},
{
  id: 'alg10', difficulty: 'medium', tags: ['algorithms', 'stacks'],
  title: 'Days until a busier day',
  prompt: [
    '`cups` holds the cups sold each day.',
    'Return a list: for each day, how many days until a day with **more** cups, or 0 if none comes.',
  ],
  notes: ['Two loops, one inside the other, work but slow down on long lists. A stack of the days still waiting for a busier one does it in a single pass.'],
  stub: 'def solution(cups):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(cups):
    out = [0] * len(cups)
    waiting = []
    for i, c in enumerate(cups):
        while waiting and cups[waiting[-1]] < c:
            j = waiting.pop()
            out[j] = i - j
        waiting.append(i)
    return out

def _example():
    return ([30, 28, 35, 31, 29, 40, 22],)

def _cases():
    r = np.random.default_rng(10)
    big = [int(x) for x in r.integers(0, 100, 800)]
    return [_example(), ([],), ([5],), ([5, 5, 5],), ([1, 2, 3],), ([3, 2, 1],), ([2, 1, 1, 3],), (big,)]
`,
  hint: 'Keep a stack of positions still waiting. For each new day, pop every waiting day with fewer cups: it has found its busier day. Then push today.',
  solution: 'def solution(cups):\n    out = [0] * len(cups)\n    waiting = []\n    for i, c in enumerate(cups):\n        while waiting and cups[waiting[-1]] < c:\n            j = waiting.pop()\n            out[j] = i - j\n        waiting.append(i)\n    return out\n',
  alt: [
    'def solution(cups):\n    out = []\n    for i in range(len(cups)):\n        wait = 0\n        for j in range(i + 1, len(cups)):\n            if cups[j] > cups[i]:\n                wait = j - i\n                break\n        out.append(wait)\n    return out\n',
  ],
  wrong: [
    'def solution(cups):\n    out = []\n    for i in range(len(cups)):\n        wait = 0\n        for j in range(i + 1, len(cups)):\n            if cups[j] >= cups[i]:\n                wait = j - i\n                break\n        out.append(wait)\n    return out\n',
    'def solution(cups):\n    return [1 if i + 1 < len(cups) and cups[i + 1] > cups[i] else 0 for i in range(len(cups))]\n',
  ],
},
{
  id: 'alg11', difficulty: 'medium', tags: ['algorithms', 'binary search'],
  title: 'First day over target',
  prompt: [
    '`running` holds the café\'s takings so far at the end of each day of the year. It never goes down, since takings only add up.',
    'Return the first day (its position in the list) on which the running total reached at least `target`, or -1 if it never did.',
  ],
  notes: ['The list is sorted, so there is no need to look at every day: halve.', 'Several days can share a total; you want the first of them.'],
  stub: 'def solution(running, target):\n    pass\n',
  mode: 'scalar',
  setup: `
from bisect import bisect_left as _bl

def _ref(running, target):
    i = _bl(running, target)
    return i if i < len(running) else -1

def _example():
    return ([120, 250, 250, 410, 600, 780], 400)

def _cases():
    r = np.random.default_rng(11)
    year = [int(x) for x in np.cumsum(r.integers(0, 300, 365))]
    ex = [120, 250, 250, 410, 600, 780]
    return [_example(), (ex, 250), (ex, 1000), (ex, 0), (ex, 780), ([], 5),
            (year, year[200]), (year, year[-1] + 1), (year, year[0])]
`,
  hint: 'Binary search for a lower bound: keep `low` and `high`, and when the middle day has reached the target, keep it as a candidate and look left. Or use `bisect_left`.',
  solution: 'from bisect import bisect_left\n\ndef solution(running, target):\n    i = bisect_left(running, target)\n    return i if i < len(running) else -1\n',
  alt: [
    'def solution(running, target):\n    for i, r in enumerate(running):\n        if r >= target:\n            return i\n    return -1\n',
    'def solution(running, target):\n    low, high = 0, len(running)\n    while low < high:\n        mid = (low + high) // 2\n        if running[mid] >= target:\n            high = mid\n        else:\n            low = mid + 1\n    return low if low < len(running) else -1\n',
  ],
  wrong: [
    'from bisect import bisect_right\n\ndef solution(running, target):\n    i = bisect_right(running, target)\n    return i if i < len(running) else -1\n',
    'from bisect import bisect_left\n\ndef solution(running, target):\n    return bisect_left(running, target)\n',
  ],
},

/* ── Hard ──────────────────────────────────────────────── */
{
  id: 'alg12', difficulty: 'hard', tags: ['algorithms', 'dynamic programming'],
  title: 'Ways to make the change',
  prompt: [
    'The till holds as many coins of each value in `coins` (in pence) as it needs. In how many different ways can it make exactly `amount`?',
    'Only which coins you use counts, not their order: 2 + 1 and 1 + 2 are the same way.',
  ],
  notes: ['Making 0 has exactly one way: no coins at all.', 'Take the coins one kind at a time, and build up the number of ways for every amount from 0.'],
  stub: 'def solution(coins, amount):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(coins, amount):
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]

def _example():
    return ([1, 2, 5], 5)

def _cases():
    return [_example(), ([2], 3), ([1, 2, 5], 0), ([10], 10), ([1, 2, 5, 10, 20, 50, 100, 200], 200),
            ([3, 5, 7], 12), ([5, 10], 3), ([2, 3], 7)]
`,
  hint: 'A list `ways`, with `ways[0] = 1`. For each coin, go through the amounts from that coin upwards, adding `ways[a - coin]` to `ways[a]`. Coins on the outside loop is what stops orders counting twice.',
  solution: 'def solution(coins, amount):\n    ways = [1] + [0] * amount\n    for c in coins:\n        for a in range(c, amount + 1):\n            ways[a] += ways[a - c]\n    return ways[amount]\n',
  alt: [
    'from functools import lru_cache\n\ndef solution(coins, amount):\n    coins = sorted(coins)\n\n    @lru_cache(maxsize=None)\n    def count(i, left):\n        if left == 0:\n            return 1\n        if i == len(coins) or left < 0:\n            return 0\n        return count(i, left - coins[i]) + count(i + 1, left)\n\n    return count(0, amount)\n',
  ],
  wrong: [
    'def solution(coins, amount):\n    ways = [1] + [0] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                ways[a] += ways[a - c]\n    return ways[amount]\n',
    'def solution(coins, amount):\n    return sum(1 for c in coins if amount % c == 0)\n',
  ],
},
{
  id: 'alg13', difficulty: 'hard', tags: ['algorithms', 'dynamic programming'],
  title: 'The delivery bag',
  prompt: [
    'A courier\'s bag holds at most `capacity` kilograms. Each parcel has a weight in `weights` and a value in `values`, at the same positions. A parcel goes in whole, or not at all.',
    'Return the biggest total value that fits.',
  ],
  notes: ['Picking by value per kilo can be fooled. Try it on paper first.', 'Build the best value for every capacity from 0 up, taking each parcel at most once.'],
  stub: 'def solution(weights, values, capacity):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(weights, values, capacity):
    best = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return best[capacity]

def _example():
    return ([1, 3, 4, 5], [15, 50, 60, 90], 8)

def _cases():
    r = np.random.default_rng(13)
    ws = [int(x) for x in r.integers(1, 15, 25)]
    vs = [int(x) for x in r.integers(5, 100, 25)]
    return [_example(), ([], [], 10), ([5], [10], 4), ([5], [10], 5), ([5], [10], 10),
            ([6, 5, 5], [30, 20, 20], 10), (ws, vs, 50)]
`,
  hint: 'A list `best` of length `capacity + 1`, all 0. For each parcel, go through the capacities from the top down to its weight: `best[c] = max(best[c], best[c - w] + v)`. Going downwards is what stops one parcel being used twice.',
  solution: 'def solution(weights, values, capacity):\n    best = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for c in range(capacity, w - 1, -1):\n            best[c] = max(best[c], best[c - w] + v)\n    return best[capacity]\n',
  alt: [
    'def solution(weights, values, capacity):\n    n = len(weights)\n    table = [[0] * (capacity + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        w, v = weights[i - 1], values[i - 1]\n        for c in range(capacity + 1):\n            table[i][c] = table[i - 1][c]\n            if w <= c:\n                table[i][c] = max(table[i][c], table[i - 1][c - w] + v)\n    return table[n][capacity]\n',
  ],
  wrong: [
    'def solution(weights, values, capacity):\n    total = 0\n    for w, v in sorted(zip(weights, values), key=lambda p: p[1] / p[0], reverse=True):\n        if w <= capacity:\n            capacity -= w\n            total += v\n    return total\n',
    'def solution(weights, values, capacity):\n    best = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for c in range(w, capacity + 1):\n            best[c] = max(best[c], best[c - w] + v)\n    return best[capacity]\n',
  ],
},
{
  id: 'alg14', difficulty: 'hard', tags: ['algorithms', 'graphs', 'breadth-first search'],
  title: 'Through the kitchen',
  prompt: [
    'The kitchen is a grid, given as a list of strings, one per row. `.` is floor, `#` is a counter you can\'t walk through, `S` is where you start and `E` is the way out.',
    'One square up, down, left or right is one step. Return the fewest steps from S to E, or -1 if there is no way through.',
  ],
  notes: ['No diagonal moves.', 'Breadth-first search finds the fewest steps: every square one step away first, then two, and so on.'],
  stub: 'def solution(grid):\n    pass\n',
  mode: 'scalar',
  setup: `
from collections import deque as _dq

def _ref(grid):
    rows, cols = len(grid), len(grid[0])
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
    seen = {start}
    line = _dq([(start, 0)])
    while line:
        (r, c), d = line.popleft()
        if grid[r][c] == "E":
            return d
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc))
                line.append(((nr, nc), d + 1))
    return -1

def _example():
    return (["S.#.", "..#E", "...."],)

def _cases():
    r = np.random.default_rng(14)
    rows = []
    for i in range(12):
        rows.append("".join("#" if r.random() < 0.25 else "." for _ in range(12)))
    rows[0] = "S" + rows[0][1:]
    rows[11] = rows[11][:11] + "E"
    return [_example(), (["S#E"],), (["SE"],), (["S..", "E..", "..."],), (["S.#", "###", "..E"],),
            (["S....", ".###.", ".#E#.", ".#.#.", "....."],), (rows,)]
`,
  hint: 'Find S. Keep a queue of (square, steps) and a set of squares seen. Take from the front; if it is E, that is the answer; otherwise queue each open neighbour you haven\'t seen, one step further.',
  solution: 'from collections import deque\n\ndef solution(grid):\n    rows, cols = len(grid), len(grid[0])\n    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")\n    seen = {start}\n    line = deque([(start, 0)])\n    while line:\n        (r, c), d = line.popleft()\n        if grid[r][c] == "E":\n            return d\n        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                line.append(((nr, nc), d + 1))\n    return -1\n',
  alt: [
    'def solution(grid):\n    rows, cols = len(grid), len(grid[0])\n    frontier = [(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S"]\n    seen = set(frontier)\n    steps = 0\n    while frontier:\n        nxt = []\n        for r, c in frontier:\n            if grid[r][c] == "E":\n                return steps\n            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:\n                    seen.add((nr, nc))\n                    nxt.append((nr, nc))\n        frontier = nxt\n        steps += 1\n    return -1\n',
  ],
  wrong: [
    'def solution(grid):\n    rows, cols = len(grid), len(grid[0])\n    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")\n    seen = set()\n\n    def walk(r, c, d):\n        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == "#" or (r, c) in seen:\n            return -1\n        if grid[r][c] == "E":\n            return d\n        seen.add((r, c))\n        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):\n            got = walk(r + dr, c + dc, d + 1)\n            if got != -1:\n                return got\n        return -1\n\n    return walk(start[0], start[1], 0)\n',
    'def solution(grid):\n    rows, cols = len(grid), len(grid[0])\n    sr, sc = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")\n    er, ec = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "E")\n    return abs(sr - er) + abs(sc - ec)\n',
  ],
},
{
  id: 'alg15', difficulty: 'hard', tags: ['algorithms', 'graphs', 'topological sort'],
  title: 'Order of the recipe steps',
  prompt: [
    'A recipe has `steps`, each a name, and `rules`: pairs `(a, b)` meaning step a has to be done before step b.',
    'Return the steps in an order that obeys every rule. When more than one step could go next, take the one that comes first alphabetically. If the rules go round in a circle, no order works: return an empty list.',
  ],
  notes: ['A step can go next once every step it waits for is done.', 'A heap always hands you the alphabetically first of the steps that are ready.'],
  stub: 'def solution(steps, rules):\n    pass\n',
  mode: 'list',
  setup: `
import heapq as _hq

def _ref(steps, rules):
    waiting = {s: 0 for s in steps}
    after = {s: [] for s in steps}
    for a, b in rules:
        after[a].append(b)
        waiting[b] += 1
    ready = [s for s in steps if waiting[s] == 0]
    _hq.heapify(ready)
    out = []
    while ready:
        s = _hq.heappop(ready)
        out.append(s)
        for t in after[s]:
            waiting[t] -= 1
            if waiting[t] == 0:
                _hq.heappush(ready, t)
    return out if len(out) == len(steps) else []

def _example():
    return (["grind", "boil", "brew", "pour", "warm cup"],
            [("grind", "brew"), ("boil", "brew"), ("brew", "pour"), ("warm cup", "pour")])

def _cases():
    names = ["s%02d" % i for i in range(30)]
    r = np.random.default_rng(15)
    rules = []
    for _ in range(45):
        a, b = sorted(int(x) for x in r.choice(30, 2, replace=False))
        rules.append((names[b], names[a]) if r.random() < 0.5 else (names[a], names[b]))
    dag = [(names[min(names.index(a), names.index(b))], names[max(names.index(a), names.index(b))]) for a, b in rules]
    return [_example(), (["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")]), (["c", "a", "b"], []), ([], []),
            (["milk", "froth", "pour"], [("milk", "froth"), ("froth", "pour")]),
            (["d", "b", "a", "c"], [("a", "d"), ("b", "d"), ("c", "d")]), (names[::-1], dag)]
`,
  hint: 'Count, for each step, how many steps it still waits for. Put every step with none into a heap. Pop the first, add it to the answer, and knock one off the count of each step after it; any that reach 0 go into the heap. If the answer ends up shorter than the steps, there was a circle.',
  solution: 'import heapq\n\ndef solution(steps, rules):\n    waiting = {s: 0 for s in steps}\n    after = {s: [] for s in steps}\n    for a, b in rules:\n        after[a].append(b)\n        waiting[b] += 1\n    ready = [s for s in steps if waiting[s] == 0]\n    heapq.heapify(ready)\n    out = []\n    while ready:\n        s = heapq.heappop(ready)\n        out.append(s)\n        for t in after[s]:\n            waiting[t] -= 1\n            if waiting[t] == 0:\n                heapq.heappush(ready, t)\n    return out if len(out) == len(steps) else []\n',
  alt: [
    'def solution(steps, rules):\n    waiting = {s: 0 for s in steps}\n    for a, b in rules:\n        waiting[b] += 1\n    done = []\n    ready = [s for s in steps if waiting[s] == 0]\n    while ready:\n        s = min(ready)\n        ready.remove(s)\n        done.append(s)\n        for a, b in rules:\n            if a == s:\n                waiting[b] -= 1\n                if waiting[b] == 0:\n                    ready.append(b)\n    return done if len(done) == len(steps) else []\n',
  ],
  wrong: [
    'def solution(steps, rules):\n    return sorted(steps)\n',
    'from collections import deque\n\ndef solution(steps, rules):\n    waiting = {s: 0 for s in steps}\n    after = {s: [] for s in steps}\n    for a, b in rules:\n        after[a].append(b)\n        waiting[b] += 1\n    ready = deque(s for s in steps if waiting[s] == 0)\n    out = []\n    while ready:\n        s = ready.popleft()\n        out.append(s)\n        for t in after[s]:\n            waiting[t] -= 1\n            if waiting[t] == 0:\n                ready.append(t)\n    return out if len(out) == len(steps) else []\n',
  ],
},
];
