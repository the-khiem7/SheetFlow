const DailyReportService = {
  refresh() {
    const backlogRows = BacklogRepository.getRows();
    const reportDates = DailyReportRepository.getReportDates();
    if (reportDates.length === 0) return;

    const outputs = DailyReportBuilder.buildOutputs(reportDates, backlogRows);
    DailyReportRepository.writeOutputs(outputs.goalsOutput, outputs.finishedOutput);
    DailyReportRepository.formatOutputs(outputs.goalsOutput.length);
  }
};
