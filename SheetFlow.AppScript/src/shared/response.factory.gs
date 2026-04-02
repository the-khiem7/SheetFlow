const ResponseFactory = {
  jsonSuccess(data) {
    return ContentService
      .createTextOutput(JSON.stringify({ data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  },

  jsonError(message) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
};
