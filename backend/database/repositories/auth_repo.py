from database.connection import get_db_connection


def authenticate_user(email: str, password: str) -> dict | None:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            try:
                cursor.callproc("AuthenticateUser", [email, password])
            except Exception as error:
                print(f"Authentication failed: {error}")
                raise error

            for result in cursor.stored_results():
                return result.fetchone()

    return None