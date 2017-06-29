import makeDebug from 'debug';
import { stripSlashes } from 'feathers-commons';
import Uberproto from 'uberproto';

import events from './events';
import hooks from './hooks';

const debug = makeDebug('feathers:application');
const Proto = Uberproto.extend({
  create: null
});

const application = {
  init () {
    Object.assign(this, {
      methods: [ 'find', 'get', 'create', 'update', 'patch', 'remove' ],
      mixins: [],
      services: {},
      providers: [],
      _setup: false,
      settings: {}
    });

    this.configure(hooks());
    this.configure(events());
  },

  get (name) {
    return this.settings[name];
  },

  set (name, value) {
    this.settings[name] = value;
    return this;
  },

  disable (name) {
    this.settings[name] = false;
    return this;
  },

  disabled (name) {
    return !this.settings[name];
  },

  enable (name) {
    this.settings[name] = true;
    return this;
  },

  enabled (name) {
    return !!this.settings[name];
  },

  configure (fn) {
    fn.call(this);

    return this;
  },

  service (path, service) {
    if (typeof service !== 'undefined') {
      throw new Error('Registering a new service with `app.service(path, service)` is no longer supported. Use `app.use(path, service)` instead.');
    }

    const location = stripSlashes(path);
    const current = this.services[location];

    if (typeof current === 'undefined' && typeof this.defaultService === 'function') {
      return this.use(`/${location}`, this.defaultService(location))
        .service(location);
    }

    return current;
  },

  use (path, service, options = {}) {
    const location = stripSlashes(path);
    const hasMethod = methods => methods.some(name =>
      (service && typeof service[name] === 'function')
    );

    if (!hasMethod(this.methods.concat('setup'))) {
      throw new Error(`Invalid service object passed for path \`${location}\``);
    }

    const protoService = Proto.extend(service);

    debug(`Registering new service at \`${location}\``);

    // Add all the mixins
    this.mixins.forEach(fn => fn.call(this, protoService, location, options));

    if (typeof protoService._setup === 'function') {
      protoService._setup(this, location);
    }

    // Run the provider functions to register the service
    this.providers.forEach(provider =>
      provider.call(this, protoService, location, options)
    );

    // If we ran setup already, set this service up explicitly
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug(`Setting up service for \`${location}\``);
      protoService.setup(this, location);
    }

    this.services[location] = protoService;

    return this;
  },

  setup () {
    // Setup each service (pass the app so that they can look up other services etc.)
    Object.keys(this.services).forEach(path => {
      const service = this.services[path];

      debug(`Setting up service for \`${path}\``);

      if (typeof service.setup === 'function') {
        service.setup(this, path);
      }
    });

    this._isSetup = true;

    return this;
  }
};

export default application;
