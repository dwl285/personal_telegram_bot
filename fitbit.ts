// refresh the access token for a user
function refreshFitbitTokens(user: User): void {
  // Get a new auth token
  const refreshToken = user.fitbit.refreshToken.getValue();
  const clientParams = FitbitUtils.clientParams.getValue();
  var headers = {
    Authorization: "Basic " + clientParams,
  };
  var formData = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };
  var params = {
    method: "post",
    headers: headers,
    payload: formData,
  } as GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const refreshTokenUrl = "https://api.fitbit.com/oauth2/token";
  const response = UrlFetchApp.fetch(refreshTokenUrl, params);
  const data = JSON.parse(String(response));

  user.fitbit.refreshToken.setValue(data.refresh_token);
  user.fitbit.accessToken.setValue(data.access_token);
}

function getDataForDateRange(
  type: fitbitDataTypes,
  user: User,
  start_date: Date,
  end_date: Date
): any {
  // refresh tokens
  refreshFitbitTokens(user);

  // Make a GET request with auth
  const authToken = user.fitbit.accessToken;
  var headers = {
    Authorization: "Bearer " + authToken,
  };
  var params = {
    method: "get",
    headers: headers,
  } as GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

  const urlBase = FitbitUtils.DateRangeUrl[type];
  const date = new DateUtils();

  const url = `${urlBase}/${date.dateToString(start_date)}/${date.dateToString(
    end_date
  )}.json`;
  const response = UrlFetchApp.fetch(url, params);
  const data = JSON.parse(String(response));
  return data;
}

// Get the last N days of data for particular type of data
function lastNDaysData(type: fitbitDataTypes, n: number, user: User): any {
  const millis_in_day = 1000 * 60 * 60 * 24;
  const yesterday = new Date();
  yesterday.setTime(yesterday.getTime() - millis_in_day);
  const start_date = new Date();
  start_date.setTime(yesterday.getTime() - (n - 1) * millis_in_day);
  return getDataForDateRange(type, user, start_date, yesterday);
}

/* SLEEP */

function lastNDaysAverageSleep(user: User, n: number): SleepData {
  const sleep_data = lastNDaysData(fitbitDataTypes.sleep, n, user);
  const total_mins_asleep = sleep_data.sleep
    .map((r) => r.minutesAsleep)
    .reduce((a, b) => a + b);
  const days_with_data = new Set(sleep_data.sleep.map((r) => r.dateOfSleep))
    .size;
  const average_mins_of_sleep = total_mins_asleep / days_with_data;
  const hours = Math.floor(average_mins_of_sleep / 60);
  const minutes = Math.floor(average_mins_of_sleep - 60 * hours);
  return {
    average_mins_of_sleep: average_mins_of_sleep,
    time_asleep_string: `${hours} hrs ${minutes} mins`,
    days_with_data: days_with_data,
  };
}

function dailyFitbitSleepMessage(user: User): string {
  const icon = MessageUtils.icons.sleep;
  return [
    icon,
    `Yesterday: ${lastNDaysAverageSleep(user, 1).time_asleep_string}`,
    `Last 7 days: ${lastNDaysAverageSleep(user, 7).time_asleep_string}`,
    `Last 28 days: ${lastNDaysAverageSleep(user, 28).time_asleep_string}`,
    `Last 90 days: ${lastNDaysAverageSleep(user, 90).time_asleep_string}`,
  ].join(`\n`);
}

/* RESTING HEART RATE */

function lastNDaysAverageHeartrate(user: User, n: number): HeartData {
  const heart_data = lastNDaysData(fitbitDataTypes.heart, n, user);
  const total_hr = heart_data["activities-heart"]
    .map((r) => r.value.restingHeartRate)
    .filter((hr) => !!hr)
    .reduce((a, b) => a + b);
  const days_with_data = new Set(
    heart_data["activities-heart"].map((r) => r.dateTime)
  ).size;
  const average_hr = Math.round(total_hr / days_with_data);
  return {
    average_hr: average_hr,
  };
}

function dailyFitbitHeartrateMessage(user: User): string {
  const icon = MessageUtils.icons.heart;
  return [
    icon,
    `Yesterday: ${lastNDaysAverageHeartrate(user, 1).average_hr}`,
    `Last 7 days: ${lastNDaysAverageHeartrate(user, 7).average_hr}`,
    `Last 28 days: ${lastNDaysAverageHeartrate(user, 28).average_hr}`,
    `Last 90 days: ${lastNDaysAverageHeartrate(user, 90).average_hr}`,
  ].join(`\n`);
}

/* STEPS */

// a function to take a range of steps data and return some summary statistics
function summariseSteps(data: any[]): StepsSummaryData {
  return {
    steps: data.map((d) => parseInt(d.value)).reduce((a, b) => a + b),
    days: new Set(data.map((r) => r.dateTime)).size,
  };
}

function stepStatsYTD(user: User): StepsData {
  const date = new DateUtils();
  const millis_in_day = 1000 * 60 * 60 * 24;
  var yesterday = new Date(Date.now() - millis_in_day);
  const yesterday_ly = date.dayLastYear(yesterday);
  const new_years_day = new Date(yesterday.getFullYear(), 0, 1);
  const new_years_day_ly = date.dayLastYear(new_years_day);
  const new_years_eve_ly = new Date(new_years_day_ly.getFullYear(), 11, 31);
  const steps_data_ty = getDataForDateRange(
    fitbitDataTypes.steps,
    user,
    new_years_day,
    yesterday
  );
  const steps_data_ly_td = getDataForDateRange(
    fitbitDataTypes.steps,
    user,
    new_years_day_ly,
    yesterday_ly
  );
  const steps_data_ly_full = getDataForDateRange(
    fitbitDataTypes.steps,
    user,
    new_years_day_ly,
    new_years_eve_ly
  );
  const steps_summary_ty = summariseSteps(steps_data_ty["activities-steps"]);
  const steps_summary_ly_td = summariseSteps(
    steps_data_ly_td["activities-steps"]
  );
  const steps_summary_ly_full = summariseSteps(
    steps_data_ly_full["activities-steps"]
  );
  return {
    ty: steps_summary_ty,
    lytd: steps_summary_ly_td,
    lyf: steps_summary_ly_full,
  };
}

// Format the steps number to more readable
function formatSteps(steps: number, dp = 0): string {
  const options = {
    0: `${Math.floor(steps / 1000)}k`,
    1: `${Math.floor(steps / 100) / 10}k`,
  };
  return options[dp];
}

function dailyFitbitStepsMessage(user: User): string {
  const icon = MessageUtils.icons.steps;
  const d = stepStatsYTD(user);
  const projected_steps = (d.lyf.days * d.ty.steps) / d.ty.days;
  return [
    icon,
    `YTD Steps: ${formatSteps(d.ty.steps)}, ${formatSteps(
      d.ty.steps / d.ty.days,
      0
    )}/day`,
    `Last YTD Steps: ${formatSteps(d.lytd.steps)}, ${formatSteps(
      d.lytd.steps / d.lytd.days,
      0
    )}/day`,
    `Projected steps: ${formatSteps(projected_steps)} vs ${formatSteps(
      d.lyf.steps
    )} last year`,
  ].join(`\n`);
}
