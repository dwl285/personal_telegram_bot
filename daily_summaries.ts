const dan = new User("dan", new ChessComSettings("dwl285", "rapid", 15, 200));

// handler function to turn a string of unknown length to
// a string of fixed length by adding whitespace to the end 
// (or trimming characters from the end)
function padSpaces(input, totalLength) {
  const text = `${input}`;
  var textLength = text.length;
  if (textLength <= totalLength) {
    var delta = totalLength - textLength;
    return (" ".repeat(delta) + text);
  }
  else {
    return (text.substring(0, totalLength));
  }
}

const responseSummaryMessage = () => {
  const data = getDataBQ("summary", "telegram_analysis");

  const cellLengths = [8, 5, 7, 6]
  var message = padSpaces("", cellLengths[0]) + padSpaces("😇", cellLengths[1] - 1) + padSpaces("📈", cellLengths[2]) + padSpaces("🎯", cellLengths[3]) + "\n";

  message += data.rows.
    sort((a, b) => b[2] - a[2]).
    map((row, i) => {
      var category = padSpaces(row[0], cellLengths[0]);
      var goodDays = padSpaces(row[2], cellLengths[1]);
      var projectedDays = padSpaces(parseFloat(row[3]).toFixed(0), cellLengths[2]);
      var percentAnswered = padSpaces(`${100 * row[4]}%`, cellLengths[3]);;

      return category + goodDays + projectedDays + percentAnswered;
    }).join("\n")

  return `<pre> ${message} </pre>`;
}

const summaryResponses = (chatId: number): void => {
  sendMessage(chatId, responseSummaryMessage());
}

const summaryChess = (chatId: number): void => {
  sendMessage(chatId, getDailyChessMessage(dan, 2021));
}

const summaryFitbit = (chatId: number): void => {
  sendMessage(chatId, dailyFitbitSleepMessage());
  sendMessage(chatId, dailyFitbitHeartrateMessage());
  sendMessage(chatId, dailyFitbitStepsMessage());
}

const dailySummaries = (): void => {
  const environment = new Environments().currentEnvironment();
  const chatId = environment.bot.chatId;
  summaryResponses(chatId);
  summaryChess(chatId);
  summaryFitbit(chatId);
}