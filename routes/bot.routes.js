const Router = require('koa-router');

const botController = require('../controllers/bots.controller');

const router = new Router({ prefix: '/bot' });

router.get('/init', botController.create);
router.get('/start/:pid', botController.start);
router.get('/start', botController.startAll);
router.get('/state/:pid', botController.state);
router.get('/state', botController.stateAll);
router.get('/stop/:pid', botController.stop);
router.get('/stop', botController.stopAll);
router.get('/kill/:pid', botController.kill);
router.get('/kill', botController.killAll);

module.exports = router.routes();
