import Debug from 'debug';
import hooks from './hooks';
import express from './express';
import passport from 'passport';
import adapter from './passport';
import getOptions from './options';
import service from './service';
import socket from './socket';

const debug = Debug('feathers-authentication:index');

export default function init (config = {}) {
  return function authentication () {
    const app = this;
    const _super = app.setup;
    // Merge and flatten options
    const options = getOptions(config);

    if (app.passport) {
      throw new Error(`You have already registered authentication on this app. You only need to do it once.`);
    }

    if (!options.secret) {
      throw new Error(`You must provide a 'secret' in your authentication configuration`);
    }

    // Make sure cookies don't have to be sent over HTTPS
    // when in development or test mode.
    if (app.get('env') === 'development' || app.get('env') === 'test') {
      options.cookie.secure = false;
    }

    app.set('authentication', options);
    app.set('auth', options);

    debug('Setting up Passport');
    // Set up our framework adapter
    passport.framework(adapter.call(app, options));
    // Expose passport on the app object
    app.passport = passport;
    // Alias to passport for less keystrokes
    app.authenticate = passport.authenticate.bind(passport);
    // Expose express request headers to Feathers services and hooks.
    app.use(express.exposeHeaders());

    if (options.cookie.enabled) {
      // Expose express cookies to Feathers services and hooks.
      debug('Setting up Express exposeCookie middleware');
      app.use(express.exposeCookies());
    }

    // TODO (EK): Support passing your own service or force
    // developer to register it themselves.
    app.configure(service(options));
    app.passport.initialize();

    app.setup = function () {
      let result = _super.apply(this, arguments);

      // Socket.io middleware
      if (app.io) {
        debug('registering Socket.io authentication middleware');
        app.io.on('connection', socket.socketio(app, options));
      }

      // Primus middleware
      if (app.primus) {
        debug('registering Primus authentication middleware');
        app.primus.on('connection', socket.primus(app, options));
      }

      return result;
    };
  };
}

// Exposed Modules
Object.assign(init, {
  hooks,
  express,
  service
});
