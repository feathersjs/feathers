import { join } from 'path';
import feathers from 'feathers';
import configuration from 'feathers-configuration';
import hooks from 'feathers-hooks';<% if (providers.indexOf('rest') !== -1) { %>
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
<% } %><% if (providers.indexOf('socket.io') !== -1) { %>import socketio from 'feathers-socketio';<% } %><% if (providers.indexOf('primus') !== -1) { %>import primus from 'feathers-primus';<% } %>
<% if (authentication.length) { %>import feathersAuth from 'feathers-authentication';<% } %>
import middleware from './middleware';
import services from './services';
import myHooks from './hooks';

let app = feathers();

app.configure(configuration(join(__dirname, '..')))
  .configure(hooks())<% if(providers.indexOf('rest') !== -1) { %>
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(rest())<% } %><% if (providers.indexOf('socket.io') !== -1) { %>
  .configure(socketio())<% } %><% if(providers.indexOf('primus') !== -1) { %>
  .configure(primus({
    transformer: 'sockjs'
  }))<% } %><% if (authentication.length) { %>
  .configure(feathersAuth(app.get('auth').local))<% } %>
  .configure(services)
  .configure(myHooks)
  .configure(middleware);

export default app;
