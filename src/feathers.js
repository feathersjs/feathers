import Proto from 'uberproto';
import Application from './application';
import { version } from '../package.json';

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
export default function createApplication(app) {
  Proto.mixin(Application, app);
  app.init();
  app.VERSION = version;
  return app;
}

createApplication.version = version;
