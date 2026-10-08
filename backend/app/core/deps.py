from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

DbSession = Annotated[Session, Depends(get_db)]


def _credentials_error() -> AppError:
    return AppError(
        "Could not validate credentials.",
        status_code=401,
        code="invalid_token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: DbSession) -> User:
    try:
        payload = decode_access_token(token)
        if payload.get("type") != "access":
            raise _credentials_error()
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise _credentials_error()

    user = db.get(User, user_id)
    if user is None:
        raise _credentials_error()
    if not user.is_active:
        raise AppError("This account has been disabled.", 403, "account_disabled")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
