const Router = require('koa-router');

const fileController = require('../controllers/files.controller');

const router = new Router();

router.get('/upload', fileController.upload);

module.exports = router.routes();
