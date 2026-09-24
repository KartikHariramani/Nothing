import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.seeds.seed_data import seed_database
from app.services.telegram_service import telegram_service
from app.services.worker_service import production_worker

# Routers
from app.api.auth import router as auth_router
from app.api.campaigns import router as campaigns_router
from app.api.registrations import router as registrations_router
from app.api.consent import router as consent_router
from app.api.predictions import router as predictions_router
from app.api.queue import router as queue_router
from app.api.telegram import router as telegram_router
from app.api.attendance import router as attendance_router
from app.api.analytics import router as analytics_router
from app.api.audit import router as audit_router
from app.api.ai_assistant import router as ai_assistant_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial baseline fixtures if not initialized
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Start live Telegram Bot Polling Worker & Background Automation Worker
    polling_task = asyncio.create_task(telegram_service.start_polling_loop())
    worker_task = asyncio.create_task(production_worker.start())
        
    yield

    # Cleanup
    telegram_service.stop_polling()
    production_worker.stop()
    polling_task.cancel()
    worker_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Life Share: Intelligent Blood Donation Mobilisation & Turnout Platform API",
    lifespan=lifespan
)

# CORS Middleware supporting custom domains and netlify preview apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://([a-zA-Z0-9_-]+\.)?netlify\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(campaigns_router, prefix=settings.API_V1_STR)
app.include_router(registrations_router, prefix=settings.API_V1_STR)
app.include_router(consent_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR)
app.include_router(queue_router, prefix=settings.API_V1_STR)
app.include_router(telegram_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "Life Share",
        "tagline": "Connecting People. Mobilising Blood. Saving Lives.",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
