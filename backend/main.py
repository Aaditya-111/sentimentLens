from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI(title="SentimentLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_tfidf_pipeline = None
_bert_pipeline  = None

def get_tfidf():
    global _tfidf_pipeline
    if _tfidf_pipeline is None:
        import joblib, os
        path = os.path.join(os.path.dirname(__file__), "tfidf_model.joblib")
        _tfidf_pipeline = joblib.load(path)
    return _tfidf_pipeline

def get_bert():
    global _bert_pipeline
    if _bert_pipeline is None:
        from transformers import pipeline
        _bert_pipeline = pipeline(
            "text-classification",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            truncation=True,
            max_length=512,
        )
    return _bert_pipeline

class ReviewRequest(BaseModel):
    text: str

class PredictionResult(BaseModel):
    label: str
    confidence: float
    latency_ms: float

class AnalysisResponse(BaseModel):
    tfidf: PredictionResult
    bert:  PredictionResult
    text:  str

LABEL_MAP = {"POSITIVE": "POSITIVE", "NEGATIVE": "NEGATIVE"}

def clean(text: str) -> str:
    import re, html
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

@app.get("/")
def root():
    return {"status": "ok", "message": "SentimentLens API running"}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(req: ReviewRequest):
    text = clean(req.text)

    t0 = time.perf_counter()
    pipe = get_tfidf()
    proba = pipe.predict_proba([text])[0]
    tfidf_label = "POSITIVE" if proba[1] >= 0.5 else "NEGATIVE"
    tfidf_conf  = float(max(proba))
    tfidf_ms    = (time.perf_counter() - t0) * 1000

    t1 = time.perf_counter()
    bert_out   = get_bert()(text)[0]
    bert_label = LABEL_MAP[bert_out["label"]]
    bert_conf  = float(bert_out["score"])
    bert_ms    = (time.perf_counter() - t1) * 1000

    return AnalysisResponse(
        text=text,
        tfidf=PredictionResult(label=tfidf_label, confidence=tfidf_conf, latency_ms=round(tfidf_ms, 1)),
        bert =PredictionResult(label=bert_label,  confidence=bert_conf,  latency_ms=round(bert_ms,  1)),
    )

@app.get("/health")
def health():
    return {"status": "healthy"}