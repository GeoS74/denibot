const { expect } = require('chai');
const childProcess = require('child_process');

const Bot = require('../class/Bot');

describe('/test/class.Bot.test.js', () => {
  const data = {
    botName: 'Bot',
    name: 'testBot',
    uri: 'http://example.com/',
    id: '123',
  };

  describe('child_process Bot', () => {
    let _bot;

    it('create child process', async function test() {
      this.timeout(10000);

      _bot = childProcess.fork('./child_process/bots.process', [], Object.assign(process.env, data));

      const state = await new Promise((res) => {
        _bot.once('message', (message) => {
          res(message);
        });
        _bot.send('state');
      }).then((res) => JSON.parse(res));

      expect(
        state,
        'дочерний процесс отвечает объектом с полями pid, name, state, error, processed, writed, runTime',
      )
        .that.be.an('object')
        .to.have.keys(['pid', 'name', 'state', 'error', 'processed', 'writed', 'runTime']);
      expect(state.pid, 'свойство pid должно быть числом')
        .that.is.an('number');
      expect(state.error, 'свойство error должно быть массивом')
        .that.is.an('array');
    });

    it('kill child process', async function test() {
      this.timeout(10000);

      await new Promise((res) => {
        _bot.once('exit', (message) => {
          res(message);
        });
        _bot.send('kill');
      });
      expect(_bot.exitCode, 'процесс завершается с кодом 0').equal(0);
    });
  });

  describe('class Bot', () => {
    const _bot = new Bot(data);

    it('_getMainNomenclature', async function test() {
      this.timeout(10000);

      const result = await _bot._getMainNomenclature();
      expect(result, 'метод _getMainNomenclature возвращает массив').that.is.an('array');
    });

    it('_addPositions', async () => {
      let result = await _bot._addPositions(null, []);
      expect(result, 'метод _addPositions возвращает false').equal(false);
      result = await _bot._addPositions(null, [1]);
      expect(result, 'метод _addPositions возвращает false').equal(true);
    });

    it('_getSearchPosition', async () => {
      const result = await _bot._getSearchPosition();
      expect(result, 'метод _getSearchPosition возвращает массив').that.is.an('array');
    });
  });
});
