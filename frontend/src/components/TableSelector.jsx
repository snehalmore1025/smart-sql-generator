/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import useSqlStore from "../store/useSQLStore";

export default function TableSelector() {
  const { dbName, tableName, setTableName, mode } = useSqlStore();
  const [tables, setTables] = useState([]);

  const loadTables = useCallback(async () => {
    if (!dbName) {
      setTables([]);
      setTableName("");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_name: dbName }),
      });

      const data = await res.json();
      setTables(data.tables || []);
    } catch (err) {
      console.error(err);
      setTables([]);
    }
  }, [dbName, setTableName]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  if (mode === "CREATE") return null;

  return (
    <section>
      <h3>Select Table</h3>

      <select
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        disabled={!dbName}
      >
        <option value="">-- Select Table --</option>
        {tables.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </section>
  );
}
