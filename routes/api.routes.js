const Router = require('koa-router');

const router = new Router({ prefix: '/api' });

router.get('/', (ctx) => {
  ctx.status = 501;
  ctx.body = {
    message: 'Not implemented',
  };
});

module.exports = router.routes();
