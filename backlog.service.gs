const BacklogService = {
  handleEdit(sheet, e) {
    const cfg = CONFIG.BACKLOGS;
    if (e.range.rowStart < cfg.START_ROW) return;

    const editedCol = e.range.columnStart;
    if (editedCol < cfg.START_COL || editedCol > cfg.START_COL + cfg.NUM_COLS - 1) return;

    this.sortAndFormat(sheet);
  },

  sortAndFormat(sheet) {
    const cfg = CONFIG.BACKLOGS;
    const range = Utils.getDataRange(sheet, cfg.START_ROW, cfg.START_COL, cfg.NUM_COLS);
    if (!range) return;

    range.sort(cfg.SORT_RULES);
    FormatService.applyDateBorders(sheet, cfg.START_ROW, cfg.NUM_COLS);
    FormatService.applyAlignment(sheet, cfg.START_ROW, cfg.NUM_COLS);
  },

  sortManual() {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return;
    this.sortAndFormat(sheet);
  }
};
