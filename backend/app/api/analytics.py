from fastapi import APIRouter
from app.core.deps import CurrentUser, DbSession
from app.schemas.analytics import AnalyticsSummaryResponse, SkillGapResponse
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: DbSession, current_user: CurrentUser):
    """Retrieve funnel metrics, conversion rate, and status breakdown."""
    return analytics_service.get_analytics_summary(db, current_user.id)


@router.get("/skill-gaps", response_model=SkillGapResponse)
def get_skill_gaps(db: DbSession, current_user: CurrentUser):
    """Identify missing top in-demand market skills vs candidate profile."""
    return analytics_service.get_skill_gaps(db, current_user.id)
