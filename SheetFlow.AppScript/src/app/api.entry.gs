const ApiEntry = {
  doGet(e) {
    const requestId = Utils.createRequestId();
    AppLogger.request(requestId, "GET request started");

    try {
      return ApiRouter.handleGet(e, requestId);
    } catch (error) {
      AppLogger.request(requestId, "GET request failed: " + error.toString());
      return ResponseFactory.jsonError("Internal server error");
    }
  },

  doPost(e) {
    const requestId = Utils.createRequestId();
    AppLogger.request(requestId, "POST request started");

    try {
      return ApiRouter.handlePost(e, requestId);
    } catch (error) {
      AppLogger.request(requestId, "POST request failed: " + error.toString());
      return ResponseFactory.jsonError("Internal server error");
    }
  }
};
