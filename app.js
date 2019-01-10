'use strict';
const MongoDB = require('@brickyang/easy-mongodb');

module.exports = app => {
  app.addSingleton('mongo', createMongo);
};

function createMongo(config, app) {
  const client = new MongoDB(config);
  const connectUrl = client.url.replace(
    /:\S*@/,
    `://${client.config.name}:******@`
  );

  client.on('connect', () => {
    app.coreLogger.info(`[egg-mongo] Connect success on ${connectUrl}.`);
  });
  /* istanbul ignore next */
  client.on('error', error => {
    app.coreLogger.warn(`[egg-mongo] Connect fail on ${connectUrl}.`);
    app.coreLogger.error(error);
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-mongo] Connecting MongoDB...');
    await client.connect();
  });

  return client;
}
