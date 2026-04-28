from __future__ import annotations

from dataclasses import asdict, dataclass
from uuid import uuid4


SESSION_COOKIE_NAME = "dcs_session"


@dataclass(frozen=True)
class SessionUser:
    username: str
    role: str


_sessions: dict[str, SessionUser] = {}


def create_session(user: SessionUser) -> str:
    session_id = uuid4().hex
    _sessions[session_id] = user
    return session_id


def get_session(session_id: str | None) -> SessionUser | None:
    if not session_id:
        return None
    return _sessions.get(session_id)


def delete_session(session_id: str | None) -> None:
    if not session_id:
        return
    _sessions.pop(session_id, None)


def session_payload(user: SessionUser) -> dict[str, str]:
    return asdict(user)
