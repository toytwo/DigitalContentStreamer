CREATE VIEW ViewerSubscriptionInfo AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    v.age,
    v.preferred_language,
    st.name AS subscription_tier,
    st.price,
    s.start_date,
    s.end_date,
    s.status
FROM User u
JOIN Viewer v ON u.user_id = v.user_id
JOIN Subscription s ON v.user_id = s.user_id
JOIN SubscriptionTier st ON s.tier_id = st.tier_id;

CREATE VIEW ContentDetails AS
SELECT 
    ci.content_id,
    ci.title,
    ci.type,
    ci.release_date,
    cm.genre,
    cm.runtime_minutes,
    cm.original_language,
    cm.age_rating,
    st.name AS required_tier,
    st.price AS tier_price
FROM ContentItem ci
JOIN ContentMetadata cm ON ci.content_id = cm.content_id
JOIN SubscriptionTier st ON ci.required_tier = st.tier_id;
