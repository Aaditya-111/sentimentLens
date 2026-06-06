import re, html, time, os, joblib
from datasets import load_dataset
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

print("Loading dataset...")
ds = load_dataset("fancyzhx/amazon_polarity")
train_ds = ds["train"].shuffle(seed=42).select(range(50_000))
test_ds  = ds["test"].shuffle(seed=42).select(range(5_000))

def clean(text):
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()

X_train = [clean(r) for r in train_ds["content"]]
y_train = train_ds["label"]
X_test  = [clean(r) for r in test_ds["content"]]
y_test  = test_ds["label"]

print("Training...")
t0 = time.time()
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=100_000,
        sublinear_tf=True,
        min_df=2,
    )),
    ("clf", LogisticRegression(
        C=5.0,
        max_iter=1000,
        solver="saga",
        n_jobs=-1,
    )),
])
pipeline.fit(X_train, y_train)
print(f"Done in {time.time()-t0:.1f}s")

preds = pipeline.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds):.4f}")
print(classification_report(y_test, preds, target_names=["NEGATIVE", "POSITIVE"]))

out = os.path.join(os.path.dirname(__file__), "tfidf_model.joblib")
joblib.dump(pipeline, out)
print(f"Saved → {out}")