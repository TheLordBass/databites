/* Every course opens with an introduction lesson (id <prefix>-00): what the
   tool is, what the course will let you do and why it matters at work, then
   one small task you can't really get wrong, so the first run of a new
   course is a win. curriculum/index.js puts each one first in its course,
   as a part of its own ("Introduction"), and game.js marks one done for
   anyone who's already further into that course, so nobody is sent back.

   INTROS: track id -> the lesson, written like any other (concept, starter,
   task, hint, solution, check, deeper). INTRO_DETAIL: lesson id -> its
   fuller teaching (explain, example, brief), merged in detail/index.js. */

const CAFE_SHEET = ['The `cafe` sheet: headings in row 1, then one day per row, rows 2 to 121:',
  { 'A date': 'the day', 'B city': 'Lagos, Accra or Nairobi', 'D cups': 'cups sold that day', 'E price': 'the price of a cup', 'F revenue': "that day's takings" }];
const CAFE_TABLE = ['`cafe`: 120 days of sales at a café chain in three cities, one row per day:',
  { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'the drink of the day', cups: 'cups sold', revenue: "the day's takings, in £" }];

export const INTROS = {

excel: {
  id: 'xl-00', mins: 2, intro: true,
  xl: { sheet: 'cafe', cell: 'J2', label: 'days' },
  title: 'Meet Excel',
  concept: [
    'Excel is a grid of cells where every number can be worked out by a formula.',
    'This course works on a real sheet of café sales, with no code to write.',
    'A formula starts with = and gives its answer in its own cell.',
  ],
  starter: '=COUNT(D2:D11)',
  task: 'The starter counts the first 10 days. Change the 11 to 121, so J2 counts every day on the sheet.',
  hint: 'Only one number changes: `=COUNT(D2:D121)`.',
  solution: '=COUNT(D2:D121)',
  check: `_excel_expect('=COUNT(D2:D121)', uses=['COUNT'])`,
  deeper: {
    why: 'Spreadsheets are still where most business numbers live. Being quick and careful in Excel is useful in almost every office job, data or not.',
    mistake: 'Typing numbers in by hand when a formula could work them out. A typed number never updates when the data changes; a formula always does.',
    work: 'Finance, operations, marketing and sales all share spreadsheets every day. A clean, well-built sheet is often the first thing people trust you with.',
  },
},

xlclean: {
  id: 'xc-00', mins: 2, intro: true,
  xl: { sheet: 'survey', cell: 'J2', label: 'answers' },
  title: 'Meet the messy sheet',
  concept: [
    'Real exports arrive messy: stray spaces, odd capitals, text where numbers should be.',
    'This course cleans one with formulas, step by step, and checks it can be trusted.',
    'The sheet is a customer survey, with answers in rows 2 to 33.',
  ],
  starter: '=COUNTA(B2:B5)',
  task: 'The starter counts the cities in the first 4 answers. Change the 5 to 33, so J2 counts every answer.',
  hint: 'Only one number changes: `=COUNTA(B2:B33)`.',
  solution: '=COUNTA(B2:B33)',
  check: `_excel_expect('=COUNTA(B2:B33)', uses=['COUNTA'])`,
  deeper: {
    why: 'Every report is only as good as the data under it. Most of the time spent on real analysis goes on cleaning, long before any chart.',
    mistake: 'Fixing a messy sheet by hand, cell by cell. It takes ages, nobody can check it, and next month you have to do it all again. Formulas do it the same way every time.',
    work: 'Survey results, form sign-ups and exports from other systems all need tidying before they can be counted. Being the person who can do that well is valuable.',
  },
},

sql: {
  id: 'sq-00', mins: 2, intro: true,
  title: 'Meet SQL',
  concept: [
    'A database keeps data in tables, and SQL is the language for asking it questions.',
    'A question is called a query. It names the columns you want and the table they come from.',
    'This course starts with the café table, then a whole online shop.',
  ],
  starter: 'SELECT *\nFROM cafe\nLIMIT 5;',
  task: 'The starter asks for the first 5 rows of the cafe table. Change the 5 to 3 and run it.',
  hint: 'Only one number changes: `LIMIT 3`.',
  solution: 'SELECT *\nFROM cafe\nLIMIT 3;',
  check: `_same_as("SELECT * FROM cafe LIMIT 3", ordered=True)`,
  deeper: {
    why: 'Most companies keep their data in databases, and nearly all of them speak SQL. Learn it once and it works almost everywhere.',
    mistake: 'Thinking SQL is only for programmers. Many analysts, marketers and managers write SQL every day. It reads close to English.',
    work: 'SQL is one of the most asked-for skills in data job adverts. It turns "can someone pull the numbers for me?" into something you can do yourself.',
  },
},

sqlclean: {
  id: 'sc-00', mins: 2, intro: true,
  title: 'Meet the messy table',
  concept: [
    'Data loaded into a database is often just as messy as the file it came from.',
    'This course finds the mess in SQL, fixes it, and checks the result can be trusted.',
    'The table is a customer survey, exported by someone else and never tidied.',
  ],
  starter: 'SELECT *\nFROM survey\nLIMIT 5;',
  task: 'The starter shows the first 5 survey answers. Change the 5 to 10, to see more of the mess.',
  hint: 'Only one number changes: `LIMIT 10`.',
  solution: 'SELECT *\nFROM survey\nLIMIT 10;',
  check: `_same_as("SELECT * FROM survey LIMIT 10", ordered=True)`,
  deeper: {
    why: 'Cleaning in the database means every report that reads the table gets the same tidy answers, instead of each one fixing things its own way.',
    mistake: 'Trusting a table because it is in a database. A database stores whatever it was given, mess included.',
    work: 'Data engineers and analysts spend a lot of their time on exactly this: finding odd values, fixing them, and proving the numbers add up.',
  },
},

basics: {
  id: 'py-00', mins: 2, intro: true,
  title: 'Meet Python',
  concept: [
    'Python is a programming language: you write instructions, and the computer carries them out.',
    'It is the most popular language for working with data, and it reads a lot like English.',
    'print(...) shows something underneath your code.',
  ],
  starter: 'print("Hello from the café")',
  task: 'Change Hello to Welcome, keeping the quotes, and run it.',
  hint: 'Only one word changes: `print("Welcome from the café")`.',
  solution: 'print("Welcome from the café")',
  check: `assert "Welcome" in _out, "Change the word Hello to Welcome, inside the quotes, then run it."`,
  deeper: {
    why: 'Python is used for data analysis, automation, websites and machine learning. Its clear style makes it a gentle first language.',
    mistake: 'Worrying about breaking something. Nothing you type here can harm your computer. If code goes wrong, Python just tells you what happened.',
    work: 'Analysts use Python to clean data, automate dull reports and build models. It is one of the most useful skills you can add to any job.',
  },
},

pandas: {
  id: 'pd-00', mins: 2, intro: true,
  title: 'Meet pandas',
  concept: [
    'pandas is a Python toolkit for tables, like a spreadsheet you control with code.',
    'A table in pandas is called a DataFrame. The café data is one, called cafe.',
    'cafe.head(5) shows its first 5 rows.',
  ],
  starter: 'first = cafe.head(5)\n\nfirst',
  task: 'The starter keeps the first 5 rows in first. Change the 5 to 3 and run it.',
  hint: 'Only one number changes: `first = cafe.head(3)`.',
  solution: 'first = cafe.head(3)\n\nfirst',
  check: `assert "first" in globals(), "Keep the rows in a variable called first."
assert len(first) == 3, "first should hold 3 rows: cafe.head(3)."`,
  deeper: {
    why: 'pandas does in one line what takes many clicks in a spreadsheet, and it copes with millions of rows. Once a step is written, it runs the same way every time.',
    mistake: 'Expecting to remember every pandas function. Nobody does. Knowing what is possible, and looking the rest up, is how everyone works.',
    work: 'pandas is the everyday tool of data analysts and data scientists who use Python. Most data work in Python starts by loading a table into it.',
  },
},

messy: {
  id: 'ms-00', mins: 2, intro: true,
  title: 'Meet messy data',
  concept: [
    'Most real data arrives messy: spaces you cannot see, numbers stored as text, dates in two layouts.',
    'This course rescues it in pandas, then checks it can be trusted.',
    'survey is a customer survey that nobody ever tidied.',
  ],
  starter: 'cities = survey["City "].head(5)\n\ncities',
  task: 'The starter shows the city typed in the first 5 answers. Change the 5 to 10 to see more of how they were typed.',
  hint: 'Only one number changes: `survey["City "].head(10)`.',
  solution: 'cities = survey["City "].head(10)\n\ncities',
  check: `assert "cities" in globals(), "Keep them in a variable called cities."
assert len(cities) == 10, "cities should hold 10 answers: .head(10)."`,
  deeper: {
    why: 'Clean data is the foundation of every result. A single stray space can split one city into two and quietly change every total.',
    mistake: 'Cleaning by hand in a spreadsheet before loading. It cannot be repeated, and the next export brings the same mess back.',
    work: 'Exports from forms, tills and old systems always need fixing. Analysts often say most of the job is cleaning.',
  },
},

wrangling: {
  id: 'wr-00', mins: 2, intro: true,
  title: 'Meet wrangling',
  concept: [
    'Data is usually spread over several tables that need joining, stacking or reshaping first.',
    'This course puts tables together in pandas, then reshapes them for charts and reports.',
    'cities is a small table about each city: its country and population.',
  ],
  starter: 'some = cities.head(2)\n\nsome',
  task: 'The starter shows the first 2 rows of cities. Change the 2 to 4 to see them all.',
  hint: 'Only one number changes: `cities.head(4)`.',
  solution: 'some = cities.head(4)\n\nsome',
  check: `assert "some" in globals(), "Keep the rows in a variable called some."
assert len(some) == 4, "some should hold all 4 cities: cities.head(4)."`,
  deeper: {
    why: 'Facts about one thing are often stored in different places. Joining them is what lets you ask questions that cross between them.',
    mistake: 'Copying columns from one table to another by hand. It breaks the moment either table changes. A join lines rows up by what they share.',
    work: 'Combining sales with customers, or orders with products, is a daily task for analysts in every industry.',
  },
},

timeseries: {
  id: 'ts-00', mins: 2, intro: true,
  title: 'Meet time series',
  concept: [
    'A time series is data recorded over time: daily sales, monthly visitors, hourly calls.',
    'This course groups days into weeks and months, smooths out the noise and compares periods.',
    'The cafe table has one row per day, so it is a time series already.',
  ],
  starter: 'days = cafe["date"].head(3)\n\ndays',
  task: 'The starter shows the first 3 dates. Change the 3 to 7, to see a whole week.',
  hint: 'Only one number changes: `.head(7)`.',
  solution: 'days = cafe["date"].head(7)\n\ndays',
  check: `assert "days" in globals(), "Keep the dates in a variable called days."
assert len(days) == 7, "days should hold a week of dates: .head(7)."`,
  deeper: {
    why: 'Almost every business question involves time: is it growing, which day is busiest, how did this month compare with last?',
    mistake: 'Comparing a short month with a long one, or a busy season with a quiet one, and reading too much into the difference.',
    work: 'Weekly and monthly reports, dashboards and trend charts are built on time series skills.',
  },
},

matplotlib: {
  id: 'mp-00', mins: 2, intro: true,
  title: 'Meet matplotlib',
  concept: [
    'matplotlib is the Python toolkit for drawing charts.',
    'A chart shows in a second what a table of numbers hides.',
    'plt.plot(...) draws a line through the values you give it.',
  ],
  starter: 'import matplotlib.pyplot as plt\n\nplt.plot(cafe["cups"].head(10))\nplt.show()',
  task: 'The starter draws the cups for the first 10 days. Change the 10 to 20 and run it.',
  hint: 'Only one number changes: `cafe["cups"].head(20)`.',
  solution: 'import matplotlib.pyplot as plt\n\nplt.plot(cafe["cups"].head(20))\nplt.show()',
  check: `_ax = _axes()
assert _ax and _ax[0].lines, "No line appeared. Keep plt.plot(...) and plt.show()."
assert len(_ax[0].lines[0].get_ydata()) == 20, "Plot the first 20 days: .head(20)."`,
  deeper: {
    why: 'People remember a picture far better than a table. A good chart can carry a whole finding on its own.',
    mistake: 'Making a chart and forgetting to label it. Without labels, nobody knows what they are looking at.',
    work: 'Charts are how analysis gets shared: in reports, slides and dashboards. Being able to draw exactly the chart you need is a real strength.',
  },
},

seaborn: {
  id: 'sb-00', mins: 2, intro: true,
  title: 'Meet seaborn',
  concept: [
    'seaborn is a charting toolkit built on matplotlib that understands pandas tables.',
    'You name the table and its columns, and it draws a tidy chart with labels.',
    'A histogram shows how values are spread, in bars called bins.',
  ],
  starter: 'import seaborn as sns\n\nsns.set_theme()\nsns.histplot(data=cafe, x="cups", bins=5)\nplt.show()',
  task: 'The starter spreads the cups over 5 bins. Change the 5 to 10, for a finer picture.',
  hint: 'Only one number changes: `bins=10`.',
  solution: 'import seaborn as sns\n\nsns.set_theme()\nsns.histplot(data=cafe, x="cups", bins=10)\nplt.show()',
  check: `_ax = _axes()
assert _ax and _ax[0].patches, "No bars appeared. Keep sns.histplot(...) and plt.show()."
assert len(_ax[0].patches) == 10, "Use 10 bins: bins=10."`,
  deeper: {
    why: 'seaborn makes good-looking statistical charts with very little code, so you can try several views of the data quickly.',
    mistake: 'Fighting seaborn to change one small detail. When you need full control, it is still matplotlib underneath, and you can reach in.',
    work: 'Analysts use seaborn to explore data fast: spreads, comparisons between groups and relationships, before deciding what to report.',
  },
},

analysis: {
  id: 'an-00', mins: 2, intro: true,
  title: 'Meet a real analysis',
  concept: [
    'This course is one question answered from start to finish: which drink should the café push?',
    'Analysis means turning a vague question into numbers you can check.',
    'groupby splits the table into groups and sums each one up.',
  ],
  starter: 'by = cafe.groupby("city")["revenue"].sum()\n\nby',
  task: 'The starter adds up the takings by city. Change "city" to "drink" to add them up by drink instead.',
  hint: 'Only one word changes: `cafe.groupby("drink")`.',
  solution: 'by = cafe.groupby("drink")["revenue"].sum()\n\nby',
  check: `assert "by" in globals(), "Keep the result in a variable called by."
assert "latte" in by.index, "Group by drink: cafe.groupby(\\"drink\\")."`,
  deeper: {
    why: 'Tools are only half the job. Choosing the right question, checking the data and explaining the answer are what make analysis useful.',
    mistake: 'Starting to code before deciding what "best" means. Decide what you are measuring first, or the answer will drift towards your hunch.',
    work: 'Every analyst job comes down to this loop: a question, the data, a check, and a clear answer someone can act on.',
  },
},

stats: {
  id: 'st-00', mins: 2, intro: true,
  title: 'Meet statistics',
  concept: [
    'Statistics is about how sure you can be: is a difference real, or just luck?',
    'This course covers averages, spread, chance, honest tests and relationships.',
    'The mean and the median are two ways of saying what is typical.',
  ],
  starter: 'typical = cafe["cups"].mean()\n\ntypical',
  task: 'The starter works out the mean cups a day. Change mean to median, to get the middle value instead.',
  hint: 'Only one word changes: `cafe["cups"].median()`.',
  solution: 'typical = cafe["cups"].median()\n\ntypical',
  check: `assert "typical" in globals(), "Keep the answer in a variable called typical."
assert float(typical) == float(cafe["cups"].median()), "Use .median() instead of .mean()."`,
  deeper: {
    why: 'Numbers always wobble. Statistics tells you when a change is worth acting on and when it is just noise.',
    mistake: 'Treating every difference as real. Two weeks can differ by chance alone, and acting on noise wastes time and money.',
    work: 'A/B tests, surveys, forecasts and quality checks all lean on statistics. It is what makes an analyst trustworthy.',
  },
},

metrics: {
  id: 'mt-00', mins: 2, intro: true,
  title: 'Meet business metrics',
  concept: [
    'A metric is a number with an exact definition, like conversion rate or churn.',
    'This course measures an online shop the way real companies do, and runs A/B tests.',
    'sessions has one row per visit, and purchased says whether it ended in a sale.',
  ],
  starter: 'rate = round(sessions["purchased"].mean(), 1)\n\nrate',
  task: 'The starter works out the share of visits that bought, rounded to 1 place. Change the 1 to 3, to see it properly.',
  hint: 'Only one number changes: `round(..., 3)`.',
  solution: 'rate = round(sessions["purchased"].mean(), 3)\n\nrate',
  check: `assert "rate" in globals(), "Keep the answer in a variable called rate."
assert abs(float(rate) - round(sessions["purchased"].mean(), 3)) < 1e-9, "Round to 3 places: round(..., 3)."`,
  deeper: {
    why: 'Companies run on a handful of numbers. Knowing exactly how each one is defined stops arguments and bad decisions.',
    mistake: 'Comparing two numbers that were counted differently, like visits against visitors. Always check the definition first.',
    work: 'Product, growth and marketing teams track these metrics every day. Analysts who can measure them well are in demand.',
  },
},

forecast: {
  id: 'fc-00', mins: 2, intro: true,
  title: 'Meet forecasting',
  concept: [
    'A forecast says what to expect next, so the right number of people are on shift.',
    'This course starts with simple baselines, then models, and tests them honestly.',
    'calls is two years of daily calls to a contact centre.',
  ],
  starter: 'recent = calls.tail(3)\n\nrecent',
  task: 'The starter shows the last 3 days of calls. Change the 3 to 7, to see the last week.',
  hint: 'Only one number changes: `calls.tail(7)`.',
  solution: 'recent = calls.tail(7)\n\nrecent',
  check: `assert "recent" in globals(), "Keep the rows in a variable called recent."
assert len(recent) == 7, "recent should hold the last 7 days: calls.tail(7)."`,
  deeper: {
    why: 'Planning needs a view of the future: staff, stock and budgets all depend on how busy things will be.',
    mistake: 'Trusting a clever model without checking it against a simple guess. Often "same day last week" is hard to beat.',
    work: 'Contact centres, shops, warehouses and finance teams all forecast. A forecast with an honest error attached is genuinely useful.',
  },
},

dax: {
  id: 'dx-00', mins: 2, intro: true,
  rows: 'products[category]',
  title: 'Meet DAX',
  concept: [
    'DAX is the formula language of Power BI, Microsoft\'s reporting tool.',
    'A measure is a named formula that works out a number for whatever is showing.',
    'Here the answers appear in a matrix, one row per product category.',
  ],
  starter: 'Lines = COUNTROWS(products)',
  task: 'The starter counts products, not order lines. Change products to order_items, so Lines counts the order lines in each category.',
  hint: 'Only the table changes: `Lines = COUNTROWS(order_items)`.',
  solution: 'Lines = COUNTROWS(order_items)',
  check: `_dax_expect("Lines", "COUNTROWS(order_items)")`,
  deeper: {
    why: 'Power BI is one of the most used reporting tools in business, and DAX is what makes its numbers respond to every filter and click.',
    mistake: 'Writing DAX like an Excel formula for one cell. A measure is worked out again for every cell it appears in.',
    work: 'Business intelligence analysts build Power BI reports all day. DAX is the skill that separates a basic report from a great one, and it is on the PL-300 exam.',
  },
},

pbi: {
  id: 'pbi-00', mins: 2, intro: true,
  rows: 'cities[country]',
  title: 'Meet the Power BI model',
  concept: [
    'A Power BI report sits on a model: tables linked by the columns they share.',
    'This course adds calculated columns, uses the date table and common patterns on a star schema.',
    'Here the matrix has one row per country, from the cities table.',
  ],
  starter: 'Customers = COUNTROWS(orders)',
  task: 'The starter counts orders, not customers. Change orders to customers, so the matrix shows how many customers live in each country.',
  hint: 'Only the table changes: `Customers = COUNTROWS(customers)`.',
  solution: 'Customers = COUNTROWS(customers)',
  check: `_dax_expect("Customers", "COUNTROWS(customers)")`,
  deeper: {
    why: 'A well-built model makes every measure simpler and every report faster. Most Power BI problems are really model problems.',
    mistake: 'Putting everything into one giant table. Separate tables linked together are smaller, clearer and easier to filter.',
    work: 'Designing the model is a core part of the PL-300 exam and of real Power BI work. Good models are what make reports trustworthy.',
  },
},

projects: {
  id: 'pj-00', mins: 2, intro: true,
  title: 'Meet the projects',
  concept: [
    'Each project is one real question, answered with every tool you have learned.',
    'You use pandas, SQL, Power BI and charts together, the way a real job does.',
    'The online shop has customers, orders, products and order lines.',
  ],
  starter: 'people = len(orders)\n\npeople',
  task: 'The starter counts orders, not people. Change orders to customers, so people is how many customers the shop has.',
  hint: 'Only one word changes: `people = len(customers)`.',
  solution: 'people = len(customers)\n\npeople',
  check: `assert "people" in globals(), "Keep the answer in a variable called people."
assert int(people) == len(customers), "Count the customers: len(customers)."`,
  deeper: {
    why: 'Real questions never say which tool to use. Choosing the right one for each step, and checking one against another, is what experience looks like.',
    mistake: 'Jumping straight to a chart. Settle what the question means and check the numbers first.',
    work: 'Finished projects make a strong portfolio. Being able to say "here is a question I answered, and how" is exactly what interviewers want to hear.',
  },
},

etl: {
  id: 'et-00', mins: 2, intro: true,
  title: 'Meet pipelines',
  concept: [
    'A pipeline moves data from where it starts to where it is used, the same way every time.',
    'ETL stands for its three stages: extract, transform and load.',
    'This course follows a nightly export from the café tills into a database.',
  ],
  starter: 'steps = ["extract", "load"]\n\nsteps',
  task: 'The starter is missing a stage. Add "transform" between "extract" and "load".',
  hint: 'Put it in the middle, with commas: `["extract", "transform", "load"]`.',
  solution: 'steps = ["extract", "transform", "load"]\n\nsteps',
  check: `assert "steps" in globals(), "Keep the list in a variable called steps."
assert steps == ["extract", "transform", "load"], "steps should be extract, transform, load, in that order."`,
  deeper: {
    why: 'Reports are only as fresh and reliable as the pipeline that feeds them. A good pipeline runs every night without anyone watching.',
    mistake: 'Loading data straight from the source without checking it. One bad export can quietly break every report downstream.',
    work: 'Data engineers build pipelines for a living, and analysts who can build small ones are far more independent.',
  },
},

algo: {
  id: 'al-00', mins: 2, intro: true,
  title: 'Meet algorithms',
  concept: [
    'An algorithm is a step-by-step way to solve a problem.',
    'Some ways take far fewer steps than others, and on big data that is the difference between seconds and hours.',
    'Halving something over and over gets small surprisingly fast.',
  ],
  starter: 'n = 8\nsteps = 0\nwhile n > 1:\n    n = n // 2\n    steps += 1\n\nprint(steps, "halvings")',
  task: 'The starter counts how many halvings it takes to get 8 down to 1. Change the 8 to 1024 and run it.',
  hint: 'Only one number changes: `n = 1024`.',
  solution: 'n = 1024\nsteps = 0\nwhile n > 1:\n    n = n // 2\n    steps += 1\n\nprint(steps, "halvings")',
  check: `assert "steps" in globals(), "Keep the count in steps."
assert steps == 10, "Start from 1024: n = 1024. It takes 10 halvings."`,
  deeper: {
    why: 'Knowing how work grows with the size of the data tells you whether code will still be fast next year, when the data is ten times bigger.',
    mistake: 'Speeding up code by guessing. Count the steps, or measure, and fix the part that really takes the time.',
    work: 'Algorithm questions come up in many technical interviews, and the habits behind them make everyday code faster and clearer.',
  },
},

numpy: {
  id: 'np-00', mins: 2, intro: true,
  title: 'Meet NumPy',
  concept: [
    'NumPy is the Python toolkit for working with lots of numbers at once.',
    'pandas and machine learning are both built on it.',
    'An array does maths on every value at once, with no loop.',
  ],
  starter: 'prices = np.array([2.5, 3.0, 4.2])\nbigger = prices * 2\n\nbigger',
  task: 'The starter doubles every price. Change the 2 to 3, to triple them instead.',
  hint: 'Only one number changes: `prices * 3`.',
  solution: 'prices = np.array([2.5, 3.0, 4.2])\nbigger = prices * 3\n\nbigger',
  check: `assert "bigger" in globals(), "Keep the answer in a variable called bigger."
assert np.allclose(bigger, [7.5, 9.0, 12.6]), "Multiply by 3: prices * 3."`,
  deeper: {
    why: 'NumPy runs its maths in fast compiled code, so it handles millions of numbers in the time a loop takes for thousands.',
    mistake: 'Writing a loop over numbers out of habit. Most loops over numbers become one line of array maths.',
    work: 'Every data science and machine learning library leans on NumPy. Understanding arrays makes the rest of the stack make sense.',
  },
},

ai: {
  id: 'ai-00', mins: 2, intro: true,
  title: 'Meet AI',
  concept: [
    'Machine learning means a program learns a rule from examples, instead of being told the rule.',
    'This course builds models, a neural network from scratch, and models that read text.',
    'The simplest model of all: guess the answer of the most similar example.',
  ],
  starter: 'examples = [(10, "quiet"), (30, "steady"), (55, "busy")]\ncups = 50\n\nnearest = min(examples, key=lambda e: abs(e[0] - cups))\nprint(cups, "cups looks", nearest[1])',
  task: 'The starter guesses what kind of day 50 cups is, from three examples. Change the 50 to 12 and see what it guesses.',
  hint: 'Only one number changes: `cups = 12`.',
  solution: 'examples = [(10, "quiet"), (30, "steady"), (55, "busy")]\ncups = 12\n\nnearest = min(examples, key=lambda e: abs(e[0] - cups))\nprint(cups, "cups looks", nearest[1])',
  check: `assert cups == 12, "Change cups to 12."
assert "quiet" in _out, "Run it with cups = 12: the nearest example is a quiet day."`,
  deeper: {
    why: 'When the rule is too complicated to write by hand, like reading handwriting, learning it from examples is the only practical way.',
    mistake: 'Thinking AI is magic. Underneath, it is maths learning patterns from data, and it is only as good as the examples it learned from.',
    work: 'Understanding how models learn helps you use AI tools wisely at work, and it is the first step towards building your own.',
  },
},

ml: {
  id: 'ml-00', mins: 2, intro: true,
  title: 'Meet machine learning at work',
  concept: [
    'This course builds a model the way companies really do: baselines, pipelines and honest scores.',
    'The question: which subscribers are about to leave?',
    'churn has one row per subscriber, and churned is 1 for those who left.',
  ],
  starter: 'share_left = round(churn["churned"].mean(), 0)\n\nshare_left',
  task: 'Rounded to 0 places, the share who left looks like 0. Change the 0 to 2 to see the real share.',
  hint: 'Only one number changes: `round(..., 2)`.',
  solution: 'share_left = round(churn["churned"].mean(), 2)\n\nshare_left',
  check: `assert "share_left" in globals(), "Keep the answer in a variable called share_left."
assert abs(float(share_left) - round(churn["churned"].mean(), 2)) < 1e-9, "Round to 2 places: round(..., 2)."`,
  deeper: {
    why: 'A model that predicts who might leave lets a business act early, with an offer or a call, before the customer has gone.',
    mistake: 'Celebrating a high score without checking it against a lazy guess. If most people stay, guessing "nobody leaves" already scores well.',
    work: 'Churn, fraud and demand models are some of the most common machine learning projects in business.',
  },
},

r: {
  id: 'r-00', mins: 2, intro: true,
  title: 'Meet R',
  concept: [
    'R is a language made especially for statistics and data analysis.',
    'This course asks the pandas questions again, in R with dplyr, on the same café data.',
    'head(cafe, 5) shows the first 5 rows of a table.',
  ],
  starter: 'first <- head(cafe, 5)\n\nfirst',
  task: 'The starter keeps the first 5 rows in first. Change the 5 to 3 and run it.',
  hint: 'Only one number changes: `head(cafe, 3)`.',
  solution: 'first <- head(cafe, 3)\n\nfirst',
  check: `expect(has("first"), "Keep the rows in a variable called first.")
expect(nrow(first) == 3, "first should hold 3 rows: head(cafe, 3).")`,
  deeper: {
    why: 'R was built by statisticians, and many of the newest statistical methods arrive in R first.',
    mistake: 'Thinking you must choose between R and Python. Many analysts use both, and the ideas carry straight across.',
    work: 'R is widely used in research, health, finance and government analytics. Knowing it opens doors that Python alone does not.',
  },
},
};

