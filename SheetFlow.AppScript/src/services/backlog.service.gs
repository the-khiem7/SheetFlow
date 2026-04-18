const FormatService = {
  applyDateBorders(runContext) {
    const rows = BacklogRepository.getRows();
    if (rows.length === 0) return;

    const startRow = SheetSchema.BACKLOGS.START_ROW;
    for (let i = 1; i < rows.length; i++) {
      if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

      const rowNumber = startRow + i;
      BacklogRepository.clearBordersForRow(rowNumber);

      if (BacklogFormatter.shouldAddBorder(rows[i - 1], rows[i])) {
        BacklogRepository.setTopBorderForRow(rowNumber);
      }
    }
  },

  applyAlignment(runContext) {
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    const rows = BacklogRepository.getRows();
    if (rows.length === 0) return;
    BacklogRepository.applyAlignments(SheetSchema.BACKLOGS.START_ROW, rows.length);
  },

  _getTaskGroup(task) {
    return BacklogFormatter.getTaskGroup(task);
  }
};

const BacklogService = {
  handleEdit(sheet, e) {
    const cfg = SheetSchema.BACKLOGS;
    if (!sheet || sheet.getName() !== cfg.SHEET_NAME) return;
    if (e.range.rowStart < cfg.START_ROW) return;

    const editedCol = e.range.columnStart;
    if (editedCol < cfg.START_COL || editedCol > cfg.START_COL + cfg.NUM_COLS - 1) return;

    const dirtyResult = ExecutionCoordinatorService.markDirty("desktop:onEdit");
    AppLogger.log("Backlog marked dirty at revision " + dirtyResult.revision);
  },

  sortAndFormat(runContext) {
    const originalValues = BacklogRepository.getRows();
    if (originalValues.length === 0) return;

    const sortedValues = TaskSorter.sortRows(originalValues);
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    if (TaskSorter.isOrderChanged(originalValues, sortedValues)) {
      BacklogRepository.replaceRows(sortedValues);
    }

    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    FormatService.applyDateBorders(runContext);
    FormatService.applyAlignment(runContext);
  },

  sortManual(runContext) {
    this.sortAndFormat(runContext);
  },

  setupPinnedColumn() {
    BacklogRepository.setupPinnedColumn();
  }
};
