const Router = require('koa-router');
const koaBody = require('koa-body');

const fileController = require('../controllers/files.controller');
const filesValidator = require('../middleware/validators/files.params.validator');

const optional = {
  formidable: {
    uploadDir: './files',
    allowEmptyFiles: false,
    minFileSize: 1,
    multiples: true,
    hashAlgorithm: 'md5',
    keepExtensions: true,
  },
  multipart: true,
};

const router = new Router();

router.post('/upload', koaBody(optional), filesValidator.upload, fileController.upload);

module.exports = router.routes();
