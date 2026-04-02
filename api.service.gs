const ApiService = {
  // Web app entry point for GET requests
  doGet(e) {
    const requestId = new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
    Logger.log('🚀 [' + requestId + '] GET REQUEST STARTED');
    Logger.log('📨 [' + requestId + '] Raw parameters: ' + JSON.stringify(e.parameter || {}));

    try {
      // Authenticate request
      Logger.log('🔐 [' + requestId + '] Starting authentication...');
      if (!this.authenticate(e, requestId)) {
        Logger.log('❌ [' + requestId + '] Authentication failed');
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      Logger.log('✅ [' + requestId + '] Authentication successful');

      const path = e.parameter.path || 'tasks';
      const method = 'GET';
      Logger.log('🎯 [' + requestId + '] Routing: method=' + method + ', path=' + path);

      switch (path) {
        case 'tasks':
          Logger.log('📋 [' + requestId + '] Handling tasks endpoint');
          return this.handleTasks(method, e.parameter, null, requestId);
        case 'reports/daily':
          Logger.log('📊 [' + requestId + '] Handling daily reports endpoint');
          return this.handleDailyReport(method, e.parameter, requestId);
        default:
          Logger.log('❌ [' + requestId + '] Invalid endpoint: ' + path);
          return this.errorResponse('Invalid endpoint', requestId);
      }
    } catch (error) {
      Logger.log('💥 [' + requestId + '] API Error: ' + error.toString());
      Logger.log('📋 [' + requestId + '] Stack trace: ' + error.stack);
      return this.errorResponse('Internal server error', requestId);
    }
  },

  // Web app entry point for POST/PUT/DELETE requests
  doPost(e) {
    const requestId = new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
    Logger.log('🚀 [' + requestId + '] POST REQUEST STARTED');
    Logger.log('📨 [' + requestId + '] Raw parameters: ' + JSON.stringify(e.parameter || {}));
    Logger.log('📦 [' + requestId + '] Post data present: ' + (e.postData ? 'YES' : 'NO'));
    if (e.postData) {
      Logger.log('📦 [' + requestId + '] Post data length: ' + (e.postData.contents ? e.postData.contents.length : 0) + ' chars');
      Logger.log('📦 [' + requestId + '] Post data type: ' + (e.postData.type || 'unknown'));
    }

    try {
      // Authenticate request
      Logger.log('🔐 [' + requestId + '] Starting authentication...');
      if (!this.authenticate(e, requestId)) {
        Logger.log('❌ [' + requestId + '] Authentication failed');
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      Logger.log('✅ [' + requestId + '] Authentication successful');

      const path = e.parameter.path || 'tasks';
      const method = e.parameter.method || 'POST'; // Apps Script sends POST for all non-GET
      Logger.log('🎯 [' + requestId + '] Routing: method=' + method + ', path=' + path);

      switch (path) {
        case 'tasks':
          Logger.log('📋 [' + requestId + '] Handling tasks endpoint with body');
          return this.handleTasks(method, e.parameter, e.postData ? e.postData.contents : null, requestId);
        default:
          Logger.log('❌ [' + requestId + '] Invalid endpoint: ' + path);
          return this.errorResponse('Invalid endpoint', requestId);
      }
    } catch (error) {
      Logger.log('💥 [' + requestId + '] API Error: ' + error.toString());
      Logger.log('📋 [' + requestId + '] Stack trace: ' + error.stack);
      return this.errorResponse('Internal server error', requestId);
    }
  },

  // Authenticate using API key from X-API-Key header
  authenticate(e, requestId) {
    Logger.log('🔑 [' + requestId + '] Checking API key authentication');

    const apiKey = e.parameter['X-API-Key'] || (e.postData ? JSON.parse(e.postData.contents)['X-API-Key'] : null);
    Logger.log('🔑 [' + requestId + '] API key present: ' + (apiKey ? 'YES' : 'NO'));
    if (!apiKey) {
      Logger.log('❌ [' + requestId + '] No API key found in parameters or post data');
      return false;
    }

    Logger.log('🔑 [' + requestId + '] API key: ' + apiKey.substring(0, 8) + '...');

    const validKeys = PropertiesService.getScriptProperties()
      .getProperty('API_KEYS');
    Logger.log('🔑 [' + requestId + '] Script properties API_KEYS present: ' + (validKeys ? 'YES' : 'NO'));
    if (!validKeys) {
      Logger.log('❌ [' + requestId + '] No API_KEYS property found in script properties');
      return false;
    }

    const keys = validKeys.split(',');
    Logger.log('🔑 [' + requestId + '] Valid keys count: ' + keys.length);
    const isValid = keys.includes(apiKey.trim());
    Logger.log('🔑 [' + requestId + '] API key validation result: ' + (isValid ? 'VALID' : 'INVALID'));

    return isValid;
  },

  // Handle tasks endpoints
  handleTasks(method, params, body, requestId) {
    Logger.log('🎯 [' + requestId + '] Handling tasks with method: ' + method);
    Logger.log('📨 [' + requestId + '] Parameters: ' + JSON.stringify(params || {}));
    Logger.log('📦 [' + requestId + '] Body present: ' + (body ? 'YES (' + body.length + ' chars)' : 'NO'));

    switch (method) {
      case 'GET':
        Logger.log('📋 [' + requestId + '] Routing to getTasks');
        return this.getTasks(params, requestId);
      case 'POST':
        Logger.log('➕ [' + requestId + '] Routing to createTask');
        return this.createTask(body, requestId);
      case 'PUT':
        Logger.log('✏️ [' + requestId + '] Routing to updateTask');
        return this.updateTask(params, body, requestId);
      case 'DELETE':
        Logger.log('🗑️ [' + requestId + '] Routing to deleteTask');
        return this.deleteTask(params, requestId);
      default:
        Logger.log('❌ [' + requestId + '] Method not allowed: ' + method);
        return this.errorResponse('Method not allowed', requestId);
    }
  },

  // Handle daily report endpoint
  handleDailyReport(method, params, requestId) {
    Logger.log('🎯 [' + requestId + '] Handling daily report with method: ' + method);
    if (method !== 'GET') {
      Logger.log('❌ [' + requestId + '] Method not allowed for daily reports: ' + method);
      return this.errorResponse('Method not allowed', requestId);
    }
    Logger.log('📊 [' + requestId + '] Routing to getDailyReport');
    return this.getDailyReport(params, requestId);
  },

  // Get all tasks with optional filtering
  getTasks(params, requestId) {
    Logger.log('📋 [' + requestId + '] Starting getTasks');
    Logger.log('🔍 [' + requestId + '] Filters: status=' + (params.status || 'none') + ', project=' + (params.project || 'none'));

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    Logger.log('📊 [' + requestId + '] Sheet access result: ' + (sheet ? 'SUCCESS' : 'FAILED'));
    if (!sheet) {
      Logger.log('❌ [' + requestId + '] Backlogs sheet not found');
      return this.errorResponse('Backlogs sheet not found', requestId);
    }

    const cfg = CONFIG.BACKLOGS;
    Logger.log('⚙️ [' + requestId + '] Config: START_ROW=' + cfg.START_ROW + ', START_COL=' + cfg.START_COL + ', NUM_COLS=' + cfg.NUM_COLS);

    const range = Utils.getDataRange(sheet, cfg.START_ROW, cfg.START_COL, cfg.NUM_COLS);
    Logger.log('📍 [' + requestId + '] Data range result: ' + (range ? 'SUCCESS' : 'FAILED'));
    if (!range) {
      Logger.log('ℹ️ [' + requestId + '] No data range found, returning empty array');
      return this.successResponse([], requestId);
    }

    const values = range.getValues();
    Logger.log('📊 [' + requestId + '] Retrieved ' + values.length + ' rows of data');

    const tasks = [];
    let processedRows = 0;
    let skippedRows = 0;
    let filteredRows = 0;

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      processedRows++;

      if (!row[0] && !row[1]) {
        skippedRows++;
        continue; // Skip empty rows
      }

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
      if (params.status && task.status.toLowerCase() !== params.status.toLowerCase()) {
        filteredRows++;
        continue;
      }
      if (params.project && task.project.toLowerCase() !== params.project.toLowerCase()) {
        filteredRows++;
        continue;
      }

      tasks.push(task);
    }

    Logger.log('📊 [' + requestId + '] Processing summary: processed=' + processedRows + ', skipped=' + skippedRows + ', filtered=' + filteredRows + ', returned=' + tasks.length);
    Logger.log('✅ [' + requestId + '] getTasks completed successfully');

    return this.successResponse(tasks, requestId);
  },

  // Create new task
  createTask(body, requestId) {
    Logger.log('➕ [' + requestId + '] Starting createTask');

    if (!body) {
      Logger.log('❌ [' + requestId + '] Request body is empty');
      return this.errorResponse('Request body required', requestId);
    }

    Logger.log('📦 [' + requestId + '] Raw body length: ' + body.length + ' chars');

    let data;
    try {
      data = JSON.parse(body);
      Logger.log('✅ [' + requestId + '] JSON parsed successfully');
      Logger.log('📋 [' + requestId + '] Parsed data keys: ' + Object.keys(data).join(', '));
    } catch (e) {
      Logger.log('❌ [' + requestId + '] JSON parse error: ' + e.toString());
      Logger.log('📋 [' + requestId + '] Raw body: ' + body);
      return this.errorResponse('Invalid JSON', requestId);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    Logger.log('📊 [' + requestId + '] Sheet access result: ' + (sheet ? 'SUCCESS' : 'FAILED'));
    if (!sheet) {
      Logger.log('❌ [' + requestId + '] Backlogs sheet not found');
      return this.errorResponse('Backlogs sheet not found', requestId);
    }

    const cfg = CONFIG.BACKLOGS;
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    Logger.log('📍 [' + requestId + '] Will insert at row: ' + newRow + ' (last row was: ' + lastRow + ')');

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

    Logger.log('📋 [' + requestId + '] Prepared row data: ' + JSON.stringify(rowData));

    try {
      // Append to sheet
      sheet.getRange(newRow, cfg.START_COL, 1, cfg.NUM_COLS).setValues([rowData]);
      Logger.log('✅ [' + requestId + '] Row data written to sheet successfully');
    } catch (e) {
      Logger.log('❌ [' + requestId + '] Failed to write to sheet: ' + e.toString());
      return this.errorResponse('Failed to save task', requestId);
    }

    // Trigger sorting and refresh
    try {
      Logger.log('🔄 [' + requestId + '] Triggering BacklogService.sortManual()');
      BacklogService.sortManual();
      Logger.log('🔄 [' + requestId + '] Triggering DailyReportService.refresh()');
      DailyReportService.refresh();
      Logger.log('✅ [' + requestId + '] Services refreshed successfully');
    } catch (e) {
      Logger.log('⚠️ [' + requestId + '] Service refresh warning: ' + e.toString());
      // Don't fail the request for refresh issues
    }

    const task = {
      id: newRow,
      ...data,
      date: data.date || new Date().toISOString().split('T')[0]
    };

    Logger.log('✅ [' + requestId + '] createTask completed successfully, returning task ID: ' + task.id);
    return this.successResponse(task, requestId, 201);
  },

  // Update existing task
  updateTask(params, body, requestId) {
    Logger.log('✏️ [' + requestId + '] Starting updateTask');

    const id = parseInt(params.id);
    Logger.log('🆔 [' + requestId + '] Task ID: ' + id);
    if (!id) {
      Logger.log('❌ [' + requestId + '] Task ID is missing or invalid');
      return this.errorResponse('Task ID required', requestId);
    }

    if (!body) {
      Logger.log('❌ [' + requestId + '] Request body is empty');
      return this.errorResponse('Request body required', requestId);
    }

    Logger.log('📦 [' + requestId + '] Raw body length: ' + body.length + ' chars');

    let data;
    try {
      data = JSON.parse(body);
      Logger.log('✅ [' + requestId + '] JSON parsed successfully');
      Logger.log('📋 [' + requestId + '] Update data keys: ' + Object.keys(data).join(', '));
    } catch (e) {
      Logger.log('❌ [' + requestId + '] JSON parse error: ' + e.toString());
      Logger.log('📋 [' + requestId + '] Raw body: ' + body);
      return this.errorResponse('Invalid JSON', requestId);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    Logger.log('📊 [' + requestId + '] Sheet access result: ' + (sheet ? 'SUCCESS' : 'FAILED'));
    if (!sheet) {
      Logger.log('❌ [' + requestId + '] Backlogs sheet not found');
      return this.errorResponse('Backlogs sheet not found', requestId);
    }

    const cfg = CONFIG.BACKLOGS;
    const rowIndex = id - cfg.START_ROW + 1; // 1-indexed for sheet range
    Logger.log('📍 [' + requestId + '] Calculated row index: ' + rowIndex + ' (id: ' + id + ', START_ROW: ' + cfg.START_ROW + ')');

    if (rowIndex < 1) {
      Logger.log('❌ [' + requestId + '] Invalid task ID - calculated row index is negative');
      return this.errorResponse('Invalid task ID', requestId);
    }

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

    Logger.log('📋 [' + requestId + '] Prepared update row data: ' + JSON.stringify(rowData));

    try {
      sheet.getRange(id, cfg.START_COL, 1, cfg.NUM_COLS).setValues([rowData]);
      Logger.log('✅ [' + requestId + '] Row data updated successfully');
    } catch (e) {
      Logger.log('❌ [' + requestId + '] Failed to update sheet: ' + e.toString());
      return this.errorResponse('Failed to update task', requestId);
    }

    // Trigger sorting and refresh
    try {
      Logger.log('🔄 [' + requestId + '] Triggering BacklogService.sortManual()');
      BacklogService.sortManual();
      Logger.log('🔄 [' + requestId + '] Triggering DailyReportService.refresh()');
      DailyReportService.refresh();
      Logger.log('✅ [' + requestId + '] Services refreshed successfully');
    } catch (e) {
      Logger.log('⚠️ [' + requestId + '] Service refresh warning: ' + e.toString());
      // Don't fail the request for refresh issues
    }

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

    Logger.log('✅ [' + requestId + '] updateTask completed successfully for task ID: ' + id);
    return this.successResponse(task, requestId);
  },

  // Delete task
  deleteTask(params, requestId) {
    Logger.log('🗑️ [' + requestId + '] Starting deleteTask');

    const id = parseInt(params.id);
    Logger.log('🆔 [' + requestId + '] Task ID to delete: ' + id);
    if (!id) {
      Logger.log('❌ [' + requestId + '] Task ID is missing or invalid');
      return this.errorResponse('Task ID required', requestId);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BACKLOGS.SHEET_NAME);
    Logger.log('📊 [' + requestId + '] Sheet access result: ' + (sheet ? 'SUCCESS' : 'FAILED'));
    if (!sheet) {
      Logger.log('❌ [' + requestId + '] Backlogs sheet not found');
      return this.errorResponse('Backlogs sheet not found', requestId);
    }

    const cfg = CONFIG.BACKLOGS;
    Logger.log('⚙️ [' + requestId + '] Config: START_COL=' + cfg.START_COL + ', NUM_COLS=' + cfg.NUM_COLS);

    try {
      // Clear the row
      sheet.getRange(id, cfg.START_COL, 1, cfg.NUM_COLS).clear();
      Logger.log('✅ [' + requestId + '] Row cleared successfully');
    } catch (e) {
      Logger.log('❌ [' + requestId + '] Failed to clear row: ' + e.toString());
      return this.errorResponse('Failed to delete task', requestId);
    }

    // Trigger sorting and refresh
    try {
      Logger.log('🔄 [' + requestId + '] Triggering BacklogService.sortManual()');
      BacklogService.sortManual();
      Logger.log('🔄 [' + requestId + '] Triggering DailyReportService.refresh()');
      DailyReportService.refresh();
      Logger.log('✅ [' + requestId + '] Services refreshed successfully');
    } catch (e) {
      Logger.log('⚠️ [' + requestId + '] Service refresh warning: ' + e.toString());
      // Don't fail the request for refresh issues
    }

    Logger.log('✅ [' + requestId + '] deleteTask completed successfully for task ID: ' + id);
    return this.successResponse({ deleted: true }, requestId);
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