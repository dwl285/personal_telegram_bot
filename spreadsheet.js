const spreadsheetID = "1WObtaVTWcNgyPTNCDtI09eIQwRCaKcUjQAivailWI_o";

/**
 * Helper function for writing logs to the spreadsheet, because Stackdriver logging
 * doesn't let you view logs when WebApp initiated 
 *
 * @param {string} note A hardcoded note that explains the context of this log
 * @param {string} log_message The contents of the log
 */
const spreadsheetLog = (note, log_message) => {
  SpreadsheetApp.openById(spreadsheetID).getSheetByName("Logs")
    .appendRow([Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss'), note, log_message]);
}

/**
 * Helper function for writing responses to the spreadsheet
 *
 * @param {string} user Which user responded
 * @param {string} question Which question the user was replying to
 * @param {string} response The user's response
 */
const recordResponse = (user = "dev", question = "a question", response = "an answer") => {
  const date = Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-dd HH:mm:ss');
  SpreadsheetApp.openById(spreadsheetID).getSheetByName(spreadsheetInputName)
    .appendRow([date, user, question, response]);
  // insert to BQ
  const data = [{date: date, user: user, question: question, response: response}];
  insertDataBQ(data, "daily_questions", bqDatasetName);
}

const getStreaks = (question_type) => {
  const dataRaw = getDataBQ("summary", "telegram_analysis");
  const data = Object.create({});
  dataRaw.rows.forEach(a => {
    row = Object.create({});
    row.streakType = a[dataRaw.fields.indexOf("current_streak_type")];
    row.streakLength= a[dataRaw.fields.indexOf("current_streak_length")];
    data[a[0]] = row;
  });
  return data[question_type];

}
