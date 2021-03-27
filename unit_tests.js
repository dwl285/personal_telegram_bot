// test
// test 2
function gastTestRunner() {
  console.log("start testing");
  if ((typeof GasTap) === 'undefined') { // GasT Initialization. (only if not initialized yet.)
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
  } // Class GasTap is ready for use now!

  var test = new GasTap({
    printer: function (msg) { consle.log(msg); }
  })

  test('getQuestionType', (t) => {
    const type = getQuestionType("Did you drink yesterday?");
    t.equal(type, "DRINKING", "getQuestionType is correct for drink");
  })

  // utils
  test('daysYTD', (t) => {
    t.ok(Number.isInteger(daysYTD(2021)), "days YTD is a valid integer");
  })

  test('icons', (t) => {
    t.ok(icons().chess, "chess icon exists");
  })

  // chess
  const dwl285 = new ChessComSettings("dwl285", "rapid", 10, 200);
  const dan = new User("dan", dwl285);
  test('getChessCOMData', (t) => {
    const chessData = getChessCOMData(dan);
    t.ok(chessData.chess_rapid, "chess_rapid exists");
    t.ok(chessData.chess_rapid.record, "chess_rapid.record exists");
    t.ok(chessData.chess_rapid.record.win + chessData.chess_rapid.record.loss + chessData.chess_rapid.record.draw > 0, "chess_rapid.record has values");
  })

  test('getChessStats', (t) => {
    const chessStats = getChessStats(dan, 2021);
    t.ok(chessStats.gamesYTD, "gamesYTD exists");
    t.ok(chessStats.gamesEOY, "gamesEOY exists");
    t.ok(chessStats.gamesGoal, "gamesGoal exists");
  })

  test('getDailyChessMessage', (t) => {
    t.ok(getDailyChessMessage(dan, 2021).length > 10, "Chess message is roughly the right length");
  })

  // streaks
  test('getStreaks', (t) => {
    const streak_data = getStreaks("CHESS");
    t.ok(streak_data.streakType, "streakType exists");
    t.ok(streak_data.streakLength, "streakLength exists");
  })

  test('createStreakMessage', (t) => {
    const msg = createStreakMessage({ "streakType": "0", "streakLength": "10" }, "CHESS");
    t.equal(msg, "CHESS: Oh no, it's been 10 days, get back on it!", "bad streak message is correct chess");
  })


  test.finish()
  // temporary workaround whilst I figure out how to get the function to log to the CLI
  if (test.totalFailed() > 0) {
    throw "Some test(s) failed!"
  }
  if (test.totalFailed() === 0) {
    return ("All tests passed!")
  }
  console.log("end testing");
}