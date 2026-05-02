from database.connection import get_db_connection


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