const { expect } = require('chai');
const puppeteer = require('puppeteer');

// ipv4 address
const ipPattern = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?)$/;

describe('/test/Puppeteer.test.js', () => {
  describe('Puppeteer launch', () => {
    let _browser;
    let _page;

    after(async () => {
      _browser.close();
    });

    it('connect', async function test() {
      this.timeout(10000);

      _browser = await puppeteer.launch({
        headless: true, // hide browser
      });
      _page = await _browser.newPage();
      const ip1 = await _page.goto('https://api.ipify.org').then((res) => res.text());
      _browser.close();

      expect(ipPattern.test(ip1), 'сервер возвращает ipv4').equal(true);

      _browser = await puppeteer.launch({
        headless: true, // hide browser
        args: ['--proxy-server=socks5://127.0.0.1:9052'],
      });
      _page = await _browser.newPage();
      const ip2 = await _page.goto('https://api.ipify.org').then((res) => res.text());
      _browser.close();

      expect(ipPattern.test(ip2), 'сервер возвращает ipv4').equal(true);

      expect(ip1, 'ip-адреса должны быть разными при разных подключениях').not.equal(ip2);
    });
  });
});
