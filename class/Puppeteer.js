const puppeteer = require('puppeteer');

module.exports = class Puppeteer {
  _browser;
  _page;

  _currentPort;

  _ports = [
    '9050',
    '9052',
    '9053',
    '9054',
    '9055',
    '9056',
    '9057',
    '9058',
    '9059',
    '9060',
    '9061',
    '9062',
    '9063',
    '9064',
    '9065',
    '9066',
    '9067',
    '9068',
    '9069',
  ]

  constructor() {
    // (async () => {
    //   this._browser = await puppeteer.launch({
    //     headless: true, //hide browser
    //     args: ['--proxy-server=socks5://127.0.0.1:9050']
    //   });
    //   this._page = await this._browser.newPage();
    //   await this._page.setDefaultNavigationTimeout(0); 
    // })()
  }

  _setPort(){
    if(!this._currentPort) {
      this._currentPort = this._ports[0];
      return;
    }

    const index = this._ports.indexOf(this._currentPort)

    if( (index + 1) === this._ports.length){
      this._currentPort = this._ports[0];
      return;
    }

    this._currentPort = this._ports[index + 1];
  }

  async _startBrowser(){
    this._setPort();

    this._browser = await puppeteer.launch({
      headless: true, //hide browser
      args: [`--proxy-server=socks5://127.0.0.1:${this._currentPort}`]
    });
    this._page = await this._browser.newPage();
    await this._page.setDefaultNavigationTimeout(300000);
  }

  async getPage(url) {
    await this._startBrowser();
    // await this._pause(500);

    const result = await this._page.goto(url)
      .then(async res => {
        if(res.ok()){
          return res.json()
        }
        throw new Error(`${this.constructor.name} error status: ${res.status()}`)
      })
      .catch(async error => {
        await this._close();
        throw new Error(error.message)
      });

    await this._close();
    return result;
  }

  async getPageText(url) {
    await this._startBrowser();

    await this._pause(500);

    const result = await this._page.goto(url)
      .then(async res => {
        if(res.ok()){
          return res.text()
        }
        throw new Error(`${this.constructor.name} error status: ${res.status()}`)
      })
      .catch(async error => {
        await this._close();
        throw new Error(error.message)
      });

    await this._close();
    return result;
  }

  async _close() {
    return this._browser.close();
  }

  _pause(delay) {
    return new Promise(res => setTimeout(_ => res(), delay));
  }
}

