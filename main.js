/**
 * The function that Telegram calls every time a message happens in the chatroom
 *
 * @param {event} e The event parameter of the request from Telegram
 */
const doPost = (e) => {
  const contents = JSON.parse(e.postData.getDataAsString());
  spreadsheetLog("Received post update", contents);

  // handle responses to the survey
  if ('callback_query' in contents) {
    const callback_query_id = contents.callback_query.id;
    const users_choice = contents.callback_query.data;
    const message = contents.callback_query.message;
    const responder_first_name = contents.callback_query.from.first_name;
    const original_question = message.text;
    const chatroom_id = message.chat.id;

    recordResponse(responder_first_name, original_question, users_choice);
    answerCallback(callback_query_id, "Ack");
    sendMessage(chatroom_id, "Got it");
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

const doGet = (e) => {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(params);
}