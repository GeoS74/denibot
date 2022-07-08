const Owner = require('../models/Owner');

module.exports.add = async (ctx) => {
  try {
    const owner = await _addOwner(ctx.request.body);
    ctx.status = 201;
    ctx.body = {
      id: owner.id,
      name: owner.name,
    };
  } catch (error) {
    ctx.status = 500;
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
      return ctx.body = {
        error: 'owner not found',
      };
    }

    ctx.status = 200;
    ctx.body = {
      id: owner.id,
      name: owner.name,
    };
  } catch (error) {
    ctx.status = 500;
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
      return ctx.body = {
        error: 'owner not found',
      };
    }

    ctx.status = 200;
    ctx.body = {
      id: owner.id,
      name: owner.name,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.getAll = async (ctx) => {
  try {
    const owners = await _getOwners(ctx.request.body);
    ctx.status = 200;
    ctx.body = owners.map((owner) => ({
      id: owner.id,
      name: owner.name,
    }));
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

async function _addOwner(owner) {
  return Owner.create({
    name: owner.name,
  });
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
