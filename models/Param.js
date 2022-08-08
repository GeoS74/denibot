const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  nomenclatureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nomenclature',
    index: true,
    required: 'поле ${PATH} обязательно для заполнения',
  },
  code: { type: String },
  title: { type: String },
  article: { type: String },
  description: { type: String },
  width: { type: String },
  height: { type: String },
  length: { type: String },
  weight: { type: String },
  manufacturer: { type: String },
  specification: { type: String },
  parameter: { type: String },
  applicabilities: { type: String },
});

module.exports = connection.model('Param', Schema);
