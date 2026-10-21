/* AI (ai-01 to ai-20): the fuller teaching, a worked example and the task as
   a brief (see detail/index.js). Examples train on a handful of made-up
   points, so each idea is visible and the task's answer stays hidden. */

const STARTER_DATA = ['The starter loads the data and imports what you need.'];

export const AI_DETAIL = {
'ai-01': {
  explain: [
    '**Machine learning** means a program works out a rule from examples, instead of you writing the rule yourself. The program that learns is called a **model**.',
    'Each example has **features** (what you measure) and a **label** (the answer). By habit, the features are called `X` and the labels `y`.',
    '`.fit(X, y)` trains the model on examples, and `.predict(X)` makes guesses for new ones.',
    'Keep some examples back as a **test**. `.score()` on them gives the share it gets right.',
    'Testing it on the examples it learned from would only test its memory.',
  ],
  example: {
    say: 'Here a model learns "small" and "big" from six numbers, then guesses and gets scored.',
    code: `from sklearn.neighbors import KNeighborsClassifier
X = [[1], [2], [3], [10], [11], [12]]
y = ["small", "small", "small", "big", "big", "big"]
model = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print(model.predict([[2.5], [9]]))
print(model.score([[4], [13]], ["small", "big"]))`,
    lines: [
      ['.fit(X, y)', 'learns from the six labelled examples.'],
      ['.predict([[2.5], [9]])', 'guesses for two new numbers: small, then big.'],
      ['.score(...)', 'the share right on two test examples: 1.0, both right.'],
    ],
  },
  brief: {
    story: 'A botanist wants a program that names an iris from its measurements.',
    get: [['The starter loads 150 irises (4 measurements each, and their kind) and splits them into training and test examples.']],
    want: ['`model`: a `KNeighborsClassifier()`, trained on the training examples', '`accuracy`: its score on the test examples'],
    out: '`accuracy` is a share between 0 and 1.',
  },
},
'ai-02': {
  explain: [
    'A **decision tree** learns a chain of yes-or-no questions, like "is the petal narrower than 0.75 cm?", until it reaches an answer.',
    '`max_depth` caps how many questions deep it can go.',
    'Too few and it can\'t tell the classes apart. Too many and it learns the training examples by heart, quirks and all.',
    '`plot_tree` draws what it learned, like a flowchart.',
    '`export_text` prints the same questions as text.',
  ],
  example: {
    say: 'Here a one-question tree learns who\'s tall enough, and prints its question.',
    code: `from sklearn.tree import DecisionTreeClassifier, export_text
X = [[150], [160], [170], [180], [190]]
y = ["no", "no", "yes", "yes", "yes"]
t = DecisionTreeClassifier(max_depth=1).fit(X, y)
print(export_text(t, feature_names=["height"]))`,
    lines: [
      ['max_depth=1', 'one question only.'],
      ['the question', 'height at most 165: no; above it: yes. Halfway between 160 and 170.'],
    ],
  },
  brief: {
    story: 'The botanist wants a model they can read, not just trust.',
    get: [STARTER_DATA, ['A tree one question deep is already trained.']],
    want: ['Let the tree go up to **3** questions deep', '`tree_acc`: its test score', 'Draw it with `plot_tree`'],
    out: 'A score and a drawing of the tree.',
  },
},
'ai-03': {
  explain: [
    'A nearest-neighbour model judges how alike two examples are by how far apart their numbers are.',
    'If one feature runs into the thousands and another stays below 5, the big one drowns out everything else.',
    '`StandardScaler` puts every feature on the same scale: 0 means average, and 1 means a typical distance from it.',
    '`make_pipeline(StandardScaler(), KNeighborsClassifier())` joins the two steps into one model.',
    'New examples then get scaled the same way before it guesses.',
  ],
  example: {
    say: 'Here two columns on very different scales end up on the same one.',
    code: `from sklearn.preprocessing import StandardScaler
data = np.array([[1000, 1.0], [2000, 2.0], [3000, 3.0]])
StandardScaler().fit_transform(data)`,
    lines: [
      ['the columns', 'one in thousands, one under 5.'],
      ['fit_transform', 'both become about −1.22, 0 and 1.22: the same scale.'],
    ],
  },
  brief: {
    story: 'A wine buyer wants to know which grower made a wine, from 13 measurements.',
    get: [['The starter loads 178 wines (13 measurements, 3 growers), splits them, and scores a plain nearest-neighbour model.']],
    want: ['`scaled`: a pipeline of `StandardScaler()` then `KNeighborsClassifier()`, trained on the same examples', '`scaled_acc`: its test score'],
    out: 'A score to compare with the plain one.',
  },
},
'ai-04': {
  explain: [
    'A score tells you how often a model is right, but not **where** it goes wrong.',
    'A **confusion matrix** does: one row for each true answer, one column for each guess.',
    'The diagonal holds the right guesses.',
    'Every number off the diagonal is a mistake. Row 8, column 1 means "an 8 that it read as a 1".',
    'Knowing which mistakes it makes tells you what to fix, and whether those mistakes even matter.',
  ],
  example: {
    say: 'Here five guesses about cats and dogs are laid out as a confusion matrix.',
    code: `from sklearn.metrics import confusion_matrix
true = ["cat", "cat", "dog", "dog", "dog"]
guess = ["cat", "dog", "dog", "dog", "cat"]
confusion_matrix(true, guess, labels=["cat", "dog"])`,
    lines: [
      ['row 1 (cat)', 'one cat called a cat, one called a dog.'],
      ['row 2 (dog)', 'one dog called a cat, two called dogs.'],
    ],
  },
  brief: {
    story: 'The post office wants to know which handwritten digits its reader muddles.',
    get: [['The starter loads 1,797 handwritten digits, trains a model, and makes `guess` for the test digits.']],
    want: ['`mistakes`: how many test digits it got wrong', 'Draw the confusion matrix with `ConfusionMatrixDisplay.from_predictions(y_test, guess)`'],
    out: 'A count and a coloured grid.',
  },
},
'ai-05': {
  explain: [
    'No model is best at everything, so try several on the same data and keep the winner.',
    'One split into train and test can just be lucky.',
    '`cross_val_score(model, X, y, cv=5)` cuts the data into 5 parts, and tests on each part in turn after training on the other four.',
    'You get 5 scores, and their average is fairer than any single one.',
    '`max(scores, key=scores.get)` gives the dict key with the highest value.',
  ],
  example: {
    say: 'Here one model is scored five ways on the irises.',
    code: `from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier
X, y = load_iris(return_X_y=True)
s = cross_val_score(DecisionTreeClassifier(random_state=0), X, y, cv=5)
print(s.round(3))
print(round(s.mean(), 3))`,
    lines: [
      ['cv=5', 'five rounds, each testing on a different fifth.'],
      ['s.mean()', 'the average of the five scores.'],
    ],
  },
  brief: {
    story: 'The wine buyer wants the best of five kinds of model, picked fairly.',
    get: [['The starter loads the wines and makes `models`: a dict of five named models.']],
    want: ["`scores`: a dict of each model's name and its average score over 5 folds", '`best`: the name of the winner'],
    out: 'A dict of five scores, and a name.',
  },
},
'ai-06': {
  explain: [
    'A neural network is built from simple units called **neurons**. Each one takes some numbers in and gives one number out.',
    'It multiplies each input by a **weight** (how much it matters), adds them up, and adds a **bias** (its starting lean).',
    '`np.dot(w, x)` does the multiplying and adding in one go.',
    'Then an **activation** squashes the total.',
    'The sigmoid, `1 / (1 + np.exp(-z))`, turns any number into one between 0 and 1, where near 1 means "yes".',
  ],
  example: {
    say: 'Here three totals go through the sigmoid.',
    code: `z = np.array([-4, 0, 4])
1 / (1 + np.exp(-z))`,
    lines: [
      ['-4', 'squashed to about 0.02: a firm no.'],
      ['0', 'exactly 0.5: can\'t tell.'],
      ['4', 'about 0.98: a firm yes.'],
    ],
  },
  brief: {
    story: 'The café wants a tiny "will it be busy?" neuron, to see how one works.',
    get: [['The starter sets `x` (temperature, weekend, rain), `w` (the weights), `b` (the bias) and `z`, the total.']],
    want: ['`output`: `z` squashed through the sigmoid'],
    out: 'A number between 0 and 1.',
  },
},
'ai-07': {
  explain: [
    'Nobody sets a real network\'s weights by hand. It **learns** them from examples.',
    'The simplest neuron that learns is called a **perceptron**. It guesses 1 or 0, then compares its guess with the right answer.',
    'Then it nudges each weight by `rate * error * input`. A right guess has an error of 0, so nothing moves.',
    'Go through the examples again and again. Each full pass is called an **epoch**.',
    'Bit by bit, the nudges add up to weights that get every example right.',
  ],
  example: {
    say: 'Here\'s one nudge, worked out by hand: the neuron said 0 when the answer was 1.',
    code: `w = np.array([0.0, 0.0])
x = np.array([1, 1])
error = 1 - 0
w = w + 0.1 * error * x
w`,
    lines: [
      ['error = 1 - 0', 'the right answer minus the guess.'],
      ['w + 0.1 * error * x', 'each weight moves up by 0.1, so next time the total is bigger.'],
    ],
  },
  brief: {
    story: 'Teach a single neuron the rule AND: answer 1 only when both inputs are 1.',
    get: [['The starter sets the four examples, the weights at zero, and the training loop.']],
    want: ['Inside the loop, nudge `w` by `rate * error * x`', 'and `b` by `rate * error`'],
    out: '`predictions` matches `target`: 0, 0, 0, 1.',
  },
},
'ai-08': {
  explain: [
    'Bigger networks learn by **gradient descent**.',
    'A **loss** measures how wrong the model is, and each step moves the weights a little way downhill, towards a smaller loss.',
    'The **learning rate** sets how big each step is.',
    'Too small and learning crawls along. Too big and every step overshoots the bottom, so the loss grows instead of shrinking.',
  ],
  example: {
    say: 'Here one number walks downhill towards 4, the bottom of (w − 4)², with a rate of 0.25.',
    code: `w = 0.0
for step in range(5):
    w = w - 0.25 * 2 * (w - 4)
    print(round(w, 3))`,
    lines: [
      ['2 * (w - 4)', 'the slope of the loss: which way is downhill, and how steep.'],
      ['w - 0.25 * ...', 'a step that way: 2, 3, 3.5, 3.75, 3.875, closing in on 4.'],
    ],
  },
  brief: {
    story: 'The training numbers explode instead of settling. Fix the step size.',
    get: [['The starter makes 50 points along the line 3x + 2, and a gradient descent loop with `rate = 1.0`.']],
    want: ['Find a learning rate that works, so after 200 steps `w` ends up near 3 and `b` near 2'],
    out: '`w` near 3, `b` near 2, and a small loss.',
  },
},
'ai-09': {
  explain: [
    'A **neural network** stacks neurons in layers. The inputs feed a **hidden layer**, and the hidden layer feeds the answer.',
    'Training runs gradient descent on every weight at once.',
    'Each digit here is an 8 × 8 picture: 64 numbers, one per square, from 0 (white) to 16 (black).',
    '`MLPClassifier(hidden_layer_sizes=(32,))` builds a network with one hidden layer of 32 neurons.',
    'More neurons can hold more patterns, but they take longer to train.',
  ],
  example: {
    say: 'Here\'s the first digit as the network sees it: an 8 by 8 grid of numbers.',
    code: `from sklearn.datasets import load_digits
digits = load_digits()
print(digits.target[0])
print(digits.images[0].astype(int))
print(digits.data[0].size, "inputs")`,
    lines: [
      ['digits.images[0]', 'the grid: higher numbers are darker squares. You can make out a 0.'],
      ['digits.data[0].size', 'the same grid laid flat: 64 inputs.'],
    ],
  },
  brief: {
    story: 'The post office wants a network that reads handwritten digits.',
    get: [['The starter loads the digits, shows six, and trains a network with 2 hidden neurons.']],
    want: ['Give the network **32** hidden neurons', '`accuracy` above 0.9'],
    out: '`accuracy` is a share above 0.9.',
  },
},
'ai-10': {
  explain: [
    'Networks that read pictures (**convolutional** networks) slide a small grid of weights, called a **filter**, across the image.',
    'At each spot, they multiply the filter by the pixels underneath it and add the lot up.',
    'A filter that\'s negative on its left and positive on its right gives a big number wherever dark turns to light. That\'s a vertical edge.',
    'Light turning to dark gives a big negative one.',
    'A real network learns its filters from examples, and its first layer usually ends up with edge-finders just like this.',
  ],
  example: {
    say: 'Here a three-number filter slides along one row of pixels: dark, then light, then dark again.',
    code: `signal = np.array([0, 0, 1, 1, 1, 0, 0])
k = np.array([-1, 0, 1])
[int((signal[i:i + 3] * k).sum()) for i in range(5)]`,
    lines: [
      ['signal[i:i + 3] * k', 'the three pixels under the filter, times the filter.'],
      ['the answers', '1 where dark turns light, −1 where light turns dark, 0 in the flat middle.'],
    ],
  },
  brief: {
    story: 'See how a picture-reading network finds edges.',
    get: [['The starter makes a 9 × 9 picture of a white square, the filter, and an empty `out`.']],
    want: ['At each spot, set `out[i, j]` to the filter times the patch, all added up'],
    out: 'Two pictures: the square, and its left and right edges lit up.',
  },
},
'ai-11': {
  explain: [
    'So far, every model has learned from examples with answers. That\'s **supervised** learning.',
    '**Unsupervised** learning only gets the measurements, and looks for groups by itself.',
    '**k-means** puts down k centre points, gives each example to its nearest centre, moves each centre to the middle of its group, and repeats.',
    'You choose k.',
    'The groups don\'t come with names, so compare them with real labels when you have some.',
  ],
  example: {
    say: 'Here six numbers fall into two groups, found without any labels.',
    code: `from sklearn.cluster import KMeans
pts = np.array([[1], [2], [3], [20], [21], [22]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(pts)
print(km.labels_)
print(km.cluster_centers_.ravel())`,
    lines: [
      ['km.labels_', 'which group each point landed in.'],
      ['cluster_centers_', 'the middle of each group: 21 and 2. The group numbers are only names.'],
    ],
  },
  brief: {
    story: 'If nobody had labelled the irises, could a model still find the kinds?',
    get: [['The starter loads the iris measurements (no labels) and keeps the real kinds aside in `kinds`.']],
    want: ['Ask k-means for **3** groups', '`table`: a crosstab of the groups against the real kinds'],
    out: 'A 3 × 3 table.',
  },
},
'ai-12': {
  explain: [
    'Each digit is 64 numbers, and nobody can picture 64 dimensions.',
    '**PCA** (principal component analysis) finds the few directions along which the data spreads out most.',
    'Keep the top two, and every example becomes a point on a flat chart.',
    '`explained_variance_ratio_` tells you how much of the spread each direction keeps.',
    'If the same digits land together, the 64 numbers really do hold whatever makes a 3 a 3.',
  ],
  example: {
    say: 'Here four points that lie almost on a line are squashed to one number each.',
    code: `from sklearn.decomposition import PCA
pts = np.array([[1, 2], [2, 4], [3, 6], [4, 8.5]])
p = PCA(n_components=1).fit(pts)
p.explained_variance_ratio_.round(3)`,
    lines: [
      ['n_components=1', 'keep just one direction.'],
      ['the ratio', '1.0 to 3 places: one direction keeps practically all of the spread.'],
    ],
  },
  brief: {
    story: 'Show, in one picture, whether the digits really are different from each other.',
    get: [['The starter loads the digits: 1,797 of them, 64 numbers each.']],
    want: ['`pca` with 2 components', '`points`: the digits squashed to 2 numbers each', 'A scatter of them, coloured by `digits.target`, with a colour bar'],
    out: 'One coloured scatter.',
  },
},
'ai-13': {
  explain: [
    'Models only take numbers, so text has to become numbers first.',
    'The simplest way is a **bag of words**: count how often each word appears, and forget the order.',
    '`CountVectorizer` learns the vocabulary, then turns each text into a row of counts, one column per word.',
    '`get_feature_names_out()` lists the words, in column order.',
    'Words like "the" and "and" say very little. They\'re **stop words**, and `stop_words="english"` leaves them out.',
  ],
  example: {
    say: 'Here two short sentences become rows of word counts.',
    code: `from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer(stop_words="english")
m = vec.fit_transform(["The latte was hot", "The tea was hot and sweet"])
print(vec.get_feature_names_out())
print(m.toarray())`,
    lines: [
      ['stop_words="english"', 'the, was and and are left out.'],
      ['m.toarray()', 'one row per sentence, one column per word: hot is in both.'],
    ],
  },
  brief: {
    story: 'The café wants to know what customers talk about most.',
    get: [['`reviews` has 40 short reviews, with `text` and `mood` (happy or unhappy).']],
    want: ['Make `vec` leave out the English stop words', '`top_word`: the word used most across all 40 reviews'],
    out: 'One word.',
  },
},
'ai-14': {
  explain: [
    '**Sentiment analysis** reads a piece of text and says whether it sounds positive or negative.',
    '**Naive Bayes** is a quick, classic choice for text.',
    'It learns how often each word turns up in happy texts and in unhappy ones, then weighs up the words in a new one.',
    'A pipeline turns text into counts and hands them to the model, so it can read plain sentences.',
    'Any word it never saw while training, it simply ignores.',
  ],
  example: {
    say: 'Here a model learns from four tiny reviews, then reads two new ones.',
    code: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
texts = ["great coffee", "lovely cake", "awful wait", "rude staff"]
moods = ["happy", "happy", "unhappy", "unhappy"]
m = make_pipeline(CountVectorizer(), MultinomialNB()).fit(texts, moods)
m.predict(["great cake", "awful staff"])`,
    lines: [
      ['.fit(texts, moods)', 'learns which words go with which mood.'],
      ['.predict([...])', 'great cake sounds happy, and awful staff unhappy.'],
    ],
  },
  brief: {
    story: 'The café wants new reviews sorted into happy and unhappy automatically.',
    get: [['`reviews` has 40 reviews with `text` and `mood`. The starter makes `model` and two `new` reviews.']],
    want: ['Train `model` on the review texts and their moods', '`guesses`: what it says about the two `new` reviews'],
    out: 'Two moods.',
  },
},
'ai-15': {
  explain: [
    '**Reinforcement learning** has no answers to copy. An agent tries actions, now and then gets a **reward**, and learns which actions pay off.',
    '**Q-learning** keeps a score for every place and action, in a table called `Q`.',
    'After each step, the score moves towards the reward plus the best score of the place it landed: `reward + gamma * Q[s2].max()`.',
    '`alpha` sets how far it moves each time.',
    '`gamma`, just under 1, makes far-off rewards count a little less, so the reward spreads back along the path.',
  ],
  example: {
    say: 'Here\'s one Q-learning update, worked out by hand.',
    code: `Q = 0.0
reward, best_next = 0, 0.8
alpha, gamma = 0.5, 0.9
Q = round(Q + alpha * (reward + gamma * best_next - Q), 3)
Q`,
    lines: [
      ['reward + gamma * best_next', 'what the move looks worth: 0 now, plus 0.9 × 0.8 later.'],
      ['Q + alpha * (... - Q)', 'Q moves halfway towards that: 0.36.'],
    ],
  },
  brief: {
    story: 'A robot waiter has to learn the way from table 0 to the kitchen at place 5.',
    get: [['The starter sets up `Q`, the settings and the trial-and-error loop.']],
    want: ['Add the learning line: move `Q[s, a]` towards `reward + gamma * Q[s2].max()`, by the fraction `alpha`'],
    out: 'The policy says "right" at every table.',
  },
},
'ai-16': {
  explain: [
    'A model can score perfectly on its training examples and still do worse on new ones.',
    'It\'s learned them **by heart**, noise and all. This is **overfitting**.',
    'So compare the **training** score with the **test** score. A big gap is the warning sign.',
    'Holding the model back, with a smaller `max_depth`, makes it learn the general shape instead of every stray point.',
    'Hold it back too far, though, and it misses the shape as well. That\'s **underfitting**.',
  ],
  example: {
    say: 'Here a tree with no depth limit learns noisy data, and is scored on both sets.',
    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = make_classification(n_samples=200, n_features=5, flip_y=0.3, random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)
t = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)
print(t.score(X_tr, y_tr), round(t.score(X_te, y_te), 3))`,
    lines: [
      ['flip_y=0.3', 'about 30% of the labels are flipped at random: noise.'],
      ['the two scores', 'perfect on its own examples, much worse on new ones: overfitting.'],
    ],
  },
  brief: {
    story: 'A model looks perfect in testing on its own data. Check it properly.',
    get: [['The starter makes 400 noisy points in two crescents, splits them, and trains `deep`, a tree with no depth limit.']],
    want: ["`train_acc` and `test_acc`: `deep`'s training and test scores", '`train_scores` and `test_scores`: dicts of score by `max_depth` 1 to 12', 'Draw both against depth with a legend', '`best_depth`: the depth with the highest test score'],
    out: 'Two scores, two dicts, a chart and a depth.',
  },
},
'ai-17': {
  explain: [
    'Lots of models can tell you how sure they are.',
    '`predict_proba(X)` gives each example a **probability** for every class: numbers between 0 and 1 that add up to 1.',
    '**Logistic regression** is a simple, popular model that works this way.',
    'It weighs up the features, adds them together, and squashes the total into a probability.',
    'So you can act when the model\'s confident, and hand the unsure cases to a person.',
  ],
  example: {
    say: 'Here a model learns from six numbers, then gives its probabilities for three new ones.',
    code: `from sklearn.linear_model import LogisticRegression
X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 0, 1, 1, 1]
m = LogisticRegression().fit(X, y)
m.predict_proba([[1], [3.5], [6]]).round(2)`,
    lines: [
      ['[1]', 'fairly sure it is a 0.'],
      ['[3.5]', 'right on the boundary: about 50/50.'],
      ['[6]', 'fairly sure it is a 1.'],
    ],
  },
  brief: {
    story: 'The post office wants the reader to pass the doubtful digits to a person.',
    get: [['The starter loads the digits and trains a logistic regression.']],
    want: ["`probs`: the model's probabilities for every test digit", '`confidence`: the highest probability for each', '`unsure`: True where that is below 0.9', '`sure_acc` and `unsure_acc`: the share right among the sure and the unsure'],
    out: 'The sure digits are right far more often than the unsure ones.',
  },
},
'ai-18': {
  explain: [
    'One decision tree is quick and easy to read, but jumpy. Change the training examples a little and it can learn quite different questions.',
    'A **random forest** trains lots of trees, each on a random resample of the examples, then lets them vote.',
    'Their mistakes tend to cancel each other out.',
    'Many varied models voting together is called an **ensemble**, and it often beats any single one.',
    '`n_estimators` sets how many trees there are.',
  ],
  example: {
    say: 'Here a forest of three trees is opened up, and each tree votes on the first iris.',
    code: `from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
X, y = load_iris(return_X_y=True)
f = RandomForestClassifier(n_estimators=3, random_state=0).fit(X, y)
print(len(f.estimators_), "trees")
print([int(t.predict(X[:1])[0]) for t in f.estimators_], f.predict(X[:1]))`,
    lines: [
      ['f.estimators_', 'the trees inside the forest.'],
      ['each tree\'s vote', 'and then the forest\'s answer, from the votes.'],
    ],
  },
  brief: {
    story: 'The post office wonders whether many trees beat one.',
    get: [['The starter loads the digits and scores one decision tree as `tree_acc`.']],
    want: ['`forest`: a `RandomForestClassifier` with 100 trees and `random_state=0`', '`forest_acc`: its test score', '`few_acc`: the test score of a forest of 5 trees'],
    out: 'Three scores to compare.',
  },
},
'ai-19': {
  explain: [
    '`feature_importances_` gives each feature a share of the credit, and the shares add up to 1.',
    'It tells you which features a tree or forest leaned on most.',
    'It\'s a quick way to learn about the data itself: which measurements really tell the classes apart.',
    'Treat it as a clue, though, not proof.',
    'When two features carry the same information, the credit gets split between them, and both look less important than they really are.',
  ],
  example: {
    say: 'Here one feature decides the answer and the other is just noise.',
    code: `from sklearn.tree import DecisionTreeClassifier
X = pd.DataFrame({"useful": [1, 2, 3, 4, 5, 6], "noise": [3, 1, 3, 1, 3, 1]})
y = [0, 0, 0, 1, 1, 1]
t = DecisionTreeClassifier(random_state=0).fit(X, y)
pd.Series(t.feature_importances_, index=X.columns)`,
    lines: [
      ['useful', 'splits the answers perfectly, so it gets all the credit: 1.0.'],
      ['noise', 'never asked about: 0.'],
    ],
  },
  brief: {
    story: 'The wine buyer wants to know which measurements matter most.',
    get: [['The starter loads the wines and trains `forest`.']],
    want: ['`importance`: a Series of `forest.feature_importances_` with the feature names as its index, sorted biggest first', '`top3`: a list of the 3 most important names', 'A horizontal bar chart of `importance`'],
    out: 'A sorted Series, a list and a chart.',
  },
},
'ai-20': {
  explain: [
    'Settings you choose before training, like `n_neighbors` or `max_depth`, are called **hyperparameters**.',
    'The best values depend on the data, so you try a few.',
    '`GridSearchCV(model, grid, cv=5)` tries every combination in the grid, scores each with 5-fold cross-validation, and keeps the winner.',
    'After `.fit`, `best_params_` holds the winning settings and `best_score_` their average score.',
    'Judge the final model on test examples the search never saw.',
  ],
  example: {
    say: 'Here four tree depths are tried on the irises, and the best is kept.',
    code: `from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
X, y = load_iris(return_X_y=True)
s = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth": [1, 2, 3, 4]}, cv=5).fit(X, y)
print(s.best_params_, round(s.best_score_, 3))`,
    lines: [
      ['{"max_depth": [1, 2, 3, 4]}', 'the settings to try.'],
      ['best_params_, best_score_', 'the winner and its average score.'],
    ],
  },
  brief: {
    story: 'The post office wants the best settings for its nearest-neighbour reader.',
    get: [['The starter loads the digits, splits them, and makes `grid`: 5 neighbour counts by 2 weightings.']],
    want: ['`search`: a `GridSearchCV` of `KNeighborsClassifier()` over `grid`, with `cv=5`, trained on the training digits', '`best`: its `best_params_`', '`final_acc`: its score on the test digits'],
    out: 'A dict of settings, and a score.',
  },
},
};
