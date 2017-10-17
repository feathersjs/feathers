const debug = require('debug')('feathers-socket-commons:channels');
const { get, compact, flattenDeep } = require('lodash');
const CombinedChannel = require('./channel/combined');
const { channelMixin, publishMixin, keys } = require('./mixins');

const { CHANNELS, PUBLISHERS, ALL_EVENTS } = keys;

function channels () {
  return function () {
    const app = this;

    if (typeof app.channel === 'function' && typeof app.publish === 'function') {
      return;
    }

    Object.assign(app, channelMixin(), publishMixin());
    Object.defineProperty(app, 'channels', {
      get () {
        return Object.keys(this[CHANNELS]);
      }
    });

    app.mixins.push(function (service, path) {
      const app = this;

      if (typeof service.publish === 'function' || !service._serviceEvents) {
        return;
      }

      Object.assign(service, publishMixin());

      service._serviceEvents.forEach(event => {
        service.on(event, function (data, hook) {
          if (!hook) {
            // Fake hook for custom events
            hook = { path, service, app, result: data };
          }

          debug('Publishing event', event, hook.path);

          const servicePublishers = service[PUBLISHERS];
          const appPublishers = app[PUBLISHERS];
          const publishers = compact([
            get(servicePublishers, ALL_EVENTS),
            get(servicePublishers, event),
            get(appPublishers, ALL_EVENTS),
            get(appPublishers, event)
          ]);

          Promise.all(publishers.map(callback =>
            Promise.resolve(callback(data, hook))
          )).then(results => {
            const channel = new CombinedChannel(compact(flattenDeep(results)));

            if (channel.length > 0) {
              app.emit('publish', event, channel, hook);
            } else {
              debug('No connections to publish to');
            }
          });
        });
      });
    });
  };
}

channels.keys = keys;

module.exports = channels;
