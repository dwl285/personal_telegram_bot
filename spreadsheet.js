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
    .appendRow([Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-DD HH:mm:ss'), note, log_message]);
}

/**
 * Helper function for writing responses to the spreadsheet
 *
 * @param {string} user Which user responded
 * @param {string} question Which question the user was replying to
 * @param {string} response The user's response
 */
const recordResponse = (user, question, response) => {
  SpreadsheetApp.openById(spreadsheetID).getSheetByName("Data")
    .appendRow([Utilities.formatDate(new Date(), 'Europe/London', 'YYYY-MM-DD HH:mm:ss'), user, question, response]);
}