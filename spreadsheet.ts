const spreadsheetLog = (note: string, log_message: string): void => {
  const env = new Environments().currentEnvironment();
  SpreadsheetApp.openById(env.answerLogSheet.spreadsheet).getSheetByName("Logs")
    .appendRow([Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss'), note, log_message]);
}

const recordResponse = (user: string, question: string, response: string, answerSheet: Sheet, bqDatasetName: string): void => {
  const date = Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss');
  SpreadsheetApp.openById(answerSheet.spreadsheet).getSheetByName(answerSheet.name)
    .appendRow([date, user, question, response]);
  // insert to BQ
  const data = [{date: date, user: user, question: question, response: response}];
  insertDataBQ(data, "daily_questions", bqDatasetName);
}

const getStreaks = (question_type: QuestionType): any => {
  const dataRaw = getDataBQ("summary", "telegram_analysis");
  const data = Object.create({});
  dataRaw.rows.forEach(a => {
    var row = Object.create({});
    row.streakType = a[dataRaw.fields.indexOf("current_streak_type")];
    row.streakLength= a[dataRaw.fields.indexOf("current_streak_length")];
    data[a[0]] = row;
  });
  return data[question_type];

}