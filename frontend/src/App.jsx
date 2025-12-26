// import { useState } from "react";
// import "./App.css";

// export default function App() {
//   const [prompt, setPrompt] = useState("");
//   const [dbName, setDbName] = useState("");
//   const [sql, setSql] = useState("");

//   const [tableName, setTableName] = useState("");
//   const [desc, setDesc] = useState([]);

//   const [insertRows, setInsertRows] = useState([]);

//   const [viewCols, setViewCols] = useState([]);
//   const [viewRows, setViewRows] = useState([]);
//   const [showView, setShowView] = useState(false);

//   const [mode, setMode] = useState("CREATE"); // CREATE | INSERT
//   const [history, setHistory] = useState([]);

//   /* ================= HISTORY ================= */
//   const saveHistory = () => {
//     setHistory((prev) => [{ id: Date.now(), sql, mode, tableName }, ...prev]);
//   };

//   const restoreHistory = (h) => {
//     setSql(h.sql);
//     setMode(h.mode);
//     setTableName(h.tableName);
//   };

//   const newChat = () => {
//     setPrompt("");
//     setSql("");
//     setDesc([]);
//     setInsertRows([]);
//     setViewCols([]);
//     setViewRows([]);
//     setShowView(false);
//     setMode("CREATE");
//   };

//   /* ================= GENERATE ================= */
//   const generateSQL = async () => {
//     const res = await fetch("http://localhost:5000/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ prompt }),
//     });

//     const data = await res.json();
//     if (!data.sql) return alert(data.error);

//     setSql(data.sql);
//     setDesc(data.desc);
//     setTableName(data.table);
//     setMode("CREATE");
//   };

//   /* ================= CREATE SQL REBUILD ================= */
//   const updateDescCell = (row, key, value) => {
//     const updated = [...desc];
//     updated[row][key] = value;
//     setDesc(updated);
//     rebuildCreateSQL(updated);
//   };

//   const rebuildCreateSQL = (schema) => {
//     const cols = schema.map((c) => {
//       let s = `\`${c.Field}\` ${c.Type}`;
//       if (c.Null === "NO") s += " NOT NULL";
//       if (c.Key === "PRI") s += " PRIMARY KEY";
//       if (c.Extra) s += ` ${c.Extra}`;
//       return s;
//     });

//     setSql(`CREATE TABLE \`${tableName}\` (\n  ${cols.join(",\n  ")}\n);`);
//   };

//   /* ================= VIEW DATA ================= */
//   const viewData = async () => {
//     if (!dbName.trim()) return alert("Database name required");

//     const res = await fetch("http://localhost:5000/execute", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         db_name: dbName,
//         sql: `SELECT * FROM \`${tableName}\`;`,
//       }),
//     });

//     const data = await res.json();
//     setViewCols(data.columns || []);
//     setViewRows(data.rows || []);
//     setShowView(true);
//   };

//   /* ================= AUTO REFRESH VIEW DATA ================= */
//   const refreshViewData = async () => {
//     if (!dbName.trim()) return;

//     const res = await fetch("http://localhost:5000/execute", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         db_name: dbName,
//         sql: `SELECT * FROM \`${tableName}\`;`,
//       }),
//     });

//     const data = await res.json();
//     if (data.success) {
//       setViewCols(data.columns || []);
//       setViewRows(data.rows || []);
//       setShowView(true);
//     }
//   };

//   /* ================= EXECUTE ================= */
//   const executeSQL = async () => {
//     if (!dbName.trim()) return alert("Database name required");

//     const res = await fetch("http://localhost:5000/execute", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ db_name: dbName, sql }),
//     });

//     const data = await res.json();
//     if (!data.success) return alert(data.error);

//     saveHistory();

//     if (mode === "CREATE") {
//       alert("Table created successfully");
//       setMode("INSERT");
//       setInsertRows([{}]);
//       setSql("");
//       return;
//     }

//     // INSERT / UPDATE / DELETE
//     alert("Query executed successfully");

//     // 🔥 AUTO REFRESH DATA
//     refreshViewData();
//   };

//   /* ================= INSERT ================= */
//   const addInsertRow = () => {
//     setInsertRows([...insertRows, {}]);
//   };

//   const deleteInsertRow = (index) => {
//     setInsertRows(insertRows.filter((_, i) => i !== index));
//   };

//   const updateInsertCell = (r, f, v) => {
//     const updated = [...insertRows];
//     updated[r][f] = v;
//     setInsertRows(updated);
//     buildInsertSQL(updated);
//   };

//   const buildInsertSQL = (rows) => {
//     const cols = desc.map((c) => `\`${c.Field}\``);
//     const values = rows.map(
//       (r) =>
//         "(" +
//         cols.map((c) => `'${r[c.replace(/`/g, "")] || ""}'`).join(", ") +
//         ")"
//     );

//     setSql(
//       `INSERT INTO \`${tableName}\` (${cols.join(", ")}) VALUES ${values.join(
//         ", "
//       )};`
//     );
//   };

