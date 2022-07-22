const { expect } = require('chai');
const fetch = require('node-fetch');

require('dotenv').config({ path: './secret.env' });

if (process.env.NODE_ENV !== 'develop') {
  console.log('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

const config = require('../config');
const app = require('../app');
const connection = require('../libs/connection');
const Owner = require('../models/Owner');

describe('/test/Owner.test.js', () => {
  let _server;
  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await Owner.deleteMany();
    connection.close();
    _server.close();
  });

  describe('owner CRUD', () => {
    it('create owner', async () => {
      const owner = {
        name: 'GeoS',
      };
      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({}),
      };

      let response = await fetch(`http://localhost:${config.server.port}/owner`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      expect(response.data, 'сервер возвращает описание ошибки')
        .that.is.an('object')
        .to.have.property('error');

      optional.body = JSON.stringify(owner);
      response = await fetch(`http://localhost:${config.server.port}/owner`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 201').to.be.equal(201);
      expectFieldState.call(this, response.data);
    });

    it('read owner', async () => {
      const optional = {
        headers: {},
        method: 'GET',
      };

      let response = await fetch(`http://localhost:${config.server.port}/owner`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').equal(200);
      expect(response.data, 'сервер возвращает массив')
        .that.is.an('array');
      expectFieldState.call(this, response.data[0]);

      const ownerId = await Owner.findOne().then((res) => res.id);
      response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').equal(200);
      expectFieldState.call(this, response.data);
    });

    it('update owner', async () => {
      const owner = {
        name: 'Tom',
      };
      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(owner),
      };
      const ownerId = await Owner.findOne().then((res) => res.id);

      let response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectFieldState.call(this, response.data);

      optional.body = JSON.stringify({ name: 'Sam' });
      response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.data, 'сервер возвращает обновленные данные')
        .to.have.property('name').equal('Sam');

      response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}000`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      expect(response.data, 'сервер возвращает описание ошибки 404')
        .to.have.property('error');
    });

    it('delete owner', async () => {
      const optional = {
        headers: {},
        method: 'DELETE',
      };
      const ownerId = await Owner.findOne().then((res) => res.id);

      const response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectFieldState.call(this, response.data);
    });
  });
});

function expectFieldState(data) {
  expect(data, 'сервер возвращает объект с полями id, name, botName, uri, isMain, enabled')
    .that.be.an('object')
    .to.have.keys(['id', 'name', 'botName', 'uri', 'isMain', 'enabled']);
  expect(data.isMain, 'свойство isMain должно быть булевым')
    .that.is.an('boolean');
  expect(data.isMain, 'свойство enabled должно быть булевым')
    .that.is.an('boolean');
}
