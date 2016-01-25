import feathers from 'feathers';
import socketio from 'feathers-socketio';
import rest from 'feathers-rest';
import feathersHooks from 'feathers-hooks';
import feathersAuth from '../src/';
import {hooks} from '../src/';
import bodyParser from 'body-parser';
import memory from 'feathers-memory';
import async from 'async';

export default function(settings, username, password, next) {

  const app = feathers();

  app.configure(rest())
    .configure(socketio())
    .configure(feathersHooks())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(feathersAuth(settings))
    .use('/api/users', memory())
    .use('/api/todos', memory())
    .use('/api/tasks', memory())
    .use('/', feathers.static(__dirname));

  let server = app.listen(8888);

  let userService = app.service('/api/users');
  userService.before({
    create: [hooks.hashPassword()]
  });


  // Todos will require auth.
  let todoService = app.service('/api/todos');

  // Tasks service won't require auth.
  let taskService = app.service('/api/tasks');

  server.on('listening', () => {
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
        find: [hooks.requireAuth()],
        get: [hooks.requireAuth()]
      });

      var obj = {
        app: app,
        server: server
      };
      next(null, obj);
    });

  });
}
