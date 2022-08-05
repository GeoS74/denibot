const Router = require('koa-router');
const koaBody = require('koa-body');

const ownerController = require('../controllers/owner.controller');
const ownerValidator = require('../middleware/validators/owners.params.validator');

const router = new Router({ prefix: '/owner' });

router.get('/', ownerController.getAll);
router.get('/:id', ownerValidator.getOwner, ownerController.get);
router.post('/', koaBody(), ownerController.add);
router.patch('/:id', koaBody(), ownerValidator.updateOwner, ownerController.update);
router.delete('/:id', ownerValidator.delOwner, ownerController.delete);

module.exports = router.routes();
