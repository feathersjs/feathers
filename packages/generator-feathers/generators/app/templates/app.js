'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');<% if (cors) { %>
const cors = require('cors');<% } %>
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');<% if (providers.indexOf('rest') !== -1) { %>
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
<% } %><% if (providers.indexOf('socket.io') !== -1) { %>const socketio = require('feathers-socketio');<% } %><% if (providers.indexOf('primus') !== -1) { %>const primus = require('feathers-primus');<% } %>
const middleware = require('./middleware');
const services = require('./services');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));<% if (cors === 'whitelisted') { %>

const whitelist = app.get('corsWhitelist');
const corsOptions = {
  origin(origin, callback){
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};<% } %>

app.use(compress())<% if (cors) { %>
  .options('*', cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))
  .use(cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))<% } %>
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))<% if(providers.indexOf('rest') !== -1) { %>
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))<% } %>
  .configure(hooks())<% if (providers.indexOf('rest') !== -1) { %>
  .configure(rest())<% } %><% if (providers.indexOf('socket.io') !== -1) { %>
  .configure(socketio())<% } %><% if(providers.indexOf('primus') !== -1) { %>
  .configure(primus({ transformer: 'sockjs' }))<% } %>
  .configure(services)
  .configure(middleware);

module.exports = app;
