const { hooks: hookCommons } = require('@feathersjs/commons');
const Uberproto = require('uberproto');
const { hookMethodMixin } = require('./hooks');
const { eventMixin, eventHook } = require('./events');

const Proto = Uberproto.extend({
  create: null
});

const { enableHooks } = hookCommons;

getDefaultApp = svc => {
  const app = {
    hookTypes: svc.hookTypes,
    eventMappings: {
      create: 'created',
      update: 'updated',
      remove: 'removed',
      patch: 'patched',
    }
  };

  const methods = Object.assign(
    {
      find: ['params'],
      get: ['id', 'params'],
      create: ['data', 'params'],
      update: ['id', 'data', 'params'],
      patch: ['id', 'data', 'params'],
      remove: ['id', 'params']
    },
    svc.methods
  );

  enableHooks(app, () => Object.keys(methods), svc.hookTypes);

  app.hooks({ finally: eventHook() });

  return app;
};

function hookMixin (service, methods) {
  const methodNames = Object.keys(methods);
  // Assemble the mixin object that contains all "hooked" service methods
  const mixin = methodNames.reduce((mixin, method) => {
    if (typeof service[method] !== 'function') {
      return mixin;
    }

    const app = this;

    mixin[method] = hookMethodMixin(app, method);

    return mixin;
  }, {});

  service.mixin(mixin);
}

class Service {
  constructor (options = {}) {
    Object.defineProperty(this, 'hookTypes', {
      value: ['async', 'before', 'after', 'error', 'finally'],
      enumerable: false,
      configurable: true,
      writable: true
    });
    Object.defineProperty(this, '__app', {
      value: getDefaultApp(this),
      enumerable: false,
      configurable: true,
      writable: true
    });

    this._isSetup = false;

    this.methods = options.methods || {};

    if (options.methods) {
      this.enableHooks(this.methods);
    }

    return Proto.extend(this);
  }

  enableHooks (methods) {
    Object.assign(this.methods, methods);

    enableHooks(this, () => Object.keys(this.methods), this.hookTypes);

    if (this._isSetup) {
      hookMixin.call(this.__app, this, methods);
    }

    return this;
  }

  // Called on each mounting on an app
  _setup (app) {
    if (this._isSetup) {
      return this;
    }

    if (app) {
      this.__app = app;
    }

    enableHooks(this, () => Object.keys(this.methods), this.hookTypes);

    hookMixin.call(this.__app, this, this.methods);
    eventMixin.call(this.__app, this);

    this._isSetup = true;

    return this;
  }

  // Called on the first mounting on an app or manually
  setup (app, location) {
    return this._setup(app, location);
  }
}

module.exports = Service;
