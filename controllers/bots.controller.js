const childProcess = require('child_process');

const Owner = require('../models/Owner');
const ownerMapper = require('../mappers/owner.mapper');

const botList = [];

module.exports.start = async (ctx) => {
  ctx.status = 200;
  ctx.body = ctx.headers
  // ctx.status = 501;
};

const fetch = require('node-fetch');
module.exports.startAll = async (ctx) => {
  try {
    const owners = await _getOwners();
    for (const owner of owners) {
      _startBot(ownerMapper(owner));
    }

    ctx.status = 200;
    ctx.body = {
      message: 'all bots is started',
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.stateAll = async (ctx) => {
  try {
    const state = await _getState();

    console.log(state);
    ctx.status = 200;
    ctx.body = { stateBot: state };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.state = async (ctx) => {
  try {
    let state;
    for (const bot of botList) {
      if (ctx.params.pid === bot.pid) {
        state = await bot.getState();
        break;
      }
    }

    if (!state) {
      ctx.status = 400;
      return ctx.body = {
        error: 'bot not found',
      };
    }

    console.log(state);
    ctx.status = 200;
    ctx.body = { stateBot: state };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.stop = (ctx) => {
  ctx.status = 501;
};

module.exports.stopAll = (ctx) => {
  ctx.status = 501;
};

function _getState() {
  const arr = [];
  for (const bot of botList) {
    arr.push(bot.getState());
  }

  return Promise.all(arr);
}

function _startBot(data) {
  const bot = childProcess.fork('./child_process/bots.process', [], Object.assign(process.env, data));

  bot.getState = () => new Promise((res) => {
    bot.once('message', (message) => res(JSON.parse(message)));
    bot.send('state');
  });

  botList.push(bot);
}

async function _getOwners() {
  return Owner.find({ isMain: false });
}
