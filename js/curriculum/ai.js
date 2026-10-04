/* AI with Python — models that learn from examples, neural networks built
   from nothing, pictures, text and trial and error.

   The topic order follows Perry Xiao's "Artificial Intelligence Programming
   with Python: From Zero to Hero" (Wiley, 2022), chapters 3, 4, 5, 7 and 10,
   as a syllabus. Every lesson, example and exercise here is original. The
   book's deep-learning frameworks (TensorFlow, OpenCV, YOLO and the like)
   can't run in the browser, so networks are built by hand in numpy, or with
   scikit-learn's own. scikit-learn's classic datasets (iris flowers, wines,
   handwritten digits) come inside it; the reviews are in the prelude.

   The fourth part, "Better models" (ai-16 to ai-20), follows the
   learning-from-data chapters of "Python for Data Science For Dummies"
   (3rd ed.) as a syllabus: overfitting, probabilities, ensembles, feature
   importance and grid search. Also original throughout.

   Lessons that use scikit-learn declare `needs`, so it downloads on their
   first run. Everything is seeded (random_state, default_rng), so every
   check works its answer out from the same data the learner sees. */

const SK = ['scikit-learn'];

export const AI = [

/* ── How machines learn ────────────────────────────────── */
{
  id: 'ai-01', mins: 4, needs: SK,
  title: 'Learning from examples',
  concept: [
    '**Machine learning** means a program works out a rule from examples, instead of you writing the rule. The program that learns is called a **model**.',
    'Each example has **features** (what you measure: the size of a flower\'s petals) and a **label** (the answer: which kind of iris it is). By habit, the features are called `X` and the labels `y`.',
    'Keep some examples back as a **test**. Train the model on the rest with `.fit()`, then `.score()` it on the test ones: the share it gets right.',
  ],
  starter: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

iris = load_iris(as_frame=True)
X = iris.data           # 150 flowers, 4 measurements each
y = iris.target         # which kind of iris: 0, 1 or 2

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
print(len(X_train), "to learn from,", len(X_test), "to test on")
X.head()`,
  task: 'Make `model`, a `KNeighborsClassifier()`, and train it on the training examples. Then set `accuracy` to its score on the test ones. (It guesses a new flower by finding the 5 most like it that it has seen, and going with their most common kind.)',
  hint: '`model = KNeighborsClassifier().fit(X_train, y_train)`, then `accuracy = model.score(X_test, y_test)`.',
  solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

iris = load_iris(as_frame=True)
X = iris.data
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = KNeighborsClassifier().fit(X_train, y_train)
accuracy = model.score(X_test, y_test)
print("right on", round(accuracy * 100), "out of every 100 flowers it had never seen")`,
  check: `assert "model" in globals(), "Make a model: model = KNeighborsClassifier().fit(X_train, y_train)"
assert hasattr(model, "classes_"), "Train it first, with .fit(X_train, y_train)."
assert model.n_samples_fit_ == len(X_train), "Train on the training examples only, X_train and y_train, so the test is fair."
assert "accuracy" in globals(), "Set accuracy to model.score(X_test, y_test)."
assert abs(float(accuracy) - model.score(X_test, y_test)) < 1e-9, "accuracy should be the score on the test examples: model.score(X_test, y_test)."`,
},
{
  id: 'ai-02', mins: 4, needs: SK,
  title: 'A model you can read',
  concept: [
    'A **decision tree** learns a chain of yes-or-no questions, like "is the petal narrower than 0.75 cm?", then another, until it reaches an answer.',
    '`max_depth` caps how many questions deep it can go. Too few, and it can\'t tell the flowers apart. Too many, and it learns the training examples by heart, quirks and all.',
    '`plot_tree` draws what it learned, like a flowchart. Each box shows its question, how many training flowers reached it (samples), how many of each kind (value), and the kind most of them are (class).',
  ],
  starter: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree

iris = load_iris(as_frame=True)
names = ["sepal length", "sepal width", "petal length", "petal width"]    # short, to fit the boxes
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X_train, y_train)
print("one question deep:", tree.score(X_test, y_test))`,
  task: 'Let the tree go up to **3** questions deep, set `tree_acc` to its test score, and draw it with `plot_tree`.',
  hint: '`max_depth=3`. Then `tree_acc = tree.score(X_test, y_test)`, and `plot_tree(tree, feature_names=names, class_names=iris.target_names, filled=True)` before `plt.show()`.',
  solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree

iris = load_iris(as_frame=True)
names = ["sepal length", "sepal width", "petal length", "petal width"]
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
tree_acc = tree.score(X_test, y_test)
print("three questions deep:", round(tree_acc, 3))

plt.figure(figsize=(7, 4.6))
plot_tree(tree, feature_names=names, class_names=iris.target_names, filled=True, impurity=False, fontsize=8)
plt.show()`,
  check: `assert "tree" in globals() and hasattr(tree, "tree_"), "Keep the trained tree in a variable called tree."
assert tree.get_depth() == 3, "Let it go 3 questions deep, with max_depth=3. This one goes %d." % tree.get_depth()
assert "tree_acc" in globals(), "Set tree_acc to the tree's score on the test flowers."
assert abs(float(tree_acc) - tree.score(X_test, y_test)) < 1e-9, "tree_acc is tree.score(X_test, y_test)."
assert _axes(), "Draw it too: plot_tree(tree, ...), then plt.show()."`,
},
{
  id: 'ai-03', mins: 4, needs: SK,
  title: 'Same scale, fairer neighbours',
  concept: [
    'A nearest-neighbour model judges how alike two examples are by how far apart their numbers are. If one feature runs into the thousands and another stays below 5, the big one drowns out the rest.',
    '`StandardScaler` puts every feature on the same scale: 0 means average, and 1 means a typical distance from it.',
    '`make_pipeline(StandardScaler(), KNeighborsClassifier())` joins the two steps into one model, so new examples get scaled the same way before it guesses.',
  ],
  starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True, as_frame=True)     # 178 wines, 13 measurements, 3 growers
