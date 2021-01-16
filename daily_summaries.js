const summaryChess = () => {
  sendMessage(chatId, dailyChessMessage());
}

const summaryFitbit = () => {
  sendMessage(chatId, dailyFitbitMessage());
}

const dailySummaries = () => {
  summaryChess();
  summaryFitbit();
}