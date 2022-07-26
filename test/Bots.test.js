const { expect } = require('chai');
const fetch = require('node-fetch');

const config = require('../config');
const app = require('../app');
const Owner = require('../models/Owner');

describe('/test/Bots.test.js', () => {
  let _server;
  before(async () => {
    _server = app.listen(config.server.port);

    const owner = {
      name: 'bot',
      botName: 'Bot',
      enabled: true,
    };
    const optional = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(owner),
    };
    await fetch(`http://localhost:${config.server.port}/owner`, optional);
  });

  after(async () => {
    await Owner.deleteMany();
    _server.close();
  });

  describe('bots states controller', () => {
    it('bot don`t start without init', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/bot/match`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 500').to.be.equal(500);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');

      response = await fetch(`http://localhost:${config.server.port}/bot/price`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 500').to.be.equal(500);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot don`t stop without init', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/bot/stop`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 500').to.be.equal(500);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot don`t kill without init', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/bot/kill`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 500').to.be.equal(500);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot init', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/bot/init`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 201').to.be.equal(201);
      expectDataManyBots.call(this, response.data);
      expectFieldState.call(this, response.data.stateBots[0]);
      expect(response.data.stateBots[0].state, 'состояние бота должно быть created')
        .equal('created');
    });

    it('bot state', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/bot/state`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataManyBots.call(this, response.data);
      expectFieldState.call(this, response.data.stateBots[0]);

      const { pid } = response.data.stateBots[0];

      response = await fetch(`http://localhost:${config.server.port}/bot/state/${pid}`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expectDataOneBot.call(this, response.data);
      expectFieldState.call(this, response.data.stateBot);

      response = await fetch(`http://localhost:${config.server.port}/bot/state/1`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot statistic', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/bot/statistic`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает объект с полями countBots, countActiveBots, countMainNomemclature, bots')
        .that.is.an('object')
        .to.have.keys(['countBots', 'countActiveBots', 'countMainNomemclature', 'bots']);
      expect(response.data.countBots, 'свойство countBots должно быть числовым')
        .that.be.an('number');
      expect(response.data.countActiveBots, 'свойство countActiveBots должно быть числовым')
        .that.be.an('number');
      expect(response.data.countMainNomemclature, 'свойство countMainNomemclature должно быть числовым')
        .that.be.an('number');
      expect(response.data.bots, 'свойство bots должно быть массивом')
        .that.be.an('array');
      expect(response.data.bots[0], 'элемент bots должен быть объектом с полями botName, matchedPosition')
        .that.be.an('object')
        .to.have.keys(['botName', 'matchedPosition']);
    });

    it('bot matched position', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/bot/match`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataManyBots.call(this, response.data);
      expectFieldState.call(this, response.data.stateBots[0]);
      expect(response.data.stateBots[0].state, 'состояние бота должно быть run')
        .equal('run');

      const { pid } = response.data.stateBots[0];

      response = await fetch(`http://localhost:${config.server.port}/bot/stop`);

      response = await fetch(`http://localhost:${config.server.port}/bot/match/${pid}`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expectDataOneBot.call(this, response.data);
      expectFieldState.call(this, response.data.stateBot);
      expect(response.data.stateBot.state, 'состояние бота должно быть run')
        .equal('run');

      response = await fetch(`http://localhost:${config.server.port}/bot/match/1`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot pricing position', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/bot/price`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataManyBots.call(this, response.data);
      expectFieldState.call(this, response.data.stateBots[0]);
      expect(response.data.stateBots[0].state, 'состояние бота должно быть run')
        .equal('run');

      const { pid } = response.data.stateBots[0];

      response = await fetch(`http://localhost:${config.server.port}/bot/stop`);

      response = await fetch(`http://localhost:${config.server.port}/bot/price/${pid}`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expectDataOneBot.call(this, response.data);
      expectFieldState.call(this, response.data.stateBot);
      expect(response.data.stateBot.state, 'состояние бота должно быть run')
        .equal('run');

      response = await fetch(`http://localhost:${config.server.port}/bot/price/1`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot stop', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/bot/stop`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataManyBots.call(this, response.data);
      expectFieldState.call(this, response.data.stateBots[0]);
      expect(response.data.stateBots[0].state, 'состояние бота должно быть stop')
        .equal('stop');

      const { pid } = response.data.stateBots[0];

      response = await fetch(`http://localhost:${config.server.port}/bot/match`);

      response = await fetch(`http://localhost:${config.server.port}/bot/stop/${pid}`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expectDataOneBot.call(this, response.data);
      expectFieldState.call(this, response.data.stateBot);
      expect(response.data.stateBot.state, 'состояние бота должно быть stop')
        .equal('stop');

      response = await fetch(`http://localhost:${config.server.port}/bot/stop/1`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      expect(response.data, 'сервер возвращает объект с полем error')
        .that.is.an('object')
        .to.have.property('error');
    });

    it('bot kill', async () => {
      // add new bot
      await fetch(`http://localhost:${config.server.port}/bot/init`);

      let response = await fetch(`http://localhost:${config.server.port}/bot/state`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      const { pid } = response.data.stateBots[0];

      response = await fetch(`http://localhost:${config.server.port}/bot/kill/${pid}`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataOneBot.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/bot/kill`)
        .then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));

      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expectDataManyBots.call(this, response.data);
    });
  });
});

function expectDataManyBots(data) {
  expect(data, 'сервер возвращает объект с полями countBots, stateBots')
    .that.is.an('object')
    .to.have.keys(['countBots', 'stateBots']);
  expect(data.countBots, 'свойство countBots должно быть числовым')
    .that.be.an('number');
  expect(data.stateBots, 'свойство stateBots должно быть массивом')
    .that.be.an('array');
}

function expectDataOneBot(data) {
  expect(data, 'сервер возвращает объект с полем stateBot')
    .that.is.an('object')
    .to.have.property('stateBot');
  expect(data.stateBot, 'свойство stateBot должно быть объектом')
    .that.be.an('object');
}

function expectFieldState(data) {
  expect(
    data,
    'свойство stateBots содержит объект с полями pid, name, state, error, processed, writed, runTime',
  )
    .that.be.an('object')
    .to.have.keys(['pid', 'name', 'state', 'error', 'processed', 'writed', 'runTime']);
  expect(data.pid, 'свойство pid должно быть числом')
    .that.is.an('number');
  expect(data.error, 'свойство error должно быть массивом')
    .that.is.an('array');
}
