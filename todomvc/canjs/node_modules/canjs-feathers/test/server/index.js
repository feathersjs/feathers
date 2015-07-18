'use strict';

var path = require('path');
var feathers = require('feathers');
var bodyParser = require('body-parser');
var TodoService = require('./todos');

// We need to do this to get proper errors
// see http://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
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


// Prep the Feathers server.
var app = feathers()
  .use(feathers.static(path.join(__dirname, '..', '..')))
  .use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, DELETE, GET, POST');
    next();
  })
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))

  .configure(feathers.socketio()) // For testing socket can.Feathers.Models
  .configure(feathers.rest())     // For testing normal can.Models

  .get('/todos/clear', function(req, res) {
    req.app.service('todos').clear();
    res.json({ cleared: true });
  })
  .use('/todos', new TodoService());

// Start the server.
var port = 8082;
app.listen(port, function() {
  console.log('Feathers server started.');
});
