const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: 'поле ${PATH} обязательно для заполнения',
  },
}, {
  timestamps: true,
});

module.exports = connection.model('Owner', Schema);
