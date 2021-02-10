const dailyChessMessage = () => {
  const api_response = UrlFetchApp.fetch("https://api.chess.com/pub/player/dwl285/stats");
  const contents = JSON.parse(api_response);
  const rapid_stats = contents.chess_rapid;
  const rapid_games = rapid_stats.record.win + rapid_stats.record.draw + rapid_stats.record.loss;

  const rapid_games_at_start_of_year = 15;
  const rapid_games_goal = 200;

  const rapid_games_YTD = rapid_games - rapid_games_at_start_of_year;
  // 1610293629808
  // 1612137600000
  const days_YTD = Math.floor((Date.now() - Date.UTC(2021, 0, 1)) / (1000 * 60 * 60 * 24));
  const rapid_games_EOY = Math.round(rapid_games_YTD * (365 / days_YTD));

  return(
    [`♟️`,
      `${rapid_games_YTD} games played`,
      `Expected games: ${rapid_games_EOY} vs. ${rapid_games_goal} target`]
      .join(`\n`)
  );
}
