from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import CurrentUser, DbSession
from app.schemas.auth import ForgotPasswordRequest, LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: RegisterRequest, db: DbSession):
    """Create a new student account."""
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession):
    """Log in with JSON (email + password). Used by the React app."""
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    return auth_service.build_token_response(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: DbSession):
    """Reset account password directly without requiring email verification."""
    auth_service.reset_password(db, payload.email, payload.new_password)
    return {"message": "Password updated successfully. You can now log in with your new password."}


@router.post("/token", response_model=TokenResponse)
def login_for_swagger(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession):
    """Form-based login for the Swagger 'Authorize' button. Put your email in `username`."""
    user = auth_service.authenticate_user(db, form.username, form.password)
    return auth_service.build_token_response(user)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: CurrentUser):
    """Return the logged-in user (requires a Bearer token)."""
    return current_user
