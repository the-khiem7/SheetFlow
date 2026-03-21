function onEdit(e) {
  if (!e) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  if (sheetName === "Backlogs") {
    handleBacklogsEdit_(sheet, e);
    refreshDailyReport();
    return;
  }

  if (sheetName === "Daily Report") {
    return;
  }
}

function handleBacklogsEdit_(sheet, e) {
  const startRow = 3;
  const startCol = 1; // A
  const numCols = 6;  // A:F

  if (e.range.rowStart < startRow) return;

  const editedCol = e.range.columnStart;
  if (editedCol < startCol || editedCol > startCol + numCols - 1) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return;

  sheet.getRange(startRow, startCol, lastRow - startRow + 1, numCols).sort([
    { column: 5, ascending: false }, // E = Ngày thực hiện
    { column: 4, ascending: false }, // D = Trạng thái
    { column: 3, ascending: true },  // C = Mức độ ưu tiên
    { column: 1, ascending: true }   // A = Project A-Z
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
    { column: 3, ascending: true },
    { column: 1, ascending: true }
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

    if (current && prev && !isSameDate_(current, prev)) {
      sheet.getRange(row, 1, 1, numCols).setBorder(
        true, false, false, false, false, false,
        "black", SpreadsheetApp.BorderStyle.SOLID
      );
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

function refreshDailyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backlogSheet = ss.getSheetByName("Backlogs");
  const dailySheet = ss.getSheetByName("Daily Report");
  if (!backlogSheet || !dailySheet) return;

  const backlogStartRow = 3;
  const backlogNumCols = 6;
  const dailyStartRow = 12;
  const dailyDateCol = 1;
  const dailyGoalsCol = 5;
  const dailyFinishedCol = 6;

  const backlogLastRow = backlogSheet.getLastRow();
  const dailyLastRow = dailySheet.getLastRow();
  if (dailyLastRow < dailyStartRow) return;

  const dailyDateValues = dailySheet
    .getRange(dailyStartRow, dailyDateCol, dailyLastRow - dailyStartRow + 1, 1)
    .getValues();

  const dailyGoalsOutput = [];
  const dailyFinishedOutput = [];

  let groupedBacklogsByDate = {};
  if (backlogLastRow >= backlogStartRow) {
    const backlogValues = backlogSheet
      .getRange(backlogStartRow, 1, backlogLastRow - backlogStartRow + 1, backlogNumCols)
      .getValues();
    groupedBacklogsByDate = buildBacklogGroupsByDate_(backlogValues);
  }

  for (let i = 0; i < dailyDateValues.length; i++) {
    const reportDate = dailyDateValues[i][0];
    if (!reportDate) {
      dailyGoalsOutput.push([""]);
      dailyFinishedOutput.push([""]);
      continue;
    }

    const dateKey = toDateKey_(reportDate);
    const dayData = groupedBacklogsByDate[dateKey] || {
      allProjects: {},
      finishedProjects: {}
    };

    const allText = formatProjectsBlock_(dayData.allProjects);
    const finishedText = formatProjectsBlock_(dayData.finishedProjects);

    dailyGoalsOutput.push([allText]);
    dailyFinishedOutput.push([finishedText]);
  }

  dailySheet
    .getRange(dailyStartRow, dailyGoalsCol, dailyGoalsOutput.length, 1)
    .setValues(dailyGoalsOutput);

  dailySheet
    .getRange(dailyStartRow, dailyFinishedCol, dailyFinishedOutput.length, 1)
    .setValues(dailyFinishedOutput);

  dailySheet
    .getRange(dailyStartRow, dailyGoalsCol, dailyGoalsOutput.length, 2)
    .setWrap(true)
    .setVerticalAlignment("top");
}

function buildBacklogGroupsByDate_(rows) {
  const result = {};

  for (const row of rows) {
    const project = safeTrim_(row[0]);
    const task = safeTrim_(row[1]);
    const status = safeTrim_(row[3]);
    const workDate = row[4];

    if (!project || !task || !workDate) continue;

    const dateKey = toDateKey_(workDate);
    if (!dateKey) continue;

    if (!result[dateKey]) {
      result[dateKey] = {
        allProjects: {},
        finishedProjects: {}
      };
    }

    if (!result[dateKey].allProjects[project]) {
      result[dateKey].allProjects[project] = [];
    }
    result[dateKey].allProjects[project].push(task);

    if (status.toLowerCase() === "finished") {
      if (!result[dateKey].finishedProjects[project]) {
        result[dateKey].finishedProjects[project] = [];
      }
      result[dateKey].finishedProjects[project].push(task);
    }
  }

  return result;
}

function formatProjectsBlock_(projectsMap) {
  const projects = Object.keys(projectsMap);
  if (projects.length === 0) return "";

  const blocks = [];
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const tasks = projectsMap[project] || [];
    const lines = [];
    lines.push((i + 1) + ". " + project);
    for (const task of tasks) {
      lines.push("- " + task);
    }
    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n");
}

function toDateKey_(value) {
  if (!value) return "";
  let dateObj = value;
  if (!(value instanceof Date)) {
    dateObj = new Date(value);
  }
  if (isNaN(dateObj.getTime())) return "";
  return Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
}

function isSameDate_(a, b) {
  return toDateKey_(a) === toDateKey_(b);
}

function safeTrim_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function refreshAll() {
  sortBacklogs();
  refreshDailyReport();
}
