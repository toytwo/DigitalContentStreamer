from datetime import datetime
from database.connection import get_db_connection


def get_subscription_tiers() -> list[dict]:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT tier_id, name, description, price
                FROM SubscriptionTier
                ORDER BY tier_id ASC
                """
            )
            return cursor.fetchall()


def get_viewer_subscription_tier(user_id: int) -> int | None:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT tier_id
                FROM Subscription
                WHERE user_id = %s AND status = 'active'
                LIMIT 1
                """,
                (user_id,)
            )
            result = cursor.fetchone()
            return result["tier_id"] if result else None


def get_homepage_content(viewer_tier_id: int | None = None, sort_by: str = "release_date") -> list[dict]:
    sort_mapping = {
        "title": "ci.title ASC",
        "type": "ci.type ASC",
        "release_date": "ci.release_date DESC",
        "genre": "cm.genre ASC"
    }
    order_by_clause = sort_mapping.get(sort_by, "ci.release_date DESC")
    
    where_clause = ""
    params = []
    if viewer_tier_id is not None:
        where_clause = "WHERE ci.required_tier <= %s"
        params.append(viewer_tier_id)
    
    query = f"""
        SELECT
            ci.content_id,
            ci.title,
            ci.type,
            ci.release_date,
            cm.genre,
            cm.runtime_minutes,
            cm.original_language,
            cm.age_rating,
            st.name AS tier,
            st.price,
            ci.required_tier
        FROM ContentItem ci
        JOIN ContentMetadata cm ON ci.content_id = cm.content_id
        JOIN SubscriptionTier st ON ci.required_tier = st.tier_id
        {where_clause}
        ORDER BY {order_by_clause}
    """
    
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()


def get_content_by_id(content_id: int) -> dict | None:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT
                    ci.content_id,
                    ci.title,
                    ci.type,
                    ci.release_date,
                    ci.required_tier,
                    ci.collection_id,
                    cm.genre,
                    cm.runtime_minutes,
                    cm.original_language,
                    cm.age_rating
                FROM ContentItem ci
                JOIN ContentMetadata cm ON ci.content_id = cm.content_id
                WHERE ci.content_id = %s
                """,
                (content_id,)
            )
            return cursor.fetchone()


def create_content_item(
    title: str,
    content_type: str,
    release_date: str,
    required_tier: int,
    collection_id: int | None = None
) -> int:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                INSERT INTO ContentItem (title, type, release_date, required_tier, collection_id)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (title, content_type, release_date, required_tier, collection_id)
            )
            conn.commit()
            return cursor.lastrowid


def create_content_metadata(
    content_id: int,
    genre: str,
    runtime_minutes: int,
    original_language: str,
    age_rating: str
) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ContentMetadata (content_id, genre, runtime_minutes, original_language, age_rating)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (content_id, genre, runtime_minutes, original_language, age_rating)
            )
            conn.commit()


def update_content_item(
    content_id: int,
    title: str | None = None,
    content_type: str | None = None,
    release_date: str | None = None,
    required_tier: int | None = None,
    collection_id: int | None = None
) -> None:
    updates = []
    params = []
    
    if title is not None:
        updates.append("title = %s")
        params.append(title)
    if content_type is not None:
        updates.append("type = %s")
        params.append(content_type)
    if release_date is not None:
        updates.append("release_date = %s")
        params.append(release_date)
    if required_tier is not None:
        updates.append("required_tier = %s")
        params.append(required_tier)
    if collection_id is not None:
        updates.append("collection_id = %s")
        params.append(collection_id)
    
    if not updates:
        return
    
    params.append(content_id)
    query = f"UPDATE ContentItem SET {', '.join(updates)} WHERE content_id = %s"
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()


def update_content_metadata(
    content_id: int,
    genre: str | None = None,
    runtime_minutes: int | None = None,
    original_language: str | None = None,
    age_rating: str | None = None
) -> None:
    updates = []
    params = []
    
    if genre is not None:
        updates.append("genre = %s")
        params.append(genre)
    if runtime_minutes is not None:
        updates.append("runtime_minutes = %s")
        params.append(runtime_minutes)
    if original_language is not None:
        updates.append("original_language = %s")
        params.append(original_language)
    if age_rating is not None:
        updates.append("age_rating = %s")
        params.append(age_rating)
    
    if not updates:
        return
    
    params.append(content_id)
    query = f"UPDATE ContentMetadata SET {', '.join(updates)} WHERE content_id = %s"
    
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()