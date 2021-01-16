// get the fitbit tokens from a google sheet
const getTokens = () => {
  return SpreadsheetApp.openById(spreadsheetID).getSheetByName("FitbitTokens")
    .getDataRange().getValues();
}

// select a specific fitbit token by name
const getToken = (tokenName = "accessTokenDan") => {
  const allTokens = getTokens();
  return allTokens.find(row => row[0] === tokenName)[1];
}

// update the tokens for an individual
const updateTokens = (name = "Dan", accessToken = "acccessTest", refreshToken = "refreshTest") => {
  // get all tokens
  const allTokens = getTokens();

  // prepare an object with the new tokens
  const newTokens = {
    [`accessToken${name}`]: accessToken,
    [`refreshToken${name}`]: refreshToken
  };

  // overwrite the old token values with the new token values (where there's a match)
  const newValues = allTokens.map(row => (
    [row[0], newTokens[row[0]] || row[1]]
  ));

  // write the new values back to the spreadsheet
  SpreadsheetApp.openById(spreadsheetID).getSheetByName("FitbitTokens")
    .getDataRange().setValues(newValues);

}

// refresh the access token for a user
const refreshToken = (name = "Dan") => {
  // Get a new auth token

  const refreshToken = getToken(`refreshToken${name}`);
  var headers = {
    "Authorization": "Basic " + fitbitParams.clientParams
  };
  var formData = {
    "grant_type": "refresh_token",
    "refresh_token": refreshToken
  }
  var params = {
    "method": "POST",
    "headers": headers,
    "payload": formData
  };

  const refreshTokenUrl = "https://api.fitbit.com/oauth2/token";
  const response = UrlFetchApp.fetch(refreshTokenUrl, params);
  const data = JSON.parse(response);

  updateTokens(name, data.access_token, data.refresh_token);
}

// refresh tokens for all users
const refreshTokens = () => {
  refreshToken("Dan");
}

const dateRangeUrls = {
  sleep: "https://api.fitbit.com/1.2/user/-/sleep/date",
  heart: "https://api.fitbit.com/1/user/-/activities/heart/date"
};

const getDataForDateRange = (
  type = "sleep",
  name = "Dan",
  start_date = "2021-01-01",
  end_date = "2021-01-11",
) => {

  // refresh tokens
  refreshTokens();

  // Make a GET request with auth
  const authToken = getToken(`accessToken${name}`);
  var headers = {
    "Authorization": "Bearer " + authToken
  };
  var params = {
    "method": "GET",
    "headers": headers
  };
  const url = `${dateRangeUrls[type]}/${start_date}/${end_date}.json`;
  const response = UrlFetchApp.fetch(url, params);
  const data = JSON.parse(response);
  return (data);
}

/* SLEEP */

const lastNDaysAverageSleep = (name = "Dan", n = 28) => {
  const millis_in_day = 1000 * 60 * 60 * 24;
  const yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - (millis_in_day));
  const start_date = new Date()
  start_date.setTime(yesterday.getTime() - ((n - 1) * millis_in_day));
  const yesterday_string = Utilities.formatDate(yesterday, 'Europe/London', 'yyyy-MM-dd');
  const start_date_string = Utilities.formatDate(start_date, 'Europe/London', 'yyyy-MM-dd');
  const sleep_data = getDataForDateRange("sleep", name, start_date_string, yesterday_string);
  const total_mins_asleep = sleep_data.sleep.map(r => r.minutesAsleep).reduce((a, b) => (a + b));
  const days_with_data = new Set(sleep_data.sleep.map(r => r.dateOfSleep)).size;
  const average_mins_of_sleep = total_mins_asleep / days_with_data;
  const hours = Math.floor(average_mins_of_sleep / 60);
  const minutes = Math.floor(average_mins_of_sleep - 60 * hours);
  return ({
    average_mins_of_sleep: average_mins_of_sleep,
    time_asleep_string: `${hours} hrs ${minutes} mins`,
    days_with_data: days_with_data
  });
}

const dailyFitbitSleepMessage = () => {
  return (
    [`*Sleep*`,
      `Last 7 days: ${lastNDaysAverageSleep("Dan", 7).time_asleep_string}`,
      `Last 28 days: ${lastNDaysAverageSleep("Dan", 28).time_asleep_string}`,
      `Last 90 days: ${lastNDaysAverageSleep("Dan", 90).time_asleep_string}`]
      .join(`\n`)
  );
}

/* RESTING HEART RATE */

const lastNDaysAverageHeartrate = (name = "Dan", n = 90) => {
  const millis_in_day = 1000 * 60 * 60 * 24;
  const yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - (millis_in_day));
  const start_date = new Date()
  start_date.setTime(yesterday.getTime() - ((n - 1) * millis_in_day));
  const yesterday_string = Utilities.formatDate(yesterday, 'Europe/London', 'yyyy-MM-dd');
  const start_date_string = Utilities.formatDate(start_date, 'Europe/London', 'yyyy-MM-dd');
  const heart_data = getDataForDateRange("heart", name, start_date_string, yesterday_string);
  const total_hr = heart_data["activities-heart"]
    .map(r => r.value.restingHeartRate)
    .filter(hr => !!hr)
    .reduce((a, b) => (a + b));
  const days_with_data = new Set(heart_data["activities-heart"].map(r => r.dateTime)).size;
  const average_hr = Math.round(total_hr / days_with_data);
  return ({
    average_hr: average_hr
  });
}

const dailyFitbitHeartrateMessage = () => {
  return (
    [`*HR*`,
      `Last 7 days: ${lastNDaysAverageHeartrate("Dan", 7).average_hr}`,
      `Last 28 days: ${lastNDaysAverageHeartrate("Dan", 28).average_hr}`,
      `Last 90 days: ${lastNDaysAverageHeartrate("Dan", 90).average_hr}`]
      .join(`\n`)
  );
}