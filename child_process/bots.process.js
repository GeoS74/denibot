// const Bot = require('../class/Bot');
const Pricepzap = require('../class/Pricepzap');

// new Bot(process.env, process.pid);
new Pricepzap(process.env, process.pid).run();
