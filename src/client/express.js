import { EventEmitter } from 'events';
import Proto from 'uberproto';

export default function() {
  const app = {
    settings: {},

    get(name) {
      return this.settings[name];
    },

    set(name, value) {
      this.settings[name] = value;
      return this;
    },

    disable(name) {
      this.settings[name] = false;
      return this;
    },

    disabled(name) {
      return !this.settings[name];
    },

    enable(name) {
      this.settings[name] = true;
      return this;
    },

    enabled(name) {
      return !!this.settings[name];
    },

    use() {
      throw new Error('Middleware functions can not be used in the Feathers client');
    },

    listen() {
      return {};
    }
  };

  Proto.mixin(EventEmitter.prototype, app);

  return app;
}
