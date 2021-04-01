function getQuestionType(question: string): QuestionType {
  return question.search("drink") > 0
    ? QuestionType.Drinking
    : question.search("chess") > 0
    ? QuestionType.Chess
    : question.search("piano") > 0
    ? QuestionType.Piano
    : question.search("reading") > 0
    ? QuestionType.Reading
    : question.search("exercise") > 0
    ? QuestionType.Exercise
    : undefined;
}

function askYesNoYesterday(chatId: TelegramChatId, question: Question): void {
  const weekdayAndDate = new DateUtils().weekdayAndDate();
  const questionText = `${question.string} yesterday, ${weekdayAndDate}?`;
  sendQuestion(chatId, questionText, Telegram.yesNoKeyboard);
}

function askDailyQuestions(user: User): void {
  const environment = Environments.currentEnvironment();
  const chatId = environment.bot.chatId;

  user.questions.forEach((q) => {
    askYesNoYesterday(chatId, q);
  });
}

function recordResponse(
  user: string,
  question: string,
  response: string
): void {
  const environment = Environments.currentEnvironment();
  const date = Utilities.formatDate(
    new Date(),
    "Europe/London",
    "YYYY-MM-dd HH:mm:ss"
  );
  SpreadsheetApp.openById(environment.answerLogSheet.spreadsheet)
    .getSheetByName(environment.answerLogSheet.name)
    .appendRow([date, user, question, response]);
  // insert to BQ
  const data = [
    { date: date, user: user, question: question, response: response },
  ];
  insertDataBQ(data, BQTableName.questionWrite);
}

// fields: [ 'date_answered', 'user', 'question_type', 'answer' ],\n
// rows: \n   [ [ '2021-01-06', 'Dan', 'READING', 'NO' ],\n     [ '2021-01-17', 'Dan', 'DRINKING', 'NO' ],\n
//  [ '2021-01-19', 'Dan', 'DRINKING', 'NO' ],\n
// [ '2021-01-27', 'Dan', 'DRINKING', 'NO' ],\n
// [ '2021-01-13', 'Dan', 'EXERCISE', 'NO' ],\n

// TODO: needs finishing
function calculateStreaks(user = Users.list()[0]) {
  const data = getDataBQIFStale(BQTableName.questionRead, user, 60);
  console.log(data);
}

function getStreaks(question_type: QuestionType, user: User): any {
  const data = getDataBQIFStale(BQTableName.summaryRead, user, 60);

  return data.find((r) => r.question_type === question_type);
}

function createStreakMessage(
  streakData: any,
  question_type: QuestionType
): string {
  return streakData.streakType === "0"
    ? `${question_type}: Oh no, it's been ${streakData.streakLength} days, get back on it!`
    : `${question_type}: Way to go, you're on a ${streakData.streakLength} day streak!`;
}

function handleQuestionReponse(contents: any): void {
  const callbackQueryId = contents.callback_query.id;
  const usersChocie = contents.callback_query.data;
  const message = contents.callback_query.message;
  const responderUserId = contents.callback_query.from.id;
  const originalQuestion = message.text;
  const chatroomId = message.chat.id;

  recordResponse(responderUserId, originalQuestion, usersChocie);
  answerCallback(callbackQueryId, "Ack");
  // TODO: Fix this
  const user = Users.getUserWithTelegramId(responderUserId);

  const questionType = getQuestionType(originalQuestion);
  const streakData = getStreaks(questionType, user);
  const streakMessage = createStreakMessage(streakData, questionType);
  sendMessage(chatroomId, streakMessage);
}
