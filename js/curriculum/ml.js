/* Machine learning at work — the job-ready version of what the AI track
   explains from the inside: baselines, pipelines, the right scores,
   thresholds, leakage, honest validation, then regression, regularisation,
   boosting and tuning. `churn` for predicting who leaves, `deliveries` for
   predicting minutes. scikit-learn is fetched on the track's first run. */

const CHURN = `from sklearn.model_selection import train_test_split

num = ["tenure_months", "monthly_spend", "visits_last_month", "support_tickets"]
cat = ["plan", "contract", "city"]
X = churn[num + cat]
y = churn["churned"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)`;

const PIPE = `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression

prep = ColumnTransformer([("num", StandardScaler(), num), ("cat", OneHotEncoder(), cat)])
model = make_pipeline(prep, LogisticRegression(max_iter=1000)).fit(X_train, y_train)`;

const DELIV = `from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

Xd = deliveries[["distance_km", "items", "hour", "raining"]]
yd = deliveries["minutes"]
Xd_train, Xd_test, yd_train, yd_test = train_test_split(Xd, yd, test_size=0.25, random_state=0)`;

const REG = `reg = LinearRegression().fit(Xd_train, yd_train)
pred = reg.predict(Xd_test)`;

// The reference churn model, rebuilt inside checks.
const REF = `from sklearn.model_selection import train_test_split as _tts
from sklearn.compose import ColumnTransformer as _CT
from sklearn.preprocessing import StandardScaler as _SS, OneHotEncoder as _OH
from sklearn.pipeline import make_pipeline as _mp
from sklearn.linear_model import LogisticRegression as _LogR
_num = ["tenure_months", "monthly_spend", "visits_last_month", "support_tickets"]
_cat = ["plan", "contract", "city"]
_Xtr, _Xte, _ytr, _yte = _tts(churn[_num + _cat], churn["churned"], test_size=0.25, stratify=churn["churned"], random_state=0)
_prep = _CT([("num", _SS(), _num), ("cat", _OH(), _cat)])
_model = _mp(_prep, _LogR(max_iter=1000)).fit(_Xtr, _ytr)`;

const DREF = `from sklearn.model_selection import train_test_split as _tts
from sklearn.linear_model import LinearRegression as _LR
from sklearn.metrics import mean_absolute_error as _mae
_Xtr, _Xte, _ytr, _yte = _tts(deliveries[["distance_km", "items", "hour", "raining"]], deliveries["minutes"], test_size=0.25, random_state=0)
_p = _LR().fit(_Xtr, _ytr).predict(_Xte)`;

