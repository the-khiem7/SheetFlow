const ExecutionCoordinatorService = {
  markDirty(reason) {
    const dirtyState = ExecutionStateRepository.markDirty(reason || "unknown");

    return {
      accepted: true,
      dirty: dirtyState.dirty,
      revision: dirtyState.revision
    };
  },

  beginRun(reason, options) {
    const runReason = reason || "manual";
    const runOptions = options || {};
    const lockTimeoutMs = runOptions.lockTimeoutMs || APP_CONFIG.EXECUTION.LOCK_TIMEOUT_MS;
    const lockHandle = LockRepository.tryAcquire(lockTimeoutMs);

    if (!lockHandle.acquired) {
      return {
        started: false,
        reason: "locked",
        lockHandle: lockHandle
      };
    }

    const state = ExecutionStateRepository.getState();
    if (runOptions.requireDirty && !state.dirty) {
      LockRepository.release(lockHandle);
      return {
        started: false,
        reason: "clean",
        lockHandle: lockHandle,
        state: state
      };
    }

    const token = Utils.createRequestId();
    ExecutionStateRepository.setRunning(token, runReason, state.revision);

    return {
      started: true,
      token: token,
      revision: state.revision,
      reason: runReason,
      state: state,
      lockHandle: lockHandle
    };
  },

  isStale(runContext) {
    if (!runContext || !runContext.started) return false;

    const state = ExecutionStateRepository.getState();
    return state.revision !== runContext.revision || state.runningToken !== runContext.token;
  },

  abortIfStale(runContext) {
    if (this.isStale(runContext)) {
      this.finishRun(runContext, "stale");
      return true;
    }

    return false;
  },

  finishRun(runContext, result) {
    if (!runContext || !runContext.lockHandle) return;

    const currentState = ExecutionStateRepository.getState();
    const ownsRunningToken = currentState.runningToken === runContext.token;

    ExecutionStateRepository.setLastRun(runContext.reason, result || "completed");
    if (ownsRunningToken) {
      ExecutionStateRepository.clearRunning();
    }

    if (result !== "stale") {
      if (currentState.revision === runContext.revision && ownsRunningToken) {
        ExecutionStateRepository.clearDirty();
      }
    }

    LockRepository.release(runContext.lockHandle);
  }
};
