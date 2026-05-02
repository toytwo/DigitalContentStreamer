DELIMITER $$
CREATE TRIGGER ValidateProfileImageFilePathsOnInsert
BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    CALL ValidateProfileImagePath(NEW.profile_image_filepath);
END$$

CREATE TRIGGER ValidateProfileImageFilePathsOnUpdate
BEFORE UPDATE ON User
FOR EACH ROW
BEGIN
    CALL ValidateProfileImagePath(NEW.profile_image_filepath);
END$$

CREATE TRIGGER ValidateViewerRoleOnInsert
BEFORE INSERT ON Viewer
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'viewer');
END$$

CREATE TRIGGER ValidateViewerRoleOnUpdate
BEFORE UPDATE ON Viewer
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'viewer');
END$$

CREATE TRIGGER ValidateCreatorRoleOnInsert
BEFORE INSERT ON Creator
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'creator');
END$$

CREATE TRIGGER ValidateCreatorRoleOnUpdate
BEFORE UPDATE ON Creator
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'creator');
END$$

CREATE TRIGGER ValidateAdminRoleOnInsert
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'admin');
END$$

CREATE TRIGGER ValidateAdminRoleOnUpdate
BEFORE UPDATE ON Admin
FOR EACH ROW
BEGIN
    CALL ValidateUserRole(NEW.user_id, 'admin');
END$$

DELIMITER $$

CREATE TRIGGER UpdateFollowCount
AFTER INSERT ON Follows
FOR EACH ROW
BEGIN
    UPDATE Creator
    SET follow_count = follow_count + 1
    WHERE user_id = NEW.creator_id;
END$$

DELIMITER $$

CREATE TRIGGER UpdateWatchCount
AFTER INSERT ON Watches
FOR EACH ROW
BEGIN
    UPDATE Creator
    SET watch_count = watch_count + 1
    WHERE user_id = (
        SELECT c.user_id
        FROM ContentItem ci
        JOIN Creator c ON c.user_id = (
            SELECT user_id 
            FROM ContentItem 
            WHERE content_id = ci.content_id
            LIMIT 1
        )
        WHERE ci.content_id = NEW.content_id
        LIMIT 1
    );
END$$

DELIMITER ;