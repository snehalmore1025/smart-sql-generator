import {create} from 'zustand';
const useSqlStore=create((set,get)=>({
    prompt: "",
  dbName: "",
  sql: "",
  tableName: "",
  desc: [],
  insertRows: [],
  viewCols: [],
  viewRows: [],
  showView: false,
  mode: "CREATE",
  history: [],
  setPrompt: (prompt) => set({ prompt }),
  setDbName: (dbName) => set({ dbName }),
  setSql: (sql) => set({ sql }),
  setTableName: (tableName) => set({ tableName }),
  setDesc: (desc) => set({ desc }),
  setInsertRows: (rows) => set({ insertRows: rows }),
  setViewCols: (cols) => set({ viewCols: cols }),
  setViewRows: (rows) => set({ viewRows: rows }),
  setShowView: (val) => set({ showView: val }),
  setMode: (mode) => set({ mode }),
  
  saveHistory: () => {
    const { sql, mode, tableName, history } = get();
    set({
      history: [
        { id: Date.now(), sql, mode, tableName },
        ...history,
      ],
    });
  },

  restoreHistory: (h) =>
    set({
      sql: h.sql,
      mode: h.mode,
      tableName: h.tableName,
    }),

  newChat: () =>
    set({
      prompt: "",
      sql: "",
      desc: [],
      insertRows: [],
      viewCols: [],
      viewRows: [],
      showView: false,
      mode: "CREATE",
    }),
    entryMode: null, // "CREATE_NEW" | "WORK_EXISTING"

setEntryMode: (entryMode) => set({ entryMode }),


}))
export default useSqlStore;