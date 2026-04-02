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

// ===== DUAL FUNCTIONALITY: MOBILE API + DESKTOP INTERFACE =====
// This script supports both:
// 1. Mobile App API (doGet/doPost) - for Flutter companion app
// 2. Desktop/Web Interface (onEdit/refreshAll) - for Google Sheets UI

// ===== MOBILE APP API ENDPOINTS =====
// These functions handle HTTP requests from Flutter mobile app
// URL: https://script.google.com/macros/s/[SCRIPT_ID]/exec

function doGet(e) {
  Logger.log('📱 MOBILE API: GET request received');
  Logger.log('📨 Parameters: ' + JSON.stringify(e.parameter || {}));

  try {
    return ApiService.doGet(e);
  } catch (error) {
    Logger.log('💥 MOBILE API ERROR: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  Logger.log('📱 MOBILE API: POST request received');
  Logger.log('📨 Parameters: ' + JSON.stringify(e.parameter || {}));
  Logger.log('📦 Post data present: ' + (e.postData ? 'YES' : 'NO'));

  try {
    return ApiService.doPost(e);
  } catch (error) {
    Logger.log('💥 MOBILE API ERROR: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== DESKTOP/WEB INTERFACE FUNCTIONS =====
// These functions handle Google Sheets UI interactions
// Called when users edit cells or use custom menu buttons

function onEdit(e) {
  Logger.log('💻 DESKTOP: onEdit triggered');

  if (!e) {
    Logger.log('⚠️ DESKTOP: No edit event provided');
    return;
  }

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  Logger.log('📊 DESKTOP: Edit in sheet: ' + sheetName);

  if (sheetName === CONFIG.BACKLOGS.SHEET_NAME) {
    Logger.log('🔄 DESKTOP: Processing backlog edit');
    BacklogService.handleEdit(sheet, e);
    DailyReportService.refresh();
    Logger.log('✅ DESKTOP: Backlog edit processed successfully');
  } else {
    Logger.log('ℹ️ DESKTOP: Edit in non-tracked sheet: ' + sheetName);
  }
}

function refreshAll() {
  Logger.log('🔄 DESKTOP: Manual refresh triggered');

  try {
    BacklogService.sortManual();
    DailyReportService.refresh();
    Logger.log('✅ DESKTOP: Manual refresh completed');
  } catch (error) {
    Logger.log('💥 DESKTOP REFRESH ERROR: ' + error.toString());
  }
}
