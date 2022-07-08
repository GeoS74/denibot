const mongoose = require('mongoose');
mongoose.plugin(require('mongoose-beautiful-unique-validation'));

const config = require('../config');

module.exports = mongoose.createConnection(config.mongodb.uri);
