from fastapi import APIRouter, HTTPException
from app.core.deps import CurrentUser, DbSession
from app.schemas.ai import (
    ColdEmailRequest,
    ColdEmailResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    InterviewPrepEvalRequest,
    InterviewPrepEvalResponse,
    InterviewPrepGenRequest,
    InterviewPrepGenResponse,
    MatchScoreRequest,
    MatchScoreResponse,
    QuestionItem,
    TailoredResumeRequest,
    TailoredResumeResponse,
)
from app.services import ai_service, internship_service, profile_service

router = APIRouter(prefix="/ai", tags=["AI Copilot Services"])


def _require_personal_resume(profile):
    if not profile.resume_text or not profile.resume_text.strip():
        raise HTTPException(status_code=400, detail="Upload or add your resume in your profile before generating application materials.")
    if not profile.skills or not profile.skills.strip():
        raise HTTPException(status_code=400, detail="Add your technical skills in your profile before generating application materials.")


@router.post("/match-score", response_model=MatchScoreResponse)
def compute_match_score(payload: MatchScoreRequest, db: DbSession, current_user: CurrentUser):
    """Compute AI match score between student's profile and any job description/skills."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    
    req_skills = payload.required_skills
    job_desc = payload.job_description
    
    if payload.internship_id:
        internship = internship_service.get_internship_by_id(db, payload.internship_id)
        if internship:
            req_skills = internship.required_skills
            job_desc = internship.description

    res = ai_service.calculate_match_score(
        user_skills_str=profile.skills,
        required_skills_str=req_skills,
        job_description=job_desc
    )
    return MatchScoreResponse(**res)


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
def generate_cover_letter(payload: CoverLetterRequest, db: DbSession, current_user: CurrentUser):
    """Generate a customized, role-tailored cover letter based on student profile."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    _require_personal_resume(profile)
    res = ai_service.generate_cover_letter(
        profile=profile,
        company_name=payload.company_name,
        role_title=payload.role_title,
        tone=payload.tone
    )
    return CoverLetterResponse(**res)


@router.post("/generate-cold-email", response_model=ColdEmailResponse)
def generate_cold_email(payload: ColdEmailRequest, db: DbSession, current_user: CurrentUser):
    """Generate a concise cold outreach email to recruiters."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    _require_personal_resume(profile)
    res = ai_service.generate_cold_email(
        profile=profile,
        recruiter_name=payload.recruiter_name or "Hiring Manager",
        company_name=payload.company_name,
        role_title=payload.role_title,
        tone=payload.tone
    )
    return ColdEmailResponse(**res)


@router.post("/interview-prep/generate", response_model=InterviewPrepGenResponse)
def generate_interview_questions(payload: InterviewPrepGenRequest, current_user: CurrentUser):
    """Generate role-specific technical and behavioral interview questions."""
    q_list = ai_service.generate_interview_questions(
        role_title=payload.role_title,
        category=payload.category,
        count=payload.count
    )
    items = [QuestionItem(**q) for q in q_list]
    return InterviewPrepGenResponse(role_title=payload.role_title, questions=items)


@router.post("/interview-prep/evaluate", response_model=InterviewPrepEvalResponse)
def evaluate_interview_answer(payload: InterviewPrepEvalRequest, current_user: CurrentUser):
    """Evaluate candidate's interview answer and provide STAR framework score and feedback."""
    res = ai_service.evaluate_interview_answer(
        question=payload.question,
        user_answer=payload.user_answer
    )
    return InterviewPrepEvalResponse(**res)


@router.post("/generate-resume", response_model=TailoredResumeResponse)
def generate_tailored_resume(payload: TailoredResumeRequest, db: DbSession, current_user: CurrentUser):
    """Dynamically generate a company/role-tailored ATS-optimized resume."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    _require_personal_resume(profile)
    res = ai_service.generate_tailored_resume(
        profile=profile,
        company_name=payload.company_name,
        role_title=payload.role_title,
        target_skills=payload.target_skills
    )
    return TailoredResumeResponse(**res)
