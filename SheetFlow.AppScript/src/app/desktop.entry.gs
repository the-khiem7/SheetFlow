const DesktopEntry = {
  onEdit(e) {
    AppLogger.log("Desktop onEdit triggered");

    if (!e) {
      AppLogger.log("Desktop edit event missing");
      return;
    }

    const sheet = e.range.getSheet();
    if (sheet.getName() !== SheetSchema.BACKLOGS.SHEET_NAME) {
      AppLogger.log("Edit ignored for sheet: " + sheet.getName());
      return;
    }

    BacklogService.handleEdit(sheet, e);
    DailyReportService.refresh();
  },

  refreshAll() {
    AppLogger.log("Desktop manual refresh triggered");
    RefreshService.refreshAll();
  }
};
