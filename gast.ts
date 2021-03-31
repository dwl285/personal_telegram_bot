function initiateGast() {
  // @ts-ignore: GasTap library isn't in my codebase
  if (typeof GasTap === "undefined") {
    // GasT Initialization. (only if not initialized yet.)
    eval(
      UrlFetchApp.fetch(
        "https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js"
      ).getContentText()
    );
  } // Class GasTap is ready for use now!

  // @ts-ignore: GasTap library isn't in my codebase so this goes wrong
  var test = new GasTap({
    printer: function (msg) {
      console.log(msg);
    },
  });

  return test;
}

function testWrapper(fn: Function): { succeeded: number; failed: number } {
  var test = initiateGast();
  test = fn(test);
  return {
    succeeded: test.totalSucceed(),
    failed: test.totalFailed(),
  };
}

function runTests(any[]): void {
  const testResults = [
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
  ]
    .map((fn) => fn())
    .reduce((out, i) => {
      out["succeeded"] += i.succeeded;
      out["failed"] += i.failed;
      return out;
    });

  if (testResults.failed > 0) {
    throw `${testResults.failed} tests failed`;
  } else {
    console.log("All tests passed");
  }
}
