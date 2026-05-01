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
    seeds = ["DDL","StoredProcedures","Triggers","DML"]

    for seed in seeds:
        print("Seeding "+seed+"...")
        run_sql_file("Seed"+seed+".sql")
        print(seed+" Seeded Successfully")