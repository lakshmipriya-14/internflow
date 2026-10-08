from pydantic import BaseModel


class StatusCount(BaseModel):
    saved: int = 0
    applied: int = 0
    screening: int = 0
    interviewing: int = 0
    offered: int = 0
    rejected: int = 0
    withdrawn: int = 0
    total: int = 0


class AnalyticsSummaryResponse(BaseModel):
    total_applications: int
    conversion_rate: float  # (interviews + offers) / total * 100
    offer_rate: float  # offers / total * 100
    average_match_score: float
    status_counts: StatusCount
    upcoming_followups: int


class SkillGapItem(BaseModel):
    skill: str
    frequency_in_jobs: int
    is_in_profile: bool


class SkillGapResponse(BaseModel):
    matching_skills_count: int
    missing_top_skills: list[SkillGapItem]
    profile_completion_percentage: int
