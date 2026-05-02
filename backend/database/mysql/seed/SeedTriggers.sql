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

DELIMITER ;