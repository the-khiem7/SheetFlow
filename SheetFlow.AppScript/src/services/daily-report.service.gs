const DailyReportService = {
  refresh(runContext) {
    const backlogRows = BacklogRepository.getRows();
    const reportDates = DailyReportRepository.getReportDates();
    if (reportDates.length === 0) {
      this.refreshMessage(runContext, new Date());
      return;
    }

    const outputs = DailyReportBuilder.buildOutputs(reportDates, backlogRows);
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    DailyReportRepository.writeOutputs(outputs.goalsOutput, outputs.finishedOutput);
    DailyReportRepository.formatOutputs(outputs.goalsOutput.length);
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    this.refreshMessage(runContext, new Date());
  },

  refreshMessage(runContext, now) {
    const resolvedDates = DailyReportMessageBuilder.resolveReportDates(now || new Date());
    if (!resolvedDates) {
      BacklogRepository.writeDailyMessage("");
      return;
    }

    const completedReport = DailyReportRepository.getReportByDate(resolvedDates.dayA);
    const todayReport = DailyReportRepository.getReportByDate(resolvedDates.dayB);
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    const message = DailyReportMessageBuilder.buildMessage({
      dayADisplay: resolvedDates.dayADisplay,
      dayBDisplay: resolvedDates.dayBDisplay,
      completedText: completedReport ? completedReport.finished : "",
      todayText: todayReport ? todayReport.goals : "",
      spreadsheetUrl: APP_CONFIG.DAILY_REPORT_MESSAGE.SPREADSHEET_URL
    });

    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;
    BacklogRepository.writeDailyMessage(message);
  }
};
