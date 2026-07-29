from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from contextlib import asynccontextmanager
import os

from .database import connect_db, close_db
from .config import settings
from .routes import weather, flood, sos, recommendations, agents, mission_report, settings as settings_router, updates, gemini, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    os.makedirs("uploads", exist_ok=True)
    yield
    await close_db()


app = FastAPI(
    title="HydroShield API",
    description="AI Powered Flood Management System — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static file serving for SOS uploads ──────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Register Routes ──────────────────────────────────────
app.include_router(weather.router, prefix="/api")
app.include_router(flood.router, prefix="/api")
app.include_router(sos.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(mission_report.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(updates.router, prefix="/api")
app.include_router(gemini.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


# Serve built frontend static assets if dist exists
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "app": "HydroShield",
            "version": "1.0.0",
            "status": "operational",
            "docs": "/docs",
        }
