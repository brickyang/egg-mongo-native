# egg-mongo

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongo-native.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongo-native
[travis-image]: https://img.shields.io/travis/eggjs/egg-mongo.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mongo
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mongo.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mongo?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mongo.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mongo
[snyk-image]: https://snyk.io/test/npm/egg-mongo/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mongo
[download-image]: https://img.shields.io/npm/dm/egg-mongo-native.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mongo-native

<!--
Description here.
-->
This plugin provides the official MongoDB native driver APIs. You can check the APIs here: [Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/2.2/api/).

It wraps some frequently-used API to make it easy to use but keep all properties as it is. For example, you can use

```js
app.mongo.find('name', {});
```
to instead the original
```js
db.collection('name').find({}).toArray();
```

And you could just use `app.mongo.db` in anytime to archive all APIs if you like.

This plugin supports Promise fully means you could use async/await freely.

## Install

```bash
$ npm i egg-mongo-native --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.mongo = {
  enable: true,
  package: 'egg-mongo',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.mongo = {
  client: {
    host: 'localhost',
    port: 27017,
    name: 'test',
  },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## License

[MIT](LICENSE)
