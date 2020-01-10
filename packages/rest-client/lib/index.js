const jQueryClient = require('./jquery');
const SuperagentClient = require('./superagent');
const RequestClient = require('./request');
const FetchClient = require('./fetch');
const AxiosClient = require('./axios');
const AngularClient = require('./angular');
const Base = require('./base');
const AngularHttpClient = require('./angular-http-client');

const transports = {
  jquery: jQueryClient,
  superagent: SuperagentClient,
  request: RequestClient,
  fetch: FetchClient,
  axios: AxiosClient,
  angular: AngularClient,
  angularHttpClient: AngularHttpClient
};

function restClient (base = '') {
  const result = { Base };

  Object.keys(transports).forEach(key => {
    result[key] = function (connection, options = {}, Service = transports[key]) {
      if (!connection) {
        throw new Error(`${key} has to be provided to feathers-rest`);
      }

      if (typeof options === 'function') {
        Service = options;
        options = {};
      }

      const defaultService = function (name) {
        return new Service({ base, name, connection, options });
      };

      const initialize = function (app) {
        if (typeof app.defaultService === 'function') {
          throw new Error('Only one default client provider can be configured');
        }

        app.rest = connection;
        app.defaultService = defaultService;
      };

      initialize.Service = Service;
      initialize.service = defaultService;

      return initialize;
    };
  });

  return result;
}

module.exports = Object.assign(restClient, { SuperagentClient, FetchClient, jQueryClient, RequestClient, AxiosClient, AngularClient, AngularHttpClient });
module.exports.default = restClient;
