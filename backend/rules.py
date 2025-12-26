def is_primary_key_candidate(column_name: str) -> bool:
    name = column_name.lower()
    return (
        name == "id"
        or name.endswith("id")
        or name.endswith("_id")
        or name.startswith("id_")
        or name.endswith("no")
        or name.endswith("_no")
        or name.endswith("code")
        or name.endswith("_code")
    )


def infer_type_from_name(column_name: str) -> str:
    name = column_name.lower()

    if is_primary_key_candidate(name):
        return "INT"

    if "age" in name or "count" in name or "quantity" in name or "number" in name:
        return "INT"

    if "salary" in name or "amount" in name or "price" in name:
        return "DECIMAL(10,2)"

    if "date" in name or "dob" in name or "created" in name or "doj" in name:
        return "DATE"

    if "email" in name:
        return "VARCHAR(255)"

    if "name" in name:
        return "VARCHAR(100)"

    return "VARCHAR(255)"


def validate_sql_safety(sql: str):
    s = sql.lower().strip()

    if s.startswith("update") and "where" not in s:
        raise ValueError("UPDATE without WHERE is not allowed")

    if s.startswith("delete") and "where" not in s:
        raise ValueError("DELETE without WHERE is not allowed")
