const DailyReportBuilder = {
  buildOutputs(reportDates, backlogRows) {
    const grouped = this.buildGroupsByDate(backlogRows);
    const goalsOutput = [];
    const finishedOutput = [];

    for (let i = 0; i < reportDates.length; i++) {
      const reportDate = reportDates[i][0];
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

      goalsOutput.push([this.formatProjectsBlock(dayData.allProjects)]);
      finishedOutput.push([this.formatProjectsBlock(dayData.finishedProjects)]);
    }

    return {
      goalsOutput: goalsOutput,
      finishedOutput: finishedOutput
    };
  },

  buildGroupsByDate(rows) {
    const result = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const project = Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.PROJECT - 1]);
      const task = Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.TASK_NAME - 1]);
      const status = Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.STATUS - 1]);
      const workDate = row[SheetSchema.BACKLOGS.FIELDS.WORK_DATE - 1];

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

      if (status.toLowerCase() === APP_CONFIG.TASK_STATUS.FINISHED.toLowerCase()) {
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
      for (let j = 0; j < tasks.length; j++) {
        lines.push("- " + tasks[j]);
      }
      blocks.push(lines.join("\n"));
    }

    return blocks.join("\n");
  }
};
