const MongoClient = require('mongodb').MongoClient;

module.exports = function (app) {
  const config = app.get('mongodb');
  const promise = MongoClient.connect(config);

  app.set('mongoClient', promise);
};
