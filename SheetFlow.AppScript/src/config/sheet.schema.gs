const SheetSchema = {
  BACKLOGS: {
    SHEET_NAME: "Backlogs",
    START_ROW: 3,
    START_COL: 1,
    NUM_COLS: 7,
    FIELDS: {
      PROJECT: 1,
      TASK_NAME: 2,
      PRIORITY: 3,
      STATUS: 4,
      WORK_DATE: 5,
      NOTE: 6,
      PINNED: 7
    }
  },
  DAILY: {
    SHEET_NAME: "Daily Report",
    START_ROW: 14,
    DATE_COL: 1,
    GOALS_COL: 5,
    FINISHED_COL: 6
  }
};
