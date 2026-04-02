const AppLogger = {
  log(message) {
    Logger.log(message);
  },

  request(requestId, message) {
    Logger.log("[" + requestId + "] " + message);
  }
};
