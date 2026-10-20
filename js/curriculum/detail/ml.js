/* Machine learning (ml-01 to ml-15): the fuller teaching, a worked example
   and the task as a brief (see detail/index.js). Examples use a handful of
   made-up values, so each idea is visible and the task's answer stays hidden. */

const CHURN = ['`churn` lists 800 subscribers: `tenure_months`, `monthly_spend`, `visits_last_month`, `support_tickets`, `plan`, `contract`, `city`, and `churned` (1 if they left). The starter splits it into training and test data.'];
const MODEL = ['The starter splits `churn` and fits `model`: a pipeline that scales the numbers, one-hots the words, and runs a logistic regression.'];
const DELIVERIES = ['`deliveries` lists 600 deliveries: `distance_km`, `items`, `hour`, `raining`, and `minutes` taken. The starter splits it into training and test data.'];
const CHURN_STORY = 'The café wants to spot subscribers about to leave, so it can step in first.';
const DELIVERY_STORY = 'The delivery team wants to tell customers how long their order will take.';

export const ML_DETAIL = {
'ml-01': {
  explain: [
    '`churn` lists 800 subscribers and whether they left: `churned` is 1 if they did.',
    'Start with a **baseline**: the score of a model that always guesses the most common answer.',
    '`DummyClassifier(strategy="most_frequent")` from `sklearn.dummy` does just that.',
    'Most customers stayed, so "nobody leaves" is right most of the time.',
    'A real model has to beat that, or it is no use at all.',
  ],
  example: {
    say: 'Here a lazy model learns from ten examples, eight of them 0.',
    code: `from sklearn.dummy import DummyClassifier
X = [[0]] * 10
y = [0] * 8 + [1] * 2
d = DummyClassifier(strategy="most_frequent").fit(X, y)
print(d.predict([[0], [0]]))
print(d.score(X, y))`,
    lines: [
      ['strategy="most_frequent"', 'always guess the answer seen most: 0.'],
      ['d.score(X, y)', '0.8: right 8 times in 10 without learning anything.'],
    ],
  },
  brief: {
    story: CHURN_STORY,
    get: [CHURN],
    want: ['Fit a `DummyClassifier` that always guesses the most common answer, on the training data', '`baseline`: its accuracy on the test data, rounded to 3'],
    out: 'One score: the bar to beat.',
  },
},
'ml-02': {
  explain: [
    'Models need numbers, and `plan` holds words: basic, plus, pro.',
    '**One-hot encoding** turns one column of words into one column per word, holding 1 or 0.',
    '`pd.get_dummies(df, columns=[...])` does it: `plan` becomes `plan_basic`, `plan_plus` and `plan_pro`.',
    'Never number the words 1, 2, 3 instead.',
    'The model would read pro as "three times basic", which means nothing.',
  ],
  example: {
    say: 'Here a size column is one-hot encoded.',
    code: `pd.get_dummies(pd.DataFrame({"size": ["small", "large", "small"], "cups": [1, 2, 3]}), columns=["size"])`,
    lines: [
      ['columns=["size"]', 'only size is encoded; cups is left as it is.'],
      ['size_large, size_small', 'one column per word, True on the rows that had it.'],
    ],
  },
  brief: {
    story: CHURN_STORY,
    get: [CHURN],
    want: ['`wide`: X_train with `plan`, `contract` and `city` one-hot encoded by get_dummies', '`n_columns`: how many columns it has'],
    out: 'A wider table, and a count.',
  },
},
'ml-03': {
  explain: [
    'A **pipeline** joins the preparation and the model into one thing. Fitting it fits every step, in order.',
    '`ColumnTransformer` sends each column to its own step: numbers to `StandardScaler`, words to `OneHotEncoder`.',
    'Each step is a tuple: a name, the tool, and the columns it handles.',
    'In one pipeline, the scaler only ever learns from the training data.',
    'Scaling everything before splitting lets facts about the test data leak in, and scores look better than real life will be.',
  ],
  example: {
    say: 'Here a tiny table has its number scaled and its word one-hot encoded, in one step.',
    code: `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
t = pd.DataFrame({"spend": [10.0, 20.0, 30.0], "plan": ["basic", "pro", "basic"]})
prep = ColumnTransformer([("num", StandardScaler(), ["spend"]), ("cat", OneHotEncoder(), ["plan"])])
prep.fit_transform(t)`,
    lines: [
      ['("num", StandardScaler(), ["spend"])', 'spend becomes about −1.22, 0 and 1.22.'],
      ['("cat", OneHotEncoder(), ["plan"])', 'plan becomes two columns of 1 and 0.'],
    ],
  },
  brief: {
    story: CHURN_STORY,
    get: [CHURN],
    want: ['`prep`: scale the number columns, one-hot the word columns', '`model`: a pipeline of prep and a LogisticRegression (max_iter=1000), fitted on the training data', '`accuracy`: its test accuracy, rounded to 3'],
    out: 'An accuracy above the baseline.',
  },
},
'ml-04': {
  explain: [
    'For leavers, two questions matter.',
    '**Precision**: of the customers flagged, how many really left?',
    '**Recall**: of the customers who left, how many were flagged?',
    '`precision_score(y_test, pred)` and `recall_score(y_test, pred)` from `sklearn.metrics` answer them. **F1** blends the two into one number.',
    'A model can be right most of the time and still miss many leavers. Accuracy alone would never tell you.',
  ],
  example: {
    say: 'Here three leavers and three stayers are flagged by a model.',
    code: `from sklearn.metrics import precision_score, recall_score
true = [1, 1, 1, 0, 0, 0]
pred = [1, 0, 0, 1, 0, 0]
print(precision_score(true, pred), round(recall_score(true, pred), 3))`,
    lines: [
      ['precision', 'two flagged, one really left: 0.5.'],
      ['recall', 'three left, one was flagged: about 0.333.'],
    ],
  },
  brief: {
    story: CHURN_STORY,
    get: [MODEL],
    want: ["`pred`: the model's predictions for the test data", '`precision`, `recall` and `f1`, each rounded to 3'],
    out: 'Three scores between 0 and 1.',
  },
},
'ml-05': {
  explain: [
    "`model.predict_proba(X_test)[:, 1]` gives each customer's chance of leaving, from 0 to 1.",
    '`predict` simply cuts it at 0.5.',
    'Cut lower, at 0.3, and more customers are flagged: you catch more leavers (recall up), but flag more who would have stayed (precision down).',
    '`(proba >= 0.3).astype(int)` makes the 1s and 0s for any cut.',
    'The right cut is a business choice: what a missed leaver costs, against what an unneeded discount costs.',
  ],
  example: {
    say: 'Here five chances are cut at 0.5, then at 0.3.',
    code: `proba = np.array([0.1, 0.35, 0.6, 0.25, 0.8])
print((proba >= 0.5).astype(int))
print((proba >= 0.3).astype(int))`,
    lines: [
      ['>= 0.5', 'two flagged.'],
      ['>= 0.3', 'three flagged: the 0.35 joins them.'],
    ],
  },
  brief: {
    story: 'Missing a leaver costs far more than an unneeded discount, so the café wants to flag more people.',
    get: [MODEL],
    want: ["`proba`: each test customer's chance of leaving", '`flag30`: 1 where proba is at least 0.3, otherwise 0', '`recall30` and `precision30`, rounded to 3'],
    out: 'Recall up, precision down, compared with the 0.5 cut.',
  },
},
'ml-06': {
  explain: [
    'Every threshold gives a different precision and recall. **ROC AUC** scores the model across all of them at once.',
    'It is the chance that a random leaver gets a higher score than a random stayer.',
    '0.5 is guessing, and 1.0 is perfect.',
    '`roc_auc_score(y_test, proba)` needs the probabilities, not the 0 or 1 predictions.',
    'It is a good way to compare models before anyone has picked a threshold.',
  ],
  example: {
    say: 'Here two stayers and two leavers get scores, and the AUC is worked out.',
    code: `from sklearn.metrics import roc_auc_score
roc_auc_score([0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8])`,
    lines: [
      ['the pairs', 'of the four leaver-stayer pairs, the leaver scores higher in three.'],
      ['the AUC', '3 out of 4: 0.75.'],
    ],
  },
  brief: {
    story: 'Before arguing about thresholds, the team wants one score for the model as a whole.',
    get: [MODEL, ['The starter also fits `dummy`, the lazy model.']],
    want: ["`auc`: the ROC AUC of the model's probabilities on the test data, rounded to 3", "`guessing`: the same for the dummy's probabilities"],
    out: 'Two scores; the dummy\'s is 0.5.',
  },
},
'ml-07': {
  explain: [
    'With about 3 stayers to every leaver, a model learns the stayers best, simply because there are more of them.',
    '`LogisticRegression(class_weight="balanced")` counts each leaver for more, in proportion.',
    'Then both groups weigh the same while it learns.',
    'Recall usually goes up and precision down.',
    'It is the same trade as moving the threshold, made during training.',
  ],
  example: {
    say: 'Here are the weights "balanced" gives three stayers and one leaver.',
    code: `from sklearn.utils.class_weight import compute_class_weight
compute_class_weight("balanced", classes=np.array([0, 1]), y=np.array([0, 0, 0, 1]))`,
    lines: [
      ['0 (stayers)', 'each counts about 0.67.'],
      ['1 (leaver)', 'counts 2: three times a stayer, so both groups weigh 2 in total.'],
    ],
  },
  brief: {
    story: 'The model hardly ever flags anyone. Make it take the leavers seriously.',
    get: [MODEL],
    want: ['`balanced`: the same pipeline, with `class_weight="balanced"` in the LogisticRegression', '`recall_bal` and `precision_bal` on the test data, rounded to 3'],
    out: 'Recall higher than before.',
  },
},
'ml-08': {
  explain: [
    'One test split can be lucky or unlucky.',
    '**Cross-validation** splits the data into 5 folds and tests on each one in turn.',
    '`StratifiedKFold(5, shuffle=True, random_state=0)` keeps the share of leavers the same in every fold.',
    '`cross_val_score(model, X, y, cv=folds, scoring="roc_auc")` returns the 5 scores.',
    'Report the mean and the spread: a big spread means the score depends on luck.',
  ],
  example: {
    say: 'Here ten examples, two of them 1, are split two ways, keeping a 1 in each test fold.',
    code: `from sklearn.model_selection import StratifiedKFold
y = np.array([0] * 8 + [1] * 2)
X = np.zeros((10, 1))
for train_rows, test_rows in StratifiedKFold(2, shuffle=True, random_state=0).split(X, y):
    print(y[test_rows])`,
    lines: [
      ['StratifiedKFold(2, ...)', 'two folds.'],
      ['y[test_rows]', 'each test fold gets one of the two 1s.'],
    ],
  },
  brief: {
    story: 'The board asks how much the model\'s score could change with a different split.',
    get: [MODEL, ['The starter makes `folds`.']],
    want: ['`scores`: the 5 fold AUCs for the pipeline, on all of X and y', '`mean_auc` and `spread`: their mean and standard deviation, rounded to 3'],
    out: 'Five scores, a mean and a spread.',
  },
},
'ml-09': {
  explain: [
    '**Target leakage** is a column that gives the answer away, often because it is only recorded after the event.',
    'Visits to a "cancel subscription" page happen as people leave.',
    "A leaky model scores almost perfectly in testing, then fails in real use, because when you predict, that column doesn't exist yet.",
    'Be suspicious of any score that looks too good.',
    'Ask of every column: would I know this before the moment I want to predict?',
  ],
  example: {
    say: 'Here a refund column turns out to match leaving exactly: too good to be true.',
    code: `t = pd.DataFrame({"left": [1, 0, 1, 0, 0, 1]})
t["refund_issued"] = t["left"]
round(t["left"].corr(t["refund_issued"]), 2)`,
    lines: [
      ['refund_issued', 'recorded when someone leaves: after the event.'],
      ['the correlation', '1.0: a perfect match, because it is the answer in disguise.'],
    ],
  },
  brief: {
    story: 'A new model scores almost perfectly. Find out why before anyone celebrates.',
    get: [['The starter makes `leaky` (churn plus a `cancel_page_visits` column) and `test_auc(numbers)`, which scores a model built on those number columns.']],
    want: ['`auc_with`: test_auc with the number columns plus "cancel_page_visits"', '`auc_without`: the number columns only', '`leak`: the name of the column to drop'],
    out: 'Two scores, and a column name.',
  },
},
'ml-10': {
  explain: [
    '**Permutation importance** shuffles one column at a time and measures how much the score drops.',
    'A column the model leans on hurts a lot when it is scrambled.',
    '`permutation_importance(model, X, y, n_repeats=10, random_state=0)` from `sklearn.inspection` works with any model, pipelines included.',
    '`.importances_mean` gives the average drop for each column.',
    'It works on the original columns, words and all, so the answer reads in plain terms.',
  ],
  example: {
    say: 'Here one column drives the answer and the other is noise; shuffling shows which is which.',
    code: `from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
X = pd.DataFrame({"matters": rng.normal(size=100), "noise": rng.normal(size=100)})
y = 3 * X["matters"] + rng.normal(0, 0.1, 100)
m = LinearRegression().fit(X, y)
r = permutation_importance(m, X, y, n_repeats=5, random_state=0)
pd.Series(r.importances_mean, index=X.columns).round(3)`,
    lines: [
      ['matters', 'shuffling it wrecks the score: a big drop.'],
      ['noise', 'shuffling it changes almost nothing.'],
    ],
  },
  brief: {
    story: 'The manager wants to know what the churn predictions actually rest on.',
    get: [MODEL],
    want: ["`importance`: each column's mean importance as a Series named by `X_test.columns`, biggest first", "`top`: the most important column's name"],
    out: 'A sorted Series and a name.',
  },
},
'ml-11': {
  explain: [
    'Predicting a number is **regression**.',
    'Baseline again: guess the training average for every case. A real model has to beat that.',
    '**MAE**, mean absolute error, is the average miss, in the same units: here, minutes.',
    '**R²** says how much of the variation the model explains: 0 is no better than the average, 1 is perfect.',
    'A regression model\'s `.score` gives R².',
  ],
  example: {
    say: 'Here three real values are guessed by a flat average, then by better guesses.',
    code: `from sklearn.metrics import mean_absolute_error
actual = [10, 20, 30]
print(round(mean_absolute_error(actual, [20, 20, 20]), 2))
print(round(mean_absolute_error(actual, [12, 19, 27]), 2))`,
    lines: [
      ['[20, 20, 20]', 'the average every time: misses of 10, 0 and 10, so MAE 6.67.'],
      ['[12, 19, 27]', 'misses of 2, 1 and 3: MAE 2.'],
    ],
  },
  brief: {
    story: DELIVERY_STORY,
    get: [DELIVERIES],
    want: ['`mae_guess`: the MAE of guessing the training average for every test delivery, rounded to 2', '`reg`: a fitted `LinearRegression`', '`mae_reg` (rounded to 2) and `r2` (its test `.score`, rounded to 3)'],
    out: 'Two MAEs and an R².',
  },
},
'ml-12': {
  explain: [
    '**RMSE**, root mean squared error, squares each miss before averaging, then takes the square root.',
    'Big misses count far more than small ones.',
    'If RMSE is much bigger than MAE, a few predictions are badly off. Worth a look.',
    'Use MAE when every minute of error costs the same.',
    'Use RMSE when one 30-minute miss is much worse than three 10-minute ones.',
  ],
  example: {
    say: 'Here two sets of guesses miss by 20 in total, one evenly and one all at once.',
    code: `from sklearn.metrics import mean_absolute_error, mean_squared_error
actual = np.array([10, 10, 10, 10])
for name, p in [("even", actual + 5), ("lumpy", actual + np.array([0, 0, 0, 20]))]:
    print(name, mean_absolute_error(actual, p), np.sqrt(mean_squared_error(actual, p)))`,
    lines: [
      ['even', 'misses of 5 each: MAE 5, RMSE 5.'],
      ['lumpy', 'one miss of 20: MAE still 5, but RMSE 10.'],
    ],
  },
  brief: {
    story: 'The delivery team wants to know whether a few estimates are badly off.',
    get: [DELIVERIES, ['The starter fits a linear regression and makes `pred`.']],
    want: ['`mae` and `rmse` on the test data, rounded to 2', '`ratio`: the unrounded rmse ÷ mae, rounded to 2'],
    out: 'Two errors and a ratio.',
  },
},
'ml-13': {
  explain: [
    'Real data comes with columns that mean nothing, and a model can still find patterns in them by chance. That is **overfitting**.',
    '**Lasso** regression charges a penalty for every coefficient it uses.',
    "So a column that doesn't earn its place gets exactly 0.",
    'Scale the columns first, so the penalty treats them equally: `make_pipeline(StandardScaler(), Lasso(alpha=0.3))`.',
    '`alpha` sets how strict the penalty is.',
  ],
  example: {
    say: 'Here Lasso keeps the column that matters and switches off the noise.',
    code: `from sklearn.linear_model import Lasso
rng = np.random.default_rng(0)
X = pd.DataFrame({"matters": rng.normal(size=100), "noise": rng.normal(size=100)})
y = 3 * X["matters"] + rng.normal(0, 0.1, 100)
pd.Series(Lasso(alpha=0.1).fit(X, y).coef_, index=X.columns).round(3)`,
    lines: [
      ['matters', 'a coefficient close to 3, a little shrunk by the penalty.'],
      ['noise', 'exactly 0: switched off.'],
    ],
  },
  brief: {
    story: 'Someone added 8 meaningless columns to the delivery data. See whether Lasso notices.',
    get: [['The starter makes `Xn`: the four real columns plus 8 columns of random noise, and splits it.']],
    want: ['`lasso`: a pipeline of StandardScaler and Lasso(alpha=0.3), fitted on the training data', '`coefs`: its coefficients as a Series named by the columns', '`zeroed`: how many of the noise columns got exactly 0'],
    out: 'A count close to 8.',
  },
},
'ml-14': {
  explain: [
    '**Gradient boosting** builds many small trees, each one fixing the mistakes of the ones before.',
    'It is the go-to model for tables of data.',
    "Trees cope with shapes a straight line can't, like rush hours at lunch and teatime.",
    '`HistGradientBoostingRegressor(random_state=0)` from `sklearn.ensemble` is fast, and good with almost no tuning.',
  ],
  example: {
    say: 'Here a U-shaped pattern defeats a straight line, and boosted trees follow it.',
    code: `from sklearn.linear_model import LinearRegression
from sklearn.ensemble import HistGradientBoostingRegressor
x = np.linspace(0, 10, 200).reshape(-1, 1)
y = (x.ravel() - 5) ** 2
print(round(LinearRegression().fit(x, y).score(x, y), 3))
print(round(HistGradientBoostingRegressor(random_state=0).fit(x, y).score(x, y), 3))`,
    lines: [
      ['the straight line', 'R² near 0: a line can\'t bend into a U.'],
      ['the boosted trees', 'R² near 1: they follow the curve.'],
    ],
  },
  brief: {
    story: 'Delivery times bump up at lunch and teatime. Try a model that can follow bumps.',
    get: [DELIVERIES, ['The starter fits a linear regression and sets `mae_reg`.']],
    want: ['`boost`: a HistGradientBoostingRegressor(random_state=0), fitted on the training data', '`mae_boost`, rounded to 2', "`better`: True if its MAE is lower than the linear regression's"],
    out: 'An MAE, and True or False.',
  },
},
'ml-15': {
  explain: [
    'Settings chosen before training, rather than learned from the data, are called **hyperparameters**.',
    '`GridSearchCV(model, grid, cv=5)` tries every combination in the grid, scoring each by cross-validation **on the training data only**.',
    'For regression, `scoring="neg_mean_absolute_error"` scores by MAE. It is negative so that bigger is still better.',
    'Then the test set is used once, at the very end, for the honest score.',
    'Tune against the test set and it stops being a fair test.',
  ],
  example: {
    say: 'Here three tree depths are tried on the U-shaped pattern, scored by MAE.',
    code: `from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeRegressor
x = np.linspace(0, 10, 200).reshape(-1, 1)
y = (x.ravel() - 5) ** 2
s = GridSearchCV(DecisionTreeRegressor(random_state=0), {"max_depth": [1, 2, 3]}, cv=3,
                 scoring="neg_mean_absolute_error").fit(x, y)
print(s.best_params_, round(-s.best_score_, 2))`,
    lines: [
      ['scoring="neg_mean_absolute_error"', 'MAE, made negative so the biggest score wins.'],
      ['-s.best_score_', 'turned back into a plain MAE.'],
    ],
  },
  brief: {
    story: 'The delivery team wants the best settings, and an honest final number.',
    get: [DELIVERIES, ['The starter makes `grid`: three depth settings by two learning rates.']],
    want: ['Search `grid` for a HistGradientBoostingRegressor(random_state=0), cv=5, scoring "neg_mean_absolute_error", on the training data', '`best`: its best_params_', "`mae_final`: the best model's MAE on the test data, rounded to 2"],
    out: 'A dict of settings, and an MAE.',
  },
},
};
