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



@app.post("/execute")
def execute():
    data = request.json
    try:
        sql = data["sql"]
        db_name = data["db_name"]

        validate_sql_safety(sql)

        # execute_sql already returns a dict:
        # {
        #   success: True,
        #   columns: [...],
        #   rows: [...]
        # }
        result = execute_sql(sql, db_name)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })



if __name__ == "__main__":
    app.run(port=5000, debug=True)
