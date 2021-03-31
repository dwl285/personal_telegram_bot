const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  const contents = JSON.parse(e.postData.contents);
  spreadsheetLog("Received post update", contents);
  spreadsheetLog(
    "Received post update: user id",
    contents.callback_query.from.id
  );

  // handle responses to the survey
  if ("callback_query" in contents) {
    handleQuestionReponse(contents);
  } else if (contents.message.text === "/dailyquestions") {
    dailyQuestions();
  } else if (contents.message.text === "/dailysummaries") {
    dailySummaries();
  } else {
    // do nothing
  }
};

// place holder, currently does nothing
const doGet = (e) => {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(params);
};

function dailySummaries(): void {
  const users = Users.list();
  users.forEach((u) => {
    sendDailySummaries(u);
  });
}

function dailyQuestions(): void {
  const users = Users.list();
  users.forEach((u) => {
    askDailyQuestions(u);
  });
}
