/* Excel cleaning (xc-*): the messy data course's ideas, done with formulas.
   Most lessons open `survey` as a sheet: the same deliberately filthy export
   the messy data and SQL cleaning courses use, in columns A to F, rows 2 to
   33 (A " Name ", B "City ", C "Signed Up", D "Spend (GBP)", E
   "Subscribed?", F "Note"). Everything in it is text, as an export usually
   is. A few lessons bring a small sheet of their own through `setup`.

   Checks: _excel_expect(reference, uses=[...]), as in excel.js. */

// The same courier log and receipts as SQL cleaning (sqlclean.js).
const COURIER = `courier = pd.DataFrame({
    "order_id":  [101, 102, 103, 104, 105, 106, 107, 108],
    "qty":       [2, 0, 1, 3, -1, 2, 1, 4],
    "rating":    [5, 4, 9, 3, 5, None, 2, 5],
    "ordered":   ["2024-03-01", "2024-03-01", "2024-03-02", "2024-03-02",
                  "2024-03-03", "2024-03-03", "2024-03-04", "2024-03-04"],
    "delivered": ["2024-03-02", "2024-03-03", "2024-03-02", "2024-03-01",
                  "2024-03-05", "2024-03-04", "2024-03-06", "2024-03-05"],
})`;
const RECEIPTS = `receipts = pd.DataFrame({"receipt": [1, 2, 3, 4], "total": [12.25, 7.50, 11.00, 15.75]})
receipt_lines = pd.DataFrame({
    "receipt": [1, 1, 2, 2, 3, 3, 3, 4, 4],
    "item":    ["latte", "cake", "tea", "tea", "mocha", "cake", "tea", "latte", "brownie"],
    "price":   [4.50, 7.75, 2.75, 2.75, 5.00, 3.25, 2.75, 4.50, 3.75],
})`;

const DATE_FIX = '=IFERROR(IF(MID(C2,3,1)="/",DATE(RIGHT(C2,4),MID(C2,4,2),LEFT(C2,2)),DATE(LEFT(C2,4),MID(C2,6,2),RIGHT(C2,2))),"")';
const RULES = '=IFS(B2<1,"no quantity",AND(C2<>"",OR(C2<1,C2>5)),"rating out of range",E2<D2,"delivered before ordered",TRUE,"")';

