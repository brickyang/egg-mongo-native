'use strict';
const MongoDB = require('./lib/mongo');

module.exports = app => {
  app.addSingleton('mongo', createMongo);
};

function createMongo(config, app) {
  const client = new MongoDB(config);

  client.on('connect', () => {
    app.coreLogger.info(`[egg-mongo] Connect success on ${client.url}.`);
  });
  /* istanbul ignore next */
  client.on('error', error => {
    app.coreLogger.warn(`[egg-mongo] Connect fail on ${client.url}.`);
    app.coreLogger.error(error);
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-mongo] Connecting MongoDB...');
    await client.connect();
  });

  return client;
}
