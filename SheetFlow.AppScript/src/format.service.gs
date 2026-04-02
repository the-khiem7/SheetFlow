const FormatService = {
  applyDateBorders(sheet, startRow, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return;

    // Get all data for the rows
    const allData = sheet.getRange(startRow, 1, lastRow - startRow + 1, numCols).getValues();

    for (let i = 1; i < allData.length; i++) {
      const prevTask = allData[i - 1];
      const currentTask = allData[i];
      const row = startRow + i;

      // Clear existing borders
      sheet.getRange(row, 1, 1, numCols)
        .setBorder(false, false, false, false, false, false);

      const prevGroup = this._getTaskGroup(prevTask);
      const currentGroup = this._getTaskGroup(currentTask);

      // Add border if group changes
      if (prevGroup !== currentGroup) {
        sheet.getRange(row, 1, 1, numCols).setBorder(
          true, false, false, false, false, false,
          "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM
        );
      }
    }
  },

  /**
   * Classifies a task into its group for border logic
   * @param {Array} task - Task row data [project, task, priority, status, date, note, pinned]
   * @returns {string} - Group identifier
   */
  _getTaskGroup(task) {
    const isPinned = Boolean(task[6]); // Column G (0-indexed)
    const dateKey = Utils.toDateKey(task[4]); // Column E (0-indexed)

    if (isPinned) {
      return 'PINNED';
    } else if (!dateKey) {
      return 'NO_DATE';
    } else {
      return `DATED_${dateKey}`;
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
