const fetch = require('node-fetch');

const Bot = require('./Bot');
const Puppeteer = require('./Puppeteer');
const Nomenclature = require('../models/Nomenclature');

const puppeteer = new Puppeteer();

module.exports = class Pricepzap extends Bot {
  async _createPosition(mainNomenclatureId, position) {
    return Nomenclature.create({
      owner: this._id,
      mainNomenclatureId,
      uri: position.url,
      code: position.product_id,
      title: position.name,
    });
  }

  // @return Array
  async _getSearchPosition(article) {
    const url = new URL(`/index.php?route=extension/module/live_search&filter_name=${encodeURI(article)}`, this._uri);
    const data = await puppeteer.getPage(url);
    
    if (Array.isArray(data?.products)) {
      return data.products;
    }
    return [];
  }
};
