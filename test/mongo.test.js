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
      .then(res => assert(Array.isArray(res.body) && res.body.length === 10));
  });

  it('should GET /:id', () => {
    return request(app.callback())
      .get(`/${id}`)
      .expect(200)
      .then(res => assert(res.body._id.toString() === id.toString()));
  });

  it('should POST /', () => {
    app.mockCsrf();
    return request(app.callback())
      .post('/')
      .send({ doc: 'doc' })
      .expect(201)
      .then(res => {
        assert(res.body.hasOwnProperty('insertedCount') && res.body.insertedCount === 1);
        assert(res.body.hasOwnProperty('value') && res.body.value.doc === 'doc');
      });
  });

  it('should put /:id', () => {
    app.mockCsrf();
    return request(app.callback())
      .put(`/${id}`)
      .send({ doc: 'doc' })
      .expect(200)
      .then(res => {
        assert(res.body.ok === 1);
        assert(res.body.value.doc === 'doc');
        assert(res.body.value._id === id.toString());
      });
  });

  it('should delete /:id', () => {
    app.mockCsrf();
    return request(app.callback())
      .del(`/${id}`)
      .expect(200)
      .then(res => {
        assert(res.body.ok === 1);
        assert(res.body.value.doc === 'doc1');
        assert(res.body.value._id === id.toString());
      });
  });

  it('should get /total', () => {
    return request(app.callback())
      .get('/total')
      .expect('10')
      .expect(200);
  });

  it('should get /collections', () => {
    return request(app.callback())
      .get('/collections')
      .expect(200)
      .then(res => assert(Array.isArray(res.body) && res.body.indexOf('new') !== -1));
  });
});
