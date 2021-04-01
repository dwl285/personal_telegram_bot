function responseSummaryMessage(user: User): string {
  const data: BQResults = getDataBQIFStale(BQTableName.summaryRead, user, 60);

  const cellLengths = [8, 5, 7, 6];
  var message =
    padSpaces("", cellLengths[0]) +
    padSpaces("😇", cellLengths[1] - 1) +
    padSpaces("📈", cellLengths[2]) +
    padSpaces("🎯", cellLengths[3]) +
    "\n";

  message += data
    .sort((a, b) => parseInt(b.good_days) - parseInt(a.good_days))
    .map((row, i) => {
      var category = padSpaces(row.question_type, cellLengths[0]);
      var goodDays = padSpaces(row.good_days, cellLengths[1]);
      var projectedDays = padSpaces(
        parseFloat(row.projected_good_days).toFixed(0),
        cellLengths[2]
      );
      var percentAnswered = padSpaces(
        `${100 * parseInt(row.percent_answered)}%`,
        cellLengths[3]
      );

      return category + goodDays + projectedDays + percentAnswered;
    })
    .join("\n");

  return `<pre> ${message} </pre>`;
}

function sendResponseSummary(chatId: TelegramChatId, user: User): void {
  const message = responseSummaryMessage(user);
  sendMessage(chatId, message);
}

function sendChessSummary(chatId: TelegramChatId, user: User): void {
  sendMessage(chatId, getDailyChessMessage(user));
}

function sendFitbitSummary(chatId: TelegramChatId, user: User): void {
  sendMessage(chatId, dailyFitbitSleepMessage(user));
  sendMessage(chatId, dailyFitbitHeartrateMessage(user));
  sendMessage(chatId, dailyFitbitStepsMessage(user));
}

function sendDailySummaries(user: User): void {
  const environment = Environments.currentEnvironment();
  const chatId = environment.bot.chatId;
  sendResponseSummary(chatId, user);
  sendChessSummary(chatId, user);
  sendFitbitSummary(chatId, user);
}
