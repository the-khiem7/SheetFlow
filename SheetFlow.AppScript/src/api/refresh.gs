const ApiRefresh = {
  handleRefresh(method, params) {
    if (method !== "POST") {
      return ResponseFactory.jsonError("Method not allowed");
    }

    const force = params && params.force === "true";
    const result = force
      ? RefreshService.refreshAll()
      : RefreshService.processDirty("api:refresh", { force: false });

    return ResponseFactory.jsonSuccess(result);
  },

  handleStatus(method) {
    if (method !== "GET") {
      return ResponseFactory.jsonError("Method not allowed");
    }

    return ResponseFactory.jsonSuccess(ExecutionStateRepository.getState());
  }
};
