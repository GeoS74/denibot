const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');

const fileController = require('./controllers/files.controller');
const ownerController = require('./controllers/owner.controller');

const app = new Koa();

// system router
const router = new Router();

router.get('/upload', fileController.upload);

router.get('/owner', ownerController.getAll);
router.get('/owner/:id', ownerController.get);
router.post('/owner', koaBody(), ownerController.add);
router.delete('/owner/:id', ownerController.delete);

app.use(router.routes());

// API router
const routerAPI = new Router({ prefix: '/api' });

routerAPI.get('/', (ctx) => {
  ctx.body = 'routerAPI listen';
});

app.use(routerAPI.routes());

module.exports = app;
