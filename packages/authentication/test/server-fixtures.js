var feathers = require('feathers');
var feathersHooks = require('feathers-hooks');
var feathersAuth = require('../src/').default;
var hooks = require('../src/').hooks;
var bodyParser = require('body-parser');
var memory = require('feathers-memory');
var async = require('async');

module.exports = function(settings, username, password, next) {

  var app = feathers()
    .configure(feathers.rest())
    .configure(feathers.socketio())
    .configure(feathersHooks())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(feathersAuth(settings))
    .use('/api/users', memory())
    .use('/api/todos', memory())
    .use('/api/tasks', memory())
    .use('/', feathers.static(__dirname));

  var server = app.listen(8888);

  var userService = app.service('/api/users');
  userService.before({
    create: [hooks.hashPassword]
  });

  // Todos will require auth.
  var todoService = app.service('/api/todos');

  // Tasks service won't require auth.
  var taskService = app.service('/api/tasks');


  server.on('listening', function(){
    console.log('server listening');

    async.series([
      function(cb){
        userService.create({username: username, password: password}, {}, cb);
      },
      function(cb){
        todoService.create({name: 'Do the dishes'}, {}, function(){});
        todoService.create({name: 'Buy a guitar'}, {}, function(){});
        todoService.create({name: 'Exercise for 30 minutes.'}, {}, function(){});
        taskService.create({name: 'Feed the pigs'}, {}, function(){});
        taskService.create({name: 'Make Pizza.'}, {}, function(){});
        taskService.create({name: 'Write a book.'}, {}, cb);
      }
    ], function(){
      todoService.before({
        find: [hooks.requireAuth],
        get: [hooks.requireAuth]
      });

      var obj = {
        app: app,
        server: server
      };
      next(null, obj);
    });

  });
};