const jQuery = require('./jquery');
const Superagent = require('./superagent');
const Request = require('./request');
const Fetch = require('./fetch');
const Axios = require('./axios');
const Angular = require('./angular');
const AngularHttpClient = require('./angular-http-client');

const transports = {
  jquery: jQuery,
  superagent: Superagent,
  request: Request,
  fetch: Fetch,
  axios: Axios,
  angular: Angular,
  angularHttpClient: AngularHttpClient
};

module.exports = function (base = '') {
  const result = {};

  Object.keys(transports).forEach(key => {
    const Service = transports[key];

    result[key] = function (connection, options = {}) {
      if (!connection) {
        throw new Error(`${key} has to be provided to feathers-rest`);
      }

      const defaultService = function (name) {
        return new Service({ base, name, connection, options });
      };

      const initialize = function () {
        if (typeof this.defaultService === 'function') {
          throw new Error('Only one default client provider can be configured');
        }

        this.rest = connection;
        this.defaultService = defaultService;
      };

      initialize.Service = Service;
      initialize.service = defaultService;

      return initialize;
    };
  });

  return result;
};
