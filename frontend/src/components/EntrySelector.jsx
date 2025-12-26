import useSqlStore from "../store/useSQLStore";

export default function EntrySelector() {
  const { setEntryMode, setMode } = useSqlStore();

  const createNew = () => {
    setEntryMode("CREATE_NEW");
    setMode("CREATE");
  };

  const workExisting = () => {
    setEntryMode("WORK_EXISTING");
    setMode("INSERT");
  };

  return (
    <section>
      <h2>What do you want to do?</h2>

      <label style={{ display: "block", marginTop: "15px" }}>
        <input type="radio" name="entry" onChange={createNew} />
        Create New Table
      </label>

      <label style={{ display: "block", marginTop: "10px" }}>
        <input type="radio" name="entry" onChange={workExisting} />
        Work With Existing Table
      </label>
    </section>
  );
}
