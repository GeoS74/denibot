const fetch = require('node-fetch');

const Bot = require('./Bot');
const Nomenclature = require('../models/Nomenclature');

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
  async _getSearchPosition(position) {
    const url = new URL(`/index.php?route=extension/module/live_search&filter_name=${encodeURI(position.article)}`, this._uri);
    return fetch(url)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();

          if (Array.isArray(data?.products)) {
            return data.products;
          }

          return [];
        }

        throw new Error(`search error by article: ${position.article}`);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }
};
