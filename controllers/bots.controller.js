const childProcess = require('child_process');

const config = require('../bot/config')

const botList = []

module.exports.start = ctx => {
  
}

module.exports.startAll = ctx => {
  try {
    for(const bot of config.bots) {
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
    const status = await _getStatus()

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

function _getStatus(){
  const arr = []
  for(const bot of botList) {
    arr.push(bot.getState())
  }
  return Promise.all(arr)
}

function _startBot(bot) {
  const child = childProcess.fork('./bot/bot', [], {env: bot})
  let customRes;

  child.on('message', message => {
    console.log(`foo: ${message}`)
    customRes(`bar: ${message}`)
  })

  child.getState = _ => {
    return new Promise(res => {
      child.send('status')
      customRes = res
    })
  }

  botList.push(child)
}