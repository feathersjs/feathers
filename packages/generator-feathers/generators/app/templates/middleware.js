import notFound from './not-found-handler';
import error from './error-handler';
import logger from './logger';

export default function() {
  const app = this;

  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  app.use(notFound())
    .use(logger(app))
    .use(error(app));
}
