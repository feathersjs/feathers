import Debug from 'debug';
import { get, compact, flattenDeep, noop } from 'lodash';
import { Channel } from './channel/base';
import { CombinedChannel } from './channel/combined';
import { channelMixin, publishMixin, keys } from './mixins';
import { Application, Service } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/transport-commons/channels');
const { CHANNELS, PUBLISHERS, ALL_EVENTS } = keys;

declare module '@feathersjs/feathers' {
  interface ServiceAddons<T> {
    publish(callback: (data: T, hook: HookContext<T>) => Channel): this;

    publish(event: string, callback: (data: T, hook: HookContext<T>) => Channel): this;
  }

  interface Application<ServiceTypes> {
    channels: string[];

    channel(name: string[]): Channel;
    channel(...names: string[]): Channel;

    // tslint:disable-next-line void-return
    publish<T>(callback: (data: T, hook: HookContext<T>) => Channel | Channel[] | void): Application<ServiceTypes>;

    // tslint:disable-next-line void-return
    publish<T>(event: string, callback: (data: T, hook: HookContext<T>) => Channel | Channel[] | void): Application<ServiceTypes>;
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

          const servicePublishers = (service as any)[PUBLISHERS];
          const appPublishers = (app as any)[PUBLISHERS];
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
