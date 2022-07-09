const Koa = require('koa');
const Router = require('koa-router');

const ownerRoutes = require('./routes/owner.routes');
const botRoutes = require('./routes/bot.routes');
const apiRoutes = require('./routes/api.routes');
const fileController = require('./controllers/files.controller');

const app = new Koa();
app.use(ownerRoutes);
app.use(botRoutes);
app.use(apiRoutes);

const router = new Router();

router.get('/upload', fileController.upload);

app.use(router.routes());

module.exports = app;
