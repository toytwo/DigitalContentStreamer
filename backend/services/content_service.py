from database.repositories.content_repo import get_homepage_content, get_viewer_subscription_tier


def get_homepage_content_service(user_id: int, sort_by: str = "release_date"):
    viewer_tier_id = get_viewer_subscription_tier(user_id)
    return get_homepage_content(viewer_tier_id=viewer_tier_id, sort_by=sort_by)