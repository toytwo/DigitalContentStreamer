from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MockUser:
    username: str
    password: str
    role: str


MOCK_USERS: dict[str, MockUser] = {
    "user": MockUser(username="user", password="userpw", role="user"),
    "creator": MockUser(username="creator", password="creatorpw", role="creator"),
    "admin": MockUser(username="admin", password="adminpw", role="admin"),
}
