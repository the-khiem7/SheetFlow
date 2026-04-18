const RefreshService = {
  refreshAll() {
    return this.processDirty("manual", { force: true });
  },

  processDirty(reason, options) {
    const runOptions = options || {};
    const runContext = ExecutionCoordinatorService.beginRun(reason || "manual", {
      requireDirty: !runOptions.force
    });

    if (!runContext.started) {
      return {
        accepted: false,
        reason: runContext.reason || "skipped"
      };
    }

    try {
      BacklogService.sortManual();
      if (ExecutionCoordinatorService.abortIfStale(runContext)) {
        return {
          accepted: false,
          reason: "stale"
        };
      }

      DailyReportService.refresh();
      if (ExecutionCoordinatorService.abortIfStale(runContext)) {
        return {
          accepted: false,
          reason: "stale"
        };
      }

      ExecutionCoordinatorService.finishRun(runContext, "completed");
      return {
        accepted: true,
        reason: "completed",
        revision: runContext.revision
      };
    } catch (error) {
      ExecutionCoordinatorService.finishRun(runContext, "failed");
      throw error;
    }
  }
};
