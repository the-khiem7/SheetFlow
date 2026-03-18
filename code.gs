function onEdit(e) {
  if (!e) return;

  const sheetName = "Backlogs";
  const startRow = 3;
  const startCol = 1; // A
  const numCols = 6;  // A:F
  const sortableCols = [3, 4, 5]; // C, D, E

  const sheet = e.range.getSheet();
  if (sheet.getName() !== sheetName) return;
  if (e.range.rowStart < startRow) return;
  if (!sortableCols.includes(e.range.columnStart)) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  sheet.getRange(startRow, startCol, lastRow - startRow + 1, numCols).sort([
    { column: 5, ascending: false }, // E = Ngày thực hiện
    { column: 4, ascending: false }, // D = Trạng thái
    { column: 3, ascending: true }   // C = Mức độ ưu tiên
  ]);
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
}