export const EXCEL_CLEAN = [

/* ── Find the mess ─────────────────────────────────────── */
{
  id: 'xc-01', mins: 3,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'city' },
  title: 'Spaces you can\'t see',
  concept: [
    "This sheet is `survey`: answers to a customer survey, exported by someone else and never tidied. Column B, the city, has spaces before and after some names.",
    "A space at the start or end is invisible, but Excel counts it: \" Lagos\" and \"Lagos\" are different values. `LEN(B2)` shows it, counting the spaces too.",
    '`=TRIM(B2)` takes off the spaces at both ends, and squeezes any double spaces inside down to one.',
  ],
  starter: '=',
  task: 'In G2, the city with its extra spaces trimmed off. It fills down to every row.',
  hint: '`=TRIM(B2)`',
  solution: '=TRIM(B2)',
  check: `_excel_expect('=TRIM(B2)', uses=['TRIM'])`,
  deeper: {
    why: 'Filters, lookups and COUNTIF all treat " Lagos" as a different city. One stray space splits a branch in two.',
    mistake: 'Looking for the space by eye. It is invisible in the cell; LEN, or a lookup that fails for no clear reason, is how you find it.',
    work: 'Data pasted from websites can carry a non-breaking space that TRIM leaves alone. `SUBSTITUTE(B2,CHAR(160)," ")` turns it into an ordinary one first.',
  },
},
{
  id: 'xc-02', mins: 3,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'name' },
  title: 'Fix the capitals',
  concept: [
    "Column A, the name, mixes \"ada lovelace\" with \"Kofi Mensah\". `PROPER` gives each word a capital first letter and makes the rest lower case.",
    '`UPPER` makes it all capitals, and `LOWER` all small letters.',
    'Functions can sit inside each other: `=PROPER(TRIM(A2))` trims first, then fixes the capitals of what is left.',
  ],
  starter: '=',
  task: 'In G2, the name trimmed and in proper capitals, like "Ada Lovelace". It fills down.',
  hint: '`=PROPER(TRIM(A2))`',
  solution: '=PROPER(TRIM(A2))',
  check: `_excel_expect('=PROPER(TRIM(A2))', uses=['PROPER', 'TRIM'])`,
  deeper: {
    why: 'Names in two styles look careless in a mail merge, and can stop a lookup matching the same person twice.',
    mistake: 'Running PROPER on names like "McDonald" or "van Dijk": it makes them "Mcdonald" and "Van Dijk". Check the result rather than trust it.',
    work: 'Do the tidying in a new column, then copy it and Paste Special, Values over the original once you are happy.',
  },
},
{
  id: 'xc-03', mins: 3,
  xl: { sheet: 'survey', cell: 'J2', label: 'Lagos rows' },
  title: 'Count it however it\'s spelled',
  concept: [
    'COUNTIF ignores capitals, but not spaces: `COUNTIF(B2:B33,"lagos")` counts "Lagos" and "lagos", but misses " Lagos".',
    'A **wildcard** stands for unknown text in a criteria: `*` means any run of characters, even none.',
    'So `"*lagos*"` matches "lagos" with anything before or after it: spaces, capitals, the lot.',
  ],
  starter: '=COUNTIF(B2:B33,"Lagos")',
  task: 'The starter misses the Lagos rows that have a space in front. In J2, count every row whose city is Lagos however it was typed.',
  hint: 'Wildcards on both sides: `=COUNTIF(B2:B33,"*lagos*")`',
  solution: '=COUNTIF(B2:B33,"*lagos*")',
  check: `_excel_expect('=COUNTIF(B2:B33,"*lagos*")', uses=['COUNTIF'])`,
  deeper: {
    why: 'Wildcards let you count correctly before the data is cleaned, which is handy for a quick check.',
    mistake: 'Using wildcards on short words. "*ham*" counts Birmingham and Nottingham too. Be sure the pattern only fits what you mean.',
    work: '`?` is the other wildcard: exactly one character. "B??" matches any three-letter code starting with B.',
  },
},
{
  id: 'xc-04', mins: 3,
  xl: { sheet: 'survey', cell: 'J2', label: 'disguised gaps' },
  title: 'Blanks in disguise',
  concept: [
    'Exports often write "missing" as text: "n/a", "unknown", "-". The cell isn\'t empty, so COUNTBLANK can\'t see it.',
    'COUNTIF finds them: `COUNTIF(D2:D33,"n/a")` counts the spends written n/a.',
    'Two counts can be added together in one formula, with `+`.',
  ],
  starter: '=COUNTBLANK(C2:D33)',
  task: 'The starter finds no gaps at all. In J2, count the disguised ones: spends written "n/a" in column D, plus sign-up dates written "unknown" in column C.',
  hint: '`=COUNTIF(D2:D33,"n/a")+COUNTIF(C2:C33,"unknown")`',
  solution: '=COUNTIF(D2:D33,"n/a")+COUNTIF(C2:C33,"unknown")',
  check: `_excel_expect('=COUNTIF(D2:D33,"n/a")+COUNTIF(C2:C33,"unknown")', uses=['COUNTIF'])`,
  deeper: {
    why: 'AVERAGE skips truly empty cells, but text like "n/a" can break a formula or be counted as an answer. Knowing how many there are is the first step.',
    mistake: 'Replacing "n/a" with 0. A missing answer isn\'t a spend of nothing, and every 0 drags the average down.',
    work: 'Filter the column on its own drop-down: the list of values shows every stand-in in one glance.',
  },
},
{
  id: 'xc-05', mins: 4,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'copies' },
  title: 'Rows that appear twice',
  concept: [
    'Each note has its own reference number, so a note that turns up twice means the whole row was sent twice.',
    '`COUNTIF($F$2:$F$33,F2)` counts how many times this row\'s note appears in the whole column. 1 is normal; 2 or more is a copy.',
    'Lock the range with `$` so it stays the whole column as the formula fills down, while `F2` moves to each row\'s own note.',
  ],
  starter: '=',
  task: "In G2, how many times this row's note appears in column F. It fills down; any row showing 2 is a copy.",
  hint: '`=COUNTIF($F$2:$F$33,F2)`',
  solution: '=COUNTIF($F$2:$F$33,F2)',
  check: `_excel_expect('=COUNTIF($F$2:$F$33,F2)', uses=['COUNTIF', '$'])`,
  deeper: {
    why: "Marking copies, rather than deleting them straight away, lets you see what you're about to remove.",
    mistake: 'Counting copies on a column that is allowed to repeat, like the city. Pick the column that should be unique, an id or a reference.',
    work: 'Data, Remove Duplicates does the deleting, but it doesn\'t say which rows went. Mark them first, then remove them.',
  },
},

