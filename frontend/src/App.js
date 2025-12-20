import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [db, setDb] = useState("mysql");
  const [dbName, setDbName] = useState("");

  const generate = async () => {
    const res = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    setResult(await res.json());
  };

  const execute = async () => {
    if (!dbName) {
      alert("Please enter database name");
      return;
    }

    await fetch("http://localhost:5000/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        database: db,
        db_name: dbName,
        sql: result.sql,
        table: result.table,
        desc: result.desc
      })
    });

    alert("Executed successfully");
  };

  return (
    <div className="app">
      <h1>Smart SQL Generator</h1>

      <textarea
        placeholder="Create table employee with id primary key, name, salary"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <button className="primary" onClick={generate}>
        Generate
      </button>

      {result && (
        <>
          <pre className="sql">{result.sql}</pre>

          <table>
            <thead>
              <tr>
                {Object.keys(result.desc[0]).map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.desc.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="execute">
            <select value={db} onChange={e => setDb(e.target.value)}>
              <option value="mysql">MySQL</option>
              <option value="mongodb">MongoDB</option>
            </select>

            <input
              placeholder="Database Name"
              value={dbName}
              onChange={e => setDbName(e.target.value)}
            />

            <button className="execute-btn" onClick={execute}>
              Execute
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
