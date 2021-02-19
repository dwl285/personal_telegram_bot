// const currentEnvironment = "TEST";
const currentEnvironment = "PROD";

const testChatID = -417576688;
const prodChatID = -484842241;
const chatId = currentEnvironment === "TEST" ? testChatID : prodChatID;
const bqDatasetName = currentEnvironment === "TEST" ? "telegram_dev" : "telegram_prod";
const spreadsheetInputName = currentEnvironment === "TEST" ? "DataDev" : "Data";

/**
 * The function that Telegram calls every time a message happens in the chatroom
 *
 * @param {event} e The event parameter of the request from Telegram
 */
const doPost = (e) => {
  spreadsheetLog("Received message test", e.postData.getDataAsString());

  const contents = JSON.parse(e.postData.getDataAsString());

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
  // handle regular messages
  else {
    // not currently taking any action
  }
}

const goGet = (e) => {
  return "hello world";
}