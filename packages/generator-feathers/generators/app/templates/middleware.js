import path from 'path';
import notFound from './not-found-handler';
import error from './error-handler';
import logger from './logger';

export default function() {
  const app = this;

  // Register our error routes
  app.get('/404', function(req, res, next){
    res.sendFile(path.join(app.get('public'), 'error.html'));
  });

  app.get('/error', function(req, res, next){
    res.sendFile(path.join(app.get('public'), 'error.html'));
  });

  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  app.use(notFound())
    .use(logger(app))
    .use(error(app));
}
