const Router = require('koa-router');

const botController = require('../controllers/bots.controller');

const router = new Router({ prefix: '/bot' });

router.get('/init', botController.createBots);
router.get('/start/:pid', botController.start);
router.get('/start', botController.startAll);
router.get('/state/:pid', botController.state);
router.get('/state', botController.stateAll);
router.get('/stop/:pid', botController.stop);
router.get('/stop', botController.stopAll);

module.exports = router.routes();
