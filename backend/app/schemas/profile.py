from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProfileUpdate(BaseModel):
    phone: str | None = None
    location: str | None = None
    college: str | None = None
    degree: str | None = None
    department: str | None = None
    current_year: int | None = None
    graduation_year: int | None = None
    cgpa: Decimal | None = None
    skills: str | None = None
    bio: str | None = None
    experience_summary: str | None = None
    target_roles: str | None = None
    preferred_locations: str | None = None
    desired_min_stipend: int | None = None
    resume_text: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    phone: str | None = None
    location: str | None = None
    college: str | None = None
    degree: str | None = None
    department: str | None = None
    current_year: int | None = None
    graduation_year: int | None = None
    cgpa: Decimal | None = None
    skills: str | None = None
    bio: str | None = None
    experience_summary: str | None = None
    target_roles: str | None = None
    preferred_locations: str | None = None
    desired_min_stipend: int | None = None
    resume_text: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None


class ResumeParseRequest(BaseModel):
    resume_text: str


class ResumeParseResponse(BaseModel):
    extracted_skills: list[str]
    suggested_bio: str
    suggested_roles: list[str]
    word_count: int
