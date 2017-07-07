'use strict';
const EventEmitter = require('events');
const MongoClient = require('mongodb').MongoClient;

class MongoDB extends EventEmitter {
  constructor(options) {
    super();
    let url = 'mongodb://';
    /* istanbul ignore if */
    if (options.user) {
      if (options.password) url += `${options.user}:${options.password}@`;
      else url += `${options.user}@`;
    }
    url += `${options.host}:${options.port}/${options.name}`;

    this.url = url;
    this.db;
  }

  connect() {
    return MongoClient.connect(this.url)
    .then(db => {
      this.db = db;
      Object.freeze(this.db);
      this.emit('connect');
    })
    .catch(/* istanbul ignore next */ error => this.emit('error', error));
  }

  /**
   * Insert one doc to database.
   * @param {string} name - The name of collection to insert.
   * @param {Object} [args] - Arguments.
   * @param {Object} [args.doc] - The doc to insert.
   * @param {Object} [args.options] - Optional settings.
   * @param {number} [args.options.w] -
   * @param {number} [args.options.wtimeout] -
   * @param {boolean} [args.options.j] -
   * @param {boolean} [args.options.serializeFunctions] -
   * @param {boolean} [args.options.forceServerObjectId] -
   * @param {boolean} [args.options.bypassDocumentValidation] -
   * @return {Promise} Promise
   * @return {Object} result
   * @return {number} result.insertedCount
   * @return {string} result.insertedId
   * @return {Object} result.value The inserted document.
   */
  insertOne(name, args = {}) {
    const doc = args.doc || {};
    const options = args.options || {};
    return this.db.collection(name).insertOne(doc, options)
      .then(result => {
        return {
          insertedCount: result.insertedCount,
          insertedId: result.insertedId.toString(),
          value: result.ops[0],
        };
      });
  }

  /**
   * @param {string} name - The name of collection to find.
   * @param {Object} [args] - The arguments of command.
   * @param {Object} [args.filter] - Document selection filter.
   * @param {Object} [args.update] - Update operations to be performed on the document.
   * @param {Object} [args.options] - Optional settings.
   * @param {boolean} [args.options.upsert] - Upsert the document if it does not exist.
   * @param {Object} [args.options.projection] - Limits the fields to return for all matching documents.
   * @param {Object} [args.options.sort] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {Object} [args.options.returnOriginal] - When false, returns the updated document rather than the original. The default is true.
   * @param {Object} [args.options.maxTimeMS] - The maximum amount of time to allow the query to run.
   * @return {Object} result
   * @return {number} result.ok - 1: Success
   * @return {Object} result.value - The updated document or null when find nothing.
   * @return {Object} result.lastErrorObject
   * @return {boolean} result.lastErrorObject.updatedExisting
   * @return {number} result.lastErrorObject.n - The amount of update documents.
   */
  findOneAndUpdate(name, args = {}) {
    const filter = args.filter || {};
    const update = args.update || {};
    const options = args.options || {};
    options.sort = (args.options && args.options.sort) ? args.options.sort : { _id: -1 };
    return this.db.collection(name).findOneAndUpdate(filter, update, options);
  }

  /**
   * @param {string} name - The name of collection to find.
   * @param {Object} args - The arguments of command.
   * @param {Object} args.filter - Document selection filter.
   * @param {Object} args.replacement - Document replacing the matching document.
   * @param {Object} [args.options] - Optional settings.
   * @param {boolean} [args.options.upsert] - Upsert the document if it does not exist.
   * @param {Object} [args.options.projection] - Limits the fields to return for all matching documents.
   * @param {Object} [args.options.sort] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {Object} [args.options.returnOriginal] - When false, returns the updated document rather than the original. The default is true.
   * @param {Object} [args.options.maxTimeMS] - The maximum amount of time to allow the query to run.
   *
   * @return {Object} result
   * @return {number} result.ok - 1: Success
   * @return {Object} result.value - The replaced document or null when find nothing.
   * @return {Object} result.lastErrorObject
   * @return {boolean} result.lastErrorObject.updatedExisting
   * @return {number} result.lastErrorObject.n - The amount of replaced documents.
   */
  findOneAndReplace(name, args = {}) {
    const filter = args.filter || {};
    const replacement = args.replacement || {};
    const options = (args.options) ? args.options : { sort: { _id: 1 } };
    return this.db.collection(name)
        .findOneAndReplace(filter, replacement, options);
  }

  /**
   * @param {string} name - The name of collection to find.
   * @param {Object} args - The arguments of command.
   * @param {Object} args.filter - Document selection filter.
   * @param {Object} [args.options] - Optional settings.
   * @param {Object} [args.options.projection] - Limits the fields to return for all matching documents.
   * @param {Object} [args.options.sort] - Determines which document the operation modifies if the query selects multiple documents.
   * @param {Object} [args.options.maxTimeMS] - The maximum amount of time to allow the query to run.
   * @return {Object} result
   * @return {number} result.ok - 1: Success
   * @return {Object} result.value - Value of deleted document.
   * @return {Object} result.lastErrorObject - Property n is the count of deleted document.
   */
  findOneAndDelete(name, args = {}) {
    const filter = args.filter;
    const options = (args.options) ? args.options : { sort: { _id: -1 } };
    return this.db.collection(name)
        .findOneAndDelete(filter, options);
  }

