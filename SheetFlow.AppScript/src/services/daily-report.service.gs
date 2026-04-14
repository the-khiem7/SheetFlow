const DailyReportService = {
  refresh() {
    const backlogRows = BacklogRepository.getRows();
    const reportDates = DailyReportRepository.getReportDates();
    if (reportDates.length === 0) {
      this.refreshMessage(new Date());
      return;
    }

    const outputs = DailyReportBuilder.buildOutputs(reportDates, backlogRows);
    DailyReportRepository.writeOutputs(outputs.goalsOutput, outputs.finishedOutput);
    DailyReportRepository.formatOutputs(outputs.goalsOutput.length);
    this.refreshMessage(new Date());
  },

  refreshMessage(now) {
    const resolvedDates = DailyReportMessageBuilder.resolveReportDates(now || new Date());
    if (!resolvedDates) {
      BacklogRepository.writeDailyMessage("");
      return;
    }

    const completedReport = DailyReportRepository.getReportByDate(resolvedDates.dayA);
    const todayReport = DailyReportRepository.getReportByDate(resolvedDates.dayB);
    const message = DailyReportMessageBuilder.buildMessage({
      dayADisplay: resolvedDates.dayADisplay,
      dayBDisplay: resolvedDates.dayBDisplay,
      completedText: completedReport ? completedReport.finished : "",
      todayText: todayReport ? todayReport.goals : "",
      spreadsheetUrl: APP_CONFIG.DAILY_REPORT_MESSAGE.SPREADSHEET_URL
    });

    BacklogRepository.writeDailyMessage(message);
  }
};
