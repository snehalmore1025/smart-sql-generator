import { useEffect, useState } from "react";
import useSqlStore from "../store/useSQLStore";

export default function DatabaseSelector() {
  const { dbName, setDbName } = useSqlStore();
  const [databases, setDatabases] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/databases")
      .then((r) => r.json())
      .then((d) => setDatabases(d.databases || []));
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      <label>Select Database</label>

      <select
        value={dbName}
        onChange={(e) => setDbName(e.target.value)}
        style={{ width: "100%", marginTop: "5px" }}
      >
        <option value="">-- Select Existing Database --</option>
        {databases.map((db) => (
          <option key={db} value={db}>
            {db}
          </option>
        ))}
      </select>

      <input
        placeholder="Or enter new database name"
        value={dbName}
        onChange={(e) => setDbName(e.target.value)}
        style={{ marginTop: "8px", width: "100%" }}
      />
    </div>
  );
}
