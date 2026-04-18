const ScriptPropertiesRepository = {
  getPropertiesService() {
    return PropertiesService.getScriptProperties();
  },

  getApiKeys() {
    const rawKeys = this.getProperty(APP_CONFIG.API.API_KEYS_PROPERTY);

    if (!rawKeys) return [];
    return rawKeys.split(",");
  },

  getProperty(key) {
    return this.getPropertiesService().getProperty(key);
  },

  setProperty(key, value) {
    this.getPropertiesService().setProperty(key, value);
  },

  deleteProperty(key) {
    this.getPropertiesService().deleteProperty(key);
  },

  getNumber(key, defaultValue) {
    const rawValue = this.getProperty(key);
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return defaultValue;
    }

    const parsed = parseInt(rawValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  setNumber(key, value) {
    this.setProperty(key, String(value));
  },

  getBoolean(key, defaultValue) {
    const rawValue = this.getProperty(key);
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return defaultValue;
    }

    return rawValue === "true";
  },

  setBoolean(key, value) {
    this.setProperty(key, value ? "true" : "false");
  }
};
