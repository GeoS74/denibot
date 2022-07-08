const config = require('./config');
const app = require('./app');

app.listen(config.server.port, () => {
  console.log(`server run http://${config.server.host}:${config.server.port}`);
});
