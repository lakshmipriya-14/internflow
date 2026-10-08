from datetime import datetime
from sqlalchemy.orm import Session
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.services import ai_service
from app.services.profile_service import get_profile_by_user_id


def get_user_applications(db: Session, user_id: int, status: str | None = None) -> list[Application]:
    q = db.query(Application).filter(Application.user_id == user_id)
    if status and status.lower() != "all":
        q = q.filter(Application.status == status.lower())
    return q.order_by(Application.updated_at.desc()).all()


def create_application(db: Session, user_id: int, payload: ApplicationCreate) -> Application:
    profile = get_profile_by_user_id(db, user_id)
    
    # Calculate initial match score if internship or skills available
    match_res = ai_service.calculate_match_score(
        user_skills_str=profile.skills,
        required_skills_str=payload.role_title
    )
    score = match_res["match_score"]

    app = Application(
        user_id=user_id,
        internship_id=payload.internship_id,
        company_name=payload.company_name,
        role_title=payload.role_title,
        status=payload.status or "saved",
        match_score=score,
        applied_date=payload.applied_date or datetime.now().strftime("%Y-%m-%d"),
        follow_up_date=payload.follow_up_date,
        notes=payload.notes,
        recruiter_email=payload.recruiter_email
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def update_application(db: Session, user_id: int, application_id: int, payload: ApplicationUpdate) -> Application | None:
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()

    if not app:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    return app


def delete_application(db: Session, user_id: int, application_id: int) -> bool:
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()

    if not app:
        return False

    db.delete(app)
    db.commit()
    return True
