from __future__ import annotations

from typing import Any

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


def update_user_profile(user_id: int, payload: dict[str, Any]) -> dict:
    normalized_payload: dict[str, Any] = {}

    if "email" in payload:
        email = payload["email"].strip()
        if not email:
            raise ValueError("Email is required")
        normalized_payload["email"] = email

    if "phone_number" in payload:
        normalized_payload["phone_number"] = int(payload["phone_number"])

    if "first_name" in payload:
        first_name = payload["first_name"].strip()
        if not first_name:
            raise ValueError("First name is required")
        normalized_payload["first_name"] = first_name

    if "last_name" in payload:
        last_name = payload["last_name"].strip()
        if not last_name:
            raise ValueError("Last name is required")
        normalized_payload["last_name"] = last_name

    if "display_name" in payload:
        display_name = payload["display_name"].strip()
        if not display_name:
            raise ValueError("Display name is required")
        normalized_payload["display_name"] = display_name

    if "profile_description" in payload:
        profile_description = payload["profile_description"].strip()
        if not profile_description:
            raise ValueError("Profile description is required")
        normalized_payload["profile_description"] = profile_description

    result = user_profile_repo.update_user_profile(user_id, normalized_payload)

    if result is None:
        raise ValueError(f"User with id {user_id} not found")

    return result