const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const config = require('../config');
const Bot = require('./Bot');
const Puppeteer = require('./Puppeteer');

const puppeteer = new Puppeteer(config.bot.socksPort.Autoopt);

module.exports = class Autoopt extends Bot {
  // @Override
  // @return Integer
  async _getPricePosition(uri) {
    const data = await puppeteer.getPage(uri, 'text');
    return this._htmlParserPrice(data);
  }

  _htmlParserPrice(html) {
    const result = 0;
    // const dom = new JSDOM(html);
    // const price = dom.window.document.querySelector('.price-current strong');
    // if (price) {
    //   result = parseFloat.call(null, price.innerHTML.replaceAll('&nbsp;', ''));
    // }
    return result;
  }

  // @Override
  // @return Array
  async _getSearchPosition(article) {
    const url = new URL(`/search/index?search=${encodeURI(article)}`, this._uri);
    const data = await puppeteer.getPage(url, 'text');
    return this._htmlParserSearching(data);
  }

  // @return Array
  async _getSearchPositionFetch(article) {
    const url = new URL(`/search/index?search=${encodeURI(article)}`, this._uri);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.fetch.timeout);
    const result = await fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const html = await res.text();
          return this._htmlParserSearching(html);
        }

        throw new Error('search error');
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    clearTimeout(timeoutId);
    return result;
  }

  _htmlParserSearching(html) {
    const result = [];
    const dom = new JSDOM(html);
    const positions = dom.window.document.querySelectorAll('.n-catalog-item__product');
    if (positions.length) {
      for (const position of positions) {
        const uri = position.querySelector('.n-catalog-item__name a')?.href;
        const data = {
          uri: uri ? new URL(uri, this._uri).toString() : undefined,
          code: position.querySelector('.n-catalog-item__code-box > span')?.innerHTML || undefined,
          article: position.querySelector('.n-catalog-item__article > .n-catalog-item__click-copy')?.innerHTML || undefined,
        };
        result.push(data);
      }
    }
    return result;
  }
};
