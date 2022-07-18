const puppeteer = require('puppeteer');

const config = require('../config');

module.exports = class Puppeteer {
  _browser;

  _page;

  _currentPort;

  _ports;

  _delay;

  _navigationTimeout;

  constructor(socksPorts) {
    if (!Array.isArray(socksPorts) || !socksPorts.length) {
      throw new Error(`${this.constructor.name}: socks ports is empty`);
    }
    this._ports = socksPorts;
    this._delay = config.bot.queryDelay;
    this._navigationTimeout = config.bot.navigationTimeout;
  }

  _setPort() {
    if (!this._currentPort) {
      [this._currentPort] = this._ports;
      return;
    }

    const index = this._ports.indexOf(this._currentPort);

    if ((index + 1) === this._ports.length) {
      [this._currentPort] = this._ports;
      return;
    }

    this._currentPort = this._ports[index + 1];
  }

  async _startBrowser() {
    this._setPort();

    this._browser = await puppeteer.launch({
      headless: true, // hide browser
      args: [`--proxy-server=socks5://127.0.0.1:${this._currentPort}`],
    });
    this._page = await this._browser.newPage();
    await this._page.setDefaultNavigationTimeout(this._navigationTimeout);
  }

  async getPage(url, returnText) {
    await this._startBrowser();
    await Puppeteer._pause(this._delay);

    const result = await this._page.goto(url)
      .then(async (res) => {
        if (res.ok()) {
          return returnText ? res.text() : res.json();
        }
        throw new Error(`${this.constructor.name} error status: ${res.status()} url: ${url}`);
      })
      .catch(async (error) => {
        await this._close();
        throw new Error(error.message);
      });

    await this._close();
    return result;
  }

  async _close() {
    return this._browser.close();
  }

  static _pause(delay) {
    return new Promise((res) => {
      setTimeout(() => res(), delay);
    });
  }
};
