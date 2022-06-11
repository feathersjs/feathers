import { Params } from '@feathersjs/feathers'
import { Base, RestClientParams } from './base'

export class SuperagentClient<T = any, D = Partial<T>, P extends Params = RestClientParams> extends Base<
  T,
  D,
  P
> {
  request(options: any, params: RestClientParams) {
    const superagent = this.connection(options.method, options.url)
      .set(this.options.headers || {})
      .set('Accept', 'application/json')
      .set(params.connection || {})
      .set(options.headers || {})
      .type(options.type || 'json')

    return new Promise((resolve, reject) => {
      superagent.set(options.headers)

      if (options.body) {
        superagent.send(options.body)
      }

      superagent.end(function (error: any, res: any) {
        if (error) {
          try {
            const response = error.response
            error = JSON.parse(error.response.text)
            error.response = response
          } catch (e: any) {}

          return reject(error)
        }

        resolve(res && res.body)
      })
    })
  }
}
