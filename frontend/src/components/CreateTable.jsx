import useSqlStore from "../store/useSQLStore";
import DatabaseSelector from "./DatabaseSelector";


const DATA_TYPES = [
  "INT",
  "SMALLINT",
  "BIGINT",
  "FLOAT",
  "DOUBLE",
  "DECIMAL(10,2)",
  "CHAR(1)",
  "CHAR(10)",
  "VARCHAR(50)",
  "VARCHAR(100)",
  "VARCHAR(255)",
  "TEXT",
  "MEDIUMTEXT",
  "LONGTEXT",
  "DATE",
  "TIME",
  "DATETIME",
  "TIMESTAMP",
  "YEAR",
  "BOOLEAN",
  "BINARY",
  "VARBINARY",
  "BLOB",
  "ENUM('Y','N')",
  "SET('A','B','C')"
];

export default function CreateTable() {
  const {
    prompt,
    setPrompt,
    sql,
    desc,
    setDesc,
    dbName,
    setDbName,
    tableName,
    setSql,
    setTableName,
    setMode,
    saveHistory,
  } = useSqlStore();

  const generateSQL = async () => {
    const res = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!data.sql) return alert(data.error);

    setSql(data.sql);
    setDesc(data.desc);
    setTableName(data.table);
  };

  const rebuildCreateSQL = (schema) => {
    const cols = schema.map((c) => {
      let s = `\`${c.Field}\` ${c.Type}`;
      if (c.Null === "NO") s += " NOT NULL";
      if (c.Key === "PRI") s += " PRIMARY KEY";
      if (c.Extra) s += ` ${c.Extra}`;
      return s;
    });

    setSql(`CREATE TABLE \`${tableName}\` (\n  ${cols.join(",\n  ")}\n);`);
  };

  const updateDescCell = (row, key, value) => {
    const updated = [...desc];
    updated[row][key] = value;
    setDesc(updated);
    rebuildCreateSQL(updated);
  };

  const executeSQL = async () => {
    if (!dbName.trim()) return alert("Database name required");

    const res = await fetch("http://localhost:5000/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db_name: dbName, sql }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    saveHistory();
    setMode("INSERT");
    setSql("");
  };

  return (
    <>
        
      {/* PROMPT */}
      <div className="card">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Recommended format:
Create vendor table with
vendor code 15,
vendor name 30,
status 1`}
        />
        <button className="primary" onClick={generateSQL}>
          Generate SQL
        </button>
          <input
            placeholder="Database name"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
          />
          <button className="execute" onClick={executeSQL}>
            Execute SQL
          </button>
        </div>
      

      {/* SQL */}
      {sql && (
        <div className="card">
          <h3>Generated SQL</h3>
          <pre>{sql}</pre>
        </div>
      )}

      {/* DESC TABLE */}
      {desc.length > 0 && (
        <div className="card">
          <h3>Editable Table Structure</h3>
          <table className="desc-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Null</th>
                <th>Key</th>
                <th>Extra</th>
              </tr>
            </thead>
            <tbody>
              {desc.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={row.Field}
                      onChange={(e) =>
                        updateDescCell(i, "Field", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <select
                      value={row.Type}
                      onChange={(e) =>
                        updateDescCell(i, "Type", e.target.value)
                      }
                    >
                      {DATA_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.Null}
                      onChange={(e) =>
                        updateDescCell(i, "Null", e.target.value)
                      }
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.Key}
                      onChange={(e) =>
                        updateDescCell(i, "Key", e.target.value)
                      }
                    >
                      <option value="">—</option>
                      <option value="PRI">PRIMARY</option>
                      <option value="UNI">UNIQUE</option>
                    </select>
                  </td>

                  <td>
                    <input
                      placeholder="AUTO_INCREMENT"
                      value={row.Extra || ""}
                      onChange={(e) =>
                        updateDescCell(i, "Extra", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    
    </>
  );
}
