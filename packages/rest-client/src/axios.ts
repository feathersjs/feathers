import { Params } from '@feathersjs/feathers'
import { Base, RestClientParams } from './base'

export class AxiosClient<T = any, D = Partial<T>, P extends Params = RestClientParams> extends Base<T, D, P> {
  request(options: any, params: RestClientParams) {
    const config = Object.assign(
      {
        url: options.url,
        method: options.method,
        data: options.body,
        headers: Object.assign(
          {
            Accept: 'application/json'
          },
          this.options.headers,
          options.headers
        )
      },
      params.connection
    )

    return this.connection
      .request(config)
      .then((res: any) => res.data)
      .catch((error: any) => {
        const response = error.response || error

        throw response instanceof Error ? response : response.data || response
      })
  }
}
