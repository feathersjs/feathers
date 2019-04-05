import Debug from 'debug';
import { Channel } from './channel/base';
import { CombinedChannel } from './channel/combined';
import { HookContext } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/transport-commons:channels/mixins');
const PUBLISHERS = Symbol('@feathersjs/transport-commons/publishers');
const CHANNELS = Symbol('@feathersjs/transport-commons/channels');
const ALL_EVENTS = Symbol('@feathersjs/transport-commons/all-events');

export const keys = {
  PUBLISHERS,
  CHANNELS,
  ALL_EVENTS
};

export interface ChannelMixin {
  [CHANNELS]: { [key: string]: Channel };
  channel(...names: string[]): Channel;
}

export function channelMixin() {
  const mixin: ChannelMixin = {
    [CHANNELS]: {},

    channel(...names: string[]): Channel {
      debug('Returning channels', names);

      if (names.length === 0) {
        throw new Error('app.channel needs at least one channel name');
      }

      if (names.length === 1) {
        const [ name ] = names;

        if (Array.isArray(name)) {
          return this.channel(...name);
        }

        if (!this[CHANNELS][name]) {
          const channel = new Channel();

          channel.once('empty', () => {
            channel.removeAllListeners();
            delete this[CHANNELS][name];
          });

          this[CHANNELS][name] = channel;
        }

        return this[CHANNELS][name];
      }

      const channels = names.map(name => this.channel(name));

      return new CombinedChannel(channels);
    }
  };

  return mixin;
}

export interface PublishMixin {
  [PUBLISHERS]: { [key: string]: Channel };
  publish(event: string|symbol, callback: (data: any, hook: HookContext) => Channel): any;
}

export function publishMixin() {
  const result: PublishMixin = {
    [PUBLISHERS]: {},

    publish(event, callback) {
      debug('Registering publisher', event);

      if (!callback && typeof event === 'function') {
        callback = event;
        event = ALL_EVENTS;
      }

      // @ts-ignore
      if (this._serviceEvents && event !== ALL_EVENTS && this._serviceEvents.indexOf(event) === -1) {
        throw new Error(`'${event.toString()}' is not a valid service event`);
      }

      const publishers = this[PUBLISHERS];

      // @ts-ignore
      publishers[event] = callback;

      return this;
    }
  };

  return result;
}
