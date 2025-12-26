import useSqlStore from "../store/useSQLStore";
export default function HistoryPanel() {
    const { history, restoreHistory, newChat } = useSqlStore();
  return (
    <div className="history">
      <button onClick={newChat}>+ New Chat</button>
      <h3>History</h3>

      {history.map((h) => {
        const type = h.sql.split(" ")[0].toUpperCase();

        const color =
          type === "CREATE"
            ? "#22c55e"
            : type === "INSERT"
            ? "#38bdf8"
            : type === "UPDATE"
            ? "#facc15"
            : type === "DELETE"
            ? "#ef4444"
            : "#94a3b8";

        return (
          <div
            key={h.id}
            className="history-item"
            onClick={() => restoreHistory(h)}
          >
            <div className="history-top">
              <span className="history-type" style={{ color }}>
                {type}
              </span>
              <span className="history-table">{h.tableName}</span>
            </div>

            <div className="history-sql">
              {h.sql.replace(/\s+/g, " ").slice(0, 80)}...
            </div>
          </div>
        );
      })}
    </div>
  );
}