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
      new Token("prodBotToken").getValue(),
      -484842241
    );
    this.dev = new Bot(
      "dwl285_dev_bot",
      new Token("devBotToken").getValue(),
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

type TokenType = "Fitbit" | "Regular";

class Token {
  name: string;
  sheet: Sheet;
  type: TokenType;
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
    const type = {
      accessTokenDan: "Fitbit",
      refreshTokenDan: "Fitbit",
      accessTokenEl: "Fitbit",
      refreshTokenEl: "Fitbit",
      clientParams: "Fitbit",
      clientId: "Fitbit",
      clientSecret: "Fitbit",
      prodBotToken: "Regular",
      devBotToken: "Regular",
    }[name] as TokenType;
    this.type = type;
  }

  getValue(): string {
    const allTokens = SpreadsheetApp.openById(this.sheet.spreadsheet)
      .getSheetByName(this.sheet.name)
      .getDataRange()
      .getValues();
    return allTokens.find((row) => row[0] === this.name)[1];
  }

  setValue(newValue: string): void {
    const allTokens = SpreadsheetApp.openById(this.sheet.spreadsheet)
      .getSheetByName(this.sheet.name)
      .getDataRange()
      .getValues();
    const newValues = allTokens.map((row) => [
      row[0],
      row[0] === this.name ? newValue : row[1],
    ]);
  }
}

class Tokens {
  list: Token[];
  constructor() {
    this.list = [
      new Token("accessTokenDan"),
      new Token("refreshTokenDan"),
      new Token("accessTokenEl"),
      new Token("refreshTokenEl"),
      new Token("prodBotToken"),
      new Token("devBotToken"),
      new Token("clientId"),
      new Token("clientSecret"),
      new Token("clientParams"),
    ];
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

// fitbit

type fitbitDataTypes = "sleep" | "heart" | "steps";

type FitbitDateRangeUrl =
  | "https://api.fitbit.com/1.2/user/-/sleep/date"
  | "https://api.fitbit.com/1/user/-/activities/heart/date"
  | "https://api.fitbit.com/1/user/-/activities/steps/date";

interface FitbitDateRangeUrls {
  sleep: FitbitDateRangeUrl;
  heart: FitbitDateRangeUrl;
  steps: FitbitDateRangeUrl;
}

interface SleepData {
  average_mins_of_sleep: number;
  time_asleep_string: string;
  days_with_data: number;
}

interface HeartData {
  average_hr: number;
}

interface StepsData {
  ty: StepsSummaryData;
  lytd: StepsSummaryData;
  lyf: StepsSummaryData;
}

interface StepsSummaryData {
  steps: number;
  days: number;
}

class FitbitSettings {
  refreshToken: Token;
  accessToken: Token;
  constructor(refreshTokenName: TokenName, accessTokenName: TokenName) {
    this.refreshToken = new Token(refreshTokenName);
    this.accessToken = new Token(accessTokenName);
  }
}

class FitbitUtils {
  clientParams: Token;
  clientId: Token;
  clientSecret: Token;
  dateRangeUrls: FitbitDateRangeUrls;
  constructor() {
    this.clientParams = new Token("clientParams");
    this.clientId = new Token("clientId");
    this.clientSecret = new Token("clientSecret");
    this.dateRangeUrls = {
      sleep: "https://api.fitbit.com/1.2/user/-/sleep/date",
      heart: "https://api.fitbit.com/1/user/-/activities/heart/date",
      steps: "https://api.fitbit.com/1/user/-/activities/steps/date",
    };
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
    }[name] as BQDatasetName;
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
  fitbit: FitbitSettings;
  constructor(
    name: string,
    questions: Question[],
    chessComSettings: ChessComSettings,
    fitbit: FitbitSettings
  ) {
    // the users name
    this.name = name;
    this.questions = questions;
    // the users ChessComSettings (a class)
    this.chess = chessComSettings;
    this.fitbit = fitbit;
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
      new ChessComSettings("dwl285", "rapid", 15, 200),
      new FitbitSettings("refreshTokenDan", "accessTokenDan")
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
    steps: string;
    heart: string;
    sleep: string;
  };
  constructor() {
    this.icons = {
      chess: `♟️`,
      steps: `🚶‍♂️`,
      heart: `💓`,
      sleep: `😴`,
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

  dayLastYear(date: Date): Date {
    return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
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

  dateToString(date: Date) {
    return Utilities.formatDate(date, "Europe/London", "yyyy-MM-dd");
  }
}
