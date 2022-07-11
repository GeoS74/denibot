const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: 'поле ${PATH} обязательно для заполнения',
  },
  uri: String,
}, {
  timestamps: true,
});

module.exports = connection.model('Nomenclature', Schema);
