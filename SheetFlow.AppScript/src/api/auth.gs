const ApiAuth = {
  authenticate(e, requestId) {
    const apiKey = this._extractApiKey(e);
    AppLogger.request(requestId, "API key present: " + (apiKey ? "YES" : "NO"));
    if (!apiKey) return false;

    const validKeys = ScriptPropertiesRepository.getApiKeys();
    const isValid = validKeys.indexOf(apiKey.trim()) !== -1;
    AppLogger.request(requestId, "API key validation result: " + (isValid ? "VALID" : "INVALID"));
    return isValid;
  },

  _extractApiKey(e) {
    if (e.parameter && e.parameter["X-API-Key"]) {
      return e.parameter["X-API-Key"];
    }

    if (!e.postData || !e.postData.contents) return null;

    try {
      const body = JSON.parse(e.postData.contents);
      return body["X-API-Key"] || null;
    } catch (error) {
      return null;
    }
  }
};
