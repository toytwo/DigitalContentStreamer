from __future__ import annotations

from typing import Any

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


def find_region_by_name(region_name: str) -> dict[str, Any] | None:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT region_id, name FROM Region WHERE name = %s LIMIT 1",
                (region_name,),
            )
            return cursor.fetchone()


def find_subscription_tier_by_id(tier_id: int) -> dict[str, Any] | None:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT tier_id, name, description, price FROM SubscriptionTier WHERE tier_id = %s LIMIT 1",
                (tier_id,),
            )
            return cursor.fetchone()


def create_signup_user(payload: dict[str, Any]) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            try:
                conn.start_transaction()

                cursor.execute(
                    """
                    INSERT INTO `User` (
                        email,
                        phone_number,
                        user_role,
                        first_name,
                        last_name,
                        password,
                        creation_date,
                        region_id,
                        referral_method,
                        display_name,
                        profile_description,
                        profile_image_filepath
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        payload["email"],
                        payload["phone_number"],
                        payload["user_role"],
                        payload["first_name"],
                        payload["last_name"],
                        payload["password"],
                        payload["creation_date"],
                        payload["region_id"],
                        payload["referral_method"],
                        payload["display_name"],
                        payload["profile_description"],
                        payload["profile_image_filepath"],
                    ),
                )

                user_id = cursor.lastrowid
                role = payload["user_role"]

                if role == "viewer":
                    cursor.execute(
                        """
                        INSERT INTO Viewer (user_id, age, preferred_language)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            user_id,
                            payload["age"],
                            payload["preferred_language"],
                        ),
                    )

                    cursor.execute(
                        """
                        INSERT INTO Subscription (
                            user_id,
                            tier_id,
                            start_date,
                            end_date,
                            status
                        ) VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            user_id,
                            payload["subscription_tier_id"],
                            payload["subscription_start_date"],
                            payload["subscription_end_date"],
                            "active",
                        ),
                    )

                    cursor.execute(
                        """
                        INSERT INTO Invoice (
                            user_id,
                            period_start,
                            period_end,
                            amount,
                            paid_flag,
                            created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            user_id,
                            payload["subscription_start_date"],
                            payload["subscription_end_date"],
                            payload["invoice_amount"],
                            False,
                            payload["creation_date"],
                        ),
                    )
                elif role == "creator":
                    cursor.execute(
                        """
                        INSERT INTO Creator (
                            user_id,
                            follow_count,
                            view_count
                        ) VALUES (%s, %s, %s)
                        """,
                        (
                            user_id,
                            payload["follow_count"],
                            payload["view_count"],
                        ),
                    )
                elif role == "admin":
                    cursor.execute(
                        """
                        INSERT INTO Admin (user_id, department, hire_date)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            user_id,
                            payload["department"],
                            payload["hire_date"],
                        ),
                    )
                else:
                    raise ValueError(f"Unsupported signup role: {role}")

                conn.commit()
                return {"user_id": user_id, "email": payload["email"], "role": role}
            except Exception:
                conn.rollback()
                raise