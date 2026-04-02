const ScriptPropertiesRepository = {
  getApiKeys() {
    const rawKeys = PropertiesService
      .getScriptProperties()
      .getProperty(APP_CONFIG.API.API_KEYS_PROPERTY);

    if (!rawKeys) return [];
    return rawKeys.split(",");
  }
};
