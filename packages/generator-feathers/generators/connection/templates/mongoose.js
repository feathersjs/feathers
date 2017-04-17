const mongoose = require('mongoose');

module.exports = function () {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);
};