/* ── Fix it ────────────────────────────────────────────── */
{
  id: 'xc-06', mins: 4,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'spend' },
  title: 'Text into numbers',
  concept: [
    '"£18.00" is text: Excel can\'t add it up. `SUBSTITUTE(D2,"£","")` swaps the £ for nothing.',
    '`VALUE(...)` turns text that looks like a number into a real one.',
    '"n/a" can\'t become a number, so VALUE gives #VALUE!. `IFERROR(formula,"")` gives an empty answer instead of the error.',
  ],
  starter: '=VALUE(D2)',
  task: 'The starter fails on every £ and every n/a. In G2, the spend as a real number: the £ taken out, and an empty answer for n/a. It fills down.',
  hint: 'From the inside out: `=IFERROR(VALUE(SUBSTITUTE(D2,"£","")),"")`',
  solution: '=IFERROR(VALUE(SUBSTITUTE(D2,"£","")),"")',
  check: `_excel_expect('=IFERROR(VALUE(SUBSTITUTE(D2,"£","")),"")', uses=['SUBSTITUTE', 'VALUE', 'IFERROR'])`,
  deeper: {
    why: 'Numbers stored as text sit on the left of the cell, and SUM quietly skips them, so a total comes out too small with no warning.',
    mistake: 'Wrapping everything in IFERROR from the start. It hides every error, including the ones you didn\'t expect. Add it last, once you know which errors are real.',
    work: 'Data, Text to Columns, then Finish, is a quick way to turn a whole column of plain number-text into numbers.',
  },
},
{
  id: 'xc-07', mins: 3,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'subscribed' },
  title: 'Yes, y, YES, N, no',
  concept: [
    'Five spellings, two meanings. Make them alike first: `LOWER(TRIM(E2))`.',
    '`LEFT(text,1)` keeps just the first character: every answer is now "y" or "n".',
    'Then IF turns it into 1 or 0, which can be added up.',
  ],
  starter: '=IF(E2="Yes",1,0)',
  task: 'The starter only counts the answers written Yes. In G2, 1 for every kind of yes and 0 for every kind of no. It fills down.',
  hint: '`=IF(LEFT(LOWER(TRIM(E2)),1)="y",1,0)`',
  solution: '=IF(LEFT(LOWER(TRIM(E2)),1)="y",1,0)',
  check: `_excel_expect('=IF(LEFT(LOWER(TRIM(E2)),1)="y",1,0)', uses=['LEFT'])`,
  deeper: {
    why: 'A column of 1s and 0s adds up to a count and averages to a share: SUM is how many said yes, AVERAGE the share who did.',
    mistake: 'Comparing with "Y" and "y" in two IFs. Excel\'s = ignores capitals anyway, but the spaces and the extra letters still need dealing with.',
    work: 'A drop-down list (Data, Data Validation) on the form stops the five spellings arriving in the first place.',
  },
},
{
  id: 'xc-08', mins: 5,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'signed up' },
  title: 'Two date layouts',
  concept: [
    'Column C mixes "2024-01-05" (year first) with "05/02/2024" (day first, from a British form), and "unknown". All of it is text.',
    '`DATE(year, month, day)` builds a real date. LEFT, MID and RIGHT cut the pieces out of the text: `MID(C2,4,2)` is 2 characters from the 4th.',
    'IF picks the layout (a "/" as the 3rd character means day first), and IFERROR gives an empty answer for "unknown".',
  ],
  starter: '=C2',
  task: 'In G2, a real date for every sign-up: the year-first ones and the day-first ones both, and empty for "unknown". It fills down.',
  hint: `\`${DATE_FIX}\``,
  solution: DATE_FIX,
  check: `_excel_expect('${DATE_FIX}', uses=['DATE', 'IFERROR'])`,
  deeper: {
    why: 'Real dates sort, filter by month, and work in date sums. Text that looks like a date does none of those.',
    mistake: 'Letting Excel guess. On a computer set to US style, 05/02/2024 becomes 2 May, and nothing warns you.',
    work: 'Data, Text to Columns has a step where you pick the order, DMY, for a whole column of day-first dates at once.',
  },
},
{
  id: 'xc-09', mins: 4,
  xl: { sheet: 'survey', cell: 'G2', fill: true, label: 'ref' },
  title: 'A number hiding in text',
  concept: [
    'Each note starts "ref#1000 ...". The reference number sits between the # and the first space.',
    '`TEXTAFTER(F2,"#")` gives everything after the #. `TEXTBEFORE(text," ")` gives everything before the first space.',
    'Put one inside the other, then VALUE turns the digits into a number.',
  ],
  starter: '=',
  task: 'In G2, the reference number from each note, as a real number. It fills down.',
  hint: '`=VALUE(TEXTBEFORE(TEXTAFTER(F2,"#")," "))`',
  solution: '=VALUE(TEXTBEFORE(TEXTAFTER(F2,"#")," "))',
  check: `_excel_expect('=VALUE(TEXTBEFORE(TEXTAFTER(F2,"#")," "))', uses=['TEXTAFTER', 'TEXTBEFORE'])`,
  deeper: {
    why: 'Cutting at the # and the space keeps working when the numbers grow from 4 digits to 5.',
    mistake: 'Using `MID(F2,5,4)`. It works today, then chops ref#10000 to 1000.',
    work: 'In older Excel without TEXTBEFORE, FIND gives the positions and MID cuts between them.',
  },
},
{
  id: 'xc-10', mins: 3,
  xl: { sheet: 'survey', cell: 'J2', label: 'different rows' },
  title: 'How many are left?',
  concept: [
    '`UNIQUE(range)` lists each different row of a range once. Given several columns, a row only counts as a repeat if every cell matches.',
    '`ROWS(...)` counts the rows of whatever it is given, including a list a formula makes.',
    'So `ROWS(UNIQUE(A2:F33))` is how many rows would be left once the exact copies are gone.',
  ],
  starter: '=ROWS(A2:F33)',
  task: 'The starter counts every row, copies included. In J2, count the rows left once exact copies are removed.',
  hint: '`=ROWS(UNIQUE(A2:F33))`',
  solution: '=ROWS(UNIQUE(A2:F33))',
  check: `_excel_expect('=ROWS(UNIQUE(A2:F33))', uses=['UNIQUE'])`,
  deeper: {
    why: 'Rows before and rows after, side by side, prove that removing copies took out what it should and nothing more.',
    mistake: 'Running UNIQUE on one column. Different people can share a city; only whole rows that match are true copies.',
    work: '`=UNIQUE(A2:F33)` on its own spills a copy-free table, ready to work from.',
  },
},

