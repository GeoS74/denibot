const fs = require('fs');

module.exports.upload = async (ctx, next) => {
  try {
    if (!ctx.request.files) {
      ctx.throw(400, 'file not uploaded');
    }

    if (Object.keys(ctx.request.files).length > 1) {
      _deleteFile(ctx.request.files);
      ctx.throw(400, 'more than one file received');
    }

    if (Object.keys(ctx.request.files).indexOf('file') === -1) {
      _deleteFile(ctx.request.files);
      ctx.throw(400, 'field name "file" is empty');
    }

    if (ctx.request.files.file.size < 27000) {
      _deleteFile(ctx.request.files);
      ctx.throw(400, 'file is empty');
    }

    switch (ctx.request.files.file.mimetype) {
      case 'application/vnd.ms-excel': break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': break;
      default:
        _deleteFile(ctx.request.files);
        ctx.throw(400, 'file must be in excel format');
    }

    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

function _deleteFile(files) {
  for (const file of Object.values(files)) {
    fs.unlink(file.filepath, (err) => {
      if (err) console.log(err);
    });
  }
}
