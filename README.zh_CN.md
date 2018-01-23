[![NPM version][npm-image]][npm-url]
[![NPM quality][quality-image]][quality-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongo-native.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongo-native
[quality-image]: http://npm.packagequality.com/shield/egg-mongo-native.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=egg-mongo-native
[travis-image]: https://img.shields.io/travis/brickyang/egg-mongo-native.svg?branch=master&style=flat-square
[travis-url]: https://travis-ci.org/brickyang/egg-mongo-native
[codecov-image]: https://img.shields.io/codecov/c/github/brickyang/egg-mongo-native.svg?style=flat-square
[codecov-url]: https://codecov.io/github/brickyang/egg-mongo-native?branch=master
[david-image]: https://img.shields.io/david/brickyang/egg-mongo-native.svg?branch=master&style=flat-square
[david-url]: https://david-dm.org/brickyang/egg-mongo-native?branch=master
[snyk-image]: https://snyk.io/test/npm/egg-mongo-native/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mongo-native
[download-image]: https://img.shields.io/npm/dm/egg-mongo-native.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mongo-native

[**English**](https://github.com/brickyang/egg-mongo/blob/master/README.md)

本插件基于
[node-mongodb-native](https://github.com/mongodb/node-mongodb-native)，提供了
MongoDB 官方 driver 及 API。

插件对一些常用 API 进行了简单封装以简化使用，同时保留了所有原版属性。例如，使用原版 API 进行一次查找需要写

```js
db
  .collection('name')
  .find(query)
  .skip(skip)
  .limit(limit)
  .project(project)
  .sort(sort)
  .toArray();
```

封装后

```js
app.mongo.find('name', { query, skip, limit, project, sort });
```

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
  package: 'egg-mongo-native',
};
```

## 配置

### 单实例

```js
// {app_root}/config/config.default.js
exports.mongo = {
  client: {
    host: 'host',
    port: 'port',
    name: 'test',
    user: 'user',
    password: 'password',
  },
};
```

### 集群 (v2.1.0 以上 )

```js
// mongodb://host1:port1,host2:port2/name?replicaSet=test
exports.mongo = {
  client: {
    host: 'host1, host2',
    port: 'port1, port2',
    name: 'name',
    options: {
      replicaSet: 'test',
    },
  },
};

// mongodb://host:port1,host:port2/name?replicaSet=test
exports.mongo = {
  client: {
    host: 'host', // or ['host']
    port: 'port1, port2', // or ['port1', 'port2']
    name: 'name',
    options: {
      replicaSet: 'test',
    },
  },
};
```

### 多个数据库实例配置

> **不能 `client` 和 `clients` 都  设置，否则会报错。**

```js
// {app_root}/config/config.default.js
exports.mongo = {
  clients: {
    db1: {
      host: 'host',
      port: 'port',
      name: 'db1',
      user: 'user',
      password: 'password',
      options: {},
    },
    db2: {
      host: 'host',
      port: 'port',
      name: 'db2',
      user: 'user',
      password: 'password',
      options: {},
    },
  },
};
```

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。

## 使用示例

本插件提供的 API 只是对原版 API 进行了必要的简化，所有属性名称与原版 API 一致。所有针对文档操作的 API，通常接受 2 个参数，第一个参数是 collection 名称，第二个参数是一个对象，属性名即为原版 API 的所有参数。例如，使用原版 API 进行一次插入

```js
db.collection('name').insertOne(doc, options);
```

使用插件 API

```js
const args = { doc, options };
app.mongo.insertOne('name', args);
```

多个数据库实例

```js
const args = { doc, options };
app.mongo.get('db1').insertOne('name', args);
```

可以看到 `args` 就是包含原版 API 参数的一个对象。

目前插件提供的 API 包括：

```js
connect(); // 不需要用户调用
insertOne();
findOneAndUpdate();
findOneAndReplace();
findOneAndDelete();
insertMany();
updateMany();
deleteMany();
find();
count();
distinct();
createIndex();
listCollection();
createCollection();
aggregate(); // v2.2.0 以上
```

当然，在任何时候你也都可以使用 `app.mongo.db` 调用所有 API。你可以在这里查看所有
API：[Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/2.2/api/)。

## 同步与异步

`node-mongodb-native` 所有 API 都支持 Promise，因此你可以自由地以异步或同步方式使用本插件。

### 异步

```js
// Promise
function create(doc) {
  app.mongo
    .insertOne('name', { doc })
    .then(result => console.log(result))
    .catch(error => console.error(error));
}
```

### 同步

```js
// 使用 async/await
async function create(doc) {
  try {
    const result = await app.mongo.insertOne('name', { doc });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

如果你使用 `app.mongo.db` 调用原版 API，则也可以使用回调函数。插件封装的 API 不支持回调函数，因为 Promise 和 async/await 更加优雅。

Node.js 7.6 开始已经原生支持 async/await，不再需要 Babel。

## License

[MIT](LICENSE)
