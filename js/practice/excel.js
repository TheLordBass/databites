/* Excel practice problems, x01 to x16. Every one is original.

   A problem gives:
     xl         the sheet that's open, the cell the formula goes in, and
                fill when it's copied down to the last row of data
     reference  the right formula
     edge       an optional extra case: { about, code }, where code is Python
                changing `book` (the sheets, as DataFrames) to set the trap
                the problem is really about

   The hidden tests run the formula on the data as it is, then with the open
   sheet's rows in another order, then with a fresh draw of its rows, then
   the edge case (js/excel.py, _judge_excel). So a typed-in number fails,
   and so does a formula that only works for this exact data. alt answers
   must pass and wrong ones must fail: tests.html checks both. */

export const EXCEL_PROBLEMS = [

/* ── Easy ──────────────────────────────────────────────── */
{
  id: 'x01', difficulty: 'easy', lang: 'excel', tags: ['COUNTIF'],
  title: 'Cancelled orders',
  xl: { sheet: 'orders', cell: 'F2' },
  prompt: [
    'The `orders` sheet is open: one order per row, with its status in column D.',
    'In **F2**, count the orders whose status is `cancelled`.',
  ],
  stub: '=',
  reference: '=COUNTIF(D2:D151,"cancelled")',
  hint: 'Count the cells in D that match one word: `COUNTIF(D2:D151,"cancelled")`.',
  solution: '=COUNTIF(D2:D151,"cancelled")',
  alt: ['=COUNTIF(D:D,"cancelled")', '=COUNTIFS(D2:D151,"cancelled")'],
  wrong: ['=COUNTA(D2:D151)', '=COUNTIF(D2:D151,"delivered")'],
},
{
  id: 'x02', difficulty: 'easy', lang: 'excel', tags: ['COUNTIF', 'criteria'],
  title: 'Rainy days',
  xl: { sheet: 'weather', cell: 'F2' },
  prompt: [
    'The `weather` sheet is open: a year of days, with the rain in millimetres in column C.',
    'In **F2**, count the days that had any rain at all.',
  ],
  notes: ['A dry day has 0 in column C.'],
  stub: '=',
  reference: '=COUNTIF(C2:C366,">0")',
  hint: 'A condition in quotes: `COUNTIF(C2:C366,">0")`.',
  solution: '=COUNTIF(C2:C366,">0")',
  alt: ['=COUNTIF(C:C,">0")', '=COUNTIFS(C2:C366,">0")', '=COUNT(C2:C366)-COUNTIF(C2:C366,0)'],
  wrong: ['=COUNT(C2:C366)', '=COUNTIF(C2:C366,">=0")', '=COUNTIF(C2:C366,">1")'],
},
{
  id: 'x03', difficulty: 'easy', lang: 'excel', tags: ['AVERAGE', 'ROUND'],
  title: 'Average rating',
  xl: { sheet: 'cafe', cell: 'J2' },
  prompt: [
    'The `cafe` sheet is open. Column G is the rating customers gave each day, and some days have none.',
    'In **J2**, work out the average rating, rounded to 2 decimal places.',
  ],
  notes: ['A day with no rating is left out, not counted as 0.'],
  stub: '=',
  reference: '=ROUND(AVERAGE(G2:G121),2)',
  hint: 'AVERAGE already skips empty cells. Wrap it in ROUND: `ROUND(AVERAGE(G2:G121),2)`.',
  solution: '=ROUND(AVERAGE(G2:G121),2)',
  alt: ['=ROUND(SUM(G2:G121)/COUNT(G2:G121),2)', '=ROUND(AVERAGE(G:G),2)'],
  wrong: ['=ROUND(SUM(G2:G121)/ROWS(G2:G121),2)', '=AVERAGE(G2:G121)', '=ROUND(AVERAGE(G2:G121),1)'],
},
{
  id: 'x04', difficulty: 'easy', lang: 'excel', tags: ['ROUND', 'fill down'],
  title: 'Ten per cent off',
  xl: { sheet: 'cafe', cell: 'H2', fill: true },
  prompt: [
    'The `cafe` sheet is open. Column E is the price of a cup each day.',
    'In **H2**, work out the price with 10% off, rounded to 2 decimal places. It is filled down to every row.',
  ],
  stub: '=',
  reference: '=ROUND(E2*0.9,2)',
  hint: '10% off leaves 90%: `ROUND(E2*0.9,2)`.',
  solution: '=ROUND(E2*0.9,2)',
  alt: ['=ROUND(0.9*E2,2)', '=ROUND(E2*90/100,2)'],
  wrong: ['=E2*0.9', '=ROUND(E2-0.1,2)', '=ROUND(E2*0.1,2)'],
},
{
  id: 'x05', difficulty: 'easy', lang: 'excel', tags: ['LEFT', 'UPPER', 'text'],
  title: 'Drink codes',
  xl: { sheet: 'cafe', cell: 'H2', fill: true },
  prompt: [
    'The `cafe` sheet is open. Column C is the drink: latte, espresso, cold brew or tea.',
    'In **H2**, make a short code for the drink: its first three letters, in capitals. A latte is `LAT`. It is filled down.',
  ],
  stub: '=',
  reference: '=UPPER(LEFT(C2,3))',
  hint: 'LEFT takes the first letters and UPPER makes them capitals: `UPPER(LEFT(C2,3))`.',
  solution: '=UPPER(LEFT(C2,3))',
  alt: ['=LEFT(UPPER(C2),3)', '=UPPER(MID(C2,1,3))'],
  wrong: ['=LEFT(C2,3)', '=UPPER(RIGHT(C2,3))', '=PROPER(LEFT(C2,3))'],
},
{
  id: 'x06', difficulty: 'easy', lang: 'excel', tags: ['TEXT', 'dates'],
  title: 'Order months',
  xl: { sheet: 'orders', cell: 'E2', fill: true },
  prompt: [
    'The `orders` sheet is open. Column C is the date of each order.',
    'In **E2**, show the month of the order as three letters, like `Jan` or `Feb`. It is filled down.',
  ],
  stub: '=',
  reference: '=TEXT(C2,"mmm")',
  hint: 'TEXT shows a date in the format you give it. Three m\'s is the short month name: `TEXT(C2,"mmm")`.',
  solution: '=TEXT(C2,"mmm")',
  alt: ['=LEFT(TEXT(C2,"mmmm"),3)'],
  wrong: ['=MONTH(C2)', '=TEXT(C2,"mm")', '=TEXT(C2,"mmmm")'],
},

/* ── Medium ────────────────────────────────────────────── */
{
  id: 'x07', difficulty: 'medium', lang: 'excel', tags: ['AVERAGEIFS', 'criteria'],
  title: 'Busy days in Lagos',
  xl: { sheet: 'cafe', cell: 'J2' },
  prompt: [
    'The `cafe` sheet is open: the city in B, cups sold in D and revenue in F.',
    'In **J2**, find the average revenue on Lagos days when **more than 30** cups were sold, rounded to 2 decimal places.',
  ],
  notes: ['A day with exactly 30 cups is not more than 30.'],
  stub: '=',
  reference: '=ROUND(AVERAGEIFS(F2:F121,B2:B121,"Lagos",D2:D121,">30"),2)',
  edge: {
    about: 'The cafe sheet with a Lagos day that sold exactly 30 cups.',
    code: 'book["cafe"].loc[0, "city"] = "Lagos"\nbook["cafe"].loc[0, "cups"] = 30\n',
  },
  hint: 'The range to average comes first, then a range and a condition for each test: `AVERAGEIFS(F2:F121,B2:B121,"Lagos",D2:D121,">30")`, inside ROUND.',
  solution: '=ROUND(AVERAGEIFS(F2:F121,B2:B121,"Lagos",D2:D121,">30"),2)',
  alt: [
    '=ROUND(SUMIFS(F2:F121,B2:B121,"Lagos",D2:D121,">30")/COUNTIFS(B2:B121,"Lagos",D2:D121,">30"),2)',
    '=ROUND(AVERAGE(FILTER(F2:F121,(B2:B121="Lagos")*(D2:D121>30))),2)',
  ],
  wrong: [
    '=ROUND(AVERAGEIFS(F2:F121,B2:B121,"Lagos",D2:D121,">=30"),2)',
    '=ROUND(AVERAGEIF(B2:B121,"Lagos",F2:F121),2)',
  ],
},
{
  id: 'x08', difficulty: 'medium', lang: 'excel', tags: ['VLOOKUP', 'IFERROR'],
  title: 'Where customers live',
  xl: { sheet: 'customers', cell: 'E2', fill: true },
  prompt: [
    'The `customers` sheet is open, with each customer\'s city in column C. Two customers never said where they live, so their city is empty.',
    'The `cities` sheet has each city in A and its country in B.',
    'In **E2**, show the customer\'s country. Where there\'s no city to look up, show `unknown` instead. It is filled down.',
  ],
  stub: '=',
  reference: '=IFERROR(VLOOKUP(C2,cities!$A$2:$B$5,2,FALSE),"unknown")',
  hint: 'Look the city up in the cities sheet, then catch the ones it can\'t find: `IFERROR(VLOOKUP(C2,cities!$A$2:$B$5,2,FALSE),"unknown")`.',
  solution: '=IFERROR(VLOOKUP(C2,cities!$A$2:$B$5,2,FALSE),"unknown")',
  alt: [
    '=XLOOKUP(C2,cities!$A$2:$A$5,cities!$B$2:$B$5,"unknown")',
    '=IFERROR(INDEX(cities!$B$2:$B$5,MATCH(C2,cities!$A$2:$A$5,0)),"unknown")',
  ],
  wrong: [
    '=VLOOKUP(C2,cities!$A$2:$B$5,2,FALSE)',
    '=IFERROR(VLOOKUP(C2,cities!$A$2:$C$5,3,FALSE),"unknown")',
  ],
},
{
  id: 'x09', difficulty: 'medium', lang: 'excel', tags: ['COUNTIF', '$'],
  title: 'Orders per customer',
  xl: { sheet: 'customers', cell: 'E2', fill: true },
  prompt: [
    'The `customers` sheet is open, with each customer\'s id in column A.',
    'The `orders` sheet has one order per row, rows 2 to 151, with the customer\'s id in column B.',
    'In **E2**, count how many orders each customer placed. Some never ordered. It is filled down.',
  ],
  stub: '=',
  reference: '=COUNTIF(orders!$B$2:$B$151,A2)',
  hint: 'Count the matching ids in the orders sheet, with the range locked so it doesn\'t slide as it fills: `COUNTIF(orders!$B$2:$B$151,A2)`.',
  solution: '=COUNTIF(orders!$B$2:$B$151,A2)',
  alt: ['=COUNTIF(orders!B:B,A2)', '=COUNTIFS(orders!$B$2:$B$151,A2)'],
  wrong: ['=COUNTIF(orders!B2:B151,A2)', '=COUNTIF(orders!$A$2:$A$151,A2)'],
},
{
  id: 'x10', difficulty: 'medium', lang: 'excel', tags: ['RANK', '$'],
  title: 'Rank the days',
  xl: { sheet: 'cafe', cell: 'H2', fill: true },
  prompt: [
    'The `cafe` sheet is open, with each day\'s revenue in column F.',
    'In **H2**, rank the day by revenue: 1 for the biggest day of all, 2 for the next, and so on. It is filled down.',
  ],
  notes: ['Days with the same revenue share a rank.'],
  stub: '=',
  reference: '=RANK.EQ(F2,$F$2:$F$121)',
  hint: 'RANK.EQ compares one value with a whole column. Lock the column with $ so every row ranks against all of it.',
  solution: '=RANK.EQ(F2,$F$2:$F$121)',
  alt: ['=RANK(F2,$F$2:$F$121)', '=COUNTIF($F$2:$F$121,">"&F2)+1'],
  wrong: ['=RANK.EQ(F2,F2:F121)', '=RANK.EQ(F2,$F$2:$F$121,1)'],
},
{
  id: 'x11', difficulty: 'medium', lang: 'excel', tags: ['UNIQUE', 'COUNTA'],
  title: 'How many customers ordered',
  xl: { sheet: 'orders', cell: 'F2' },
  prompt: [
    'The `orders` sheet is open, with the id of the customer who placed each order in column B. Plenty of customers ordered more than once.',
    'In **F2**, count how many **different** customers placed an order.',
  ],
  stub: '=',
  reference: '=COUNTA(UNIQUE(B2:B151))',
  edge: {
    about: 'The orders sheet with one order from a new customer, number 99.',
    code: 'book["orders"].loc[0, "customer_id"] = 99\n',
  },
  hint: 'UNIQUE gives each id once. Count what it gives back: `COUNTA(UNIQUE(B2:B151))`.',
  solution: '=COUNTA(UNIQUE(B2:B151))',
  alt: ['=ROWS(UNIQUE(B2:B151))', '=COUNT(UNIQUE(B2:B151))'],
  wrong: ['=COUNTA(B2:B151)', '=MAX(B2:B151)'],
},
{
  id: 'x12', difficulty: 'medium', lang: 'excel', tags: ['IF', 'the row above'],
  title: 'Dry spells',
  xl: { sheet: 'weather', cell: 'E2', fill: true },
  prompt: [
    'The `weather` sheet is open, with each day\'s rain in column C. A dry day has 0.',
    'In **E2**, count how many dry days in a row there have been, up to and including this one. A day with rain starts the count again at 0. It is filled down.',
  ],
  notes: ['E1 is empty, and an empty cell counts as 0 in a sum.'],
  stub: '=',
  reference: '=IF(C2=0,E1+1,0)',
  hint: 'Each row can read the row above it. If today is dry, it\'s yesterday\'s count plus one: `IF(C2=0,E1+1,0)`.',
  solution: '=IF(C2=0,E1+1,0)',
  alt: ['=IF(C2>0,0,E1+1)', '=IF(C2=0,1+E1,0)'],
  wrong: ['=IF(C2=0,1,0)', '=COUNTIF($C$2:C2,0)'],
},

/* ── Hard ──────────────────────────────────────────────── */
{
  id: 'x13', difficulty: 'hard', lang: 'excel', tags: ['SUMPRODUCT', 'WEEKDAY'],
  title: 'Weekend takings',
  xl: { sheet: 'cafe', cell: 'J2' },
  prompt: [
    'The `cafe` sheet is open, with the date in column A and revenue in F.',
    'In **J2**, add up the revenue taken on Saturdays and Sundays, rounded to 2 decimal places.',
  ],
  stub: '=',
  reference: '=ROUND(SUMPRODUCT((WEEKDAY(A2:A121,2)>5)*F2:F121),2)',
  hint: 'WEEKDAY(date,2) numbers Monday 1 to Sunday 7, so the weekend is above 5. Multiply that test by the revenue and add it up: `SUMPRODUCT((WEEKDAY(A2:A121,2)>5)*F2:F121)`, inside ROUND.',
  solution: '=ROUND(SUMPRODUCT((WEEKDAY(A2:A121,2)>5)*F2:F121),2)',
  alt: [
    '=ROUND(SUM(FILTER(F2:F121,WEEKDAY(A2:A121,2)>5)),2)',
    '=ROUND(SUMPRODUCT((WEEKDAY(A2:A121)=1)*F2:F121)+SUMPRODUCT((WEEKDAY(A2:A121)=7)*F2:F121),2)',
  ],
  wrong: [
    '=ROUND(SUMPRODUCT((WEEKDAY(A2:A121)>5)*F2:F121),2)',
    '=ROUND(SUMPRODUCT((WEEKDAY(A2:A121,2)>=5)*F2:F121),2)',
  ],
},
{
  id: 'x14', difficulty: 'hard', lang: 'excel', tags: ['SUMIF', '$', 'shares'],
  title: 'Share of the city',
  xl: { sheet: 'cafe', cell: 'H2', fill: true },
  prompt: [
    'The `cafe` sheet is open, with the city in column B and revenue in F.',
    'In **H2**, work out each day\'s revenue as a share of its own city\'s total revenue, rounded to 3 decimal places. A Lagos day is divided by all of Lagos. It is filled down.',
  ],
  stub: '=',
  reference: '=ROUND(F2/SUMIF($B$2:$B$121,B2,$F$2:$F$121),3)',
  hint: 'The city\'s total is a SUMIF on this row\'s city. Lock its ranges with $: `ROUND(F2/SUMIF($B$2:$B$121,B2,$F$2:$F$121),3)`.',
  solution: '=ROUND(F2/SUMIF($B$2:$B$121,B2,$F$2:$F$121),3)',
  alt: ['=ROUND(F2/SUMIFS($F$2:$F$121,$B$2:$B$121,B2),3)', '=ROUND(F2/SUMIF(B:B,B2,F:F),3)'],
  wrong: ['=ROUND(F2/SUM($F$2:$F$121),3)', '=ROUND(F2/SUMIF(B2:B121,B2,F2:F121),3)'],
},
{
  id: 'x15', difficulty: 'hard', lang: 'excel', tags: ['XLOOKUP', 'IF', 'two sheets'],
  title: 'Delivered lines only',
  xl: { sheet: 'order_items', cell: 'D2', fill: true },
  prompt: [
    'The `order_items` sheet is open: the order id in A, the product id in B and the quantity in C.',
    'The `orders` sheet has each order id in A and its status in D. The `products` sheet has each product id in A and its price in D.',
    'In **D2**, show the line\'s value (quantity times price), but only if its order was `delivered`. Otherwise show 0. It is filled down.',
  ],
  stub: '=',
  reference: '=IF(XLOOKUP(A2,orders!$A$2:$A$151,orders!$D$2:$D$151)="delivered",C2*XLOOKUP(B2,products!$A$2:$A$13,products!$D$2:$D$13),0)',
  hint: 'Two lookups: the status from orders, to decide, and the price from products, to multiply. `IF(XLOOKUP(A2,orders!$A$2:$A$151,orders!$D$2:$D$151)="delivered", C2*XLOOKUP(...), 0)`.',
  solution: '=IF(XLOOKUP(A2,orders!$A$2:$A$151,orders!$D$2:$D$151)="delivered",C2*XLOOKUP(B2,products!$A$2:$A$13,products!$D$2:$D$13),0)',
  alt: [
    '=IF(VLOOKUP(A2,orders!$A$2:$D$151,4,FALSE)="delivered",C2*VLOOKUP(B2,products!$A$2:$D$13,4,FALSE),0)',
    '=(XLOOKUP(A2,orders!A:A,orders!D:D)="delivered")*C2*XLOOKUP(B2,products!A:A,products!D:D)',
  ],
  wrong: [
    '=C2*XLOOKUP(B2,products!$A$2:$A$13,products!$D$2:$D$13)',
    '=IF(XLOOKUP(A2,orders!$A$2:$A$151,orders!$D$2:$D$151)="shipped",C2*XLOOKUP(B2,products!$A$2:$A$13,products!$D$2:$D$13),0)',
  ],
},
{
  id: 'x16', difficulty: 'hard', lang: 'excel', tags: ['FILTER', 'SORT', 'spills'],
  title: 'Pricey products, A to Z',
  xl: { sheet: 'products', cell: 'F2' },
  prompt: [
    'The `products` sheet is open: the name in B, the category in C and the price in D, rows 2 to 13.',
    'In **F2**, list the names of the products that cost **more than £15**, in alphabetical order. One formula: the list spills down from F2.',
  ],
  notes: ['A product at exactly 15 doesn\'t make the list.'],
  stub: '=',
  reference: '=SORT(FILTER(B2:B13,D2:D13>15))',
  edge: {
    about: 'The products sheet with one product priced at exactly 15.',
    code: 'book["products"].loc[0, "price"] = 15.0\n',
  },
  hint: 'FILTER keeps the names whose price passes the test, and SORT puts them in order: `SORT(FILTER(B2:B13,D2:D13>15))`.',
  solution: '=SORT(FILTER(B2:B13,D2:D13>15))',
  alt: ['=SORT(FILTER(B2:B13,D2:D13>15),1,1)', '=SORTBY(FILTER(B2:B13,D2:D13>15),FILTER(B2:B13,D2:D13>15))'],
  wrong: ['=FILTER(B2:B13,D2:D13>15)', '=SORT(FILTER(B2:B13,D2:D13>=15))', '=SORT(FILTER(B2:B13,D2:D13>15),1,-1)'],
},
];