  /**
   * Insert docs to database.
   * @param {string} name - The name of collection to insert.
   * @param {Object} args - Arguments.
   * @param {Object[]} args.docs - The docs to insert.
   * @param {Object} [args.options] - Optional settings.
   * @param {number} [args.options.w] -
   * @param {number} [args.options.wtimeout] -
   * @param {boolean} [args.options.j] -
   * @param {boolean} [args.options.serializeFunctions] -
   * @param {boolean} [args.options.forceServerObjectId] -
   * @param {boolean} [args.options.bypassDocumentValidation] -
   * @return {Object} result
   * @return {number} result.insertedCount
   * @return {string[]} result.insertedIds
   * @return {Object[]} result.value The inserted documents.
   */
  insertMany(name, args) {
    const docs = args.docs;
    const options = args.options;
    return this.db.collection(name).insertMany(docs, options)
      .then(result => {
        return {
          insertedCount: result.insertedCount,
          insertedIds: result.insertedIds,
          value: result.ops,
        };
      });
  }

  /**
   * @param {string} name - The name of collection.
   * @param {Object} args - The arguments of command.
   * @param {Object} [args.filter] - The Filter used to select the document to update.
   * @param {Object} args.update - The update operations to be applied to the document.
   * @param {Object} [args.options] - Optional settings.
   * @param {boolean} [args.options.upsert] - Update operation is an upsert.
   * @param {(number|string)} [args.options.w] - The write concern.
   * @param {number} [args.options.wtimeout] - The write concern timeout.
   * @param {boolean} [args.options.j] - Specify a journal write concern.
   * @return {Object} result
   * @return {number} result.matchedCount
   * @return {number} result.modifiedCount
   * @return {number} result.upsertedCount
   * @return {Object} result.upsertedId
   * @return {number} result.upsertedId.index
   * @return {string} result.upsertedId._id
   */
  updateMany(name, args = {}) {
    const filter = args.filter || {};
    const update = args.update || {};
    const options = args.options || {};
    return this.db.collection(name).updateMany(filter, update, options)
      .then(result => {
        return {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          upsertedId: result.upsertedId,
        };
      });
  }

  /**
   * @param {string} name - The name of collection.
   * @param {Object} [args] - The arguments of command.
   * @param {Object} [args.filter] - The Filter used to select the documents to remove.
   * @param {Object} [args.options] - Optional settings.
   * @param {(number|string)} [args.options.w] - The write concern.
   * @param {number} [args.options.wtimeout] - The write concern timeout.
   * @param {boolean} [args.options.j] - Specify a journal write concern.
   * @return {number} deletedCount
   */
  deleteMany(name, args = {}) {
    const filter = args.filter || {};
    const options = args.options || {};
    return this.db.collection(name).deleteMany(filter, options)
      .then(result => result.deletedCount);
  }

  /**
   * @param {string} name - The name of collection to find.
   * @param {Object} [args] - The arguments of find command.
   * @param {Object} [args.query] - The cursor query object.
   * @param {number} [args.skip] - The skip for the cursor query.
   * @param {number} [args.limit] - The limit for the cursor query.
   * @param {Object} [args.project] - The field projection object.
   * @param {Object} [args.sort] - The sort for the cursor query.
   * @param {string} [args.sort.key] - The key or keys set for the sort.
   * @param {number} [args.sort.direction] - The direction of the sorting (1 or -1).
   * @return {Object[]} result
   */
  find(name, args = {}) {
    const query = args.query || {};
    const skip = args.skip || 0;
    const limit = args.limit || 0;
    const project = args.project || {};
    const sort = args.sort || { _id: -1 };
    return this.db.collection(name)
      .find(query)
      .skip(skip)
      .limit(limit)
      .project(project)
      .sort(sort)
      .toArray();
  }

  /**
   * Count number of matching documents in the db to a query.
   * @param {string} name - The name of collection to find.
   * @param {Object} args - The arguments of find command.
   * @param {Object} args.query - The query for the count.
   * @param {Object} [args.options] - Optional settings.
   * @param {number} [args.options.limit] - The limit of documents to count.
   * @param {number} [args.options.skip] - The number of documents to skip for the count.
   * @param {string} [args.options.hint] - An index name hint for the query.
   * @param {(ReadPreference|string)} [args.options.readPreference] -The preferred read preference (
   * ReadPreference.PRIMARY,
   * ReadPreference.PRIMARY_PREFERRED,
   * ReadPreference.SECONDARY,
   * ReadPreference.SECONDARY_PREFERRED,
   * ReadPreference.NEAREST).
   * @return {number} result
   **/
  count(name, args = {}) {
    const query = args.query || {};
    const options = args.options || {};
    return this.db.collection(name).count(query, options);
  }

