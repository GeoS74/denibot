const childProcess = require('child_process');

const Owner = require('../models/Owner');
const ownerMapper = require('../mappers/owner.mapper');

const botList = [];

module.exports.createBots = async (ctx) => {
  try {
    const owners = await _getOwners();
    for (const owner of owners) {
      if (owner.botName !== 'Pricepzap') {
        _createBot(ownerMapper(owner));
      }
    }

    const state = await _getStateAll();

    console.log(state);
    ctx.status = 200;
    ctx.body = {
      countBots: state.length,
      stateBot: state,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.start = async (ctx) => {
  ctx.status = 501;
};

module.exports.startAll = async (ctx) => {
  try {
    if (!botList.length) {
      throw new Error('bots not created');
    }

    for (const bot of botList) {
      bot.send('run');
    }

    const state = await _getStateAll();

    console.log(state);
    ctx.status = 200;
    ctx.body = {
      countBots: state.length,
      stateBot: state,
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
    const state = await _getStateAll();

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
    const state = await _getState(+ctx.params.pid);

    if (!state) {
      ctx.status = 404;
      ctx.body = {
        error: 'bot not found',
      };
      return;
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

function _getState(pid) {
  for (const bot of botList) {
    if (pid === bot.pid) {
      return bot.getState();
    }
  }
  return null;
}

function _getStateAll() {
  const arr = [];
  for (const bot of botList) {
    arr.push(bot.getState());
  }

  return Promise.all(arr);
}

function _createBot(data) {
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
