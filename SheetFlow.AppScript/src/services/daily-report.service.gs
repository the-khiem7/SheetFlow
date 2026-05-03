const DailyReportService = {
  refresh(runContext) {
    const profile = runContext ? runContext.profile : null;
    const backlogRows = BacklogRepository.getRows();
    AppLogger.profileStep(profile, "DAILY_REPORT_GET_BACKLOG_ROWS_DONE", {
      backlogRowCount: backlogRows.length
    });
    const reportDates = DailyReportRepository.getReportDates();
    AppLogger.profileStep(profile, "DAILY_REPORT_GET_REPORT_DATES_DONE", {
      reportDateCount: reportDates.length
    });
    if (reportDates.length === 0) {
      this.refreshMessage(runContext, new Date());
      return;
    }

    const outputs = DailyReportBuilder.buildOutputs(reportDates, backlogRows);
    AppLogger.profileStep(profile, "DAILY_REPORT_BUILD_OUTPUTS_DONE", {
      goalsRowCount: outputs.goalsOutput.length,
      finishedRowCount: outputs.finishedOutput.length
    });
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    DailyReportRepository.writeOutputs(outputs.goalsOutput, outputs.finishedOutput);
    AppLogger.profileStep(profile, "DAILY_REPORT_WRITE_OUTPUTS_DONE", {
      rowCount: outputs.goalsOutput.length
    });
    DailyReportRepository.formatOutputs(outputs.goalsOutput.length);
    AppLogger.profileStep(profile, "DAILY_REPORT_FORMAT_OUTPUTS_DONE", {
      rowCount: outputs.goalsOutput.length
    });
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    this.refreshMessage(runContext, new Date());
  },

  refreshMessage(runContext, now) {
    const profile = runContext ? runContext.profile : null;
    const resolvedDates = DailyReportMessageBuilder.resolveReportDates(now || new Date());
    AppLogger.profileStep(profile, "DAILY_MESSAGE_RESOLVE_DATES_DONE", {
      dayA: resolvedDates ? resolvedDates.dayAKey : "",
      dayB: resolvedDates ? resolvedDates.dayBKey : "",
      weekendWindow: resolvedDates ? !!resolvedDates.isWeekendWindow : false
    });
    if (!resolvedDates) {
      BacklogRepository.writeDailyMessage("");
      AppLogger.profileStep(profile, "DAILY_MESSAGE_WRITE_EMPTY_DONE", {});
      return;
    }

    let completedText = "";
    if (resolvedDates.isWeekendWindow) {
      const completedBlocks = [];
      for (let i = 0; i < resolvedDates.completedDates.length; i++) {
        const completedReport = DailyReportRepository.getReportByDate(resolvedDates.completedDates[i]);
        AppLogger.profileStep(profile, "DAILY_MESSAGE_GET_WEEKEND_COMPLETED_REPORT_DONE", {
          found: !!completedReport,
          date: resolvedDates.completedDateKeys[i]
        });
        completedBlocks.push(completedReport ? completedReport.finished : "");
      }
      completedText = DailyReportMessageBuilder.mergeCompletedProjectBlocks(completedBlocks);
    } else {
      const completedReport = DailyReportRepository.getReportByDate(resolvedDates.dayA);
      completedText = completedReport ? completedReport.finished : "";
      AppLogger.profileStep(profile, "DAILY_MESSAGE_GET_COMPLETED_REPORT_DONE", {
        found: !!completedReport,
        date: resolvedDates.dayAKey
      });
    }
    AppLogger.profileStep(profile, "DAILY_MESSAGE_COMPLETED_TEXT_READY", {
      length: completedText ? completedText.length : 0,
      weekendWindow: !!resolvedDates.isWeekendWindow
    });
    const todayReport = DailyReportRepository.getReportByDate(resolvedDates.dayB);
    AppLogger.profileStep(profile, "DAILY_MESSAGE_GET_TODAY_REPORT_DONE", {
      found: !!todayReport,
      date: resolvedDates.dayBKey
    });
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    const message = DailyReportMessageBuilder.buildMessage({
      dayADisplay: resolvedDates.dayADisplay,
      dayBDisplay: resolvedDates.dayBDisplay,
      completedText: completedText,
      todayText: todayReport ? todayReport.goals : "",
      spreadsheetUrl: APP_CONFIG.DAILY_REPORT_MESSAGE.SPREADSHEET_URL
    });
    AppLogger.profileStep(profile, "DAILY_MESSAGE_BUILD_DONE", {
      length: message ? message.length : 0
    });

    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;
    BacklogRepository.writeDailyMessage(message);
    AppLogger.profileStep(profile, "DAILY_MESSAGE_WRITE_DONE", {
      length: message ? message.length : 0
    });
  }
};
