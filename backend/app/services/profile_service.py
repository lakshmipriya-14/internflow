from sqlalchemy.orm import Session
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.profile import ProfileUpdate


def get_profile_by_user_id(db: Session, user_id: int) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(db: Session, user_id: int, payload: ProfileUpdate) -> StudentProfile:
    profile = get_profile_by_user_id(db, user_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
