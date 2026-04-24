import os

from dotenv import load_dotenv
from mysql.connector import ClientFlag, pooling

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "database": os.getenv("DB_NAME", "erfinder"),
    "use_pure": True,
    "client_flags": [ClientFlag.MULTI_STATEMENTS],
}

_connection_pool = None

def get_pool():
    global _connection_pool
    if _connection_pool is None:
        _connection_pool = pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=int(os.getenv("DB_CONN_LIMIT", 5)),
            pool_reset_session=True,
            **dbconfig
        )
    return _connection_pool

class PooledDBConn:
    def __enter__(self):
        pool = get_pool()
        self.conn = pool.get_connection()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn.is_connected():
            self.conn.close()

def get_db_connection():
    return PooledDBConn()