const childProcess = require('child_process');

const config = require('../bot/config')

const botList = []

module.exports.start = ctx => {

}

module.exports.startAll = ctx => {
  try {
    for (const bot of config.bots) {
      _startBot(bot)
    }

    ctx.status = 200;
    ctx.body = {
      message: 'all bots is started'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
}

module.exports.status = async ctx => {
  try {
    const status = await _getState()

    ctx.status = 200;
    ctx.body = {
      status: status
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
}

module.exports.stop = ctx => {

}

module.exports.stopAll = ctx => {

}

function _getState() {
  const arr = []
  for (const bot of botList) {
    arr.push(bot.getState())
  }

  return Promise.all(arr)
}

function _startBot(data) {
  const bot = childProcess.fork('./bot/bot', [],  Object.assign(process.env, data))

  bot.getState = _ => {
    return new Promise(res => {
      bot.once('message', message => res(message))
      bot.send('state')
    })
  }

  botList.push(bot)
}