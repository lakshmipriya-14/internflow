from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import AppError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse
from app.schemas.user import UserResponse

# Used to keep response time similar when an email does not exist
_DUMMY_HASH = hash_password("not-a-real-password-1")


def _invalid_credentials() -> AppError:
    return AppError(
        "Incorrect email or password.",
        status_code=401,
        code="invalid_credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _email_taken() -> AppError:
    return AppError("An account with this email already exists.", 409, "email_already_registered")


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.strip().lower()))


def register_user(db: Session, data: RegisterRequest) -> User:
    email = data.email.strip().lower()
    if get_user_by_email(db, email):
        raise _email_taken()

    user = User(
        email=email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
    )
    user.profile = StudentProfile()  # empty profile, filled in during Phase 2
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # two requests raced with the same email
        db.rollback()
        raise _email_taken()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if user is None:
        verify_password(password, _DUMMY_HASH)
        raise _invalid_credentials()
    if not verify_password(password, user.password_hash):
        raise _invalid_credentials()
    if not user.is_active:
        raise AppError("This account has been disabled.", 403, "account_disabled")
    return user


def build_token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )
