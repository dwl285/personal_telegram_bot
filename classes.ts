function getTokenValues(sheet: Sheet): any[][] {
  return SpreadsheetApp.openById(sheet.spreadsheet).getSheetByName(sheet.name)
    .getDataRange().getValues();
}

function getTokenValue(token: Token): string {
  const allTokens = getTokenValues(token.sheet);
  return allTokens.find(row => row[0] === token.name)[1];
}

// environments
class Environment {
  url: string;
  name: string;
  bot: Bot;
  bqDatasetName: string;
  answerLogSheet: Sheet;

  constructor(url: string, name: string, bot: Bot, bqDatasetName: string, answerLogSheet: Sheet) {
    this.url = url;
    this.name = name;
    this.bot = bot;
    this.bqDatasetName = bqDatasetName;
    this.answerLogSheet = answerLogSheet
  }
}

class Environments {
  prod: Environment;
  dev: Environment;
  prodUrl: "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec";
  devUrl: "https://script.google.com/macros/s/AKfycbw508YXy8PZrpXLNoYc6doVKhA-l3iSb7XNvvYeDLtb/dev";

  constructor() {
    var bots = new Bots();
    this.prod = new Environment(
      this.prodUrl,
      "PRODUCTION",
      bots.prod,
      "telegram_prod",
      new Sheet("Data"));
    this.dev = new Environment(
      this.devUrl,
      "PRODUCTION",
      bots.dev,
      "telegram_prod",
      new Sheet("DataDev"));
  }

  currentEnvironment(): Environment {
    const currentUrl = ScriptApp.getService().getUrl();
    const options = {};
    options[this.prodUrl] = this.prod;
    options[this.devUrl] = this.dev;
    return options[currentUrl]
  }
}

type BotToken = string;

class Bot {
  name: string;
  token: BotToken;
  chatId: TelegramChatId;
  constructor(name: string, token: BotToken, chatId: TelegramChatId) {
    this.name = name;
    this.token = token;
    this.chatId = chatId
  }
}

class Bots {
  prod: Bot;
  dev: Bot;
  constructor() {
    this.prod = new Bot("dwl285_bot", getTokenValue(new Token("prodBotToken")), -484842241);
    this.dev = new Bot("dwl285_dev_bot", getTokenValue(new Token("devBotToken")), -417576688);
  }
}

// telegram
type TelegramChatId = -484842241 | -417576688;

type TelegramEndpoint = "sendMessage" | "answerCallbackQuery" | "editMessageReplyMarkup";

class Telegram {
  apiBaseUrl: string;
  yesNoKeyboard: {};
  constructor() {
    this.apiBaseUrl = "https://api.telegram.org/bot";
    this.yesNoKeyboard = {
      inline_keyboard: [[{ text: "🚫", callback_data: "0" },
      { text: "✅", callback_data: "1" }
      ]]
    };
  }
}

// tokens

type TokenSheet = "FitbitTokens" | "Tokens";
type TokenName = "accessTokenDan" | "refreshTokenDan" | "accessTokenEl" | "refreshTokenEl"
  | "prodBotToken" | "devBotToken" | "clientId" | "clientSecret" | "clientParams";

class Token {
  name: string;
  sheet: Sheet;
  constructor(name: TokenName) {
    this.name = name;
    const sheetName = {
      "accessTokenDan": "FitbitTokens",
      "refreshTokenDan": "FitbitTokens",
      "accessTokenEl": "FitbitTokens",
      "refreshTokenEl": "FitbitTokens",
      "clientParams": "FitbitTokens",
      "clientId": "FitbitTokens",
      "clientSecret": "FitbitTokens",
      "prodBotToken": "Tokens",
      "devBotToken": "Tokens"
    }[name];
    this.sheet = new Sheet(sheetName);
  }
}

// spreadsheets

class Sheet {
  name: string;
  spreadsheet: string;
  constructor(sheetName: string) {
    this.name = sheetName;
    this.spreadsheet = "1WObtaVTWcNgyPTNCDtI09eIQwRCaKcUjQAivailWI_o";
  }
}

// App functionality

type QuestionType = "CHESS" | "READING" | "DRIKING" | "EXERCISE" | "PIANO"| undefined;

class User {
  name: string;
  chess: ChessComSettings;
  constructor(name: string, chessComSettings: ChessComSettings) {
    // the users name
    this.name = name;
    // the users ChessComSettings (a class)
    this.chess = chessComSettings;
  }
}

// possible chess.com game types
type GameType = "daily" | "rapid" | "blitz";

class ChessComSettings {
  username: string;
  gameType: GameType;
  gamesAtStartOfYear: number;
  gamesGoal: number;
  constructor(username: string, gameType: GameType, gamesAtStartOfYear: number, gamesGoal: number) {
    // the username (for us in calling the chess.com API)
    this.username = username;
    // the game type the user would like to track
    this.gameType = gameType;
    // the number of games the user had played at the start of the year
    this.gamesAtStartOfYear = gamesAtStartOfYear;
    // the goal for number of games played by end of year
    this.gamesGoal = gamesGoal;
  }
}

// utils

class MessageUtils {
  icons: {
    chess: string
  };
  constructor() {
    this.icons = {
      "chess": `♟️`
    }
  }
}

class DateUtils {
  daysYTD(year: number) {
    return Math.floor((Date.now() - Date.UTC(year, 0, 1)) / (1000 * 60 * 60 * 24));
  }
}