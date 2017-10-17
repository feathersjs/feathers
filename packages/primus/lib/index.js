const makeDebug = require('debug');
const Proto = require('uberproto');
const socket = require('feathers-socket-commons');
const Primus = require('primus');
const Emitter = require('primus-emitter');

const debug = makeDebug('feathers-primus');

module.exports = function (config, configurer) {
  return function () {
    const app = this;

    app.configure(socket('primus'));

    // Monkey patch app.setup(server)
    Proto.mixin({
      setup (server) {
        debug('Setting up Primus');

        let primus = this.primus;

        if (!primus) {
          primus = this.primus = new Primus(server, config);

          primus.plugin('emitter', Emitter);

          primus.use('feathers', function (req, res, next) {
            req.feathers = { provider: 'primus' };
            next();
          }, 0);
        }

        if (typeof configurer === 'function') {
          debug('Calling Primus configuration function');
          configurer.call(this, primus);
        }

        this._socketInfo = {
          method: 'send',
          connection () {
            return primus;
          },
          clients () {
            return primus;
          },
          params (spark) {
            return spark.request.feathers;
          }
        };

        // In Feathers it is easy to hit the standard Node warning limit
        // of event listeners (e.g. by registering 10 services).
        // So we set it to a higher number. 64 should be enough for everyone.
        this._socketInfo.connection().setMaxListeners(64);

        return this._super.apply(this, arguments);
      }
    }, app);
  };
};
