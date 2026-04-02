const BacklogFormatter = {
  getTaskGroup(task) {
    const isPinned = Boolean(task[SheetSchema.BACKLOGS.FIELDS.PINNED - 1]);
    const dateKey = Utils.toDateKey(task[SheetSchema.BACKLOGS.FIELDS.WORK_DATE - 1]);

    if (isPinned) return "PINNED";
    if (!dateKey) return "NO_DATE";
    return "DATED_" + dateKey;
  },

  shouldAddBorder(previousTask, currentTask) {
    return this.getTaskGroup(previousTask) !== this.getTaskGroup(currentTask);
  }
};
