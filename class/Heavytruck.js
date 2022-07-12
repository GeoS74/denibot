const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const Bot = require('./Bot');
const Nomenclature = require('../models/Nomenclature');
require('../models/Owner');

module.exports = class Heavytruck extends Bot {

  async run() {
    try {
      this._start = Date.now();
      this._end = null;
      this._error.length = 0;
      this._state = 'run';
      const mainNomenclature = await Heavytruck._getMainNomenclature();
      this._countMainNomeclateres = mainNomenclature.length;
      this._countProcessedPosition = 0;
      this._countAddPosition = 0;

      for (const position of mainNomenclature) {
        this._countProcessedPosition++;
        if (position.article) {
          try {
            const searchPositions = await this._getSearchPosition(position);
            if (await this._addPositions(position, searchPositions)) {
              this._countAddPosition++;
            }
          } catch (error) {
            this._error.push(error.message);
          }
        }
      }

      this._state = 'stop';
      this._end = Date.now();
    } catch (error) {
      console.log(error.message)
      this._state = `Fatal Error: ${error.message}`;
      this._end = Date.now();
    }
  }

  async _addPositions(mainPosition, searchPositions) {
    if (!searchPositions.length) {
      return false;
    }
    for (const position of searchPositions) {
      await this._addPosition(mainPosition, position);
    }
    return true;
  }

  async _addPosition(mainPosition, position) {
    return Nomenclature.create({
      mainNomenclatureId: mainPosition._id,
      owner: this._id,
      code: position.product_id,
      title: position.title,
      uri: position.uri,
      factory: position.factory
    });
  }

  _htmlParser(html) {
    const result = []
    const dom = new JSDOM(html);
    const positions = dom.window.document.querySelectorAll('.shop2-product-item');
    if (positions.length) {
      for (const position of positions) {

        const uri = position.querySelector('.product-name > a')?.href
        const data = {
          product_id: position.querySelector('input[name="product_id"]')?.value,
          uri: uri ? new URL(uri, this._uri).toString() : undefined,
          title: position.querySelector('.product-name > a')?.innerHTML,
          factory: position.querySelector('.option_body > a')?.innerHTML,
        }
        result.push(data)
      }
    }
    return result;
  }

  async _getSearchPosition(position) {
    return fetch(`https://xn--e1afucc1b.su/shop/search?search_text=${encodeURI(position.article)}`)
      .then(async (res) => {
        if (res.ok) {
          const html = await res.text();
          return this._htmlParser(html)
        }

        throw new Error(`search error by article: ${position.article}`);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  static _getMainNomenclature() {
    return Nomenclature.aggregate([
      {
        $lookup: {
          from: 'owners',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $match: {
          'owner.isMain': true,
        },
      },
      {
        $unwind: '$owner',
      },
    ]);
  }
};