export const ML = [

/* ── A model you can trust ─────────────────────────────── */
{
  id: 'ml-01', mins: 4,
  title: 'Beat the lazy guess',
  concept: [
    '`churn` lists 800 subscribers and whether they left: `churned` is 1 if they did. The job is to predict who will leave, so the café can step in first.',
    'Start with a **baseline**: the score of a model that always guesses the most common answer. `DummyClassifier(strategy="most_frequent")` from `sklearn.dummy` does just that.',
    'Most customers stayed, so "nobody leaves" is right most of the time. A real model has to beat that, or it is no use at all.',
  ],
  starter: `${CHURN}
y.mean()`,
  task: 'Fit a `DummyClassifier` that always guesses the most common answer, on the training data. Set `baseline`: its accuracy on the test data, rounded to 3.',
  hint: '`from sklearn.dummy import DummyClassifier`, then `dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)` and `baseline = round(dummy.score(X_test, y_test), 3)`.',
  solution: `from sklearn.dummy import DummyClassifier

${CHURN}
dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
baseline = round(dummy.score(X_test, y_test), 3)

baseline`,
  check: `${REF}
assert abs(float(globals().get("baseline", -1)) - round(float(1 - _yte.mean()), 3)) < 1e-9, "baseline is the dummy's accuracy on the test data: the share who stayed. Fit it on the training data, score it on the test data."`,
},
{
  id: 'ml-02', mins: 3,
  title: 'Words into columns: one-hot',
  concept: [
    'Models need numbers, and `plan` holds words: basic, plus, pro.',
    '**One-hot encoding** turns one column of words into one column per word, holding 1 or 0: `plan_basic`, `plan_plus`, `plan_pro`. `pd.get_dummies(df, columns=[...])` does it.',
    'Never number the words 1, 2, 3 instead. The model would read pro as "three times basic", which means nothing.',
  ],
  starter: `${CHURN}
X_train.head()`,
  task: 'Make `wide`: X_train with `plan`, `contract` and `city` one-hot encoded by get_dummies. Then set `n_columns`: how many columns it has.',
  hint: '`wide = pd.get_dummies(X_train, columns=cat)` and `n_columns = wide.shape[1]`.',
  solution: `${CHURN}
wide = pd.get_dummies(X_train, columns=cat)
n_columns = wide.shape[1]

wide.head()`,
  check: `${REF}
_w = pd.get_dummies(_Xtr, columns=_cat)
assert isinstance(globals().get("wide"), pd.DataFrame) and wide.shape == _w.shape, "wide is X_train with plan, contract and city one-hot encoded: pd.get_dummies(X_train, columns=cat)."
assert int(n_columns) == _w.shape[1], "n_columns is how many columns wide has: wide.shape[1]."`,
},
{
  id: 'ml-03', mins: 5,
  title: 'One pipeline, no leaks',
  concept: [
    'A **pipeline** joins the preparation and the model into one thing: `make_pipeline(prep, LogisticRegression(max_iter=1000))`. Fitting it fits every step, in order.',
    '`ColumnTransformer` sends each column to its own step: numbers to `StandardScaler`, to put them on one scale, and words to `OneHotEncoder`.',
    'In one pipeline, the scaler only ever learns from the training data. Scaling everything before splitting lets facts about the test data leak in, and scores look better than real life will be.',
  ],
  starter: `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression

${CHURN}
X_train.shape`,
  task: 'Build `prep` (scale the number columns, one-hot the word columns), then `model`: a pipeline of prep and a LogisticRegression (max_iter=1000), fitted on the training data. Set `accuracy`: its test accuracy, rounded to 3.',
  hint: '`prep = ColumnTransformer([("num", StandardScaler(), num), ("cat", OneHotEncoder(), cat)])`, `model = make_pipeline(prep, LogisticRegression(max_iter=1000)).fit(X_train, y_train)`, then `model.score(X_test, y_test)`.',
  solution: `${CHURN}
${PIPE}
accuracy = round(model.score(X_test, y_test), 3)

accuracy`,
  check: `${REF}
assert hasattr(globals().get("model"), "predict_proba"), "Make model: a pipeline of prep and a LogisticRegression, fitted on the training data."
assert abs(float(accuracy) - round(_model.score(_Xte, _yte), 3)) < 1e-9, "accuracy is the pipeline's accuracy on the test data, rounded to 3. Scale the numbers, one-hot the words."`,
},
{
  id: 'ml-04', mins: 4,
  title: 'Accuracy hides the misses',
  concept: [
    'For leavers, two questions matter. **Precision**: of the customers flagged, how many really left? **Recall**: of the customers who left, how many were flagged?',
    '`precision_score(y_test, pred)` and `recall_score(y_test, pred)` from `sklearn.metrics` answer them. **F1** blends the two into one number.',
    'A model can be right 86% of the time and still miss about 4 in 10 leavers. Accuracy alone would never tell you.',
  ],
  starter: `from sklearn.metrics import precision_score, recall_score, f1_score

${CHURN}
${PIPE}
model.score(X_test, y_test)`,
  task: "Make `pred`: the model's predictions for the test data. Set `precision`, `recall` and `f1`, each rounded to 3.",
  hint: '`pred = model.predict(X_test)`, then `round(precision_score(y_test, pred), 3)` and the same with recall_score and f1_score.',
  solution: `from sklearn.metrics import precision_score, recall_score, f1_score

${CHURN}
${PIPE}
pred = model.predict(X_test)
precision = round(precision_score(y_test, pred), 3)
recall = round(recall_score(y_test, pred), 3)
f1 = round(f1_score(y_test, pred), 3)

precision, recall, f1`,
  check: `from sklearn.metrics import precision_score as _ps, recall_score as _rs, f1_score as _fs
${REF}
_pr = _model.predict(_Xte)
assert abs(float(globals().get("precision", -1)) - round(_ps(_yte, _pr), 3)) < 1e-9, "precision is precision_score(y_test, pred), rounded to 3."
assert abs(float(globals().get("recall", -1)) - round(_rs(_yte, _pr), 3)) < 1e-9, "recall is recall_score(y_test, pred), rounded to 3."
assert abs(float(globals().get("f1", -1)) - round(_fs(_yte, _pr), 3)) < 1e-9, "f1 is f1_score(y_test, pred), rounded to 3."`,
},
{
  id: 'ml-05', mins: 4,
  title: 'Choose the threshold',
  concept: [
    "`model.predict_proba(X_test)[:, 1]` gives each customer's chance of leaving, from 0 to 1. `predict` simply cuts it at 0.5.",
    'Cut lower, at 0.3, and more customers are flagged: you catch more leavers (recall up), but flag more who would have stayed (precision down).',
    'The right cut is a business choice: what a missed leaver costs, against what an unneeded discount costs.',
  ],
  starter: `from sklearn.metrics import precision_score, recall_score

${CHURN}
${PIPE}
model.predict_proba(X_test)[:5]`,
  task: "Make `proba` (each test customer's chance of leaving) and `flag30` (1 where proba is at least 0.3, otherwise 0). Set `recall30` and `precision30`, rounded to 3.",
  hint: '`proba = model.predict_proba(X_test)[:, 1]`, `flag30 = (proba >= 0.3).astype(int)`, then recall_score and precision_score on y_test and flag30.',
  solution: `from sklearn.metrics import precision_score, recall_score

${CHURN}
${PIPE}
proba = model.predict_proba(X_test)[:, 1]
flag30 = (proba >= 0.3).astype(int)
recall30 = round(recall_score(y_test, flag30), 3)
precision30 = round(precision_score(y_test, flag30), 3)

recall30, precision30`,
  check: `from sklearn.metrics import precision_score as _ps, recall_score as _rs
${REF}
_pb = _model.predict_proba(_Xte)[:, 1]
_f = (_pb >= 0.3).astype(int)
assert np.shape(globals().get("proba", [])) == (len(_Xte),) and np.allclose(proba, _pb), "proba is model.predict_proba(X_test)[:, 1]."
assert np.array_equal(np.asarray(flag30), _f), "flag30 is 1 where proba is at least 0.3."
assert abs(float(recall30) - round(_rs(_yte, _f), 3)) < 1e-9 and abs(float(precision30) - round(_ps(_yte, _f), 3)) < 1e-9, "recall30 and precision30 score flag30 against y_test, rounded to 3."`,
},

/* ── Measure it properly ───────────────────────────────── */
{
  id: 'ml-06', mins: 4,
  title: 'One score for every threshold',
  concept: [
    'Every threshold gives a different precision and recall. **ROC AUC** scores the model across all of them at once.',
    'It is the chance that a random leaver gets a higher score than a random stayer: 0.5 is guessing, 1.0 is perfect.',
    '`roc_auc_score(y_test, proba)` needs the probabilities, not the 0 or 1 predictions.',
  ],
  starter: `from sklearn.metrics import roc_auc_score
from sklearn.dummy import DummyClassifier

${CHURN}
${PIPE}
dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)`,
  task: "Set `auc`: the ROC AUC of the model's probabilities on the test data, rounded to 3. Then `guessing`: the same for the dummy's probabilities.",
  hint: '`auc = round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3)`, and the same with `dummy`.',
  solution: `from sklearn.metrics import roc_auc_score
from sklearn.dummy import DummyClassifier

${CHURN}
${PIPE}
dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
auc = round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3)
guessing = round(roc_auc_score(y_test, dummy.predict_proba(X_test)[:, 1]), 3)

auc, guessing`,
  check: `from sklearn.metrics import roc_auc_score as _auc
${REF}
assert abs(float(globals().get("auc", -1)) - round(_auc(_yte, _model.predict_proba(_Xte)[:, 1]), 3)) < 1e-9, "auc is roc_auc_score(y_test, the model's probabilities), rounded to 3."
assert abs(float(globals().get("guessing", -1)) - 0.5) < 1e-9, "guessing is the dummy's AUC: it gives everyone the same score, so it comes out 0.5."`,
},
{
  id: 'ml-07', mins: 4,
  title: 'When leavers are rare',
  concept: [
    'With about 3 stayers to every leaver, a model learns the stayers best, simply because there are more of them.',
    '`LogisticRegression(class_weight="balanced")` counts each leaver for more, in proportion, so both groups weigh the same while it learns.',
    'Recall usually goes up and precision down: the same trade as moving the threshold, made during training.',
  ],
  starter: `from sklearn.metrics import precision_score, recall_score

${CHURN}
${PIPE}
recall_score(y_test, model.predict(X_test))`,
  task: 'Fit `balanced`: the same pipeline, with `class_weight="balanced"` in the LogisticRegression. Set `recall_bal` and `precision_bal` on the test data, rounded to 3.',
  hint: '`balanced = make_pipeline(prep, LogisticRegression(max_iter=1000, class_weight="balanced")).fit(X_train, y_train)`, then score its predictions.',
  solution: `from sklearn.metrics import precision_score, recall_score

${CHURN}
${PIPE}
balanced = make_pipeline(prep, LogisticRegression(max_iter=1000, class_weight="balanced")).fit(X_train, y_train)
pred_bal = balanced.predict(X_test)
recall_bal = round(recall_score(y_test, pred_bal), 3)
precision_bal = round(precision_score(y_test, pred_bal), 3)

recall_bal, precision_bal`,
  check: `from sklearn.metrics import precision_score as _ps, recall_score as _rs
${REF}
_b = _mp(_prep, _LogR(max_iter=1000, class_weight="balanced")).fit(_Xtr, _ytr).predict(_Xte)
assert abs(float(globals().get("recall_bal", -1)) - round(_rs(_yte, _b), 3)) < 1e-9, "recall_bal is the balanced model's recall on the test data. Use class_weight='balanced'."
assert abs(float(globals().get("precision_bal", -1)) - round(_ps(_yte, _b), 3)) < 1e-9, "precision_bal is the balanced model's precision on the test data."`,
},
{
  id: 'ml-08', mins: 4,
  title: 'Five tests, not one',
  concept: [
    'One test split can be lucky or unlucky. **Cross-validation** splits the data into 5 folds and tests on each one in turn.',
    '`StratifiedKFold(5, shuffle=True, random_state=0)` keeps the share of leavers the same in every fold, which matters most when one group is small.',
    '`cross_val_score(model, X, y, cv=folds, scoring="roc_auc")` returns the 5 scores. Report the mean and the spread: a big spread means the score depends on luck.',
  ],
  starter: `from sklearn.model_selection import cross_val_score, StratifiedKFold

${CHURN}
${PIPE}
folds = StratifiedKFold(5, shuffle=True, random_state=0)`,
  task: 'Set `scores`: the 5 fold AUCs for the pipeline, on all of X and y. Then set `mean_auc` and `spread` (their mean and standard deviation), rounded to 3.',
  hint: '`scores = cross_val_score(model, X, y, cv=folds, scoring="roc_auc")`, then `round(scores.mean(), 3)` and `round(scores.std(), 3)`.',
  solution: `from sklearn.model_selection import cross_val_score, StratifiedKFold

${CHURN}
${PIPE}
folds = StratifiedKFold(5, shuffle=True, random_state=0)
scores = cross_val_score(model, X, y, cv=folds, scoring="roc_auc")
mean_auc = round(scores.mean(), 3)
spread = round(scores.std(), 3)

scores.round(3), mean_auc, spread`,
  check: `from sklearn.model_selection import cross_val_score as _cvs, StratifiedKFold as _SKF
${REF}
_s = _cvs(_model, churn[_num + _cat], churn["churned"], cv=_SKF(5, shuffle=True, random_state=0), scoring="roc_auc")
assert np.shape(globals().get("scores", [])) == (5,) and np.allclose(scores, _s), "scores is cross_val_score(model, X, y, cv=folds, scoring='roc_auc'): five AUCs."
assert abs(float(mean_auc) - round(_s.mean(), 3)) < 1e-9 and abs(float(spread) - round(_s.std(), 3)) < 1e-9, "mean_auc and spread are the scores' mean and standard deviation, rounded to 3."`,
},
{
  id: 'ml-09', mins: 5,
  title: 'A leak that looks like genius',
  concept: [
    '**Target leakage** is a column that gives the answer away, often because it is only recorded after the event. Visits to a "cancel subscription" page happen as people leave.',
    'A leaky model scores almost perfectly in testing, then fails in real use, because at the moment you predict, that column does not exist yet.',
    'Be suspicious of any score that looks too good. Ask of every column: would I know this before the moment I want to predict?',
  ],
  starter: `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

num = ["tenure_months", "monthly_spend", "visits_last_month", "support_tickets"]
cat = ["plan", "contract", "city"]
rng = np.random.default_rng(5)
leaky = churn.assign(cancel_page_visits=churn["churned"] * rng.integers(1, 4, len(churn)) + (rng.random(len(churn)) < .05))

def test_auc(numbers):
    X = leaky[numbers + cat]
    X_train, X_test, y_train, y_test = train_test_split(X, leaky["churned"], test_size=0.25,
                                                        stratify=leaky["churned"], random_state=0)
    prep = ColumnTransformer([("num", StandardScaler(), numbers), ("cat", OneHotEncoder(), cat)])
    model = make_pipeline(prep, LogisticRegression(max_iter=1000)).fit(X_train, y_train)
    return round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3)

leaky.head()`,
  task: 'Set `auc_with`: test_auc with the number columns plus "cancel_page_visits", and `auc_without`: the number columns only. Then set `leak`: the name of the column to drop.',
  hint: '`auc_with = test_auc(num + ["cancel_page_visits"])`, `auc_without = test_auc(num)`, and `leak = "cancel_page_visits"`.',
  solution: `from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

num = ["tenure_months", "monthly_spend", "visits_last_month", "support_tickets"]
cat = ["plan", "contract", "city"]
rng = np.random.default_rng(5)
leaky = churn.assign(cancel_page_visits=churn["churned"] * rng.integers(1, 4, len(churn)) + (rng.random(len(churn)) < .05))

def test_auc(numbers):
    X = leaky[numbers + cat]
    X_train, X_test, y_train, y_test = train_test_split(X, leaky["churned"], test_size=0.25,
                                                        stratify=leaky["churned"], random_state=0)
    prep = ColumnTransformer([("num", StandardScaler(), numbers), ("cat", OneHotEncoder(), cat)])
    model = make_pipeline(prep, LogisticRegression(max_iter=1000)).fit(X_train, y_train)
    return round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3)

auc_with = test_auc(num + ["cancel_page_visits"])
auc_without = test_auc(num)
leak = "cancel_page_visits"

auc_with, auc_without`,
  check: `assert abs(float(globals().get("auc_with", -1)) - float(test_auc(num + ["cancel_page_visits"]))) < 1e-9, "auc_with is test_auc(num + ['cancel_page_visits'])."
assert abs(float(globals().get("auc_without", -1)) - float(test_auc(num))) < 1e-9, "auc_without is test_auc(num): the number columns only."
assert globals().get("leak") == "cancel_page_visits", "leak is the column that gives the answer away: cancel_page_visits only happens as people leave."`,
},
{
  id: 'ml-10', mins: 4,
  title: 'What did it rely on?',
  concept: [
    '**Permutation importance** shuffles one column at a time and measures how much the score drops. A column the model leans on hurts a lot when it is scrambled.',
    '`permutation_importance(model, X_test, y_test, scoring="roc_auc", n_repeats=10, random_state=0)` from `sklearn.inspection` works with any model, pipelines included.',
    'It works on the original columns, words and all, so the answer reads in plain terms: which facts about a customer the predictions rest on.',
  ],
  starter: `from sklearn.inspection import permutation_importance

${CHURN}
${PIPE}
X_test.columns`,
  task: "Make `importance`: each column's mean importance (`.importances_mean`) as a Series named by `X_test.columns`, biggest first. Then set `top`: the most important column's name.",
  hint: '`r = permutation_importance(model, X_test, y_test, scoring="roc_auc", n_repeats=10, random_state=0)`, then `pd.Series(r.importances_mean, index=X_test.columns).sort_values(ascending=False)`.',
  solution: `from sklearn.inspection import permutation_importance

${CHURN}
${PIPE}
r = permutation_importance(model, X_test, y_test, scoring="roc_auc", n_repeats=10, random_state=0)
importance = pd.Series(r.importances_mean, index=X_test.columns).sort_values(ascending=False)
top = importance.index[0]

importance.round(3)`,
  check: `from sklearn.inspection import permutation_importance as _pi
${REF}
_r = pd.Series(_pi(_model, _Xte, _yte, scoring="roc_auc", n_repeats=10, random_state=0).importances_mean, index=_Xte.columns).sort_values(ascending=False)
assert isinstance(globals().get("importance"), pd.Series) and list(importance.index) == list(_r.index), "importance has one value per column of X_test, biggest first."
assert np.allclose(importance.astype(float), _r.astype(float)), "Use permutation_importance(model, X_test, y_test, scoring='roc_auc', n_repeats=10, random_state=0)."
assert globals().get("top") == _r.index[0], "top is the first column of importance."`,
},

/* ── Predicting numbers ────────────────────────────────── */
{
  id: 'ml-11', mins: 4,
  title: 'Predict a number',
  concept: [
    'Predicting a number is **regression**. `deliveries` has each delivery\'s distance, items, hour and rain, and how many minutes it took.',
    'Baseline again: guess the training average for every delivery. A real model has to beat that.',
    '**MAE** is the average miss, in minutes. **R²** says how much of the variation the model explains: 0 is no better than the average, 1 is perfect.',
  ],
  starter: `${DELIV}
yd_train.mean()`,
  task: 'Set `mae_guess`: the MAE of guessing the training average for every test delivery, rounded to 2. Fit a `LinearRegression` as `reg`, then set `mae_reg` (rounded to 2) and `r2` (its `.score` on the test data, rounded to 3).',
  hint: '`mae_guess = round(mean_absolute_error(yd_test, np.full(len(yd_test), yd_train.mean())), 2)`. Then `reg = LinearRegression().fit(Xd_train, yd_train)`, `mean_absolute_error(yd_test, reg.predict(Xd_test))` and `reg.score(Xd_test, yd_test)`.',
  solution: `${DELIV}
mae_guess = round(mean_absolute_error(yd_test, np.full(len(yd_test), yd_train.mean())), 2)
${REG}
mae_reg = round(mean_absolute_error(yd_test, pred), 2)
r2 = round(reg.score(Xd_test, yd_test), 3)

mae_guess, mae_reg, r2`,
  check: `${DREF}
from sklearn.metrics import r2_score as _r2
assert abs(float(globals().get("mae_guess", -1)) - round(_mae(_yte, np.full(len(_yte), _ytr.mean())), 2)) < 1e-9, "mae_guess is the MAE of the training average used for every test delivery, rounded to 2."
assert abs(float(globals().get("mae_reg", -1)) - round(_mae(_yte, _p), 2)) < 1e-9, "mae_reg is the linear regression's MAE on the test data, rounded to 2."
assert abs(float(globals().get("r2", -1)) - round(_r2(_yte, _p), 3)) < 1e-9, "r2 is reg.score(Xd_test, yd_test), rounded to 3."`,
},
{
  id: 'ml-12', mins: 3,
  title: 'Big misses count more: RMSE',
  concept: [
    '**RMSE**, root mean squared error, squares each miss before averaging, then takes the square root. Big misses count far more than small ones.',
    'If RMSE is much bigger than MAE, a few predictions are badly off. Worth a look: a missing column, or odd data.',
    'Use MAE when every minute of error costs the same; RMSE when one 30-minute miss is much worse than three 10-minute ones.',
  ],
  starter: `from sklearn.metrics import mean_squared_error

${DELIV}
${REG}
pred[:5]`,
  task: 'Set `mae` and `rmse` for the linear regression on the test data, rounded to 2. Then set `ratio`: the unrounded rmse ÷ mae, rounded to 2.',
  hint: '`m = mean_absolute_error(yd_test, pred)`, `r = mean_squared_error(yd_test, pred) ** 0.5`, then round each, and `round(r / m, 2)`.',
  solution: `from sklearn.metrics import mean_squared_error

${DELIV}
${REG}
m = mean_absolute_error(yd_test, pred)
r = mean_squared_error(yd_test, pred) ** 0.5
mae, rmse, ratio = round(m, 2), round(r, 2), round(r / m, 2)

mae, rmse, ratio`,
  check: `from sklearn.metrics import mean_squared_error as _mse
${DREF}
_m, _r = _mae(_yte, _p), _mse(_yte, _p) ** 0.5
assert abs(float(globals().get("mae", -1)) - round(_m, 2)) < 1e-9, "mae is mean_absolute_error(yd_test, pred), rounded to 2."
assert abs(float(globals().get("rmse", -1)) - round(_r, 2)) < 1e-9, "rmse is the square root of mean_squared_error(yd_test, pred), rounded to 2."
assert abs(float(globals().get("ratio", -1)) - round(_r / _m, 2)) < 1e-9, "ratio is the unrounded rmse ÷ mae, rounded to 2."`,
},
{
  id: 'ml-13', mins: 5,
  title: 'Switch off the noise: Lasso',
  concept: [
    'Real data comes with columns that mean nothing, and a model can still find patterns in them by chance. That is **overfitting**.',
    '**Lasso** regression charges a penalty for every coefficient it uses, so a column that does not earn its place gets exactly 0. Scale the columns first: `make_pipeline(StandardScaler(), Lasso(alpha=0.3))`.',
    'Here, 8 columns of pure random noise sit beside the real ones. Lasso should switch nearly all of them off.',
  ],
  starter: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import Lasso

rng = np.random.default_rng(7)
noise = pd.DataFrame(rng.normal(size=(len(deliveries), 8)), columns=["noise_%d" % i for i in range(8)])
Xn = pd.concat([deliveries[["distance_km", "items", "hour", "raining"]], noise], axis=1)
Xn_train, Xn_test, yn_train, yn_test = train_test_split(Xn, deliveries["minutes"], test_size=0.25, random_state=0)
Xn.head()`,
  task: 'Fit `lasso`: a pipeline of StandardScaler and Lasso(alpha=0.3), on the training data. Make `coefs`: its coefficients as a Series named by the columns. Set `zeroed`: how many of the noise columns got exactly 0.',
  hint: '`lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.3)).fit(Xn_train, yn_train)`, `coefs = pd.Series(lasso[-1].coef_, index=Xn.columns)`, then count the zeros among the columns starting "noise".',
  solution: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import Lasso

rng = np.random.default_rng(7)
noise = pd.DataFrame(rng.normal(size=(len(deliveries), 8)), columns=["noise_%d" % i for i in range(8)])
Xn = pd.concat([deliveries[["distance_km", "items", "hour", "raining"]], noise], axis=1)
Xn_train, Xn_test, yn_train, yn_test = train_test_split(Xn, deliveries["minutes"], test_size=0.25, random_state=0)
lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.3)).fit(Xn_train, yn_train)
coefs = pd.Series(lasso[-1].coef_, index=Xn.columns)
zeroed = int((coefs[coefs.index.str.startswith("noise")] == 0).sum())

coefs.round(2), zeroed`,
  check: `from sklearn.preprocessing import StandardScaler as _SS
from sklearn.pipeline import make_pipeline as _mp
from sklearn.linear_model import Lasso as _Lasso
_l = _mp(_SS(), _Lasso(alpha=0.3)).fit(Xn_train, yn_train)
_c = pd.Series(_l[-1].coef_, index=Xn.columns)
assert isinstance(globals().get("coefs"), pd.Series) and list(coefs.index) == list(Xn.columns) and np.allclose(coefs, _c), "coefs is the Lasso's coefficients, named by the columns: pd.Series(lasso[-1].coef_, index=Xn.columns)."
assert int(globals().get("zeroed", -1)) == int((_c[_c.index.str.startswith("noise")] == 0).sum()), "zeroed counts the noise columns whose coefficient is exactly 0."`,
},
{
  id: 'ml-14', mins: 4,
  title: 'Boosted trees',
  concept: [
    '**Gradient boosting** builds many small trees, each one fixing the mistakes of the ones before. It is the go-to model for tables of data.',
    'Trees cope with shapes a straight line cannot, like rush hours at lunch and teatime, when `hour` matters in bumps rather than steadily.',
    '`HistGradientBoostingRegressor(random_state=0)` from `sklearn.ensemble` is fast, and good with almost no tuning.',
  ],
  starter: `from sklearn.ensemble import HistGradientBoostingRegressor

${DELIV}
${REG}
mae_reg = mean_absolute_error(yd_test, pred)
round(mae_reg, 2)`,
  task: 'Fit `boost`: a HistGradientBoostingRegressor(random_state=0), on the training data. Set `mae_boost`, rounded to 2, then `better`: True if its MAE is lower than the linear regression\'s.',
  hint: '`boost = HistGradientBoostingRegressor(random_state=0).fit(Xd_train, yd_train)`, then `mean_absolute_error(yd_test, boost.predict(Xd_test))`, and compare with mae_reg.',
  solution: `from sklearn.ensemble import HistGradientBoostingRegressor

${DELIV}
${REG}
mae_reg = mean_absolute_error(yd_test, pred)
boost = HistGradientBoostingRegressor(random_state=0).fit(Xd_train, yd_train)
m = mean_absolute_error(yd_test, boost.predict(Xd_test))
mae_boost = round(m, 2)
better = bool(m < mae_reg)

mae_boost, better`,
  check: `from sklearn.ensemble import HistGradientBoostingRegressor as _HGB
${DREF}
_m = _mae(_yte, _HGB(random_state=0).fit(_Xtr, _ytr).predict(_Xte))
assert abs(float(globals().get("mae_boost", -1)) - round(_m, 2)) < 1e-9, "mae_boost is the boosted model's MAE on the test data, rounded to 2. Use random_state=0."
assert globals().get("better") == bool(_m < _mae(_yte, _p)), "better is True when the boosted model's MAE is lower than the linear regression's."`,
},
{
  id: 'ml-15', mins: 5,
  title: 'Tune on training, test once',
  concept: [
    '`GridSearchCV(model, grid, cv=5)` tries every combination of settings in the grid, scoring each by cross-validation **on the training data only**.',
    'Then the test set is used once, at the very end, for the honest score. Tune against the test set and it stops being a fair test.',
    'Settings chosen before training, rather than learned from the data, are called **hyperparameters**.',
  ],
  starter: `from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import HistGradientBoostingRegressor

${DELIV}
grid = {"max_depth": [2, 3, None], "learning_rate": [0.05, 0.1]}`,
  task: 'Search `grid` for a HistGradientBoostingRegressor(random_state=0) with cv=5 and scoring "neg_mean_absolute_error", on the training data. Set `best` (its best_params_) and `mae_final`: the best model\'s MAE on the test data, rounded to 2.',
  hint: '`search = GridSearchCV(HistGradientBoostingRegressor(random_state=0), grid, cv=5, scoring="neg_mean_absolute_error").fit(Xd_train, yd_train)`, then `search.best_params_` and `mean_absolute_error(yd_test, search.predict(Xd_test))`.',
  solution: `from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import HistGradientBoostingRegressor

${DELIV}
grid = {"max_depth": [2, 3, None], "learning_rate": [0.05, 0.1]}
search = GridSearchCV(HistGradientBoostingRegressor(random_state=0), grid, cv=5,
                      scoring="neg_mean_absolute_error").fit(Xd_train, yd_train)
best = search.best_params_
mae_final = round(mean_absolute_error(yd_test, search.predict(Xd_test)), 2)

best, mae_final`,
  check: `from sklearn.model_selection import GridSearchCV as _GS
from sklearn.ensemble import HistGradientBoostingRegressor as _HGB
${DREF}
_s = _GS(_HGB(random_state=0), {"max_depth": [2, 3, None], "learning_rate": [0.05, 0.1]}, cv=5, scoring="neg_mean_absolute_error").fit(_Xtr, _ytr)
assert globals().get("best") == _s.best_params_, "best is search.best_params_, from a search on the training data only."
assert abs(float(globals().get("mae_final", -1)) - round(_mae(_yte, _s.predict(_Xte)), 2)) < 1e-9, "mae_final is the best model's MAE on the test data, rounded to 2."`,
},
];
