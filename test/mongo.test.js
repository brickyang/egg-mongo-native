'use strict';
const request = require('supertest');
const mm = require('egg-mock');
const assert = require('assert');

describe('test/mongo.test.js', () => {
  let app;
  let id;
  before(async () => {
    app = mm.app({
      baseDir: 'apps/mongo-test',
    });
    await app.ready();
  });

  beforeEach(async () => {
    await app.mongo.deleteMany('test', {});

    const docs = [];
    for (let i = 0; i < 10; ++i) {
      docs.push({
        doc: `doc${i + 1}`,
        type: 'doc',
      });
    }
    const result = await app.mongo.insertMany('test', { docs });
    id = result.value[0]._id;
  });

  afterEach(mm.restore);
  after(async () => {
    await app.mongo.deleteMany('test', {});
    app.close();
  });

  it('should GET /', () => {
    return request(app.callback())
      .get('/')
      .expect(200)
      .expect(res => assert(Array.isArray(res.body) && res.body.length === 10));
  });

  it('should GET /:id', () => {
    return request(app.callback())
      .get(`/${id}`)
      .expect(200)
      .expect(res => assert(res.body._id.toString() === id.toString()));
  });

  it('should POST /', () => {
    app.mockCsrf();
    return request(app.callback())
      .post('/')
      .send({ doc: 'doc' })
      .expect(201)
      .expect(res => {
        assert(res.body.hasOwnProperty('insertedCount') && res.body.insertedCount === 1);
        assert(res.body.hasOwnProperty('value') && res.body.value.doc === 'doc');
      });
  });

  it('should PUT /:id', () => {
    app.mockCsrf();
    return request(app.callback())
      .put(`/${id}`)
      .send({ doc: 'doc' })
      .expect(200)
      .expect(res => {
        assert(res.body.ok === 1);
        assert(res.body.value.doc === 'doc');
        assert(res.body.value._id === id.toString());
      });
  });

  it('should PUT /', () => {
    app.mockCsrf();
    return request(app.callback())
      .put('/')
      .send({ doc: 'doc' })
      .expect(200)
      .expect(res => assert(res.body.modifiedCount === 10));
  });

  it('should PUT /:id and replace', () => {
    app.mockCsrf();
    return request(app.callback())
      .put(`/${id}`)
      .query('replace')
      .send({ doc: 'doc' })
      .expect(200)
      .expect(res => {
        assert(res.body.ok === 1);
        assert(res.body.value.doc === 'doc');
        assert(!res.body.value.hasOwnProperty('type'));
        assert(res.body.value._id === id.toString());
      });
  });

  it('should DELETE /:id', () => {
    app.mockCsrf();
    return request(app.callback())
      .del(`/${id}`)
      .expect(200)
      .expect(res => {
        assert(res.body.ok === 1);
        assert(res.body.value.doc === 'doc1');
        assert(res.body.value._id === id.toString());
      });
  });

  it('should GET /total', () => {
    return request(app.callback())
      .get('/total')
      .expect('10')
      .expect(200);
  });

  it('should GET /collections', () => {
    return request(app.callback())
      .get('/collections')
      .expect(200)
      .expect(res => assert(Array.isArray(res.body) && res.body.indexOf('new') !== -1));
  });

  it('should GET /distinct', () => {
    return request(app.callback())
      .get('/distinct')
      .expect(200)
      .expect(res => {
        assert(Array.isArray(res.body.doc) && res.body.doc.length === 10);
        assert(Array.isArray(res.body.type) && res.body.type.length === 1);
      });
  });

  it('should create index', async () => {
    const result = await app.mongo.createIndex('test', { fieldOrSpec: 'doc' });
    assert(result === 'doc_1');
  });
});
