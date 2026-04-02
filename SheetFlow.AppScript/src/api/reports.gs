const ApiReports = {
  handleDailyReport(method) {
    if (method !== "GET") {
      return ResponseFactory.jsonError("Method not allowed");
    }

    return ResponseFactory.jsonSuccess(DailyReportRepository.getReports());
  }
};
