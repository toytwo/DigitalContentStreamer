from fastapi import APIRouter
from services.content_service import get_homepage_content_service

router = APIRouter()


@router.get("/homepage")
def get_homepage_content_endpoint():
    return {
        "success": True,
        "payload": get_homepage_content_service()
    }