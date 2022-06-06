import { errors } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Base, RestClientParams } from './base'

export class FetchClient<T = any, D = Partial<T>, P extends Params = RestClientParams> extends Base<T, D, P> {
  request(options: any, params: RestClientParams) {
    const fetchOptions = Object.assign({}, options, params.connection)

    fetchOptions.headers = Object.assign(
      {
        Accept: 'application/json'
      },
      this.options.headers,
      fetchOptions.headers
    )

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body)
    }

    return this.connection(options.url, fetchOptions)
      .then(this.checkStatus)
      .then((response: any) => {
        if (response.status === 204) {
          return null
        }

        return response.json()
      })
  }

  checkStatus(response: any) {
    if (response.ok) {
      return response
    }

    return response
      .json()
      .catch(() => {
        const ErrorClass = (errors as any)[response.status] || Error

        return new ErrorClass('JSON parsing error')
      })
      .then((error: any) => {
        error.response = response
        throw error
      })
  }
}
