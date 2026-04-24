from database.connection import get_db_connection

def _fetch_one(parameters: list, procedure_name: str) -> dict:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            try:
                cursor.callproc(procedure_name, parameters)
            except Exception as e:
                print(f"Retrieval failed: {e}")
                raise e

            row = None

            for result in cursor.stored_results():
                row = result.fetchone()
                if row:
                    return row

        return None

def _fetch_all(parameters: list, procedure_name: str) -> dict:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            try:
                cursor.callproc(procedure_name, parameters)
            except Exception as e:
                print(f"Retrieval failed: {e}")
                raise e

            results = []

            for result in cursor.stored_results():
                rows = result.fetchall()
                for row in rows:
                    results.append(row)
            
            return results

        return None


def test_get_all_users_repo() -> list[dict]:
    # Normally these are this simple. Maybe you convert to a boolean if you need that.
    result = _fetch_all([], "TestGetAllUsers")
    return result

