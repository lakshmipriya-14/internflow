import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, analytics, applications, auth, health, internships, profile
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.database.base import Base
from app.database.session import engine

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s] %(message)s")

# Ensure all database tables are created on startup
Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI(
        title=f"{settings.APP_NAME} API",
        version="1.0.0",
        description="Backend for InternFlow AI - Intelligent Internship Application Agent.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for dev/frontend connection
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(internships.router)
    app.include_router(applications.router)
    app.include_router(ai.router)
    app.include_router(analytics.router)

    @app.get("/", include_in_schema=False)
    def root():
        return {"message": f"{settings.APP_NAME} API is running. Interactive Docs at /docs"}

    return app


app = create_app()
