const Proto = require('uberproto');
const Application = require('./application');
const version = require('./version');
const { ACTIVATE_HOOKS, activateHooks } = require('./hooks');
// A base object Prototype that does not inherit from a
// potentially polluted Object prototype
const baseObject = Object.create(null);

function createApplication () {
  const app = Object.create(baseObject);

  // Mix in the base application
  Proto.mixin(Application, app);

  app.init();

  return app;
}

createApplication.version = version;
createApplication.ACTIVATE_HOOKS = ACTIVATE_HOOKS;
createApplication.activateHooks = activateHooks;

module.exports = createApplication;

// For better ES module (TypeScript) compatibility
module.exports.default = createApplication;
