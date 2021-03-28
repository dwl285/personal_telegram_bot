const doPost = (e) => {
  const environment = new Environments().currentEnvironment();

  const contents = JSON.parse(e.postData.getDataAsString());
  spreadsheetLog("Received post update", contents);

  // handle responses to the survey
  if ("callback_query" in contents) {
    const callback_query_id = contents.callback_query.id;
    const users_choice = contents.callback_query.data;
    const message = contents.callback_query.message;
    const responder_first_name = contents.callback_query.from.first_name;
    const original_question = message.text;
    const chatroom_id = message.chat.id;

    recordResponse(responder_first_name, original_question, users_choice);

    const question_type = getQuestionType(original_question);
    const streak_data = getStreaks(question_type);
    const streak_message = createStreakMessage(streak_data, question_type);

    answerCallback(callback_query_id, "Ack");
    sendMessage(chatroom_id, streak_message);
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
  const users = new Users().list;
  users.forEach((u) => {
    sendDailySummaries(u);
  });
}

function dailyQuestions(): void {
  const users = new Users().list;
  users.forEach((u) => {
    askDailyQuestions(u);
  });
}
