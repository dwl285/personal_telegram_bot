function gastTestRunner() {
  const testUser = Users.list()[0];

  var test = initiateGast();

  // chess
  test("getChessCOMData", (t) => {
    const chessData = getChessCOMData(testUser);
    t.ok(chessData.chess_rapid, "chess_rapid exists");
    t.ok(chessData.chess_rapid.record, "chess_rapid.record exists");
    t.ok(
      chessData.chess_rapid.record.win +
        chessData.chess_rapid.record.loss +
        chessData.chess_rapid.record.draw >
        0,
      "chess_rapid.record has values"
    );
  });

  test("getChessStats", (t) => {
    const chessStats = getChessStats(testUser, 2021);
    t.ok(chessStats.gamesYTD, "gamesYTD exists");
    t.ok(chessStats.gamesEOY, "gamesEOY exists");
    t.ok(chessStats.gamesGoal, "gamesGoal exists");
  });

  test("getDailyChessMessage", (t) => {
    t.ok(
      getDailyChessMessage(testUser).length > 10,
      "Chess message is roughly the right length"
    );
  });

  // classes
  test("getDailyChessMessage", (t) => {
    const token = new Token(TokenName.testToken);
    t.ok(token.getValue(), "tokens value exists");
    const randomString = Math.random().toString(36);
    token.setValue(randomString);
    t.ok(
      token.getValue() === randomString,
      "tokens value was correctly set by setValue"
    );
  });

  // fitbit
  test("getNewFitbitAccessToken", (t) => {
    t.ok(
      getNewFitbitAccessToken(testUser).refreshToken !=
        testUser.fitbit.refreshToken.getValue(),
      "Refresh token is new"
    );
    t.ok(
      getNewFitbitAccessToken(testUser).refreshToken.length > 30,
      "Refresh token is roughly the right length"
    );
    t.ok(
      getNewFitbitAccessToken(testUser).accessToken !=
        testUser.fitbit.accessToken.getValue(),
      "Access token is new"
    );
    t.ok(
      getNewFitbitAccessToken(testUser).accessToken.length > 100,
      "Access token is roughly the right length"
    );
  });

  test("updateFitbitTokens", (t) => {
    t.ok(
      updateFitbitTokens(testUser).length === 2,
      "Two successful token updates"
    );
  });

  test("getDataForDateRange", (t) => {
    t.ok(
      getDataForDateRange(
        fitbitDataTypes.heart,
        testUser,
        new Date(2021, 1, 1),
        new Date(2021, 1, 10)
      ),
      "Successfully got data"
    );
  });

  test("dailyFitbitHeartrateMessage", (t) => {
    t.ok(
      dailyFitbitHeartrateMessage(testUser).length > 10,
      "Successfully created heart rate message"
    );
  });

  test("dailyFitbitSleepMessage", (t) => {
    t.ok(
      dailyFitbitSleepMessage(testUser).length > 10,
      "Successfully created sleep message"
    );
  });

  test("dailyFitbitStepsMessage", (t) => {
    t.ok(
      dailyFitbitStepsMessage(testUser).length > 10,
      "Successfully created steps message"
    );
  });

  // questions

  test("getQuestionType", (t) => {
    const type = getQuestionType("Did you drink yesterday?");
    t.equal(type, "DRINKING", "getQuestionType is correct for drink");
  });

  test("getStreaks", (t) => {
    const streak_data = getStreaks(QuestionType.Chess);
    t.ok(streak_data.streakType, "streakType exists");
    t.ok(streak_data.streakLength, "streakLength exists");
  });

  test("createStreakMessage", (t) => {
    const msg = createStreakMessage(
      { streakType: "0", streakLength: "10" },
      QuestionType.Chess
    );
    t.equal(
      msg,
      "CHESS: Oh no, it's been 10 days, get back on it!",
      "bad streak message is correct chess"
    );
  });

  // utils
  test("daysYTD", (t) => {
    const daysYTD = new DateUtils().daysYTD(2021);
    t.ok(Number.isInteger(daysYTD), "days YTD is a valid integer");
  });

  test("icons", (t) => {
    t.ok(MessageUtils.icons.chess, "chess icon exists");
  });

  test.finish();
  // temporary workaround whilst I figure out how to get the function to log to the CLI
  if (test.totalFailed() > 0) {
    throw "Some test(s) failed!";
  }
  if (test.totalFailed() === 0) {
    return "All tests passed!";
  }
  console.log("end testing");
}
