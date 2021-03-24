const getChessUserGoals = (username, gameType) => {
  return {
    "dwl285": {
      "rapid": {
        gamesAtStartOfYear: 15,
        gamesGoal: 200
      }
    }
  }[username][gameType];
}

const getChessCOMData = (username) => {
  const url = `https://api.chess.com/pub/player/${username}/stats`;
  const apiResponse = UrlFetchApp.fetch(url);
  return JSON.parse(apiResponse);
}

const getChessStats = (username, gameType, year) => {
  const goalsData = getChessUserGoals(username, gameType);
  const chessComData = getChessCOMData(username);
  const stats = chessComData[`chess_${gameType}`];
  const games = stats.record.win + stats.record.draw + stats.record.loss;
  const gamesYTD = games - goalsData.gamesAtStartOfYear;
  const gamesEOY = Math.round(gamesYTD * (365 / daysYTD(year)));

  return {
    gamesYTD: gamesYTD,
    gamesEOY: gamesEOY,
    gamesGoal: goalsData.gamesGoal
  }
}

const getDailyChessMessage = (username, gameType, year) => {
  const chessStats = getChessStats(username, gameType, year);

  return (
    [icons().chess,
    `${chessStats.gamesYTD} games played`,
    `Expected games: ${chessStats.gamesEOY} vs. ${chessStats.gamesGoal} target`]
      .join(`\n`)
  );
}
