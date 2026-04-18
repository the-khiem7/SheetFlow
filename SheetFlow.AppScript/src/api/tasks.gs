const ApiTasks = {
  handle(method, params, body, requestId) {
    switch (method) {
      case "GET":
        return this.getTasks(params, requestId);
      case "POST":
        return this.createTask(body, requestId);
      case "PUT":
        return this.updateTask(params, body, requestId);
      case "DELETE":
        return this.deleteTask(params, requestId);
      default:
        return ResponseFactory.jsonError("Method not allowed");
    }
  },

  getTasks(params, requestId) {
    const rows = BacklogRepository.getRows();
    const tasks = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        !row[SheetSchema.BACKLOGS.FIELDS.PROJECT - 1] &&
        !row[SheetSchema.BACKLOGS.FIELDS.TASK_NAME - 1]
      ) {
        continue;
      }

      const task = TaskMapper.toTask(row, SheetSchema.BACKLOGS.START_ROW + i);
      if (params.status && task.status.toLowerCase() !== params.status.toLowerCase()) continue;
      if (params.project && task.project.toLowerCase() !== params.project.toLowerCase()) continue;
      tasks.push(task);
    }

    AppLogger.request(requestId, "Returning " + tasks.length + " tasks");
    return ResponseFactory.jsonSuccess(tasks);
  },

  createTask(body, requestId) {
    if (!body) return ResponseFactory.jsonError("Request body required");

    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      return ResponseFactory.jsonError("Invalid JSON");
    }

    const rowData = TaskMapper.createRowData(data);
    const rowId = BacklogRepository.appendRow(rowData);
    if (!rowId) return ResponseFactory.jsonError("Failed to save task");

    this.scheduleRefresh("api:create", requestId);
    AppLogger.request(requestId, "Created task at row " + rowId);
    return ResponseFactory.jsonSuccess(TaskMapper.toTask(rowData, rowId));
  },

  updateTask(params, body, requestId) {
    const id = parseInt(params.id, 10);
    if (!id) return ResponseFactory.jsonError("Task ID required");
    if (!body) return ResponseFactory.jsonError("Request body required");

    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      return ResponseFactory.jsonError("Invalid JSON");
    }

    const rowData = TaskMapper.updateRowData(data);
    if (!BacklogRepository.updateRow(id, rowData)) {
      return ResponseFactory.jsonError("Failed to update task");
    }

    this.scheduleRefresh("api:update", requestId);
    AppLogger.request(requestId, "Updated task at row " + id);
    return ResponseFactory.jsonSuccess(TaskMapper.toTask(rowData, id));
  },

  deleteTask(params, requestId) {
    const id = parseInt(params.id, 10);
    if (!id) return ResponseFactory.jsonError("Task ID required");

    if (!BacklogRepository.clearRow(id)) {
      return ResponseFactory.jsonError("Failed to delete task");
    }

    this.scheduleRefresh("api:delete", requestId);
    AppLogger.request(requestId, "Deleted task at row " + id);
    return ResponseFactory.jsonSuccess({ deleted: true });
  },

  scheduleRefresh(reason, requestId) {
    const dirtyResult = ExecutionCoordinatorService.markDirty(reason);
    const refreshResult = RefreshService.processDirty(reason, { force: false });

    AppLogger.request(
      requestId,
      "Marked dirty at revision " + dirtyResult.revision + ", refresh result: " + JSON.stringify(refreshResult)
    );
  }
};
