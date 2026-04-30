from __future__ import annotations

from database.repositories.auth_repo import authenticate_user

from auth.session_store import SessionUser, create_session, delete_session, get_session

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