  /**
   * The distinct command returns returns a list of distinct values for the given key across a collection.
   * @param {string} name - The name of collection to find.
   * @param {Object} [args] - The arguments of find command.
   * @param {string} [args.key] - Field of the document to find distinct values for.
   * @param {Object} [args.query] - The query for filtering the set of documents to which we apply the distinct filter.
   * @param {Object} [args.options] - Optional settings.
   * @param {(ReadPreference|string)} [args.options.readPreference] -The preferred read preference (
   * ReadPreference.PRIMARY,
   * ReadPreference.PRIMARY_PREFERRED,
   * ReadPreference.SECONDARY,
   * ReadPreference.SECONDARY_PREFERRED,
   * ReadPreference.NEAREST).
   * @return {Object[]} result
   */
  distinct(name, args = {}) {
    const key = args.key || '';
    const query = args.query || {};
    const options = args.options || {};
    return this.db.collection(name).distinct(key, query, options);
  }

  /**
   * @param {string} name - The name of collection.
   * @param {Object} args - Arguments.
   * @param {(Object|string)} args.fieldOrSpec - Defines the index.
   * @param {(number|string)} [args.options.w] - The write concern.
   * @param {number} [args.options.wtimeout] - The write concern timeout.
   * @param {boolean} [args.options.j] - Specify a journal write concern.
   * @param {boolean} [args.options.unique] - Creates an unique index.
   * @param {boolean} [args.options.sparse] - Creates a sparse index.
   * @param {boolean} [args.options.background] - Creates the index in the background, yielding whenever possible.
   * @param {boolean} [args.options.dropDups] - A unique index cannot be created on a key that has pre-existing duplicate values.
   * If you would like to create the index anyway,
   * keeping the first document the database indexes
   * and deleting all subsequent documents that have duplicate value.
   * @param {number} [args.options.min] - For geospatial indexes set the lower bound for the co-ordinates.
   * @param {number} [args.options.max] - For geospatial indexes set the high bound for the co-ordinates.
   * @param {number} [args.options.v] - Specify the format version of the indexes.
   * @param {number} [args.options.expireAfterSeconds] - Allows you to expire data on indexes applied to a data (MongoDB 2.2 or higher).
   * @param {number} [args.options.name] - Override the autogenerated index name (useful if the resulting name is larger than 128 bytes).
   * @return {Promise} - Promise
   */
  createIndex(name, args = {}) {
    const fieldOrSpec = args.fieldOrSpec;
    const options = args.options || {};
    return this.db.collection(name).createIndex(fieldOrSpec, options);
  }

  /**
   * @param {Object} [args] - Arguments.
   * @param {Object} [args.filter] - Query to filter collections by
   * @param {Object} [args.options] - Optional settings.
   *
   * @return {string[]} result - Array of collections name.
   */
  listCollections(args = {}) {
    const filter = args.filter || {};
    const options = args.options || {};
    return this.db.listCollections(filter, options)
      .toArray()
      .then(result => result.map(col => col.name));
  }

  /**
   * @param {Object} args - Arguments.
   * @param {string} args.name - The collection name we wish to access.
   * @param {Object} [args.options] - Optional settings.
   * @param {(number|string)} [args.options.w] - The write concern.
   * @param {number} [args.options.wtimeout] - The write concern timeout.
   * @param {boolean} [args.options.j] - Specify a journal write concern.
   * @param {boolean} [args.options.raw] - Return document results as raw BSON buffers.
   * @param {Object} [args.options.pkFactory] - A primary key factory object for generation of custom _id keys.
   * @param {(ReadPreference|string)} [args.options.readPreference] - The preferred read preference (
   * ReadPreference.PRIMARY,
   * ReadPreference.PRIMARY_PREFERRED,
   * ReadPreference.SECONDARY,
   * ReadPreference.SECONDARY_PREFERRED,
   * ReadPreference.NEAREST).
   * @param {boolean} [args.options.serializeFunctions] - Serialize functions on any object.
   * @param {boolean} [args.options.strict] - Returns an error if the collection does not exist.
   * @param {boolean} [args.options.capped] - Create a capped collection.
   * @param {number} [args.options.size] - The size of the capped collection in bytes.
   * @param {number} [args.options.max] - The maximum number of documents in the capped collection.
   * @param {number} [args.options.autoIndexId] - Create an index on the _id field of the document,
   * True by default on MongoDB 2.2 or higher off for version < 2.2.
   * @return {Promise} - Promise
   */
  createCollection(args = {}) {
    const name = args.name;
    const options = args.options || {};
    return this.db.createCollection(name, options);
  }
}

module.exports = MongoDB;
