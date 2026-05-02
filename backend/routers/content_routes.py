from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import require_authenticated_user
from services.content_service import get_homepage_content_service

router = APIRouter()


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