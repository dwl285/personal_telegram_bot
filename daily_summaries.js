const summaryChess = () => {
  sendMessage(chatId, dailyChessMessage());
}

const summaryFitbit = () => {
  sendMessage(chatId, dailyFitbitSleepMessage());
  sendMessage(chatId, dailyFitbitHeartrateMessage());
}

const dailySummaries = () => {
  summaryChess();
  summaryFitbit();
}