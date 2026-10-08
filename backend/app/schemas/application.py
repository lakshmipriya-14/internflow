from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.internship import InternshipResponse


class ApplicationCreate(BaseModel):
    internship_id: int | None = None
    company_name: str
    role_title: str
    status: str = "saved"
    applied_date: str | None = None
    follow_up_date: str | None = None
    notes: str | None = None
    recruiter_email: str | None = None


class ApplicationUpdate(BaseModel):
    status: str | None = None
    applied_date: str | None = None
    follow_up_date: str | None = None
    notes: str | None = None
    recruiter_email: str | None = None
    tailored_resume_summary: str | None = None
    generated_cover_letter: str | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    internship_id: int | None = None
    company_name: str
    role_title: str
    status: str
    match_score: int | None = 0
    applied_date: str | None = None
    follow_up_date: str | None = None
    notes: str | None = None
    tailored_resume_summary: str | None = None
    generated_cover_letter: str | None = None
    recruiter_email: str | None = None
    created_at: datetime
    updated_at: datetime
    internship: InternshipResponse | None = None
