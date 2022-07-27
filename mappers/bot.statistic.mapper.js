module.exports = (data) => ({
  countBots: data.countBots,
  countEnabledBots: data.countEnabledBots,
  countActiveBots: data.countActiveBots,
  countMainNomemclature: data.countMainNomemclature,
  bots: data.bots.map((bot) => ({
    botName: bot.botName,
    matchedPosition: bot.matchedPosition,
  })),
});
