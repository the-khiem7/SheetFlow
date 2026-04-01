const BacklogService = {
  handleEdit(sheet, e) {
    const cfg = CONFIG.BACKLOGS;
    if (e.range.rowStart < cfg.START_ROW) return;

    const editedCol = e.range.columnStart;
    if (editedCol < cfg.START_COL || editedCol > cfg.START_COL + cfg.NUM_COLS - 1) return;

    // Column guard: only sort on edits to Project (1), Priority (3), Date (5), or Pinned (7)
    const sortTriggerColumns = [1, 3, 5, 7]; // 1-indexed columns
    if (!sortTriggerColumns.includes(editedCol)) return;

    this.sortAndFormat(sheet);
  },

  sortAndFormat(sheet) {
    const cfg = CONFIG.BACKLOGS;
    const range = Utils.getDataRange(sheet, cfg.START_ROW, cfg.START_COL, cfg.NUM_COLS);
    if (!range) return;

    // Get current values
    const originalValues = range.getValues();

    // Sort using SortService
    const sortedValues = SortService.sortRows(originalValues);

    // Only write back if order changed
    if (SortService.isOrderChanged(originalValues, sortedValues)) {
      range.setValues(sortedValues);
    }

    FormatService.applyDateBorders(sheet, cfg.START_ROW, cfg.NUM_COLS);
    FormatService.applyAlignment(sheet, cfg.START_ROW, cfg.NUM_COLS);
  },

  sortManual() {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return;
    this.sortAndFormat(sheet);
  },

  setupPinnedColumn() {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return;

    const cfg = CONFIG.BACKLOGS;
    const lastRow = sheet.getLastRow();
    if (lastRow < cfg.START_ROW) return;

    // Add checkbox validation to Pinned column (G)
    const pinnedRange = sheet.getRange(cfg.START_ROW, 7, lastRow - cfg.START_ROW + 1, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build();
    pinnedRange.setDataValidation(rule);
  }
};
