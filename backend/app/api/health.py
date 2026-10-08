from fastapi import APIRouter, Response
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.deps import DbSession

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(response: Response, db: DbSession):
    try:
        db.execute(text("SELECT 1"))
        database = "connected"
    except SQLAlchemyError:
        response.status_code = 503
        database = "unavailable"
    return {
        "status": "ok" if database == "connected" else "degraded",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": database,
    }
