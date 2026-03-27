const FormatService = {
  applyDateBorders(sheet, startRow, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return;

    const data = sheet.getRange(startRow, 5, lastRow - startRow + 1, 1).getValues();

    for (let i = 1; i < data.length; i++) {
      const current = data[i][0];
      const prev = data[i - 1][0];
      const row = startRow + i;

      sheet.getRange(row, 1, 1, numCols)
        .setBorder(false, false, false, false, false, false);

      if (current && prev && !Utils.isSameDate(current, prev)) {
        sheet.getRange(row, 1, 1, numCols).setBorder(
          true, false, false, false, false, false,
          "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM
        );
      }
    }
  },

  applyAlignment(sheet, startRow, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return;

    const numRows = lastRow - startRow + 1;

    sheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment("left");
    sheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment("center");
    sheet.getRange(startRow, 3, numRows, 4).setHorizontalAlignment("center");
  }
};
