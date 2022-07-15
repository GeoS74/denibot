const childProcess = require('child_process');

const Owner = require('../models/Owner');
const botMapper = require('../mappers/bot.mapper');
const ownerMapper = require('../mappers/owner.mapper');

const botList = [];

module.exports.create = async (ctx) => {
  try {
    await _createBots();
    const state = await _getStateAll();

    ctx.status = 201;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.start = async (ctx) => {
  try {
    const pid = +ctx.params.pid;
    _start(pid);
    const state = await _getState(pid);

    if (!state) {
      ctx.status = 404;
      ctx.body = {
        error: 'bot not found',
      };
      return;
    }

    ctx.status = 200;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.startAll = async (ctx) => {
  try {
    _startAll();
    const state = await _getStateAll();

    ctx.status = 200;
    ctx.body = botMapper(state);
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

    ctx.status = 200;
    ctx.body = botMapper(state);
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

    ctx.status = 200;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.stop = async (ctx) => {
  try {
    const pid = +ctx.params.pid;
    _stop(pid);
    const state = await _getState(pid);

    if (!state) {
      ctx.status = 404;
      ctx.body = {
        error: 'bot not found',
      };
      return;
    }

    ctx.status = 200;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.stopAll = async (ctx) => {
  try {
    _stopAll();
    const state = await _getStateAll();

    ctx.status = 200;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.kill = async (ctx) => {
  try {
    const pid = +ctx.params.pid;
    _kill(pid);

    ctx.status = 200;
    ctx.body = botMapper({
      pid,
      state: 'killed',
    });
  } catch (error) {
    ctx.status = error.message === 'bot not found' ? 404 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.killAll = async (ctx) => {
  try {
    _killAll();
    const state = await _getStateAll();

    ctx.status = 200;
    ctx.body = botMapper(state);
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

async function _createBots() {
  const owners = await _getOwners();
  for (const owner of owners) {
    if (owner.botName !== 'Pricepzap') {
      _createBot(ownerMapper(owner));
    }
  }
}

function _start(pid) {
  for (const bot of botList) {
    if (pid === bot.pid) {
      bot.send('run');
      break;
    }
  }
}

function _startAll() {
  if (!botList.length) {
    throw new Error('bots not created');
  }

  for (const bot of botList) {
    bot.send('run');
  }
}

function _stop(pid) {
  for (const bot of botList) {
    if (pid === bot.pid) {
      bot.send('stop');
      break;
    }
  }
}

function _stopAll() {
  if (!botList.length) {
    throw new Error('bots not created');
  }

  for (const bot of botList) {
    bot.send('stop');
  }
}

function _kill(pid) {
  for (const bot of botList) {
    if (pid === bot.pid) {
      bot.send('kill');
      botList.splice(botList.indexOf(bot), 1);
      return;
    }
  }
  throw new Error('bot not found');
}

function _killAll() {
  if (!botList.length) {
    throw new Error('bots not created');
  }

  for (const bot of botList) {
    bot.send('kill');
  }

  botList.length = 0;
}

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
