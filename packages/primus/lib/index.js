const { socket: commons } = require('@feathersjs/transport-commons');
const makeDebug = require('debug');
const Proto = require('uberproto');
const Primus = require('primus');
const http = require('http');
const Emitter = require('primus-emitter');

const debug = makeDebug('@feathersjs/primus');
const socketKey = Symbol('@feathersjs/primus/socket');

function configurePrimus (config, configurer) {
  return function () {
    const app = this;
    const getParams = spark => spark.request.feathers;

    if (!app.version || app.version < '3.0.0') {
      throw new Error('@feathersjs/primus is not compatible with this version of Feathers. Use the latest at @feathersjs/feathers.');
    }

    const done = new Promise(resolve => {
      Proto.mixin({
        listen (...args) {
          if (typeof this._super === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return this._super(...args);
          }

          const server = http.createServer();

          this.setup(server);

          return server.listen(...args);
        },

        setup (server) {
          debug('Setting up Primus');

          if (!this.primus) {
            const primus = this.primus = new Primus(server, config);

            primus.plugin('emitter', Emitter);

            primus.use('feathers', function (req, res, next) {
              req.feathers = {
                headers: Object.keys(req.headers).reduce((result, key) => {
                  const value = req.headers[key];

                  if (typeof value !== 'object') {
                    result[key] = value;
                  }

                  return result;
                }, {}),
                provider: 'primus'
              };

              next();
            }, 0);

            primus.on('connection', spark =>
              Object.defineProperty(getParams(spark), socketKey, {
                value: spark
              })
            );

            primus.on('disconnection', spark => app.emit('disconnect', getParams(spark)));
          }

          if (typeof configurer === 'function') {
            debug('Calling Primus configuration function');
            configurer.call(this, this.primus);
          }

          resolve(this.primus);

          return this._super.apply(this, arguments);
        }
      }, app);
    });

    app.configure(commons({
      done,
      socketKey,
      getParams,
      emit: 'send'
    }));
  };
}

module.exports = configurePrimus;
module.exports.SOCKET_KEY = socketKey;
module.exports.default = configurePrimus;
