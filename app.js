const Koa = require('koa');
const Router = require('koa-router');

const fileController = require('./controllers/files.controller');

const app = new Koa();
const routerAPI = new Router({ prefix: '/api' });

routerAPI.get('/', (ctx) => {
  ctx.body = 'router listen';
});

routerAPI.get('/upload', fileController.upload);

app.use(routerAPI.routes());
module.exports = app;
