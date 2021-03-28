const spreadsheetLog = (note: string, log_message: string): void => {
  const env = new Environments().currentEnvironment();
  SpreadsheetApp.openById(env.answerLogSheet.spreadsheet).getSheetByName("Logs")
    .appendRow([Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss'), note, log_message]);
}

const recordResponse = (user: string, question: string, response: string): void => {
  const environment = new Environments().currentEnvironment();
  const date = Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss');
  SpreadsheetApp.openById(environment.answerLogSheet.spreadsheet).getSheetByName(environment.answerLogSheet.name)
    .appendRow([date, user, question, response]);
  // insert to BQ
  const data = [{date: date, user: user, question: question, response: response}];
  insertDataBQ(data, "daily_questions");
}