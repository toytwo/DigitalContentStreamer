from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from auth.dependencies import require_authenticated_user
from services.content_service import (
    get_homepage_content_service,
    get_subscription_tiers_service,
    get_content_service,
    create_content_service,
    update_content_service,
)

router = APIRouter()


class ContentRequest(BaseModel):
    title: str
    type: str
    release_date: str
    required_tier: int
    genre: str
    runtime_minutes: int
    original_language: str
    age_rating: str
    collection_id: int | None = None


class ContentUpdateRequest(BaseModel):
    title: str | None = None
    type: str | None = None
    release_date: str | None = None
    required_tier: int | None = None
    genre: str | None = None
    runtime_minutes: int | None = None
    original_language: str | None = None
    age_rating: str | None = None
    collection_id: int | None = None


@router.get("/homepage")
def get_homepage_content_endpoint(
    sort_by: str = "release_date",
    user: dict[str, str | int] = Depends(require_authenticated_user)
):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    valid_sort_options = ["title", "type", "release_date", "genre"]
    if sort_by not in valid_sort_options:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort_by parameter. Must be one of: {', '.join(valid_sort_options)}",
        )
    
    try:
        content = get_homepage_content_service(int(user["user_id"]), sort_by=sort_by)
        return {
            "success": True,
            "payload": content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(e),
        )


@router.get("/tiers")
def get_subscription_tiers_endpoint(user: dict[str, str | int] = Depends(require_authenticated_user)):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        tiers = get_subscription_tiers_service()
        return {
            "success": True,
            "payload": tiers
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(e),
        )


@router.post("")
def create_content_endpoint(
    request: ContentRequest,
    user: dict[str, str | int] = Depends(require_authenticated_user)
):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    # Check if user is creator or admin
    user_role = user.get("role")
    if user_role not in ["creator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators and admins can create content",
        )
    
    try:
        content = create_content_service(
            title=request.title,
            content_type=request.type,
            release_date=request.release_date,
            required_tier=request.required_tier,
            genre=request.genre,
            runtime_minutes=request.runtime_minutes,
            original_language=request.original_language,
            age_rating=request.age_rating,
            collection_id=request.collection_id,
        )
        return {
            "success": True,
            "payload": content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(e),
        )


@router.get("/{content_id}")
def get_content_endpoint(
    content_id: int,
    user: dict[str, str | int] = Depends(require_authenticated_user)
):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        content = get_content_service(content_id)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )
        return {
            "success": True,
            "payload": content
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(e),
        )


@router.put("/{content_id}")
def update_content_endpoint(
    content_id: int,
    request: ContentUpdateRequest,
    user: dict[str, str | int] = Depends(require_authenticated_user)
):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    # Check if user is admin
    user_role = user.get("role")
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update content",
        )
    
    try:
        # Check if content exists
        existing_content = get_content_service(content_id)
        if not existing_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )
        
        content = update_content_service(
            content_id=content_id,
            title=request.title,
            content_type=request.type,
            release_date=request.release_date,
            required_tier=request.required_tier,
            genre=request.genre,
            runtime_minutes=request.runtime_minutes,
            original_language=request.original_language,
            age_rating=request.age_rating,
            collection_id=request.collection_id,
        )
        return {
            "success": True,
            "payload": content
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Network Error: " + str(e),
        )