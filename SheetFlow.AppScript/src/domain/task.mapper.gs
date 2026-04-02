const TaskMapper = {
  toTask(row, rowId) {
    return {
      id: rowId,
      project: Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.PROJECT - 1]),
      task: Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.TASK_NAME - 1]),
      priority: Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.PRIORITY - 1]),
      status: Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.STATUS - 1]),
      date: this._toApiDate(row[SheetSchema.BACKLOGS.FIELDS.WORK_DATE - 1]),
      note: Utils.safeTrim(row[SheetSchema.BACKLOGS.FIELDS.NOTE - 1]),
      pinned: Boolean(row[SheetSchema.BACKLOGS.FIELDS.PINNED - 1])
    };
  },

  createRowData(data) {
    return [
      data.project || "",
      data.task || "",
      data.priority || "",
      data.status || "Pending",
      data.date ? new Date(data.date) : new Date(),
      data.note || "",
      data.pinned || false
    ];
  },

  updateRowData(data) {
    return [
      data.project !== undefined ? data.project : "",
      data.task !== undefined ? data.task : "",
      data.priority !== undefined ? data.priority : "",
      data.status !== undefined ? data.status : "Pending",
      data.date ? new Date(data.date) : null,
      data.note !== undefined ? data.note : "",
      data.pinned !== undefined ? data.pinned : false
    ];
  },

  _toApiDate(value) {
    const dateKey = Utils.toDateKey(value);
    return dateKey || null;
  }
};
