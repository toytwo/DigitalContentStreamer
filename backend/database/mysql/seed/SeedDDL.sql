DROP DATABASE IF EXISTS digitalcontentstreamer;
CREATE DATABASE digitalcontentstreamer;
USE digitalcontentstreamer;

CREATE TABLE Region (
    region_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (region_id)
);

CREATE TABLE User (
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number INT NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    creation_date DATE NOT NULL,
    region_id INT NOT NULL,
    referral_method VARCHAR(30) NOT NULL,
    CHECK (referral_method IN ('online search', 'word of mouth', 'advertisement', 'promotion', 'online platform', 'prefer not to say')),
    PRIMARY KEY (user_id),
    FOREIGN KEY (region_id) REFERENCES Region(region_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE Creator (
    user_id INT NOT NULL,
    display_name VARCHAR(255) NOT NULL UNIQUE,
    profile_description VARCHAR(1000) NOT NULL,
    profile_image_filepath VARCHAR(255) NOT NULL DEFAULT "default/image/filepath.png",
    follow_count INT NOT NULL,
    view_count INT NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Viewer (
    user_id INT NOT NULL,
    age INT NOT NULL,
    preferred_language VARCHAR(20) NOT NULL DEFAULT "English",
    CHECK (preferred_language IN ('English', 'Mandarin Chinese', 'Hindi', 'Spanish', 'Arabic', 'French', 'Bengali', 'Portuguese', 'Indonesian', 'Urdu', 'Russian', 'German', 'Japanese')),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Admin (
    user_id INT NOT NULL,
    department VARCHAR(20) NOT NULL,
    CHECK (department IN ('IT', 'marketing', 'management', 'development')),
    hire_date DATE NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Follows (
    viewer_id INT NOT NULL,
    creator_id INT NOT NULL,
    follow_date DATE NOT NULL,
    PRIMARY KEY (viewer_id, creator_id),
    FOREIGN KEY (viewer_id) REFERENCES Viewer(user_id),
    FOREIGN KEY (creator_id) REFERENCES Creator(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE SubscriptionTier (
    tier_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (tier_id)
);

CREATE TABLE Subscription (
    user_id INT NOT NULL,
    tier_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id),
    CHECK (end_date >= start_date),
    CHECK (status IN ('active', 'expired')),
    FOREIGN KEY (user_id) REFERENCES Viewer(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES SubscriptionTier(tier_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE SubscriptionPriceHistory (
    subscription_price_id INT NOT NULL AUTO_INCREMENT,
    tier_id INT NULL,
    from_price DECIMAL(10,2) NOT NULL,
    to_price DECIMAL(10,2) NOT NULL,
    effective_start DATE NOT NULL,
    effective_end DATE NULL,
    PRIMARY KEY (subscription_price_id),
    CHECK (from_price >= 0),
    CHECK (to_price >= 0),
    CHECK (effective_end IS NULL OR effective_end >= effective_start),
    FOREIGN KEY (tier_id) REFERENCES SubscriptionTier(tier_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE SubscriptionTransition (
    plan_change_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    from_plan INT NULL,
    to_plan INT NULL,
    plan_change_reason VARCHAR(40) NOT NULL,
    plan_change_date DATE NOT NULL,
    PRIMARY KEY (plan_change_id),
    FOREIGN KEY (user_id) REFERENCES Viewer(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (from_plan) REFERENCES SubscriptionTier(tier_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
    FOREIGN KEY (to_plan) REFERENCES SubscriptionTier(tier_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE Invoice (
    invoice_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_flag BOOLEAN NOT NULL,
    created_at DATE NOT NULL,
    PRIMARY KEY (invoice_id),
    CHECK (period_end >= period_start),
    CHECK (amount >= 0),
    FOREIGN KEY (user_id) REFERENCES Viewer(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Collection (
    collection_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(40) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (collection_id),
    CHECK (type IN ('season', 'series', 'album', 'franchise', 'playlist'))
);

CREATE TABLE ContentItem (
    content_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(40) NOT NULL,
    release_date DATE NOT NULL,
    required_tier INT NOT NULL,
    PRIMARY KEY (content_id),
    CHECK (type IN ('movie', 'episode', 'song', 'article', 'podcast')),
    FOREIGN KEY (required_tier) REFERENCES SubscriptionTier(tier_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE ContentMetadata (
    content_id INT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    runtime_minutes INT NOT NULL,
    original_language VARCHAR(50) NOT NULL,
    age_rating VARCHAR(10) NOT NULL,
    PRIMARY KEY (content_id),
    CHECK (runtime_minutes >= 0),
    FOREIGN KEY (content_id) REFERENCES ContentItem(content_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Bookmark (
    viewer_id INT NOT NULL,
    content_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (viewer_id, content_id),
    FOREIGN KEY (viewer_id) REFERENCES Viewer(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (content_id) REFERENCES ContentItem(content_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE Rating (
    viewer_id INT NOT NULL,
    content_id INT NOT NULL,
    score INT NOT NULL,
    PRIMARY KEY (viewer_id, content_id),
    CHECK (score BETWEEN 1 AND 5),
    FOREIGN KEY (viewer_id) REFERENCES Viewer(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (content_id) REFERENCES ContentItem(content_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE ContentRegionBlock (
    content_id INT NOT NULL,
    region_id INT NOT NULL,
    PRIMARY KEY (content_id, region_id),
    FOREIGN KEY (content_id) REFERENCES ContentItem(content_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    FOREIGN KEY (region_id) REFERENCES Region(region_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
