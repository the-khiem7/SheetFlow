const FormatService = {
  applyDateBorders(rows, runContext) {
    if (rows.length === 0) return;
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    const profile = runContext ? runContext.profile : null;
    const startRow = SheetSchema.BACKLOGS.START_ROW;
    BacklogRepository.clearBordersForRows(startRow, rows.length);
    AppLogger.profileStep(profile, "FORMAT_CLEAR_BORDERS_DONE", {
      rowCount: rows.length
    });

    let borderCount = 0;
    for (let i = 1; i < rows.length; i++) {
      // Coarse-grained stale checks preserve safety without paying the cost on every row.
      if (i % 25 === 0 && ExecutionCoordinatorService.abortIfStale(runContext)) return;

      const rowNumber = startRow + i;
      if (BacklogFormatter.shouldAddBorder(rows[i - 1], rows[i])) {
        BacklogRepository.setTopBorderForRow(rowNumber);
        borderCount++;
      }
    }

    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    AppLogger.profileStep(profile, "FORMAT_SET_TOP_BORDERS_DONE", {
      rowCount: rows.length,
      borderCount: borderCount
    });
  },

  applyAlignment(rowCount, runContext) {
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;
    if (rowCount <= 0) return;
    BacklogRepository.applyAlignments(SheetSchema.BACKLOGS.START_ROW, rowCount);
    AppLogger.profileStep(runContext ? runContext.profile : null, "FORMAT_ALIGNMENT_DONE", {
      rowCount: rowCount
    });
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
    const profile = runContext ? runContext.profile : null;
    const originalValues = BacklogRepository.getRows();
    AppLogger.profileStep(profile, "BACKLOG_GET_ROWS_DONE", {
      rowCount: originalValues.length,
      colCount: SheetSchema.BACKLOGS.NUM_COLS
    });
    if (originalValues.length === 0) return;

    const sortedValues = TaskSorter.sortRows(originalValues);
    AppLogger.profileStep(profile, "BACKLOG_SORT_ROWS_DONE", {
      rowCount: sortedValues.length
    });
    const orderChanged = TaskSorter.isOrderChanged(originalValues, sortedValues);
    AppLogger.profileStep(profile, "BACKLOG_COMPARE_ORDER_DONE", {
      orderChanged: orderChanged,
      rowCount: sortedValues.length
    });
    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    if (orderChanged) {
      BacklogRepository.replaceRows(sortedValues);
      AppLogger.profileStep(profile, "BACKLOG_REPLACE_ROWS_DONE", {
        rowCount: sortedValues.length,
        colCount: SheetSchema.BACKLOGS.NUM_COLS
      });
    } else {
      AppLogger.profileStep(profile, "BACKLOG_REPLACE_ROWS_SKIPPED", {
        rowCount: sortedValues.length
      });
    }

    if (ExecutionCoordinatorService.abortIfStale(runContext)) return;

    const finalRows = orderChanged ? sortedValues : originalValues;
    FormatService.applyDateBorders(finalRows, runContext);
    FormatService.applyAlignment(finalRows.length, runContext);
  },

  sortManual(runContext) {
    this.sortAndFormat(runContext);
  },

  setupPinnedColumn() {
    BacklogRepository.setupPinnedColumn();
  }
};
