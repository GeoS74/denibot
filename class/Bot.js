const fs = require('fs');
const path = require('path');

const Nomenclature = require('../models/Nomenclature');
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
      processed: `обработано ${this._countProcessedPosition} из ${this._countMainNomeclateres} позиций`,
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
      default:
    }
  }

  _getRunTime() {
    if (!this._start) return 0;
    return ((this._end ? this._end : Date.now()) - this._start) / 1000;
  }

  // P A R S E R  ***   M E T H O D S
  async run() {
    try {
      this._reset();
      this._state = 'run';

      const mainNomenclature = await this._getMainNomenclature();
      this._countMainNomeclateres = mainNomenclature.length;

      for (const position of mainNomenclature) {
        this._countProcessedPosition += 1;
        if (position.article) {
          try {
            const searchPositions = await this._getSearchPosition(position.article);
            if (await this._addPositions(position._id, searchPositions)) {
              await this._addMatched(position._id, true);
              this._countAddPosition += searchPositions.length;
            } else {
              await this._addMatched(position._id, false);
            }
          } catch (error) {
            this._error.push(`${error.message} article:${position.article}`);

            const logger = fs.createWriteStream(path.join(__dirname, '../log/error.txt'), { flags: 'a' });
            logger.write(`${this.constructor.name} error: ${error.message} article:${position.article}\n`);
          }
        }
      }

      this._state = 'stop';
      this._end = Date.now();
    } catch (error) {
      this._state = `Fatal Error: ${error.message}`;
      this._end = Date.now();
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

  _addMatched(positionId, match) {
    const field = match ? 'toMatched' : 'notMatched';
    return Nomenclature.findByIdAndUpdate(
      positionId,
      {
        $push: {
          [field]: this.constructor.name,
        },
      },
    );
  }

  async _addPositions(mainNomenclatureId, searchPositions) {
    if (!searchPositions.length) {
      return false;
    }
    for (const position of searchPositions) {
      await this._createPosition(mainNomenclatureId, position);
    }
    return true;
  }

  _createPosition() { }

  // @return Array
  _getSearchPosition() { return []; }

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
      {
        $unwind: '$owner',
      },
    ]);
  }
};
