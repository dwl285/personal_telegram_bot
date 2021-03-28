function getQuestionType(question: string): QuestionType {
  return question.search("drink") > 0 ? "DRINKING" :
    question.search("chess") > 0 ? "CHESS" :
      question.search("piano") > 0 ? "PIANO" :
        question.search("reading") > 0 ? "READING" :
          question.search("exercise") > 0 ? "EXERCISE": undefined;
}

function getStreaks(question_type: QuestionType): any {
  const dataRaw = getDataBQ("summary");
  const data = Object.create({});
  dataRaw.rows.forEach(a => {
    var row = Object.create({});
    row.streakType = a[dataRaw.fields.indexOf("current_streak_type")];
    row.streakLength= a[dataRaw.fields.indexOf("current_streak_length")];
    data[a[0]] = row;
  });
  return data[question_type];
}

function createStreakMessage(streakData: any, question_type: QuestionType): string {
  return streakData.streakType === "0" ?
    `${question_type}: Oh no, it's been ${streakData.streakLength} days, get back on it!` :
    `${question_type}: Way to go, you're on a ${streakData.streakLength} day streak!`;
}

function askYesNoYesterday(chatId: TelegramChatId, question: Question): void {
  const weekdayAndDate = new DateUtils().weekdayAndDate();
  const telegram = new Telegram();
  const questionText = `${question.string} yesterday, ${weekdayAndDate}?`;
  sendQuestion(chatId, questionText, telegram.yesNoKeyboard);
}

function askDailyQuestions(user: User): void {
  const environment = new Environments().currentEnvironment();
  const chatId = environment.bot.chatId;

  user.questions.forEach((q) => {
    askYesNoYesterday(chatId, q);
  })
}