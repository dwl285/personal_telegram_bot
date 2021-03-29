// spreadsheets

class GSheet {
  readonly name: string;
  readonly spreadsheet: string;
  constructor(sheetName: string) {
    this.name = sheetName;
    this.spreadsheet = "1WObtaVTWcNgyPTNCDtI09eIQwRCaKcUjQAivailWI_o";
  }
}

// tokens

enum TokenSheet {
  FitbitTokens = "FitbitTokens",
  Tokens = "Tokens",
}

enum TokenName {
  accessTokenDan = "accessTokenDan",
  refreshTokenDan = "refreshTokenDan",
  accessTokenEl = "accessTokenEl",
  refreshTokenEl = "refreshTokenEl",
  prodBotToken = "prodBotToken",
  devBotToken = "devBotToken",
  clientId = "clientId",
  clientSecret = "clientSecret",
  clientParams = "clientParams",
}

enum TokenType {
  Fitbit,
  Regular,
}

class Token {
  readonly name: string;
  readonly sheet: GSheet;
  readonly type: TokenType;
  constructor(name: TokenName) {
    this.name = name;
    const sheetName = {
      accessTokenDan: TokenSheet.FitbitTokens,
      refreshTokenDan: TokenSheet.FitbitTokens,
      accessTokenEl: TokenSheet.FitbitTokens,
      refreshTokenEl: TokenSheet.FitbitTokens,
      clientParams: TokenSheet.FitbitTokens,
      clientId: TokenSheet.FitbitTokens,
      clientSecret: TokenSheet.FitbitTokens,
      prodBotToken: TokenSheet.Tokens,
      devBotToken: TokenSheet.Tokens,
    }[name];
    this.sheet = new GSheet(sheetName);
    const type = {
      accessTokenDan: TokenType.Fitbit,
      refreshTokenDan: TokenType.Fitbit,
      accessTokenEl: TokenType.Fitbit,
      refreshTokenEl: TokenType.Fitbit,
      clientParams: TokenType.Fitbit,
      clientId: TokenType.Fitbit,
      clientSecret: TokenType.Fitbit,
      prodBotToken: TokenType.Regular,
      devBotToken: TokenType.Regular,
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
    SpreadsheetApp.openById(this.sheet.spreadsheet)
      .getSheetByName(this.sheet.name)
      .getDataRange()
      .setValues(newValues);
  }
}

// telegram

type BotToken = string;

enum TelegramChatId {
  prod = -484842241,
  dev = -417576688,
}

class Bot {
  readonly name: string;
  readonly token: BotToken;
  readonly chatId: TelegramChatId;
  constructor(name: string, token: BotToken, chatId: TelegramChatId) {
    this.name = name;
    this.token = token;
    this.chatId = chatId;
  }
}

namespace Telegram {
  export const apiBaseUrl = "https://api.telegram.org/bot";
  export const yesNoKeyboard = {
    inline_keyboard: [
      [
        { text: "🚫", callback_data: "0" },
        { text: "✅", callback_data: "1" },
      ],
    ],
  };
  export enum Endpoint {
    sendMessaege = "sendMessage",
    answerCallbackQuery = "answerCallbackQuery",
    editMessageReplyMarkup = "editMessageReplyMarkup",
  }

