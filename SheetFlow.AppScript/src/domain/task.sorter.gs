const TaskSorter = {
  sortRows(rows) {
    return rows.slice().sort((a, b) => {
      const pinnedA = Boolean(a[SheetSchema.BACKLOGS.FIELDS.PINNED - 1]);
      const pinnedB = Boolean(b[SheetSchema.BACKLOGS.FIELDS.PINNED - 1]);

      if (pinnedA !== pinnedB) {
        return pinnedA ? -1 : 1;
      }

      const dateA = Utils.toDateKey(a[SheetSchema.BACKLOGS.FIELDS.WORK_DATE - 1]);
      const dateB = Utils.toDateKey(b[SheetSchema.BACKLOGS.FIELDS.WORK_DATE - 1]);

      if (!dateA && !dateB) {
        return this._compareWithoutDate(a, b);
      }

      if (!dateA) return -1;
      if (!dateB) return 1;

      const dateCompare = dateB.localeCompare(dateA);
      if (dateCompare !== 0) return dateCompare;

      return this._compareWithoutDate(a, b);
    });
  },

  isOrderChanged(original, sorted) {
    if (original.length !== sorted.length) return true;

    for (let i = 0; i < original.length; i++) {
      const orig = original[i];
      const sort = sorted[i];

      if (orig.length !== sort.length) return true;

      for (let j = 0; j < orig.length; j++) {
        if (j !== SheetSchema.BACKLOGS.FIELDS.NOTE - 1 && orig[j] !== sort[j]) {
          return true;
        }
      }
    }

    return false;
  },

  _compareWithoutDate(a, b) {
    const statusCompare = this._compareStatus(
      a[SheetSchema.BACKLOGS.FIELDS.STATUS - 1],
      b[SheetSchema.BACKLOGS.FIELDS.STATUS - 1]
    );
    if (statusCompare !== 0) return statusCompare;

    const priorityCompare = this._comparePriority(
      a[SheetSchema.BACKLOGS.FIELDS.PRIORITY - 1],
      b[SheetSchema.BACKLOGS.FIELDS.PRIORITY - 1]
    );
    if (priorityCompare !== 0) return priorityCompare;

    const projectCompare = a[SheetSchema.BACKLOGS.FIELDS.PROJECT - 1]
      .localeCompare(b[SheetSchema.BACKLOGS.FIELDS.PROJECT - 1]);
    if (projectCompare !== 0) return projectCompare;

    return a[SheetSchema.BACKLOGS.FIELDS.TASK_NAME - 1]
      .localeCompare(b[SheetSchema.BACKLOGS.FIELDS.TASK_NAME - 1]);
  },

  _comparePriority(a, b) {
    const priorityOrder = { "Cao": 3, "Trung bình": 2, "Thấp": 1 };
    const valA = priorityOrder[String(a).trim()] || 0;
    const valB = priorityOrder[String(b).trim()] || 0;
    return valB - valA;
  },

  _compareStatus(a, b) {
    const statusOrder = {
      "Finished": 6,
      "Review": 5,
      "Processing": 4,
      "Ready": 3,
      "Planned": 2,
      "Aborted": 1
    };

    const valA = statusOrder[String(a).trim()] || 0;
    const valB = statusOrder[String(b).trim()] || 0;
    return valB - valA;
  }
};

const SortService = TaskSorter;