/* The fuller teaching, keyed by lesson id. */
export const INTRO_DETAIL = {
'xl-00': {
  explain: [
    "Welcome to Excel. A spreadsheet is a big grid of cells, and each cell has an address made of its column letter and row number, like **D2**.",
    "This course works on a real sheet of café sales: one row for each day, with the city, the drink, the cups sold, the price and the takings.",
    "Start a cell with **=** and Excel works something out for you. `COUNT` counts the cells that hold numbers, and `D2:D11` means D2 down to D11.",
    "By the end of the course you'll add things up by condition, look values up on another sheet, and make lists that build themselves.",
    "Each lesson works the same way: a few short points, a worked example to open if you like, then a small task. Type your formula and press **Run**.",
  ],
  example: {
    xl: { cell: 'I2', label: 'total cups' },
    say: "Here's every cup the café has sold, added up in one cell.",
    code: '=SUM(D2:D121)',
    lines: [
      ['=', 'tells the cell to work something out.'],
      ['SUM(D2:D121)', 'adds up the cups column, from the first day to the last.'],
    ],
  },
  brief: {
    story: 'The owner wants to know how many days of sales are on the sheet.',
    get: [CAFE_SHEET],
    want: ['In J2, count every day on the sheet: change the 11 in the starter to 121'],
    out: 'J2 shows one number: how many days there are.',
  },
},
'xc-00': {
  explain: [
    "Real data rarely arrives tidy. This course works on a customer survey that was exported and never cleaned up.",
    "You'll meet the classic problems: spaces you can't see, capitals all over the place, words where numbers should be, and dates written two ways.",
    "Each problem gets fixed with a formula, so the fix works again on next month's export without any extra effort.",
    "After that comes checking: rules every row should follow, totals that should agree, and a quick health check for the whole sheet.",
    "First, though, a simple count. `COUNTA` counts every cell that has anything in it, which is a good first look at any new sheet.",
  ],
  example: {
    xl: { cell: 'I2', label: 'with a spend' },
    say: "Here every answer that has something in the spend column is counted.",
    code: '=COUNTA(D2:D33)',
    lines: [
      ['COUNTA', 'counts the cells that aren\'t empty.'],
      ['D2:D33', 'the spend column, from the first answer to the last.'],
    ],
  },
  brief: {
    story: 'The marketing team wants to know how many people answered the survey before anyone starts cleaning.',
    get: [['The `survey` sheet: customer answers in rows 2 to 33, with the city in column B.']],
    want: ['In J2, count every answer: change the 5 in the starter to 33'],
    out: 'J2 shows one number: how many answers there are.',
  },
},
'sq-00': {
  explain: [
    "Welcome to SQL. A **database** keeps data in tables, and **SQL** is the language you use to ask those tables questions.",
    "Each question is a **query**. `SELECT` says which columns you want, `FROM` says which table, and `*` means every column.",
    "`LIMIT 5` keeps just the first 5 rows, which is perfect for having a quick look.",
    "The course starts with the café's daily sales, then moves on to a whole online shop: customers, orders, products and order lines.",
    "By the end you'll filter, group, join tables together, rank rows and answer the kind of questions analysts get asked every day.",
  ],
  example: {
    say: "Here are just two columns from the café table, for the first four days.",
    code: 'SELECT date, cups\nFROM cafe\nLIMIT 4;',
    lines: [
      ['SELECT date, cups', 'the two columns to show.'],
      ['FROM cafe', 'the table they come from.'],
      ['LIMIT 4', 'only the first 4 rows.'],
    ],
  },
  brief: {
    story: 'You want a quick look at the café table before asking it anything harder.',
    get: [CAFE_TABLE],
    want: ['Every column for the first 3 rows: change the 5 in the starter to 3'],
    out: 'The first 3 rows of cafe, every column.',
  },
},
'sc-00': {
  explain: [
    "A database stores whatever it's given, mess and all. This course cleans a messy customer survey right inside SQL.",
    "Even the column names are untidy here. Some have spaces around them, and others have brackets.",
    "You'll trim and fix text, turn words into numbers, rebuild dates, remove copies and pull numbers out of sentences.",
    "Then you'll check the data can be trusted: rules every row should follow, totals that should match, and a health check in one query.",
    "To start, just look. Seeing the raw rows is always the first step of any cleaning job.",
  ],
  example: {
    say: "Here's how many answers the survey has, counted in one query.",
    code: 'SELECT COUNT(*) AS answers\nFROM survey;',
    lines: [
      ['COUNT(*)', 'counts every row.'],
      ['AS answers', 'names the result.'],
    ],
  },
  brief: {
    story: 'Before cleaning anything, the data team wants to see what the survey export really looks like.',
    get: [['A table `survey`: customer answers, exported and never tidied.']],
    want: ['Every column for the first 10 answers: change the 5 in the starter to 10'],
    out: 'The first 10 rows of survey, every column, mess included.',
  },
},
'py-00': {
  explain: [
    "Welcome to Python. A program is a list of instructions, and Python carries them out one line at a time, from the top.",
    "You type your code in the editor and press **Run**. Whatever your code shows appears underneath.",
    "`print(...)` shows whatever is inside its brackets. Words go inside quotes, so Python knows they're text.",
    "This course goes from your very first line to functions, files, classes and small programs, with café examples all the way.",
    "There's no way to break anything here. If something goes wrong, Python tells you what happened, and that's part of learning.",
  ],
  example: {
    say: "Here Python shows two lines: a sentence, and a sum it works out.",
    code: 'print("Two lattes cost")\nprint(2 * 4.50)',
    lines: [
      ['print("Two lattes cost")', 'shows the words inside the quotes.'],
      ['print(2 * 4.50)', 'works out 2 times 4.50 and shows the answer.'],
    ],
  },
  brief: {
    story: 'The café wants a friendlier greeting on its screen.',
    get: [['A starter that prints `Hello from the café`.']],
    want: ['Change Hello to Welcome, keeping the quotes'],
    out: 'Run it: you should see Welcome from the café.',
  },
},
'pd-00': {
  explain: [
    "Welcome to pandas. It's a Python toolkit for working with tables, a bit like a spreadsheet you drive with short commands.",
    "A table in pandas is called a **DataFrame**. The café data is already loaded as one, called `cafe`.",
    "`cafe.head(5)` shows the first 5 rows, which is how you say hello to any new table.",
    "In this course you'll filter rows, add columns, group and summarise, handle gaps and work with dates.",
    "Every step you write can be run again on next month's data, which is exactly why analysts love it.",
  ],
  example: {
    say: "Here's the size of the café table: how many rows and how many columns.",
    code: 'cafe.shape',
    lines: [
      ['cafe.shape', 'gives (rows, columns).'],
    ],
  },
  brief: {
    story: 'You want a first look at the café table.',
    get: [CAFE_TABLE],
    want: ['Keep the first 3 rows in `first`: change the 5 in the starter to 3'],
    out: '`first` is shown: the first 3 rows of cafe.',
  },
},
'ms-00': {
  explain: [
    "Most real data turns up messy, and this course is all about rescuing it with pandas.",
    "`survey` is a customer survey exported by someone else. Look closely and you'll spot the problems straight away.",
    "Even the column names are messy. `\"City \"` really does have a space on the end, so it has to be typed exactly.",
    "You'll fix names, text, numbers and dates, remove copies, pull values out of sentences, and check the result can be trusted.",
    "Then come files that fight back: odd layouts, junk around the table, and data nested inside data.",
  ],
  example: {
    say: "Here are the survey's column names, shown with their quotes so the hidden spaces show up.",
    code: 'for c in survey.columns:\n    print(repr(c))',
    lines: [
      ['survey.columns', 'the column names.'],
      ['repr(c)', 'shows each name with its quotes, spaces and all.'],
    ],
  },
  brief: {
    story: 'Before any cleaning, the team wants to see how people typed their city.',
    get: [['`survey`: a customer survey, never tidied. Its city column is called `"City "`, with a space on the end.']],
    want: ['Keep the first 10 cities in `cities`: change the 5 in the starter to 10'],
    out: '`cities` is shown: 10 cities, typed every which way.',
  },
},
'wr-00': {
  explain: [
    "Data usually lives in more than one table. Wrangling means joining tables together and reshaping them until they answer your question.",
    "`cafe` knows each day's city, while `cities` knows each city's country and population. Join them and you can ask about countries.",
    "You'll merge, stack, reshape wide tables into long ones and back again, and compare rows with their group.",
    "Then it's the online shop: orders, customers, products and lines, put together in pandas.",
    "First, meet the small `cities` table you'll be joining to.",
  ],
  example: {
    say: "Here's how many rows each table has, side by side.",
    code: 'print(len(cafe), "days in cafe")\nprint(len(cities), "rows in cities")',
    lines: [
      ['len(cafe)', 'counts the rows of cafe.'],
      ['len(cities)', 'counts the rows of cities.'],
    ],
  },
  brief: {
    story: 'Before joining anything, you want to see what the cities table holds.',
    get: [['`cities`: one row per city, with its `country` and `population_m` (millions).']],
    want: ['Keep all 4 rows in `some`: change the 2 in the starter to 4'],
    out: '`some` is shown: every city with its country.',
  },
},
'ts-00': {
  explain: [
    "A time series is data recorded over time, one reading after another, like daily sales.",
    "The café table has a row for every day from January to April 2024, so it's a time series already.",
    "In this course you'll pick out dates and months, add days up into weeks, smooth the bumps and compare each period with the one before.",
    "Then a whole year of weather shows a proper seasonal shape.",
    "Start simple: just look at the dates themselves.",
  ],
  example: {
    say: "Here are the first and last dates in the café table.",
    code: 'print(cafe["date"].min())\nprint(cafe["date"].max())',
    lines: [
      ['cafe["date"].min()', 'the earliest date.'],
      ['cafe["date"].max()', 'the latest date.'],
    ],
  },
  brief: {
    story: 'The manager wants to see a week of dates before any weekly report.',
    get: [CAFE_TABLE],
    want: ['Keep the first 7 dates in `days`: change the 3 in the starter to 7'],
    out: '`days` is shown: a whole week of dates.',
  },
},
'mp-00': {
  explain: [
    "matplotlib is Python's charting toolkit. Give it some numbers and it draws them.",
    "`plt.plot(...)` draws a line through the values, and `plt.show()` puts the chart on screen.",
    "A chart makes a pattern jump out that a table of numbers would hide.",
    "In this course you'll label charts properly, choose the right shape for each question, and build charts with several parts.",
    "Start with a quick line of cups sold, day by day.",
  ],
  example: {
    say: "Here's the price of a cup over the first ten days, as a line.",
    code: 'import matplotlib.pyplot as plt\n\nplt.plot(cafe["price"].head(10))\nplt.show()',
    lines: [
      ['plt.plot(...)', 'draws a line through the first 10 prices.'],
      ['plt.show()', 'puts the chart on screen.'],
    ],
  },
  brief: {
    story: 'The manager wants to see how busy the first few weeks were.',
    get: [CAFE_TABLE],
    want: ['Plot the cups for the first 20 days: change the 10 in the starter to 20'],
    out: 'A line chart with 20 points.',
  },
},
'sb-00': {
  explain: [
    "seaborn is a charting toolkit built on top of matplotlib, and it understands pandas tables.",
    "You give it the table with `data=` and name the columns, and it draws a tidy, labelled chart.",
    "A **histogram** shows how values are spread. It groups them into bars called **bins**, and taller bars mean more days.",
    "In this course you'll compare groups, colour charts by category, draw relationships and split charts into panels.",
    "More bins show more detail, so let's see what changes.",
  ],
  example: {
    say: "Here are the café's days counted by drink, as bars.",
    code: 'import seaborn as sns\n\nsns.set_theme()\nsns.countplot(data=cafe, x="drink")\nplt.show()',
    lines: [
      ['sns.countplot(...)', 'counts the rows for each drink and draws a bar each.'],
      ['data=cafe, x="drink"', 'the table, and the column to count.'],
    ],
  },
  brief: {
    story: 'The manager wants a clearer picture of how busy a typical day is.',
    get: [CAFE_TABLE],
    want: ['Draw the cups in 10 bins: change the 5 in the starter to 10'],
    out: 'A histogram with 10 bars.',
  },
},
'an-00': {
  explain: [
    "This course is one piece of analysis, start to finish: which drink should the café push, and where?",
    "Good analysis starts with a question you can actually answer, and a clear idea of what \"best\" means.",
    "Then you check the data, look for odd values, compare groups and test whether a pattern is real.",
    "Finally you draw one chart that answers the question, with the finding in its title.",
    "`groupby` is the workhorse: it splits the rows into groups and sums each one up.",
  ],
  example: {
    say: "Here are the cups sold in each city, added up.",
    code: 'cafe.groupby("city")["cups"].sum()',
    lines: [
      ['groupby("city")', 'one group per city.'],
      ['["cups"].sum()', 'adds up the cups in each group.'],
    ],
  },
  brief: {
    story: 'Head office asks which drink earns the most.',
    get: [CAFE_TABLE],
    want: ['Add up the revenue by drink: change "city" in the starter to "drink"'],
    out: '`by` is shown: one total per drink.',
  },
},
'st-00': {
  explain: [
    "Statistics is about how sure you can be. Is a difference real, or could it just be luck?",
    "It starts with describing data: what's typical, and how spread out it is.",
    "The **mean** adds everything up and divides. The **median** is the middle value, and a few huge values hardly move it.",
    "Then come chance, honest tests between groups, relationships between numbers, and the traps that catch people out.",
    "You'll see each idea with simulations as well as formulas, so it makes sense rather than just being memorised.",
  ],
  example: {
    say: "Here's the smallest and largest number of cups sold in a day.",
    code: 'print(cafe["cups"].min(), "to", cafe["cups"].max())',
    lines: [
      ['.min()', 'the smallest value.'],
      ['.max()', 'the largest value.'],
    ],
  },
  brief: {
    story: 'The manager asks what a typical day looks like, without one huge day skewing it.',
    get: [CAFE_TABLE],
    want: ['Work out the median cups a day: change mean in the starter to median'],
    out: '`typical` is shown: the middle number of cups.',
  },
},
'mt-00': {
  explain: [
    "A **metric** is a number with an exact definition, written down so everyone counts it the same way.",
    "This course measures an online shop the way real companies do: funnels, conversion, retention and lifetime value.",
    "Then come **A/B tests**, where two versions of something are compared fairly to see which really works better.",
    "`sessions` has one row per visit to the shop, and `purchased` is True when the visit ended in a sale.",
    "The average of a True/False column is the share that are True, so it's a quick conversion rate.",
  ],
  example: {
    say: "Here's how many visits there were, and how many bought something.",
    code: 'print(len(sessions), "visits")\nprint(int(sessions["purchased"].sum()), "purchases")',
    lines: [
      ['len(sessions)', 'counts the visits.'],
      ['sessions["purchased"].sum()', 'counts the Trues: the visits that bought.'],
    ],
  },
  brief: {
    story: 'The shop manager wants to know what share of visits end in a sale.',
    get: [['`sessions`: one row per visit, with `purchased` True when it ended in a sale.']],
    want: ['Show the share to 3 places: change the 1 in the starter to 3'],
    out: '`rate` is shown: a share between 0 and 1.',
  },
},
'fc-00': {
  explain: [
    "A **forecast** says what to expect next. Here, how many calls a contact centre will get, so the right number of people are on shift.",
    "`calls` holds two years of daily call counts, with a weekly rhythm and a slow trend.",
    "The course starts with simple baselines, because every clever model has to beat them.",
    "Then it looks at patterns, smoothing and proper models, and tests them all honestly on days they've never seen.",
    "First, a look at the most recent days.",
  ],
  example: {
    say: "Here's the first day in the data, and how many calls it had.",
    code: 'calls.head(1)',
    lines: [
      ['calls.head(1)', 'the first row: a date and its calls.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to see last week before planning next week.',
    get: [['`calls`: one row per day, with `date` and `calls`.']],
    want: ['Keep the last 7 days in `recent`: change the 3 in the starter to 7'],
    out: '`recent` is shown: the last week of calls.',
  },
},
'dx-00': {
  explain: [
    "**DAX** is the formula language of Power BI, Microsoft's tool for building reports and dashboards.",
    "A **measure** is a named formula: the name, an equals sign, then the formula, like `Lines = COUNTROWS(order_items)`.",
    "A measure doesn't store numbers. It works them out fresh for every cell it appears in.",
    "Here the answers appear in a **matrix**, with one row per product category, so the same measure gives a different answer on each row.",
    "This course builds measures, changes filters with CALCULATE, ranks, works across time, and covers what the PL-300 exam asks.",
  ],
  example: {
    say: "Here a measure adds up the quantity sold in each category.",
    code: 'Qty = SUM(order_items[qty])',
    lines: [
      ['Qty =', 'the measure\'s name.'],
      ['SUM(order_items[qty])', 'adds up the qty column for whatever each row shows.'],
    ],
  },
  brief: {
    story: 'The shop manager wants to see how many order lines each category has.',
    get: [['The shop\'s model: `products`, `order_items`, `orders` and `customers`, linked together. The matrix has one row per product category.']],
    want: ['Count the order lines: change products in the starter to order_items'],
    out: 'The matrix shows Lines for each category.',
  },
},
'pbi-00': {
  explain: [
    "A Power BI report sits on a **model**: tables linked together by the columns they share.",
    "Filters flow along those links, so picking a country can filter its customers, their orders and those orders' lines.",
    "This course adds calculated columns, uses the date table, and builds the patterns that come up again and again on a star schema.",
    "Here the matrix has one row per country, from the `cities` table, which links to the shop's customers.",
    "So a simple count of customers shows how many live in each country.",
  ],
  example: {
    say: "Here the orders are counted for each country.",
    code: 'Orders = COUNTROWS(orders)',
    lines: [
      ['COUNTROWS(orders)', 'counts the orders showing on each row, through the links from cities.'],
    ],
  },
  brief: {
    story: 'The marketing team wants to know where the shop\'s customers live.',
    get: [['The shop\'s model, with `cities` linked to `customers`. The matrix has one row per country.']],
    want: ['Count the customers: change orders in the starter to customers'],
    out: 'The matrix shows Customers for each country.',
  },
},
'pj-00': {
  explain: [
    "Each project is one real question, answered from start to finish with every tool you've learned.",
    "Where should the shop grow next? Does the weather change the café's sales? What does the survey really say? Who should the shop win back?",
    "You'll use pandas, SQL, Power BI and charts together, checking one against another the way real analysts do.",
    "Each project ends with a recommendation in plain words, the kind you could send to a manager.",
    "The online shop is the starting point: customers, orders, products and order lines.",
  ],
  example: {
    say: "Here's the size of each of the shop's four tables.",
    code: 'for name, t in [("customers", customers), ("orders", orders), ("products", products), ("order_items", order_items)]:\n    print(name, len(t))',
    lines: [
      ['for name, t in [...]', 'goes through the four tables one by one.'],
      ['print(name, len(t))', 'shows each table\'s name and how many rows it has.'],
    ],
  },
  brief: {
    story: 'Before the first project, the shop owner asks a simple question: how many customers do we have?',
    get: [['The shop\'s tables: `customers`, `orders`, `products` and `order_items`.']],
    want: ['Count the customers: change orders in the starter to customers'],
    out: '`people` is shown: how many customers there are.',
  },
},
'et-00': {
  explain: [
    "A **pipeline** moves data from where it starts to where it gets used, the same way every single time.",
    "ETL names its three stages: **extract** the raw data, **transform** it (tidy, check and convert), then **load** it into a database.",
    "This course follows one: every night the café tills send an export, and it has to land safely in the database the reports read.",
    "You'll check what arrived, set bad rows aside with a reason, make loads safe to rerun, keep a log and retry when things hiccup.",
    "First, get the stages in the right order.",
  ],
  example: {
    say: "Here each stage is printed with its number, in order.",
    code: 'for n, stage in enumerate(["extract", "transform", "load"], start=1):\n    print(n, stage)',
    lines: [
      ['enumerate(..., start=1)', 'numbers the stages from 1.'],
      ['print(n, stage)', 'shows each number with its stage.'],
    ],
  },
  brief: {
    story: 'A new colleague has written down the pipeline\'s stages, but missed one.',
    get: [['A starter with `steps = ["extract", "load"]`.']],
    want: ['Add "transform" between "extract" and "load"'],
    out: '`steps` is shown: extract, transform, load.',
  },
},
'al-00': {
  explain: [
    "An **algorithm** is just a step-by-step way to solve a problem, like a recipe.",
    "Some ways take far fewer steps than others. On big data, that's the difference between an instant answer and waiting all day.",
    "This course counts the work, then covers searching, sorting, handy data structures, recursion, graphs and making code faster.",
    "One idea comes up again and again: halving. Halve something over and over and it gets small surprisingly quickly.",
    "`//` divides and drops the remainder, so `8 // 2` is 4.",
  ],
  example: {
    say: "Here 100 is halved until it's down to 1, printing each step.",
    code: 'n = 100\nwhile n > 1:\n    n = n // 2\n    print(n)',
    lines: [
      ['while n > 1:', 'keeps going until n gets down to 1.'],
      ['n = n // 2', 'halves it, dropping any remainder.'],
    ],
  },
  brief: {
    story: 'You want to see how few halvings it takes to get a big number down to 1.',
    get: [['A starter that halves `n` until it reaches 1, counting the steps.']],
    want: ['Start from 1024 instead of 8'],
    out: 'It prints how many halvings it took.',
  },
},
'np-00': {
  explain: [
    "**NumPy** is Python's toolkit for working with lots of numbers at once. It's already loaded as `np`.",
    "Its building block is the **array**, which looks like a list but does maths on every value at once.",
    "A list times 2 repeats the list. An array times 2 doubles every number, with no loop needed.",
    "pandas and nearly every machine learning library are built on NumPy, so this course shows what's going on underneath them.",
    "You'll pick values out, work down and across tables of numbers, and replace loops with fast array maths.",
  ],
  example: {
    say: "Here three prices get 50p added, all at once.",
    code: 'prices = np.array([2.5, 3.0, 4.2])\nprices + 0.5',
    lines: [
      ['np.array([...])', 'makes an array of three prices.'],
      ['prices + 0.5', 'adds 0.5 to every one of them.'],
    ],
  },
  brief: {
    story: 'The café is pricing a triple-size cup.',
    get: [['A starter with three prices in an array.']],
    want: ['Triple every price: change the 2 in the starter to 3'],
    out: '`bigger` is shown: three prices, each three times as big.',
  },
},
'ai-00': {
  explain: [
    "**Machine learning** means a program works out a rule from examples, instead of you writing the rule yourself.",
    "The simplest model of all looks at a new case, finds the most similar example it's seen, and gives the same answer.",
    "That's the starter here: three example days, each with its cups and a label, and a guess for a new day.",
    "This course builds proper models, a neural network from scratch, models that read text, and one that learns by trial and error.",
    "You'll always test a model on examples it hasn't seen, because that's the only honest test.",
  ],
  example: {
    say: "Here the nearest example to 28 cups is found by its distance.",
    code: 'examples = [(10, "quiet"), (30, "steady"), (55, "busy")]\nfor cups, label in examples:\n    print(label, abs(cups - 28))',
    lines: [
      ['abs(cups - 28)', 'how far each example is from 28 cups.'],
      ['print(label, ...)', 'the smallest distance is the nearest example.'],
    ],
  },
  brief: {
    story: 'The café wants a tiny model that labels a day from its cups.',
    get: [['Three example days: 10 cups is quiet, 30 is steady and 55 is busy.']],
    want: ['Change the new day\'s cups from 50 to 12'],
    out: 'It prints the guess for 12 cups.',
  },
},
'ml-00': {
  explain: [
    "This course builds a machine learning model the way companies really do, step by step and honestly.",
    "The question is a classic one: which subscribers are about to leave? That's called **churn**.",
    "`churn` has one row per subscriber, and `churned` is 1 for the ones who left and 0 for those who stayed.",
    "You'll start with a lazy baseline, build a proper pipeline, choose the right scores, spot leaks and tune a model.",
    "First, find out how many left. If it's a small share, that matters for everything that follows.",
  ],
  example: {
    say: "Here are the subscribers counted by plan.",
    code: 'churn["plan"].value_counts()',
    lines: [
      ['churn["plan"]', 'the plan each subscriber is on.'],
      ['.value_counts()', 'how many are on each plan.'],
    ],
  },
  brief: {
    story: 'The subscriptions team asks what share of customers left.',
    get: [['`churn`: one row per subscriber, with `churned` 1 if they left.']],
    want: ['Show the share to 2 places: change the 0 in the starter to 2'],
    out: '`share_left` is shown: a share between 0 and 1.',
  },
},
'r-00': {
  explain: [
    "**R** is a language made especially for statistics and data analysis.",
    "This course asks the same questions as the pandas course, on the same café data, but in R with **dplyr**.",
    "`<-` stores something under a name, and `head(cafe, 5)` shows the first 5 rows of a table.",
    "You'll filter, sort, group and summarise, join tables, reshape them and rank rows within groups.",
    "If you've done pandas already, you'll find the ideas carry straight across. Only the spelling changes.",
  ],
  example: {
    say: "Here's the size of the café table: rows, then columns.",
    code: 'dim(cafe)',
    lines: [
      ['dim(cafe)', 'how many rows and how many columns.'],
    ],
  },
  brief: {
    story: 'You want a first look at the café table in R.',
    get: [['`cafe`: 120 days of sales at a café chain in three cities.']],
    want: ['Keep the first 3 rows in `first`: change the 5 in the starter to 3'],
    out: '`first` is shown: the first 3 rows of cafe.',
  },
},
};
