const Debug = require('debug');
const hooks = require('./hooks');
const passport = require('passport');
const adapter = require('./passport');
const getOptions = require('./options');
const createService = require('./service');
const legacySockets = require('./socket');

const debug = Debug('@feathersjs/authentication:index');

const init = (config = {}) => {
  return app => {
    const _super = app.setup;
    // Merge all options
    const options = getOptions(config, app.get('authentication'));

    if (app.passport) {
      throw new Error(`You have already registered authentication on this app. You only need to do it once.`);
    }

    app.set('authentication', options);

    debug('Setting up Passport');
    // Set up our framework adapter
    passport.framework(adapter(options));
    // Expose passport on the app object
    app.passport = passport;
    // Alias to passport for less keystrokes
    app.authenticate = passport.authenticate.bind(passport);
    app.use(options.path, createService(app));

    const authService = app.service(options.path);

    if (typeof authService.publish === 'function') {
      authService.publish(() => false);
    }
    // TODO add service hooks

    app.passport.initialize();

    app.setup = function () {
      const result = _super.apply(this, arguments);

      // Socket.io middleware
      if (app.io) {
        debug('registering Socket.io authentication middleware');
        app.io.on('connection', legacySockets(app, options));
      }

      // Primus middleware
      if (app.primus) {
        debug('registering Primus authentication middleware');
        app.primus.on('connection', legacySockets(app, options));
      }

      return result;
    };
  };
};

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  hooks,
  createService
});
