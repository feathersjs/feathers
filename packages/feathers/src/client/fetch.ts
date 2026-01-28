import { Params, Id, Query, NullableId } from '../declarations.js'
import { BadRequest, Unavailable, convert, errors } from '../errors.js'
import { _, stripSlashes } from '../commons.js'
import { protectedProperties } from '../service.js'
import type { ClientMethodConfig, ClientMethodsConfig } from '../method.js'

// Re-export for backwards compatibility
export type { ClientMethodConfig, ClientMethodsConfig }

function toError(error: Error & { code: string }, status?: number) {
  if (error.code === 'ECONNREFUSED') {
    return new Unavailable(error.message, _.pick(error, 'address', 'port', 'config'))
  }

  return convert(error, status)
}

export interface FetchClientParams extends Params {
  connection?: any
}

interface FetchClientSettings {
  name: string
  baseUrl: string
  connection: typeof fetch
  stringify: (query: Query) => string
  events?: string[]
  /**
   * Method configuration for custom methods.
   * Allows the client to use correct HTTP verbs and paths.
   */
  methods?: ClientMethodsConfig
}

export type RequestOptions = Omit<RequestInit, 'body'> & { url: string; body?: unknown }

export class FetchClient<T = any, D = Partial<T>, P extends Params = FetchClientParams> {
  name: string
  base: string
  connection: typeof fetch
  stringify: (query: Query) => string
  events?: string[]
  methods?: ClientMethodsConfig

  constructor(settings: FetchClientSettings) {
    this.name = stripSlashes(settings.name)
    this.connection = settings.connection
    this.base = `${settings.baseUrl}/${this.name}`
    this.stringify = settings.stringify
    this.events = settings.events
    this.methods = settings.methods
  }

  makeUrl(query: Query, id?: string | number | null, route?: { [key: string]: string }) {
    let url = this.base

    if (route) {
      Object.keys(route).forEach((key) => {
        url = url.replace(`:${key}`, route[key])
      })
    }

    if (typeof id !== 'undefined' && id !== null) {
      url += `/${encodeURIComponent(id)}`
    }

    return url + this.getQuery(query || {})
  }

  getQuery(query: Query) {
    const queryString = this.stringify(query)

    return queryString ? `?${queryString}` : ''
  }

  async request(options: RequestOptions, params: FetchClientParams = {}) {
    const { url, ...requestInit } = options
    const fetchOptions: RequestInit = {
      ...requestInit,
      ...params.connection
    }

    fetchOptions.headers = {
      Accept: 'application/json',
      ...fetchOptions.headers,
      ...params.headers
    }

    if (options.body) {
      // Pass through FormData directly (browser sets Content-Type with boundary)
      if (options.body instanceof FormData) {
        fetchOptions.body = options.body
      } else if (options.body instanceof ReadableStream) {
        // Pass through ReadableStream directly for streaming uploads
        fetchOptions.body = options.body
        // @ts-expect-error duplex is required for streaming bodies
        fetchOptions.duplex = 'half'
        // Default to application/octet-stream if no Content-Type specified
        fetchOptions.headers = {
          'Content-Type': 'application/octet-stream',
          ...fetchOptions.headers
        }
      } else {
        fetchOptions.body = JSON.stringify(options.body)
        fetchOptions.headers = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        }
      }
    }

    const response = await this.connection(url, fetchOptions)

    await this.checkStatus(response)

    if (response.status === 204) {
      return null
    }

    if (response.headers.get('content-type') === 'text/event-stream') {
      return this.handleEventStream(response)
    }

