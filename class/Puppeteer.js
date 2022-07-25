const puppeteer = require('puppeteer');

const config = require('../config');

module.exports = class Puppeteer {
  _browser;

  _page;

  _ports;

  _usagePorts = [];

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

  async getPage(url, returnText) {
    const port = this._getPort();
    const browser = await Puppeteer._startBrowser(port);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(this._navigationTimeout);

    await Puppeteer._pause(this._delay * Puppeteer._getRandomIndex(3));

    return page.goto(url)
      .then(async (res) => {
        if (res.ok()) {
          return returnText ? res.text() : res.json();
        }
        throw new Error(`${this.constructor.name} error status: ${res.status()} url: ${url}`);
      })
      .catch(async (error) => {
        throw new Error(error.message);
      })
      .finally(async () => {
        await browser.close();
        this._resetPort(port);
      });
  }

  static async _startBrowser(port) {
    return puppeteer.launch({
      headless: true, // hide browser
      args: [
        `--proxy-server=socks5://127.0.0.1:${port}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
  }

  _resetPort(port) {
    const portIndex = this._usagePorts.indexOf(port);
    this._usagePorts.splice(portIndex, 1);
  }

  _getPort() {
    const port = this._ports[Puppeteer._getRandomIndex(this._ports.length)];
    if (this._usagePorts.indexOf(port) === -1) {
      this._usagePorts.push(port);
      return port;
    }
    return this._getPort();
  }

  static _getRandomIndex(max) {
    return Math.floor(Math.random() * max);
  }

  static _pause(delay) {
    return new Promise((res) => {
      setTimeout(() => res(), delay);
    });
  }
};
