const log4js = require('log4js');
const path = require('path');

const config = require('../config');

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    file: {
      type: 'file',
      filename: path.join(__dirname, `../log/${config.log.file}`),
    },
  },
  categories: {
    default: {
      appenders: ['out', 'file'],
      level: 'all',
    },
    interceptor: {
      appenders: ['file'],
      level: 'warn',
    },
  },
});

module.exports = (category) => log4js.getLogger(category || 'default');
