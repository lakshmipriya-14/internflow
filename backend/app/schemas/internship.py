from datetime import datetime
from pydantic import BaseModel, ConfigDict


class InternshipBase(BaseModel):
    title: str
    company: str
    location: str = "Remote"
    work_mode: str = "Remote"
    stipend_amount: str | None = None
    description: str
    required_skills: str
    experience_level: str = "All Students"
    deadline: str | None = None
    source_url: str | None = None


class InternshipCreate(InternshipBase):
    pass


class InternshipResponse(InternshipBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    match_score: int | None = None


class InternshipMatchResponse(BaseModel):
    internship: InternshipResponse
    match_score: int
    matching_skills: list[str]
    missing_skills: list[str]
    recommendation: str
