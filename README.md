# egg-mongo

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mongo-native.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mongo-native
[travis-image]: https://img.shields.io/travis/brickyang/egg-mongo.svg?style=flat-square
[travis-url]: https://travis-ci.org/brickyang/egg-mongo
[codecov-image]: https://img.shields.io/codecov/c/github/brickyang/egg-mongo.svg?style=flat-square
[codecov-url]: https://codecov.io/github/brickyang/egg-mongo?branch=master
[david-image]: https://img.shields.io/david/brickyang/egg-mongo.svg?style=flat-square
[david-url]: https://david-dm.org/brickyang/egg-mongo
[snyk-image]: https://snyk.io/test/npm/egg-mongo-native/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mongo-native
[download-image]: https://img.shields.io/npm/dm/egg-mongo-native.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mongo-native

[**中文版**](https://github.com/brickyang/egg-mongo/blob/master/README.zh_CN.md)

This plugin base on [node-mongodb-native](https://github.com/mongodb/node-mongodb-native), provides the official MongoDB native driver and APIs.

It wraps some frequently-used API to make it easy to use but keep all properties as it is. For example, to find a document you need this with official API

```js
db.collection('name')
 .find(query)
 .skip(skip)
 .limit(limit)
 .project(project)
 .sort(sort)
 .toArray();
```

and with this plugin

```js
app.mongo.find('name', { query, skip, limit, project, sort });
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

The APIs provided by plugin usually need two arguments. The first is commonly the collection name, and the second is an object keeps the arguments of official API. For example, to insert one document with official API

```js
db.collection('name').insertOne(doc, options);
```

and with plugin API

```js
const args = { doc, options };
app.mongo.insertOne('name', args);
```

The `args` is the object provides the arguments to official API.

Until now, this plugin provides thes APIs

```js
connect()      // you don't need to call
insertOne()
findOneAndUpdate()
findOneAndReplace()
findOneAndDelete()
insertMany()
updateMany()
deleteMany()
find()
count()
distinct()
createIndex()
listCollection()
createCollection()
```

You can always use `app.mongo.db` to call all official APIs. You can check the APIs here: [Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/2.2/api/).

## Promise

`node-mongodb-native` supports Promise, you can call all APIs async or sync.

### Async

```js
// Promise
function create(doc) {
  app.mongo.insertOne('name', { doc })
  .then(result => console.log(result))
  .catch(error => console.error(error));
}
```

### Sync

````js
// async/await
async function create(doc) {
  try {
    const result = await app.mongo.insertOne('name', { doc });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// Generator
function* create(doc) {
  try {
    const result = yield app.mongo.insertOne('name', { doc });
    console.log(result);
  } catch (errpr) {
    console.error(error);
  }
}
````

If you use `app.mongo.db` you could use callback(usually the last argument), but this plugin doesn't supports callback because Promise and async/await are better choice.

## License

[MIT](LICENSE)
