function getChessCOMData(user: User): any {
  const url = `https://api.chess.com/pub/player/${user.chess.username}/stats`;
  const apiResponse = UrlFetchApp.fetch(url);
  return JSON.parse(String(apiResponse));
}

const getChessStats = (user: User, year: number) => {
  const chessComData = getChessCOMData(user);
  const stats = chessComData[`chess_${user.chess.gameType}`];
  const games = stats.record.win + stats.record.draw + stats.record.loss;
  const gamesYTD = games - user.chess.gamesAtStartOfYear;
  const daysYTD = new DateUtils().daysYTD(year);
  const gamesEOY = Math.round(gamesYTD * (365 / daysYTD));

  return {
    gamesYTD: gamesYTD,
    gamesEOY: gamesEOY,
    gamesGoal: user.chess.gamesGoal
  }
}

const getDailyChessMessage = (user: User) => {
  const year = new DateUtils().currentYear;
  const messageUtils = new MessageUtils;
  const chessStats = getChessStats(user, year);

  return (
    [messageUtils.icons.chess,
    `${chessStats.gamesYTD} games played`,
    `Expected games: ${chessStats.gamesEOY} vs. ${chessStats.gamesGoal} target`]
      .join(`\n`)
  );
}
