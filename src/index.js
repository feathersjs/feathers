import Proto from 'uberproto';

import Application from './application';

export default function createApplication () {
  const app = {};

  // Mix in the base application
  Proto.mixin(Application, app);

  app.init();

  return app;
}

// TODO use https://github.com/gnandretta/babel-plugin-version-inline
createApplication.version = '__VERSION__';
