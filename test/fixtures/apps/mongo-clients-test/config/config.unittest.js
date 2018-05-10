'use strict';

exports.mongo = {
  clients: {
    foo: {
      name: 'foo',
    },
    bar: {
      name: 'bar',
    },
  },
  default: {
    host: 'localhost',
    port: 27017,
    options: {
      ssl: false,
      connectTimeoutMS: 30000,
    },
  },
};
