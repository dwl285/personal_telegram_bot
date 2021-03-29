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
