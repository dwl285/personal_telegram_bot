if ((typeof GasTap) === 'undefined') { // GasT Initialization. (only if not initialized yet.)
  eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
} // Class GasTap is ready for use now!

var test = new GasTap();

function gastTestRunner() {

  test('getQuestionType', (t) => {
    const type = getQuestionType("Did you drink yesterday?");
    t.equal(type, "DRINKING", "getQuestionType is correct for drink");
  })

  test('getStreaks', (t) => {
    const streak_data = getStreaks("CHESS");
    t.ok(streak_data.streakType, "streakType exists");
    t.ok(streak_data.streakLength, "streakLength exists");
  })

  test('createStreakMessage', (t) => {
    const msg = createStreakMessage({"streakType": "0", "streakLength": "10"}, "CHESS");
    t.equal(msg, "CHESS: Oh no, it's been 10 days, get back on it!", "bad streak message is correct chess");
  })


  test.finish()
}