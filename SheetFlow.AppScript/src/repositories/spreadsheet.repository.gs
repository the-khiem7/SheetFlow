const SpreadsheetRepository = {
  getActiveSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  getSheetByName(sheetName) {
    return this.getActiveSpreadsheet().getSheetByName(sheetName);
  },

  getLastRow(sheet) {
    return sheet.getLastRow();
  },

  getRange(sheet, row, column, numRows, numColumns) {
    return sheet.getRange(row, column, numRows, numColumns);
  },

  getValues(range) {
    return range.getValues();
  },

  setValues(range, values) {
    range.setValues(values);
  },

  setValue(range, value) {
    range.setValue(value);
  },

  clearRange(range) {
    range.clear();
  },

  clearBorders(range) {
    range.setBorder(false, false, false, false, false, false);
  },

  setTopBorder(range) {
    range.setBorder(
      true, false, false, false, false, false,
      "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );
  },

  setHorizontalAlignment(range, alignment) {
    range.setHorizontalAlignment(alignment);
  },

  setWrapAndVerticalAlignment(range, wrap, alignment) {
    range.setWrap(wrap).setVerticalAlignment(alignment);
  },

  createCheckboxRule() {
    return SpreadsheetApp.newDataValidation().requireCheckbox().build();
  }
};
