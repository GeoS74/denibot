const { expect } = require('chai');
const fetch = require('node-fetch');

const config = require('../config');
const app = require('../app');
const connection = require('../libs/connection');
const Owner = require('../models/Owner');

describe('/test/Owner.test.js', () => {
  let _server;
  before(async () => {
    _server = app.listen(3000);
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
      expect(response.data, 'сервер возвращает объект с полями id, name, uri, isMain')
        .that.is.an('object')
        .to.have.keys(['id', 'name', 'uri', 'isMain']);
      expect(response.data.isMain, 'свойство isMain должно быть булевым')
        .that.be.an('boolean');
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
      expect(response.data[0], 'сервер возвращает объект с полями id, name, uri, isMain')
        .to.have.keys(['id', 'name', 'uri', 'isMain']);

      const ownerId = await Owner.findOne().then((res) => res.id);
      response = await fetch(`http://localhost:${config.server.port}/owner/${ownerId}`, optional)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').equal(200);
      expect(response.data, 'сервер возвращает объект с полями id, name, uri, isMain')
        .that.is.an('object')
        .to.have.keys(['id', 'name', 'uri', 'isMain']);
      expect(response.data.isMain, 'свойство isMain должно быть булевым')
        .that.be.an('boolean');
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
      expect(response.data, 'сервер возвращает объект с полями id, name, uri, isMain')
        .that.is.an('object')
        .to.have.keys(['id', 'name', 'uri', 'isMain']);
      expect(response.data.isMain, 'свойство isMain должно быть булевым')
        .that.be.an('boolean');

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
      expect(response.data, 'сервер возвращает объект с полями id, name, uri, isMain')
        .that.is.an('object')
        .to.have.keys(['id', 'name', 'uri', 'isMain']);
      expect(response.data.isMain, 'свойство isMain должно быть булевым')
        .that.be.an('boolean');
    });
  });
});
