const DailyReportMessageBuilder = {
  resolveReportDates(now) {
    const current = now instanceof Date ? new Date(now.getTime()) : new Date(now);
    if (isNaN(current.getTime())) return null;

    const cutoffHour = APP_CONFIG.DAILY_REPORT_MESSAGE.CUTOFF_HOUR;
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
      dayBDisplay: Utils.formatDisplayDate(dayB)
    };
  },

  buildMessage(input) {
    const safeInput = input || {};
    const completedText = this.normalizeSectionText(safeInput.completedText);
    const todayText = this.normalizeSectionText(safeInput.todayText);

    return [
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
  }
};
