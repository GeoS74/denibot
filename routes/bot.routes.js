const Router = require('koa-router');
const childProcess = require('child_process');

const router = new Router({ prefix: '/bot' });

const botList = [];

function _addBot(name) {
  const bot = childProcess.fork('./bot/bot.js', [name]);

  bot.on('message', (message) => {
    console.log(`${name} bot send: ${message}`);
  });

  bot.on('close', (code) => {
    console.log(`${name} bot stopped code:${code}`);
  });
  botList.push(bot);
}

router.get('/status', (ctx) => {
  for (const bot of botList) {
    bot.send('status');
  }
  ctx.status = 200;
});

router.get('/stop', (ctx) => {
  for (const bot of botList) {
    bot.send('stop');
  }
  ctx.status = 200;
});

router.get('/start', (ctx) => {
  _addBot('first');
  _addBot('second');
  // botList.push(child_process.fork('./bot/bot.js', ['first']))
  // botList.push(child_process.fork('./bot/bot.js', ['second']))

  // bot.send('how are you');

  // bot.on('message', message => {
  //   console.log(`bot send: ${message}`)
  // })

  // bot.on('close', code => {
  //   console.log(`bot stopped code:${code}`)
  // })

  ctx.status = 200;
  ctx.body = {
    message: 'botoferm',
  };
});

module.exports = router.routes();
