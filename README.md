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

[**中文版**](https://github.com/brickyang/egg-mongo/blob/master/README.zh_CN.md)

This plugin base on
[node-mongodb-native](https://github.com/mongodb/node-mongodb-native), provides
the official MongoDB native driver and APIs.

It wraps some frequently-used API to make it easy to use but keep all properties
as it is. For example, to find a document you need this with official API

```js
db.collection('name')
  .find(query, options)
  .skip(skip)
  .limit(limit)
  .project(project)
  .sort(sort)
  .toArray();
```

and with this plugin

```js
app.mongo.find('name', { query, skip, limit, project, sort, options });
```

## Install

```bash
$ npm i egg-mongo-native --save
```

## Enable Plugin

```js
// {app_root}/config/plugin.js
exports.mongo = {
  enable: true,
  package: 'egg-mongo-native',
};
```

## Configuration

### Single Instance

```js
// {app_root}/config/config.default.js
exports.mongo = {
  client: {
    host: 'host',
    port: 'port',
    name: 'test',
    user: 'user',
    password: 'password',
    options: {},
  },
};
```

### Replica Set (v2.1.0 or higher)

```js
// mongodb://host1:port1,host2:port2/name?replicaSet=test
exports.mongo = {
  client: {
    host: 'host1,host2',
    port: 'port1,port2',
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
    port: 'port1,port2', // or ['port1', 'port2']
    name: 'name',
    options: {
      replicaSet: 'test',
    },
  },
};
```

### Multiple Instances

> **Can not set `client` and `clients` both.**

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

see [config/config.default.js](config/config.default.js) for more detail.

## Example

The APIs provided by plugin usually need two arguments. The first is commonly
the collection name, and the second is an object keeps the arguments of official
API. For example, to insert one document using official API

```js
db.collection('name').insertOne(doc, options);
```

and using plugin API

```js
const args = { doc, options };
app.mongo.insertOne('name', args);
```

**For Multiple Instances**

```js
const args = { doc, options };
app.mongo.get('db1').insertOne('name', args);
```

The `args` is an object provides the arguments to official API.

## Properties

You can access these properties of `app.mongo`。

- **db**: the db instance connected
- **config**: the client config, typically is an object includes the host, port, name, user, password and options.

## Methods

Until now, this plugin provides these functions:

- **connect**: automatically connected, no need to call
- **insertOne**
- **insertMany**
- **findOne**
- **findOneAndUpdate**
- **findOneAndReplace**
- **findOneAndDelete**
- **updateMany**
- **deleteMany**
- **find**
- **count**: DEPRECATED
- **countDocuments**
- **estimatedDocumentCount**
- **distinct**
- **createIndex**
- **listCollection**
- **createCollection**
- **aggregate**: need version 2.2.0 and above

You can always use `app.mongo.db` to use all official APIs. Check the
APIs here:
[Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/3.0/api/).

## Promise

`node-mongodb-native` supports Promise, you can call all APIs async or sync.

### Async

```js
// Promise
function create(doc) {
  app.mongo
    .insertOne('name', { doc })
    .then(result => console.log(result))
    .catch(error => console.error(error));
}
```

### Sync

```js
// async/await
async function create(doc) {
  try {
    const result = await app.mongo.insertOne('name', { doc });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

If you use `app.mongo.db` you could use callback(usually the last argument), but
this plugin doesn't supports callback because Promise and async/await are better
choice.

## License

[MIT](LICENSE)
