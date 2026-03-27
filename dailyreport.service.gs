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
