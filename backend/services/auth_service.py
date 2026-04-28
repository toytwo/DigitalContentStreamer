from __future__ import annotations

import bcrypt

from auth.mock_users import MOCK_USERS, MockUser
from auth.session_store import SessionUser, create_session, delete_session, get_session


_PASSWORD_HASHES: dict[str, bytes] = {
    username: bcrypt.hashpw(mock_user.password.encode("utf-8"), bcrypt.gensalt(rounds=10))
    for username, mock_user in MOCK_USERS.items()
}


def _verify_mock_user(username: str, password: str) -> MockUser | None:
    mock_user = MOCK_USERS.get(username)
    if mock_user is None:
        return None

    password_hash = _PASSWORD_HASHES[username]
    if not bcrypt.checkpw(password.encode("utf-8"), password_hash):
        return None

    return mock_user


def authenticate(username: str, password: str) -> tuple[str, SessionUser] | None:
    mock_user = _verify_mock_user(username.strip(), password)
    if mock_user is None:
        return None

    session_user = SessionUser(username=mock_user.username, role=mock_user.role)
    session_id = create_session(session_user)
    return session_id, session_user


def load_session(session_id: str | None) -> SessionUser | None:
    return get_session(session_id)


def logout_session(session_id: str | None) -> None:
    delete_session(session_id)
