const mongoose = require('mongoose');

module.exports.getOwner = async (ctx, next) => {
  try {
    if (!_objectIdValidate(ctx.params.id)) {
      ctx.throw(404, 'owner not found');
    }

    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.updateOwner = async (ctx, next) => {
  try {
    if (!_objectIdValidate(ctx.params.id)) {
      ctx.throw(404, 'owner not found');
    }

    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.delOwner = async (ctx, next) => {
  try {
    if (!_objectIdValidate(ctx.params.id)) {
      ctx.throw(404, 'owner not found');
    }

    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

function _objectIdValidate(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  return true;
}
