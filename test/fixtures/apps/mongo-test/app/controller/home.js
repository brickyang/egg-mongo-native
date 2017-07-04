'use strict';
const { ObjectID } = require('mongodb');

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const { ctx } = this;

      ctx.body = await app.mongo.find('test', { query: {} });
      ctx.status = 200;
    }

    async show() {
      const { ctx } = this;
      const { id } = ctx.params;

      const [ result ] = await app.mongo.find('test', { query: { _id: new ObjectID(id) } });
      ctx.body = result;
      ctx.status = 200;
    }

    async create() {
      const { ctx } = this;

      ctx.body = await app.mongo.insertOne('test', { doc: ctx.request.body });
      ctx.status = 201;
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.params;

      const args = {
        filter: { _id: new ObjectID(id) },
        update: { $set: ctx.request.body },
        replacement: ctx.request.body,
        options: { returnOriginal: false },
      };

      if (ctx.query.hasOwnProperty('replace')) {
        ctx.body = await app.mongo.findOneAndReplace('test', args);
      } else {
        ctx.body = await app.mongo.findOneAndUpdate('test', args);
      }
      ctx.status = 200;
    }

    async updateMany() {
      const { ctx } = this;

      const args = {
        update: { $set: { type: 'update' } },
        options: { returnOriginal: false },
      };

      ctx.body = await app.mongo.updateMany('test', args);
    }

    async destroy() {
      const { ctx } = this;
      const { id } = ctx.params;

      ctx.body = await app.mongo.findOneAndDelete('test', { filter: { _id: new ObjectID(id) } });
      ctx.status = 200;
    }

    async count() {
      const { ctx } = this;

      ctx.body = await app.mongo.count('test');
      ctx.status = 200;
    }

    async collections() {
      const { ctx } = this;

      await app.mongo.createCollection({ name: 'new' });
      ctx.body = await app.mongo.listCollections();
      ctx.status = 200;
    }

    async distinct() {
      const { ctx } = this;

      ctx.body = {
        doc: await app.mongo.distinct('test', { key: 'doc' }),
        type: await app.mongo.distinct('test', { key: 'type' }),
      };
    }
  }
  return Controller;
};
