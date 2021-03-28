function getTokenValues(sheet: Sheet): any[][] {
  return SpreadsheetApp.openById(sheet.spreadsheet)
    .getSheetByName(sheet.name)
    .getDataRange()
    .getValues();
}

function getTokenValue(token: Token): string {
  const allTokens = getTokenValues(token.sheet);
  return allTokens.find((row) => row[0] === token.name)[1];
}

type EnvironmentName = "PRODUCTION" | "DEVELOPMENT";

// environments
class Environment {
  url: string;
  name: EnvironmentName;
  bot: Bot;
  bqDatasetName: BQDatasetName;
  answerLogSheet: Sheet;

  constructor(
    url: string,
    name: EnvironmentName,
    bot: Bot,
    bqDatasetName: BQDatasetName,
    answerLogSheet: Sheet
  ) {
    this.url = url;
    this.name = name;
    this.bot = bot;
    this.bqDatasetName = bqDatasetName;
    this.answerLogSheet = answerLogSheet;
  }
}

type ScriptUrl =
  | "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec"
  | "https://script.google.com/macros/s/AKfycbw508YXy8PZrpXLNoYc6doVKhA-l3iSb7XNvvYeDLtb/dev";

class ScriptUrls {
  prodUrl: ScriptUrl;
  devUrl: ScriptUrl;
  constructor() {
    this.prodUrl =
      "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec";
    this.devUrl =
      "https://script.google.com/macros/s/AKfycbw508YXy8PZrpXLNoYc6doVKhA-l3iSb7XNvvYeDLtb/dev";
  }
}

class Environments {
  prod: Environment;
  dev: Environment;

  constructor() {
    const urls = new ScriptUrls();
    var bots = new Bots();
    this.prod = new Environment(
      urls.prodUrl,
      "PRODUCTION",
      bots.prod,
      "telegram_prod",
      new Sheet("Data")
    );
    this.dev = new Environment(
      urls.devUrl,
      "DEVELOPMENT",
      bots.dev,
      "telegram_dev",
      new Sheet("DataDev")
    );
  }

  currentEnvironment(): Environment {
    const urls = new ScriptUrls();
    const currentUrl = ScriptApp.getService().getUrl();
    const options = {};
    options[urls.prodUrl] = this.prod;
    options[urls.devUrl] = this.dev;
    return options[currentUrl];
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
    this.chatId = chatId;
  }
}

class Bots {
  prod: Bot;
  dev: Bot;
  constructor() {
    this.prod = new Bot(
      "dwl285_bot",
      getTokenValue(new Token("prodBotToken")),
      -484842241
    );
    this.dev = new Bot(
      "dwl285_dev_bot",
      getTokenValue(new Token("devBotToken")),
      -417576688
    );
  }
}

// telegram
type TelegramChatId = -484842241 | -417576688;

type TelegramEndpoint =
  | "sendMessage"
  | "answerCallbackQuery"
  | "editMessageReplyMarkup";

class Telegram {
  apiBaseUrl: string;
  yesNoKeyboard: {};
  constructor() {
    this.apiBaseUrl = "https://api.telegram.org/bot";
    this.yesNoKeyboard = {
      inline_keyboard: [
        [
          { text: "🚫", callback_data: "0" },
          { text: "✅", callback_data: "1" },
        ],
      ],
    };
  }
}

// tokens

type TokenSheet = "FitbitTokens" | "Tokens";
type TokenName =
  | "accessTokenDan"
  | "refreshTokenDan"
  | "accessTokenEl"
  | "refreshTokenEl"
  | "prodBotToken"
  | "devBotToken"
  | "clientId"
  | "clientSecret"
  | "clientParams";

class Token {
  name: string;
  sheet: Sheet;
  constructor(name: TokenName) {
    this.name = name;
    const sheetName = {
      accessTokenDan: "FitbitTokens",
      refreshTokenDan: "FitbitTokens",
      accessTokenEl: "FitbitTokens",
      refreshTokenEl: "FitbitTokens",
      clientParams: "FitbitTokens",
      clientId: "FitbitTokens",
      clientSecret: "FitbitTokens",
      prodBotToken: "Tokens",
      devBotToken: "Tokens",
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

// BigQuery

type BQTableName = "daily_questions" | "summary";
type BQDatasetName = "telegram_prod" | "telegram_dev" | "telegram_analysis";
type BQProjectId = "dan-playground-285";
interface BQResults {
  fields: string[];
  rows: any[];
}

class BQTable {
  name: BQTableName;
  dataset: BQDatasetName;
  projectId: BQProjectId;
  fullyQualifiedName: string;
  constructor(name: BQTableName) {
    const inputDataset = new Environments().currentEnvironment().bqDatasetName;
    const analysisDataset = "telegram_analysis";
    const dataset = {
      daily_questions: inputDataset,
      summary: analysisDataset,
    }[name];
    this.name = name;
    this.dataset = dataset;
    this.projectId = "dan-playground-285";
    this.fullyQualifiedName = `${this.projectId}.${this.dataset}.${this.name}`;
  }
}

// Questions

type QuestionType =
  | "CHESS"
  | "READING"
  | "DRINKING"
  | "EXERCISE"
  | "PIANO"
  | undefined;
type QuestionString =
  | "Did you drink"
  | "Did you play the piano"
  | "Did you play chess"
  | "Did you exercise"
  | "Did you read";
interface Question {
  type: QuestionType;
  string: QuestionString;
}
interface QuestionResponse {
  date: string;
  user: string;
  question: string;
  response: string;
}
type QuestionResponses = QuestionResponse[];

// Users

class User {
  name: string;
  questions: Question[];
  chess: ChessComSettings;
  constructor(
    name: string,
    questions: Question[],
    chessComSettings: ChessComSettings
  ) {
    // the users name
    this.name = name;
    // the users ChessComSettings (a class)
    this.chess = chessComSettings;
    this.questions = questions;
  }
}

class Users {
  list: User[];
  constructor() {
    const dan = new User(
      "dan",
      [
        {
          type: "CHESS",
          string: "Did you play chess",
        },
        {
          type: "DRINKING",
          string: "Did you drink",
        },
        {
          type: "PIANO",
          string: "Did you play the piano",
        },
        {
          type: "EXERCISE",
          string: "Did you exercise",
        },
        {
          type: "READING",
          string: "Did you read",
        },
      ],
      new ChessComSettings("dwl285", "rapid", 15, 200)
    );
    this.list = [dan];
  }
}

// possible chess.com game types
type GameType = "daily" | "rapid" | "blitz";

class ChessComSettings {
  username: string;
  gameType: GameType;
  gamesAtStartOfYear: number;
  gamesGoal: number;
  constructor(
    username: string,
    gameType: GameType,
    gamesAtStartOfYear: number,
    gamesGoal: number
  ) {
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
    chess: string;
  };
  constructor() {
    this.icons = {
      chess: `♟️`,
    };
  }
}

class DateUtils {
  currentYear: number;

  constructor() {
    this.currentYear = 2021;
  }

  daysYTD(year: number): number {
    return Math.floor(
      (Date.now() - Date.UTC(year, 0, 1)) / (1000 * 60 * 60 * 24)
    );
  }

  weekdayAndDate(): string {
    var yesterday = new Date();
    yesterday.setTime(yesterday.getTime() - 1000 * 60 * 60 * 24);
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var dayName = days[yesterday.getDay()];
    var dateString = Utilities.formatDate(yesterday, "Europe/London", "d MMMM");
    return `${dayName} ${dateString}`;
  }
}
