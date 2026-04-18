const ExecutionStateRepository = {
  getState() {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;

    return {
      dirty: ScriptPropertiesRepository.getBoolean(props.DIRTY, false),
      revision: ScriptPropertiesRepository.getNumber(props.REVISION, 0),
      lastRunAt: ScriptPropertiesRepository.getProperty(props.LAST_RUN_AT) || "",
      lastRunReason: ScriptPropertiesRepository.getProperty(props.LAST_RUN_REASON) || "",
      lastRunResult: ScriptPropertiesRepository.getProperty(props.LAST_RUN_RESULT) || "",
      lastDirtyAt: ScriptPropertiesRepository.getProperty(props.LAST_DIRTY_AT) || "",
      lastDirtyReason: ScriptPropertiesRepository.getProperty(props.LAST_DIRTY_REASON) || "",
      runningToken: ScriptPropertiesRepository.getProperty(props.RUNNING_TOKEN) || "",
      runningReason: ScriptPropertiesRepository.getProperty(props.RUNNING_REASON) || "",
      runningRevision: ScriptPropertiesRepository.getNumber(props.RUNNING_REVISION, 0)
    };
  },

  markDirty(reason) {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;
    const nextRevision = this.incrementRevision();

    ScriptPropertiesRepository.setBoolean(props.DIRTY, true);
    ScriptPropertiesRepository.setProperty(props.LAST_DIRTY_AT, new Date().toISOString());
    ScriptPropertiesRepository.setProperty(props.LAST_DIRTY_REASON, reason || "");

    return {
      dirty: true,
      revision: nextRevision
    };
  },

  clearDirty() {
    ScriptPropertiesRepository.setBoolean(APP_CONFIG.EXECUTION.PROPERTIES.DIRTY, false);
  },

  incrementRevision() {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;
    const currentRevision = ScriptPropertiesRepository.getNumber(props.REVISION, 0);
    const nextRevision = currentRevision + 1;
    ScriptPropertiesRepository.setNumber(props.REVISION, nextRevision);
    return nextRevision;
  },

  setRunning(runToken, reason, revision) {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;

    ScriptPropertiesRepository.setProperty(props.RUNNING_TOKEN, runToken || "");
    ScriptPropertiesRepository.setProperty(props.RUNNING_REASON, reason || "");
    ScriptPropertiesRepository.setNumber(props.RUNNING_REVISION, revision || 0);
  },

  clearRunning() {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;

    ScriptPropertiesRepository.deleteProperty(props.RUNNING_TOKEN);
    ScriptPropertiesRepository.deleteProperty(props.RUNNING_REASON);
    ScriptPropertiesRepository.deleteProperty(props.RUNNING_REVISION);
  },

  setLastRun(reason, result) {
    const props = APP_CONFIG.EXECUTION.PROPERTIES;

    ScriptPropertiesRepository.setProperty(props.LAST_RUN_AT, new Date().toISOString());
    ScriptPropertiesRepository.setProperty(props.LAST_RUN_REASON, reason || "");
    ScriptPropertiesRepository.setProperty(props.LAST_RUN_RESULT, result || "");
  }
};
