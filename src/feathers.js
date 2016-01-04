if(!global._babelPolyfill) { require('babel-polyfill'); }

import _ from 'lodash';
import express from 'express';
import Proto from 'uberproto';
import Application from './application';

/**
 * Create a Feathers application that extends Express.
 *
 * @return {Function}
 * @api public
 */
export default function createApplication() {
  const app = express();
  Proto.mixin(Application, app);
  app.init();
  return app;
}

// Framework version
createApplication.version = require('../package.json').version;

// Expose all express methods (like express.engine())
_.defaults(createApplication, express);
