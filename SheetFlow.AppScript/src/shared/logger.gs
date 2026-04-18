const AppLogger = {
  log(message) {
    Logger.log(message);
  },

  request(requestId, message) {
    Logger.log("[" + requestId + "] " + message);
  },

  nowMs() {
    return new Date().getTime();
  },

  createProfile(label, metadata) {
    const startedAt = this.nowMs();
    const profile = {
      label: label,
      startedAt: startedAt,
      lastStepAt: startedAt,
      metadata: metadata || {}
    };

    this.log(this._formatProfileMessage(label, "START", 0, 0, metadata || {}));
    return profile;
  },

  profileStep(profile, step, metadata) {
    if (!profile) return;

    const now = this.nowMs();
    const stepElapsedMs = now - profile.lastStepAt;
    const totalElapsedMs = now - profile.startedAt;
    profile.lastStepAt = now;

    this.log(
      this._formatProfileMessage(
        profile.label,
        step,
        stepElapsedMs,
        totalElapsedMs,
        metadata || {}
      )
    );
  },

  profileEnd(profile, metadata) {
    if (!profile) return;

    const now = this.nowMs();
    const stepElapsedMs = now - profile.lastStepAt;
    const totalElapsedMs = now - profile.startedAt;

    this.log(
      this._formatProfileMessage(
        profile.label,
        "END",
        stepElapsedMs,
        totalElapsedMs,
        metadata || {}
      )
    );
  },

  _formatProfileMessage(label, step, stepElapsedMs, totalElapsedMs, metadata) {
    const meta = this._formatMetadata(metadata || {});
    return (
      "[PROFILE][" + label + "] " +
      step +
      " | stepMs=" + stepElapsedMs +
      " | totalMs=" + totalElapsedMs +
      (meta ? " | " + meta : "")
    );
  },

  _formatMetadata(metadata) {
    const parts = [];
    const keys = Object.keys(metadata);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = metadata[key];
      if (value === null || value === undefined || value === "") continue;
      parts.push(key + "=" + value);
    }

    return parts.join(" | ");
  }
};
