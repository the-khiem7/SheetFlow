function onEdit(e) {
  if (!e) return;

  const sheetName = "Backlogs";
  const startRow = 3;
  const startCol = 1;
  const numCols = 6;
  const sortableCols = [3, 4, 5];

  const sheet = e.range.getSheet();
  if (sheet.getName() !== sheetName) return;
  if (e.range.rowStart < startRow) return;
  if (!sortableCols.includes(e.range.columnStart)) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  sheet.getRange(startRow, startCol, lastRow - startRow + 1, numCols).sort([
    { column: 5, ascending: false },
    { column: 4, ascending: false },
    { column: 3, ascending: true }
  ]);

  applyDateBorders(sheet, startRow, numCols);
  applyAlignment(sheet, startRow, numCols);
}

function sortBacklogs() {
  const sheetName = "Backlogs";
  const startRow = 3;
  const startCol = 1;
  const numCols = 6;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  sheet.getRange(startRow, startCol, lastRow - startRow + 1, numCols).sort([
    { column: 5, ascending: false },
    { column: 4, ascending: false },
    { column: 3, ascending: true }
  ]);

  applyDateBorders(sheet, startRow, numCols);
  applyAlignment(sheet, startRow, numCols);
}

function applyDateBorders(sheet, startRow, numCols) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const data = sheet.getRange(startRow, 5, lastRow - startRow + 1, 1).getValues();

  for (let i = 1; i < data.length; i++) {
    const current = data[i][0];
    const prev = data[i - 1][0];
    const row = startRow + i;

    sheet.getRange(row, 1, 1, numCols)
      .setBorder(false, false, false, false, false, false);

    if (current && prev && current.toString() !== prev.toString()) {
      sheet.getRange(row, 1, 1, numCols)
        .setBorder(true, false, false, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  }
}

function applyAlignment(sheet, startRow, numCols) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  const numRows = lastRow - startRow + 1;

  sheet.getRange(startRow, 2, numRows, 1).setHorizontalAlignment("left");   // B
  sheet.getRange(startRow, 1, numRows, 1).setHorizontalAlignment("center"); // A
  sheet.getRange(startRow, 3, numRows, 4).setHorizontalAlignment("center"); // C-F
}
