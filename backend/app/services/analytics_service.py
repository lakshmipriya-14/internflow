from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.internship import Internship
from app.services.profile_service import get_profile_by_user_id
from app.services.ai_service import COMMON_SKILLS, extract_skills_from_text


def get_analytics_summary(db: Session, user_id: int) -> dict:
    apps = db.query(Application).filter(Application.user_id == user_id).all()
    
    counts = {
        "saved": 0,
        "applied": 0,
        "screening": 0,
        "interviewing": 0,
        "offered": 0,
        "rejected": 0,
        "withdrawn": 0,
        "total": len(apps)
    }

    match_scores = []
    upcoming_followups = 0

    for a in apps:
        st = a.status.lower() if a.status else "saved"
        if st in counts:
            counts[st] += 1
        if a.match_score:
            match_scores.append(a.match_score)
        if a.follow_up_date:
            upcoming_followups += 1

    total = len(apps)
    interviews_and_offers = counts["interviewing"] + counts["offered"]
    conversion_rate = round((interviews_and_offers / total * 100), 1) if total > 0 else 0.0
    offer_rate = round((counts["offered"] / total * 100), 1) if total > 0 else 0.0
    avg_match = round(sum(match_scores) / len(match_scores), 1) if match_scores else 78.5

    return {
        "total_applications": total,
        "conversion_rate": conversion_rate,
        "offer_rate": offer_rate,
        "average_match_score": avg_match,
        "status_counts": counts,
        "upcoming_followups": upcoming_followups
    }


def get_skill_gaps(db: Session, user_id: int) -> dict:
    profile = get_profile_by_user_id(db, user_id)
    user_skills = {s.strip().lower() for s in (profile.skills or "").split(",") if s.strip()}
    
    # Collect required skills from all active internships in market
    internships = db.query(Internship).filter(Internship.is_active == True).all()
    freq = {}
    
    for item in internships:
        item_skills = extract_skills_from_text(item.required_skills or "")
        for sk in item_skills:
            freq[sk] = freq.get(sk, 0) + 1

    skill_items = []
    for sk, count in sorted(freq.items(), key=lambda x: x[1], reverse=True):
        skill_items.append({
            "skill": sk,
            "frequency_in_jobs": count,
            "is_in_profile": sk.lower() in user_skills
        })

    completion = 20
    if profile.phone: completion += 10
    if profile.college: completion += 10
    if profile.skills: completion += 30
    if profile.resume_text: completion += 30

    return {
        "matching_skills_count": len(user_skills),
        "missing_top_skills": skill_items,
        "profile_completion_percentage": min(100, completion)
    }
