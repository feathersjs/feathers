var utils = require('./utils');
function app(base) {
  if (typeof base !== 'string') {
    base = '/';
  }

  return {
    services: {},

    base: base,

    configure: function (cb) {
      cb.call(this);
      return this;
    },

    service: function (name) {
      name = utils.stripSlashes(name);
      if (!this.services[name]) {
        this.services[name] = this.Service._create(name, this);
      }
      return this.services[name];
    }
  };
}

utils.extend(app, require('./rest/index'));
utils.extend(app, require('./sockets/index'));

module.exports = app;