/**
 * The function that Telegram calls every time a message happens in the chatroom
 *
 * @param {event} e The event parameter of the request from Telegram
 */
const doPost = (e) => {
  const environment = new Environments().currentEnvironment();

  const contents = JSON.parse(e.postData.getDataAsString());
  spreadsheetLog("Received post update", contents, environment.answerLogSheet.spreadsheet);

  // handle responses to the survey
  if ('callback_query' in contents) {
    const callback_query_id = contents.callback_query.id;
    const users_choice = contents.callback_query.data;
    const message = contents.callback_query.message;
    const responder_first_name = contents.callback_query.from.first_name;
    const original_question = message.text;
    const chatroom_id = message.chat.id;

    recordResponse(responder_first_name, original_question,
      users_choice, environment.answerLogSheet, environment.bqDatasetName);

    const question_type = getQuestionType(original_question);
    const streak_data = getStreaks(question_type);
    const streak_message = createStreakMessage(streak_data, question_type);

    answerCallback(callback_query_id, "Ack");
    sendMessage(chatroom_id, streak_message);
  }
  else if (contents.message.text === "/dailyquestions") {
    dailyQuestions();
  }
  else if (contents.message.text === "/dailysummaries") {
    dailySummaries();
  }
  else {
    // do nothing
  }
}

const getQuestionType = (question = "Did you have a drink?") => {
  return question.search("drink") > 0 ? "DRINKING" :
    question.search("chess") > 0 ? "CHESS" :
      question.search("piano") > 0 ? "PIANO" :
        question.search("reading") > 0 ? "READING" :
          question.search("exercise") > 0 ? "EXERCISE" : undefined;
}

const createStreakMessage = (streakData, question_type) => {
  return streakData.streakType === "0" ?
    `${question_type}: Oh no, it's been ${streakData.streakLength} days, get back on it!` :
    `${question_type}: Way to go, you're on a ${streakData.streakLength} day streak!`;
}

const doGet = (e) => {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(params);
}