const FormatService = {
  applyDateBorders() {
    const rows = BacklogRepository.getRows();
    if (rows.length === 0) return;

    const startRow = SheetSchema.BACKLOGS.START_ROW;
    for (let i = 1; i < rows.length; i++) {
      const rowNumber = startRow + i;
      BacklogRepository.clearBordersForRow(rowNumber);

      if (BacklogFormatter.shouldAddBorder(rows[i - 1], rows[i])) {
        BacklogRepository.setTopBorderForRow(rowNumber);
      }
    }
  },

  applyAlignment() {
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

    this.sortAndFormat();
  },

  sortAndFormat() {
    const originalValues = BacklogRepository.getRows();
    if (originalValues.length === 0) return;

    const sortedValues = TaskSorter.sortRows(originalValues);
    if (TaskSorter.isOrderChanged(originalValues, sortedValues)) {
      BacklogRepository.replaceRows(sortedValues);
    }

    FormatService.applyDateBorders();
    FormatService.applyAlignment();
  },

  sortManual() {
    this.sortAndFormat();
  },

  setupPinnedColumn() {
    BacklogRepository.setupPinnedColumn();
  }
};