  export namespace Bots {
    export const prod = new Bot(
      "dwl285_bot",
      new Token(TokenName.prodBotToken).getValue(),
      TelegramChatId.prod
    );
    export const dev = new Bot(
      "dwl285_dev_bot",
      new Token(TokenName.devBotToken).getValue(),
      TelegramChatId.dev
    );
  }
}

// fitbit

enum fitbitDataTypes {
  sleep = "sleep",
  heart = "heart",
  steps = "steps",
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
  readonly refreshToken: Token;
  readonly accessToken: Token;
  constructor(refreshTokenName: TokenName, accessTokenName: TokenName) {
    this.refreshToken = new Token(refreshTokenName);
    this.accessToken = new Token(accessTokenName);
  }
}

namespace FitbitUtils {
  export const clientParams = new Token(TokenName.clientParams);
  export const clientId = new Token(TokenName.clientId);
  export const clientSecret = new Token(TokenName.clientSecret);
  export enum DateRangeUrl {
    sleep = "https://api.fitbit.com/1.2/user/-/sleep/date",
    heart = "https://api.fitbit.com/1/user/-/activities/heart/date",
    steps = "https://api.fitbit.com/1/user/-/activities/steps/date",
  }
}

// possible chess.com game types
enum ChessGameType {
  daily = "daily",
  rapid = "rapid",
  blitz = "blitz",
}

class ChessComSettings {
  readonly username: string;
  readonly gameType: ChessGameType;
  readonly gamesAtStartOfYear: number;
  readonly gamesGoal: number;
  constructor(
    username: string,
    gameType: ChessGameType,
    gamesAtStartOfYear: number,
    gamesGoal: number
  ) {
    this.username = username;
    this.gameType = gameType;
    this.gamesAtStartOfYear = gamesAtStartOfYear;
    this.gamesGoal = gamesGoal;
  }
}

// BigQuery

declare var BigQuery: GoogleAppsScript.Bigquery;

enum BQTableName {
  questionWrite = "daily_questions",
  summaryRead = "summary",
}

enum BQDatasetName {
  prodWrite = "telegram_prod",
  devWrite = "telegram_dev",
  prodRead = "telegram_analysis",
}

enum BQProjectId {
  danPlayground = "dan-playground-285",
}

interface BQResults {
  fields: string[];
  rows: any[];
}

class BQTable {
  readonly name: BQTableName;
  readonly dataset: BQDatasetName;
  readonly projectId: BQProjectId;
  readonly fullyQualifiedName: string;
  constructor(name: BQTableName) {
    const inputDataset = Environments.currentEnvironment().bqDatasetName;
    const analysisDataset = "telegram_analysis";
    const dataset = {
      daily_questions: inputDataset,
      summary: analysisDataset,
    }[name] as BQDatasetName;
    this.name = name;
    this.dataset = dataset;
    this.projectId = BQProjectId.danPlayground;
    this.fullyQualifiedName = `${this.projectId}.${this.dataset}.${this.name}`;
  }
}

// Questions

type QuestionResponses = QuestionResponse[];

enum QuestionType {
  Chess = "CHESS",
  Reading = "READING",
  Drinking = "DRINKING",
  Exercise = "EXERCISE",
  Piano = "PIANO",
}

enum QuestionString {
  Drinking = "Did you drink",
  Piano = "Did you play the piano",
  Chess = "Did you play chess",
  Exercise = "Did you exercise",
  Reading = "Did you read",
}

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

// Users

class User {
  readonly name: string;
  readonly questions: Question[];
  readonly chess: ChessComSettings;
  readonly fitbit: FitbitSettings;
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

namespace Users {
  export function list(): User[] {
    const dan = new User(
      "dan",
      [
        {
          type: QuestionType.Chess,
          string: QuestionString.Chess,
        },
        {
          type: QuestionType.Drinking,
          string: QuestionString.Drinking,
        },
        {
          type: QuestionType.Piano,
          string: QuestionString.Piano,
        },
        {
          type: QuestionType.Exercise,
          string: QuestionString.Exercise,
        },
        {
          type: QuestionType.Reading,
          string: QuestionString.Reading,
        },
      ],
      new ChessComSettings("dwl285", ChessGameType.rapid, 15, 200),
      new FitbitSettings(TokenName.refreshTokenDan, TokenName.accessTokenDan)
    );
    return [dan];
  }
}

// scripts

enum ScriptUrl {
  Prod = "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec",
  Dev = "https://script.google.com/macros/s/AKfycbw508YXy8PZrpXLNoYc6doVKhA-l3iSb7XNvvYeDLtb/dev",
}

namespace ScriptUrls {
  export const prod = ScriptUrl.Prod;
  export const dev = ScriptUrl.Dev;
}

// environments

enum EnvironmentName {
  Prod,
  Dev,
}

class Environment {
  readonly url: string;
  readonly name: EnvironmentName;
  readonly bot: Bot;
  readonly bqDatasetName: BQDatasetName;
  readonly answerLogSheet: GSheet;

  constructor(
    url: string,
    name: EnvironmentName,
    bot: Bot,
    bqDatasetName: BQDatasetName,
    answerLogSheet: GSheet
  ) {
    this.url = url;
    this.name = name;
    this.bot = bot;
    this.bqDatasetName = bqDatasetName;
    this.answerLogSheet = answerLogSheet;
  }
}

namespace Environments {
  export const prod = new Environment(
    ScriptUrls.prod,
    EnvironmentName.Prod,
    Telegram.Bots.prod,
    BQDatasetName.prodWrite,
    new GSheet("Data")
  );
  export const dev = new Environment(
    ScriptUrls.dev,
    EnvironmentName.Dev,
    Telegram.Bots.dev,
    BQDatasetName.devWrite,
    new GSheet("DataDev")
  );

  export function currentEnvironment(): Environment {
    const currentUrl = ScriptApp.getService().getUrl();
    const options = {};
    options[ScriptUrls.prod] = this.prod;
    options[ScriptUrls.dev] = this.dev;
    return options[currentUrl];
  }

  export function list(): Environment[] {
    return [prod, dev];
  }
}

// utils

namespace MessageUtils {
  export const icons = {
    chess: `♟️`,
    steps: `🚶‍♂️`,
    heart: `💓`,
    sleep: `😴`,
  };
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
