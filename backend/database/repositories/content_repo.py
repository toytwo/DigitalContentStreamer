from database.connection import get_db_connection


def get_homepage_content() -> list[dict]:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
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
                    st.price
                FROM ContentItem ci
                JOIN ContentMetadata cm ON ci.content_id = cm.content_id
                JOIN SubscriptionTier st ON ci.required_tier = st.tier_id
                ORDER BY ci.release_date DESC
                LIMIT 12;
                """
            )
            return cursor.fetchall()