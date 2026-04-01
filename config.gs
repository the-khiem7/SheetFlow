const CONFIG = {
  BACKLOGS: {
    SHEET_NAME: "Backlogs",
    START_ROW: 3,
    START_COL: 1,
    NUM_COLS: 7,
    SORT_RULES: [
      { column: 5, ascending: false }, // Date
      { column: 4, ascending: false }, // Status
      { column: 3, ascending: true },  // Priority
      { column: 1, ascending: true }   // Project A-Z
    ]
  },
  DAILY: {
    SHEET_NAME: "Daily Report",
    START_ROW: 14,
    DATE_COL: 1,
    GOALS_COL: 5,
    FINISHED_COL: 6
  }
};
