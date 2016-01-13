<% if (cors) { %>import cors from 'cors';<% } %>
import { join } from 'path';
import { static as serveStatic } from 'feathers';
import favicon from 'serve-favicon';
import compress from 'compression';
import missing from './not-found-handler';
import error from './error-handler';
import logger from './logger';

export default function() {
  const app = this;
  <% if (cors === 'whitelisted') { %>
  let whitelist = app.get('corsWhitelist');
  let corsOptions = {
    origin: function(origin, callback){
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    }
  };<% } %>

  app.use(compress())<% if (cors) { %>
    .options('*', cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))
    .use(cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))<% } %>
    .use(favicon( join(app.get('public'), 'favicon.ico') ))
    .use('/', serveStatic(app.get('public')))
    .use(missing())
    .use(logger(app))
    .use(error(app));
}
