from flask import Flask, request, jsonify
from flask_cors import CORS

from parser import parse_prompt
from mysql_exec import execute_sql
from rules import validate_sql_safety

app = Flask(__name__)
CORS(app)

@app.post("/generate")
def generate():
    try:
        return jsonify(parse_prompt(request.json["prompt"]))
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.get("/databases")
def get_databases():
    import mysql.connector
    from config import MYSQL_CONFIG

    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()

    cur.execute("SHOW DATABASES")
    dbs = [d[0] for d in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({"success": True, "databases": dbs})

@app.post("/tables")
def get_tables():
    import mysql.connector
    from config import MYSQL_CONFIG

    db_name = request.json["db_name"]

    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()

    cur.execute(f"USE `{db_name}`")
    cur.execute("SHOW TABLES")
    tables = [t[0] for t in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({"success": True, "tables": tables})


@app.post("/execute")
def execute():
    data = request.json
    try:
        sql = data["sql"]
        db_name = data["db_name"]
        table_name = data.get("table")

        validate_sql_safety(sql)

        # execute_sql already returns a dict:
        # {
        #   success: True,
        #   columns: [...],
        #   rows: [...]
        # }
        result = execute_sql(sql, db_name, table_name)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })



if __name__ == "__main__":
    app.run(port=5000, debug=True)
