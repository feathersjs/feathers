import makeDebug from 'debug';
import Proto from 'uberproto';
import { socket as commons } from 'feathers-commons';
import Primus from 'primus';
import Emitter from 'primus-emitter';

const debug = makeDebug('feathers-primus');

export default function(config, configurer) {
  return function() {
    const app = this;

    // Monkey patch app.setup(server)
    Proto.mixin({
      service: commons.service,

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

        const result = this._super.apply(this, arguments);

        commons.setup.call(this, {
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
        });

        return result;
      }
    }, app);
  };
}
