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
    timeout: 30000,
  },
  bot: {
    socksPort: {
      Heavytruck: new Array(10).fill(null).map((e, i) => (9062 + i)),
      SDMMotors: new Array(10).fill(null).map((e, i) => (9052 + i)),
      Pricepzap: new Array(10).fill(null).map((e, i) => (9072 + i)),
    },
    queryDelay: 1000,
    navigationTimeout: 0,
    stealthMode: false,
  },
};
