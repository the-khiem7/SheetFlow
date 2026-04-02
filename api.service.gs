const ApiService = {
  // Web app entry point for GET requests
  doGet(e) {
    try {
      // Authenticate request
      if (!this.authenticate(e)) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const path = e.parameter.path || 'tasks';
      const method = 'GET';

      switch (path) {
        case 'tasks':
          return this.handleTasks(method, e.parameter);
        case 'reports/daily':
          return this.handleDailyReport(method, e.parameter);
        default:
          return this.errorResponse('Invalid endpoint');
      }
    } catch (error) {
      Logger.log('API Error: ' + error.toString());
      return this.errorResponse('Internal server error');
    }
  },

  // Web app entry point for POST/PUT/DELETE requests
  doPost(e) {
    try {
      // Authenticate request
      if (!this.authenticate(e)) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const path = e.parameter.path || 'tasks';
      const method = e.parameter.method || 'POST'; // Apps Script sends POST for all non-GET

      switch (path) {
        case 'tasks':
          return this.handleTasks(method, e.parameter, e.postData ? e.postData.contents : null);
        default:
          return this.errorResponse('Invalid endpoint');
      }
    } catch (error) {
      Logger.log('API Error: ' + error.toString());
      return this.errorResponse('Internal server error');
    }
  },

  // Authenticate using API key from X-API-Key header
  authenticate(e) {
    const apiKey = e.parameter['X-API-Key'] || (e.postData ? JSON.parse(e.postData.contents)['X-API-Key'] : null);
    if (!apiKey) return false;

    const validKeys = PropertiesService.getScriptProperties()
      .getProperty('API_KEYS');
    if (!validKeys) return false;

    const keys = validKeys.split(',');
    return keys.includes(apiKey.trim());
  },

  // Handle tasks endpoints
  handleTasks(method, params, body) {
    switch (method) {
      case 'GET':
        return this.getTasks(params);
      case 'POST':
        return this.createTask(body);
      case 'PUT':
        return this.updateTask(params, body);
      case 'DELETE':
        return this.deleteTask(params);
      default:
        return this.errorResponse('Method not allowed');
    }
  },

  // Handle daily report endpoint
  handleDailyReport(method, params) {
    if (method !== 'GET') {
      return this.errorResponse('Method not allowed');
    }
    return this.getDailyReport(params);
  },

  // Get all tasks with optional filtering
  getTasks(params) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return this.errorResponse('Backlogs sheet not found');

    const cfg = CONFIG.BACKLOGS;
    const range = Utils.getDataRange(sheet, cfg.START_ROW, cfg.START_COL, cfg.NUM_COLS);
    if (!range) return this.successResponse([]);

    const values = range.getValues();
    const tasks = [];

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      if (!row[0] && !row[1]) continue; // Skip empty rows

      const task = {
        id: cfg.START_ROW + i,
        project: Utils.safeTrim(row[0]),
        task: Utils.safeTrim(row[1]),
        priority: Utils.safeTrim(row[2]), // Assuming col 3 is priority
        status: Utils.safeTrim(row[3]),
        date: row[4] ? row[4].toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        assignee: Utils.safeTrim(row[5]), // Assuming col 6 is assignee
        pinned: row[6] || false
      };

      // Apply filters if provided
      if (params.status && task.status.toLowerCase() !== params.status.toLowerCase()) continue;
      if (params.project && task.project.toLowerCase() !== params.project.toLowerCase()) continue;

      tasks.push(task);
    }

    return this.successResponse(tasks);
  },

  // Create new task
  createTask(body) {
    if (!body) return this.errorResponse('Request body required');

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return this.errorResponse('Invalid JSON');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return this.errorResponse('Backlogs sheet not found');

    const cfg = CONFIG.BACKLOGS;
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;

    // Prepare row data
    const rowData = [
      data.project || '',
      data.task || '',
      data.priority || '',
      data.status || 'Pending',
      data.date ? new Date(data.date) : new Date(),
      data.assignee || '',
      data.pinned || false
    ];

    // Append to sheet
    sheet.getRange(newRow, cfg.START_COL, 1, cfg.NUM_COLS).setValues([rowData]);

    // Trigger sorting and refresh
    BacklogService.sortManual();
    DailyReportService.refresh();

    const task = {
      id: newRow,
      ...data,
      date: data.date || new Date().toISOString().split('T')[0]
    };

    return this.successResponse(task, 201);
  },

  // Update existing task
  updateTask(params, body) {
    const id = parseInt(params.id);
    if (!id) return this.errorResponse('Task ID required');

    if (!body) return this.errorResponse('Request body required');

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return this.errorResponse('Invalid JSON');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return this.errorResponse('Backlogs sheet not found');

    const cfg = CONFIG.BACKLOGS;
    const rowIndex = id - cfg.START_ROW + 1; // 1-indexed for sheet range

    if (rowIndex < 1) return this.errorResponse('Invalid task ID');

    // Update the row
    const rowData = [
      data.project !== undefined ? data.project : '',
      data.task !== undefined ? data.task : '',
      data.priority !== undefined ? data.priority : '',
      data.status !== undefined ? data.status : 'Pending',
      data.date ? new Date(data.date) : null,
      data.assignee !== undefined ? data.assignee : '',
      data.pinned !== undefined ? data.pinned : false
    ];

    sheet.getRange(id, cfg.START_COL, 1, cfg.NUM_COLS).setValues([rowData]);

    // Trigger sorting and refresh
    BacklogService.sortManual();
    DailyReportService.refresh();

    const task = {
      id: id,
      project: rowData[0],
      task: rowData[1],
      priority: rowData[2],
      status: rowData[3],
      date: rowData[4] ? rowData[4].toISOString().split('T')[0] : null,
      assignee: rowData[5],
      pinned: rowData[6]
    };

    return this.successResponse(task);
  },

  // Delete task
  deleteTask(params) {
    const id = parseInt(params.id);
    if (!id) return this.errorResponse('Task ID required');

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    if (!sheet) return this.errorResponse('Backlogs sheet not found');

    const cfg = CONFIG.BACKLOGS;

    // Clear the row
    sheet.getRange(id, cfg.START_COL, 1, cfg.NUM_COLS).clear();

    // Trigger sorting and refresh
    BacklogService.sortManual();
    DailyReportService.refresh();

    return this.successResponse({ deleted: true });
  },

  // Get daily report data
  getDailyReport(params) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.DAILY.SHEET_NAME);
    if (!sheet) return this.errorResponse('Daily Report sheet not found');

    const cfg = CONFIG.DAILY;
    const lastRow = sheet.getLastRow();
    if (lastRow < cfg.START_ROW) return this.successResponse([]);

    const dateRange = sheet.getRange(cfg.START_ROW, cfg.DATE_COL, lastRow - cfg.START_ROW + 1, 1);
    const goalsRange = sheet.getRange(cfg.START_ROW, cfg.GOALS_COL, lastRow - cfg.START_ROW + 1, 1);
    const finishedRange = sheet.getRange(cfg.START_ROW, cfg.FINISHED_COL, lastRow - cfg.START_ROW + 1, 1);

    const dates = dateRange.getValues();
    const goals = goalsRange.getValues();
    const finished = finishedRange.getValues();

    const reports = [];

    for (let i = 0; i < dates.length; i++) {
      if (!dates[i][0]) continue;

      reports.push({
        date: dates[i][0].toISOString().split('T')[0],
        goals: goals[i][0] || '',
        finished: finished[i][0] || ''
      });
    }

    return this.successResponse(reports);
  },

  // Helper methods
  successResponse(data, statusCode = 200) {
    return ContentService
      .createTextOutput(JSON.stringify({ data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  },

  errorResponse(message, statusCode = 400) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
};

// Export web app functions to global scope
function doGet(e) {
  return ApiService.doGet(e);
}

function doPost(e) {
  return ApiService.doPost(e);
}