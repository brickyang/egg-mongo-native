'use strict';
const mm = require('egg-mock');
const assert = require('assert');
const { ObjectID } = require('mongodb');

describe('test/mongo.test.js', () => {
  let app;
  let NAME;
  before(async () => {
    NAME = 'test';
    app = mm.app({
      baseDir: 'apps/mongo-test',
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.mongo.deleteMany('test', {});
    mm.restore();
  });

  after(async () => {
    await app.mongo.deleteMany('test', {});
    app.close();
  });

  describe('insertOne()', () => {
    it('should insert success', async () => {
      const result = await app.mongo.insertOne(NAME, { doc: { title: 'new doc' } });
      assert(result.insertedCount === 1);
      assert(typeof result.insertedId === 'string');
      assert(result.value.hasOwnProperty('_id'));
      assert(result.value.hasOwnProperty('title'));
      assert(result.value.title === 'new doc');
    });

    it('should insert empty document success', async () => {
      const result = await app.mongo.insertOne(NAME);
      assert(result.insertedCount === 1);
      assert(typeof result.insertedId === 'string');
      assert(result.value.hasOwnProperty('_id'));
    });
  });

  describe('findOneAndUpdate()', () => {
    let id;
    beforeEach(async () => {
      const result = await app.mongo.insertMany(NAME, {
        docs: [
          { index: 1, title: 'new doc' },
          { index: 2, title: 'new doc' },
          { index: 3, title: 'new doc' },
        ],
      });
      id = result.insertedIds[0].toString();
    });

    it('should update success', async () => {
      const result = await app.mongo.findOneAndUpdate(NAME, {
        filter: { _id: new ObjectID(id) },
        update: { title: 'update doc' },
      });
      assert(result.ok === 1);
      assert(result.value._id.toString() === id);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should update success and return updated', async () => {
      const result = await app.mongo.findOneAndUpdate(NAME, {
        filter: { _id: new ObjectID(id) },
        update: { title: 'update doc' },
        options: { returnOriginal: false },
      });
      assert(result.ok === 1);
      assert(result.value._id.toString() === id);
      assert(result.value.title === 'update doc');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should update success with sort', async () => {
      const result = await app.mongo.findOneAndUpdate(NAME, {
        filter: { _id: new ObjectID(id) },
        update: { title: 'update doc' },
        options: { sort: { _id: 1 } },
      });
      assert(result.ok === 1);
      assert(result.value._id.toString() === id);
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should update success with empty args', async () => {
      const result = await app.mongo.findOneAndUpdate(NAME);
      assert(result.ok === 1);
      assert(result.value.index === 3);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should upsert success', async () => {
      const result = await app.mongo.findOneAndUpdate(NAME, {
        filter: { title: 'upsert' },
        options: { upsert: true, returnOriginal: false },
      });
      assert(result.ok === 1);
      assert(result.value !== null);
      assert(!result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
      assert(result.lastErrorObject.hasOwnProperty('upserted'));
    });
  });

  describe('findOneAndReplace()', () => {
    let id;
    beforeEach(async () => ({ insertedId: id } = await app.mongo.insertOne(NAME, { doc: { title: 'new doc' } })));

    it('should replace success', async () => {
      const result = await app.mongo.findOneAndReplace(NAME, {
        filter: { _id: new ObjectID(id) },
        replacement: { doc: 'replace' },
      });
      assert(result.ok === 1);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should replace success and return replaced', async () => {
      const result = await app.mongo.findOneAndReplace(NAME, {
        filter: { _id: new ObjectID(id) },
        replacement: { doc: 'replace' },
        options: { returnOriginal: false },
      });
      assert(result.ok === 1);
      assert(!result.value.hasOwnProperty('title'));
      assert(result.value.doc === 'replace');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should replace success with empty args', async () => {
      const result = await app.mongo.findOneAndReplace(NAME);
      assert(result.ok === 1);
      assert(result.value._id.toString() === id);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
    });

    it('should upsert success', async () => {
      const result = await app.mongo.findOneAndReplace(NAME, {
        filter: { title: 'upsert' },
        options: { upsert: true, returnOriginal: false },
      });
      assert(result.ok === 1);
      assert(result.value !== null);
      assert(!result.lastErrorObject.updatedExisting);
      assert(result.lastErrorObject.n === 1);
      assert(result.lastErrorObject.hasOwnProperty('upserted'));
    });
  });

  describe('findOneAndDelete()', () => {
    let id;
    beforeEach(async () => {
      const result = await app.mongo.insertMany(NAME, { docs: [
        { title: 'new doc' },
        { title: 'new doc' },
      ] });
      id = result.insertedIds[0].toString();
    });

    it('should delete success', async () => {
      const result = await app.mongo.findOneAndDelete(NAME, {
        filter: { _id: new ObjectID(id) },
      });
      assert(result.ok === 1);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.n === 1);
    });

    it('should delete success with sort', async () => {
      const result = await app.mongo.findOneAndDelete(NAME, {
        filter: {},
        options: { sort: { id: 1 } },
      });
      assert(result.ok === 1);
      assert(result.value._id.toString() === id);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.n === 1);
    });

    it('should delete success with empty filter', async () => {
      const result = await app.mongo.findOneAndDelete(NAME, { filter: {} });
      assert(result.ok === 1);
      assert(result.value._id.toString() !== id);
      assert(result.value.title === 'new doc');
      assert(result.lastErrorObject.n === 1);
    });

    it('should replace fail with empty args', async () => {
      try {
        await app.mongo.findOneAndDelete(NAME);
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe('insertMany()', () => {
    it('should insert success', async () => {
      const result = await app.mongo.insertMany(NAME, {
        docs: [
          { title: 'doc1' },
          { title: 'doc2' },
          { title: 'doc3' },
        ],
      });
      assert(result.insertedCount === 3);
      assert(Array.isArray(result.insertedIds));
      assert(Array.isArray(result.value));
      assert(result.insertedIds.length === 3);
      assert(result.value.length === 3);
    });

    it('should insert fail with empty args', async () => {
      try {
        await app.mongo.insertMany(NAME);
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe('updateMany()', async () => {
    beforeEach(async () => await app.mongo.insertMany(NAME, {
      docs: [
        { title: 'doc1', type: 'doc' },
        { title: 'doc2', type: 'doc' },
        { title: 'doc3', type: 'text' },
        { title: 'doc4', type: 'text' },
      ],
    }));

    afterEach(async () => await app.mongo.deleteMany(NAME, {}));

    it('should update success', async () => {
      const result = await app.mongo.updateMany(NAME, {
        filter: { type: 'doc' },
        update: { $set: { type: 'update' } },
      });
      assert(result.matchedCount === 2);
      assert(result.modifiedCount === 2);
      assert(result.upsertedCount === 0);
      assert(result.upsertedId === null);
    });

    it('should update success all doc', async () => {
      const result = await app.mongo.updateMany(NAME, {
        update: { $set: { type: 'update' } },
      });
      assert(result.matchedCount === 4);
      assert(result.modifiedCount === 4);
      assert(result.upsertedCount === 0);
      assert(result.upsertedId === null);
    });

    it('should update fail with no update', async () => {
      try {
        await app.mongo.updateMany(NAME, { filter: { type: 'doc' } });
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it('should update fail with empty args', async () => {
      try {
        await app.mongo.updateMany(NAME);
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it('should upsert success', async () => {
      const result = await app.mongo.updateMany(NAME, {
        filter: { doc: 'doc5' },
        update: { $set: { type: 'update' } },
        options: { upsert: true },
      });
      assert(result.matchedCount === 0);
      assert(result.modifiedCount === 0);
      assert(result.upsertedCount === 1);
      assert(result.upsertedId.index === 0);
      assert(result.upsertedId._id instanceof ObjectID);
    });
  });

  describe('deleteMany()', () => {
    beforeEach(async () => await app.mongo.insertMany(NAME, {
      docs: [
        { title: 'doc1', type: 'doc' },
        { title: 'doc2', type: 'doc' },
        { title: 'doc3', type: 'text' },
        { title: 'doc4', type: 'text' },
      ],
    }));

    afterEach(async () => await app.mongo.deleteMany(NAME, {}));

    it('should delete success', async () => {
      const result = await app.mongo.deleteMany(NAME, {
        filter: { type: 'doc' },
      });
      assert(result === 2);
    });

    it('should delete all success', async () => {
      const result = await app.mongo.deleteMany(NAME);
      assert(result === 4);
    });
  });

  describe('find()', () => {
    beforeEach(async () => await app.mongo.insertMany(NAME, {
      docs: [
        { index: 1, type: 'doc' },
        { index: 2, type: 'doc' },
        { index: 3, type: 'doc' },
      ],
    }));

    it('should find success', async () => {
      const result = await app.mongo.find(NAME, {
        query: { type: 'doc' },
      });
      assert(Array.isArray(result));
      assert(result.length === 3);
    });

    it('should find success with limit', async () => {
      const result = await app.mongo.find(NAME, { limit: 1 });
      assert(Array.isArray(result));
      assert(result.length === 1);
    });

    it('should find success with skip', async () => {
      const result = await app.mongo.find(NAME, { skip: 1 });
      assert(Array.isArray(result));
      assert(result.length === 2);
    });

    it('should find success with project', async () => {
      const result = await app.mongo.find(NAME, { project: { index: 1 } });
      assert(result[0].hasOwnProperty('index'));
      assert(!result[0].hasOwnProperty('type'));
    });

    it('should find success with sort', async () => {
      const result = await app.mongo.find(NAME, { sort: { index: -1 } });
      assert(result[0].index > result[1].index);
      assert(result[1].index > result[2].index);
    });

    it('should find success with empty args', async () => {
      const result = await app.mongo.find(NAME);
      assert(Array.isArray(result));
      assert(result.length === 3);
    });
  });

  describe('count()', () => {
    beforeEach(async () => await app.mongo.insertMany(NAME, {
      docs: [
        { type: 'doc' },
        { type: 'doc' },
        { type: 'text' },
        { type: 'text' },
      ],
    }));

    it('should count success', async () => {
      const result = await app.mongo.count(NAME, {
        query: { type: 'doc' },
      });
      assert(result === 2);
    });

    it('should count all success', async () => {
      const result = await app.mongo.count(NAME);
      assert(result === 4);
    });
  });

  describe('distinct()', () => {
    beforeEach(async () => await app.mongo.insertMany(NAME, {
      docs: [
        { type: 'doc' },
        { type: 'doc' },
        { type: 'text' },
        { type: 'text' },
      ],
    }));

    it('should distinct success', async () => {
      const result = await app.mongo.distinct(NAME, {
        key: 'type',
      });
      assert(Array.isArray(result));
      assert.deepEqual(result, [ 'doc', 'text' ]);
    });

    it('should distince success with query', async () => {
      const result = await app.mongo.distinct(NAME, {
        key: 'type',
        query: { type: 'doc' },
      });
      assert(Array.isArray(result));
      assert.deepEqual(result, [ 'doc' ]);
    });

    it('should distince success with no key', async () => {
      const result = await app.mongo.distinct(NAME);
      assert.deepEqual(result, []);
    });
  });

  describe('createIndex()', () => {
    it('should create index success', async () => {
      const result = await app.mongo.createIndex(NAME, { fieldOrSpec: { title: -1 } });
      assert(result === 'title_-1');
    });

    it('should create index success', async () => {
      const result = await app.mongo.createIndex(NAME, { fieldOrSpec: 'title' });
      assert(result === 'title_1');
    });

    it('should create index fail with empty keys', async () => {
      try {
        await app.mongo.createIndex(NAME, { fieldOrSpec: {} });
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it('should create index fail with empty args', async () => {
      try {
        await app.mongo.createIndex(NAME);
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe('createCollection() && listCollections()', () => {
    it('should create && list collection success', async () => {
      await app.mongo.createCollection({ name: 'create' });
      const result = await app.mongo.listCollections();
      assert(result.indexOf('create') !== -1);
    });

    it('should create fail with empty args', async () => {
      try {
        await app.mongo.createCollection();
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });
});
