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

  beforeEach(async () => {
    await app.mongo.get('foo').deleteMany(NAME, { filter: {} });
    await app.mongo.get('bar').deleteMany(NAME, { filter: {} });
  });

  afterEach(mock.restore);
  after(() => app.close());

  describe('app.mongo.get()', () => {
    it('should get mongo configs foo info', async () => {
      const client = await app.mongo.get('foo');
      assert.equal(
        client.url,
        'mongodb://localhost:27017/foo?ssl=false&connectTimeoutMS=30000'
      );
      assert.equal(client.db.databaseName, 'foo');
    });

    it('should get mongo configs bar info', async () => {
      const client = await app.mongo.get('bar');
      assert.equal(
        client.url,
        'mongodb://localhost:27017/bar?ssl=false&connectTimeoutMS=30000'
      );
      assert.equal(client.db.databaseName, 'bar');
    });
  });
});
