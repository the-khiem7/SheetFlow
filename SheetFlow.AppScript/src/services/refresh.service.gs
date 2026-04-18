const RefreshService = {
  refreshAll() {
    return this.processDirty("manual", { force: true });
  },

  processDirty(reason, options) {
    const runOptions = options || {};
    const refreshProfile = AppLogger.createProfile("RefreshService.processDirty", {
      reason: reason || "manual",
      force: !!runOptions.force
    });
    const runContext = ExecutionCoordinatorService.beginRun(reason || "manual", {
      requireDirty: !runOptions.force
    });

    if (!runContext.started) {
      AppLogger.profileEnd(refreshProfile, {
        accepted: false,
        result: runContext.reason || "skipped"
      });
      return {
        accepted: false,
        reason: runContext.reason || "skipped"
      };
    }

    runContext.profile = refreshProfile;
    AppLogger.profileStep(refreshProfile, "RUN_CONTEXT_READY", {
      token: runContext.token,
      revision: runContext.revision,
      dirty: runContext.state ? runContext.state.dirty : ""
    });

    try {
      BacklogService.sortManual(runContext);
      AppLogger.profileStep(refreshProfile, "BACKLOG_SORT_MANUAL_DONE", {});
      if (ExecutionCoordinatorService.abortIfStale(runContext)) {
        AppLogger.profileEnd(refreshProfile, {
          accepted: false,
          result: "stale_after_backlog"
        });
        return {
          accepted: false,
          reason: "stale"
        };
      }

      DailyReportService.refresh(runContext);
      AppLogger.profileStep(refreshProfile, "DAILY_REPORT_REFRESH_DONE", {});
      if (ExecutionCoordinatorService.abortIfStale(runContext)) {
        AppLogger.profileEnd(refreshProfile, {
          accepted: false,
          result: "stale_after_daily_report"
        });
        return {
          accepted: false,
          reason: "stale"
        };
      }

      ExecutionCoordinatorService.finishRun(runContext, "completed");
      AppLogger.profileEnd(refreshProfile, {
        accepted: true,
        result: "completed",
        revision: runContext.revision
      });
      return {
        accepted: true,
        reason: "completed",
        revision: runContext.revision
      };
    } catch (error) {
      ExecutionCoordinatorService.finishRun(runContext, "failed");
      AppLogger.profileEnd(refreshProfile, {
        accepted: false,
        result: "failed",
        error: error && error.message ? error.message : String(error)
      });
      throw error;
    }
  }
};
