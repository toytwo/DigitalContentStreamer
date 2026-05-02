from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field

from auth.dependencies import require_authenticated_user
from auth.session_store import SESSION_COOKIE_NAME
from services.auth_service import authenticate, load_session, logout_session, signup


router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class SignupRequest(BaseModel):
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=15, pattern=r"^[0-9]+$")
    user_role: str = Field(min_length=1, max_length=20)
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    password_confirmation: str = Field(min_length=1, max_length=128)
    region_name: str = Field(min_length=1, max_length=100)
    referral_method: str = Field(min_length=1, max_length=30)
    age: int | None = Field(default=None, ge=1, le=120)
    preferred_language: str | None = Field(default=None, max_length=20)
    subscription_tier_id: int | None = Field(default=None, ge=1)
    display_name: str | None = Field(default=None, max_length=255)
    profile_description: str | None = Field(default=None, max_length=1000)
    department: str | None = Field(default=None, max_length=20)


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


@router.post("/signup")
def signup_endpoint(payload: SignupRequest, response: Response):
    try:
        session_id, session_user = signup(payload.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except Exception as error:
        if getattr(error, "errno", None) == 1062:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with that display name / email already exists",
            ) from error
        raise

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
def require_login(current_user: dict[str, str | int] = Depends(require_authenticated_user)):
    return {"success": True, "user": current_user}
