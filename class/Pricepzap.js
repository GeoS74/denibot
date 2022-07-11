const fetch = require('node-fetch');

const Bot = require('./Bot');
const Nomenclature = require('../models/Nomenclature');
require('../models/Owner');

module.exports = class Pricepzap extends Bot {
  _start;

  _end;

  _error = [];

  _countMainNomeclateres = 0;

  _countProcessedPosition = 0;

  _countAddPosition = 0;

  // @Override
  getState() {
    const state = {
      pid: this._pid,
      name: this._name,
      state: this._state,
      error: this._error,
      processed: `обработано ${this._countProcessedPosition} из ${this._countMainNomeclateres} позиций`,
      writed: `записано ${this._countAddPosition} позиций`,
      runTime: `${((this._end ? this._end : Date.now()) - this._start) / 1000} sec`,
    };
    process.send(JSON.stringify(state));
  }

  async run() {
    try {
      this._start = Date.now();
      this._end = null;
      this._error.length = 0;
      this._state = 'run';
      const mainNomenclature = await Pricepzap._getMainNomenclature();
      this._countMainNomeclateres = mainNomenclature.length;
      this._countProcessedPosition = 0;
      this._countAddPosition = 0;

      for (const position of mainNomenclature) {
        this._countProcessedPosition++;
        if (position.article) {
          try {
            const searchPositions = await Pricepzap._getSearchPosition(position);
            if (await this._addPositions(position, searchPositions?.products)) {
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
      this._state = `error: ${error.message}`;
      this._end = Date.now();
    }
  }

  async _addPositions(mainPositions, searchPositions) {
    if (!Array.isArray(searchPositions)) {
      return false;
    }
    for (const position of searchPositions) {
      await this._addPosition(mainPositions, position);
    }
    return true;
  }

  async _addPosition(mainPositions, position) {
    return Nomenclature.create({
      mainNomenclatureId: mainPositions.id,
      code: position.product_id,
      title: position.name,
      owner: this._id,
      uri: position.url,
    });
  }

  static async _getSearchPosition(position) {
    return fetch(`https://pricepzap.ru/index.php?route=extension/module/live_search&filter_name=${encodeURI(position.article)}`)
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          return result;
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
