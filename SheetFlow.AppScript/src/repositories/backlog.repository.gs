const BacklogRepository = {
  getSheet() {
    return SpreadsheetRepository.getSheetByName(SheetSchema.BACKLOGS.SHEET_NAME);
  },

  getDataRange() {
    const sheet = this.getSheet();
    if (!sheet) return null;
    return Utils.getDataRange(
      sheet,
      SheetSchema.BACKLOGS.START_ROW,
      SheetSchema.BACKLOGS.START_COL,
      SheetSchema.BACKLOGS.NUM_COLS
    );
  },

  getRows() {
    const range = this.getDataRange();
    if (!range) return [];
    return SpreadsheetRepository.getValues(range);
  },

  replaceRows(rows) {
    const range = this.getDataRange();
    if (!range || rows.length === 0) return;
    SpreadsheetRepository.setValues(range, rows);
  },

  appendRow(rowData) {
    const sheet = this.getSheet();
    if (!sheet) return null;

    const newRow = SpreadsheetRepository.getLastRow(sheet) + 1;
    const range = SpreadsheetRepository.getRange(
      sheet,
      newRow,
      SheetSchema.BACKLOGS.START_COL,
      1,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.setValues(range, [rowData]);
    return newRow;
  },

  updateRow(rowId, rowData) {
    const sheet = this.getSheet();
    if (!sheet) return false;

    const range = SpreadsheetRepository.getRange(
      sheet,
      rowId,
      SheetSchema.BACKLOGS.START_COL,
      1,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.setValues(range, [rowData]);
    return true;
  },

  clearRow(rowId) {
    const sheet = this.getSheet();
    if (!sheet) return false;

    const range = SpreadsheetRepository.getRange(
      sheet,
      rowId,
      SheetSchema.BACKLOGS.START_COL,
      1,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.clearRange(range);
    return true;
  },

  setupPinnedColumn() {
    const sheet = this.getSheet();
    if (!sheet) return;

    const lastRow = SpreadsheetRepository.getLastRow(sheet);
    if (lastRow < SheetSchema.BACKLOGS.START_ROW) return;

    const pinnedRange = SpreadsheetRepository.getRange(
      sheet,
      SheetSchema.BACKLOGS.START_ROW,
      SheetSchema.BACKLOGS.FIELDS.PINNED,
      lastRow - SheetSchema.BACKLOGS.START_ROW + 1,
      1
    );
    pinnedRange.setDataValidation(SpreadsheetRepository.createCheckboxRule());
  },

  clearBordersForRow(rowNumber) {
    const sheet = this.getSheet();
    if (!sheet) return;

    const range = SpreadsheetRepository.getRange(
      sheet,
      rowNumber,
      SheetSchema.BACKLOGS.START_COL,
      1,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.clearBorders(range);
  },

  clearBordersForRows(startRow, numRows) {
    const sheet = this.getSheet();
    if (!sheet || numRows <= 0) return;

    const range = SpreadsheetRepository.getRange(
      sheet,
      startRow,
      SheetSchema.BACKLOGS.START_COL,
      numRows,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.clearBorders(range);
  },

  setTopBorderForRow(rowNumber) {
    const sheet = this.getSheet();
    if (!sheet) return;

    const range = SpreadsheetRepository.getRange(
      sheet,
      rowNumber,
      SheetSchema.BACKLOGS.START_COL,
      1,
      SheetSchema.BACKLOGS.NUM_COLS
    );
    SpreadsheetRepository.setTopBorder(range);
  },

  applyAlignments(startRow, numRows) {
    const sheet = this.getSheet();
    if (!sheet || numRows <= 0) return;

    SpreadsheetRepository.setHorizontalAlignment(
      SpreadsheetRepository.getRange(sheet, startRow, SheetSchema.BACKLOGS.FIELDS.PROJECT, numRows, 1),
      "center"
    );
    SpreadsheetRepository.setHorizontalAlignment(
      SpreadsheetRepository.getRange(sheet, startRow, SheetSchema.BACKLOGS.FIELDS.TASK_NAME, numRows, 1),
      "left"
    );
    SpreadsheetRepository.setHorizontalAlignment(
      SpreadsheetRepository.getRange(
        sheet,
        startRow,
        SheetSchema.BACKLOGS.FIELDS.PRIORITY,
        numRows,
        SheetSchema.BACKLOGS.NUM_COLS - SheetSchema.BACKLOGS.FIELDS.PRIORITY + 1
      ),
      "center"
    );
  },

  writeDailyMessage(message) {
    const sheet = this.getSheet();
    if (!sheet) return false;

    const range = SpreadsheetRepository.getRange(
      sheet,
      SheetSchema.BACKLOGS.DAILY_MESSAGE.ROW,
      SheetSchema.BACKLOGS.DAILY_MESSAGE.COL,
      1,
      1
    );
    SpreadsheetRepository.setValue(range, message || "");
    return true;
  }
};
