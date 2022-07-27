const fs = require('fs');
const path = require('path');

const Nomenclature = require('../models/Nomenclature');
const Price = require('../models/Price');
require('../models/Owner');

module.exports = class Bot {
  _state;

  _name;

  _uri;

  _id; // id in collection Owners

  _pid; // process id

  _start;

  _end;

  _error = [];

  _countMainNomeclateres = 0;

  _countProcessedPosition = 0;

  _countAddPosition = 0;

  constructor(data, pid) {
    process.on('message', (message) => this._parentSend(message));
    this._state = 'created';
    this._name = data.name;
    this._uri = data.uri;
    this._id = data.id;
    this._pid = pid;
  }

  getState() {
    const state = {
      pid: this._pid,
      name: this._name,
      state: this._state,
      error: this._error,
      processed: `обработано ${this._countProcessedPosition} из ${this._countMainNomeclateres} позиций. Ошибок: ${this._error.length}`,
      writed: `записано ${this._countAddPosition} позиций`,
      runTime: `${this._getRunTime()} sec`,
    };
    process.send(JSON.stringify(state));
  }

  _parentSend(message) {
    switch (message) {
      case 'state':
        this.getState();
        break;
      case 'makeMatch':
        if (this._state !== 'run') {
          this.run();
        }
        break;
      case 'makePrice':
        if (this._state !== 'run') {
          this.run('price');
        }
        break;
      case 'stop':
        this._state = 'stop';
        break;
      case 'kill':
        this._state = 'stop';
        process.exit();
        break;
      default:
    }
  }

  _getRunTime() {
    if (!this._start) return 0;
    return ((this._end ? this._end : Date.now()) - this._start) / 1000;
  }

  // P A R S E R  ***   M E T H O D S

  // @return Array
  _getSearchPosition() { return []; }

  _getPricePosition() { return 0; }

  async run(makePrice) {
    try {
      this._reset();
      this._state = 'run';

      await this._parsing(makePrice);

      this._state = 'stop';
      this._end = Date.now();
    } catch (error) {
      this._state = `Fatal Error: ${error.message}`;
      this._end = Date.now();
    }
  }

  async _parsing(makePrice) {
    let nomenclature;
    let handler;

    if (makePrice) {
      nomenclature = await this._getMatchedNomenclature();
      handler = this._priceHandler;
    } else {
      nomenclature = await this._getMainNomenclature();
      handler = this._matchHandler;
    }
    this._countMainNomeclateres = nomenclature.length;

    const range = Math.floor(nomenclature.length / 2);
    return Promise.all([
      this._positionProc(nomenclature.slice(0, range), handler),
      this._positionProc(nomenclature.slice(range), handler),
    ]);
  }

  async _positionProc(nomenclature, handler) {
    for (const position of nomenclature) {
      if (this._state === 'stop') {
        break;
      }

      this._countProcessedPosition += 1;
      if (position.article || position.uri) {
        await handler.call(this, position);
      }
    }
  }

  async _priceHandler(position) {
    try {
      const price = await this._getPricePosition(position.uri);
      await Bot._createPrice(price, position);
      this._countAddPosition += 1;
    } catch (error) {
      this._error.push(`priceError: ${error.message} article:${position.article}`);

      const logger = fs.createWriteStream(path.join(__dirname, '../log/errorPrice.txt'), { flags: 'a' });
      logger.write(`${this.constructor.name} error: ${error.message} article:${position.article}\n`);
    }
  }

  async _matchHandler(position) {
    try {
      const searchPositions = await this._getSearchPosition(position.article);
      if (await this._addMatchPositions(position._id, searchPositions)) {
        await this._addMatched(position._id, true);
        this._countAddPosition += searchPositions.length;
      } else {
        await this._addMatched(position._id, false);
      }
    } catch (error) {
      this._error.push(`matchError: ${error.message} article:${position.article}`);

      const logger = fs.createWriteStream(path.join(__dirname, '../log/errorMatch.txt'), { flags: 'a' });
      logger.write(`${this.constructor.name} error: ${error.message} article:${position.article}\n`);
    }
  }

  _reset() {
    this._start = Date.now();
    this._end = null;
    this._error.length = 0;
    this._countMainNomeclateres = 0;
    this._countProcessedPosition = 0;
    this._countAddPosition = 0;
  }

  async _addMatched(positionId, isMatch) {
    const field = isMatch ? 'toMatched' : 'notMatched';
    return Nomenclature.findByIdAndUpdate(
      positionId,
      {
        $push: {
          [field]: this.constructor.name,
        },
      },
    );
  }

  async _addMatchPositions(mainNomenclatureId, searchPositions) {
    if (!searchPositions.length) {
      return false;
    }
    for (const position of searchPositions) {
      await this._createPosition(mainNomenclatureId, position);
    }
    return true;
  }

  static async _createPrice(price, position) {
    return Price.create({
      nomenclatureId: position._id,
      price,
    });
  }

  async _createPosition(mainNomenclatureId, position) {
    return Nomenclature.create({
      owner: this._id,
      mainNomenclatureId,
      uri: position.uri,
      code: position.code || undefined,
      title: position.title || undefined,
      factory: position.factory || undefined,
    });
  }

  async _getMatchedNomenclature() {
    // The request populates the 'price' field with an array of prices,
    // if there are no prices, the array is empty.
    // In the pipeline $lookup section, the price array is filled with the last set price value
    // and is limited to 1 element.
    // The subsequent $match instruction leaves only those positions
    // that do not have an attached price,
    // or the price was updated earlier than a week ago.
    // If the statement '$not: {$size: 0}' is uncommented in $match, then the selection will include
    // only goods that have a price.
    // The same effect will be if you uncomment $unwind.
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
          'owner.botName': new RegExp(this.constructor.name),
        },
      },
      {
        $lookup: {
          from: 'prices',
          localField: '_id',
          foreignField: 'nomenclatureId',
          as: 'price',

          pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
        },
      },
      // { $unwind: '$price' },
      {
        $match: {
          // 'price': {$not: {$size: 0}},
          'price.createdAt': { $not: { $gt: new Date(Date.now() - 1000 * 3600 * 24 * 7) } },
        },
      },
    ]);
  }

  async _getMainNomenclature() {
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
          $and: [
            {
              notMatched: {
                $not: new RegExp(this.constructor.name),
              },
            },
            {
              toMatched: {
                $not: new RegExp(this.constructor.name),
              },
            },
          ],
        },
      },
      { $unwind: '$owner' },
    ]);
  }

  static _pause(delay) {
    return new Promise((res) => {
      setTimeout(() => res(), delay);
    });
  }
};
