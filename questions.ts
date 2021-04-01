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

function getStreaks(question_type: QuestionType, user: User) {
  const data = getDataBQIFStale(BQTableName.questionRead, user, 60);
  const orderedQuestionData = data
    .filter(function (r) {
      return r.question_type === question_type;
    })
    .sort(
      (a, b) =>
        new Date(b.date_answered).valueOf() -
        new Date(a.date_answered).valueOf()
    );

  let counter = 0;
  const startEvents = orderedQuestionData
    .map((d, i) => {
      const previousDay = orderedQuestionData[i - 1];
      d.isStreakStart = !!previousDay ? previousDay.answer != d.answer : true;
      return d;
    })
    .map((d) => {
      const increment = d.isStreakStart ? 1 : 0;
      counter += increment;
      d.streakCount = counter;
      return d;
    });

  const positiveReponse = user.questions.find((q) => q.type === question_type)
    .positiveResponse;

  const streakLength = startEvents.filter((i) => i.streakCount === 1).length;
  const streakType = startEvents[0].answer === positiveReponse ? "good" : "bad";

  return { streakType: streakType, streakLength: streakLength };
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
