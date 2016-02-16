import { join } from 'path';
import { static as serveStatic } from 'feathers';
import favicon from 'serve-favicon';
import compress from 'compression';<% if (cors) { %>
import cors from 'cors';<% } %>
import feathers from 'feathers';
import configuration from 'feathers-configuration';
import hooks from 'feathers-hooks';<% if (providers.indexOf('rest') !== -1) { %>
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
<% } %><% if (providers.indexOf('socket.io') !== -1) { %>import socketio from 'feathers-socketio';<% } %><% if (providers.indexOf('primus') !== -1) { %>import primus from 'feathers-primus';<% } %>
<% if (authentication.length) { %>import authentication from 'feathers-authentication';<% } %>
import middleware from './middleware';
import services from './services';
<% if (cors === 'whitelisted') { %>
let whitelist = app.get('corsWhitelist');
let corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};<% } %>
let app = feathers();

app.configure(configuration(join(__dirname, '..')))
  .use(compress())<% if (cors) { %>
  .options('*', cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))
  .use(cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))<% } %>
  .use(favicon( join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))<% if(providers.indexOf('rest') !== -1) { %>
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))<% } %>
  .configure(hooks())<% if (providers.indexOf('rest') !== -1) { %>
  .configure(rest())<% } %><% if (providers.indexOf('socket.io') !== -1) { %>
  .configure(socketio())<% } %><% if(providers.indexOf('primus') !== -1) { %>
  .configure(primus({
    transformer: 'sockjs'
  }))<% } %><% if (authentication.length) { %>
  .configure(authentication( app.get('auth') ))<% } %>
  .configure(services)
  .configure(middleware);

export default app;
