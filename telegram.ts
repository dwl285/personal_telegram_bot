const setWebhook = (): void => {
  Environments.list().map((e) => {
    const url = Telegram.apiBaseUrl + e.bot.token + "/setWebhook?url=" + e.url;
    const response = String(UrlFetchApp.fetch(url));
    spreadsheetLog("Webhook set", response);
  });
};

function callTelegramApi(
  endpoint: Telegram.Endpoint,
  options: any
): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const botToken = Environments.currentEnvironment().bot.token;
  return UrlFetchApp.fetch(
    Telegram.apiBaseUrl + botToken + "/" + endpoint,
    options
  );
}

const sendMessage = (chat_id: TelegramChatId, text: string): void => {
  // Make a POST request with a JSON payload.
  const data = {
    chat_id: chat_id,
    text: text,
    parse_mode: "HTML",
  };
  const options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(data),
  };
  const response = callTelegramApi(Telegram.Endpoint.sendMessaege, options);
  spreadsheetLog("Sent message", String(response));
};

const sendQuestion = (
  chat_id: TelegramChatId,
  text: string,
  keyboard = {}
): void => {
  // Make a POST request with a JSON payload.
  const data = {
    chat_id: chat_id,
    text: text,
    reply_markup: JSON.stringify(keyboard),
  };
  const options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(data),
  };
  const response = callTelegramApi(Telegram.Endpoint.sendMessaege, options);
  spreadsheetLog("Sent message", String(response));
};

const answerCallback = (callback_query_id: string, text: string): void => {
  // Make a POST request with a JSON payload.
  const data = {
    callback_query_id: callback_query_id,
    text: text,
  };
  const options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(data),
  };
  const response = callTelegramApi(
    Telegram.Endpoint.answerCallbackQuery,
    options
  );
  spreadsheetLog("Answered callback", String(response));
};

const editMessageReplyMarkup = (
  chat_id: TelegramChatId,
  message_id: number,
  reply_markup: string
): void => {
  // Make a POST request with a JSON payload.
  const data = {
    chat_id: chat_id,
    message_id: message_id,
    reply_markup: reply_markup,
  };
  const options = {
    method: "post",
    contentType: "application/json",
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(data),
  };
  const response = callTelegramApi(
    Telegram.Endpoint.editMessageReplyMarkup,
    options
  );
  spreadsheetLog("Edited message reply markup", String(response));
};

function padSpaces(input: string, totalLength: number): string {
  const text = `${input}`;
  var textLength = text.length;
  if (textLength <= totalLength) {
    var delta = totalLength - textLength;
    return " ".repeat(delta) + text;
  } else {
    return text.substring(0, totalLength);
  }
}
