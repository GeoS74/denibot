const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

module.exports = connection.model('Nomenclature', Schema);
