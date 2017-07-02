'use strict';

module.exports = app => {
  app.resources('home', '/', 'home');
  app.get('/total', 'home.count');
  app.get('/collections', 'home.collections');
};
