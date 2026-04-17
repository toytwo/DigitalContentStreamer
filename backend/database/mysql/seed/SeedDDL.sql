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