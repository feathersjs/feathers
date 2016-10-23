import feathers from 'feathers';
import primus from 'feathers-primus';
import socketio from 'feathers-socketio';
import rest from 'feathers-rest';
import errorHandler from 'feathers-errors/handler';
import feathersHooks from 'feathers-hooks';
import authentication, { hooks } from 'feathers-authentication';
import bodyParser from 'body-parser';
import memory from 'feathers-memory';

export default function (settings, username, password, useSocketio, next) {
  const app = feathers();

  app.configure(rest())
    .configure(useSocketio ? socketio() : primus({ transformer: 'websockets' }))
    .configure(feathersHooks())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(authentication(settings))
    .configure(authentication.LocalService(settings))
    .configure(authentication.TokenService(settings))
    .use('/users', memory())
    .use('/messages', memory())
    .use(errorHandler());

  let server = app.listen(8888);

  let userService = app.service('/users');
  userService.before({
    create: [hooks.hashPassword()]
  });

  // Messages will require auth.
  let messageService = app.service('/messages');

  server.on('listening', () => {
    userService.create({email: username, password: password})
      .then(() => Promise.all([
        messageService.create({
          text: 'A million people walk into a Silicon Valley bar'
        }),
        messageService.create({
          text: 'Nobody buys anything'
        }),
        messageService.create({
          text: 'Bar declared massive success'
        })
      ]))
      .then(() => {
        messageService.before({
          all: [
            hooks.isAuthenticated()
          ]
        });

        next(null, { app, server });
      });
  });
}
