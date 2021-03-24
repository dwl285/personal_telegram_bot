const daysYTD = (year) => {
  return Math.floor((Date.now() - Date.UTC(year, 0, 1)) / (1000 * 60 * 60 * 24));
}

const icons = () => {
  return {
    chess: `♟️`
  }
}