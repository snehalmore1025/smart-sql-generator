import { useState } from "react";
import useSqlStore from "../store/useSQLStore";
import DatabaseSelector from "./DatabaseSelector";

export default function InsertData() {
  const {
    desc,
    insertRows,
    setInsertRows,
    sql,
    setSql,
    dbName,
    setDbName,
    saveHistory,
    tableName,
    viewCols,
    viewRows,
    setViewCols,
    setViewRows,
    showView,
    setShowView,
  } = useSqlStore();

  /* ================= PRIMARY KEY ================= */

  const pkField =
    desc.find((c) => c.Key === "PRI")?.Field || desc[0].Field;

  const pkIndex = viewCols.indexOf(pkField);

  /* ================= LOCAL STATE ================= */

  const [selectedIds, setSelectedIds] = useState(new Set());

  /* ================= INSERT ================= */

  const addInsertRow = () => {
    setInsertRows([...insertRows, {}]);
    rebuildInsertSQL([...insertRows, {}]);
  };

  const removeInsertRow = (rowIndex) => {
    const updated = insertRows.filter((_, i) => i !== rowIndex);
    setInsertRows(updated);
    rebuildInsertSQL(updated);
  };

  const updateInsertCell = (r, f, v) => {
    const updated = [...insertRows];
    updated[r] = { ...updated[r], [f]: v };
    setInsertRows(updated);
    rebuildInsertSQL(updated);
  };

  const rebuildInsertSQL = (rows) => {
    if (!rows.length) {
      setSql("");
      return;
    }

    const cols = desc.map((c) => `\`${c.Field}\``);

    const values = rows.map(
      (r) =>
        "(" +
        cols.map((c) => `'${r[c.replace(/`/g, "")] || ""}'`).join(", ") +
        ")"
    );

    setSql(
      `INSERT INTO \`${tableName}\` (${cols.join(", ")}) VALUES ${values.join(
        ", "
      )};`
    );
  };

  /* ================= VIEW DATA ================= */

  const viewData = async () => {
    if (!dbName.trim()) return alert("Database name required");

    const res = await fetch("http://localhost:5000/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        db_name: dbName,
        sql: `SELECT * FROM \`${tableName}\`;`,
      }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    setViewCols(data.result.columns || []);
    setViewRows(data.result.rows || []);
    setShowView(true);
    setSelectedIds(new Set()); // ✅ CLEAR SELECTION
  };

  /* ================= SELECTION ================= */

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const loadSelectedForEdit = () => {
    if (!selectedIds.size) return alert("Select records first");

    const rows = viewRows
      .filter((r) => selectedIds.has(r[pkIndex]))
      .map((r) =>
        Object.fromEntries(desc.map((c, i) => [c.Field, r[i]]))
      );

    setInsertRows(rows);
    setSql("");
    setSelectedIds(new Set()); // ✅ RESET CHECKBOX STATE
  };

  /* ================= UPDATE / DELETE ================= */

  const generateUpdateSQL = () => {
    if (!insertRows.length) return alert("Nothing to update");

    const queries = insertRows.map((row) => {
      const setPart = desc
        .filter((c) => c.Field !== pkField)
        .map((c) => `\`${c.Field}\`='${row[c.Field] || ""}'`)
        .join(", ");

      return `UPDATE \`${tableName}\` SET ${setPart} WHERE \`${pkField}\`='${row[pkField]}';`;
    });

    setSql(queries.join("\n"));
  };

  const generateDeleteSQL = () => {
    if (!insertRows.length) return alert("Nothing to delete");

    const queries = insertRows.map(
      (row) =>
        `DELETE FROM \`${tableName}\` WHERE \`${pkField}\`='${row[pkField]}';`
    );

    setSql(queries.join("\n"));
  };

  /* ================= UNDO ================= */

  const undoEdit = () => {
    setInsertRows([]);
    setSql("");
    setSelectedIds(new Set());
  };

  /* ================= EXECUTE ================= */

  const executeSQL = async () => {
    if (!dbName.trim() || !sql.trim())
      return alert("Missing DB or SQL");

    const res = await fetch("http://localhost:5000/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db_name: dbName, sql }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    saveHistory();

    // ✅ FULL RESET AFTER EXECUTE
    setInsertRows([]);
    setSql("");
    setSelectedIds(new Set());
    viewData();
  };

  /* ================= UI ================= */

  return (
    <>
        
      <div className="insert-card">
        <h3>Editable Data</h3>

        <input
          placeholder="Database name"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />

        <pre>{sql}</pre>

        <div className="insert-controls">
          <button onClick={generateUpdateSQL}>Generate UPDATE</button>
          <button onClick={generateDeleteSQL}>Generate DELETE</button>
          <button onClick={undoEdit}>Undo</button>
          <button className="execute" onClick={executeSQL}>
            Execute SQL
          </button>
        </div>

        <table className="insert-table">
          <thead>
            <tr>
              {desc.map((c) => (
                <th key={c.Field}>{c.Field}</th>
              ))}
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {insertRows.map((row, i) => (
              <tr key={i}>
                {desc.map((c) => (
                  <td key={c.Field}>
                    <input
  type={
    c.Type?.toLowerCase().includes("date")
      ? "date"
      : c.Type?.toLowerCase().includes("time")
      ? "datetime-local"
      : "text"
  }
  value={row[c.Field] || ""}
  onChange={(e) =>
    updateInsertCell(i, c.Field, e.target.value)
  }
/>

                  </td>
                ))}
                <td>
                  <button onClick={() => removeInsertRow(i)}>✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addInsertRow}>Add Row (Insert)</button>
      </div>

      {showView && (
        <div className="insert-card">
          <h3>Table Data</h3>

          <table className="insert-table">
            <thead>
              <tr>
                <th>Select</th>
                {viewCols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewRows.map((row, i) => {
                const id = row[pkIndex];
                return (
                  <tr key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => toggleSelection(id)}
                      />
                    </td>
                    {row.map((v, j) => (
                      <td key={j}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={loadSelectedForEdit}>
            Edit Selected Records
          </button>
        </div>
      )}
    </>
  );
}
