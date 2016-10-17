import Proto from 'uberproto';
import Application from './application';

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
export default function createApplication (app) {
  Proto.mixin(Application, app);
  app.init();
  return app;
}
