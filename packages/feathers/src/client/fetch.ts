import { Params, Id, Query, NullableId, ServiceInterface } from '../declarations.js'
import { Unavailable, convert, errors } from '../errors.js'
import { _, stripSlashes } from '../commons.js'

function toError(error: Error & { code: string }) {
  if (error.code === 'ECONNREFUSED') {
    throw new Unavailable(error.message, _.pick(error, 'address', 'port', 'config'))
  }

  throw convert(error)
}

export interface RestClientParams extends Params {
  connection?: any
}

interface RestClientSettings {
  name: string
  base: string
  connection: any
  options: any
}

export abstract class Base<T = any, D = Partial<T>, P extends Params = RestClientParams>
  implements ServiceInterface<T, D, P>
{
  name: string
  base: string
  connection: any
  options: any

  constructor(settings: RestClientSettings) {
    this.name = stripSlashes(settings.name)
    this.options = settings.options
    this.connection = settings.connection
    this.base = `${settings.base}/${this.name}`
  }

  makeUrl(query: Query, id?: string | number | null, route?: { [key: string]: string }) {
    let url = this.base

    if (route) {
      Object.keys(route).forEach((key) => {
        url = url.replace(`:${key}`, route[key])
      })
    }

    query = query || {}

    if (typeof id !== 'undefined' && id !== null) {
      url += `/${encodeURIComponent(id)}`
    }

    return url + this.getQuery(query)
  }

  getQuery(query: Query) {
    if (Object.keys(query).length !== 0) {
      const searchParams = new URLSearchParams()

      // Add each query parameter to URLSearchParams
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            // Handle array values
            value.forEach((item) => searchParams.append(key, String(item)))
          } else if (typeof value === 'object' && value !== null) {
            // Handle object values by stringifying them
            searchParams.append(key, JSON.stringify(value))
          } else {
            // Handle primitive values
            searchParams.append(key, String(value))
          }
        }
      })

      const queryString = searchParams.toString()
      return queryString ? `?${queryString}` : ''
    }

    return ''
  }

  abstract request(options: any, params: P): any

  _find(params?: P) {
    return this.request(
      {
        url: this.makeUrl(params.query, null, params.route),
        method: 'GET',
        headers: Object.assign({}, params.headers)
      },
      params
    ).catch(toError)
  }

  find(params?: P) {
    return this._find(params)
  }

  _get(id: Id, params?: P) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error("id for 'get' can not be undefined"))
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        method: 'GET',
        headers: Object.assign({}, params.headers)
      },
      params
    ).catch(toError)
  }

  get(id: Id, params?: P) {
    return this._get(id, params)
  }

  _create(data: D, params?: P) {
    return this.request(
      {
        url: this.makeUrl(params.query, null, params.route),
        body: data,
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
      },
      params
    ).catch(toError)
  }

  create(data: D, params?: P) {
    return this._create(data, params)
  }

  _update(id: NullableId, data: D, params?: P) {
    if (typeof id === 'undefined') {
      return Promise.reject(
        new Error("id for 'update' can not be undefined, only 'null' when updating multiple entries")
      )
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        body: data,
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
      },
      params
    ).catch(toError)
  }

  update(id: NullableId, data: D, params?: P) {
    return this._update(id, data, params)
  }

  _patch(id: NullableId, data: D, params?: P) {
    if (typeof id === 'undefined') {
      return Promise.reject(
        new Error("id for 'patch' can not be undefined, only 'null' when updating multiple entries")
      )
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        body: data,
        method: 'PATCH',
        headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
      },
      params
    ).catch(toError)
  }

  patch(id: NullableId, data: D, params?: P) {
    return this._patch(id, data, params)
  }

  _remove(id: NullableId, params?: P) {
    if (typeof id === 'undefined') {
      return Promise.reject(
        new Error("id for 'remove' can not be undefined, only 'null' when removing multiple entries")
      )
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        method: 'DELETE',
        headers: Object.assign({}, params.headers)
      },
      params
    ).catch(toError)
  }

  remove(id: NullableId, params?: P) {
    return this._remove(id, params)
  }
}

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
