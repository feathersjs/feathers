const url = require('url');
const MongoClient = require('mongodb').MongoClient;

module.exports = function (app) {
  const config = app.get('mongodb');
  const dbName = url.parse(config).path.substring(1);
  const promise = MongoClient.connect(config).then(client => {
    // For mongodb <= 2.2
    if(client.collection) {
      return client;
    }
    
    return client.db(dbName);
  });

  app.set('mongoClient', promise);
};
