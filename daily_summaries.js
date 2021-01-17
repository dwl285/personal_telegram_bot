const summaryChess = () => {
  sendMessage(chatId, dailyChessMessage());
}

const summaryFitbit = () => {
  sendMessage(chatId, dailyFitbitSleepMessage());
  sendMessage(chatId, dailyFitbitHeartrateMessage());
  sendMessage(chatId, dailyFitbitStepsMessage());
}

const dailySummaries = () => {
  summaryChess();
  summaryFitbit();
}