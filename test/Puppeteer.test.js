const { expect } = require('chai');
const puppeteer = require('puppeteer');

describe('/test/Puppeteer.test.js', () => {
  describe('Puppeteer launch', () => {
    // ipv4 address
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?)$/;
    let browser;
    let page;

    it('Standart connect', async function test() {
      this.timeout(10000);

      browser = await puppeteer.launch({
        headless: true, // hide browser
      });
      page = await browser.newPage();
      const ip1 = await page.goto('https://api.ipify.org').then((res) => res.text());
      browser.close();

      expect(ipPattern.test(ip1)).equal(true);

      browser = await puppeteer.launch({
        headless: true, // hide browser
        args: ['--proxy-server=socks5://127.0.0.1:9050'],
      });
      page = await browser.newPage();
      const ip2 = await page.goto('https://api.ipify.org').then((res) => res.text());
      browser.close();

      expect(ipPattern.test(ip2)).equal(true);

      expect(ip1).not.equal(ip2);
    });
  });
});
