var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');

var app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // A simple Message service that we can used for testing
  .use('/messages', memory())
  .use(function(error, req, res, next){
    res.status(error.code);
    res.json(error);
  });


var messageService = app.service('/messages');

messageService.after({
  all: function(hook) {
    console.log('API V2 Message hook called');
    hook.result.api = 'v2';
  }
});

module.exports = app;