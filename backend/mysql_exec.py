import mysql.connector
from config import MYSQL_CONFIG

def execute_sql(sql: str, db_name: str):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()

    # Ensure DB exists and is selected
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
    cur.execute(f"USE `{db_name}`")

    sql_clean = sql.strip().lower()
    result = {"success": True}

    try:
        # ---------- SELECT ----------
        if sql_clean.startswith("select"):
            cur.execute(sql)
            result["columns"] = [c[0] for c in cur.description]
            result["rows"] = cur.fetchall()

        # ---------- CREATE / INSERT / UPDATE / DELETE ----------
        else:
            cur.execute(sql)
            conn.commit()
            result["affected_rows"] = cur.rowcount

    except Exception as e:
        conn.rollback()
        result = {
            "success": False,
            "error": str(e)
        }

    finally:
        cur.close()
        conn.close()

    return result
