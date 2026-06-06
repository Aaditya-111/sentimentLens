import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from main import app as api_app

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.mount("/api", api_app)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# Serve assets folder
app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

# Serve index.html for everything else
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))