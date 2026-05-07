from __future__ import annotations
import shutil 
from pathlib import Path
from typing import Any
import os
from fastapi import UploadFile
from database.repositories import user_profile_repo 

FILE_PATH_SUFFIXES = ["a","b"]

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

def update_user_profile_image(user_id: int, image: UploadFile) -> str:
    ALLOWED_TYPES = {"image/png", "image/jpeg"}

    if image.content_type not in ALLOWED_TYPES:
        raise ValueError("Invalid file type")
    
    result = user_profile_repo.get_user_profile_image(user_id)

    if result is None:
        raise ValueError(f"User with id {user_id} not found")
    
    current_filepath = result["profile_image_filepath"]
    dot_index = current_filepath.index(".")
    
    # Alternating suffix used to force cache miss on frontend and store old pfp for retrieval
    suffix = current_filepath[dot_index-1:dot_index]
    for i in range(len(FILE_PATH_SUFFIXES)):
        if suffix == FILE_PATH_SUFFIXES[i]:
            suffix = FILE_PATH_SUFFIXES[(i+1)%len(FILE_PATH_SUFFIXES)]
            break
    else:
        suffix = FILE_PATH_SUFFIXES[0]
    
    extension = os.path.splitext(image.filename)[1]
    
    partial_relative_path = f"profiles/{user_id}{suffix}{extension}"

    full_relative_path = Path("database/images") / partial_relative_path

    with full_relative_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    user_profile_repo.update_user_profile_image(user_id, partial_relative_path)
    
    return partial_relative_path


def update_user_profile(user_id: int, payload: dict[str, Any]) -> dict:
    normalized_payload: dict[str, Any] = {}
    fields = {
        "email":str, "phone_number":int, 
        "first_name":str, "last_name":str, 
        "display_name": str, "profile_description":str,
        "password":str}

    for field, cast_type in fields.items():
        if field in payload:
            value = payload[field]

            if isinstance(value, str):
                value = value.strip()
                if not value:
                    raise ValueError(f"{field} is required")

            try:
                normalized_payload[field] = cast_type(value)
            except (ValueError, TypeError):
                raise ValueError(f"Invalid value for {field}")

    result = user_profile_repo.update_user_profile(user_id, normalized_payload)

    if result is None:
        raise ValueError(f"User with id {user_id} not found")

    return result

def delete_user(user_id: int) -> None:
    user_profile_repo.delete_user(user_id)

    for i in range(len(FILE_PATH_SUFFIXES)):
        file_path_png = Path(f"database/images/profiles/{str(user_id)+FILE_PATH_SUFFIXES[i]+'.png'}")
        file_path_jpg = Path(f"database/images/profiles/{str(user_id)+FILE_PATH_SUFFIXES[i]+'.jpg'}")
        file_path_png.unlink(missing_ok=True)
        file_path_jpg.unlink(missing_ok=True)