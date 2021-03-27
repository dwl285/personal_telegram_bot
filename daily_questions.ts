
/**
 * Helper function that prepares the right date format for the AskAlcohol message
 *
 */
const weekdayAndDate = () => {
  var yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - (1000 * 60 * 60 * 24));
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayName = days[yesterday.getDay()];  
  var dateString =  Utilities.formatDate(yesterday, 'Europe/London', 'd MMMM');
  return `${dayName} ${dateString}`;
}

const askYesNoYesterday = (chatId: number, message: string) => {
  const telegram = new Telegram();
  const question = `${message} yesterday, ${weekdayAndDate()}?`;
  return sendQuestion(chatId, question, telegram.yesNoKeyboard);
}

const askAlcohol = (chatId: number) => {
  askYesNoYesterday(chatId, "Did you drink");
}

const askPiano = (chatId: number) => {
  askYesNoYesterday(chatId, "Did you play the piano");
}

const askChess = (chatId: number) => {
  askYesNoYesterday(chatId, "Did you play chess");
}

const askExercise = (chatId: number) => {
  askYesNoYesterday(chatId, "Did you exercise");
}

const askRead = (chatId: number) => {
  askYesNoYesterday(chatId, "Did you read");
}

const dailyQuestions = () => {
  const environment = new Environments().currentEnvironment();
  const chatId = environment.bot.chatId;

  askAlcohol(chatId);
  askPiano(chatId);
  askChess(chatId);
  askExercise(chatId);
  askRead(chatId);
}