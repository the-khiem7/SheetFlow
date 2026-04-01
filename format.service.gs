const FormatService = {
  applyDateBorders(sheet, startRow, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return;

    // Get date and pinned columns
    const dateData = sheet.getRange(startRow, 5, lastRow - startRow + 1, 1).getValues();
    const pinnedData = sheet.getRange(startRow, 7, lastRow - startRow + 1, 1).getValues();

    for (let i = 1; i < dateData.length; i++) {
      const currentDate = dateData[i][0];
      const prevDate = dateData[i - 1][0];
      const currentPinned = Boolean(pinnedData[i][0]);
      const prevPinned = Boolean(pinnedData[i - 1][0]);
      const row = startRow + i;

      // Clear existing borders
      sheet.getRange(row, 1, 1, numCols)
        .setBorder(false, false, false, false, false, false);

      // Add border if:
      // 1. Pinned status changes (pinned to unpinned transition)
      // 2. Within same pinned group, date changes
      const shouldBorder = (prevPinned && !currentPinned) ||
                          (prevPinned === currentPinned && currentDate && prevDate && !Utils.isSameDate(currentDate, prevDate));

      if (shouldBorder) {
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

    // Column A (1): Project - center
    sheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment("center");
    // Column B (2): Task - left
    sheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment("left");
    // Columns C-G (3-7): Priority, Status, Date, Note, Pinned - center
    sheet.getRange(startRow, 3, numRows, 5).setHorizontalAlignment("center");
  }
};
