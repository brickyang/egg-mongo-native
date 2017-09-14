'use strict';
const MongoDB = require('./lib/mongo');

module.exports = app => {
  app.addSingleton('mongo', createMongo);
};

function createMongo(config, app) {
  const client = new MongoDB(config);

  client.on('connect', () => {
    app.coreLogger.info(
      '[egg-mongo] Connect success on mongo://%s:%s/%s.',
      config.host,
      config.port,
      config.name
    );
  });
  /* istanbul ignore next */
  client.on('error', error => {
    app.coreLogger.warn(
      '[egg-mongo] Connect fail on mongo://%s:%s/%s.',
      config.host,
      config.port,
      config.name
    );
    app.coreLogger.error(error);
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-mongo] Connecting MongoDB...');
    await client.connect();
  });

  return client;
}
