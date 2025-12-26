import mysql.connector
from config import MYSQL_CONFIG


def table_exists(cursor, table_name):
    cursor.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor.fetchone() is not None


def execute_sql(sql: str, db_name: str, table_name: str | None = None):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()

    try:
        # Ensure DB
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
        cur.execute(f"USE `{db_name}`")

        # CREATE TABLE SAFETY
        if sql.lower().startswith("create") and table_name:
            if table_exists(cur, table_name):
                return {
                    "success": False,
                    "error": f"Table '{table_name}' already exists"
                }

        result = {}

        # SELECT
        if sql.strip().lower().startswith("select"):
            cur.execute(sql)
            result["columns"] = [c[0] for c in cur.description]
            result["rows"] = cur.fetchall()

        # INSERT / UPDATE / DELETE
        else:
            statements = [s.strip() for s in sql.split(";") if s.strip()]

            affected = 0
            for stmt in statements:
                cur.execute(stmt)
                affected += cur.rowcount

            conn.commit()
            result["affected_rows"] = affected

        return {
            "success": True,
            "result": result
        }

    except Exception as e:
        conn.rollback()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        cur.close()
        conn.close()
