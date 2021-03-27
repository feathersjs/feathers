import { Params } from '@feathersjs/feathers';
import { errors } from '@feathersjs/errors';
import { Base } from './base';

export class FetchClient extends Base {
  request (options: any, params: Params) {
    const fetchOptions = Object.assign({}, options, params.connection);

    fetchOptions.headers = Object.assign({
      Accept: 'application/json'
    }, this.options.headers, fetchOptions.headers);

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    return this.connection(options.url, fetchOptions)
      .then(this.checkStatus)
      .then((response: any) => {
        if (response.status === 204) {
          return null;
        }

        return response.json();
      });
  }

  checkStatus (response: any) {
    if (response.ok) {
      return response;
    }

    return response.json().catch(() => {
      const ErrorClass = (errors as any)[response.status] || Error;

      return new ErrorClass('JSON parsing error');
    }).then((error: any) => {
      error.response = response;
      throw error;
    });
  }
}
