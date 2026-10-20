/* Algorithms (al-01 to al-40): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Examples try each move on something
   tiny of their own, never on the function the task asks for. */

const STARTER = (what) => [`The starter sets up ${what}.`];

export const ALGO_DETAIL = {
'al-01': {
  explain: [
    'A **function** you write yourself starts with `def`, then its name, then brackets holding its **parameters**: names for the values it will be given.',
    'The indented lines under it are its body.',
    '`return` hands a value back to whoever called it, and ends the function there.',
    'Writing it only defines it: nothing happens until you **call** it, like `takings(30, 4.5)`.',
    'Call it as often as you like, with different values each time.',
  ],
  example: {
    say: 'Here a small function is written once and called twice.',
    code: `def greet(name):
    return "Hello, " + name

print(greet("Ada"))
print(greet("Kofi"))`,
    lines: [
      ['def greet(name):', 'a function called greet, given one value, called name inside it.'],
      ['return "Hello, " + name', 'hands back the greeting.'],
      ['greet("Ada")', 'a call: name is "Ada" this time.'],
    ],
  },
  brief: {
    story: 'The till needs a function that works out takings, so nobody does it by hand.',
    get: STARTER('`takings(cups, price)`, which returns 0 for now, and two calls'),
    want: ['Make `takings` return cups times price'],
    out: 'Both prints show real amounts: 135.0 and 36.0.',
  },
},
'al-02': {
  explain: [
    '`print` only shows a value. `return` hands it back, so the caller can store it and keep using it.',
    "A function that prints instead gives back `None`: Python's word for \"nothing\".",
    'A parameter can have a **default**: `def with_tip(bill, rate=0.1):`.',
    'Leave `rate` out when you call it and it is 0.1; give one, and yours is used.',
    'You can name what you pass, as in `with_tip(20, rate=0.15)`. Named values make a call easy to read.',
  ],
  example: {
    say: 'Here one function only prints, and another returns, with a default.',
    code: `def shout(x):
    print(x.upper())

r = shout("hi")
print(r)

def price_with(cost, markup=2):
    return cost * markup

print(price_with(3), price_with(3, markup=3))`,
    lines: [
      ['r = shout("hi")', 'HI is shown, but nothing comes back: r is None.'],
      ['markup=2', 'the default, used when no markup is given: 6.'],
      ['markup=3', 'a value given by name: 9.'],
    ],
  },
  brief: {
    story: 'The bill total keeps coming back as None, so it can\'t be used.',
    get: STARTER('`with_tip(bill)`, which prints instead of returning'),
    want: ['Rewrite `with_tip` to take a `rate` that defaults to 0.1', '**Return** the bill plus that tip, rounded to 2 places'],
    out: '`with_tip(20)` gives 22.0.',
  },
},
'al-03': {
  explain: [
    'Many answers are built up a piece at a time: start with an empty list, `[]`, and add to it in a loop with `.append(item)`.',
    '`enumerate(items)` hands over each item together with its position.',
    '`for i, cups in enumerate(week):` gets 0 and the first value, then 1 and the second, and so on.',
    'Start empty, loop, keep what passes a test, return it.',
    'This shape turns up in almost every algorithm.',
  ],
  example: {
    say: 'Here the longer names are collected into a new list.',
    code: `names = ["Ada", "Kofi", "Zola", "Nia"]
long_names = []
for i, n in enumerate(names):
    print(i, n)
    if len(n) > 3:
        long_names.append(n)
long_names`,
    lines: [
      ['enumerate(names)', 'each name with its position, from 0.'],
      ['long_names.append(n)', 'kept only if it has more than 3 letters: Kofi and Zola.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know which days of the week were busy.',
    get: STARTER('`week`, seven days of cups, and `busy_days`, which returns an empty list'),
    want: ['Finish `busy_days`: return the positions of the days with **more than** `limit` cups'],
    out: 'For this week and 45: `[1, 3, 5]`.',
  },
},
'al-04': {
  explain: [
    '`for` repeats once for each item. `while condition:` repeats for as long as the condition stays True.',
    'Something inside the loop has to move towards making it False, or it never stops.',
    '`//` divides and drops the remainder: `9 // 2` is 4.',
    'Halving again and again gets small surprisingly fast.',
    'Remember that: it comes back in binary search.',
  ],
  example: {
    say: 'Here a while loop counts down in twos until it passes zero.',
    code: `n = 7
while n > 0:
    print(n)
    n = n - 2
print(9 // 2)`,
    lines: [
      ['while n > 0', 'checked before every round.'],
      ['n = n - 2', 'moves n towards 0, so the loop ends: 7, 5, 3, 1.'],
      ['9 // 2', '4: the remainder is dropped.'],
    ],
  },
  brief: {
    story: 'See how fast halving shrinks a number.',
    get: STARTER('`halvings(n)`, which returns 0 for now'),
    want: ['Finish `halvings`: how many times can you halve `n` with `//` before it gets down to 1?', 'Try a million too'],
    out: '`halvings(8)` is 3.',
  },
},
'al-05': {
  explain: [
    'Code that works on the example can still fail on an **edge case**: an empty list, a single item, all negative numbers, a tie.',
    '`assert condition, "message"` checks that something is True.',
    "If it isn't, the program stops with your message.",
    'A few asserts under a function make a quick set of tests.',
    "When a test fails, don't patch the answer. Ask what the code assumes that isn't always true.",
  ],
  example: {
    say: 'Here a function handles the empty case on purpose, and two asserts check it.',
    code: `def first_letter(word):
    if word == "":
        return None
    return word[0]

assert first_letter("tea") == "t", "an ordinary word"
assert first_letter("") is None, "an empty word"
print("both tests passed")`,
    lines: [
      ['if word == ""', 'the edge case, dealt with first.'],
      ['assert ...', 'each passes quietly, so the last line runs.'],
    ],
  },
  brief: {
    story: '`biggest` works on the usual data, but breaks on unusual lists.',
    get: STARTER('`biggest(values)` and four tests; two of them fail'),
    want: ['Fix `biggest` so it works on any list: start from the first value instead of 0', 'Give back `None` for an empty list'],
    out: '"all tests passed".',
  },
},
'al-06': {
  explain: [
    'To compare two ways of doing something, count the **steps** each takes, not the seconds.',
    "Seconds depend on the phone; steps don't.",
    'A **linear search** checks the items one at a time from the start, until it finds the target. Each check is one step.',
    'A function can return two values with a comma, `return i, steps`.',
    'You unpack them the same way: `where, steps = find(...)`.',
  ],
  example: {
    say: 'Here a function returns two values, and they are unpacked.',
    code: `def low_high(xs):
    return min(xs), max(xs)

low, high = low_high([4, 9, 1])
print(low, high)`,
    lines: [
      ['return min(xs), max(xs)', 'two values, handed back together.'],
      ['low, high = ...', 'unpacked into two names: 1 and 9.'],
    ],
  },
  brief: {
    story: 'Find out how much work a search really does.',
    get: STARTER('`orders` and `find(items, target)`, which doesn\'t count yet'),
    want: ['Finish `find`: one step for every item checked', 'Return the position and the steps as soon as it finds the target', 'Not found gives -1 and every step taken'],
    out: '`find(orders, 44)` is `(3, 4)`.',
  },
},
'al-07': {
  explain: [
    'The same search can be quick or slow depending on the input.',
    'The **best case** is the target sitting first: 1 step.',
    'The **worst case** is last or missing: every item.',
    'The **average case** is what you expect over many searches. For targets spread evenly, it is about half the list.',
    "When people talk about an algorithm's speed, they usually mean the worst case.",
  ],
  example: {
    say: 'Here the steps to find each of four items are averaged.',
    code: `steps = [1, 2, 3, 4]          # to find the 1st, 2nd, 3rd and 4th item
print(sum(steps) / len(steps))`,
    lines: [
      ['steps', 'the first item takes 1 check, the last takes 4.'],
      ['the average', '2.5: a little over half of 4.'],
    ],
  },
  brief: {
    story: 'A search of 100 orders: how many steps does it take, typically?',
    get: STARTER('`find` and 100 orders, with the best and worst cases worked out'),
    want: ['`average`: the mean number of steps to find each of the 100 orders in turn'],
    out: 'About half the list.',
  },
},
'al-08': {
  explain: [
    'What matters most is how the steps **grow** as the data grows.',
    'Double the list: does the work double, stay the same, or quadruple?',
    'Checking every **pair** of items takes about n × n ÷ 2 steps for n items.',
    'A thousand items: half a million pairs.',
    'Plotted against size, one pass is a straight line, and every pair a curve bending upwards.',
  ],
  example: {
    say: 'Here n and n × n are shown as n doubles.',
    code: `for n in [10, 20, 40, 80]:
    print(n, n * n)`,
    lines: [
      ['n', 'doubles each row.'],
      ['n * n', 'quadruples each row: 100, 400, 1,600, 6,400.'],
    ],
  },
  brief: {
    story: 'Show, in one chart, why checking every pair gets slow.',
    get: STARTER('`search_steps`, `pair_steps`, `sizes` and the `search` list'),
    want: ['`pairs`: the pair steps for each size, built like `search`', 'Plot both against `sizes` on one chart, with a legend'],
    out: 'A straight line and a curve.',
  },
},
'al-09': {
  explain: [
    '**Big-O** is shorthand for how the work grows with the size of the input, n.',
    '`O(1)`: the same work whatever the size. `O(log n)`: one more step each time n doubles.',
    '`O(n)`: work grows in step with n. `O(n²)`: n doubles, the work quadruples.',
    'One loop over the data is usually O(n); a loop inside a loop over the same data, O(n²); halving each time round, O(log n).',
    'Two loops one after the other is still O(n): twice the work, but the same shape.',
  ],
  example: {
    say: 'Here two loops one after another are counted at two sizes.',
    code: `def two_passes(items):
    steps = 0
    for x in items:
        steps = steps + 1
    for x in items:
        steps = steps + 1
    return steps

print(two_passes(range(10)), two_passes(range(20)))`,
    lines: [
      ['the two loops', 'one after the other, not one inside the other.'],
      ['20, then 40', 'double the size, double the work: O(n).'],
    ],
  },
  brief: {
    story: 'Read four functions and say how each one\'s work grows.',
    get: STARTER('four functions and `growth`, with a "?" for each'),
    want: ['Fill in `growth` with `"1"`, `"log n"`, `"n"` or `"n^2"` for each function'],
    out: 'Four answers.',
  },
},
'al-10': {
  explain: [
    '`x in some_list` checks the items one by one: O(n).',
    "A **set** files each item under a code worked out from the item itself, its **hash**, so `x in some_set` goes straight to the right place: O(1).",
    "A list keeps order and allows repeats; a set doesn't.",
    'When all you need is "have I seen this before?", use a set.',
    '`time.perf_counter()` reads a stopwatch: take it before and after, and subtract.',
  ],
  example: {
    say: 'Here a set drops a repeat, and answers a lookup.',
    code: `drinks = {"latte", "tea", "latte"}
print(sorted(drinks))
print("tea" in drinks, "mocha" in drinks)
print(hash("latte") == hash("latte"))`,
    lines: [
      ['{"latte", "tea", "latte"}', 'the second latte is dropped: a set holds each item once.'],
      ['"tea" in drinks', 'straight to the right place, however big the set.'],
      ['hash(...)', 'the same item always gets the same code.'],
    ],
  },
  brief: {
    story: 'The order lookup is slow. Measure how much a set would help.',
    get: STARTER('100,000 ids as a list and a set, and the list timed per lookup'),
    want: ['`set_each`: time `id_set` lookups the same way, with `lookups * 1000`', '`speedup`: `list_each / set_each`'],
    out: 'A speedup in the thousands or more.',
  },
},
'al-11': {
  explain: [
    "I'm thinking of a number from 1 to 100. Guessing 1, 2, 3 and so on could take 100 goes.",
    'Guess the **middle** instead, and each "higher" or "lower" rules out half of what\'s left.',
    'That is **binary search**: keep a `low` and a `high`, guess `(low + high) // 2`, and move one end just past the guess.',
    'Halving 100 gets down to 1 in about 7 steps, so it never takes more than 7 guesses.',
    'A million numbers? 20.',
  ],
  example: {
    say: 'Here is how many halvings 100 and a million need, worked out with log₂.',
    code: `import math
print(math.ceil(math.log2(100)))
print(math.ceil(math.log2(1_000_000)))`,
    lines: [
      ['math.log2(100)', 'how many times 2 goes into 100 by halving: about 6.6.'],
      ['math.ceil', 'rounded up: 7 guesses for 100, 20 for a million.'],
    ],
  },
  brief: {
    story: 'Write the guessing game, and prove it never needs more than 7 guesses.',
    get: STARTER('`guesses(secret)`, with a `break` where the two moves go'),
    want: ['Replace the `break`: below the secret, `low` moves to one above the guess; otherwise `high` moves to one below it', '`most`: the most guesses any number from 1 to 100 needs'],
    out: '`most` is 7.',
  },
},
'al-12': {
  explain: [
    'Binary search works on any **sorted** list: look at the middle item, and throw away the half that can\'t hold the target.',
    'The middle position is `(low + high) // 2`.',
    'It is O(log n). A sorted list of a million order numbers takes at most 20 looks.',
    'The catch: the list has to be sorted, and sorting costs time too.',
    'It pays off when the same list gets searched many times.',
  ],
  example: {
    say: 'Here the middle of a sorted list is found.',
    code: `items = [13, 44, 87, 250, 301]
low, high = 0, len(items) - 1
mid = (low + high) // 2
print(mid, items[mid])`,
    lines: [
      ['low, high', 'the first and last positions: 0 and 4.'],
      ['mid', 'position 2, holding 87. Anything smaller is to its left.'],
    ],
  },
  brief: {
    story: 'The sorted order list will be searched thousands of times a day.',
    get: STARTER('`binary_search(items, target)`, unfinished'),
    want: ['Return `mid` when `items[mid]` is the target', 'Smaller: move `low` to `mid + 1`. Bigger: move `high` to `mid - 1`', 'Return -1 if the target isn\'t there'],
    out: '`binary_search(orders, 301)` is 4.',
  },
},
'al-13': {
  explain: [
    'Often you want a place rather than an exact match: the first price that is at least £10.',
    'That is a **lower bound**: the first position whose item is at least the target.',
    'If every item is smaller, it is the length of the list, just past the end.',
    'Binary search finds it with one change: when an item is big enough, keep it as a candidate and carry on looking left.',
    'That way an earlier one that is also big enough isn\'t missed.',
  ],
  example: {
    say: 'Here the lower bound is found the slow way, one item at a time, to show what the answer means.',
    code: `prices = [2, 4, 4, 7]
print(next(i for i, p in enumerate(prices) if p >= 4))
print(next((i for i, p in enumerate(prices) if p >= 9), len(prices)))`,
    lines: [
      ['p >= 4', 'the first price at least 4 is at position 1, the first of the two 4s.'],
      ['p >= 9', 'none is, so the answer is the length, 4: just past the end.'],
    ],
  },
  brief: {
    story: 'Find where a price belongs in a sorted list, quickly.',
    get: STARTER('`first_at_least(items, target)`, with a `break` where the moves go'),
    want: ['Replace the `break`: if `items[mid] >= target`, set `high = mid`; otherwise `low = mid + 1`'],
    out: '1 for 3.0, and 6 for 10.',
  },
},
'al-14': {
  explain: [
    'The `bisect` module has binary search built in.',
    '`bisect_left(items, x)` is exactly the lower bound. `bisect_right(items, x)` is the position just after any items equal to x.',
    'So `bisect_right(items, hi) - bisect_left(items, lo)` counts the items from lo to hi, in O(log n).',
    '`insort(items, x)` puts x in its place, so the list stays sorted.',
  ],
  example: {
    say: 'Here a sorted list is searched and added to.',
    code: `from bisect import bisect_left, insort
days = [3, 8, 15]
print(bisect_left(days, 10))
insort(days, 10)
print(days)`,
    lines: [
      ['bisect_left(days, 10)', 'where 10 would go: position 2.'],
      ['insort(days, 10)', 'puts it there, so the list stays in order.'],
    ],
  },
  brief: {
    story: 'The menu team wants to know how many prices fall in a range, instantly.',
    get: STARTER('`prices`, sorted, and `count_between`, which returns 0'),
    want: ['Make `count_between` return how many items are from `lo` to `hi`, both included, using the two bisect functions'],
    out: '`count_between(prices, 3.0, 6.0)` is 4.',
  },
},
'al-15': {
  explain: [
    'Binary search works on more than lists.',
    'If you can ask "is this number big enough?", and the answer flips from no to yes once as the number grows, you can halve your way to the smallest yes.',
    'Here: the bakery has time for 8 bakes. What is the smallest batch size that fits?',
    '`(order + size - 1) // size` rounds a division up: 30 pastries in batches of 12 need 3 bakes.',
    'Searching the answer, rather than a list, is a pattern that turns up all over.',
  ],
  example: {
    say: 'Here the rounding-up division is tried on three orders.',
    code: `size = 12
for order in [30, 24, 25]:
    print(order, (order + size - 1) // size)`,
    lines: [
      ['24', 'exactly 2 batches of 12.'],
      ['25', 'one over: 3 batches, because the last one only holds 1.'],
    ],
  },
  brief: {
    story: 'The bakery wants the smallest batch size that still fits in 8 bakes.',
    get: STARTER('`orders`, `bakes(size)`, and `smallest_batch(limit)`, unfinished'),
    want: ['Finish `smallest_batch`: binary-search for the smallest size where `bakes(size) <= limit`'],
    out: 'One batch size.',
  },
},
'al-16': {
  explain: [
    'To sort by hand, you might find the smallest and put it first, then the smallest of the rest, and so on. That is **selection sort**.',
    'An inner loop looks through everything after the current position, remembering where the smallest is.',
    'Swapping two items takes one line: `items[i], items[j] = items[j], items[i]`.',
    'For every position it scans everything after it: about n × n ÷ 2 comparisons, so O(n²).',
    'Fine for ten items, painful for a million.',
  ],
  example: {
    say: 'Here two items swap places in one line.',
    code: `items = ["c", "a", "b"]
items[0], items[1] = items[1], items[0]
print(items)`,
    lines: [
      ['items[0], items[1] = items[1], items[0]', 'both sides are read first, then stored: a clean swap.'],
    ],
  },
  brief: {
    story: 'Write a sort yourself, to see how sorting works.',
    get: STARTER('`selection_sort(items)`, with the inner loop missing'),
    want: ['An inner loop over the positions after `i` updates `smallest` whenever it finds a smaller item', 'After it, swap position `i` with `smallest`'],
    out: '`[9, 12, 31, 48, 55]`.',
  },
},
'al-17': {
  explain: [
    '**Insertion sort** works like sorting a hand of cards: take the next card, and slide it left past every bigger card until it fits.',
    'On a list already nearly in order, each card hardly moves: close to O(n).',
    'On a list in reverse order, every card slides all the way: O(n²).',
    'Counting the slides shows it: the same algorithm, very different work, depending on the input.',
  ],
  example: {
    say: 'Here one card is slotted into a sorted hand.',
    code: `hand = [2, 5, 7]
card = 4
i = len(hand)
while i > 0 and hand[i - 1] > card:
    i = i - 1
hand.insert(i, card)
print(hand, "slid past", len(hand) - 1 - i, "cards")`,
    lines: [
      ['while i > 0 and hand[i - 1] > card', 'step left while the card on the left is bigger.'],
      ['hand.insert(i, card)', '4 goes between 2 and 5, after sliding past 7 and 5.'],
    ],
  },
  brief: {
    story: 'Show how much the order of the data changes the work.',
    get: STARTER('`insertion_sort(items)`, with the sliding loop missing'),
    want: ['Write the `while` loop that slides the card left, counting shifts', '`sorted_shifts` and `reversed_shifts`: for `list(range(100))` and `list(range(100, 0, -1))`'],
    out: '0 shifts for the sorted list, thousands for the reversed one.',
  },
},
'al-18': {
  explain: [
    'Two lists that are each already sorted can be combined in a single pass.',
    'Compare the front of each, take the smaller, and move along that list.',
    'When one list runs out, what is left of the other is already in order, so it goes on the end as it is.',
    '`a[i:]` is everything from position i on, and `.extend()` adds a whole list.',
    'Each item is looked at once: O(n). This step is the heart of merge sort.',
  ],
  example: {
    say: 'Here the rest of a list is added on the end in one go.',
    code: `a = [1, 4, 9]
out = [0]
out.extend(a[1:])
print(out)`,
    lines: [
      ['a[1:]', 'everything from position 1: 4 and 9.'],
      ['out.extend(...)', 'adds them all to the end of out.'],
    ],
  },
  brief: {
    story: 'Two sorted lists of orders need to become one.',
    get: STARTER('`merge(a, b)`, unfinished'),
    want: ['Finish `merge` so it returns one sorted list holding everything from both'],
    out: '`[9, 12, 31, 48, 55, 60, 70]`.',
  },
},
'al-19': {
  explain: [
    '`sorted(items)` gives back a new sorted list; `items.sort()` sorts the list itself. Both are O(n log n).',
    '`key=` says what to sort **by**: `sorted(orders, key=lambda o: o["total"])`.',
    '`lambda o: ...` is a tiny function written in place: given o, give back this.',
    'A key that gives a tuple sorts by its first part, and breaks ties with the next. A minus sign flips a number to sort biggest first.',
    'Python\'s sort is **stable**: items that tie keep the order they arrived in.',
  ],
  example: {
    say: 'Here three people are sorted by age, then by age biggest first with names breaking ties.',
    code: `people = [("Kofi", 30), ("Ada", 25), ("Zola", 30)]
print(sorted(people, key=lambda p: p[1]))
print(sorted(people, key=lambda p: (-p[1], p[0])))`,
    lines: [
      ['key=lambda p: p[1]', 'by age: Ada first. Kofi and Zola tie, and keep their order.'],
      ['(-p[1], p[0])', 'oldest first, then A to Z by name among the ties.'],
    ],
  },
  brief: {
    story: 'The report lists orders by city, biggest first within each city.',
    get: STARTER('five `orders`, each with an id, city and total'),
    want: ['`ranked`: sorted by city A to Z, and within each city by total, biggest first', '`ids`: their ids in that order'],
    out: 'A list of five ids.',
  },
},
'al-20': {
  explain: [
    'To find the 3 busiest days of a year, sorting all 365 does more work than needed.',
    'A **heap** always keeps its smallest item at the front, ready to take, and adding one costs only O(log n).',
    '`heapq.heappush(heap, x)` adds; `heapq.heappop(heap)` takes the smallest.',
    'Keep a heap of the best k seen so far: push each new value, and when it grows past k, pop the smallest off.',
    'Whatever is left is the top k. `heapq.nlargest(k, values)` does the same in one call.',
  ],
  example: {
    say: 'Here four numbers go into a heap, and the smallest come out first.',
    code: `import heapq
h = []
for x in [7, 2, 9, 4]:
    heapq.heappush(h, x)
print(h[0])
print(heapq.heappop(h), heapq.heappop(h))`,
    lines: [
      ['h[0]', 'the smallest is always at the front: 2.'],
      ['heappop twice', '2, then 4.'],
    ],
  },
  brief: {
    story: 'The owner wants the three busiest days of the year.',
    get: STARTER('`year`: cups for 365 days, and `top_k`, unfinished'),
    want: ['Finish `top_k` with `heapq.heappush` and `heapq.heappop`', 'Check it against `heapq.nlargest(3, year)`'],
    out: 'The same three numbers both ways.',
  },
},
'al-21': {
  explain: [
    'A dict looks a key up in O(1), just like a set, and keeps a value with it. That makes it the tool for counting.',
    '`counts.get(word, 0)` gives the count so far, or 0 for a word not seen yet.',
    'Add 1 and store it back: `counts[word] = counts.get(word, 0) + 1`.',
    '`collections.Counter` does the same counting in one line.',
    '`.most_common(3)` gives the top three as pairs of (item, count).',
  ],
  example: {
    say: 'Here the letters of a word are counted with Counter.',
    code: `from collections import Counter
Counter("banana").most_common(2)`,
    lines: [
      ['Counter("banana")', 'counts every letter: a 3, n 2, b 1.'],
      ['.most_common(2)', 'the top two, as (letter, count) pairs.'],
    ],
  },
  brief: {
    story: 'The menu team wants to know which drink is ordered most.',
    get: STARTER('a list of orders and `tally(items)`, unfinished'),
    want: ['Finish `tally` so it returns each item with how many times it appears', '`top`: the most common drink, using `Counter`'],
    out: 'A dict of counts, and one drink.',
  },
},
'al-22': {
  explain: [
    'Two things on the menu that together cost exactly the voucher? Checking every pair is O(n²).',
    'Faster: walk through once, and for each price ask "have I already seen the price that would make it up?"',
    'A dict of price to position answers that in O(1), so one pass does it: O(n).',
    'Spending a little memory to save a lot of time is one of the most useful trades in algorithms.',
  ],
  example: {
    say: 'Here a set remembers what has been seen, and spots the first repeat in one pass.',
    code: `seen = set()
for x in [3, 8, 3, 5]:
    if x in seen:
        print("repeat:", x)
    seen.add(x)`,
    lines: [
      ['x in seen', 'an O(1) check: have I met this before?'],
      ['seen.add(x)', 'remember it for later.'],
    ],
  },
  brief: {
    story: 'A customer has a voucher, and wants two items that use it exactly.',
    get: STARTER('the prices and `pair_for(prices, voucher)`, unfinished'),
    want: ['Return the positions of the first pair that adds up to the voucher, earlier position first', '`None` if no pair does', 'One item can\'t be used twice'],
    out: 'A pair of positions, or None.',
  },
},
'al-23': {
  explain: [
    'To group things, keep a dict whose values are lists: each city, with the list of its orders.',
    'Each order here is a pair in round brackets, a **tuple**, and `for city, total in pairs:` takes both parts at once.',
    '`defaultdict(list)` makes an empty list the first time a new key is used.',
    "So there's no \"is it there yet?\" check.",
    'One pass, O(n), and every group is ready. This is what pandas\' groupby does underneath.',
  ],
  example: {
    say: 'Here words are grouped by their first letter.',
    code: `from collections import defaultdict
groups = defaultdict(list)
for w in ["tea", "latte", "toast"]:
    groups[w[0]].append(w)
dict(groups)`,
    lines: [
      ['groups[w[0]]', 'the list for that letter, made empty the first time.'],
      ['.append(w)', 'tea and toast land under t, latte under l.'],
    ],
  },
  brief: {
    story: 'The regional manager wants each city\'s orders together.',
    get: STARTER('`pairs` of (city, total) and `group_totals`, unfinished'),
    want: ['Finish `group_totals` so each city maps to the list of its totals, in order', '`busiest`: the city whose totals add up to the most'],
    out: 'A dict of lists, and a city.',
  },
},
'al-24': {
  explain: [
    'A **stack** is a pile: you add to the top and take from the top, so the last thing in is the first out.',
    'A list does it with `.append()` and `.pop()`.',
    'Brackets have to close in the reverse order they opened, which is exactly what a stack remembers.',
    'Push each opener; on a closer, the top of the stack must be its partner.',
    'Your code editor, a calculator and the Undo button all keep stacks.',
  ],
  example: {
    say: 'Here an Undo stack keeps three actions and undoes the latest.',
    code: `undo = []
undo.append("type a")
undo.append("type b")
undo.append("bold")
print(undo.pop())
print(undo)`,
    lines: [
      ['.append(...)', 'each action goes on top.'],
      ['.pop()', 'the last one in comes off first: bold.'],
    ],
  },
  brief: {
    story: 'Check a formula\'s brackets before it is run.',
    get: STARTER('`balanced(text)`, unfinished'),
    want: ['A closer needs a stack that isn\'t empty, with its partner on top (popped off)', 'At the end, everything opened must have been closed'],
    out: 'True for balanced text, False otherwise.',
  },
},
'al-25': {
  explain: [
    'A **queue** is a line: join at the back, get served from the front. First in, first out.',
    'Taking from the front of a list is slow, because everything shuffles up a place.',
    '`collections.deque` is built for it: `.append()` at the back and `.popleft()` from the front, both O(1).',
    'A barista with several orders on the go can take turns: one drink for the order at the front, then it goes to the back if it needs more.',
  ],
  example: {
    say: 'Here a line of people is served from the front while someone joins at the back.',
    code: `from collections import deque
line = deque(["Ada", "Kofi"])
line.append("Zola")
print(line.popleft())
print(list(line))`,
    lines: [
      ['line.append("Zola")', 'joins at the back.'],
      ['line.popleft()', 'the front is served first: Ada.'],
    ],
  },
  brief: {
    story: 'The barista takes turns between orders. Who finishes first?',
    get: STARTER('a queue of (name, drinks) orders and a loop, unfinished'),
    want: ['Take one drink off', 'Then add the name to `finished`, or put `(name, drinks)` back at the end of the line'],
    out: '`finished`: the order the names finish in.',
  },
},
'al-26': {
  explain: [
    'A **recursive** function solves a problem by calling itself on a smaller piece of it.',
    'The total of a list is its first item, plus the total of the rest.',
    'It needs a **base case**: a piece so small the answer is obvious, like the total of an empty list, 0.',
    'Without one, it would call itself forever.',
    'Each call waits for the one it made to answer, then finishes its own work.',
  ],
  example: {
    say: 'Here a function counts down by calling itself with a smaller number.',
    code: `def count_down(n):
    if n == 0:
        return ["go"]
    return [n] + count_down(n - 1)

count_down(3)`,
    lines: [
      ['if n == 0', 'the base case: no more calls.'],
      ['[n] + count_down(n - 1)', 'this number, then whatever the smaller call gives.'],
    ],
  },
  brief: {
    story: 'Add up a list without a loop.',
    get: STARTER('`total(values)`, with the base case written'),
    want: ['Finish `total` recursively: the first value plus `total` of the rest (`values[1:]`)'],
    out: 'The same total as `sum`.',
  },
},
'al-27': {
  explain: [
    'Recursion shines on data that nests: a menu whose sections hold smaller sections, down to lists of items.',
    'A loop would need to know how deep the nesting goes. A recursive function doesn\'t.',
    'For each part: if it is a list, count its items; if it is another section, call yourself on it.',
    '`isinstance(x, list)` asks whether x is a list.',
    'JSON from websites and apps nests just like this.',
  ],
  example: {
    say: 'Here a function finds how deeply some lists are nested.',
    code: `def depth(x):
    if isinstance(x, list):
        return 1 + max((depth(i) for i in x), default=0)
    return 0

print(depth([1, [2, [3]]]))`,
    lines: [
      ['isinstance(x, list)', 'a list adds one level, then asks each item.'],
      ['the answer', '3: a list inside a list inside a list.'],
    ],
  },
  brief: {
    story: 'The menu is stored nested, and the shop wants to count every item on it.',
    get: STARTER('the nested `menu` and `count_items`, unfinished'),
    want: ['For a dict, loop over its values and add up `count_items` of each'],
    out: 'All 11 items.',
  },
},
'al-28': {
  explain: [
    '**Merge sort** splits the list in half, sorts each half by calling itself, and joins the two sorted halves with `merge`.',
    'A list of one item, or none, is already sorted: that is the base case.',
    '`items[:mid]` and `items[mid:]` are the two halves.',
    'The list halves about log n times, and at each level merging handles all n items: O(n log n), even in the worst case.',
    "That is the speed of Python's own sort.",
  ],
  example: {
    say: 'Here a list is cut into its two halves.',
    code: `items = [8, 3, 5, 1, 9]
mid = len(items) // 2
print(items[:mid], items[mid:])`,
    lines: [
      ['len(items) // 2', 'the middle: 2.'],
      ['items[:mid], items[mid:]', 'the first two, and the other three.'],
    ],
  },
  brief: {
    story: 'Build a sort that stays fast on any input.',
    get: STARTER('`merge` (with a comparison counter) and `merge_sort`, unfinished'),
    want: ['Finish `merge_sort`', 'Sort 1,000 random numbers and look at `work["comparisons"]`'],
    out: 'A sorted list, with far fewer comparisons than selection sort\'s 499,500.',
  },
},
'al-29': {
  explain: [
    'Some recursive functions ask the same question again and again.',
    'How many ways are there up 30 stairs, 1 or 2 at a time? `ways(30)` asks `ways(29)` and `ways(28)`, and each of those asks again.',
    'The calls nearly double at each level: over a million calls for 30 stairs. Yet there are only 30 different questions.',
    '**Memoisation** stores each answer in a dict the first time, and looks it up after that.',
    'Every question gets worked out once: O(n).',
  ],
  example: {
    say: 'Here a memo means the same sum is only worked out once, however often it is asked.',
    code: `memo = {}
work = [0]
def square(n):
    if n in memo:
        return memo[n]
    work[0] = work[0] + 1
    memo[n] = n * n
    return memo[n]

for _ in range(5):
    square(12)
print(work[0], "time worked out")`,
    lines: [
      ['if n in memo', 'already known? hand it straight back.'],
      ['the count', '1: asked five times, worked out once.'],
    ],
  },
  brief: {
    story: 'The stair-counting function takes forever. Make it remember.',
    get: STARTER('the slow `ways(n)` and `fast_ways`, unfinished'),
    want: ['Finish `fast_ways` with a memo', 'Print `fast_ways(90)`'],
    out: 'A huge number, straight away.',
  },
},
'al-30': {
  explain: [
    'Some questions need every possibility. Which items could you buy that use a £10 voucher exactly?',
    'Each item has two choices: take it or leave it.',
    'Recursion walks both branches, item by item, and keeps the baskets that land exactly on the target.',
    'n items make 2ⁿ paths: 20 items is a million.',
    'Stopping a branch as soon as it goes over cuts many off. That is called **pruning**.',
  ],
  example: {
    say: 'Here every pair from three items is listed, and the number of all possible baskets is worked out.',
    code: `from itertools import combinations
print(list(combinations(["tea", "cake", "bun"], 2)))
print(2 ** 3, "baskets in all, from empty to everything")`,
    lines: [
      ['combinations(..., 2)', 'every pair: three of them.'],
      ['2 ** 3', 'take or leave each of 3 items: 8 possible baskets.'],
    ],
  },
  brief: {
    story: 'A customer wants to spend a £10 voucher exactly. How many ways can they?',
    get: STARTER('the prices and `walk`, with its two branches missing'),
    want: ['Fill in the two branches of `walk`: take the item, or leave it', '`ways`: how many baskets make exactly £10'],
    out: 'A count of baskets.',
  },
},
'al-31': {
  explain: [
    'A **graph** is a set of places (**nodes**) joined by links (**edges**): cafés and roads, people and who knows whom.',
    'The handiest way to store one is a dict of lists, each place with its neighbours: an **adjacency list**.',
    "A road goes both ways, so it goes into both places' lists.",
    "`graph.setdefault(a, [])` gives a's list, first putting in an empty one if there isn't one yet.",
  ],
  example: {
    say: 'Here one road between A and B is stored both ways.',
    code: `g = {}
g.setdefault("A", []).append("B")
g.setdefault("B", []).append("A")
g`,
    lines: [
      ['setdefault("A", [])', "A's list, made empty the first time."],
      ['both lines', 'the road is in A\'s list and in B\'s.'],
    ],
  },
  brief: {
    story: 'Map the roads between the café branches.',
    get: STARTER('a list of `roads` and `build_graph`, unfinished'),
    want: ['Finish `build_graph` so each place maps to the places it has a road to', '`most_connected`: the place with the most roads'],
    out: 'A dict of lists, and a place.',
  },
},
'al-32': {
  explain: [
    '**Breadth-first search** (BFS) explores a graph in rings: every place one road away, then two away, and so on.',
    'A queue keeps the rings in order: the nearest places are dealt with first.',
    'A set of places already seen stops it going round in circles.',
    'The first time it reaches a place is by the fewest roads possible.',
    'Each place and road is handled once: O(places + roads).',
  ],
  example: {
    say: 'Here the queue carries each place with its distance, as BFS does.',
    code: `from collections import deque
queue = deque([("Market", 0)])
place, dist = queue.popleft()
queue.append(("Station", dist + 1))
print(place, dist, list(queue))`,
    lines: [
      ['("Market", 0)', 'a place and how many roads from the start.'],
      ['dist + 1', 'a neighbour is one road further.'],
    ],
  },
  brief: {
    story: 'The delivery rider wants the fewest stops from the Market to each place.',
    get: STARTER('the road graph and a BFS loop, with the neighbour step missing'),
    want: ['Every neighbour not seen before gets marked seen and queued with `dist + 1`'],
    out: 'Market to Airport takes 3 roads; the Depot can\'t be reached.',
  },
},
'al-33': {
  explain: [
    "When roads take different times, the fewest stops isn't always quickest.",
    "**Dijkstra's algorithm** always carries on from whichever place is currently closest to the start.",
    'A heap hands over that closest place in O(log n): store (time, place) pairs, and the smallest time comes out first.',
    'When a place comes off the heap, its time is final.',
    'From there, it offers each neighbour "my time plus this road", kept only if it beats the best so far.',
  ],
  example: {
    say: 'Here two places go into a heap as (time, place), and the quicker comes out first.',
    code: `import heapq
h = []
heapq.heappush(h, (12, "Harbour"))
heapq.heappush(h, (4, "Station"))
heapq.heappop(h)`,
    lines: [
      ['(12, "Harbour")', 'a tuple: compared by its first part, the time.'],
      ['heappop', 'the closest comes out first: Station, at 4 minutes.'],
    ],
  },
  brief: {
    story: 'The rider wants the quickest route, not the fewest stops.',
    get: STARTER('roads with minutes, and `quickest`, with the neighbour loop missing'),
    want: ['Finish the neighbour loop: offer each neighbour "my time plus this road", and keep it only if it beats the best so far'],
    out: 'Market to Harbour in 12 minutes, by Station and Campus.',
  },
},
'al-34': {
  explain: [
    'A **greedy** algorithm makes whatever choice looks best right now, and never looks back.',
    'For change, that means: always hand over the biggest coin that still fits.',
    'With pounds and pence (200, 100, 50, 20, 10, 5, 2 and 1), greedy always gives the fewest coins.',
    'It is quick and simple, which is its charm.',
    '"Best right now" isn\'t always best overall. The next lesson breaks it.',
  ],
  example: {
    say: 'Here 70p is paid in 20p coins for as long as one fits.',
    code: `amount = 70
coins = 0
while amount >= 20:
    amount = amount - 20
    coins = coins + 1
print(f"{coins} coins of 20p, with {amount}p left")`,
    lines: [
      ['while amount >= 20', 'keep handing over 20p while it fits.'],
      ['the result', '3 coins, with 10p still to pay with smaller coins.'],
    ],
  },
  brief: {
    story: 'The till should hand back change in as few coins as possible.',
    get: STARTER('the coin values and `greedy_change`, unfinished'),
    want: ['Finish `greedy_change` so it returns the coins handed over, biggest first'],
    out: 'A list of coins.',
  },
},
'al-35': {
  explain: [
    'With coins of 1, 3 and 4, greedy gives 6 as 4 + 1 + 1: three coins. But 3 + 3 is only two.',
    '**Dynamic programming** builds the answer from smaller answers: the fewest coins for every amount from 0 up.',
    'For each amount, try each coin as the last one, and take the best of "the fewest for what\'s left, plus this coin".',
    'Each amount is worked out once, from answers already known: O(amount × coins).',
    'It is memoisation, built bottom-up in a list instead of top-down with recursion.',
  ],
  example: {
    say: 'Here the ways up a few stairs are built bottom-up, each from the two before.',
    code: `ways = [1, 1]
for n in range(2, 8):
    ways.append(ways[n - 1] + ways[n - 2])
ways`,
    lines: [
      ['ways = [1, 1]', 'known answers for 0 and 1 stairs.'],
      ['ways[n - 1] + ways[n - 2]', 'each new answer from two already in the list.'],
    ],
  },
  brief: {
    story: 'A café abroad has coins of 1, 3 and 4, and greedy change wastes coins.',
    get: STARTER('`fewest_coins(coins, amount)`, with the inner loop missing'),
    want: ['Finish the inner loop'],
    out: '`fewest_coins([1, 3, 4], 6)` gives 2; an amount that can\'t be made gives -1.',
  },
},
'al-36': {
  explain: [
    'Before you speed code up, find out where the time actually goes: guesses are usually wrong.',
    'A **profiler** times every function while the program runs.',
    "Python's `cProfile` makes a table: `ncalls` is how many times each function ran, `tottime` the time inside it, and `cumtime` that plus everything it called.",
    'Fix the biggest number first.',
    'Making something that takes 1% of the time twice as fast saves 0.5%.',
  ],
  example: {
    say: 'Here a small program is profiled, and the table sorted by how often each function ran.',
    code: `import cProfile, pstats, sys
def step():
    return sum(range(1000))
def run():
    return [step() for _ in range(50)]
p = cProfile.Profile()
p.enable()
run()
p.disable()
_ = pstats.Stats(p, stream=sys.stdout).sort_stats("ncalls").print_stats(4)`,
    lines: [
      ['p.enable() ... p.disable()', 'times everything run in between.'],
      ['the table', 'step and the sum inside it each ran 50 times, and run once. The times are tiny here.'],
    ],
  },
  brief: {
    story: 'The order checker is slow, and nobody knows why.',
    get: STARTER('a slow program, profiled'),
    want: ['`slowest`: the name of the function with the biggest `tottime`', 'Speed it up with `menu_set = set(menu)`'],
    out: 'The same `answer`, in less time.',
  },
},
'al-37': {
  explain: [
    'A common slowdown is work done inside a loop that gives the same answer every time round.',
    'Move it out: do it once before the loop, keep the result, and use that inside. This is called **hoisting**.',
    'Searching a list of records for a match is O(n), every single time.',
    'Build a dict once, keyed by what you search on, and each lookup becomes O(1).',
  ],
  example: {
    say: 'Here a set is built once, before the loop, and used for every check.',
    code: `menu = ["tea", "latte", "mocha"]
menu_set = set(menu)
words = ["tea", "chai", "latte"]
[w in menu_set for w in words]`,
    lines: [
      ['menu_set = set(menu)', 'built once, outside the loop.'],
      ['w in menu_set', 'each check is O(1).'],
    ],
  },
  brief: {
    story: 'Totting up a basket searches the price list once per item.',
    get: STARTER('`products`, `find_price` and `basket_total`'),
    want: ["Write `fast_total(basket)`: build a dict from each product's code to its price once, then add up the basket's prices from it, rounded to 2", 'Don\'t call `find_price`'],
    out: 'The same total as `basket_total`.',
  },
},
'al-38': {
  explain: [
    'A list holds every value at once.',
    'A **generator** makes one value at a time, as it is asked for, so a long pipeline never holds all the data in memory.',
    '`(x * 2 for x in data)` is a generator expression: like a list comprehension, in round brackets.',
    '`sys.getsizeof(x)` shows how many bytes an object takes.',
    'Nothing runs until whatever is at the end, like `sum`, starts asking.',
  ],
  example: {
    say: 'Here a list and a generator over the same thousand numbers are compared.',
    code: `import sys
nums = [x for x in range(1000)]
gen = (x for x in range(1000))
print(sys.getsizeof(nums), sys.getsizeof(gen))
print(sum(gen))`,
    lines: [
      ['[...]', 'a list: all 1,000 numbers held at once.'],
      ['(...)', 'a generator: tiny, making each number when asked.'],
      ['sum(gen)', 'pulls the numbers through one at a time.'],
    ],
  },
  brief: {
    story: 'A million sensor readings need processing on a small machine.',
    get: STARTER('a million `readings`, and their size as a list'),
    want: ['`doubled`, `evens` and `big`: three generator expressions in a pipeline', '`result = sum(big)`', '`size = sys.getsizeof(doubled)`'],
    out: 'A result, and a size tiny next to the list\'s.',
  },
},
'al-39': {
  explain: [
    'A Python loop handles one number per step, and every step has overhead.',
    '**numpy** keeps numbers packed side by side and runs one operation over the whole array in fast, compiled code. This is **vectorising**.',
    '`prices * qty` multiplies two arrays item by item in one go, and `.sum()` totals the lot.',
    '`timeit.timeit(fn, number=50)` runs a function 50 times and gives the total seconds.',
    'pandas columns work the same way, which is why a column sum beats a loop over rows.',
  ],
  example: {
    say: 'Here two arrays are multiplied item by item, then totalled, with no loop.',
    code: `a = np.array([1, 2, 3])
b = np.array([10, 20, 30])
print(a * b)
print((a * b).sum())`,
    lines: [
      ['a * b', 'each pair multiplied: 10, 40, 90.'],
      ['.sum()', 'the total: 140.'],
    ],
  },
  brief: {
    story: 'The nightly takings loop is slow. Try the numpy way.',
    get: STARTER('`prices` and `qty` as arrays, and the loop version timed as `loop_time`'),
    want: ['`vec_total`: the total in one line, no loop', '`vec_time`: timed with `timeit`, 50 runs ÷ 50', '`speedup`: `loop_time / vec_time`'],
    out: 'The same total, much faster.',
  },
},
'al-40': {
  explain: [
    'Every value in a pandas column takes space: 8 bytes each for an ordinary whole number or decimal.',
    'Text is worse: each value is a whole Python string, stored separately.',
    '`df.memory_usage(deep=True)` shows the bytes in each column.',
    'For text that repeats, like city names, `.astype("category")` stores each different value once, plus a tiny code per row.',
    'Small whole numbers fit smaller types: `"int8"` holds -128 to 127 in 1 byte instead of 8.',
  ],
  example: {
    say: 'Here 1,000 city names are measured as text, then as a category.',
    code: `s = pd.Series(["Lagos", "Accra"] * 500)
print(s.memory_usage(deep=True))
print(s.astype("category").memory_usage(deep=True))`,
    lines: [
      ['as text', 'every name stored separately.'],
      ['as a category', 'two names stored once, plus a small code per row: far smaller.'],
    ],
  },
  brief: {
    story: 'The order table no longer fits in memory on the old laptop.',
    get: STARTER('`big`, a large table, and `before`, its memory'),
    want: ['`small`: a copy of `big` with `city` as a category and `cups` as int8', '`after`: its total memory', '`saving`: `before / after`'],
    out: 'Several times smaller.',
  },
},
};
