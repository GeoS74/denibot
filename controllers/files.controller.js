const XLSX = require('xlsx');
const fs = require('fs');

const Nomenclature = require('../models/Nomenclature');
const Owner = require('../models/Owner');
const logger = require('../libs/logger')('default');

module.exports.upload = async (ctx) => {
  try {
    const start = Date.now();
    const positions = _readExceltoArray(ctx.request.files.file.filepath);
    const ownerId = await _getMainOwnerId();
    await _delNomenclatures();
    const countRows = await _readPositions(positions, ownerId);
    _delFile(ctx.request.files.file.filepath);

    ctx.status = 200;
    ctx.body = {
      message: `loaded ${countRows} rows out of ${positions.length}`,
      time: `${(Date.now() - start) / 1000} sec`,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      ctx.status = 404;
      ctx.body = {
        error: 'file not found',
      };
      return;
    }
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

async function _readPositions(positions, ownerId) {
  let countRows = 0;
  for (const position of positions) {
    const row = Object.values(position);
    const article = row[1].toString().trim();

    if (article) {
      row[1] = article;
      await _addPosition(ownerId, row);
      countRows += 1;
    }
  }
  return countRows;
}

function _readExceltoArray(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

function _delNomenclatures() {
  return Nomenclature.deleteMany();
}

function _getMainOwnerId() {
  return Owner.findOne({ isMain: true })
    .then((res) => res.id)
    .catch(() => { throw new Error('main owner is empty'); });
}

function _addPosition(ownerId, position) {
  return Nomenclature.create({
    owner: ownerId,
    code: position[0],
    article: position[1],
    title: position[2],
  });
}

function _delFile(filepath) {
  fs.unlink(filepath, (err) => {
    if (err) logger.error(err);
  });
}
