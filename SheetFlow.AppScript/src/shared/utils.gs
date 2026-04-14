const Utils = {
  getDataRange(sheet, startRow, startCol, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return null;
    return sheet.getRange(startRow, startCol, lastRow - startRow + 1, numCols);
  },

  toDateKey(value) {
    if (!value) return "";
    let dateObj = value;
    if (!(value instanceof Date)) {
      dateObj = new Date(value);
    }
    if (isNaN(dateObj.getTime())) return "";
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
  },

  isSameDate(a, b) {
    return this.toDateKey(a) === this.toDateKey(b);
  },

  safeTrim(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  },

  createRequestId() {
    return new Date().getTime() + "_" + Math.random().toString(36).substr(2, 9);
  },

  addDays(date, days) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  },

  formatDisplayDate(value) {
    if (!value) return "";
    let dateObj = value;
    if (!(value instanceof Date)) {
      dateObj = new Date(value);
    }
    if (isNaN(dateObj.getTime())) return "";
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
  }
};
