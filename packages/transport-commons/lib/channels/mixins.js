const debug = require('debug')('@feathersjs/socket-commons:channels/mixins');
const Channel = require('./channel/base');
const CombinedChannel = require('./channel/combined');

const PUBLISHERS = Symbol('feathers-channels/publishers');
const CHANNELS = Symbol('feathers-channels/channels');
const ALL_EVENTS = Symbol('feathers-channels/all-events');

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
        const name = names[0];

        if (Array.isArray(name)) {
          return this.channel(...name);
        }

        return this[CHANNELS][name] ||
          (this[CHANNELS][name] = new Channel());
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
