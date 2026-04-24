from fastapi import APIRouter
from services.test_service import test_get_all_users_service

router = APIRouter()

@router.get("/test_get_all_users")
def test_get_all_users_endpoint():
    result = test_get_all_users_service()

    # Some Logic

    if result:
        return {"success":True,"users":result}
    else:
        # Definetely some HTTP response stuff
        return {"success":False}
    