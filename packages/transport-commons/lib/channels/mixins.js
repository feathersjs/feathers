const debug = require('debug')('@feathersjs/transport-commons:channels/mixins');
const Channel = require('./channel/base');
const CombinedChannel = require('./channel/combined');

const PUBLISHERS = Symbol('@feathersjs/transport-commons/publishers');
const CHANNELS = Symbol('@feathersjs/transport-commons/channels');
const ALL_EVENTS = Symbol('@feathersjs/transport-commons/all-events');

exports.keys = {
  PUBLISHERS,
  CHANNELS,
  ALL_EVENTS
};

exports.channelMixin = function channelMixin () {
  return {
    [CHANNELS]: {},

    channel (...names) {
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
};

exports.publishMixin = function publishMixin () {
  return {
    [PUBLISHERS]: {},

    publish (event, callback) {
      debug('Registering publisher', event);

      if (!callback && typeof event === 'function') {
        callback = event;
        event = ALL_EVENTS;
      }

      if (this._serviceEvents && event !== ALL_EVENTS && this._serviceEvents.indexOf(event) === -1) {
        throw new Error(`'${event}' is not a valid service event`);
      }

      const publishers = this[PUBLISHERS];

      publishers[event] = callback;

      return this;
    }
  };
};
