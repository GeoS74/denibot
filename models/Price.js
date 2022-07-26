const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  nomenclatureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nomenclature',
    required: 'поле ${PATH} обязательно для заполнения',
  },
  price: {
    type: Number,
  },
}, {
  timestamps: true,
});

module.exports = connection.model('Price', Schema);
