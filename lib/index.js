const { hooks } = require('@feathersjs/commons');
const Proto = require('uberproto');
const Application = require('./application');
const version = require('./version');
const { ACTIVE_HOOKS, activeHooks } = require('./hooks');

function createApplication () {
  const app = {};

  // Mix in the base application
  Proto.mixin(Application, app);

  app.init();

  return app;
}

createApplication.version = version;
createApplication.SKIP = hooks.SKIP;
createApplication.ACTIVE_HOOKS = ACTIVE_HOOKS;
createApplication.activeHooks = activeHooks;

module.exports = createApplication;

// For better ES module (TypeScript) compatibility
module.exports.default = createApplication;
