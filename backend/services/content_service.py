from database.repositories.content_repo import (
    get_homepage_content,
    get_viewer_subscription_tier,
    get_subscription_tiers,
    get_content_by_id,
    create_content_item,
    create_content_metadata,
    update_content_item,
    update_content_metadata,
)


def get_homepage_content_service(user_id: int, sort_by: str = "release_date"):
    viewer_tier_id = get_viewer_subscription_tier(user_id)
    return get_homepage_content(viewer_tier_id=viewer_tier_id, sort_by=sort_by)


def get_subscription_tiers_service() -> list[dict]:
    return get_subscription_tiers()


def get_content_service(content_id: int) -> dict | None:
    return get_content_by_id(content_id)


def create_content_service(
    title: str,
    content_type: str,
    release_date: str,
    required_tier: int,
    genre: str,
    runtime_minutes: int,
    original_language: str,
    age_rating: str,
    collection_id: int | None = None
) -> dict:
    content_id = create_content_item(title, content_type, release_date, required_tier, collection_id)
    create_content_metadata(content_id, genre, runtime_minutes, original_language, age_rating)
    
    return {
        "content_id": content_id,
        "title": title,
        "type": content_type,
        "release_date": release_date,
        "required_tier": required_tier,
        "genre": genre,
        "runtime_minutes": runtime_minutes,
        "original_language": original_language,
        "age_rating": age_rating,
    }


def update_content_service(
    content_id: int,
    title: str | None = None,
    content_type: str | None = None,
    release_date: str | None = None,
    required_tier: int | None = None,
    genre: str | None = None,
    runtime_minutes: int | None = None,
    original_language: str | None = None,
    age_rating: str | None = None,
    collection_id: int | None = None
) -> dict:
    update_content_item(content_id, title, content_type, release_date, required_tier, collection_id)
    update_content_metadata(content_id, genre, runtime_minutes, original_language, age_rating)
    
    updated = get_content_by_id(content_id)
    return updated if updated else {}