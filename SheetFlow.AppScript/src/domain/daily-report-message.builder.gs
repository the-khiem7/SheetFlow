const DailyReportMessageBuilder = {
  resolveReportDates(now) {
    const current = now instanceof Date ? new Date(now.getTime()) : new Date(now);
    if (isNaN(current.getTime())) return null;

    const cutoffHour = APP_CONFIG.DAILY_REPORT_MESSAGE.CUTOFF_HOUR;
    if (this.isWeekendWindow(current, cutoffHour)) {
      const friday = this.resolveWeekendFriday(current);
      const saturday = Utils.addDays(friday, 1);
      const sunday = Utils.addDays(friday, 2);
      const monday = Utils.addDays(friday, 3);
      const completedDates = [friday, saturday, sunday];

      return {
        dayA: friday,
        dayB: monday,
        dayAKey: Utils.toDateKey(friday),
        dayBKey: Utils.toDateKey(monday),
        dayADisplay: this.formatWeekendDisplay(completedDates),
        dayBDisplay: Utils.formatDisplayDate(monday),
        isWeekendWindow: true,
        completedDates: completedDates,
        completedDateKeys: completedDates.map(function(date) {
          return Utils.toDateKey(date);
        })
      };
    }

    const dayA = new Date(current.getTime());
    dayA.setHours(0, 0, 0, 0);

    if (current.getHours() < cutoffHour) {
      dayA.setDate(dayA.getDate() - 1);
    }

    const dayB = Utils.addDays(dayA, 1);

    return {
      dayA: dayA,
      dayB: dayB,
      dayAKey: Utils.toDateKey(dayA),
      dayBKey: Utils.toDateKey(dayB),
      dayADisplay: Utils.formatDisplayDate(dayA),
      dayBDisplay: Utils.formatDisplayDate(dayB),
      isWeekendWindow: false,
      completedDates: [dayA],
      completedDateKeys: [Utils.toDateKey(dayA)]
    };
  },

  isWeekendWindow(current, cutoffHour) {
    const day = current.getDay();
    const hour = current.getHours();

    return (day === 5 && hour >= cutoffHour) ||
      day === 6 ||
      day === 0 ||
      (day === 1 && hour < cutoffHour);
  },

  resolveWeekendFriday(current) {
    const friday = new Date(current.getTime());
    friday.setHours(0, 0, 0, 0);

    const day = friday.getDay();
    let daysAfterFriday = 0;
    if (day === 6) {
      daysAfterFriday = 1;
    } else if (day === 0) {
      daysAfterFriday = 2;
    } else if (day === 1) {
      daysAfterFriday = 3;
    }

    friday.setDate(friday.getDate() - daysAfterFriday);
    return friday;
  },

  formatWeekendDisplay(dates) {
    if (!dates || dates.length === 0) return "";

    const first = dates[0];
    const sameMonthYear = dates.every(function(date) {
      return date.getMonth() === first.getMonth() && date.getFullYear() === first.getFullYear();
    });

    if (!sameMonthYear) {
      return dates.map(function(date) {
        return Utils.formatDisplayDate(date);
      }).join(", ");
    }

    const days = dates.map(function(date) {
      return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd");
    }).join(",");
    const monthYear = Utilities.formatDate(first, Session.getScriptTimeZone(), "MM/yyyy");
    return days + "/" + monthYear;
  },

  buildMessage(input) {
    const safeInput = input || {};
    const completedText = this.normalizeSectionText(safeInput.completedText);
    const todayText = this.normalizeSectionText(safeInput.todayText);

    return [
      "Reports",
      "",
      "Chúc mọi người buổi sáng tốt lành. Em xin gửi báo cáo công việc ngày " + (safeInput.dayADisplay || ""),
      "",
      "Nội dung đã thực hiện:",
      completedText,
      "",
      "Công việc hôm nay (" + (safeInput.dayBDisplay || "") + "):",
      todayText,
      "",
      "Link Worklog & Backlogs của em:",
      safeInput.spreadsheetUrl || ""
    ].join("\n");
  },

  normalizeSectionText(value) {
    const text = Utils.safeTrim(value);
    return text || "-";
  },

  mergeCompletedProjectBlocks(blocks) {
    const projects = [];
    const projectIndex = {};

    for (let i = 0; i < blocks.length; i++) {
      const parsedProjects = this.parseProjectBlock(blocks[i]);
      for (let j = 0; j < parsedProjects.length; j++) {
        const parsedProject = parsedProjects[j];
        if (!Object.prototype.hasOwnProperty.call(projectIndex, parsedProject.project)) {
          projectIndex[parsedProject.project] = projects.length;
          projects.push({
            project: parsedProject.project,
            tasks: []
          });
        }

        const target = projects[projectIndex[parsedProject.project]];
        for (let k = 0; k < parsedProject.tasks.length; k++) {
          target.tasks.push(parsedProject.tasks[k]);
        }
      }
    }

    return this.renderProjectBlocks(projects);
  },

  parseProjectBlock(value) {
    const text = Utils.safeTrim(value);
    if (!text) return [];

    const projects = [];
    let currentProject = null;
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = Utils.safeTrim(lines[i]);
      if (!line) continue;

      const projectMatch = line.match(/^\d+\.\s*(.+)$/);
      if (projectMatch) {
        currentProject = {
          project: Utils.safeTrim(projectMatch[1]),
          tasks: []
        };
        if (currentProject.project) {
          projects.push(currentProject);
        }
        continue;
      }

      const taskMatch = line.match(/^-\s*(.+)$/);
      if (taskMatch && currentProject) {
        currentProject.tasks.push(Utils.safeTrim(taskMatch[1]));
      }
    }

    return projects;
  },

  renderProjectBlocks(projects) {
    const blocks = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      if (!project.tasks || project.tasks.length === 0) continue;

      const lines = [(blocks.length + 1) + ". " + project.project];
      for (let j = 0; j < project.tasks.length; j++) {
        lines.push("- " + project.tasks[j]);
      }
      blocks.push(lines.join("\n"));
    }

    return blocks.join("\n");
  }
};
