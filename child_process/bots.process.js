const Bot = require(`../class/${process.env.botName}`);

(() => new Bot(process.env, process.pid))();
