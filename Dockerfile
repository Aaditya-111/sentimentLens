FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn[standard] fastapi python-multipart

COPY backend/train.py ./train.py
COPY backend/main.py ./main.py
COPY static ./static
COPY app.py .

# Train model during build
RUN python train.py

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]