import os

from connection import get_db_connection

def run_sql_file(filename: str):
    filepath = os.path.join(os.path.dirname(__file__), "mysql/seed", filename)
    with open(filepath, "r") as f:
        sql = f.read()

    with get_db_connection() as conn:
        with conn.cursor(buffered=True) as cursor:
            print(f"Executing {filename}...")
            
            cursor.execute(sql)

            while cursor.nextset():
                pass
            
            conn.commit()


if __name__ == "__main__":
    # Seed DDL
    print("Seeding DDL...")
    run_sql_file("SeedDDL.sql")
    print("DDL Seeded Successfully")

    # Seed Dummy Data
    print("Seeding Dummy Data...")
    run_sql_file("seedDML.sql")
    print("Dummy Data Seeded Successfully")

    # Seed Stored Procedures
    print("Seeding Stored Procedures...")
    run_sql_file("SeedStoredProcedures.sql")
    print("Stored Procedures Seeded Successfully")