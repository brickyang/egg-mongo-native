'use strict';

const assert = require('assert');
const MongoDB = require('../lib/mongo');

describe('test/multi-instance.test.js', () => {
  it('should make replica URI', () => {
    const config = {
      host: [ 'host1', 'host2' ],
      port: [ 'port1', 'port2' ],
      name: 'test',
      options: {
        replicaSet: 'test',
      },
    };
    const expect = 'mongodb://host1:port1,host2:port2/test?replicaSet=test';
    const client = new MongoDB(config);
    assert.equal(client.url, expect);
  });

  it('should make replica URI with string options', () => {
    const config = {
      host: 'host1,host2',
      port: 'port1,port2',
      name: 'test',
      options: {
        replicaSet: 'test',
      },
    };
    const expect = 'mongodb://host1:port1,host2:port2/test?replicaSet=test';
    const client = new MongoDB(config);
    assert.equal(client.url, expect);
  });

  it('should make replica URI with one host', () => {
    const config = {
      host: [ 'host' ],
      port: [ 'port1', 'port2' ],
      name: 'test',
      options: {
        replicaSet: 'test',
      },
    };
    const expect = 'mongodb://host:port1,host:port2/test?replicaSet=test';
    const client = new MongoDB(config);
    assert.equal(client.url, expect);
  });

  it('should throw', async () => {
    const config = {
      host: [ 'host1', 'host2' ],
      port: [ 'port' ],
      name: 'test',
      options: {
        replicaSet: 'test',
      },
    };
    const expect = 'The host and port do not match. Please check your config.';
    try {
      new MongoDB(config);
    } catch (error) {
      assert(error);
      assert.equal(error.context, expect);
    }
  });
});
