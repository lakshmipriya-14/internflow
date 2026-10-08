from fastapi import APIRouter, HTTPException, Query
from app.core.deps import CurrentUser, DbSession
from app.schemas.internship import (
    InternshipCreate,
    InternshipMatchResponse,
    InternshipResponse,
)
from app.services import ai_service, internship_service, profile_service, live_fetcher

router = APIRouter(prefix="/internships", tags=["Internships"])


@router.get("/live")
async def list_live_internships(
    db: DbSession,
    current_user: CurrentUser,
    query: str | None = Query(None, description="Search query for live postings"),
    work_mode: str | None = Query(None, description="Filter by Remote, Hybrid, Onsite"),
):
    """Dynamically fetches real-time live internships from web APIs and scores them with AI."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    live_items = await live_fetcher.fetch_live_internships(
        query=query,
        work_mode=work_mode,
        user_skills=profile.skills,
        limit=15
    )
    return live_items


@router.get("", response_model=list[InternshipResponse])
def list_internships(
    db: DbSession,
    current_user: CurrentUser,
    query: str | None = Query(None, description="Search query for title, company, or description"),
    work_mode: str | None = Query(None, description="Filter by Remote, Hybrid, Onsite"),
    skill: str | None = Query(None, description="Filter by required skill"),
):
    """List available internships with optional search and filters."""
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    internships = internship_service.get_internships(db, query=query, work_mode=work_mode, skill=skill)
    
    # Enrich response with AI match score against user profile
    result = []
    for item in internships:
        match_data = ai_service.calculate_match_score(
            user_skills_str=profile.skills,
            required_skills_str=item.required_skills,
            job_description=item.description
        )
        res_dict = InternshipResponse.model_validate(item).model_dump()
        res_dict["match_score"] = match_data["match_score"]
        result.append(InternshipResponse(**res_dict))

    return result


@router.get("/{internship_id}", response_model=InternshipResponse)
def get_internship(internship_id: int, db: DbSession, current_user: CurrentUser):
    """Get single internship details by ID."""
    item = internship_service.get_internship_by_id(db, internship_id)
    if not item:
        raise HTTPException(status_code=404, detail="Internship not found")
    return item


@router.post("/{internship_id}/match", response_model=InternshipMatchResponse)
def match_internship(internship_id: int, db: DbSession, current_user: CurrentUser):
    """Calculate detailed AI match score, matching skills, and missing skills for an internship."""
    item = internship_service.get_internship_by_id(db, internship_id)
    if not item:
        raise HTTPException(status_code=404, detail="Internship not found")
    
    profile = profile_service.get_profile_by_user_id(db, current_user.id)
    match_data = ai_service.calculate_match_score(
        user_skills_str=profile.skills,
        required_skills_str=item.required_skills,
        job_description=item.description
    )

    return InternshipMatchResponse(
        internship=InternshipResponse.model_validate(item),
        match_score=match_data["match_score"],
        matching_skills=match_data["matching_skills"],
        missing_skills=match_data["missing_skills"],
        recommendation=match_data["recommendation"]
    )


@router.post("", response_model=InternshipResponse, status_code=201)
def create_internship(payload: InternshipCreate, db: DbSession, current_user: CurrentUser):
    """Post a new internship listing."""
    return internship_service.create_internship(db, payload)
