import re
from rules import is_primary_key_candidate, infer_type_from_name


def infer_type(col_text: str, col_name: str):
    t = col_text.lower()

    # Detect length like "30" or "15 characters"
    m = re.search(r"(\d+)", t)
    length = m.group(1) if m else None

    if "int" in t:
        return "INT"

    if "decimal" in t:
        return "DECIMAL(10,2)"

    if "date" in t:
        return "DATE"

    if length:
        return f"VARCHAR({length})"

    return infer_type_from_name(col_name)


def parse_prompt(prompt: str):
    prompt = prompt.strip().lower()

    if prompt.startswith("create"):
        table = re.search(r"table\s+(\w+)", prompt).group(1)
        cols_part = prompt.split("with", 1)[1]

        columns = re.split(",| and ", cols_part)
        schema = []

        for col in columns:
            name = re.search(r"\w+", col).group()
            pk = is_primary_key_candidate(name)

            schema.append({
                "Field": name,
                "Type": infer_type(col, name),
                "Null": "NO" if pk else "YES",
                "Key": "PRI" if pk else "",
                # ❗ auto increment not forced
                "Extra": ""
            })

        sql = build_create_sql(table, schema)

        return {
            "success": True,
            "operation": "CREATE",
            "table": table,
            "desc": schema,
            "sql": sql
        }

    return {
        "success": True,
        "operation": "RAW",
        "sql": prompt
    }


def build_create_sql(table, schema):
    lines = []

    for c in schema:
        line = f"{c['Field']} {c['Type']}"

        if c["Key"] == "PRI":
            line += " PRIMARY KEY"

        if c["Null"] == "NO":
            line += " NOT NULL"

        if c["Extra"]:
            line += f" {c['Extra']}"

        lines.append(line)

    return f"CREATE TABLE {table} (\n  " + ",\n  ".join(lines) + "\n);"
