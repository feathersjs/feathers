var feathers = require('feathers');
var bodyParser = require('body-parser');
var utils = require('../../lib/utils');
// An in-memory service implementation
var memory = require('feathers-memory');

Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});

module.exports = function(configurer) {
  // Create an in-memory CRUD service for our Todos
  var todoService = memory().extend({
    get: function(id, params, callback) {
      if(params.query.error) {
        return callback(new Error('Something went wrong'));
      }

      this._super(id, params, function(error, data) {
        callback(error, utils.extend({ query: params.query }, data));
      });
    }
  });

  var app = feathers()
    // Set up REST and SocketIO APIs
    .configure(feathers.rest())
    // Parse HTTP bodies
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Host the current directory (for index.html)
    .use(feathers.static(__dirname))
    // Host our Todos service on the /todos path
    .use('/todos', todoService);

  if(typeof configurer === 'function') {
    configurer.call(app);
  }

  app.service('todos').create({ text: 'some todo', complete: false }, {}, function() {});

  return app;
};