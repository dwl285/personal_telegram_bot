function spreadsheetLog(note: string, log_message: string): void {
  const env = Environments.currentEnvironment();
  SpreadsheetApp.openById(env.answerLogSheet.spreadsheet)
    .getSheetByName("Logs")
    .appendRow([
      Utilities.formatDate(new Date(), "Europe/London", "YYYY-MM-dd HH:mm:ss"),
      note,
      log_message,
    ]);
}
