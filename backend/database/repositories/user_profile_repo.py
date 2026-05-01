from __future__ import annotations
from typing import Any
from database.connection import get_db_connection
from database.repositories.template_repo import _fetch_one, _update

def get_all_user_details(user_id: int) -> dict:
    return _fetch_one([user_id],"GetAllUserDetails")

def get_user_profile_image(user_id: int) -> dict:
    return _fetch_one([user_id],"GetUserProfileImage")

def update_user_profile_image(user_id: int, filepath: str) -> None:
    return _update([user_id, filepath],"UpdateUserProfileImage")

def update_user_profile(user_id: int, updates: dict[str, Any]) -> dict[str, Any]:
    if not updates:
        raise ValueError("No profile fields provided for update")

    allowed_fields = {
        "email",
        "phone_number",
        "first_name",
        "last_name",
        "display_name",
        "profile_description",
    }

    filtered_updates = {key: value for key, value in updates.items() if key in allowed_fields}
    if not filtered_updates:
        raise ValueError("No supported profile fields provided for update")

    assignments = ", ".join(f"{column} = %s" for column in filtered_updates.keys())
    values = list(filtered_updates.values())
    values.append(user_id)

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f"UPDATE `User` SET {assignments} WHERE user_id = %s",
                values,
            )
            conn.commit()

    return get_all_user_details(user_id)