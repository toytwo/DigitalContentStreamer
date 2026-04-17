DROP DATABASE IF EXISTS digitalcontentstreamer;
CREATE DATABASE digitalcontentstreamer;
USE digitalcontentstreamer;

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
    CHECK (preferred_language IN ('English', 'Mandarin Chinese', 'Hindi, Spanish', 'Arabic', 'French', 'Bengali', 'Portuguese', 'Indonesian', 'Urdu', 'Russian', 'German', 'Japanese')),
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
