const XLSX = require('xlsx');
const path = require('path');

const Nomenclature = require('../models/Nomenclature');

module.exports.upload = async (ctx) => {
  const fpath = path.join(__dirname, '../files/nomenclature.xls');
  const workbook = XLSX.readFile(fpath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const arr = XLSX.utils.sheet_to_json(worksheet);

  await Nomenclature.create({
    title: 'foo',
    owner: 'geos',
  });

  console.log(arr[10]);

  ctx.body = `uploaded ${arr.length} rows`;
};
