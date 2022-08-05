const config = require('./config');
const app = require('./app');
const logger = require('./libs/logger')('app say');

app.listen(config.server.port, () => {
  logger.info(`server run http://${config.server.host}:${config.server.port}`);
});
