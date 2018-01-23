[**中文版**](https://github.com/brickyang/egg-mongo/blob/master/README.zh_CN.md)

This plugin base on
[node-mongodb-native](https://github.com/mongodb/node-mongodb-native), provides
the official MongoDB native driver and APIs.

It wraps some frequently-used API to make it easy to use but keep all properties
as it is. For example, to find a document you need this with official API

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

and with this plugin

```js
app.mongo.find('name', { query, skip, limit, project, sort });
```

## Install

```bash
$ npm i egg-mongo-native@release-2 --save
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
  },
};
```

### Replica Set (v2.1.0 or higher)

```js
// mongodb://host1:port1,host2:port2/name?replicaSet=test
exports.mongo = {
  client: {
    host: 'host1, host2',
    port: 'port1, port2',
    name: 'name',
    option: {
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
    option: {
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
      option: {},
    },
    db2: {
      host: 'host',
      port: 'port',
      name: 'db2',
      user: 'user',
      password: 'password',
      option: {},
    },
  },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

The APIs provided by plugin usually need two arguments. The first is commonly
the collection name, and the second is an object keeps the arguments of official
API. For example, to insert one document with official API

```js
db.collection('name').insertOne(doc, options);
```

and with plugin API

```js
const args = { doc, options };
app.mongo.insertOne('name', args);
```

Multiple Instances

```js
const args = { doc, options };
app.mongo.get('db1').insertOne('name', args);
```

The `args` is the object provides the arguments to official API.

Until now, this plugin provides thes APIs

```js
connect(); // you don't need to call
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
aggregate(); // v2.2.0 above
```

You can always use `app.mongo.db` to call all official APIs. You can check the
APIs here:
[Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/2.2/api/).

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
