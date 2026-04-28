DROP PROCEDURE IF EXISTS TestGetAllUsers;
DROP PROCEDURE IF EXISTS AuthenticateUser;

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

DELIMITER ;