from fastapi import Cookie, HTTPException, status

from auth.session_store import SESSION_COOKIE_NAME, get_session, session_payload


def require_authenticated_user(
    dcs_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
) -> dict[str, str]:
    user = get_session(dcs_session)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return session_payload(user)
