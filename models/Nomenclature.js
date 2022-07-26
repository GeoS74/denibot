const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: 'поле ${PATH} обязательно для заполнения',
  },
  mainNomenclatureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nomenclature',
  },
  code: {
    type: String,
    index: true,
  },
  article: String,
  title: String,
  uri: String,
  factory: String,
  toMatched: Array,
  notMatched: Array,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

Schema.virtual('matchPositions', {
  ref: 'Nomenclature',
  localField: '_id',
  foreignField: 'mainNomenclatureId',
});

module.exports = connection.model('Nomenclature', Schema);