print(X[["proline", "hue"]].describe().loc[["min", "max"]])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
plain = KNeighborsClassifier().fit(X_train, y_train)
print("without scaling:", round(plain.score(X_test, y_test), 3))`,
  task: 'Make `scaled`: a pipeline of `StandardScaler()` then `KNeighborsClassifier()`, trained on the same examples. Set `scaled_acc` to its test score, and compare the two.',
  hint: '`scaled = make_pipeline(StandardScaler(), KNeighborsClassifier()).fit(X_train, y_train)`, then `scaled_acc = scaled.score(X_test, y_test)`.',
  solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

plain = KNeighborsClassifier().fit(X_train, y_train)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier()).fit(X_train, y_train)
scaled_acc = scaled.score(X_test, y_test)

print("without scaling:", round(plain.score(X_test, y_test), 3))
print("with scaling:   ", round(scaled_acc, 3))`,
  check: `assert "scaled" in globals() and hasattr(scaled, "steps"), "Make a pipeline called scaled: make_pipeline(StandardScaler(), KNeighborsClassifier())."
assert type(scaled.steps[0][1]).__name__ == "StandardScaler", "Put StandardScaler() first in the pipeline."
assert hasattr(scaled.steps[-1][1], "classes_"), "Train it: .fit(X_train, y_train)."
assert "scaled_acc" in globals(), "Set scaled_acc to scaled.score(X_test, y_test)."
assert abs(float(scaled_acc) - scaled.score(X_test, y_test)) < 1e-9, "scaled_acc is the pipeline's score on the test wines."
assert float(scaled_acc) > plain.score(X_test, y_test), "Scaled should beat plain here. Train it on X_train and y_train."`,
},
{
  id: 'ai-04', mins: 4, needs: SK,
  title: 'Where it goes wrong',
  concept: [
    'A score says how often a model is right, not **where** it goes wrong. A **confusion matrix** shows that: one row for each true answer, one column for each guess.',
    'The diagonal holds the right guesses. Every number off it is a mistake: row 8, column 1 means "an 8 that it read as a 1".',
    'Knowing which mistakes it makes tells you what to fix, and whether the mistakes even matter.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import ConfusionMatrixDisplay

digits = load_digits()       # 1,797 handwritten digits, each an 8 x 8 grid of pixels
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

model = GaussianNB().fit(X_train, y_train)
guess = model.predict(X_test)
print("score:", round(model.score(X_test, y_test), 3))`,
  task: 'Set `mistakes` to how many test digits it got wrong. Then draw the confusion matrix with `ConfusionMatrixDisplay.from_predictions(y_test, guess)`. Which digit does it muddle most?',
  hint: '`guess != y_test` is True for every wrong guess, and `.sum()` counts the Trues: `mistakes = (guess != y_test).sum()`. Then the display line, and `plt.show()`.',
  solution: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import ConfusionMatrixDisplay

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

model = GaussianNB().fit(X_train, y_train)
guess = model.predict(X_test)

mistakes = (guess != y_test).sum()
print(mistakes, "wrong out of", len(y_test))

ConfusionMatrixDisplay.from_predictions(y_test, guess)
plt.show()`,
  check: `assert "mistakes" in globals(), "Set mistakes: how many test digits it got wrong."
assert int(mistakes) == int((guess != y_test).sum()), "mistakes is the number of wrong guesses: (guess != y_test).sum()."
assert _axes(), "Draw the matrix too: ConfusionMatrixDisplay.from_predictions(y_test, guess), then plt.show()."`,
},
{
  id: 'ai-05', mins: 5, needs: SK,
  title: 'Try them all, keep the best',
  concept: [
    'No model is best at everything, so try several on the same data and keep the winner. Tools that do this for you are called AutoML. Here, a loop does it.',
    'One split into train and test can be lucky. `cross_val_score(model, X, y, cv=5)` cuts the data into 5 parts, tests on each part in turn after training on the other four, and gives 5 scores. Their average is fairer.',
    'A dict keeps each score next to its model\'s name, and `max(scores, key=scores.get)` gives the name with the highest.',
  ],
  starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

X, y = load_wine(return_X_y=True)
models = {
    "neighbours": make_pipeline(StandardScaler(), KNeighborsClassifier()),
    "tree": DecisionTreeClassifier(random_state=0),
    "naive bayes": GaussianNB(),
    "forest": RandomForestClassifier(n_estimators=50, random_state=0),
    "svm": make_pipeline(StandardScaler(), SVC()),
}

for name, model in models.items():
    print(name)`,
  task: 'Make `scores`: a dict of each model\'s name and its average score over 5 folds. Then set `best` to the name of the winner.',
  hint: 'Start with `scores = {}`. In the loop, `scores[name] = cross_val_score(model, X, y, cv=5).mean()`. After it, `best = max(scores, key=scores.get)`.',
  solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

X, y = load_wine(return_X_y=True)
models = {
    "neighbours": make_pipeline(StandardScaler(), KNeighborsClassifier()),
    "tree": DecisionTreeClassifier(random_state=0),
    "naive bayes": GaussianNB(),
    "forest": RandomForestClassifier(n_estimators=50, random_state=0),
    "svm": make_pipeline(StandardScaler(), SVC()),
}

scores = {}
for name, model in models.items():
    scores[name] = cross_val_score(model, X, y, cv=5).mean()
    print(name, round(scores[name], 3))

best = max(scores, key=scores.get)
print("best:", best)`,
  check: `assert "scores" in globals() and isinstance(scores, dict), "Make scores, a dict: scores = {} before the loop."
assert set(scores) == set(models), "scores needs one entry per model: %s." % ", ".join(models)
_ref = {n: cross_val_score(m, X, y, cv=5).mean() for n, m in models.items()}
assert all(abs(float(scores[n]) - _ref[n]) < 1e-9 for n in _ref), "Each score is cross_val_score(model, X, y, cv=5).mean()."
assert "best" in globals() and best == max(_ref, key=_ref.get), "best is the name with the highest score: max(scores, key=scores.get)."`,
},

/* ── Neural networks, from the inside ──────────────────── */
{
  id: 'ai-06', mins: 3,
  title: 'One neuron',
  concept: [
    'A neural network is built from simple units called **neurons**. Each one takes some numbers in and gives one number out.',
    'It multiplies each input by a **weight** (how much that input matters), adds them up, and adds a **bias** (its starting lean). `np.dot(w, x)` does the multiplying and adding in one go.',
    'Then an **activation** squashes the total. The sigmoid, `1 / (1 + np.exp(-z))`, turns any number into one between 0 and 1: near 1 means "yes".',
  ],
  starter: `# Will the café be busy? Three things the neuron is told:
x = np.array([28.0, 1.0, 0.0])     # temperature (°C), weekend (1 = yes), rain (1 = yes)
w = np.array([0.1, 1.5, -2.0])     # how much each one matters; rain counts against
b = -3.0                           # the neuron's starting lean

z = np.dot(w, x) + b
print("total:", round(z, 2))`,
  task: 'Make `output`: the total `z` squashed through the sigmoid. Is it closer to yes or to no?',
  hint: '`output = 1 / (1 + np.exp(-z))`',
  solution: `x = np.array([28.0, 1.0, 0.0])
w = np.array([0.1, 1.5, -2.0])
b = -3.0

z = np.dot(w, x) + b
output = 1 / (1 + np.exp(-z))
print("total:", round(z, 2), " output:", round(output, 3))`,
  check: `assert "output" in globals(), "Make output: z squashed through the sigmoid."
assert abs(float(output) - 1 / (1 + np.exp(-(np.dot(w, x) + b)))) < 1e-9, "output is 1 / (1 + np.exp(-z))."
assert 0 < float(output) < 1, "The sigmoid always gives a number between 0 and 1."`,
},
{
  id: 'ai-07', mins: 4,
  title: 'A neuron that learns',
  concept: [
    'Nobody sets a real network\'s weights by hand: it **learns** them from examples. The simplest neuron that learns is called a **perceptron**.',
    'It guesses 1 or 0 and compares the guess with the right answer. Then it nudges each weight by `rate * error * input`. A right guess has an error of 0, so nothing moves. (`x @ w` is the same multiply-and-add as `np.dot`.)',
    'Go through the examples again and again (each pass is an **epoch**), and the nudges add up to weights that get every example right.',
  ],
  starter: `# Teach it AND: answer 1 only when both inputs are 1.
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
target = np.array([0, 0, 0, 1])

w = np.zeros(2)     # the weights start at nothing
b = 0.0
rate = 0.1          # how big each nudge is

for epoch in range(20):
    for x, t in zip(X, target):
        guess = 1 if x @ w + b > 0 else 0
        error = t - guess
        # the two learning lines go here

predictions = [1 if x @ w + b > 0 else 0 for x in X]
print("predictions:", predictions, " weights:", w, " bias:", round(b, 2))`,
  task: 'Add the two learning lines inside the loop: nudge `w` by `rate * error * x`, and `b` by `rate * error`. Then `predictions` should match `target`.',
  hint: '`w = w + rate * error * x` and, under it, `b = b + rate * error`. Indent both to line up with `error = ...`.',
  solution: `X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
target = np.array([0, 0, 0, 1])

w = np.zeros(2)
b = 0.0
rate = 0.1

for epoch in range(20):
    for x, t in zip(X, target):
        guess = 1 if x @ w + b > 0 else 0
        error = t - guess
        w = w + rate * error * x
        b = b + rate * error

predictions = [1 if x @ w + b > 0 else 0 for x in X]
print("predictions:", predictions, " weights:", w, " bias:", round(b, 2))`,
  check: `assert np.any(w != 0), "w hasn't moved: add the two learning lines inside the inner loop."
assert [1 if _x @ w + b > 0 else 0 for _x in X] == list(target), "The learned w and b should get all four right: %s." % list(target)`,
},
{
  id: 'ai-08', mins: 4,
  title: 'Downhill: how networks learn',
  concept: [
    'Bigger networks learn by **gradient descent**. A **loss** measures how wrong the model is, and each step moves the weights a little way downhill, towards a smaller loss.',
    'The **learning rate** sets the size of each step. Too small, and learning crawls. Too big, and every step overshoots the bottom, so the loss grows instead of shrinking.',
    'Here one neuron learns a straight line, `w * x + b`, from 50 points that really follow `3x + 2`.',
  ],
  starter: `rng = np.random.default_rng(0)
xs = rng.uniform(0, 1, 50)
ys = 3 * xs + 2 + rng.normal(0, 0.1, 50)      # the true line is 3x + 2, plus a little noise

rate = 1.0          # the learning rate
w, b = 0.0, 0.0
for step in range(200):
    pred = w * xs + b
    loss = ((pred - ys) ** 2).mean()                 # the average squared miss
    w = w - rate * (2 * (pred - ys) * xs).mean()     # a step downhill for w
    b = b - rate * (2 * (pred - ys)).mean()          # and for b

print("w:", w, " b:", b, " loss:", loss)`,
  task: 'With a rate of 1.0 the numbers explode. Find a learning rate that works, so that after 200 steps `w` ends up near 3 and `b` near 2.',
  hint: 'Try half: `rate = 0.5`. Then try `0.01` as well, to see how far 200 small steps get.',
  solution: `rng = np.random.default_rng(0)
xs = rng.uniform(0, 1, 50)
ys = 3 * xs + 2 + rng.normal(0, 0.1, 50)

rate = 0.5
w, b = 0.0, 0.0
for step in range(200):
    pred = w * xs + b
    loss = ((pred - ys) ** 2).mean()
    w = w - rate * (2 * (pred - ys) * xs).mean()
    b = b - rate * (2 * (pred - ys)).mean()

print("w:", round(w, 2), " b:", round(b, 2), " loss:", round(loss, 4))`,
  check: `assert np.isfinite(w) and np.isfinite(b) and abs(w) < 1e6 and abs(b) < 1e6, "The numbers blew up: that learning rate is too big. Try a smaller one."
assert abs(w - 3) < 0.25 and abs(b - 2) < 0.25, "Not there yet: w is %.2f and b is %.2f after 200 steps. Try a rate between 0.1 and 0.7." % (w, b)`,
},
{
  id: 'ai-09', mins: 5, needs: SK,
  title: 'A network reads handwriting',
  concept: [
    'A **neural network** stacks neurons in layers: the inputs feed a **hidden layer**, and the hidden layer feeds the answer. Training runs gradient descent on every weight at once.',
    'Each digit here is an 8 × 8 picture: 64 numbers, one per square, from 0 (white) to 16 (black). Those 64 numbers are the inputs.',
    '`MLPClassifier(hidden_layer_sizes=(32,))` builds a network with one hidden layer of 32 neurons. More neurons can hold more patterns, and take longer to train.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

digits = load_digits()
fig, axes = plt.subplots(1, 6, figsize=(7, 1.6))
for ax, image, label in zip(axes, digits.images, digits.target):
    ax.imshow(image, cmap="gray_r")
    ax.set_title(label)
    ax.axis("off")
plt.show()

X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)
model = MLPClassifier(hidden_layer_sizes=(2,), max_iter=300, random_state=0).fit(X_train, y_train)
accuracy = model.score(X_test, y_test)
print("with 2 hidden neurons:", round(accuracy, 3))`,
  task: 'Two hidden neurons can\'t hold enough patterns. Give it **32**, and get `accuracy` above 0.9.',
  hint: '`hidden_layer_sizes=(32,)`. Keep the comma: it is a list of layer sizes, with one layer in it.',
  solution: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

digits = load_digits()
fig, axes = plt.subplots(1, 6, figsize=(7, 1.6))
for ax, image, label in zip(axes, digits.images, digits.target):
    ax.imshow(image, cmap="gray_r")
    ax.set_title(label)
    ax.axis("off")
plt.show()

X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)
model = MLPClassifier(hidden_layer_sizes=(32,), max_iter=300, random_state=0).fit(X_train, y_train)
accuracy = model.score(X_test, y_test)
print("with 32 hidden neurons:", round(accuracy, 3))`,
  check: `assert "model" in globals() and hasattr(model, "coefs_"), "Keep the trained network in a variable called model."
assert "accuracy" in globals() and abs(float(accuracy) - model.score(X_test, y_test)) < 1e-9, "accuracy is model.score(X_test, y_test)."
assert float(accuracy) > 0.9, "%.2f isn't above 0.9 yet. Give it a bigger hidden layer: hidden_layer_sizes=(32,)." % float(accuracy)`,
},
{
  id: 'ai-10', mins: 5,
  title: 'How a network sees edges',
  concept: [
    'Networks that read pictures (**convolutional** networks) slide a small grid of weights, a **filter**, across the image. At each spot they multiply the filter by the pixels under it, and add the lot up.',
    'The filter here is negative on its left and positive on its right. So it gives a big number where dark turns to light, going left to right: a vertical edge. Light to dark gives a big negative one.',
    'A real network learns its filters from examples. Its first layer usually ends up with edge-finders just like this one.',
  ],
  starter: `image = np.zeros((9, 9))
image[2:7, 2:7] = 1                   # a white square on black

kernel = np.array([[-1, 0, 1],
                   [-1, 0, 1],
                   [-1, 0, 1]])       # the filter

out = np.zeros((7, 7))
for i in range(7):
    for j in range(7):
        patch = image[i:i + 3, j:j + 3]     # the 3 x 3 pixels under the filter
        out[i, j] = 0                       # the filter times the patch, added up

fig, (left, right) = plt.subplots(1, 2, figsize=(6, 3))
left.imshow(image, cmap="gray")
left.set_title("picture")
right.imshow(out, cmap="coolwarm")
right.set_title("vertical edges")
plt.show()`,
  task: 'Fill in the filter: at each spot, `out[i, j]` should be the filter times the patch, all added up. Then look at where the edges light up.',
  hint: '`out[i, j] = (patch * kernel).sum()`. `*` multiplies the numbers in matching positions, and `.sum()` adds all nine together.',
  solution: `image = np.zeros((9, 9))
image[2:7, 2:7] = 1

kernel = np.array([[-1, 0, 1],
                   [-1, 0, 1],
                   [-1, 0, 1]])

out = np.zeros((7, 7))
for i in range(7):
    for j in range(7):
        patch = image[i:i + 3, j:j + 3]
        out[i, j] = (patch * kernel).sum()

fig, (left, right) = plt.subplots(1, 2, figsize=(6, 3))
left.imshow(image, cmap="gray")
left.set_title("picture")
right.imshow(out, cmap="coolwarm")
right.set_title("vertical edges")
plt.show()`,
  check: `_ref = np.array([[(image[_i:_i + 3, _j:_j + 3] * kernel).sum() for _j in range(7)] for _i in range(7)])
assert np.shape(out) == (7, 7) and np.allclose(out, _ref), "At each spot, out[i, j] should be (patch * kernel).sum()."
assert _axes(), "Keep the two pictures at the end."`,
},

/* ── Beyond labels ─────────────────────────────────────── */
{
  id: 'ai-11', mins: 4, needs: SK,
  title: 'Groups nobody labelled',
  concept: [
    'So far every model learned from examples with answers: **supervised** learning. **Unsupervised** learning gets only the measurements, and looks for groups by itself.',
    '**k-means** puts down k centre points, gives each example to its nearest centre, moves each centre to the middle of its group, and repeats until nothing changes.',
    'You choose k. The groups it finds have no names, so compare them with real labels when you have some, to see whether they mean anything.',
  ],
  starter: `from sklearn.datasets import load_iris
from sklearn.cluster import KMeans

iris = load_iris(as_frame=True)
X = iris.data                                   # the measurements only: no labels
kinds = iris.target_names[iris.target]          # the real kinds, kept aside to compare

km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
pd.crosstab(km.labels_, kinds, rownames=["group"], colnames=["kind"])`,
  task: 'Ask for **3** groups. Then make `table`: a crosstab of the groups it found against the real kinds, like the one the starter shows. How well do they line up?',
  hint: '`n_clusters=3`, then `table = pd.crosstab(km.labels_, kinds, rownames=["group"], colnames=["kind"])`.',
  solution: `from sklearn.datasets import load_iris
from sklearn.cluster import KMeans

iris = load_iris(as_frame=True)
X = iris.data
kinds = iris.target_names[iris.target]

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
table = pd.crosstab(km.labels_, kinds, rownames=["group"], colnames=["kind"])
table`,
  check: `assert "km" in globals() and hasattr(km, "labels_"), "Keep the fitted KMeans in km."
assert km.n_clusters == 3, "Ask for 3 groups: n_clusters=3."
assert "table" in globals(), "Make table: pd.crosstab(km.labels_, kinds, rownames=['group'], colnames=['kind'])."
assert table.shape == (3, 3), "table should have a row for each group and a column for each kind: 3 by 3."`,
},
{
  id: 'ai-12', mins: 4, needs: SK,
  title: '64 numbers down to two',
  concept: [
    'Each digit is 64 numbers, and nobody can picture 64 dimensions. **PCA** (principal component analysis) finds the few directions along which the data spreads out most.',
    'Keep the top two, and every digit becomes a point on a flat chart, keeping as much of the difference between digits as two numbers can.',
    'If the same digits land together, the 64 numbers really do hold what makes a 3 a 3. That is why a network can learn them.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

digits = load_digits()
print(digits.data.shape)       # 1,797 digits, 64 numbers each`,
  task: 'Make `pca` with 2 components, and `points`: the digits squashed to 2 numbers each. Then scatter them, coloured by `digits.target`, with a colour bar.',
  hint: '`pca = PCA(n_components=2)`, `points = pca.fit_transform(digits.data)`, then `plt.scatter(points[:, 0], points[:, 1], c=digits.target, cmap="tab10", s=8)` and `plt.colorbar()`.',
  solution: `from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

digits = load_digits()
pca = PCA(n_components=2)
points = pca.fit_transform(digits.data)

plt.scatter(points[:, 0], points[:, 1], c=digits.target, cmap="tab10", s=8)
plt.colorbar(label="digit")
plt.title("Each digit, as two numbers")
plt.show()`,
  check: `assert "pca" in globals() and getattr(pca, "n_components_", None) == 2, "Use PCA(n_components=2), and fit it."
assert "points" in globals() and np.shape(points) == (1797, 2), "points should hold 2 numbers for each of the 1,797 digits: pca.fit_transform(digits.data)."
assert any(_a.collections for _a in _axes()), "Scatter the points: plt.scatter(points[:, 0], points[:, 1], c=digits.target)."`,
},
{
  id: 'ai-13', mins: 4, needs: SK,
  title: 'Words into numbers',
  concept: [
    'Models only take numbers, so text has to become numbers first. The simplest way is a **bag of words**: count how often each word appears, and forget the order.',
    '`CountVectorizer` learns the vocabulary (every word it sees), then turns each text into a row of counts, with one column per word.',
    'Words like "the" and "and" are everywhere and say little. They are called **stop words**, and `stop_words="english"` leaves them out.',
  ],
  starter: `from sklearn.feature_extraction.text import CountVectorizer

print(reviews.head())

vec = CountVectorizer()
counts = vec.fit_transform(reviews["text"])
print(counts.shape, "- one row per review, one column per word")`,
  task: 'Make `vec` leave out the English stop words. Then set `top_word` to the word used most across all 40 reviews.',
  hint: '`CountVectorizer(stop_words="english")`. Then `totals = counts.toarray().sum(axis=0)` adds up each word\'s column, and `top_word = vec.get_feature_names_out()[totals.argmax()]`.',
  solution: `from sklearn.feature_extraction.text import CountVectorizer

vec = CountVectorizer(stop_words="english")
counts = vec.fit_transform(reviews["text"])
print(counts.shape)

totals = counts.toarray().sum(axis=0)
top_word = vec.get_feature_names_out()[totals.argmax()]
print("most used:", top_word)`,
  check: `from sklearn.feature_extraction.text import CountVectorizer as _CV
assert "vec" in globals() and getattr(vec, "stop_words", None) == "english", 'Leave out the stop words: CountVectorizer(stop_words="english").'
_v = _CV(stop_words="english")
_totals = _v.fit_transform(reviews["text"]).toarray().sum(axis=0)
assert "top_word" in globals(), "Set top_word to the most-used word."
assert str(top_word) == _v.get_feature_names_out()[_totals.argmax()], "That isn't the most-used word. Add up each column, then take the biggest."`,
},
{
  id: 'ai-14', mins: 4, needs: SK,
  title: 'Happy or not?',
  concept: [
    '**Sentiment analysis** reads a piece of text and says whether it sounds positive or negative. Here a model learns it from the 40 reviews and their moods.',
    '**Naive Bayes** is a quick, classic choice for text. It learns how often each word turns up in happy reviews and in unhappy ones, then weighs up the words in a new review.',
    'A pipeline turns text into counts and hands them to the model, so it can read plain sentences. A word it never saw while training, it simply ignores.',
  ],
  starter: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

model = make_pipeline(CountVectorizer(), MultinomialNB())
new = ["Friendly staff and a delicious latte", "A long wait and cold coffee"]`,
  task: 'Train `model` on the review texts and their moods. Then set `guesses` to what it says about the two `new` reviews. Try one of your own too.',
  hint: '`model.fit(reviews["text"], reviews["mood"])`, then `guesses = model.predict(new)`.',
  solution: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

model = make_pipeline(CountVectorizer(), MultinomialNB())
new = ["Friendly staff and a delicious latte", "A long wait and cold coffee"]

model.fit(reviews["text"], reviews["mood"])
guesses = model.predict(new)
for text, mood in zip(new, guesses):
    print(mood, "-", text)`,
  check: `assert hasattr(model.steps[-1][1], "classes_"), 'Train it first: model.fit(reviews["text"], reviews["mood"]).'
assert "guesses" in globals(), "Set guesses = model.predict(new)."
assert list(guesses)[:2] == ["happy", "unhappy"], "It should read the first as happy and the second as unhappy. Did it learn from reviews['mood']?"`,
},
{
  id: 'ai-15', mins: 5,
  title: 'Learning by trial and error',
  concept: [
    '**Reinforcement learning** has no answers to copy. An agent tries actions, now and then gets a **reward**, and learns which actions pay off. Game-playing AIs learn this way.',
    'Here a robot waiter starts at table 0, in a row of six places, and has to reach the kitchen at place 5. It can step left or right, and gets a reward of 1 only for arriving.',
    '**Q-learning** keeps a score for every place and action, in a table called `Q`. After each step, the score moves towards the reward plus the best score of the place it landed. So the reward spreads back along the way, and `gamma`, just under 1, makes far-off rewards count a little less.',
  ],
  starter: `rng = np.random.default_rng(0)
Q = np.zeros((6, 2))            # a score for each place (0-5) and action (0 = left, 1 = right)
alpha, gamma, explore = 0.5, 0.9, 0.2

for episode in range(200):
    s = 0                       # start at table 0
    for step in range(50):
        if rng.random() < explore or Q[s, 0] == Q[s, 1]:
            a = int(rng.integers(2))          # try something at random
        else:
            a = int(Q[s].argmax())            # do what has scored best
        s2 = max(0, s - 1) if a == 0 else s + 1
        reward = 1 if s2 == 5 else 0
        # the Q-learning line goes here
        s = s2
        if s == 5:
            break

policy = ["left" if Q[p, 0] > Q[p, 1] else "right" for p in range(5)]
print(policy)`,
  task: 'Add the learning line: move `Q[s, a]` towards `reward + gamma * Q[s2].max()`, by the fraction `alpha`. Then the waiter should head right from every table.',
  hint: '`Q[s, a] = Q[s, a] + alpha * (reward + gamma * Q[s2].max() - Q[s, a])`, lined up with the lines around it.',
  solution: `rng = np.random.default_rng(0)
Q = np.zeros((6, 2))
alpha, gamma, explore = 0.5, 0.9, 0.2

for episode in range(200):
    s = 0
    for step in range(50):
        if rng.random() < explore or Q[s, 0] == Q[s, 1]:
            a = int(rng.integers(2))
        else:
            a = int(Q[s].argmax())
        s2 = max(0, s - 1) if a == 0 else s + 1
        reward = 1 if s2 == 5 else 0
        Q[s, a] = Q[s, a] + alpha * (reward + gamma * Q[s2].max() - Q[s, a])
        s = s2
        if s == 5:
            break

policy = ["left" if Q[p, 0] > Q[p, 1] else "right" for p in range(5)]
print(policy)
print(Q.round(2))`,
  check: `assert np.any(Q[:5] != 0), "Q is still all zeros: add the learning line inside the loop."
_pol = ["left" if Q[_p, 0] > Q[_p, 1] else "right" for _p in range(5)]
assert _pol == ["right"] * 5, "The waiter should head right from every table. The line is Q[s, a] = Q[s, a] + alpha * (reward + gamma * Q[s2].max() - Q[s, a])."
assert Q[4, 1] > Q[3, 1] > Q[0, 1], "The scores should grow towards the kitchen. Is gamma * Q[s2].max() in the line?"`,
},

/* ── Better models ─────────────────────────────────────── */
{
  id: 'ai-16', mins: 5, needs: SK,
  title: 'Learning it by heart',
  concept: [
    'A model can score perfectly on the examples it trained on and still do worse on new ones. It has learned them **by heart**, noise and all: this is called **overfitting**.',
    'So compare the **training** score with the **test** score. A big gap between them is the warning sign.',
    'Holding the model back, with a smaller `max_depth`, makes it learn the general shape instead of every stray point. Hold it back too far and it misses the shape as well: that is **underfitting**.',
  ],
  starter: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# 400 points in two overlapping crescents, labelled 0 or 1. The noise puts
# some points on the wrong side, as real data does.
X, y = make_moons(n_samples=400, noise=0.35, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

plt.scatter(X[:, 0], X[:, 1], c=y, cmap="coolwarm", s=12)
plt.show()

deep = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)      # no limit on depth
print("it grew", deep.get_depth(), "questions deep")`,
  task: 'Set `train_acc` and `test_acc`: `deep`\'s score on its own training points, then on the test ones. Then, for `max_depth` 1 to 12, make two dicts of depth and score, `train_scores` and `test_scores`, and draw both against depth with a legend. Set `best_depth` to the depth with the highest test score.',
  hint: 'Start both dicts empty. In `for depth in range(1, 13):`, fit `DecisionTreeClassifier(max_depth=depth, random_state=0)` on the training points, then store its two scores. `best_depth = max(test_scores, key=test_scores.get)`. Draw with `plt.plot(list(train_scores), list(train_scores.values()), label="train")`, the same for test, then `plt.legend()` and `plt.show()`.',
  solution: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=400, noise=0.35, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

deep = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
train_acc = deep.score(X_train, y_train)
test_acc = deep.score(X_test, y_test)
print("no limit: training", train_acc, " test", round(test_acc, 3))

train_scores, test_scores = {}, {}
for depth in range(1, 13):
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    train_scores[depth] = tree.score(X_train, y_train)
    test_scores[depth] = tree.score(X_test, y_test)
best_depth = max(test_scores, key=test_scores.get)
print("best depth:", best_depth, " test", round(test_scores[best_depth], 3))

plt.plot(list(train_scores), list(train_scores.values()), marker="o", label="train")
plt.plot(list(test_scores), list(test_scores.values()), marker="o", label="test")
plt.xlabel("max_depth")
plt.ylabel("score")
plt.legend()
plt.show()`,
  check: `assert "train_acc" in globals() and "test_acc" in globals(), "Set train_acc and test_acc: deep.score on the training points, then on the test ones."
assert abs(float(train_acc) - deep.score(X_train, y_train)) < 1e-9 and abs(float(test_acc) - deep.score(X_test, y_test)) < 1e-9, "train_acc is deep.score(X_train, y_train); test_acc is deep.score(X_test, y_test)."
for _name in ("train_scores", "test_scores"):
    assert isinstance(globals().get(_name), dict) and set(globals()[_name]) == set(range(1, 13)), "%s should be a dict with the depths 1 to 12 as its keys: range(1, 13)." % _name
for _d in range(1, 13):
    _t = DecisionTreeClassifier(max_depth=_d, random_state=0).fit(X_train, y_train)
    assert abs(float(train_scores[_d]) - _t.score(X_train, y_train)) < 1e-9, "train_scores[%d] should be the training score of a tree with max_depth=%d and random_state=0." % (_d, _d)
    assert abs(float(test_scores[_d]) - _t.score(X_test, y_test)) < 1e-9, "test_scores[%d] should be the test score of a tree with max_depth=%d and random_state=0." % (_d, _d)
assert "best_depth" in globals() and test_scores.get(best_depth) == max(test_scores.values()), "best_depth is the depth with the highest test score: max(test_scores, key=test_scores.get)."
_ax = [a for a in _axes() if len(a.lines) >= 2]
assert _ax, "Draw both lines on one chart: plt.plot(...) for train and for test."
assert _ax[-1].get_legend() is not None, "Add a legend, so the two lines can be told apart: plt.legend()."`,
},
{
  id: 'ai-17', mins: 5, needs: SK,
  title: 'How sure is it?',
  concept: [
    'Many models can say how sure they are. `predict_proba(X)` gives each example a **probability** for every class: numbers between 0 and 1 that add up to 1.',
    '**Logistic regression** is a simple, popular model that works this way. It weighs up the features, adds them together, and squashes the total into a probability.',
    'Probabilities let you act when the model is confident and hand the unsure cases to a person. A model that knows when it doesn\'t know is far more useful.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
guess = model.predict(X_test)
right = guess == y_test
print("score:", round(model.score(X_test, y_test), 3), " wrong:", (~right).sum())`,
  task: 'Make `probs`: the model\'s probabilities for every test digit. Then `confidence`: the highest probability for each digit, and `unsure`: True where that is below 0.9. Finally `sure_acc` and `unsure_acc`: the share it got right among the sure digits, and among the unsure ones.',
  hint: '`probs = model.predict_proba(X_test)`, `confidence = probs.max(axis=1)` (the biggest in each row), `unsure = confidence < 0.9`. Then `sure_acc = right[~unsure].mean()` and `unsure_acc = right[unsure].mean()`.',
  solution: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
guess = model.predict(X_test)
right = guess == y_test

probs = model.predict_proba(X_test)
confidence = probs.max(axis=1)
unsure = confidence < 0.9
sure_acc = right[~unsure].mean()
unsure_acc = right[unsure].mean()

print("first digit's probabilities:", probs[0].round(2))
print(unsure.sum(), "unsure out of", len(unsure))
print("right when sure:", round(sure_acc, 3), " right when unsure:", round(unsure_acc, 3))
print("wrong guesses that were unsure:", (~right & unsure).sum(), "of", (~right).sum())`,
  check: `assert "probs" in globals() and np.shape(probs) == (len(X_test), 10), "probs should be model.predict_proba(X_test): one row per test digit, one column per digit 0 to 9."
assert np.allclose(probs, model.predict_proba(X_test)), "probs is model.predict_proba(X_test)."
assert "confidence" in globals() and np.allclose(confidence, probs.max(axis=1)), "confidence is the biggest probability in each row: probs.max(axis=1)."
assert "unsure" in globals() and np.array_equal(np.asarray(unsure), confidence < 0.9), "unsure is True where confidence is below 0.9."
assert "sure_acc" in globals() and abs(float(sure_acc) - right[confidence >= 0.9].mean()) < 1e-9, "sure_acc is the share right among the sure digits: right[~unsure].mean()."
assert "unsure_acc" in globals() and abs(float(unsure_acc) - right[confidence < 0.9].mean()) < 1e-9, "unsure_acc is the share right among the unsure ones: right[unsure].mean()."`,
},
{
  id: 'ai-18', mins: 5, needs: SK,
  title: 'A forest of trees',
  concept: [
    'One decision tree is quick and easy to read, but jumpy: change the training examples a little and it can learn quite different questions.',
    'A **random forest** trains many trees, each on a random resample of the examples and a random few features at each question, then lets them vote. Their mistakes tend to cancel out.',
    'Many varied models voting together is called an **ensemble**, and it often beats any single one, like a crowd\'s average guess beating most of the guessers. `n_estimators` sets how many trees.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
tree_acc = tree.score(X_test, y_test)
print("one tree:", round(tree_acc, 3))`,
  task: 'Make `forest`: a `RandomForestClassifier` with 100 trees and `random_state=0`, trained on the training digits, and set `forest_acc` to its test score. Then `few_acc`: the test score of a forest of just 5 trees, also with `random_state=0`.',
  hint: '`forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)`, then `forest_acc = forest.score(X_test, y_test)`. The same with `n_estimators=5` for `few_acc`.',
  solution: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
tree_acc = tree.score(X_test, y_test)

forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)
forest_acc = forest.score(X_test, y_test)
few_acc = RandomForestClassifier(n_estimators=5, random_state=0).fit(X_train, y_train).score(X_test, y_test)

print("one tree:", round(tree_acc, 3))
print("5 trees: ", round(few_acc, 3))
print("100 trees:", round(forest_acc, 3))`,
  check: `from sklearn.ensemble import RandomForestClassifier as _RF
assert isinstance(globals().get("forest"), _RF) and hasattr(forest, "estimators_"), "Make forest: RandomForestClassifier(n_estimators=100, random_state=0).fit(X_train, y_train)."
assert forest.n_estimators == 100 and forest.random_state == 0, "Give the forest 100 trees and random_state=0. It has n_estimators=%r, random_state=%r." % (forest.n_estimators, forest.random_state)
assert abs(forest.score(X_test, y_test) - _RF(n_estimators=100, random_state=0).fit(X_train, y_train).score(X_test, y_test)) < 1e-9, "Train the forest on the training digits: .fit(X_train, y_train)."
assert "forest_acc" in globals() and abs(float(forest_acc) - forest.score(X_test, y_test)) < 1e-9, "forest_acc is forest.score(X_test, y_test)."
_few = _RF(n_estimators=5, random_state=0).fit(X_train, y_train).score(X_test, y_test)
assert "few_acc" in globals() and abs(float(few_acc) - _few) < 1e-9, "few_acc is the test score of RandomForestClassifier(n_estimators=5, random_state=0), trained on the training digits."`,
},
{
  id: 'ai-19', mins: 4, needs: SK,
  title: 'What the model leaned on',
  concept: [
    'A forest can tell you which features it leaned on most: `forest.feature_importances_` gives each feature a share, and the shares add up to 1.',
    'It\'s a quick way to learn about the data itself: which measurements really tell the classes apart.',
    'Treat it as a clue, not proof. When two features carry the same information, the credit is split between them, and both look less important than they are.',
  ],
  starter: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier

X, y = load_wine(return_X_y=True, as_frame=True)       # 178 wines, 13 measurements, 3 growers
forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X, y)
print(forest.feature_importances_.round(3))             # which number is which?`,
  task: 'Make `importance`: a Series of `forest.feature_importances_` with the feature names (`X.columns`) as its index, sorted biggest first. Then `top3`: a list of the 3 most important names. Draw `importance` as a horizontal bar chart.',
  hint: '`importance = pd.Series(forest.feature_importances_, index=X.columns).sort_values(ascending=False)`, `top3 = list(importance.index[:3])`. Then `importance.sort_values().plot.barh()` (so the biggest bar ends up on top) and `plt.show()`.',
  solution: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier

X, y = load_wine(return_X_y=True, as_frame=True)
forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X, y)

importance = pd.Series(forest.feature_importances_, index=X.columns).sort_values(ascending=False)
top3 = list(importance.index[:3])
print(top3)

importance.sort_values().plot.barh(figsize=(6, 4.5))
plt.xlabel("share of the forest's decisions")
plt.tight_layout()
plt.show()`,
  check: `_imp = pd.Series(forest.feature_importances_, index=X.columns).sort_values(ascending=False)
assert isinstance(globals().get("importance"), pd.Series), "importance should be a Series: pd.Series(forest.feature_importances_, index=X.columns)."
assert list(importance.index) == list(_imp.index), "importance should be sorted biggest first, with the feature names as its index: .sort_values(ascending=False)."
assert np.allclose(importance.values, _imp.values), "importance holds forest.feature_importances_."
assert list(globals().get("top3", [])) == list(_imp.index[:3]), "top3 is the 3 most important names: list(importance.index[:3])."
assert _axes() and any(len(a.patches) >= 13 for a in _axes()), "Draw it as a bar chart: importance.sort_values().plot.barh(), then plt.show()."`,
},
{
  id: 'ai-20', mins: 5, needs: SK,
  title: 'Searching for the best settings',
  concept: [
    'Settings you choose before training, like `n_neighbors` or `max_depth`, are called **hyperparameters**. The best values depend on the data, so you try several.',
    '`GridSearchCV(model, grid, cv=5)` tries every combination in the grid, each scored with 5-fold cross-validation (as in "Try them all, keep the best"), and keeps the winner.',
    'After `.fit`, `best_params_` holds the winning settings and `best_score_` their average score. Judge the final model on test examples the search never saw.',
  ],
  starter: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

grid = {"n_neighbors": [1, 3, 5, 7, 9], "weights": ["uniform", "distance"]}
print(len(grid["n_neighbors"]) * len(grid["weights"]), "combinations, each tried 5 times")`,
  task: 'Make `search`: a `GridSearchCV` of `KNeighborsClassifier()` over `grid`, with `cv=5`, trained on the training digits. Set `best` to its `best_params_`, and `final_acc` to its score on the test digits.',
  hint: '`search = GridSearchCV(KNeighborsClassifier(), grid, cv=5).fit(X_train, y_train)`, then `best = search.best_params_` and `final_acc = search.score(X_test, y_test)`.',
  solution: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.3, random_state=0)

grid = {"n_neighbors": [1, 3, 5, 7, 9], "weights": ["uniform", "distance"]}
search = GridSearchCV(KNeighborsClassifier(), grid, cv=5).fit(X_train, y_train)
best = search.best_params_
final_acc = search.score(X_test, y_test)

print("best settings:", best, " cross-validated:", round(search.best_score_, 3))
print("on the test digits:", round(final_acc, 3))
pd.DataFrame(search.cv_results_)[["param_n_neighbors", "param_weights", "mean_test_score"]].round(3)`,
  check: `from sklearn.model_selection import GridSearchCV as _GS
assert isinstance(globals().get("search"), _GS), "Make search: GridSearchCV(KNeighborsClassifier(), grid, cv=5)."
assert hasattr(search, "best_params_"), "Train the search: .fit(X_train, y_train)."
assert search.param_grid == grid, "Search over grid itself: GridSearchCV(KNeighborsClassifier(), grid, cv=5)."
assert search.n_splits_ == 5, "Use 5 folds: cv=5."
assert search.best_estimator_.n_samples_fit_ == len(X_train), "Train the search on the training digits only, so the test is fair."
assert globals().get("best") == search.best_params_, "best is search.best_params_."
assert "final_acc" in globals() and abs(float(final_acc) - search.score(X_test, y_test)) < 1e-9, "final_acc is search.score(X_test, y_test)."`,
},
];