    return response.json()
  }

  /**
   * Makes URL for a custom method with a path pattern.
   * Replaces :id with the id value and other placeholders with route params.
   */
  makeCustomUrl(path: string, query: Query, id?: string | number | null, route?: { [key: string]: string }) {
    // Replace :id with the actual id value
    let resolvedPath = path
    if (id !== null && id !== undefined) {
      resolvedPath = resolvedPath.replace(/:id\b/, encodeURIComponent(String(id)))
    }

    // Replace other route params
    if (route) {
      Object.keys(route).forEach((key) => {
        resolvedPath = resolvedPath.replace(`:${key}`, route[key])
      })
    }

    const url = `${this.base}/${resolvedPath}`
    return url + this.getQuery(query || {})
  }

  /**
   * Calls a custom service method.
   * If method config is available, uses the correct HTTP verb and path.
   * Otherwise falls back to POST with X-Service-Method header.
   */
  callCustomMethod(method: string, ...args: any[]) {
    const methodConfig = this.methods?.[method]

    if (methodConfig?.path) {
      // Use configured HTTP verb and path
      return this.callWithPath(method, methodConfig, args)
    }

    // Fall back to header-based custom method (backwards compatible)
    const [body, params = {}] = args as [unknown, FetchClientParams]
    return this.request(
      {
        url: this.makeUrl(params?.query, null, params?.route),
        method: 'POST',
        headers: {
          'X-Service-Method': method
        },
        body
      },
      params
    )
  }

  /**
   * Calls a custom method using the configured path and HTTP verb.
   */
  protected callWithPath(_method: string, config: ClientMethodConfig, args: any[]) {
    const { http = 'POST', path, args: argNames = ['data', 'params'] } = config

    // Build argument map
    const argMap: { id?: Id; data?: unknown; params?: FetchClientParams } = {}
    argNames.forEach((name, index) => {
      if (name === 'id') argMap.id = args[index]
      else if (name === 'data') argMap.data = args[index]
      else if (name === 'params') argMap.params = args[index] || {}
    })

    const params = argMap.params || {}
    const url = this.makeCustomUrl(path!, params.query, argMap.id, params.route)

    // Only include body for methods that support it
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(http!)
    const body = hasBody ? argMap.data : undefined

    return this.request(
      {
        url,
        method: http!,
        body
      },
      params
    )
  }

  async *handleEventStream(res: Response) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      if (value) {
        const text = decoder.decode(value)
        const eventChunks = text.split('\n\n').filter(Boolean)

        for (const chunk of eventChunks) {
          const lines = chunk.split('\n')
          const dataLine = lines.find((line) => line.startsWith('data: '))

          if (dataLine) {
            yield JSON.parse(dataLine.substring('data: '.length))
          }
        }
      }
    }
  }

  async checkStatus(response: Response) {
    if (response.ok) {
      return response
    }

    const ErrorClass = (errors as any)[response.status] || Error

    let error: Error & { response: Response } = new ErrorClass('JSON parsing error')

    try {
      const data = await response.json()

      error = await toError(data, response.status)
    } catch (_error) {}

    error.response = response

    throw error
  }

  _find(params?: P) {
    return this.request(
      {
        url: this.makeUrl(params.query, null, params.route),
        method: 'GET',
        headers: Object.assign({}, params.headers)
      },
      params
    )
  }

  find(params?: P) {
    return this._find(params)
  }

  async _get(id: Id, params?: P) {
    if (id === null || typeof id === 'undefined') {
      throw new BadRequest("id for 'get' can not be null of undefined")
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        method: 'GET'
      },
      params
    )
  }

  get(id: Id, params?: P) {
    return this._get(id, params)
  }

  _create(data: D, params?: P) {
    return this.request(
      {
        url: this.makeUrl(params.query, null, params.route),
        body: data,
        method: 'POST'
      },
      params
    )
  }

  create(data: D, params?: P) {
    return this._create(data, params)
  }

  async _update(id: NullableId, data: D, params?: P) {
    if (typeof id === 'undefined') {
      throw new Error("id for 'update' can not be undefined, only 'null' when updating multiple entries")
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        body: data,
        method: 'PUT'
      },
      params
    )
  }

  update(id: NullableId, data: D, params?: P) {
    return this._update(id, data, params)
  }

  async _patch(id: NullableId, data: D, params?: P) {
    if (typeof id === 'undefined') {
      throw new Error("id for 'patch' can not be undefined, only 'null' when updating multiple entries")
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        body: data,
        method: 'PATCH'
      },
      params
    )
  }

  patch(id: NullableId, data: D, params?: P) {
    return this._patch(id, data, params)
  }

  async _remove(id: NullableId, params?: P) {
    if (typeof id === 'undefined') {
      throw new Error("id for 'remove' can not be undefined, only 'null' when removing multiple entries")
    }

    return this.request(
      {
        url: this.makeUrl(params.query, id, params.route),
        method: 'DELETE'
      },
      params
    )
  }

  remove(id: NullableId, params?: P) {
    return this._remove(id, params)
  }
}

export class ProxiedFetchClient<
  T = any,
  D = Partial<T>,
  P extends Params = FetchClientParams
> extends FetchClient<T, D, P> {
  constructor(settings: FetchClientSettings) {
    super(settings)

    // Create and return a proxy after construction is complete
    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver)
        if (value !== undefined) {
          return value
        }

        // Proxy other custom methods
        if (
          typeof prop === 'string' &&
          !prop.startsWith('_') &&
          !prop.startsWith('Symbol(') &&
          !protectedProperties.includes(prop)
        ) {
          // Pass all arguments to callCustomMethod
          return function (...args: any[]) {
            return target.callCustomMethod(prop, ...args)
          }
        }

        return undefined
      }
    })

    return proxy
  }
}
