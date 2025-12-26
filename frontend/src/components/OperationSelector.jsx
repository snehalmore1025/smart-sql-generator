import useSqlStore from "../store/useSQLStore";

export default function OperationSelector() {
  const { mode, setMode } = useSqlStore();

  return (
    <section>
      <h3>What do you want to do?</h3>

      <label>
        <input
          type="radio"
          checked={mode === "CREATE"}
          onChange={() => setMode("CREATE")}
        />
        Create New Table
      </label>

      <label style={{ marginLeft: 20 }}>
        <input
          type="radio"
          checked={mode === "INSERT"}
          onChange={() => setMode("INSERT")}
        />
        Work With Existing Table
      </label>
    </section>
  );
}
