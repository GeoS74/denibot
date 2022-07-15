const Koa = require('koa');

const ownerRoutes = require('./routes/owner.routes');
const botRoutes = require('./routes/bot.routes');
const apiRoutes = require('./routes/api.routes');
const fileRoutes = require('./routes/files.routes');

const app = new Koa();

app.use(ownerRoutes);
app.use(botRoutes);
app.use(apiRoutes);
app.use(fileRoutes);

module.exports = app;
