import makeDebug from 'debug';
import Proto from 'uberproto';
import socket from 'feathers-socket-commons';
import Primus from 'primus';
import Emitter from 'primus-emitter';

const debug = makeDebug('feathers-primus');

export default function(config, configurer) {
  return function() {
    const app = this;

    app.configure(socket);

    // Monkey patch app.setup(server)
    Proto.mixin({
      setup(server) {
        debug('Setting up Primus');

        const primus = this.primus = new Primus(server, config);

        primus.use('emitter', Emitter);

        primus.before('feathers', function(req, res, next) {
          req.feathers = { provider: 'primus' };
          next();
        }, 0);

        if (typeof configurer === 'function') {
          debug('Calling Primus configuration function');
          configurer.call(this, primus);
        }

        this._socketInfo = {
          method: 'send',
          connection() {
            return primus;
          },
          clients() {
            return primus;
          },
          params(spark) {
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
}
