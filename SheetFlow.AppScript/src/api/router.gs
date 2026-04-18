const ApiRouter = {
  handleGet(e, requestId) {
    if (!ApiAuth.authenticate(e, requestId)) {
      return ResponseFactory.jsonError("Unauthorized");
    }

    const path = (e.parameter && e.parameter.path) || APP_CONFIG.API.DEFAULT_PATH;
    switch (path) {
      case "tasks":
        return ApiTasks.handle("GET", e.parameter || {}, null, requestId);
      case "reports/daily":
        return ApiReports.handleDailyReport("GET");
      case "refresh/status":
        return ApiRefresh.handleStatus("GET");
      default:
        return ResponseFactory.jsonError("Invalid endpoint");
    }
  },

  handlePost(e, requestId) {
    if (!ApiAuth.authenticate(e, requestId)) {
      return ResponseFactory.jsonError("Unauthorized");
    }

    const params = e.parameter || {};
    const path = params.path || APP_CONFIG.API.DEFAULT_PATH;
    const method = params.method || APP_CONFIG.API.DEFAULT_POST_METHOD;
    const body = e.postData ? e.postData.contents : null;

    switch (path) {
      case "tasks":
        return ApiTasks.handle(method, params, body, requestId);
      case "refresh":
        return ApiRefresh.handleRefresh(method, params);
      default:
        return ResponseFactory.jsonError("Invalid endpoint");
    }
  }
};
