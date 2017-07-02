# egg-mongo

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongo
[travis-image]: https://img.shields.io/travis/eggjs/egg-mongo.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mongo
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mongo.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mongo?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mongo.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mongo
[snyk-image]: https://snyk.io/test/npm/egg-mongo/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mongo
[download-image]: https://img.shields.io/npm/dm/egg-mongo.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mongo

<!--
Description here.
-->

这个插件提供了官方的 MongoDB driver API。你可以在这里查看所有 API：[Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/2.2/api/)。

插件对一些常用 API 进行了封装以简化使用，同时保留了所有原版属性。例如，你可以用

```js
app.mongo.find('name', {});
```

代替原版写法

```js
db.collection('name').find({}).toArray();
```

当然，在任何时候你都可以通过 `app.mongo.db` 使用所有原版 API。

此插件完全支持 Promise，并强烈推荐使用 async/await。

## 安装

```bash
$ npm i egg-mongo-native --save
```

## 开启插件

```js
// config/plugin.js
exports.mongo = {
  enable: true,
  package: 'egg-mongo',
};
```

## 配置

```javascript
// {app_root}/config/config.default.js
exports.mongo = {
  client: {
    host: 'localhost',
    port: 27017,
    name: 'test',
  },
};
```

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。

## License

[MIT](LICENSE)
