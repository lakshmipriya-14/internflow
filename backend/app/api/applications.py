from fastapi import APIRouter, HTTPException, Query
from app.core.deps import CurrentUser, DbSession
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services import application_service

router = APIRouter(prefix="/applications", tags=["Application Tracker"])


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    db: DbSession,
    current_user: CurrentUser,
    status: str | None = Query(None, description="Filter by status (saved, applied, interviewing, etc.)")
):
    """Retrieve all user internship applications for the Kanban board."""
    return application_service.get_user_applications(db, current_user.id, status=status)


@router.post("", response_model=ApplicationResponse, status_code=201)
def create_application(payload: ApplicationCreate, db: DbSession, current_user: CurrentUser):
    """Save or start tracking a new internship application."""
    return application_service.create_application(db, current_user.id, payload)


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: int, payload: ApplicationUpdate, db: DbSession, current_user: CurrentUser):
    """Update application stage, notes, or follow-up date."""
    updated = application_service.update_application(db, current_user.id, application_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated


@router.delete("/{application_id}")
def delete_application(application_id: int, db: DbSession, current_user: CurrentUser):
    """Delete an application entry."""
    success = application_service.delete_application(db, current_user.id, application_id)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted successfully"}
