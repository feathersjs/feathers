import Debug from 'debug';
import compact from 'lodash/compact';
import flattenDeep from 'lodash/flattenDeep';
import noop from 'lodash/noop';
import { Channel, RealTimeConnection } from './channel/base';
import { CombinedChannel } from './channel/combined';
import { channelMixin, publishMixin, keys, PublishMixin, Event, Publisher } from './mixins';
import { Application, Service } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/transport-commons/channels');
const { CHANNELS } = keys;

declare module '@feathersjs/feathers' {
  interface ServiceAddons<T> {
    publish (publisher: Publisher<T>): this;
    publish (event: Event, publisher: Publisher<T>): this;

    registerPublisher (publisher: Publisher<T>): this;
    registerPublisher (event: Event, publisher: Publisher<T>): this;
  }

  interface Application<ServiceTypes> {
    channels: string[];

    channel (name: string[]): Channel;
    channel (...names: string[]): Channel;

    publish<T> (publisher: Publisher<T>): this;
    publish<T> (event: Event, publisher: Publisher<T>): this;

    registerPublisher<T> (publisher: Publisher<T>): this;
    registerPublisher<T> (event: Event, publisher: Publisher<T>): this;
  }

  interface Params {
    connection?: RealTimeConnection;
  }
}

export { keys };

export function channels () {
  return (app: Application) => {
    if (typeof app.channel === 'function' && typeof app.publish === 'function') {
      return;
    }

    Object.assign(app, channelMixin(), publishMixin());
    Object.defineProperty(app, 'channels', {
      get () {
        return Object.keys(this[CHANNELS]);
      }
    });

    app.mixins.push((service: Service<any>, path: string) => {
      if (typeof service.publish === 'function' || !service._serviceEvents) {
        return;
      }

      Object.assign(service, publishMixin());

      // @ts-ignore
      service._serviceEvents.forEach((event: string) => {
        service.on(event, function (data, hook) {
          if (!hook) {
            // Fake hook for custom events
            hook = { path, service, app, result: data };
          }

          debug('Publishing event', event, hook.path);

          const logError = (error: any) => debug(`Error in '${hook.path} ${event}' publisher`, error);
          const servicePublishers = (service as unknown as PublishMixin)[keys.PUBLISHERS];
          const appPublishers = (app as unknown as PublishMixin)[keys.PUBLISHERS];
          // This will return the first publisher list that is not empty
          // In the following precedence
          const publisher = (
            // 1. Service publisher for a specific event
            servicePublishers[event] ||
            // 2. Service publisher for all events
            servicePublishers[keys.ALL_EVENTS] ||
            // 3. App publisher for a specific event
            appPublishers[event] ||
            // 4. App publisher for all events
            appPublishers[keys.ALL_EVENTS] ||
            // 5. No publisher
            noop
          );

          try {
            Promise.resolve(publisher(data, hook)).then((result: any) => {
              if (!result) {
                return;
              }

              const results = Array.isArray(result) ? compact(flattenDeep(result)) : [result];
              const channel = new CombinedChannel(results);

              if (channel && channel.length > 0) {
                app.emit('publish', event, channel, hook, data);
              } else {
                debug('No connections to publish to');
              }
            }).catch(logError);
          } catch (error) {
            logError(error);
          }
        });
      });
    });
  };
}
