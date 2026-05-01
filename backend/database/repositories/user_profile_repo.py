from database.repositories.template_repo import _fetch_all, _fetch_one

def get_all_user_details(user_id: int)->dict:
    return _fetch_one([user_id],"GetAllUserDetails")

def get_user_profile_image(user_id: int)->dict:
    return _fetch_one([user_id],"GetUserProfileImage")