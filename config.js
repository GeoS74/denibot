require('dotenv').config({ path: './secret.env' });

module.exports = {
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3000,
  },
  mongodb: {
    uri: process.env.MONGO_DB || 'mongodb://localhost:27017/test',
    autoindex: (process.env.NODE_ENV === 'develop'),
  },
  fetch: {
    timeout: 10000,
  }
};
