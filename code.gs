/***********************
 * CONFIG
 ***********************/
const CONFIG = {
  BACKLOGS: {
    SHEET_NAME: "Backlogs",
    START_ROW: 3,
    START_COL: 1,
    NUM_COLS: 6,
    SORT_RULES: [
      { column: 5, ascending: false }, // Date
      { column: 4, ascending: false }, // Status
      { column: 3, ascending: true },  // Priority
      { column: 1, ascending: true }   // Project A-Z
    ]
  },
  DAILY: {
    SHEET_NAME: "Daily Report",
    START_ROW: 14,
    DATE_COL: 1,
    GOALS_COL: 5,
    FINISHED_COL: 6
  }
};

/***********************
 * EVENT HANDLER
 ***********************/
function onEdit(e) {
  if (!e) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  if (sheetName === CONFIG.BACKLOGS.SHEET_NAME) {
    BacklogService.handleEdit(sheet, e);
    DailyReportService.refresh();
  }
}

/***********************
 * BACKLOG SERVICE
 ***********************/
const BacklogService = {
  handleEdit(sheet, e) {
    const cfg = CONFIG.BACKLOGS;
    if (e.range.rowStart < cfg.START_ROW) return;

    const editedCol = e.range.columnStart;
    if (editedCol < cfg.START_COL || editedCol > cfg.START_COL + cfg.NUM_COLS - 1) return;

    this.sortAndFormat(sheet);
  },

  sortAndFormat(sheet) {
    const cfg = CONFIG.BACKLOGS;
    const range = Utils.getDataRange(sheet, cfg.START_ROW, cfg.START_COL, cfg.NUM_COLS);
    if (!range) return;

    range.sort(cfg.SORT_RULES);
    FormatService.applyDateBorders(sheet, cfg.START_ROW, cfg.NUM_COLS);
    FormatService.applyAlignment(sheet, cfg.START_ROW, cfg.NUM_COLS);
  },

  sortManual() {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return;
    this.sortAndFormat(sheet);
  }
};

/***********************
 * DAILY REPORT SERVICE
 ***********************/
const DailyReportService = {
  refresh() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const backlogSheet = ss.getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    const dailySheet = ss.getSheetByName(CONFIG.DAILY.SHEET_NAME);
    if (!backlogSheet || !dailySheet) return;

    const backlogCfg = CONFIG.BACKLOGS;
    const dailyCfg = CONFIG.DAILY;

    const backlogRange = Utils.getDataRange(
      backlogSheet,
      backlogCfg.START_ROW,
      1,
      backlogCfg.NUM_COLS
    );

    let grouped = {};
    if (backlogRange) {
      const backlogValues = backlogRange.getValues();
      grouped = this.buildGroupsByDate(backlogValues);
    }

    const dailyLastRow = dailySheet.getLastRow();
    if (dailyLastRow < dailyCfg.START_ROW) return;

    const dailyDates = dailySheet
      .getRange(dailyCfg.START_ROW, dailyCfg.DATE_COL, dailyLastRow - dailyCfg.START_ROW + 1, 1)
      .getValues();

    const goalsOutput = [];
    const finishedOutput = [];

    for (let i = 0; i < dailyDates.length; i++) {
      const reportDate = dailyDates[i][0];
      if (!reportDate) {
        goalsOutput.push([""]);
        finishedOutput.push([""]);
        continue;
      }

      const dateKey = Utils.toDateKey(reportDate);
      const dayData = grouped[dateKey] || {
        allProjects: {},
        finishedProjects: {}
      };

      const allText = this.formatProjectsBlock(dayData.allProjects);
      const finishedText = this.formatProjectsBlock(dayData.finishedProjects);

      goalsOutput.push([allText]);
      finishedOutput.push([finishedText]);
    }

    dailySheet
      .getRange(dailyCfg.START_ROW, dailyCfg.GOALS_COL, goalsOutput.length, 1)
      .setValues(goalsOutput);

    dailySheet
      .getRange(dailyCfg.START_ROW, dailyCfg.FINISHED_COL, finishedOutput.length, 1)
      .setValues(finishedOutput);

    dailySheet
      .getRange(dailyCfg.START_ROW, dailyCfg.GOALS_COL, goalsOutput.length, 2)
      .setWrap(true)
      .setVerticalAlignment("top");
  },

  buildGroupsByDate(rows) {
    const result = {};

    for (const row of rows) {
      const project = Utils.safeTrim(row[0]);
      const task = Utils.safeTrim(row[1]);
      const status = Utils.safeTrim(row[3]);
      const workDate = row[4];

      if (!project || !task || !workDate) continue;

      const dateKey = Utils.toDateKey(workDate);
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
  },

  formatProjectsBlock(projectsMap) {
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
};

/***********************
 * FORMAT SERVICE
 ***********************/
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

/***********************
 * UTILS
 ***********************/
const Utils = {
  getDataRange(sheet, startRow, startCol, numCols) {
    const lastRow = sheet.getLastRow();
    if (lastRow < startRow) return null;
    return sheet.getRange(
      startRow,
      startCol,
      lastRow - startRow + 1,
      numCols
    );
  },

  toDateKey(value) {
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
  },

  isSameDate(a, b) {
    return this.toDateKey(a) === this.toDateKey(b);
  },

  safeTrim(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }
};

/***********************
 * MANUAL COMMANDS
 ***********************/
function refreshAll() {
  BacklogService.sortManual();
  DailyReportService.refresh();
}
