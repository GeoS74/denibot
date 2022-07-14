const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const config = require('../config');
const Bot = require('./Bot');
const Puppeteer = require('./Puppeteer');
const Nomenclature = require('../models/Nomenclature');

const puppeteer = new Puppeteer();

module.exports = class Heavytruck extends Bot {
  async _createPosition(mainNomenclatureId, position) {
    return Nomenclature.create({
      owner: this._id,
      mainNomenclatureId,
      uri: position.uri,
      code: position.code,
      title: position.title,
      factory: position.factory,
    });
  }

  _htmlParser(html) {
    const result = [];
    const dom = new JSDOM(html);
    const positions = dom.window.document.querySelectorAll('.shop2-product-item');
    if (positions.length) {
      for (const position of positions) {
        const uri = position.querySelector('.product-name > a')?.href;
        const data = {
          uri: uri ? new URL(uri, this._uri).toString() : undefined,
          code: position.querySelector('input[name="product_id"]')?.value,
          title: position.querySelector('.product-name > a')?.innerHTML,
          factory: position.querySelector('.option_body > a')?.innerHTML,
        };
        result.push(data);
      }
    }
    return result;
  }

  // @return Array
  async _getSearchPosition(article) {
    const url = new URL(`/shop/search?search_text=${encodeURI(article)}`, this._uri);
    const data = await puppeteer.getPageText(url);
    return this._htmlParser(data);
  }

  // @return Array
  async _getSearchPositionFetch(article) {
    const url = new URL(`/shop/search?search_text=${encodeURI(article)}`, this._uri);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.fetch.timeout);
    const result = await fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const html = await res.text();
          return this._htmlParser(html);
        }

        throw new Error('search error');
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    clearTimeout(timeoutId);
    return result;
  }
};
