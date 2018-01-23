'use strict';
const EventEmitter = require('events');
const { MongoClient } = require('mongodb');
// const assert = require('assert');

const MAKEURL = Symbol('makeURI');

class MongoDB extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.url = this[MAKEURL](config);
    this.clientOptions = config.options || {};
    this.db;
  }

  [MAKEURL](config) {
    let url = 'mongodb://';
    /* istanbul ignore if */
    if (config.user) {
      if (config.password) url += `${config.user}:${config.password}@`;
      else url += `${config.user}@`;
    }

    const host = config.host.toString().split(',');
    const port = config.port.toString().split(',');
    const { option } = config;

    if (host.length > 1 && host.length !== port.length) {
      const errMsg =
        'The host and port do not match. Please check your config.';
      return this.emit('error', errMsg);
    }

    const hostLen = host.length;
    const portLen = port.length;
    for (let i = 0; i < portLen; i++) {
      let h = '';
      if (hostLen === 1) h = host[0];
      else h = host[i];

      url += `${h}:${port[i]},`;
    }

    url = url.slice(0, -1);
    url += `/${config.name}`;

    if (option) {
      let uriOp = '?';
      Object.keys(option).forEach(key => (uriOp += `${key}=${option[key]}`));
      url += uriOp;
    }

    return url;
  }

  /**
   * Connect to MongoDB using a url as documented at
   * docs.mongodb.org/manual/reference/connection-string/
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html#.connect
   *
   * @return {Promise<void>} -
   */
  connect() {
    return MongoClient.connect(this.url, this.clientOptions)
      .then(client => {
        this.db = client.db(this.config.name);
        Object.freeze(this.db);
        this.emit('connect');
      })
      .catch(/* istanbul ignore next */ error => this.emit('error', error));
  }

  /**
   * Inserts a single document into MongoDB. If documents passed in do not contain the _id field,
   * one will be added to each of the documents missing it by the driver, mutating the document.
   * This behavior can be overridden by setting the forceServerObjectId flag.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#insertOne
   *
   * @param {string} name - The name of collection to insert.
   * @param {object} [doc={}] - The doc to insert.
   * @param {object} [options=null] - Optional settings.
   * @param {number|string} [options.w=null] - The write concern.
   * @param {number} [options.wtimeout=null] - The write concern timeout.
   * @param {boolean} [options.j=false] - Specify a journal write concern.
   * @param {boolean} [options.serializeFunctions=false] - Serialize functions on any object.
   * @param {boolean} [options.forceServerObjectId=false] - Force server to assign _id values instead of driver.
   * @param {boolean} [options.bypassDocumentValidation=false] - Allow driver to bypass schema validation in MongoDB 3.2 or higher.
   * @param {ClientSession} [options.session] - optional session to use for this operation.
   *
   * @return {Promise<Object>} insertOneWriteOpResult
   * @return {number} insertOneWriteOpResult.insertedCount
   * @return {object[]} insertOneWriteOpResult.ops - All the documents inserted.
   * Documents contain the _id field if forceServerObjectId == false.
   * @return {ObjectId} insertOneWriteOpResult.insertedId
   * @return {object} insertOneWriteOpResult.connection - The connection object used for the operation.
   * @return {object} insertOneWriteOpResult.result - The raw command result object returned from MongoDB (content might vary by server version).
   * @return {number} insertOneWriteOpResult.result.ok - Is 1 if the command executed correctly.
   * @return {number} insertOneWriteOpResult.result.n - The total count of documents inserted.
   */
  insertOne(name, doc = {}, options) {
    return this.db.collection(name).insertOne(doc, options);
  }

  /**
   * Inserts an array of documents into MongoDB. If documents passed in do not contain the _id field,
   * one will be added to each of the documents missing it by the driver, mutating the document.
   * This behavior can be overridden by setting the forceServerObjectId flag.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#insertMany
   *
   * @param {string} name - The name of collection to insert.
   * @param {object[]} docs - The docs to insert.
   * @param {object} [options=null] - Optional settings.
   * @param {number|string} [options.w=null] -
   * @param {number} [options.wtimeout=null] -
   * @param {boolean} [options.j=false] -
   * @param {boolean} [options.serializeFunctions=false] -
   * @param {boolean} [options.forceServerObjectId=false] -
   * @param {boolean} [options.bypassDocumentValidation=false] -
   * @param {boolean} [options.ordered=true] -
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<Object>} insertOneWriteOpResult
   * @return {number} insertOneWriteOpResult.insertedCount
   * @return {object[]} insertOneWriteOpResult.ops - All the documents inserted.
   * Documents contain the _id field if forceServerObjectId == false.
   * @return {ObjectId[]} insertOneWriteOpResult.insertedIds
   * @return {object} insertOneWriteOpResult.result - The raw command result object returned from MongoDB (content might vary by server version).
   * @return {number} insertOneWriteOpResult.result.ok - Is 1 if the command executed correctly.
   * @return {number} insertOneWriteOpResult.result.n - The total count of documents inserted.
   */
  insertMany(name, docs, options) {
    return this.db.collection(name).insertMany(docs, options);
  }

  static getFindAndModifyOptions(options) {
    return Object.assign({ sort: { _id: -1 } }, options);
  }

  /**
   * Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findOneAndUpdate
   * @param {string} name - The name of collection to find.
   * @param {object} filter - Document selection filter.
   * @param {object} update - Update operations to be performed on the document.
   * @param {object} [options={}] - Optional settings.
   * @param {object} [options.projection=null] - Limits the fields to return for all matching documents.
   * @param {object} [options.sort={_id: -1}] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {object} [options.maxTimeMS=null] - The maximum amount of time to allow the query to run.
   * @param {boolean} [options.upsert=false] - Upsert the document if it does not exist.
   * @param {object} [options.returnOriginal=true] - When false, returns the updated document rather than the original. The default is true.
   * @param {ClientSession} [options.session] -
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~findAndModifyWriteOpResult
   * @return {Promise<object>} findAndModifyWriteOpResult
   * @return {object} findAndModifyWriteOpResult.value - Document returned from findAndModify command.
   * @return {number} findAndModifyWriteOpResult.ok - Is 1 if the command executed correctly.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject
   * @return {boolean} findAndModifyWriteOpResult.lastErrorObject.updatedExisting - Contains true if an update operation modified an existing document.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject.upserted - Contains the ObjectId of the inserted document if an update operation with upsert: true resulted in a new document.
   * @return {number} findAndModifyWriteOpResult.lastErrorObject.n - The amount of update documents.
   */
  findOneAndUpdate(name, filter, update, options) {
    options = this.constructor.getFindAndModifyOptions(options);

    return this.db.collection(name).findOneAndUpdate(filter, update, options);
  }

  /**
   * @param {string} name - The name of collection to find.
   * @param {object} filter - Document selection filter.
   * @param {object} replacement - Document replacing the matching document.
   * @param {object} [options=null] - Optional settings.
   * @param {object} [options.projection=null] - Limits the fields to return for all matching documents.
   * @param {object} [options.sort={_id: -1}] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {object} [options.maxTimeMS=null] - The maximum amount of time to allow the query to run.
   * @param {boolean} [options.upsert=false] - Upsert the document if it does not exist.
   * @param {object} [options.returnOriginal=true] - When false, returns the updated document rather than the original. The default is true.
   * @param {ClientSession} [options.session] -
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~findAndModifyWriteOpResult
   * @return {Promise<object>} findAndModifyWriteOpResult
   * @return {object} findAndModifyWriteOpResult.value - Document returned from findAndModify command.
   * @return {number} findAndModifyWriteOpResult.ok - Is 1 if the command executed correctly.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject
   * @return {boolean} findAndModifyWriteOpResult.lastErrorObject.updatedExisting - Contains true if an update operation modified an existing document.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject.upserted - Contains the ObjectId of the inserted document if an update operation with upsert: true resulted in a new document.
   * @return {number} findAndModifyWriteOpResult.lastErrorObject.n - The amount of update documents.
   */
  findOneAndReplace(name, filter, replacement, options) {
    options = this.constructor.getFindAndModifyOptions(options);

    return this.db
      .collection(name)
      .findOneAndReplace(filter, replacement, options);
  }

  /**
   * Find a document and delete it in one atomic operation, requires a write lock for the duration of the operation.
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findOneAndDelete
   *
   * @param {string} name - The name of collection to find.
   * @param {object} filter - Document selection filter.
   * @param {object} [options=null] - Optional settings.
   * @param {object} [options.projection=null] - Limits the fields to return for all matching documents.
   * @param {object} [options.sort=null] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {object} [options.maxTimeMS=null] - The maximum amount of time to allow the query to run.
   * @param {ClientSession} [options.session] -
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~findAndModifyWriteOpResult
   * @return {Promise<object>} findAndModifyWriteOpResult
   * @return {object} findAndModifyWriteOpResult.value - Document returned from findAndModify command.
   * @return {number} findAndModifyWriteOpResult.ok - Is 1 if the command executed correctly.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject
   * @return {boolean} findAndModifyWriteOpResult.lastErrorObject.updatedExisting - Contains true if an update operation modified an existing document.
   * @return {object} findAndModifyWriteOpResult.lastErrorObject.upserted - Contains the ObjectId of the inserted document if an update operation with upsert: true resulted in a new document.
   * @return {number} findAndModifyWriteOpResult.lastErrorObject.n - The amount of update documents.
   */
  findOneAndDelete(name, filter, options) {
    options = this.constructor.getFindAndModifyOptions(options);

    return this.db.collection(name).findOneAndDelete(filter, options);
  }

  /**
   * Update multiple documents on MongoDB.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#updateMany
   *
   * @param {string} name - The name of collection.
   * @param {object} filter - The Filter used to select the document to update.
   * @param {object} update - The update operations to be applied to the document.
   * @param {object} [options=null] - Optional settings.
   * @param {boolean} [options.upsert=false] - Update operation is an upsert.
   * @param {(number|string)} [options.w=null] - The write concern.
   * @param {number} [options.wtimeout=null] - The write concern timeout.
   * @param {boolean} [options.j=false] - Specify a journal write concern.
   * @param {ClientSession} [options.session] -
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~updateWriteOpResult
   * @return {Promise<object>} updateWriteOpResult
   * @return {object} updateWriteOpResult.connection
   * @return {number} updateWriteOpResult.matchedCount
   * @return {number} updateWriteOpResult.modifiedCount
   * @return {number} updateWriteOpResult.upsertedCount
   * @return {object} updateWriteOpResult.upsertedId
   * @return {ObjectId} updateWriteOpResult.upsertedId._id
   * @return {object} updateWriteOpResult.result
   * @return {number} updateWriteOpResult.result.ok
   * @return {number} updateWriteOpResult.result.n
   * @return {objnumberect} updateWriteOpResult.result.nModified
   */
  updateMany(name, filter, update, options) {
    return this.db.collection(name).updateMany(filter, update, options);
  }

  /**
   * Delete multiple documents on MongoDB.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#deleteMany
   *
   * @param {string} name - The name of collection.
   * @param {object} filter - The Filter used to select the documents to remove.
   * @param {object} [options=null] - Optional settings.
   * @param {(number|string)} [options.w=null] - The write concern.
   * @param {number} [options.wtimeout=null] - The write concern timeout.
   * @param {boolean} [options.j=false] - Specify a journal write concern.
   * @param {ClientSession} [options.session] -
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#~deleteWriteOpResult
   * @return {Promise<object>} deleteWriteOpResult
   * @return {number} deleteWriteOpResult.deletedCount
   * @return {object} deleteWriteOpResult.connection
   * @return {object} deleteWriteOpResult.result
   * @return {number} deleteWriteOpResult.result.ok
   * @return {number} deleteWriteOpResult.result.n
   */
  deleteMany(name, filter, options) {
    return this.db.collection(name).deleteMany(filter, options);
  }

  /**
   * Find documents.
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#find
   *
   * @param {string} name - The name of collection to find.
   * @param {object} [query={}] - The cursor query object.
   * @param {object} [options] -
   * @param {number} [options.limit=0] - The limit for the cursor query.
   * @param {object} [options.sort={ _id: -1 }] - The sort for the cursor query.
   * @param {object} [options.projection=null] - The field projection object.
   * @param {number} [options.skip=0] - The skip for the cursor query.
   * @param {object} [options.hint=null] -
   * @param {boolean} [options.explain=false] -
   * @param {boolean} [options.snapshot=false] -
   * @param {boolean} [options.timeout=false] -
   * @param {boolean} [options.tailable=false] -
   * @param {number} [options.batchSize=0] -
   * @param {boolean} [options.returnKey=false] -
   * @param {number} [options.returnKeymaxScan=null] -
   * @param {number} [options.min=null] -
   * @param {number} [options.max=null] -
   * @param {boolean} [options.showDiskLoc=false] -
   * @param {string} [options.comment=null] -
   * @param {boolean} [options.raw=false] -
   * @param {boolean} [options.promoteLongs=true] -
   * @param {boolean} [options.promoteValues=true] -
   * @param {boolean} [options.promoteBuffers=false] -
   * @param {ReadPreference|string} [options.readPreference=null] -
   * @param {boolean} [options.partial=false] -
   * @param {number} [options.maxTimeMS=null] -
   * @param {object} [options.collation=null] -
   * @param {ClientSession} [options.session] -
   * @param {boolean} [returnCursor=false] - Return find cursor instead of array if Ture.
   *
   * @return {Promise<object[]|Cursor>} result
   */
  async find(name, query = {}, options, returnCursor = false) {
    options = Object.assign({ sort: { _id: -1 } }, options);

    const cursor = await this.db.collection(name).find(query, options);
    return returnCursor ? cursor : cursor.toArray();
  }

  /**
   * Count number of matching documents in the db to a query.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#count
   *
   * @param {string} name - The name of collection to find.
   * @param {object} [query={}] - The query for the count.
   * @param {object} [options=null] - Optional settings.
   * @param {number} [options.limit=0] - The limit of documents to count.
   * @param {number} [options.skip=0] - The number of documents to skip for the count.
   * @param {string} [options.hint=null] - An index name hint for the query.
   * @param {(ReadPreference|string)} [options.readPreference=null] -The preferred read preference
   * @param {number} [options.maxTimeMS=null] - Number of miliseconds to wait before aborting the query.
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<number>} result
   */
  count(name, query, options) {
    return this.db.collection(name).count(query, options);
  }

  /**
   * The distinct command returns a list of distinct values for the given key across a collection.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#distinct
   *
   * @param {string} name - The name of collection to find.
   * @param {string} key - Field of the document to find distinct values for.
   * @param {object} [query={}] - The query for filtering the set of documents to which we apply the distinct filter.
   * @param {object} [options=null] - Optional settings.
   * @param {(ReadPreference|string)} [options.readPreference=null] -The preferred read preference
   * @param {number} [options.maxTimeMS=null] - Number of miliseconds to wait before aborting the query.
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<object[]>} result
   */
  distinct(name, key, query = {}, options) {
    return this.db.collection(name).distinct(key, query, options);
  }

  /**
   * Creates an index on the db and collection collection.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#createIndex
   *
   * @param {string} name - The name of collection.
   * @param {(object|string)} fieldOrSpec - Defines the index.
   * @param {object} [options=null] -
   * @param {(number|string)} [options.w=null] - The write concern.
   * @param {number} [options.wtimeout=null] - The write concern timeout.
   * @param {boolean} [options.j=false] - Specify a journal write concern.
   * @param {boolean} [options.unique=false] - Creates an unique index.
   * @param {boolean} [options.sparse=false] - Creates a sparse index.
   * @param {boolean} [options.background=false] - Creates the index in the background, yielding whenever possible.
   * @param {boolean} [options.dropDups=false] - A unique index cannot be created on a key that has pre-existing duplicate values.
   * If you would like to create the index anyway,
   * keeping the first document the database indexes
   * and deleting all subsequent documents that have duplicate value.
   * @param {number} [options.min=null] - For geospatial indexes set the lower bound for the co-ordinates.
   * @param {number} [options.max=null] - For geospatial indexes set the high bound for the co-ordinates.
   * @param {number} [options.v=null] - Specify the format version of the indexes.
   * @param {number} [options.expireAfterSeconds=null] - Allows you to expire data on indexes applied to a data (MongoDB 2.2 or higher).
   * @param {string} [options.name=null] - Override the autogenerated index name (useful if the resulting name is larger than 128 bytes).
   * @param {object} [options.partialFilterExpression=null] - Override the autogenerated index name (useful if the resulting name is larger than 128 bytes).
   * @param {object} [options.collation=null] - Override the autogenerated index name (useful if the resulting name is larger than 128 bytes).
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<object>} - Promise
   */
  createIndex(name, fieldOrSpec, options) {
    return this.db.collection(name).createIndex(fieldOrSpec, options);
  }

  /**
   * Get the list of all collection information for the specified db.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#listCollections
   *
   * @param {object} [filter={}] - Query to filter collections by
   * @param {object} [options={}] - Optional settings.
   * @param {number} [options.batchSize=null] - The batchSize for the returned command cursor or if pre 2.8 the systems batch collection.
   * @param {ReadPreference|string} [options.readPreference=null] -
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<string[]>} result - Array of collections name.
   */
  listCollections(filter, options) {
    return this.db
      .listCollections(filter, options)
      .toArray()
      .then(result => result.map(col => col.name));
  }

  /**
   * Create a new collection on a server with the specified options. Use this to create capped collections.
   * More information about command options available at https://docs.mongodb.com/manual/reference/command/create/
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
   *
   * @param {string} name - The collection name we wish to access.
   * @param {object} [options=null] - Optional settings.
   * @param {(number|string)} [options.w=null] - The write concern.
   * @param {number} [options.wtimeout=null] - The write concern timeout.
   * @param {boolean} [options.j=false] - Specify a journal write concern.
   * @param {boolean} [options.raw=false] - Return document results as raw BSON buffers.
   * @param {object} [options.pkFactory=null] - A primary key factory object for generation of custom _id keys.
   * @param {(ReadPreference|string)} [options.readPreference=null] - The preferred read preference
   * @param {boolean} [options.serializeFunctions=false] - Serialize functions on any object.
   * @param {boolean} [options.strict=false] - Returns an error if the collection does not exist.
   * @param {boolean} [options.capped=false] - Create a capped collection.
   * @param {boolean} [options.autoIndexId=true] - Create an index on the _id field of the document,
   * @param {number} [options.size=null] - The size of the capped collection in bytes.
   * @param {number} [options.max=null] - The maximum number of documents in the capped collection.
   * @param {number} [options.flags=null] - The maximum number of documents in the capped collection.
   * @param {object} [options.storageEngine=null] -
   * @param {object} [options.validator=null] -
   * @param {string} [options.validationLevel=null] -
   * @param {string} [options.validationAction=null] -
   * @param {string} [options.indexOptionDefaults=null] -
   * @param {string} [options.viewOn=null] -
   * @param {object[]} [options.pipeline=null] -
   * @param {object} [options.collation=null] -
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<Collection>} - collection
   */
  createCollection(name, options) {
    return this.db.createCollection(name, options);
  }

  /**
   * Execute an aggregation framework pipeline against the collection.
   *
   * @see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#aggregate
   *
   * @param {string} name - Collection name.
   * @param {object[]} pipeline - Array containing all the aggregation framework commands for the execution.
   * @param {object} [options=null] -
   * @param {ReadPreference|string} [options.readPreference=null] -
   * @param {object} [options.cursor=null] - Return the query as cursor.
   * @param {number} [options.cursor.batchSize=null] -
   * @param {boolean} [options.explain=false] -
   * @param {boolean} [options.allowDiskUse=false] -
   * @param {number} [options.maxTimeMS=null] -
   * @param {boolean} [options.bypassDocumentValidation=false] -
   * @param {boolean} [options.raw=false] -
   * @param {boolean} [options.promoteLongs=true] -
   * @param {boolean} [options.promoteValues=true] -
   * @param {boolean} [options.promoteBuffers=false] -
   * @param {object} [options.collation=null] -
   * @param {string} [options.comment] -
   * @param {ClientSession} [options.session] -
   *
   * @return {Promise<object[]>} result
   */
  aggregate(name, pipeline, options) {
    return this.db
      .collection(name)
      .aggregate(pipeline, options)
      .toArray();
  }
}

module.exports = MongoDB;
