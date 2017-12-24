'use strict';

/**
 * egg-mongo default config
 * @member Config#mongo
 * @property {String} SOME_KEY - some description
 */
exports.mongo = {
  default: {
    host: 'localhost',
    port: 27017,
    name: 'test',
  },
  app: true,
  agent: false,
};
