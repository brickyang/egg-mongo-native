'use strict';

module.exports = app => {
  app.resources('home', '/', 'home');
  app.put('/', 'home.updateMany');
  app.get('/total', 'home.count');
  app.get('/collections', 'home.collections');
  app.get('/distinct', 'home.distinct');
};
