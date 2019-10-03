const { hooks: hookCommons } = require('@feathersjs/commons');
const Uberproto = require('uberproto');
const { withHooks } = require('./hooks');

const Proto = Uberproto.extend({
  create: null
});

const {
  enableHooks,
  getHooks
} = hookCommons;

getDefaultApp = svc => ({
  hookTypes: svc.hookTypes,
  __hooks: svc.hookTypes.reduce((accu, type) => ({
    ...accu,
    [type]: {}
  }), {})
});

function hookMixin (service, getApp, methods) {
  const methodNames = Object.keys(methods);
  // Assemble the mixin object that contains all "hooked" service methods
  const mixin = methodNames.reduce((mixin, method) => {
    if (typeof service[method] !== 'function') {
      return mixin;
    }

    const app = getApp();

    mixin[method] = function () {
      const service = this;
      const args = Array.from(arguments);
      const original = service._super.bind(service);

      return withHooks({
        app,
        service,
        method,
        original
      })({
        before: getHooks(app, service, 'before', method),
        after: getHooks(app, service, 'after', method, true),
        error: getHooks(app, service, 'error', method, true),
        finally: getHooks(app, service, 'finally', method, true)
      })(...args);
    };

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
      hookMixin(this, () => this.__app, methods);
    }

    return this;
  }

  // Called on each mounting on an app
  _setup (app) {
    if (app) {
      this.__app = app;
    }

    if (!this._isSetup) {
      enableHooks(this, () => Object.keys(this.methods), this.hookTypes);

      hookMixin(this, () => this.__app, this.methods);

      this._isSetup = true;
    }

    return this;
  }

  // Called on the first mounting on an app or manually
  setup (app, location) {
    return this._setup(app, location);
  }
}

module.exports = Service;
