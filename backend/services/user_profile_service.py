from database.repositories import user_profile_repo 

def get_user_profile(user_id: int) -> dict:
    result = user_profile_repo.get_all_user_details(user_id)

    if result is None:
        raise ValueError(f"User with id {user_id} not found")
    
    return result

def get_user_profile_image(user_id: int) -> dict:
    result = user_profile_repo.get_user_profile_image(user_id)

    if result is None:
        raise ValueError(f"User with id {user_id} not found")
    
    return result