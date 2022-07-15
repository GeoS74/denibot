const XLSX = require('xlsx');
const path = require('path');

const Nomenclature = require('../models/Nomenclature');
const Owner = require('../models/Owner');

module.exports.upload = async (ctx) => {
  try {
    const start = Date.now();
    const arr = _readExcel('../files/nomenclature.xls');
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

function _readExcel(filePath) {
  const fpath = path.join(__dirname, filePath);
  const workbook = XLSX.readFile(fpath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

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
