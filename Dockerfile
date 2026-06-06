# Stage 1: Build the React frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn[standard] fastapi python-multipart

COPY backend/train.py ./train.py
COPY backend/main.py ./main.py
COPY app.py .

# Copy the built frontend assets directly from Stage 1 into the static directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Train model during build
RUN python train.py

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]