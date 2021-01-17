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
  heart: "https://api.fitbit.com/1/user/-/activities/heart/date",
  steps: "https://api.fitbit.com/1/user/-/activities/steps/date"
};

const dateToString = (date) => {
  return Utilities.formatDate(date, 'Europe/London', 'yyyy-MM-dd');
}

const getDataForDateRange = (
  type = "sleep",
  name = "Dan",
  start_date = new Date(2021, 0, 1),
  end_date = new Date(),
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
  const url = `${dateRangeUrls[type]}/${dateToString(start_date)}/${dateToString(end_date)}.json`;
  const response = UrlFetchApp.fetch(url, params);
  const data = JSON.parse(response);
  return (data);
}

// Get the last N days of data for particular type of data
const lastNDaysData = (type = "sleep", n = 28, name = "Dan") => {
  const millis_in_day = 1000 * 60 * 60 * 24;
  const yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - (millis_in_day));
  const start_date = new Date()
  start_date.setTime(yesterday.getTime() - ((n - 1) * millis_in_day));
  return getDataForDateRange(type, name, start_date, yesterday);
}

/* SLEEP */

const lastNDaysAverageSleep = (name = "Dan", n = 28) => {
  const sleep_data = lastNDaysData("sleep", n, name);
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
      `Yesterday: ${lastNDaysAverageSleep("Dan", 1).time_asleep_string}`,
      `Last 7 days: ${lastNDaysAverageSleep("Dan", 7).time_asleep_string}`,
      `Last 28 days: ${lastNDaysAverageSleep("Dan", 28).time_asleep_string}`,
      `Last 90 days: ${lastNDaysAverageSleep("Dan", 90).time_asleep_string}`]
      .join(`\n`)
  );
}

/* RESTING HEART RATE */

const lastNDaysAverageHeartrate = (name = "Dan", n = 90) => {
  const heart_data = lastNDaysData("heart", n, name);
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
      `Yesterday: ${lastNDaysAverageHeartrate("Dan", 1).average_hr}`,
      `Last 7 days: ${lastNDaysAverageHeartrate("Dan", 7).average_hr}`,
      `Last 28 days: ${lastNDaysAverageHeartrate("Dan", 28).average_hr}`,
      `Last 90 days: ${lastNDaysAverageHeartrate("Dan", 90).average_hr}`]
      .join(`\n`)
  );
}

/* STEPS */

// a function to take a date and return the same date from the previous year
const getDayLastYear = (date) => {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate())
}

// a function to take a range of steps data and return some summary statistics
const summariseSteps = (data) => {
  return {
    steps: data.map(d => parseInt(d.value)).reduce((a, b) => (a + b)),
    days: new Set(data.map(r => r.dateTime)).size
  }
}
const stepStatsYTD = (name = "Dan") => {
  const millis_in_day = 1000 * 60 * 60 * 24;
  var yesterday = new Date(Date.now() - millis_in_day);
  const yesterday_ly = getDayLastYear(yesterday);
  const new_years_day = new Date(yesterday.getFullYear(), 0, 1);
  const new_years_day_ly = getDayLastYear(new_years_day);
  const new_years_eve_ly = new Date(new_years_day_ly.getFullYear(), 11, 31);
  const steps_data_ty = getDataForDateRange("steps", name, new_years_day, yesterday);
  const steps_data_ly_td = getDataForDateRange("steps", name, new_years_day_ly, yesterday_ly);
  const steps_data_ly_full = getDataForDateRange("steps", name, new_years_day_ly, new_years_eve_ly);
  const steps_summary_ty = summariseSteps(steps_data_ty["activities-steps"]);
  const steps_summary_ly_td = summariseSteps(steps_data_ly_td["activities-steps"]);
  const steps_summary_ly_full = summariseSteps(steps_data_ly_full["activities-steps"]);
  return ({
    ty: steps_summary_ty,
    lytd: steps_summary_ly_td,
    lyf: steps_summary_ly_full
  })
}

// Format the steps number to more readable
const formatSteps = (steps, dp=0) => {
  const options = {
      0: `${Math.floor(steps/1000)}k`,
      1: `${Math.floor(steps/100)/10}k`
  };
  return options[dp];
}

const dailyFitbitStepsMessage = () => {
  const d = stepStatsYTD("Dan");
  const projected_steps = d.lyf.days*d.ty.steps/d.ty.days;
  return (
    [`*Steps*`,
      `YTD Steps: ${formatSteps(d.ty.steps)}, ${formatSteps(d.ty.steps/d.ty.days, 0)}/day`,
      `Last YTD Steps: ${formatSteps(d.lytd.steps)}, ${formatSteps(d.lytd.steps/d.lytd.days, 0)}/day`,
      `Projected steps: ${formatSteps(projected_steps)} vs ${formatSteps(d.lyf.steps)} last year`,]
      .join(`\n`)
  );
}
