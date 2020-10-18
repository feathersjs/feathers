import { Params } from '@feathersjs/feathers';
import { Base } from './base';

export class AxiosClient extends Base {
  request (options: any, params: Params) {
    const config = Object.assign({
      url: options.url,
      method: options.method,
      data: options.body,
      headers: Object.assign({
        Accept: 'application/json'
      }, this.options.headers, options.headers)
    }, params.connection);

    return this.connection.request(config)
      .then((res: any) => res.data)
      .catch((error: any) => {
        const response = error.response || error;

        throw response instanceof Error ? response : (response.data || response);
      });
  }
}
