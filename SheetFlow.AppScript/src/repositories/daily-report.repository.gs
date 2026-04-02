const DailyReportRepository = {
  getSheet() {
    return SpreadsheetRepository.getSheetByName(SheetSchema.DAILY.SHEET_NAME);
  },

  getReportDates() {
    const sheet = this.getSheet();
    if (!sheet) return [];

    const lastRow = SpreadsheetRepository.getLastRow(sheet);
    if (lastRow < SheetSchema.DAILY.START_ROW) return [];

    const range = SpreadsheetRepository.getRange(
      sheet,
      SheetSchema.DAILY.START_ROW,
      SheetSchema.DAILY.DATE_COL,
      lastRow - SheetSchema.DAILY.START_ROW + 1,
      1
    );
    return SpreadsheetRepository.getValues(range);
  },

  writeOutputs(goalsOutput, finishedOutput) {
    const sheet = this.getSheet();
    if (!sheet || goalsOutput.length === 0) return;

    SpreadsheetRepository.setValues(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.GOALS_COL, goalsOutput.length, 1),
      goalsOutput
    );
    SpreadsheetRepository.setValues(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.FINISHED_COL, finishedOutput.length, 1),
      finishedOutput
    );
  },

  formatOutputs(rowCount) {
    const sheet = this.getSheet();
    if (!sheet || rowCount <= 0) return;

    SpreadsheetRepository.setWrapAndVerticalAlignment(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.GOALS_COL, rowCount, 2),
      true,
      "top"
    );
  },

  getReports() {
    const sheet = this.getSheet();
    if (!sheet) return [];

    const lastRow = SpreadsheetRepository.getLastRow(sheet);
    if (lastRow < SheetSchema.DAILY.START_ROW) return [];

    const numRows = lastRow - SheetSchema.DAILY.START_ROW + 1;
    const dates = SpreadsheetRepository.getValues(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.DATE_COL, numRows, 1)
    );
    const goals = SpreadsheetRepository.getValues(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.GOALS_COL, numRows, 1)
    );
    const finished = SpreadsheetRepository.getValues(
      SpreadsheetRepository.getRange(sheet, SheetSchema.DAILY.START_ROW, SheetSchema.DAILY.FINISHED_COL, numRows, 1)
    );

    const reports = [];
    for (let i = 0; i < dates.length; i++) {
      if (!dates[i][0]) continue;
      reports.push({
        date: Utils.toDateKey(dates[i][0]),
        goals: goals[i][0] || "",
        finished: finished[i][0] || ""
      });
    }

    return reports;
  }
};
