/* Every practice question written up as a brief, the way a request reaches
   an analyst: the situation (stories.js) first, then what you're given, with
   each column explained, what they want, exactly what to return, and the
   edge cases. practice.js draws it in place of the question's older prompt
   and notes, which stay in each question's file (search still reads them,
   and they're the fallback for a question with no brief).

   Each entry:
     get   what you're given: [lead, columns?]. The lead is a sentence; the
           columns, when there are any, are { name: what it holds }.
     want  what they want you to do, as bullets
     out   exactly what to return, and in what order
     fine  the edge cases: ties, blanks, what counts and what doesn't

   Every requirement here must match the question's own prompt and judge:
   the brief only rearranges it. tests.html checks every question has one. */

export const BRIEFS = {
  // ── Python, easy ──
  p01: {
    get: [['`df` holds the daily sales, one row per café per day:', { date: 'the day', city: 'which café', cups: 'how many cups it poured' }]],
    want: ['Find the days that poured **more than 40** cups', 'Keep only the `date` and `cups` columns'],
    out: 'Return those rows. Row order doesn\'t matter.',
    fine: ['A day with exactly 40 cups doesn\'t count.'],
  },
  p02: {
    get: [['`df` holds the till records, one row each, including:', { city: 'the café that sent it' }]],
    want: ['Count how many rows each city sent'],
    out: 'Return a DataFrame with exactly two columns, `city` and `n`. Row order doesn\'t matter.',
  },
  p03: {
    get: [['`df` holds the daily sales, including:', { price: 'what a cup sold for that day, missing on a few days' }]],
    want: ['Work out the average price', 'Leave the missing prices out, rather than counting them as zero'],
    out: 'Return the average as a number, **rounded to 2 decimal places**.',
  },
  p04: {
    get: [['`df` holds the customer feedback, including:', { rating: 'the star rating, blank when none was given' }]],
    want: ['Count the missing values in `rating`', 'Other columns may have gaps of their own: only count `rating`'],
    out: 'Return the count as an integer.',
  },
  p05: {
    get: [['`df` holds the sales, including:', { city: 'typed by hand, with stray spaces and random capitals, like `"  lagos"` and `"ACCRA "`' }]],
    want: ['Strip the spaces from around every city', 'Write each one in title case, like `"New York"`', 'Leave every other column alone'],
    out: 'Return the whole of `df`, with the rows in the same order.',
  },
  p06: {
    get: [['`df` holds the daily takings:', { date: 'the day', revenue: 'that day\'s takings' }]],
    want: ['Find the **3** highest-revenue days', 'Keep only `date` and `revenue`'],
    out: 'Return them from highest revenue to lowest. When two days tie on revenue, the **earlier date** comes first. With fewer than 3 rows, return them all.',
  },
  p07: {
    get: [['`df` holds the feedback cards, including:', { rating: 'the star rating, missing on some cards' }]],
    want: ['Replace each missing rating with the **median** of the ratings that are there'],
    out: 'Return the whole of `df`, with the rows in the same order.',
    fine: ['Median, not mean. They are different numbers here.'],
  },
  p08: {
    get: [['`df` holds the daily sales, including:', { date: 'the day', cups: 'cups sold', price: 'the price of a cup' }]],
    want: ['Rename `cups` to `units`', 'Rename `price` to `unit_price`', 'Keep only three columns'],
    out: 'Return the columns in exactly this order: `date`, `units`, `unit_price`.',
    fine: ['Column order matters for this one.'],
  },
  p22: {
    get: [['`df` holds the till lines, including:', { code: 'the drink, as a short till code' }], ['`names` is a dict from each code to its drink name.']],
    want: ['Add a column `drink` with the name for each code', 'A code that isn\'t in `names` gets the drink `"unknown"`'],
    out: 'Return the whole of `df` with `drink` added, the rows in the same order.',
  },
  p23: {
    get: [['`df` holds the customer feedback, including:', { rating: 'out of 5, missing on some cards' }]],
    want: ['Count the ratings of **4 or more**', 'A missing rating is not a good rating'],
    out: 'Return the count as an integer.',
    fine: ['A rating of exactly 4.0 counts.'],
  },
  p24: {
    get: [['`df` holds the sales, including:', { city: 'where the sale was made, missing on some rows' }]],
    want: ['Find every distinct city name, each once', 'Leave out the rows with no city'],
    out: 'Return a **sorted list** of the names.',
  },
  p25: {
    get: [['`jan` and `feb` hold January\'s and February\'s till exports. They have the same columns, though not necessarily in the same order.']],
    want: ['Put all of January\'s rows first, then all of February\'s', 'Add a column `month` that says `"jan"` or `"feb"` for each row'],
    out: 'Return one DataFrame, with January\'s rows first.',
  },
  p26: {
    get: [['`df` holds the daily takings:', { date: 'the day', city: 'which café', revenue: 'that day\'s takings' }]],
    want: ['Find the rows where revenue is **over 100**', 'Keep every column'],
    out: 'Return them highest revenue first. When two rows have the same revenue, the earlier date comes first.',
  },
  p27: {
    get: [['`df` holds the customer list, including:', { email: 'as typed at sign-up; some are absent, empty or nothing but spaces' }]],
    want: ['Work out the share of rows with no usable email', 'An email counts as missing if it\'s absent, empty (`""`), or nothing but spaces'],
    out: 'Return a **percentage**, rounded to 1 decimal place: `42.9`, not `0.429`.',
  },
  p37: {
    get: [['`df` holds the happy hour sales:', { item: 'what was sold', price: 'its full price', discount: 'a fraction, so `0.25` means 25% off; missing means no discount' }]],
    want: ['Work out the price after the discount, in a new column `final`', 'Round `final` to 2 places'],
    out: 'Return the whole of `df` with `final` added, the rows in the same order.',
  },
  p38: {
    get: [['`df` holds the customer list, including:', { name: 'the customer\'s name, some saved with spaces around them' }]],
    want: ['Ignore the spaces around each name', 'Find the longest name'],
    out: 'Return the longest name, without its spaces. If several are equally long, return the one first in alphabetical order.',
  },
  p39: {
    get: [['`df` holds the daily sales:', { date: 'the day', cups: 'cups sold that day' }]],
    want: ['Add up the cups sold on each weekday, over all the weeks'],
    out: 'Return the name of the weekday with the most cups **in total**, like `"Monday"`. If two weekdays tie, the one earlier in the week wins, counting from Monday.',
  },
  p40: {
    get: [['`df` holds the week\'s delivery log. Any column can have gaps.']],
    want: ['Find the rows with **at least one** missing value, in any column', 'Keep every column'],
    out: 'Return those rows, in their original order.',
  },
  alg01: {
    get: [['`code` is an order code, as text.']],
    want: ['Ignore capitals, and anything that isn\'t a letter or a digit', 'Check whether what\'s left spells the same both ways: `"Tab-4-bat"` does'],
    out: 'Return `True` or `False`.',
    fine: ['An empty code counts as reading the same both ways.'],
  },
  alg02: {
    get: [['`amounts` is the list of amounts added to the tab, in order. A refund is negative.']],
    want: ['For each position, add that amount to everything before it'],
    out: 'Return a list of the same length: the tab so far, after each amount.',
    fine: ['An empty list gives an empty list.', 'Adding everything up again for each position works, but one pass is enough.'],
  },
  alg03: {
    get: [['`visits` lists customer names in the order they walked in today.']],
    want: ['Find the first name to walk in for a **second** time'],
    out: 'Return that name, or `None` if nobody came back.',
    fine: ['"First" means the earliest second visit. In `["Ada", "Kofi", "Kofi", "Ada"]` it\'s Kofi, whose second visit comes before Ada\'s.'],
  },
  alg04: {
    get: [['`tickets` holds every ticket number from 1 to n except one, in any order.']],
    want: ['Find the number that\'s missing'],
    out: 'Return the missing number.',
    fine: ['n is one more than the length of the list, so the missing one can be 1, or n itself.', 'It can be done without sorting: what should 1 to n add up to?'],
  },
  alg05: {
    get: [['`a` and `b` are the times, in minutes after opening, that customers joined each queue. Each list is already sorted.']],
    want: ['Combine them into one sorted list', 'Try walking along both lists together, rather than sorting again'],
    out: 'Return one sorted list of all the times.',
    fine: ['Either list can be empty.', 'Equal times from both lists both stay.'],
  },

  // ── Python, medium ──
  p09: {
    get: [['`df` holds the sales, one row per sale:', { city: 'which café', drink: 'what was sold', revenue: 'what it brought in' }]],
    want: ['Add up each drink\'s revenue in each city', 'Pick the drink with the highest **total** in each city'],
    out: 'Return a DataFrame with columns `city` and `drink`, one row per city. If two drinks tie, pick the one first alphabetically. Row order doesn\'t matter.',
    fine: ['Total per drink, not the single biggest sale.'],
  },
  p10: {
    get: [['`df` holds the daily takings:', { city: 'which café', revenue: 'that row\'s takings' }]],
    want: ['Divide each row\'s revenue by the **total revenue of its own city**', 'Put it in a new column `share`, rounded to 3 decimal places'],
    out: 'Return every original column plus `share`, in the original row order.',
  },
  p11: {
    get: [['`df` holds the takings, one row per day, not necessarily sorted:', { date: 'the day', revenue: 'that day\'s takings' }]],
    want: ['Add up the revenue for each calendar month', 'Work out `change`: the fractional change from the month before, rounded to 3 decimal places'],
    out: 'Return one row per month, earliest first, with columns `month` (text like `"2024-01"`), `revenue` and `change`. The first month has no month before it, so its `change` is missing.',
    fine: ['The data can span more than one year.'],
  },
  p12: {
    get: [['`orders` holds one row per order:', { customer_id: 'who placed it', amount: 'what it came to' }], ['`customers` holds one row per customer:', { customer_id: 'their id', name: 'their name' }]],
    want: ['Add up the amount spent by **every** customer', 'Customers with no orders show a total of 0', 'Ignore orders whose `customer_id` isn\'t in `customers`'],
    out: 'Return columns `name` and `total`. Row order doesn\'t matter.',
  },
  p13: {
    get: [['`df` holds the menu, including:', { price: 'each item\'s price, missing for some' }]],
    want: ['Find the second-highest **distinct** price', 'Missing prices don\'t count'],
    out: 'Return that price, or `None` if there isn\'t one (every price is the same, or there\'s only one).',
  },
  p14: {
    get: [['`df` holds the gradebook in long form, one row per trainee per subject:', { student: 'the trainee', subject: 'the subject', score: 'their score in it' }]],
    want: ['Turn it wide: one row per student, one column per subject holding that score', 'A student with no score for a subject gets a missing value there'],
    out: 'Return a `student` column (a real column, not the index), then one column per subject. Row order doesn\'t matter.',
  },
  p15: {
    get: [['`df` holds one row for every edit to a customer\'s record, not in time order:', { user_id: 'the customer', updated_at: 'when the edit was made', email: 'their email after that edit' }]],
    want: ['Keep only each user\'s **most recent** row'],
    out: 'Return columns `user_id` and `email`. Row order doesn\'t matter.',
  },
  p16: {
    get: [['`df` holds the purchases, including:', { spend: 'what the customer spent' }]],
    want: ['Add a column `band`: `"low"` below 10, `"mid"` from 10 up to but **not including** 30, and `"high"` for 30 and over'],
    out: 'Return every original column plus `band`, in the original row order.',
    fine: ['Exactly 10 is mid. Exactly 30 is high.'],
  },
  p17: {
    get: [['`df` holds the daily takings:', { city: 'which café', revenue: 'that day\'s takings' }]],
    want: ['Rank each row\'s revenue **within its own city**, highest first, in an integer column `rank`', 'Ties share a rank, and the next rank follows straight on: `1, 1, 2`, not `1, 1, 3`'],
    out: 'Return every original column plus `rank`, in the original row order.',
  },
  p28: {
    get: [['`customers` holds the loyalty members:', { id: 'their id', name: 'their name' }], ['`orders` holds one row per order:', { customer_id: 'who placed it' }]],
    want: ['Find the customers who have never placed an order'],
    out: 'Return a **sorted list** of their names.',
    fine: ['Customer ids are not the same as the row numbers.'],
  },
  p29: {
    get: [['`df` holds the takings, one row per city per day, **not** in date order:', { date: 'the day', city: 'which café', revenue: 'that day\'s takings' }]],
    want: ['Add `running`: that city\'s total revenue so far, up to and including that day', '"So far" means in date order, whatever order the rows arrive in'],
    out: 'Return every row with `running` added, in the original row order.',
  },
  p30: {
    get: [['`df` holds the sales, one row per sale:', { city: 'which café', drink: 'what was sold', revenue: 'what it brought in' }]],
    want: ['Add up each drink\'s revenue in each city', 'Find each city\'s **two** best-selling drinks by that total', 'If drinks tie for a place, the one first in the alphabet wins it'],
    out: 'Return columns `city`, `drink` and `revenue` (the total). At most two rows per city, even with a tie; a city with only one drink gets one row. Row order doesn\'t matter.',
  },
  p31: {
    get: [['`df` holds one row per visit, unsorted:', { customer: 'who visited', date: 'the day of the visit' }]],
    want: ['For every visit, count the days since that customer\'s **previous** visit, in `gap_days`', 'A customer\'s first visit has no previous one, so its `gap_days` is missing, not 0'],
    out: 'Return columns `customer`, `date` and `gap_days`, sorted by customer and then date.',
  },
  p32: {
    get: [['`df` holds the sales, one row per sale:', { city: 'which café', revenue: 'what the sale brought in' }]],
    want: ['Find the cities with **at least 3 sales**', '...and an **average revenue above 150**, taken over all of their sales'],
    out: 'Return a **sorted list** of those cities.',
    fine: ['Exactly 3 sales is enough. An average of exactly 150 is not.'],
  },
  p33: {
    get: [['`df` holds the orders:', { order_id: 'the order', tags: 'the extras, typed by hand, like `"Oat, extra shot"`; some orders have none' }]],
    want: ['Split the tags on commas: one row per order per tag', 'Strip the spaces around each tag and make it lower case', 'Drop empty tags, and if an order lists the same tag twice, keep it once'],
    out: 'Return columns `order_id` and `tag`. Row order doesn\'t matter.',
  },
  p41: {
    get: [['`df` holds the exam results, one row per mark:', { student: 'the trainee', subject: 'the subject', mark: 'the mark; a resit adds a second mark for the same subject' }]],
    want: ['Keep the **higher** mark for any subject a student resat', 'Turn it wide: one row per student, one column per subject', 'A subject a student never took is missing'],
    out: 'Return one row per student, sorted by student: a `student` column, then the subjects in alphabetical order.',
    fine: ['Column order matters.'],
  },
  p42: {
    get: [['`df` holds the fridge readings, already in time order, with the fridges mixed together:', { device: 'which fridge', ts: 'when the reading was taken', reading: 'what it read, missing now and then' }]],
    want: ['Fill each missing reading with the **same device\'s** previous reading', 'A device with nothing before its gap stays missing'],
    out: 'Return the whole table, with the rows in the same order.',
  },
  p43: {
    get: [['`df` holds the daily sales, not in order:', { date: 'the day', sales: 'that day\'s sales' }]],
    want: ['Add up the sales for each month', 'Work out `change_pct`: the percentage change from the month before, rounded to 1'],
    out: 'Return one row per month, in order: `month` (text like `"2024-01"`), `total` and `change_pct`. The first month has no month before it.',
    fine: ['Every month has at least one sale.'],
  },
  p44: {
    get: [['`df` holds the purchases, one row each:', { customer: 'who bought', amount: 'what they spent' }]],
    want: ['Work out each customer\'s own average purchase', 'Find the purchases **above** that customer\'s average'],
    out: 'Return those purchases with all their columns. Row order doesn\'t matter.',
    fine: ['Equal to the average is not above it.'],
  },
  p45: {
    get: [['`df` holds the customer list, including:', { name: 'the full name, typed by hand: sometimes with extra spaces, sometimes a middle name, sometimes just one word' }]],
    want: ['Add `first`: the first word of the name', 'Add `last`: the last word', 'A one-word name has no last name, so leave it missing'],
    out: 'Return the whole table with both columns added, the rows in the same order.',
  },
  alg06: {
    get: [['`prices` lists what each item costs, in pence.'], ['`voucher` is what the voucher is worth, in pence.']],
    want: ['Count the **pairs** of different items that add up to exactly `voucher`', 'Two items with the same price are still different items, so every pair of positions counts once'],
    out: 'Return the number of pairs.',
    fine: ['`[100, 100, 100]` with a voucher of 200 has 3 pairs.', 'One pass with a dict of how many of each price you have seen beats a loop inside a loop.'],
  },
  alg07: {
    get: [['`drinks` lists what one regular ordered, day by day.']],
    want: ['Find the longest run of **consecutive** days in which no drink was ordered twice'],
    out: 'Return its length.',
    fine: ['An empty list gives 0.', 'Keep a window of days with no repeats. When a repeat comes in, move the window\'s start just past the earlier copy, but never backwards.'],
  },
  alg08: {
    get: [['`cups` holds the cups sold in each hour of the day, in order.'], ['`k` is how many hours in a row the extra barista works.']],
    want: ['Find the most cups sold in any `k` consecutive hours'],
    out: 'Return that number.',
    fine: ['With fewer than k hours, return the total of them all.', 'Slide a window along: add the hour coming in and take off the hour going out.'],
  },
  alg09: {
    get: [['`commands` is the list of till buttons pressed, in order: `"add 350"` adds 350 pence, `"undo"` cancels the most recent add that\'s still standing, and `"clear"` wipes the whole bill.']],
    want: ['Replay the commands in order', 'An undo with nothing left to undo does nothing'],
    out: 'Return the total, in pence, after all the commands.',
    fine: ['After a clear there is nothing to undo.', 'Two undos in a row cancel the last two adds.'],
  },
  alg10: {
    get: [['`cups` holds the cups sold each day.']],
    want: ['For each day, count the days until a day with **more** cups', 'If no busier day comes, that day gets 0'],
    out: 'Return the list of counts, one per day.',
    fine: ['Two loops, one inside the other, work but slow down on long lists. A stack of the days still waiting for a busier one does it in a single pass.'],
  },
  alg11: {
    get: [['`running` holds the takings so far at the end of each day of the year. It never goes down, since takings only add up.'], ['`target` is the year\'s target.']],
    want: ['Find the first day on which the running total reached at least `target`'],
    out: 'Return that day\'s position in the list, or -1 if it never did.',
    fine: ['The list is sorted, so there\'s no need to look at every day: halve.', 'Several days can share a total; you want the first of them.'],
  },
  p53: {
    get: [['`df` holds the sales, one row per sale:', { item: 'what was sold', qty: 'how many were sold', price: 'what each went for that day' }]],
    want: ['Work out each item\'s average price **per unit sold**, weighted by `qty`', 'Don\'t round it'],
    out: 'Return columns `item` and `avg_price`.',
    fine: ['A plain mean of the price column counts a sale of 1 cup the same as a sale of 50.', 'Every item sold at least one unit, though a row can have a qty of 0.'],
  },
  p54: {
    get: [['`df` holds the prices, one row per item per day, in no particular order:', { item: 'the item', date: 'the day', price: 'its price that day' }]],
    want: ['Keep each item\'s first row', 'Keep every row where its price differs from **that item\'s** price on the day before'],
    out: 'Return columns `item`, `date` and `price`. Row order doesn\'t matter.',
    fine: ['A price can change and later change back: both changes count.'],
  },
  p56: {
    get: [['`df` holds the daily sales:', { store: 'which café', date: 'the day', sales: 'that day\'s sales' }]],
    want: ['Work out each store\'s average and standard deviation of sales, using pandas\' `.std()` as it comes (it divides by n − 1)', 'Find the rows more than 2 standard deviations from **that store\'s** average, above or below'],
    out: 'Return columns `store`, `date` and `sales`. Row order doesn\'t matter.',
    fine: ['A store with a single day has no spread to measure, so none of its rows are unusual.'],
  },
  alg16: {
    get: [['`bookings` is a list of pairs `[start, end]` in minutes. Each holds a table from start up to, but not including, end.']],
    want: ['Work out the fewest tables needed so that no two overlapping bookings share one'],
    out: 'Return that number.',
    fine: ['A booking ending at 30 and one starting at 30 can share a table.', 'No bookings means no tables.'],
  },
  alg18: {
    get: [['`words` lists the jar labels: lower case, with no spaces.']],
    want: ['Group the words made of exactly the same letters, like "tea" and "eat"', 'Every word is in exactly one group, even if it\'s alone'],
    out: 'Return a list of lists: each group sorted A to Z, and the groups in order of their first word.',
    fine: ['A word that appears twice appears twice in its group.'],
  },

  // ── Python, hard ──
  p18: {
    get: [['`df` holds the daily sales: at most one row per date, not sorted, with some dates missing entirely:', { date: 'the day', sold: 'how much sold that day' }]],
    want: ['Find the longest run of **consecutive calendar days** on which `sold` was above zero', 'A missing date breaks a run, just like a day with nothing sold'],
    out: 'Return its length as an integer, and `0` if nothing was ever sold.',
  },
  p19: {
    get: [['`df` holds the sales, one row per store per trading day, unsorted:', { store: 'which café', date: 'the day', sales: 'that day\'s sales' }]],
    want: ['Work out `avg7`: the mean of that store\'s sales over the **7 calendar days ending on that date**', 'Days a store didn\'t trade simply aren\'t in the window', 'Round `avg7` to 2 decimal places'],
    out: 'Return columns `store`, `date` and `avg7`, sorted by store and then date.',
    fine: ['Seven calendar days, not seven rows.'],
  },
  p20: {
    get: [['`orders` holds one row per order:', { customer: 'who ordered', drink: 'what they ordered' }], ['`menu` is a plain Python list of drinks.']],
    want: ['Find the customers who have ordered every drink on the menu at least once', 'Drinks that aren\'t on the menu don\'t count towards anything'],
    out: 'Return a **sorted list** of those customers.',
    fine: ['The menu might list a drink twice.'],
  },
  p21: {
    get: [['`events` holds one row per click in the app, unsorted:', { user: 'who clicked', ts: 'when, as a timestamp' }]],
    want: ['Split each user\'s clicks into sessions: a gap of **more than 30 minutes** since their previous click starts a new one', 'Number each user\'s sessions 1, 2, 3… in time order', 'Count the clicks in each session'],
    out: 'Return columns `user`, `session` and `events` (how many clicks were in that session). Row order doesn\'t matter.',
    fine: ['A gap of exactly 30 minutes stays in the same session.'],
  },
  p34: {
    get: [['`sales` holds the sales, unsorted:', { ts: 'when it was sold', drink: 'what was sold', cups: 'how many' }], ['`prices` logs every price change, unsorted. From that moment on, that drink costs that much:', { ts: 'when the price changed', drink: 'which drink', price: 'its new price' }]],
    want: ['Give each sale the price its drink had **when it was sold**', 'A sale at the exact moment of a change gets the new price', 'A sale before a drink\'s first logged price gets a missing price'],
    out: 'Return columns `ts`, `drink`, `cups` and `price`, sorted by `ts`.',
  },
  p35: {
    get: [['`bookings` holds the booth bookings, in no particular order:', { room: 'which booth', start: 'the hour it starts', end: 'the hour it ends, always after `start`' }]],
    want: ['Find the booths where two bookings overlap', 'One booking ending at 11 and the next starting at 11 is fine: touching isn\'t overlapping', 'Bookings in different booths never clash'],
    out: 'Return a **sorted list** of those rooms.',
  },
  p36: {
    get: [['`visits` holds one row per visit, unsorted, dates only:', { customer: 'who visited', date: 'the day' }]],
    want: ['Put each customer in a **cohort**: the month of their first ever visit, like `"2024-01"`', 'A customer **returned** if they came back on a later day within 30 days of that first visit'],
    out: 'Return one row per cohort: `cohort`, `customers` (how many are in it) and `returned` (the share who returned, between 0 and 1, rounded to 2 places). Row order doesn\'t matter.',
    fine: ['A second visit on the same day as the first doesn\'t count.', 'Exactly 30 days later counts; 31 doesn\'t.'],
  },
  p46: {
    get: [['`df` holds the shifts, in no particular order:', { person: 'the barista', start: 'the hour the shift starts', end: 'the hour it ends, always after `start`' }]],
    want: ['Merge each person\'s shifts that overlap **or touch** into single blocks: 9 to 11 and 11 to 12 become 9 to 12'],
    out: 'Return columns `person`, `start` and `end`. Row order doesn\'t matter.',
    fine: ['A shift can sit entirely inside another.'],
  },
  p47: {
    get: [['`df` holds the prices, one row per product per day, not in order, with no days missing:', { product: 'the product', day: 'a whole number', price: 'its price that day' }]],
    want: ['Find each product\'s longest run of consecutive days where the price went **up** every day', 'A single day is a run of 1'],
    out: 'Return columns `product` and `longest`. Row order doesn\'t matter.',
    fine: ['A flat day (the same price) ends a run.'],
  },
  p48: {
    get: [['`df` holds the sales, one row per sale:', { category: 'what kind of product', revenue: 'what the sale brought in' }]],
    want: ['Add up each category\'s revenue', 'Keep the top 3 categories, biggest first; a tie goes alphabetically', 'Add one row, `"other"`, holding the total of every remaining category'],
    out: 'Return the top three followed by the `"other"` row. With 3 categories or fewer, there\'s no `"other"` row.',
  },
  p49: {
    get: [['`df` is the coffee card ledger, not in order:', { account: 'the card', ts: 'when the move happened', amount: 'top-ups (deposits) positive, spending (withdrawals) negative' }]],
    want: ['Each account starts at 0', 'Follow each account\'s running balance in time order', 'Find the move that first took it **below zero**'],
    out: 'Return `account` and `first_negative` (the `ts` of that move) for every account that ever went below zero, leaving the rest out. Row order doesn\'t matter.',
    fine: ['A balance of exactly 0 is not overdrawn.'],
  },
  p50: {
    get: [['`df` holds the orders, one row per line of an order:', { order_id: 'the order', product: 'what was on that line' }]],
    want: ['Count a product once per order, even if it appears twice', 'Find the pairs of products bought in the same order in **at least 2** orders'],
    out: 'Return `product_a` and `product_b` (alphabetical, a before b) and `n`, the number of orders with both, sorted by `n` high to low, then `product_a`, then `product_b`.',
  },
  alg12: {
    get: [['`coins` lists the coin values the till has, in pence, with as many of each as it needs.'], ['`amount` is the change to give, in pence.']],
    want: ['Count the different ways to make exactly `amount`', 'Only which coins you use counts, not their order: 2 + 1 and 1 + 2 are the same way'],
    out: 'Return the number of ways.',
    fine: ['Making 0 has exactly one way: no coins at all.', 'Take the coins one kind at a time, and build up the number of ways for every amount from 0.'],
  },
  alg13: {
    get: [['`weights` and `values` give each parcel\'s weight in kilograms and its value, at the same positions.'], ['`capacity` is the most the bag holds, in kilograms.']],
    want: ['Choose the parcels to take', 'A parcel goes in whole, or not at all'],
    out: 'Return the biggest total value that fits.',
    fine: ['Picking by value per kilo can be fooled. Try it on paper first.', 'Build the best value for every capacity from 0 up, taking each parcel at most once.'],
  },
  alg14: {
    get: [['`grid` is the kitchen, a list of strings, one per row: `.` is floor, `#` is a counter you can\'t walk through, `S` is where you start and `E` is the way out.']],
    want: ['Move one square up, down, left or right per step', 'Find the fewest steps from S to E'],
    out: 'Return that number, or -1 if there\'s no way through.',
    fine: ['No diagonal moves.', 'Breadth-first search finds the fewest steps: every square one step away first, then two, and so on.'],
  },
  alg15: {
    get: [['`steps` lists the recipe\'s steps by name.'], ['`rules` holds pairs `(a, b)`: step a has to be done before step b.']],
    want: ['Put the steps in an order that obeys every rule', 'When more than one step could go next, take the one first alphabetically', 'If the rules go round in a circle, no order works'],
    out: 'Return the steps in order, or an empty list if no order works.',
    fine: ['A step can go next once every step it waits for is done.', 'A heap always hands you the alphabetically first of the steps that are ready.'],
  },
  p51: {
    get: [['`df` holds the sales, one row per sale, so a product can appear many times:', { product: 'what was sold', sales: 'what the sale brought in' }]],
    want: ['Add up each product\'s sales', 'Take the products biggest total first (ties by name, A to Z) until together they reach at least 80% of all sales'],
    out: 'Return that **shortest list of products**, biggest first.',
    fine: ['The product that takes the running total to 80% or past it is in the list.', 'If one product alone reaches 80%, the list is just that one.'],
  },
  p52: {
    get: [['`df` holds the sales, but only for days with sales: a quiet day has no row at all, and each store has at most one row per day:', { store: 'which café', date: 'the day', sales: 'that day\'s sales' }]],
    want: ['Fill in every day from **that store\'s** first date to its last', 'Give the days that were missing sales of 0'],
    out: 'Return columns `store`, `date` and `sales`. Row order doesn\'t matter.',
    fine: ['Each store has its own range: don\'t fill in before its first day or after its last.'],
  },
  p55: {
    get: [['`invoices` holds the catering invoices:', { invoice_id: 'the invoice, lower ids being older', customer: 'the client', amount: 'what it\'s for' }], ['`payments` holds one row per payment:', { customer: 'who paid', amount: 'how much' }]],
    want: ['Each payment pays that customer\'s **oldest unpaid invoice of exactly that amount** (the lowest `invoice_id`)', 'A payment that matches no unpaid invoice pays nothing'],
    out: 'Return every invoice with `paid`, True or False: columns `invoice_id` and `paid`. Row order doesn\'t matter.',
    fine: ['Two payments of 20 pay two invoices of 20, oldest first.'],
  },
  alg17: {
    get: [['`prices` is a list of numbers, one per day.']],
    want: ['Find the longest set of days, kept in order but not necessarily next to each other, where every price is **strictly higher** than the one before'],
    out: 'Return its length.',
    fine: ['For [3, 1, 4, 1, 5, 9, 2, 6], one longest climb is 1, 4, 5, 9: length 4.', 'An empty list has a climb of 0.'],
  },
  alg19: {
    get: [['`roads` is a list of `[a, b, minutes]`: a road between stops a and b, usable both ways, that takes that many minutes. Stops are named with text.'], ['`start` and `end` are the two stops.']],
    want: ['Find the fewest minutes from `start` to `end`'],
    out: 'Return that number, or -1 if `end` can\'t be reached.',
    fine: ['The route with the fewest stops isn\'t always the fastest.', 'From a stop to itself takes 0 minutes.'],
  },

  // ── SQL, easy ──
  s01: {
    get: [['`menu` holds the drinks:', { drink: 'the drink', price: 'what it costs' }]],
    want: ['Find every drink costing **less than 3.00**'],
    out: 'Return `drink` and `price`, cheapest first. Drinks at the same price go in alphabetical order.',
    fine: ['Exactly 3.00 isn\'t less than 3.00.'],
  },
  s02: {
    get: [['`orders` holds one row per order:', { order_id: 'the order', customer: 'who placed it', drink: 'what they ordered' }]],
    want: ['Count the orders each customer placed'],
    out: 'Return one row per customer, with columns `customer` and `orders` (the count, named exactly that). Row order doesn\'t matter.',
  },
  s03: {
    get: [['`customers` holds the customer list:', { name: 'their name', phone: 'their number: NULL when missing, and a few saved as an empty string `\'\'` by mistake' }]],
    want: ['Find every customer with no phone', 'An empty string counts as missing too'],
    out: 'Return the `name` of each, in alphabetical order.',
  },
  s04: {
    get: [['`sales` holds the sales:', { sale_id: 'the sale', amount: 'what it came to' }]],
    want: ['Find the **3** largest sales'],
    out: 'Return `sale_id` and `amount`, biggest first. When two amounts tie, the smaller `sale_id` comes first. With fewer than 3 sales, return them all.',
  },
  s13: {
    get: [['`customers` holds the customer list:', { name: 'their name', city: 'where they live, NULL for customers who never said' }]],
    want: ['List each city **once**', 'Leave out the NULLs'],
    out: 'Return one column, `city`, in alphabetical order.',
  },
  s14: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', status: 'typed by hand, so `\'Cancelled\'` and `\' CANCELLED\'` mean cancelled too' }]],
    want: ['Count the cancelled orders, however the status was typed'],
    out: 'Return one row with one column, `cancelled`.',
  },
  s15: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', price: 'what it costs' }]],
    want: ['Find every product whose name contains **mug** anywhere, in any capitals'],
    out: 'Return `name` and `price`, cheapest first, then by name.',
  },
  s16: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', placed_at: 'a date **and** a time, as text like `\'2024-03-31 18:20\'`', total: 'what it came to' }]],
    want: ['Find every order placed in March 2024'],
    out: 'Return `order_id` and `placed_at`, in time order.',
    fine: ['An order at 18:20 on the 31st is still in March.'],
  },
  s17: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', category: 'its shelf', price: 'what it costs, NULL when not set yet' }]],
    want: ['Find the cheapest and the dearest price in each category'],
    out: 'Return `category`, `cheapest` and `dearest`. Row order doesn\'t matter.',
  },
  s18: {
    get: [['`payments` holds the payments:', { payment_id: 'the payment', amount: 'what it came to: refunds are negative, and 0 is a voided payment' }]],
    want: ['Average only the actual sales: the positive amounts'],
    out: 'Return one row, `avg_sale`, rounded to 2.',
  },
  s19: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', category: 'its shelf' }]],
    want: ['Count the products in each category', 'Find the category with the most'],
    out: 'Return one row: `category` and `products` (how many). If categories tie, the one first in the alphabet wins.',
  },
  s20: {
    get: [['`people` holds the guest list:', { first: 'first name, sometimes saved with spaces around it', last: 'last name, the same' }]],
    want: ['Join first and last with one space between, and no stray spaces'],
    out: 'Return one column, `full_name`, sorted by last name, then first name.',
  },
  s21: {
    get: [['`vouchers` holds the codes used:', { id: 'the voucher use', code: 'typed by hand, so `"save10"`, `" SAVE10"` and `"Save10 "` are all the same code' }]],
    want: ['Clean each code: no spaces around it, and in capitals', 'Keep each cleaned code once'],
    out: 'Return one sorted column, `code`.',
  },
  s22: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', price: 'what it costs' }]],
    want: ['Find the **2nd and 3rd** most expensive products'],
    out: 'Return `name` and `price`, dearest first. Products at the same price go in alphabetical order.',
  },
  s23: {
    get: [['`customers` holds the customer list:', { name: 'their name', city: 'where they live: NULL, or blank (`\'\'`), when missing' }]],
    want: ['Show every missing city, NULL or blank, as `\'unknown\'`'],
    out: 'Return `name` and `city` for everyone, sorted by name.',
  },
  s24: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', placed_at: 'when, as text like `\'2024-03-02 09:15\'`' }]],
    want: ['Count the orders placed each day'],
    out: 'Return `day` (like `\'2024-03-02\'`) and `orders`, in date order.',
  },
  s25: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', category: 'its shelf', price: 'what it costs' }]],
    want: ['Find the products in the `beans` **or** `kit` category', '...that cost **less than 20**'],
    out: 'Return `name`, `category` and `price`, cheapest first, then by name.',
  },
  s26: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', placed_at: 'when, as text like `\'2024-03-02 09:15\'`' }]],
    want: ['Count the orders in each hour of the day', 'Find the hour with the most'],
    out: 'Return one row: `hour` (a whole number, 0 to 23) and `orders`. If two hours tie, the earlier hour wins.',
  },

  // ── SQL, medium ──
  s05: {
    get: [['`sales` holds one row per sale:', { city: 'which café', amount: 'what the sale came to' }]],
    want: ['Add up each city\'s sales', 'Keep the cities whose total is **at least 500**'],
    out: 'Return `city` and `total`. Row order doesn\'t matter.',
    fine: ['Exactly 500 counts.'],
  },
  s06: {
    get: [['`customers` holds the loyalty members:', { id: 'their id', name: 'their name' }], ['`orders` holds the orders:', { order_id: 'the order', customer_id: 'who placed it, NULL for guest checkouts' }]],
    want: ['Find every customer who has never placed an order', 'Guest orders belong to nobody'],
    out: 'Return their `name`, in alphabetical order.',
  },
  s07: {
    get: [['`reviews` holds the drink reviews:', { drink: 'the drink', rating: 'the rating, NULL when left blank' }]],
    want: ['For **every** drink that appears, even one nobody rated:', 'Average the ratings given, rounded to 2', 'Count how many ratings were actually given'],
    out: 'Return `drink`, `avg_rating` and `rated`. Row order doesn\'t matter.',
    fine: ['A drink with no ratings has an average of NULL and a `rated` of 0.'],
  },
  s08: {
    get: [['`sales` holds the sales, running across a new year:', { sale_date: 'the day, as text like `\'2025-01-15\'`', amount: 'what it came to' }]],
    want: ['Add up the sales for each month'],
    out: 'Return `month` (like `2025-01`) and `total`, in month order.',
  },
  s09: {
    get: [['`menu` holds the drinks:', { drink: 'the drink', price: 'what it costs' }]],
    want: ['Put each drink in a band: `budget` under 3, `standard` from 3 up to and including 5, `premium` over 5', 'Count the drinks in each band'],
    out: 'Return `band` and `drinks`, for the bands that have any. Row order doesn\'t matter.',
    fine: ['3.00 is standard. 5.00 is standard too.'],
  },
  s27: {
    get: [['`menu` holds the drinks. Several can share a price:', { drink: 'the drink', price: 'what it costs' }]],
    want: ['Find the second-highest **different** price'],
    out: 'Return one row with one column, `price`. If there\'s no second price, the row holds NULL.',
  },
  s28: {
    get: [['`signups` holds the loyalty sign-ups:', { signup_id: 'the sign-up', email: 'as typed, with capitals and spaces that vary' }]],
    want: ['Clean each email: trimmed and lower case', 'Find the emails used more than once'],
    out: 'Return `email` (cleaned) and `n`, how many times it was used. Row order doesn\'t matter.',
  },
  s29: {
    get: [['`order_items` holds the order lines:', { order_id: 'the order', product_id: 'the product', qty: 'how many' }], ['`products` holds the products:', { product_id: 'the product', name: 'its name', price: 'what it costs' }]],
    want: ['Work out each order\'s total: qty × price over all its lines', 'Keep the orders whose total is **over 50**'],
    out: 'Return `order_id` and `total`. Row order doesn\'t matter.',
    fine: ['Exactly 50 isn\'t over 50.'],
  },
  s30: {
    get: [['`customers` holds the customers:', { customer_id: 'their id', name: 'their name' }], ['`orders` holds the orders:', { order_id: 'the order', customer_id: 'who placed it', order_date: 'the day, as text like `\'2024-03-05\'`' }]],
    want: ['Find every customer who placed **no order in March 2024**, whether or not they ordered in other months'],
    out: 'Return their `name`, in alphabetical order.',
  },
  s31: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', city: 'where it went', status: 'what happened to it, NULL for some' }]],
    want: ['For each city, count the orders that were delivered', '...and cancelled', '...and `other`: everything else, **including** orders with no status'],
    out: 'Return `city`, `delivered`, `cancelled` and `other`. Row order doesn\'t matter.',
  },
  s32: {
    get: [['`orders` holds the online orders:', { order_id: 'the order', city: 'where it went', status: 'what happened to it' }]],
    want: ['Work out the percentage of each city\'s orders that were cancelled'],
    out: 'Return `city` and `cancel_pct`, rounded to 1 (so `33.3`, not `0.333` or `33`). Row order doesn\'t matter.',
  },
  s33: {
    get: [['`orders` holds the orders:', { order_id: 'the order; ids were not handed out in date order', customer_id: 'the client', order_date: 'the day' }]],
    want: ['Find each customer\'s latest order', 'Two orders on the same latest day: the larger `order_id` wins'],
    out: 'Return `customer_id`, `order_id` and `order_date`. Row order doesn\'t matter.',
  },
  s34: {
    get: [['`staff` holds everyone who works at the café:', { staff_id: 'their id', name: 'their name', manager_id: 'the `staff_id` of their manager, NULL for the person at the top' }]],
    want: ['Put each person next to their manager\'s name'],
    out: 'Return `name` and `manager` (NULL for the top person) for everyone, sorted by name.',
  },
  s35: {
    get: [['`logins` holds the app logins. Someone can log in several times a day:', { username: 'who', day: 'the day, as text like `\'2024-01-31\'`' }]],
    want: ['Find every user who logged in on **two consecutive calendar days** at least once'],
    out: 'Return each `username` once, in alphabetical order.',
  },
  s36: {
    get: [['`sales` holds the sales, January to March 2024:', { product: 'what was sold', sale_date: 'the day, as text', amount: 'what it came to' }]],
    want: ['Add up each product\'s sales in each month', 'A month with no sales shows **0**, not NULL'],
    out: 'Return one row per product: `product`, `jan`, `feb` and `mar`. Row order doesn\'t matter.',
  },
  s37: {
    get: [['`products` holds the shop\'s products:', { name: 'the product', category: 'its shelf', price: 'what it costs' }]],
    want: ['Work out each category\'s average price', 'Find the products priced **above** their own category\'s average'],
    out: 'Return `name`, `category` and `price`. Row order doesn\'t matter.',
    fine: ['Equal to the average isn\'t above it.'],
  },
  s38: {
    get: [['`customers` holds the customers:', { customer_id: 'their id', name: 'their name' }], ['`orders` holds the orders:', { order_id: 'the order', customer_id: 'who placed it', order_date: 'the day' }]],
    want: ['For **every** customer, including those who never ordered:', 'Find their earliest order date (NULL if none)', 'Count their orders (0 if none)'],
    out: 'Return `name`, `first_order` and `orders`. Row order doesn\'t matter.',
  },
  s39: {
    get: [['`sales` holds the sales, in no order:', { sale_id: 'the sale', product: 'what was sold', sale_date: 'the day' }]],
    want: ['For every sale, count the days until the **next** sale of the same product', 'A product\'s last sale gets NULL'],
    out: 'Return `sale_id`, `product` and `days_to_next`, sorted by product, date, then `sale_id`. Two sales on one day go in `sale_id` order, 0 days apart.',
  },
  s40: {
    get: [['`orders` holds the orders:', { order_id: 'the order', total: 'what it came to, never negative' }]],
    want: ['Put each order in a band of width 10: `0` for totals under 10, `10` for 10 up to (not including) 20, and so on', 'Count the orders in each band'],
    out: 'Return `band` and `orders`, in band order.',
    fine: ['A total of exactly 10.00 is in band 10.'],
  },
  s41: {
    get: [['`web` and `app` hold the people who joined on the website and in the app. Some joined on both, and the emails were typed with different capitals and spaces:', { email: 'their email', signed_up: 'when they joined' }]],
    want: ['Compare emails trimmed and in lower case', 'Count the different people across both tables'],
    out: 'Return one row: `people`.',
  },
  s52: {
    get: [['`monthly` holds one row per month:', { month: 'text like 2024-03', revenue: 'that month\'s takings, in whole numbers' }]],
    want: ['Work out `growth`: the percentage change from the month before, rounded to 1 place', 'The first month gets NULL'],
    out: 'Return `month`, `revenue` and `growth`, in month order.',
  },
  s53: {
    get: [['`orders` holds the orders:', { customer_id: 'who ordered', order_date: 'the day, as text, YYYY-MM-DD' }]],
    want: ['Find the customers who ordered in **both** January 2024 and February 2024'],
    out: 'Return one column, `customer_id`, smallest first.',
  },
  s56: {
    get: [['`spend` holds one row per customer:', { customer_id: 'the customer', amount: 'what they spent' }]],
    want: ['Split the customers into 4 groups by amount with NTILE, the biggest spenders in group 1', 'Break ties by `customer_id`', 'Count each group\'s customers and add up its amount'],
    out: 'Return `quartile`, `customers` and `total`, by quartile.',
  },

  // ── SQL, hard ──
  s10: {
    get: [['`sales` holds one row per sale, so each person appears many times:', { city: 'which café', rep: 'who made the sale', amount: 'what it came to' }]],
    want: ['Add up each person\'s sales in each city', 'Find the one with the highest **total** in each city', 'If people tie for the top, keep them all'],
    out: 'Return `city`, `rep` and `total`. Row order doesn\'t matter.',
  },
  s11: {
    get: [['`moves` is the coffee card ledger:', { move_id: 'the move; ids were handed out later, so they are **not** in time order', account: 'the card', ts: 'when, as text like `\'2024-01-01 09:00\'`', amount: 'top-ups (deposits) positive, spending (withdrawals) negative' }]],
    want: ['Work out each account\'s balance just after every move, in time order', 'Two moves at the same `ts` happened in `move_id` order'],
    out: 'Return `move_id`, `account` and `balance`, sorted by account, then time.',
  },
  s12: {
    get: [['`sales` holds the sales, unsorted, with several on some days:', { sale_date: 'the day, as text like `\'2024-01-30\'`', amount: 'what it came to' }]],
    want: ['Find every calendar date from the **first** sale date to the **last** on which nothing was sold'],
    out: 'Return them as one column, `day`, in date order.',
    fine: ['A table can only list dates that happened. The missing ones have to be generated.'],
  },
  s42: {
    get: [['`logins` holds the app logins. Several on one day count as one day:', { username: 'who', day: 'the day, as text like `\'2024-01-31\'`' }]],
    want: ['Find each user\'s longest run of consecutive calendar days with a login'],
    out: 'Return `username` and `longest`. Row order doesn\'t matter.',
  },
  s43: {
    get: [['`scores` holds the league results:', { team: 'the team', points: 'points from one round' }]],
    want: ['Find each team\'s median points: the middle value, or for an even count, the mean of the two middle values', 'SQLite has no MEDIAN function'],
    out: 'Return `team` and `median`. Row order doesn\'t matter.',
  },
  s44: {
    get: [['`daily` holds one row per trading day; some days have no row at all:', { day: 'the day, as text like `\'2024-01-08\'`', sales: 'that day\'s takings' }]],
    want: ['For every row, add up the sales over the **7 calendar days** ending on that day: that day and the 6 before'],
    out: 'Return `day` and `week_sales`, sorted by day.',
    fine: ['Seven calendar days, not seven rows.'],
  },
  s45: {
    get: [['`events` holds the shop\'s events. A user can have any mix of steps, in any number:', { username: 'who', step: '`\'view\'`, `\'cart\'` or `\'buy\'`' }]],
    want: ['Count the users at each stage, where each stage needs **all the ones before it**:', '`view`: users who viewed', '`cart`: users who viewed and carted', '`buy`: users who viewed, carted and bought'],
    out: 'Return `step` and `users`, one row per step. Row order doesn\'t matter.',
    fine: ['Someone who bought through a direct link without viewing doesn\'t count towards buy.'],
  },
  s46: {
    get: [['`orders` holds the orders, in no order:', { order_id: 'the order', customer_id: 'who placed it', order_date: 'the day' }]],
    want: ['Find each customer\'s first and second orders; two on the same day go in `order_id` order', 'Keep the customers whose **second** order came within 30 days of their first', 'Day 30 counts, and so does a second order on the same day as the first'],
    out: 'Return their `customer_id`, sorted.',
  },
  s47: {
    get: [['`sales` holds one row per sale:', { category: 'the shelf', product: 'what was sold', units: 'how many' }]],
    want: ['Add up each product\'s units', 'Rank the products in each category: tied products share a rank and the next rank is skipped (1, 1, 3)', 'Keep ranks 1 and 2, so a tie for second keeps everyone tied, and two tied for first leave no room for a third'],
    out: 'Return `category`, `product` and `units`. Row order doesn\'t matter.',
  },
  s48: {
    get: [['`staff` holds everyone who works at the café. The chart can be any number of levels deep:', { staff_id: 'their id', name: 'their name', manager_id: 'their manager\'s id, NULL for the person at the top' }]],
    want: ['Give everyone a level: the top person is 1, their reports 2, and so on'],
    out: 'Return `name` and `level`, sorted by level, then name.',
  },
  s49: {
    get: [['`order_items` holds the order lines:', { order_id: 'the order', product: 'what was on that line' }]],
    want: ['Count a product once per order, even if it appears twice', 'Find the pairs of products bought in the same order in **at least 2** orders'],
    out: 'Return `product_a`, `product_b` (alphabetical, a before b) and `n`, sorted by `n` high to low, then `product_a`, then `product_b`.',
  },
  s50: {
    get: [['`moves` is the coffee card ledger:', { move_id: 'the move; not in time order', account: 'the card', ts: 'when, as text like `\'2024-01-01 10:00\'`', amount: 'positive or negative' }]],
    want: ['Each account starts at 0', 'Follow each balance in time order', 'Find the move that first took it **below zero**'],
    out: 'Return `account` and `first_negative` (that move\'s `ts`) for every account that went below zero. Row order doesn\'t matter.',
    fine: ['A balance of exactly 0 is not overdrawn.'],
  },
  s51: {
    get: [['`sales` holds one row per sale:', { product: 'what was sold', amount: 'what it came to' }]],
    want: ['Add up each product\'s sales', 'Take the products biggest total first (ties by product, A to Z) until the running total reaches **at least 80%** of all sales, including the product that gets it there'],
    out: 'Return `product` and `total`, in that order.',
  },
  s54: {
    get: [['`sales` holds one row per sale:', { category: 'the shelf', product: 'what was sold', amount: 'what it came to, in whole numbers' }]],
    want: ['Find each category\'s best-selling product by total amount', 'Work out its share of the category\'s total, as a percentage rounded to 1 place', 'If two products tie for best, keep both'],
    out: 'Return `category`, `product` and `share`.',
  },
  s55: {
    get: [['`clicks` holds the online shop\'s clicks:', { user_id: 'who clicked', minute: 'when, in whole minutes since the site opened' }]],
    want: ['A new session starts at a user\'s first click, and whenever **more than 30 minutes** have passed since their previous click', 'Count each user\'s sessions'],
    out: 'Return `user_id` and `sessions`, by `user_id`.',
  },

  // ── DAX ──
  d01: {
    get: [['The shop\'s data model is loaded. `order_items` has one row per order line, with its quantity in `order_items[qty]`.']],
    want: ['Write a measure `Units`: how many items were sold, the total of `order_items[qty]`'],
    out: 'It\'s tested overall, and in matrices by product category, customer city and month.',
  },
  d02: {
    get: [['The shop\'s data model is loaded. The quantity of each order line is in `order_items`, and each product\'s price is in `products`.']],
    want: ['Write `Rev`: each order line\'s quantity times its product\'s price, all added up'],
    out: 'This is the measure the rest of the report builds on.',
  },
  d03: {
    get: [['The shop\'s data model is loaded, and `Rev` (the takings) is written for you.']],
    want: ['Write `Avg Price`: revenue divided by units, so a mug bought ten times counts ten times'],
    out: 'One measure, `Avg Price`.',
    fine: ['A plain average of the price list is not the answer.'],
  },
  d04: {
    get: [['The shop\'s data model is loaded. `orders` has one row per order, with the customer who placed it.']],
    want: ['Write `Buyers`: how many **different** customers placed an order'],
    out: 'It\'s tested overall, by month and by customer city.',
  },
  d05: {
    get: [['The shop\'s data model is loaded. Each order\'s `status` is `delivered`, `shipped` or `cancelled`.']],
    want: ['Write `Cancelled`: how many orders were cancelled'],
    out: 'One measure, `Cancelled`.',
  },
  d06: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you. Each product has a category, one of which is `beans`.']],
    want: ['Write `Beans Rev`: the revenue from the `beans` category', 'In a matrix by category, it must show the beans figure on **every** row'],
    out: 'One measure, `Beans Rev`.',
    fine: ['A CALCULATE filter replaces the matrix\'s own.'],
  },
  d07: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you. An order can have several lines in `order_items`.']],
    want: ['Write `Per Order`: the average revenue of an **order**, not of a single order line'],
    out: 'One measure, `Per Order`.',
  },
  d11: {
    get: [['`cafe` has one row per café per day, with the customer rating in `cafe[rating]`, blank on some days.']],
    want: ['Write `Avg Rating`: the average of `cafe[rating]`', 'Leave out the days with no rating, rather than counting them as zero'],
    out: 'One measure, `Avg Rating`.',
  },
  d12: {
    get: [['`cafe` records the drink and cups sold in each city, day by day, and `cities` gives each city\'s `country`, related to `cafe` on city.']],
    want: ['Write `Espresso Cups`: how many cups of `espresso` the cafe sold'],
    out: 'It\'s tested in a matrix by `cities[country]`. That filter reaches `cafe` through the relationship on city.',
  },
  d08: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `Share`: each product category\'s share of revenue, as a fraction', 'Inside a city, it\'s the category\'s share of **that city\'s** revenue: only the product filter gets removed'],
    out: 'One measure, `Share`.',
  },
  d09: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you. Each order\'s status is delivered, shipped or cancelled.']],
    want: ['Write `Delivered Rev`: the revenue from orders that were **delivered**, not cancelled and not still on their way (shipped)'],
    out: 'One measure, `Delivered Rev`.',
  },
  d10: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `Product Rank`: each product\'s place by revenue, 1 for the best seller', 'Ties share a place'],
    out: 'It\'s also tested inside each city, where the ranking is that city\'s.',
  },
  d13: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you. An order\'s revenue is the sum of its lines.']],
    want: ['Write `Big Orders`: how many orders came to **100 or more** in revenue', 'Each order has to be looked at on its own'],
    out: 'One measure, `Big Orders`.',
  },
  d14: {
    get: [['The shop\'s data model is loaded. `orders` has one row per order, with the customer who placed it.']],
    want: ['Write `Regulars`: how many customers placed **two or more** orders in the period being looked at', 'In a month, count only that month\'s orders'],
    out: 'One measure, `Regulars`.',
  },
  d15: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Rev` is written for you.']],
    want: ['Write `Rev YTD`: the revenue from the start of the year up to the end of each month'],
    out: 'One measure, `Rev YTD`.',
  },
  d16: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Rev` is written for you.']],
    want: ['Write `Prev Rev`: the revenue of the month **before** the one being looked at'],
    out: 'One measure, `Prev Rev`.',
    fine: ['In the total row the period is the whole year, and the month before that is before the data starts, so the total is blank.'],
  },
  d17: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `City Share`: each customer city\'s share of revenue', 'Inside a product category, it\'s the city\'s share of **that category**: only the city filter goes'],
    out: 'One measure, `City Share`.',
  },
  d18: {
    get: [['The shop\'s data model is loaded. Each order has a status, one of which is cancelled.']],
    want: ['Write `Cancel Rate`: the fraction of orders that were cancelled, out of the orders in view'],
    out: 'One measure, `Cancel Rate`.',
  },
  d25: {
    get: [['The shop\'s data model is loaded, with a calendar of every day, and `Orders` (a count of the orders) is written for you.']],
    want: ['Write `Empty Days`: how many days in the calendar had no orders at all', 'Each month row counts its own days'],
    out: 'One measure, `Empty Days`.',
  },
  d26: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `Unsold`: how many products had no revenue at all in what\'s showing'],
    out: 'One measure, `Unsold`.',
    fine: ['On a month row, that\'s the products nobody bought that month; on a category row, the ones in that category that never sold.'],
  },
  d19: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Rev` is written for you.']],
    want: ['Write `Growth`: how much revenue grew on the month before, as a fraction (0.1 means 10% up)', 'When there\'s no previous month to compare with, it should be blank'],
    out: 'One measure, `Growth`.',
  },
  d20: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Rev` is written for you.']],
    want: ['Write `Best Month`: the highest revenue any single month reached', 'Within a category, it\'s that category\'s best month'],
    out: 'One measure, `Best Month`.',
  },
  d21: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Rev` is written for you.']],
    want: ['Write `Avg Month`: the average revenue per month, counting only months that had sales'],
    out: 'One measure, `Avg Month`.',
    fine: ['The calendar runs all year, and the shop\'s orders don\'t.'],
  },
  d22: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `Cat Rank`: each product\'s place by revenue **among the products in its own category**'],
    out: 'It\'s tested in a matrix by category, then product.',
  },
  d23: {
    get: [['The shop\'s data model is loaded. `orders` has one row per order, with the customer and the date.']],
    want: ['Write `New Customers`: how many customers placed their **first ever** order in the period being looked at'],
    out: 'One measure, `New Customers`.',
    fine: ['Someone who first ordered in January and ordered again in March is new in January only.'],
  },
  d24: {
    get: [['The shop\'s data model is loaded. A filter on `products` reaches `order_items` but never `orders`, because relationships filter one way.']],
    want: ['Write `Buyers`: how many different customers bought something in the product category being looked at'],
    out: 'One measure, `Buyers`.',
    fine: ['The one-way filter is the catch.'],
  },
  d27: {
    get: [['The shop\'s data model is loaded, and `Rev` is written for you.']],
    want: ['Write `Running Share`: a product\'s revenue plus the revenue of every product that sold more, as a share of the revenue of all the products showing'],
    out: 'It\'s tested by product, and by category then product, where "all the products showing" means the ones in that category.',
  },
  d28: {
    get: [['The shop\'s data model is loaded, with a calendar table, and `Buyers` (the different customers who ordered) is written for you. The data runs to June.']],
    want: ['Write `Kept`: how many of this month\'s buyers also ordered **in the month after**'],
    out: 'One measure, `Kept`.',
    fine: ['June has no month after it in the data, so it comes out blank.'],
  },

  // ── Excel ──
  x01: {
    get: [['The `orders` sheet is open, one order per row:', { D: 'the order\'s status' }]],
    want: ['Count the orders whose status is `cancelled`'],
    out: 'Put the formula in **F2**.',
  },
  x02: {
    get: [['The `weather` sheet is open: a year of days, one per row:', { C: 'the rain that day, in millimetres' }]],
    want: ['Count the days that had any rain at all'],
    out: 'Put the formula in **F2**.',
    fine: ['A dry day has 0 in column C.'],
  },
  x03: {
    get: [['The `cafe` sheet is open, one day per row:', { G: 'the rating customers gave that day, empty on some days' }]],
    want: ['Work out the average rating, rounded to 2 decimal places'],
    out: 'Put the formula in **J2**.',
    fine: ['A day with no rating is left out, not counted as 0.'],
  },
  x04: {
    get: [['The `cafe` sheet is open, one day per row:', { E: 'the price of a cup that day' }]],
    want: ['Work out the price with 10% off, rounded to 2 decimal places'],
    out: 'Put the formula in **H2**. It\'s filled down to every row.',
  },
  x05: {
    get: [['The `cafe` sheet is open, one day per row:', { C: 'the drink: latte, espresso, cold brew or tea' }]],
    want: ['Make a short code for the drink: its first three letters, in capitals. A latte is `LAT`'],
    out: 'Put the formula in **H2**. It\'s filled down.',
  },
  x06: {
    get: [['The `orders` sheet is open, one order per row:', { C: 'the date of the order' }]],
    want: ['Show the month of the order as three letters, like `Jan` or `Feb`'],
    out: 'Put the formula in **E2**. It\'s filled down.',
  },
  x07: {
    get: [['The `cafe` sheet is open, one day per row:', { B: 'the city', D: 'cups sold', F: 'revenue' }]],
    want: ['Find the average revenue on Lagos days when **more than 30** cups were sold', 'Round it to 2 decimal places'],
    out: 'Put the formula in **J2**.',
    fine: ['A day with exactly 30 cups isn\'t more than 30.'],
  },
  x08: {
    get: [['The `customers` sheet is open:', { C: 'the customer\'s city, empty for two who never said where they live' }], ['The `cities` sheet lists each city and its country:', { A: 'the city', B: 'its country' }]],
    want: ['Look up each customer\'s country', 'Where there\'s no city to look up, show `unknown` instead'],
    out: 'Put the formula in **E2**. It\'s filled down.',
  },
  x09: {
    get: [['The `customers` sheet is open:', { A: 'the customer\'s id' }], ['The `orders` sheet has one order per row, rows 2 to 151:', { B: 'the id of the customer who placed it' }]],
    want: ['Count how many orders each customer placed', 'Some never ordered'],
    out: 'Put the formula in **E2**. It\'s filled down.',
  },
  x10: {
    get: [['The `cafe` sheet is open, one day per row:', { F: 'that day\'s revenue' }]],
    want: ['Rank each day by revenue: 1 for the biggest day of all, 2 for the next, and so on'],
    out: 'Put the formula in **H2**. It\'s filled down.',
    fine: ['Days with the same revenue share a rank.'],
  },
  x11: {
    get: [['The `orders` sheet is open, one order per row:', { B: 'the id of the customer who placed it' }]],
    want: ['Count how many **different** customers placed an order', 'Plenty of customers ordered more than once'],
    out: 'Put the formula in **F2**.',
  },
  x12: {
    get: [['The `weather` sheet is open, one day per row:', { C: 'the rain that day; a dry day has 0' }]],
    want: ['Count how many dry days in a row there have been, up to and including this one', 'A day with rain starts the count again at 0'],
    out: 'Put the formula in **E2**. It\'s filled down.',
    fine: ['E1 is empty, and an empty cell counts as 0 in a sum.'],
  },
  x13: {
    get: [['The `cafe` sheet is open, one day per row:', { A: 'the date', F: 'revenue' }]],
    want: ['Add up the revenue taken on Saturdays and Sundays, rounded to 2 decimal places'],
    out: 'Put the formula in **J2**.',
  },
  x14: {
    get: [['The `cafe` sheet is open, one day per row:', { B: 'the city', F: 'revenue' }]],
    want: ['Divide each day\'s revenue by its own city\'s total revenue: a Lagos day by all of Lagos', 'Round it to 3 decimal places'],
    out: 'Put the formula in **H2**. It\'s filled down.',
  },
  x15: {
    get: [['The `order_items` sheet is open, one order line per row:', { A: 'the order id', B: 'the product id', C: 'the quantity' }], ['The `orders` sheet has each order:', { A: 'the order id', D: 'its status' }], ['The `products` sheet has each product:', { A: 'the product id', D: 'its price' }]],
    want: ['Work out the line\'s value: quantity times price', '...but only if its order was `delivered`; otherwise show 0'],
    out: 'Put the formula in **D2**. It\'s filled down.',
  },
  x16: {
    get: [['The `products` sheet is open, rows 2 to 13:', { B: 'the name', C: 'the category', D: 'the price' }]],
    want: ['List the names of the products that cost **more than 15**, in alphabetical order', 'One formula: the list spills down'],
    out: 'Put the formula in **F2**.',
    fine: ['A product at exactly 15 doesn\'t make the list.'],
  },

  // ── R ──
  r01: {
    get: [['`df` holds the till records, one row each, including:', { city: 'the café that sent it' }]],
    want: ['Count how many rows each city sent'],
    out: 'Return a data frame with exactly two columns, `city` and `n`. Row order doesn\'t matter.',
  },
  r02: {
    get: [['`df` holds the daily sales, including:', { price: 'what a cup sold for, missing on some days' }]],
    want: ['Work out the average price, leaving the missing prices out'],
    out: 'Return a single number, **rounded to 2 decimal places**.',
  },
  r03: {
    get: [['`df` holds the drinks:', { drink: 'the drink', price: 'what it costs' }]],
    want: ['Find every drink costing **less than 3.00**'],
    out: 'Return `drink` and `price`, cheapest first. Drinks at the same price go in alphabetical order.',
    fine: ['Exactly 3.00 isn\'t less than 3.00.'],
  },
  r04: {
    get: [['`df` holds the daily sales:', { date: 'the day', city: 'which café', cups: 'how many cups it poured' }]],
    want: ['Find the days with **more than 40** cups', 'Keep every column'],
    out: 'Return those rows.',
  },
  r05: {
    get: [['`df` holds the sales:', { drink: 'what was sold', cups: 'how many', price: 'the price of one' }]],
    want: ['Add a column `total`: `cups` times `price`, **rounded to 2 decimal places**'],
    out: 'Return the whole table, with `total` on the end.',
  },
  r06: {
    get: [['`df` holds the sales, one row per sale:', { drink: 'what was sold', cups: 'how many', price: 'the price of one' }]],
    want: ['Work out each drink\'s money in total: cups times price, added up over all its rows', 'Find the drink that brought in the most'],
    out: 'Return just its name, as a single piece of text.',
    fine: ['There\'s never a tie for first place.'],
  },
  r07: {
    get: [['`df` holds the daily takings:', { date: 'the day', city: 'which café', revenue: 'that day\'s takings' }]],
    want: ['Find each city\'s best day: the row with its highest revenue', 'If a city has two days tied for best, keep both'],
    out: 'Return `city`, `date` and `revenue`. Row order doesn\'t matter.',
  },
  r08: {
    get: [['`df` holds the sales:', { drink: 'what was sold', cups: 'how many' }]],
    want: ['Work out each drink\'s share of all the cups sold, as a percentage **rounded to 1 decimal place**'],
    out: 'Return `drink` and `pct`, biggest share first. Equal shares go in alphabetical order.',
  },
  r09: {
    get: [['`df` holds the daily ratings:', { city: 'which café', rating: 'the rating, missing on some days' }]],
    want: ['Fill each missing rating with the average of the known ratings **in the same city**, rounded to 2 decimal places', 'Leave the known ratings as they are'],
    out: 'Return the whole table.',
    fine: ['Every city has at least one known rating.'],
  },
  r10: {
    get: [['`df` holds the orders, including:', { customer_id: 'who placed it' }]],
    want: ['Find the customers with **two or more** orders'],
    out: 'Return their ids as a vector, smallest first, or an empty vector if nobody came back.',
  },
  r11: {
    get: [['`df` holds the takings, not in date order and possibly over more than one year:', { date: 'the day, as a real date', revenue: 'that day\'s takings' }]],
    want: ['Add up the revenue for each month'],
    out: 'Return `month` (text like `"2024-01"`) and `revenue`, in month order.',
  },
  r12: {
    get: [['`df` holds the daily sales:', { city: 'which café', cups: 'cups poured that day' }]],
    want: ['Work out each city\'s average cups', 'Find the rows **above** their own city\'s average', 'Keep every column'],
    out: 'Return those rows. Row order doesn\'t matter.',
    fine: ['Exactly the average isn\'t above it.'],
  },
  r13: {
    get: [['`df` has a `date` column: the days someone was active, as real dates, in any order, with repeats.']],
    want: ['Find their longest run of **consecutive days**'],
    out: 'Return its length as a single number. No rows at all is a streak of 0.',
  },
  r14: {
    get: [['`df` holds the takings, in no particular order:', { date: 'the day', city: 'which café', revenue: 'that day\'s takings' }]],
    want: ['Add `running`: each city\'s revenue so far, day by day, starting again for every city'],
    out: 'Return every row, sorted by `city` and then by `date`.',
  },
  r15: {
    get: [['`df` holds the takings:', { city: 'which café', revenue: 'a day\'s takings' }]],
    want: ['Find each city\'s **second-highest different** revenue', 'If a city\'s top revenue appears twice, the second best is the next value down', 'A city with only one different value has no second best: leave it out'],
    out: 'Return `city` and `revenue`. Row order doesn\'t matter.',
  },
  r16: {
    get: [['`df` holds the orders, in no particular order:', { customer_id: 'who ordered', order_date: 'the day, as a real date' }]],
    want: ['Find each customer\'s **median** number of days between one order and their next', 'Leave out customers with only one order: they have no gaps'],
    out: 'Return `customer_id` and `gap`. Row order doesn\'t matter.',
  },
  // ── Data cleaning (cleaning.js) ──
  c01: {
    get: [['A table `sales`:', { city: 'typed by hand, with stray spaces and random capitals, like `" lagos"` and `"LAGOS"`', cups: 'cups sold' }]],
    want: ['Tidy each city: no spaces round it, a capital first letter, the rest lower case', 'Total the cups for each tidied city'],
    out: 'Return `city` and `cups`, one row per city, A to Z.',
    fine: ['Every city is a single word.', 'In SQLite, GROUP BY city means the raw column, even if a result column is also called city.'],
  },
  c02: {
    get: [['`df` holds the sales, including:', { city: 'typed by hand, with stray spaces and random capitals, like `"  lagos"` and `"ACCRA "`' }]],
    want: ['Trim the spaces from around every city', 'Give each a capital first letter and the rest lower case, like `"Lagos"`', 'Leave every other column alone'],
    out: 'Return the whole of `df`, with the rows in the same order.',
    fine: ['Every city is a single word.'],
  },
  c03: {
    get: [['The `survey` sheet is open, rows 2 to 33:', { 'B "City "': 'the city, with stray spaces and random capitals' }]],
    want: ['In **G2**, the city with the spaces round it taken off', 'Each word with a capital first letter, like `Lagos`'],
    out: 'The formula is filled down to every row.',
  },
  c04: {
    get: [['`df` holds the survey answers, including:', { spend: 'text: `"12.50"`, `"£18.00"`, `"7"`, or `"n/a"` where it was left blank' }]],
    want: ['Take the £ out', 'Leave the n/a answers out of the average'],
    out: 'Return the average spend, rounded to 2 decimal places, as a number.',
    fine: ['There is always at least one real spend.', 'An n/a is not a spend of 0.'],
  },
  c05: {
    get: [['A table `answers`:', { name: 'who answered', spend: 'text: `12.50`, `£18.00`, `7` or `n/a`' }]],
    want: ['Take the £ out', 'Leave the n/a answers out of the average'],
    out: 'Return one row with one column, `avg_spend`, rounded to 2 decimal places.',
    fine: ["In SQLite, CAST('n/a' AS REAL) is 0, not an error."],
  },
  c06: {
    get: [['`df` holds the survey answers, including:', { spend: 'text: `"12.50"`, `"£18.00"`, `"7"` or `"n/a"`' }]],
    want: ['Take the £ out', 'Leave the n/a answers out of the average'],
    out: 'Return the average spend, rounded to 2 decimal places, as a single number.',
    fine: ['There is always at least one real spend.'],
  },
  c07: {
    get: [['The `survey` sheet is open, rows 2 to 33:', { 'D "Spend (GBP)"': 'text: `12.50`, `£18.00`, `7` or `n/a`' }]],
    want: ['In **J2**, the average spend', 'With the n/a answers left out'],
    out: 'One number, rounded to 2 decimal places.',
    fine: ['One formula, in J2: no helper column.', 'An n/a is not a spend of 0.'],
  },
  c08: {
    get: [['`df` holds the answers, including:', { subscribed: 'typed by hand: `"Yes"`, `"y"`, `"YES"`, `" yes "`, `"N"`, `"no"`, `"nope"`' }]],
    want: ['Count the answers that are some kind of yes: the first letter, once spaces are trimmed, is a y'],
    out: 'Return the count, as a whole number.',
  },
  c09: {
    get: [['A table `answers`:', { name: 'who answered', subscribed: 'typed by hand: `Yes`, `y`, `YES`, ` yes `, `N`, `no`' }]],
    want: ['Count the answers that are some kind of yes: the first letter, once spaces are trimmed, is a y'],
    out: 'Return one row with one column, `subscribers`.',
  },
  c10: {
    get: [['The `survey` sheet is open, rows 2 to 33:', { 'E "Subscribed?"': 'typed as `Yes`, `y`, `YES`, `N` or `no`' }]],
    want: ['In **J2**, the percentage of the people who answered who said some kind of yes'],
    out: 'One number, rounded to 1 decimal place: `62.5`, not `0.625`.',
    fine: ['Someone who left the answer blank did not answer, so they are not part of the percentage.'],
  },
  c11: {
    get: [['`df` holds the feedback, where some rows were sent twice or more by mistake.']],
    want: ['Remove the exact copies, keeping the first of each', 'Rows that only share a name are not copies'],
    out: 'Return the rest of `df` in its original order, numbered afresh from 0.',
  },
  c12: {
    get: [['A table `signups`:', { name: 'who signed up', city: 'their city', joined: 'the day they joined' }]],
    want: ['Return every column, with each exact copy appearing only once', 'Rows that only share a name are not copies'],
    out: "Return the rows. Their order doesn't matter.",
  },
  c13: {
    get: [['`df` holds the sign-ups, where some rows were sent more than once.']],
    want: ['Count the extra copies: rows that exactly repeat an earlier row', 'Rows that only share a name are not copies'],
    out: 'Return the count, as a single number. A row sent three times has two extra copies.',
  },
  c14: {
    get: [['`df` holds the sign-ups, including:', { joined: 'text dates: `"2024-03-05"` (year first), `"05/03/2024"` (day first, 5 March) or `"unknown"`' }]],
    want: ['Rewrite `joined` as text, year first, like `"2024-03-05"`', 'Make it missing where it said unknown', 'Leave the other columns alone'],
    out: 'Return the whole of `df`, with the rows in the same order.',
    fine: ['05/03/2024 is 5 March, not 3 May.'],
  },
  c15: {
    get: [['A table `signups`:', { name: 'who joined', joined: 'text: `2024-03-05` (year first), `05/03/2024` (day first, 5 March) or `unknown`' }]],
    want: ['Count the sign-ups in each month', 'Leave out the unknowns'],
    out: 'Return `month` (like `2024-03`) and `signups`, in month order.',
    fine: ['05/03/2024 is 5 March, not 3 May.'],
  },
  c16: {
    get: [['A table `shifts`:', { shift_id: 'the shift', barista: 'who worked it', start_hr: 'the starting hour, 24-hour clock', end_hr: 'the finishing hour', cups: 'cups made' }]],
    want: ['Find every shift that breaks a rule: it must end **after** it starts, cups must be **0 or more**, and the barista must be named (not NULL, not blank or only spaces)'],
    out: 'Return `shift_id`, smallest first.',
    fine: ['A shift that ends at the hour it starts breaks the first rule.', 'A shift with 0 cups is fine.'],
  },
  c17: {
    get: [['`df` holds the shifts:', { shift_id: 'the shift', barista: 'who worked it, sometimes missing or blank', start_hr: 'the starting hour, 24-hour clock', end_hr: 'the finishing hour', cups: 'cups made' }]],
    want: ['Find every shift that breaks a rule: it must end **after** it starts, cups must be **0 or more**, and the barista must be named (not missing, not blank or only spaces)'],
    out: 'Return a plain list of those `shift_id`s, smallest first, empty if every shift is fine.',
    fine: ['A shift that ends at the hour it starts breaks the first rule.', 'A shift with 0 cups is fine.'],
  },
};
