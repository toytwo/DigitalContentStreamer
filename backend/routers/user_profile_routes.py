from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import require_authenticated_user
from services.user_profile_service import get_user_profile, get_user_profile_image

router = APIRouter()

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