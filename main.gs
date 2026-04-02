function onEdit(e) {
  if (!e) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  if (sheetName === CONFIG.BACKLOGS.SHEET_NAME) {
    BacklogService.handleEdit(sheet, e);
    DailyReportService.refresh();
  }
}

function refreshAll() {
  BacklogService.sortManual();
  DailyReportService.refresh();
}

// Web app entry points
function doGet(e) {
  return ApiService.doGet(e);
}

function doPost(e) {
  return ApiService.doPost(e);
}
