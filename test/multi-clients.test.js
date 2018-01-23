'use strict';
const mock = require('egg-mock');
const assert = require('assert');

describe('test/mongo-clients.test.js', () => {
  let app;
  let NAME;
  before(async () => {
    mock.consoleLevel('NONE');
    NAME = 'test';
    app = mock.app({
      baseDir: 'apps/mongo-clients-test',
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.mongo.get('foo').deleteMany(NAME, { filter: {} });
    await app.mongo.get('bar').deleteMany(NAME, { filter: {} });
    mock.restore();
  });

  after(async () => {
    await app.mongo.get('foo').deleteMany(NAME, { filter: {} });
    await app.mongo.get('bar').deleteMany(NAME, { filter: {} });
    app.close();
  });

  describe('app.mongo.get()', () => {
    it('should get mongo configs foo info', async () => {
      const client = await app.mongo.get('foo');
      assert(client.url === 'mongodb://localhost:27017/foo');
      assert(client.db.databaseName === 'foo');
    });

    it('should get mongo configs bar info', async () => {
      const client = await app.mongo.get('bar');
      assert(client.url === 'mongodb://localhost:27017/bar');
      assert(client.db.databaseName === 'bar');
    });
  });
});
