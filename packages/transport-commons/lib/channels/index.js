const debug = require('debug')('@feathersjs/transport-commons/channels');
const { get, compact, flattenDeep, noop } = require('lodash');
const CombinedChannel = require('./channel/combined');
const { channelMixin, publishMixin, keys } = require('./mixins');

const { CHANNELS, PUBLISHERS, ALL_EVENTS } = keys;

function channels () {
  return app => {
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
          // This will return the first publisher list that is not empty
          // In the following precedence
          const callback = [
            // 1. Service publisher for a specific event
            get(servicePublishers, event),
            // 2. Service publisher for all events
            get(servicePublishers, ALL_EVENTS),
            // 3. App publishers for a specific event
            get(appPublishers, event),
            // 4. App publishers for all events
            get(appPublishers, ALL_EVENTS)
          ].find(current => typeof current === 'function') || noop;

          Promise.resolve(callback(data, hook)).then(result => {
            if (!result) {
              return;
            }

            const results = Array.isArray(result) ? compact(flattenDeep(result)) : [ result ];
            const channel = new CombinedChannel(results);

            if (channel && channel.length > 0) {
              app.emit('publish', event, channel, hook, data);
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
