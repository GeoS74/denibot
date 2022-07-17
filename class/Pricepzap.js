const fetch = require('node-fetch');

const config = require('../config');
const Bot = require('./Bot');
const Puppeteer = require('./Puppeteer');
const Nomenclature = require('../models/Nomenclature');

const puppeteer = new Puppeteer();

module.exports = class Pricepzap extends Bot {
  // @Override
  // @return void
  async _createPosition(mainNomenclatureId, position) {
    return Nomenclature.create({
      owner: this._id,
      mainNomenclatureId,
      uri: position.url,
      code: position.product_id,
      title: position.name,
    });
  }

  // @Override
  // @return Array
  async _getSearchPosition(article) {
    const url = new URL(`/index.php?route=extension/module/live_search&filter_name=${encodeURI(article)}`, this._uri);
    const data = await puppeteer.getPage(url);

    if (Array.isArray(data?.products)) {
      return data.products;
    }
    return [];
  }

  // @return Array
  async _getSearchPositionFetch(article) {
    const url = new URL(`/index.php?route=extension/module/live_search&filter_name=${encodeURI(article)}`, this._uri);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.fetch.timeout);
    const result = await fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.products)) {
            return data.products;
          }
          return [];
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
