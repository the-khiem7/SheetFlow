const RefreshService = {
  refreshAll() {
    BacklogService.sortManual();
    DailyReportService.refresh();
  }
};
