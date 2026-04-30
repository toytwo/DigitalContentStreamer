from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field

from auth.dependencies import require_authenticated_user
from auth.session_store import SESSION_COOKIE_NAME
from services.auth_service import authenticate, load_session, logout_session


router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


@router.post("/login")
def login_endpoint(payload: LoginRequest, response: Response):
    auth_result = authenticate(payload.email, payload.password)
    if auth_result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    session_id, session_user = auth_result
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 8,
    )
    return {
        "success": True,
        "user": {
            "user_id": session_user.user_id,
            "email": session_user.email,
            "role": session_user.role,
        },
    }


@router.get("/me")
def current_session(
    dcs_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
):
    session_user = load_session(dcs_session)
    if session_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return {
        "success": True,
        "user": {
            "user_id": session_user.user_id,
            "email": session_user.email,
            "role": session_user.role,
        },
    }


@router.post("/logout")
def logout_endpoint(
    response: Response,
    dcs_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
):
    logout_session(dcs_session)
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"success": True}


@router.get("/require-login")
def require_login(current_user: dict[str, str] = Depends(require_authenticated_user)):
    return {"success": True, "user": current_user}
