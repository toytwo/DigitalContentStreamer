DELIMITER $$

CREATE PROCEDURE TestGetAllUsers()
BEGIN
    SELECT * FROM User;
END$$

CREATE PROCEDURE AuthenticateUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255)
)
BEGIN
    SELECT
        user_id,
        email,
        user_role
    FROM User
    WHERE email = p_email
      AND password = p_password
    LIMIT 1;
END$$

CREATE PROCEDURE GetAllUserDetails(
    IN input_user_id INT
)
BEGIN
    SELECT * FROM User
    WHERE user_id = input_user_id
    LIMIT 1;
END$$

CREATE PROCEDURE GetUserProfileImage(
    IN input_user_id INT
)
BEGIN
    SELECT profile_image_filepath FROM User
    WHERE user_id = input_user_id
    LIMIT 1;
END$$

CREATE PROCEDURE ValidateProfileImagePath(
    input_filepath TEXT
)
BEGIN
    IF NOT (input_filepath REGEXP '^profiles/[^/]+\.(png|jpg|PNG|JPG)$') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid filepath: Filepaths must be in the form "profiles/filename.[png|jpg|PNG|JPG]"';
    END IF;
END$$

DELIMITER $$

CREATE PROCEDURE ValidateUserRole(
    input_user_id INT,
    input_user_role VARCHAR(20)
)
BEGIN
    DECLARE error_msg VARCHAR(255);

    IF NOT EXISTS (
        SELECT 1
        FROM User
        WHERE user_id = input_user_id AND user_role = input_user_role
    ) THEN
        SET error_msg = CONCAT('Invalid Role: This user does not have the ', input_user_role,' role');

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_msg;
    END IF;

END$$

CREATE PROCEDURE UpdateUserProfileImage(
    input_user_id INT,
    input_image_filepath TEXT
)
BEGIN
    UPDATE User
    SET profile_image_filepath = input_image_filepath
    WHERE user_id = input_user_id;
END$$

CREATE PROCEDURE DeleteUser(
    input_user_id INT
)
BEGIN
    DELETE FROM User
    WHERE user_id = input_user_id;
END$$

CREATE PROCEDURE GetUserCountBySubscriptionType()
BEGIN
    SELECT tier_id, COUNT(*) AS user_count
    FROM Subscription
    GROUP BY tier_id;
END$$

DELIMITER ;