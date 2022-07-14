const Owner = require('../models/Owner');
const mapper = require('../mappers/owner.mapper');

module.exports.add = async (ctx) => {
  try {
    const owner = await _addOwner(ctx.request.body);
    ctx.status = 201;
    ctx.body = mapper(owner);
  } catch (error) {
    ctx.status = error?.errors ? 400 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.update = async (ctx) => {
  try {
    const owner = await _updateOwner(ctx.params.id, ctx.request.body);

    ctx.status = 200;
    ctx.body = mapper(owner);
  } catch (error) {
    ctx.status = error?.errors ? 400 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.delete = async (ctx) => {
  try {
    const owner = await _delOwner(ctx.params.id);
    if (!owner) {
      ctx.status = 404;
      ctx.body = {
        error: 'owner not found',
      };
    }

    ctx.status = 200;
    ctx.body = mapper(owner);
  } catch (error) {
    ctx.status = error?.errors ? 400 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.get = async (ctx) => {
  try {
    const owner = await _getOwner(ctx.params.id);
    if (!owner) {
      ctx.status = 404;
      ctx.body = {
        error: 'owner not found',
      };
    }

    ctx.status = 200;
    ctx.body = mapper(owner);
  } catch (error) {
    ctx.status = error?.errors ? 400 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.getAll = async (ctx) => {
  try {
    const owners = await _getOwners(ctx.request.body);
    ctx.status = 200;
    ctx.body = owners.map((owner) => mapper(owner));
  } catch (error) {
    ctx.status = error?.errors ? 400 : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

async function _addOwner(owner) {
  return Owner.create(owner);
}

async function _updateOwner(id, owner) {
  return Owner.findByIdAndUpdate(id, owner, { new: true });
}

async function _delOwner(id) {
  return Owner.findByIdAndDelete(id);
}

async function _getOwners() {
  return Owner.find();
}

async function _getOwner(id) {
  return Owner.findById(id);
}
