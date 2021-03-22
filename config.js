// this is a test 
// environment-dependent config
const environmentConfigs = [
  {
    url: "https://script.google.com/macros/s/AKfycbxZJk6vRe80-6SPifMnfaKICF2V6nOjYdyVWwZg1Kb8yO6P5qlyaHLXRw/exec",
    name: "PRODUCTION",
    bot: {
      name: "dwl285_bot",
      token: prodBotToken,
      chatId: -484842241
    },
    bqDatasetName: "telegram_prod",
    spreadsheetInputName: "Data"
  },
  {
    url: "https://script.google.com/macros/s/AKfycbw508YXy8PZrpXLNoYc6doVKhA-l3iSb7XNvvYeDLtb/dev",
    name: "DEVELOPMENT",
    bot: {
      name: "dwl285_dev_bot",
      token: devBotToken,
      chatId: -417576688
    },
    bqDatasetName: "telegram_dev",
    spreadsheetInputName: "DataDev"
  }
];

var currentEnvironment;
const thisUrl = ScriptApp.getService().getUrl();
const env = environmentConfigs.forEach((e) => {
  if (e.url === thisUrl) {
    currentEnvironment = e.name
  }
})

const environmentConfig = environmentConfigs.find((e) => e.name === currentEnvironment);

const chatId = environmentConfig.bot.chatId;
const bqDatasetName = environmentConfig.bqDatasetName;
const spreadsheetInputName = environmentConfig.spreadsheetInputName;