// const Bot = require('../class/Bot');
// const Pricepzap = require('../class/Pricepzap');
const Bot = require(`../class/${process.env.botName}`);

new Bot(process.env, process.pid).run();