/* ── Can you trust it? ─────────────────────────────────── */
{
  id: 'xc-11', mins: 5,
  setup: COURIER,
  xl: { sheet: 'courier', cell: 'F2', fill: true, label: 'problem' },
  title: 'Rules every row should follow',
  concept: [
    "This sheet is a courier's log: order (A), quantity (B), rating (C), the day ordered (D) and the day delivered (E). Some rows break the rules.",
    '`IFS` checks the rules in order and gives the answer for the first that fails. A last test of `TRUE` catches the rows that pass.',
    'A missing rating isn\'t broken, just missing, so check `C2<>""` before testing its range. Dates written year first compare correctly as text.',
  ],
  starter: '=',
  task: 'In F2, the first rule each row breaks: "no quantity" (quantity below 1), "rating out of range" (a rating that\'s there, but not from 1 to 5), or "delivered before ordered". Empty when the row is fine. It fills down.',
  hint: `\`${RULES}\``,
  solution: RULES,
  check: `_excel_expect('${RULES}', uses=['IFS'])`,
  deeper: {
    why: 'A column of reasons can be filtered and counted, and sent back to whoever runs the system that made the bad rows.',
    mistake: 'Deleting the bad rows. Keep them, marked, so the source can be fixed.',
    work: 'Conditional formatting with the same rules colours the bad rows as they arrive.',
  },
},
{
  id: 'xc-12', mins: 5,
  setup: RECEIPTS,
  xl: { sheet: 'receipts', cell: 'C2', fill: true, label: 'mismatch' },
  title: "Totals that don't add up",
  concept: [
    'This sheet has each receipt\'s stored total (B). Its items, with their prices, are on the `receipt_lines` sheet: receipt (A), item (B), price (C).',
    '`SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C)` adds up the prices of this receipt\'s lines.',
    'Compare money with a small allowance: `ABS(B2-...)>0.005`, not `<>`. Decimals stored in binary can be a hair apart.',
  ],
  starter: '=',
  task: "In C2, TRUE where the receipt's total differs from its lines added up by more than 0.005. It fills down.",
  hint: '`=ABS(B2-SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C))>0.005`',
  solution: '=ABS(B2-SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C))>0.005',
  check: `_excel_expect('=ABS(B2-SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C))>0.005', uses=['SUMIF', 'ABS'])`,
  deeper: {
    why: "A total that disagrees with its lines means one of them is wrong, and reports built on either can't be trusted until you know which.",
    mistake: 'Testing `B2<>SUMIF(...)`. Two amounts that look equal can differ in the 15th decimal place and be flagged.',
    work: 'Reconciling one system against another, the till against the bank, is a daily job in finance teams.',
  },
},
{
  id: 'xc-13', mins: 4,
  xl: { sheet: 'cafe', cell: 'H2', fill: true, label: 'unusual' },
  title: 'Unusual, not impossible',
  concept: [
    'An outlier is a value far from the rest. It might be a typo or something real. Flag it, look, then decide.',
    "Compare each day with its own city: `AVERAGEIFS($F$2:$F$121,$B$2:$B$121,B2)` is the average revenue of this row's city.",
    'Lock the ranges with `$`, so every row averages the whole column; only B2 moves.',
  ],
  starter: '=',
  task: "On the café sheet, in H2: TRUE where the day's revenue (F) is more than 1.5 times its own city's average revenue. It fills down.",
  hint: '`=F2>1.5*AVERAGEIFS($F$2:$F$121,$B$2:$B$121,B2)`',
  solution: '=F2>1.5*AVERAGEIFS($F$2:$F$121,$B$2:$B$121,B2)',
  check: `_excel_expect('=F2>1.5*AVERAGEIFS($F$2:$F$121,$B$2:$B$121,B2)', uses=['AVERAGEIFS', '$'])`,
  deeper: {
    why: "A big day in a small branch can look ordinary beside the busiest city. Comparing with the row's own group catches it.",
    mistake: 'Deleting outliers to tidy a chart. If they were real, the chart now hides the most interesting days.',
    work: 'Filter the TRUE rows and ask someone who knows the branch. One answer saves hours of guessing.',
  },
},
{
  id: 'xc-14', mins: 3,
  xl: { sheet: 'survey', cell: 'J2', label: 'spends given' },
  title: 'A health check',
  concept: [
    '`COUNTA(range)` counts the cells that hold anything at all: numbers, text, "n/a".',
    'Take away the stand-ins and you have the real answers: `COUNTA(D2:D33)-COUNTIF(D2:D33,"n/a")`.',
    'A few counts like this, kept at the top of a sheet, sum up its health: how many rows, how many real answers, how many copies.',
  ],
  starter: '=COUNTA(D2:D33)',
  task: 'The starter counts the n/a as answers. In J2, how many rows give a real spend.',
  hint: '`=COUNTA(D2:D33)-COUNTIF(D2:D33,"n/a")`',
  solution: '=COUNTA(D2:D33)-COUNTIF(D2:D33,"n/a")',
  check: `_excel_expect('=COUNTA(D2:D33)-COUNTIF(D2:D33,"n/a")', uses=['COUNTA', 'COUNTIF'])`,
  deeper: {
    why: 'An average is only as good as the answers under it. Saying "26 of 32 gave a spend" next to it is honest.',
    mistake: 'COUNT instead of COUNTA. COUNT only counts numbers, and every spend here is still text, so it gives 0.',
    work: 'Keep the same health counts on every new month\'s file. A sudden change means the export changed.',
  },
},
{
  id: 'xc-15', mins: 4,
  xl: { sheet: 'survey', cell: 'J2', label: 'Nairobi subscribers' },
  title: 'Clean as you count',
  concept: [
    '`COUNTIFS` counts the rows where every condition matches, in range and criteria pairs.',
    'With wildcards in each criteria, it cleans as it counts: `"*nairobi*"` matches the city however it was typed, and `"y*"` matches Yes, y and YES.',
    'For a quick answer that is enough. For anything you will reuse, clean the columns properly first.',
  ],
  starter: '=COUNTIFS(B2:B33,"Nairobi",E2:E33,"Yes")',
  task: 'The starter misses most of them. In J2, count the Nairobi rows whose answer is some kind of yes, however either was typed.',
  hint: '`=COUNTIFS(B2:B33,"*nairobi*",E2:E33,"y*")`',
  solution: '=COUNTIFS(B2:B33,"*nairobi*",E2:E33,"y*")',
  check: `_excel_expect('=COUNTIFS(B2:B33,"*nairobi*",E2:E33,"y*")', uses=['COUNTIFS'])`,
  deeper: {
    why: 'A wildcard count is a fast way to answer one question today, before anyone has time to clean the file.',
    mistake: 'Forgetting the copies. A row sent twice is counted twice here; the clean columns and UNIQUE deal with that.',
    work: 'Write the quick answer, then note how it was counted, so nobody mistakes it for the cleaned figure.',
  },
},
];
