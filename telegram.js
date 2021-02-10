const telegramUrl = "https://api.telegram.org/bot" + botToken;
const webAppUrl = "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec";

/**
 * Connects the bot to the webapp. Only needs to run once, initially
 */
const setWebhook = () => {
  const url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  const response = UrlFetchApp.fetch(url);
  spreadsheetLog("Webhook set", response);
}

/**
 * Sends a message
 *
 * @param {string} chat_id The chatroom to message
 * @param {string} text The message to send
 */
const sendMessage = (chat_id, text) => {
  // Make a POST request with a JSON payload.
  const data = {
    'chat_id': chat_id,
    'text': text,
    'parse_mode': 'HTML'
  };
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(data)
  };
  const response = UrlFetchApp.fetch(telegramUrl + "/sendMessage", options);
  spreadsheetLog("Sent message", response);
}

/**
 * Sends a question (effectively a message, but also with a keyboard)
 *
 * @param {string} chat_id The chatroom to message
 * @param {string} text The message to send
 * @param {keyboard} object The canned responses that the user can tap
 */
const sendQuestion = (chat_id, text, keyboard) => {
  // Make a POST request with a JSON payload.
  const data = {
    'chat_id': chat_id,
    'text': text,
    'reply_markup': JSON.stringify(keyboard)
  };
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(data)
  };
  const response = UrlFetchApp.fetch(telegramUrl + "/sendMessage", options);
  spreadsheetLog("Sent message", response);
}

/**
 * Acknowledges the user's response - a requirement from Telegram
 *
 * @param {string} callback_query_id Which question the user reponded to
 * @param {string} text The message that shows up in the in-app toast
 */
const answerCallback = (callback_query_id, text) => {
  // Make a POST request with a JSON payload.
  const data = {
    'callback_query_id': callback_query_id,
    'text': text
  };
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(data)
  };
  const response = UrlFetchApp.fetch(telegramUrl + "/answerCallbackQuery", options);
  spreadsheetLog("Answered callback", response);
}

/**
 * Edits the reply_markup on a me`ssage
 * WIP
 * 
 */
const editMessageReplyMarkup = (chat_id, message_id, reply_markup) => {
  // Make a POST request with a JSON payload.
  const data = {
    'chat_id': chat_id,
    'message_id': message_id,
    'reply_markup': reply_markup
  };
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(data)
  };
  const response = UrlFetchApp.fetch(telegramUrl + "/editMessageReplyMarkup", options);
  spreadsheetLog("Edited message reply markup", response);
}

// attempting to edit a message (after reply has been sent)
const testMessageEdit = () => {
  editMessageReplyMarkup(-417576688, 108, {
    inline_keyboard: [[{ text: "🚫", callback_data: "0" }
    ]]
  })
}

/**
 * Asks the user(s) how much alcohol they had today. It generates
 * the keyboard, which is the set of canned responses
 */
const yesNoKeyboard = {
  inline_keyboard: [[{ text: "🚫", callback_data: "0" },
  { text: "✅", callback_data: "1" }
  ]]
};

/**
 * Helper function for ensuring strings of equal length, for nice layouts
 *
 * @param {string} text The string to pad or truncate
 * @param {string} totalLength The length we want to pad or truncate to
 */
function padSpaces(text, totalLength) {
  var textLength = text.length;
  if (textLength <= totalLength) {
    var delta = totalLength - textLength;
    return(" ".repeat(delta) +  text);
  }
  else {
    return(text.substring(0, totalLength));
  }
}