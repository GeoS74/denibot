const { expect } = require('chai');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const FormData = require('form-data');

const config = require('../config');
const app = require('../app');

describe('/test/Files.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
    await _createTestFileXLSX('test1');
    await _createTestFileXLS('test2', ['code', 'article', 'title']);
    _createTestFileTXT('test3');
  });

  after(async () => {
    _server.close();
    _delFile('../files/test1.xlsx');
    _delFile('../files/test2.xls');
    _delFile('../files/test3.txt');
  });

  describe('validate params Excel files', () => {
    const optional = {
      headers: {
        // 'Content-Type': 'multipart/form-data; boundary=',
      },
      method: 'POST',
      body: JSON.stringify({}),
    };

    it('file uploaded', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/upload`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      _expectErrorData(response);
    });

    it('field name "file" is not empty', async () => {
      const fd = new FormData();
      fd.append('file1', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/upload`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      _expectErrorData(response);
    });

    it('only one file is uploaded', async () => {
      const fd = new FormData();
      fd.append('file1', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('file2', fs.createReadStream(path.join(__dirname, '../files/test2.xls')));
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/upload`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      _expectErrorData(response);
    });

    it('file is not empty', async () => {
      const fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/upload`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      _expectErrorData(response);
    });

    it('file must be in excel format', async () => {
      const fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test3.txt')));
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/upload`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      _expectErrorData(response);
    });
  });
});

function _expectErrorData(response) {
  expect(response.status, 'сервер возвращает статус 400').equal(400);
  expect(response.data, 'сервер возвращает объект с описанием ошибки')
    .that.is.an('object')
    .to.have.property('error');
}

async function _createTestFileXLSX(fname, arr) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([arr]);
  XLSX.utils.book_append_sheet(wb, ws, fname);
  await XLSX.writeFile(wb, path.join(__dirname, `../files/${fname}.xlsx`), {
    bookType: 'xlsx',
  });
}

async function _createTestFileXLS(fname, arr) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([arr]);
  XLSX.utils.book_append_sheet(wb, ws, fname);
  await XLSX.writeFile(wb, path.join(__dirname, `../files/${fname}.xls`), {
    bookType: 'xls',
  });
}

function _createTestFileTXT(fname) {
  const writer = fs.createWriteStream(path.join(__dirname, `../files/${fname}.txt`), { flags: 'a' });
  writer.write(new Array(10000).fill('text').toString());
}

function _delFile(fpath) {
  fs.unlink(path.join(__dirname, fpath), (err) => {
    if (err) console.log(err);
  });
}
