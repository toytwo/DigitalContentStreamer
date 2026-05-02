from __future__ import annotations

from calendar import monthrange
from datetime import date
from decimal import Decimal
from typing import Any

from database.repositories.auth_repo import (
    authenticate_user,
    create_signup_user,
    find_region_by_name,
    find_subscription_tier_by_id,
)

from auth.session_store import SessionUser, create_session, delete_session, get_session

ROLE_OPTIONS = [
    {"value": "viewer", "label": "Viewer", "description": "Watch content and manage a subscription."},
    {"value": "creator", "label": "Creator", "description": "Publish content and build a profile."},
    {"value": "admin", "label": "Admin", "description": "Manage the platform and its users."},
]

REFERRAL_METHOD_OPTIONS = [
    "online search",
    "word of mouth",
    "advertisement",
    "promotion",
    "online platform",
    "prefer not to say",
]

VIEWER_LANGUAGE_OPTIONS = [
    "English",
    "Mandarin Chinese",
    "Hindi",
    "Spanish",
    "Arabic",
    "French",
    "Bengali",
    "Portuguese",
    "Indonesian",
    "Urdu",
    "Russian",
    "German",
    "Japanese",
]

ADMIN_DEPARTMENT_OPTIONS = ["IT", "marketing", "management", "development"]


def authenticate(email: str, password: str) -> tuple[str, SessionUser] | None:
    user_record = authenticate_user(email.strip(), password)
    if user_record is None:
        return None

    session_user = SessionUser(
        user_id=user_record["user_id"],
        email=user_record["email"],
        role=user_record["user_role"],
    )
    session_id = create_session(session_user)
    return session_id, session_user


def load_session(session_id: str | None) -> SessionUser | None:
    return get_session(session_id)


def logout_session(session_id: str | None) -> None:
    delete_session(session_id)


def _end_of_month(value: date) -> date:
    return date(value.year, value.month, monthrange(value.year, value.month)[1])


def signup(payload: dict[str, Any]) -> tuple[str, SessionUser]:
    if payload["password"] != payload["password_confirmation"]:
        raise ValueError("Password confirmation does not match")

    region = find_region_by_name(payload["region_name"])
    if region is None:
        raise LookupError("Invalid region selected")

    creation_date = date.today()
    normalized_payload: dict[str, Any] = {
        "email": payload["email"].strip(),
        "phone_number": int(payload["phone_number"]),
        "user_role": payload["user_role"],
        "first_name": payload["first_name"].strip(),
        "last_name": payload["last_name"].strip(),
        "password": payload["password"],
        "creation_date": creation_date,
        "region_id": region["region_id"],
        "referral_method": payload["referral_method"],
        "display_name": (payload.get("display_name") or "").strip(),
        "profile_description": (payload.get("profile_description") or "Profile Description").strip(),
        "profile_image_filepath": payload.get("profile_image_filepath") or "profiles/DefaultProfileImage.png",
    }

    role = payload["user_role"]
    if role == "viewer":
        tier = find_subscription_tier_by_id(int(payload["subscription_tier_id"]))
        if tier is None:
            raise LookupError("Invalid subscription tier selected")

        normalized_payload.update(
            {
                "age": int(payload["age"]),
                "preferred_language": payload["preferred_language"],
                "subscription_tier_id": tier["tier_id"],
                "subscription_start_date": creation_date,
                "subscription_end_date": _end_of_month(creation_date),
                "invoice_amount": Decimal(str(tier["price"])),
            }
        )
    elif role == "creator":
        normalized_payload.update(
            {
                "follow_count": 0,
                "watch_count": 0,
            }
        )
    elif role == "admin":
        normalized_payload.update(
            {
                "department": payload["department"],
                "hire_date": creation_date,
            }
        )
    else:
        raise ValueError("Invalid user role selected")

    created_user = create_signup_user(normalized_payload)
    session_user = SessionUser(
        user_id=created_user["user_id"],
        email=created_user["email"],
        role=created_user["role"],
    )
    session_id = create_session(session_user)
    return session_id, session_user