//   /* ================= UPDATE / DELETE ================= */
//   const generateUpdateSQL = (row) => {
//     const pk = desc.find((c) => c.Key === "PRI")?.Field || desc[0].Field;
//     const setPart = desc
//       .filter((c) => c.Field !== pk)
//       .map((c) => `\`${c.Field}\`='${row[c.Field] || ""}'`)
//       .join(", ");

//     setSql(
//       `UPDATE \`${tableName}\` SET ${setPart} WHERE \`${pk}\`='${
//         row[pk] || ""
//       }';`
//     );
//   };

//   const generateDeleteSQL = (row) => {
//     const pk = desc.find((c) => c.Key === "PRI")?.Field || desc[0].Field;
//     setSql(`DELETE FROM \`${tableName}\` WHERE \`${pk}\`='${row[pk] || ""}';`);
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="layout">
//       {/* HISTORY */}
//       <div className="history">
//         <button onClick={newChat}>+ New Chat</button>
//         <h3>History</h3>
//         {history.map((h) => {
//           const type = h.sql.split(" ")[0].toUpperCase();

//           const color =
//             type === "CREATE"
//               ? "#22c55e"
//               : type === "INSERT"
//               ? "#38bdf8"
//               : type === "UPDATE"
//               ? "#facc15"
//               : type === "DELETE"
//               ? "#ef4444"
//               : "#94a3b8";

//           return (
//             <div
//               key={h.id}
//               className="history-item"
//               onClick={() => restoreHistory(h)}
//             >
//               <div className="history-top">
//                 <span className="history-type" style={{ color }}>
//                   {type}
//                 </span>
//                 <span className="history-table">{h.tableName || ""}</span>
//               </div>

//               <div className="history-sql">
//                 {h.sql.replace(/\s+/g, " ").slice(0, 80)}...
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* MAIN */}
//       <div className="app">
//         <h1>Smart SQL Generator</h1>

//         {/* CREATE */}
//         {mode === "CREATE" && (
//           <>
//             <textarea
//               placeholder="Create table student with id, name"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//             />
//             <button onClick={generateSQL}>Generate SQL</button>
//             <pre>{sql}</pre>

//             <table>
//               <tbody>
//                 {desc.map((r, i) => (
//                   <tr key={i}>
//                     {Object.keys(r).map((k) => (
//                       <td key={k}>
//                         <input
//                           value={r[k]}
//                           onChange={(e) => updateDescCell(i, k, e.target.value)}
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <input
//               placeholder="Database name"
//               value={dbName}
//               onChange={(e) => setDbName(e.target.value)}
//             />
//             <button onClick={executeSQL}>Execute SQL</button>
//           </>
//         )}

//         {/* INSERT */}
//         {mode === "INSERT" && (
//           <>
//             <input
//               placeholder="Database name"
//               value={dbName}
//               onChange={(e) => setDbName(e.target.value)}
//             />

//             <pre>{sql}</pre>

//             <button onClick={executeSQL}>Execute SQL</button>

//             <table>
//               <thead>
//                 <tr>
//                   {desc.map((c) => (
//                     <th key={c.Field}>{c.Field}</th>
//                   ))}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {insertRows.map((row, i) => (
//                   <tr key={i}>
//                     {desc.map((c) => (
//                       <td key={c.Field}>
//                         <input
//                           value={row[c.Field] || ""}
//                           onChange={(e) =>
//                             updateInsertCell(i, c.Field, e.target.value)
//                           }
//                         />
//                       </td>
//                     ))}
//                     <td>
//                       <button onClick={() => generateUpdateSQL(row)}>
//                         Update
//                       </button>
//                       <button onClick={() => generateDeleteSQL(row)}>
//                         Delete
//                       </button>
//                       <button onClick={() => deleteInsertRow(i)}>Remove</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <div style={{ marginTop: "20px" }}>
//               <button onClick={addInsertRow}>Add Row</button>
//               <button style={{ marginLeft: "10px" }} onClick={viewData}>
//                 View Data
//               </button>
//             </div>

//             {showView && (
//               <div style={{ marginTop: "30px" }}>
//                 <h3>Table Data</h3>
//                 {viewRows.length === 0 ? (
//                   <p>No data found</p>
//                 ) : (
//                   <table>
//                     <thead>
//                       <tr>
//                         {viewCols.map((c) => (
//                           <th key={c}>{c}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {viewRows.map((r, i) => (
//                         <tr key={i}>
//                           {r.map((v, j) => (
//                             <td key={j}>{v}</td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import "./App.css";
import useSqlStore from "./store/useSQLStore";
import HistoryPanel from "./components/History";
import CreateTable from "./components/CreateTable";
import InsertData from "./components/Insert";

export default function App() {
  const mode = useSqlStore((s) => s.mode);

  return (
    <div className="layout">
      <HistoryPanel />

      <div className="app">
        <h1>Smart SQL Generator</h1>
        {mode === "CREATE" && <CreateTable />}
        {mode === "INSERT" && <InsertData />}
      </div>
    </div>
  );
}