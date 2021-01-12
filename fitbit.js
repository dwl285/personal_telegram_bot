// Sleep score, steps, types of exercise, heart rate

const getSleepRange = () => {
  // Make a GET request with auth
  var headers = {
    "Authorization" : "Bearer " + fitbitToken
  };
  var params = {
    "method":"GET",
    "headers":headers
  };
  
  const sleepUrl = "https://api.fitbit.com/1.2/user/-/sleep/date/2021-01-01/2021-01-11.json";
  const response = UrlFetchApp.fetch(sleepUrl, params);
  const data = JSON.parse(response);
  console.log(data);
}