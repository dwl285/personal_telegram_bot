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

const askYesNoYesterday = (chatId, message) => {
  const question = `${message} yesterday, ${weekdayAndDate()}?`;
  return sendQuestion(chatId, question, keyboard = yesNoKeyboard);
}

const askAlcohol = () => {
  askYesNoYesterday(chatId, "Did you drink");
}

const askPiano = () => {
  askYesNoYesterday(chatId, "Did you play the piano");
}

const askChess = () => {
  askYesNoYesterday(chatId, "Did you play chess");
}

const askExercise = () => {
  askYesNoYesterday(chatId, "Did you exercise");
}

const askRead = () => {
  askYesNoYesterday(chatId, "Did you read");
}

const dailyQuestions = () => {
  askAlcohol();
  askPiano();
  askChess();
  askExercise();
  askRead();
}