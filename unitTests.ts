function runAllTests(): void {
  runTests([
    bqTests,
    chessTests,
    classTests,
    fitbitTests,
    propertiesTests,
    questionsTests,
    spreadsheetTests,
    summaryTests,
    telegramTests,
    utilsTests,
  ]);
}

function bqTests(): any {
  return testWrapper((test) => {
    const testUser = Users.list()[0];

    test("insertDataBQ", (t) => {
      const fake_data = [
        {
          date: Date(),
          user: "gas-test",
          question: "a question",
          response: "an answer",
        },
      ];
      t.ok(
        insertDataBQ(fake_data, BQTableName.questionWrite).length > 0,
        "Successfully inserted some fake data to BQ"
      );
    });

    test("getDataBQ", (t) => {
      t.ok(
        getDataBQ(BQTableName.summaryRead).fields.length > 0,
        "Successfully read data from BQ"
      );
    });
    return test;
  });
}

function chessTests(): any {
  return testWrapper((test) => {
    const testUser = Users.list()[0];

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
    return test;
  });
}

function classTests(): any {
  return testWrapper((test) => {
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
    return test;
  });
}

function fitbitTests(): any {
  return testWrapper((test) => {
    const testUser = Users.list()[0];

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
    return test;
  });
}

function propertiesTests(): any {
  return testWrapper((test) => {
    const testUser = Users.list()[0];
    const testDataType: ScriptDataType = ScriptDataType.Summary;
    const randomString = Math.random().toString(36);
    const testData = { testString: randomString };
    setScriptProperty(testDataType, testUser, testData);
    const scriptProperty = getScriptProperty(testDataType, testUser);
    deleteScriptProperty(testDataType, testUser);

    test("setScriptProperty", (t) => {
      t.deepEqual(
        scriptProperty.data.testString,
        testData.testString,
        "successfully set and got script property"
      );
    });
    return test;
  });
}

function questionsTests(): any {
  return testWrapper((test) => {
    test("getQuestionType", (t) => {
      const type = getQuestionType(QuestionString.Drinking);
      t.equal(
        type,
        QuestionType.Drinking,
        "getQuestionType is correct for drink"
      );
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
    return test;
  });
}

function spreadsheetTests(): any {
  return testWrapper((test) => {
    test("spreadsheetLog", (t) => {
      t.notThrow(
        () => spreadsheetLog("unit tester", "unit testing"),
        "spreadhseet logger is working"
      );
    });
    return test;
  });
}

function summaryTests(): any {
  return testWrapper((test) => {
    test("responseSummaryMessage", (t) => {
      t.ok(
        responseSummaryMessage().length > 20,
        "response summary message working as expected"
      );
    });
    return test;
  });
}

function telegramTests(): any {
  return testWrapper((test) => {
    // toDO: work out why this fails
    test("sendMessage", (t) => {
      t.notThrow(
        () =>
          sendMessage(
            Environments.currentEnvironment().bot.chatId,
            "this is the unit tester"
          ),
        "telegram send message didn't fail"
      );
    });

    // TODO: work out why this fails
    test("padSpaces", (t) => {
      t.ok(
        padSpaces("short string", 200).length === 200,
        "pad spaces creates a string of the correct length"
      );
    });
    return test;
  });
}

function utilsTests(): any {
  return testWrapper((test) => {
    test("daysYTD", (t) => {
      const daysYTD = new DateUtils().daysYTD(2021);
      t.ok(Number.isInteger(daysYTD), "days YTD is a valid integer");
    });

    test("icons", (t) => {
      t.ok(MessageUtils.icons.chess, "chess icon exists");
    });
    return test;
  });
}
