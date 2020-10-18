import { Base } from './base';
import { AxiosClient } from './axios';
import { FetchClient } from './fetch';
import { SuperagentClient } from './superagent';

export { AxiosClient, FetchClient, SuperagentClient };

const transports = {
  superagent: SuperagentClient,
  fetch: FetchClient,
  axios: AxiosClient
};

// interface HandlerResult extends Function {
//   /**
//    * initialize service
//    */
//   (): void;

//   /**
//    * Transport Service
//    */
//   Service: any;

//   /**
//    * default Service
//    */
//   service: any;
// }

// type Handler = (connection: any, options?: any) => () => HandlerResult;

// interface Transport {
//   jquery: Handler;
//   superagent: Handler;
//   request: Handler;
//   fetch: Handler;
//   axios: Handler;
//   angular: Handler;
//   angularHttpClient: Handler;
// }

export default function restClient (base: string = '') {
  const result: any = { Base };

  Object.keys(transports).forEach(key => {
    result[key] = function (connection: any, options: any = {}, Service: Base = (transports as any)[key]) {
      if (!connection) {
        throw new Error(`${key} has to be provided to feathers-rest`);
      }

      if (typeof options === 'function') {
        Service = options;
        options = {};
      }

      const defaultService = function (name: string) {
        return new (Service as any)({ base, name, connection, options });
      };

      const initialize = (app: any) => {
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

if (typeof module !== 'undefined') {
  module.exports = Object.assign(restClient, module.exports);
}
