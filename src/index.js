/* global __VERSION__ */
import Proto from 'uberproto';

import Application from './application';

export default function createApplication () {
  const app = {};

  // Mix in the base application
  Proto.mixin(Application, app);

  app.init();

  return app;
}

createApplication.version = __VERSION__;
