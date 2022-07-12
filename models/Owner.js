const mongoose = require('mongoose');

const connection = require('../libs/connection');

const Schema = new mongoose.Schema({
  isMain: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    index: true,
    required: 'поле ${PATH} обязательно для заполнения',
  },
  uri: {
    type: String,
  },
  botName: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = connection.model('Owner', Schema);
