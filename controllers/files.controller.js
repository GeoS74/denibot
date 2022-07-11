const XLSX = require('xlsx');
const path = require('path');

const Nomenclature = require('../models/Nomenclature');
const Owner = require('../models/Owner');

module.exports.upload = async (ctx) => {
  try {
    const fpath = path.join(__dirname, '../files/nomenclature.xls');
    const workbook = XLSX.readFile(fpath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const arr = XLSX.utils.sheet_to_json(worksheet);

    const start = Date.now();
    const ownerId = await _getMainOwnerId();
    await _delNomenclatures();

    for (const position of arr) {
      await _addPosition(ownerId, Object.values(position));
    }

    ctx.status = 200;
    ctx.body = {
      message: `uploaded ${arr.length} rows`,
      time: `${(Date.now() - start) / 1000} sec`,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      ctx.status = 404;
      return ctx.body = {
        error: 'file not found',
      };
    }
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

function _delNomenclatures() {
  return Nomenclature.deleteMany();
}

function _getMainOwnerId() {
  return Owner.findOne({ isMain: true }).then((res) => res.id);
}

function _addPosition(ownerId, position) {
  return Nomenclature.create({
    owner: ownerId,
    code: position[0],
    article: position[1],
    title: position[2],
  });
}
