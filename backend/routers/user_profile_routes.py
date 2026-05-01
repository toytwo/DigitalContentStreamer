from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from auth.dependencies import require_authenticated_user
from services.user_profile_service import get_user_profile, get_user_profile_image, update_user_profile

router = APIRouter()


class UpdateUserProfileRequest(BaseModel):
    email: EmailStr | None = None
    phone_number: str | None = Field(default=None, min_length=7, max_length=15, pattern=r"^[0-9]+$")
    first_name: str | None = Field(default=None, min_length=1, max_length=255)
    last_name: str | None = Field(default=None, min_length=1, max_length=255)
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    profile_description: str | None = Field(default=None, min_length=1, max_length=1000)

@router.get("/details")
def user_profile_endpoint(user: dict[str, str | int] = Depends(require_authenticated_user)):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        result = get_user_profile(user["user_id"])

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: "+str(e),
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error",
        )
    
    return {"success":True,"payload":result}

@router.get("/image")
def user_profile_image_endpoint(user: dict[str, str | int] = Depends(require_authenticated_user)):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        result = get_user_profile_image(user["user_id"])

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: "+str(e),
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error",
        )
    
    return {"success":True,"payload":result}


@router.patch("/details")
def update_user_profile_endpoint(payload: UpdateUserProfileRequest, user: dict[str, str | int] = Depends(require_authenticated_user)):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        update_payload = payload.model_dump(exclude_none=True)
        result = update_user_profile(int(user["user_id"]), update_payload)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error
    except Exception as error:
        if getattr(error, "errno", None) == 1062:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or display name is already in use",
            ) from error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(error),
        ) from error

    return {"success": True, "payload": result}