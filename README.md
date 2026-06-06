---
title: SentimentLens
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_file: app.py
pinned: false
---

# 🧠 SentimentLens — TF-IDF vs Fine-tuned DistilBERT

> NLP research project: Systematically comparing classical ML against transformer models on Amazon product reviews, with failure analysis.

**Built for:** Amazon ML Summer School Application  
**Stack:** Python · FastAPI · HuggingFace Transformers · Scikit-learn · React · Vite

---

## 📊 Results

| Model                        | Accuracy | F1 Score |
| ---------------------------- | -------- | -------- |
| TF-IDF + Logistic Regression | 89.35%   | 0.90     |
| Fine-tuned DistilBERT        | 91.70%   | 0.92     |

---

## 🔍 Key Research Finding

Mixed-opinion reviews remain **unsolvable** under binary classification.  
Both models perform at ~45% accuracy on reviews containing both positive and negative aspects — suggesting binary sentiment labels are fundamentally insufficient for nuanced text.

### Error Analysis by Category

| Category      | TF-IDF Error | BERT Error |
| ------------- | ------------ | ---------- |
| Negation      | 5.1%         | 20.4%      |
| Mixed Opinion | 11.9%        | 54.9%      |
| Very Long     | 9.6%         | 48.9%      |
| Normal        | 10.5%        | 51.1%      |

---

## 🚀 Quick Start

### 1. Train the model

```bash
cd backend
pip install -r requirements.txt
python train.py
```
