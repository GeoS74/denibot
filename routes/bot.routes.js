const Router = require('koa-router');

const botController = require('../controllers/bots.controller');

const router = new Router({ prefix: '/bot' });

router.get('/init', botController.create);
router.get('/match/:pid', botController.match);
router.get('/match', botController.matchAll);
router.get('/price/:pid', botController.price);
router.get('/price', botController.priceAll);
router.get('/param/:pid', botController.param);
router.get('/param', botController.paramAll);
router.get('/state/:pid', botController.state);
router.get('/state', botController.stateAll);
router.get('/stop/:pid', botController.stop);
router.get('/stop', botController.stopAll);
router.get('/kill/:pid', botController.kill);
router.get('/kill', botController.killAll);
router.get('/statistic', botController.statistic);

module.exports = router.routes();
