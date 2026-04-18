const LockRepository = {
  tryAcquire(timeoutMs) {
    const lock = LockService.getDocumentLock();
    const acquired = lock.tryLock(timeoutMs);

    return {
      lock: lock,
      acquired: acquired
    };
  },

  release(lockHandle) {
    if (!lockHandle || !lockHandle.lock || !lockHandle.acquired) return;
    lockHandle.lock.releaseLock();
  }
};
