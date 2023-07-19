import {
  HookContext,
  Application,
  RealTimeConnection,
  createContext,
  getServiceOptions
} from '@feathersjs/feathers'
import { NotFound, MethodNotAllowed, BadRequest } from '@feathersjs/errors'
import { createDebug } from '@feathersjs/commons'
import isEqual from 'lodash/isEqual'
import { CombinedChannel } from '../channels/channel/combined'

const debug = createDebug('@feathersjs/transport-commons')

export const DEFAULT_PARAMS_POSITION = 1

export const paramsPositions: { [key: string]: number } = {
  find: 0,
  update: 2,
  patch: 2
}

export function normalizeError(e: any) {
  const hasToJSON = typeof e.toJSON === 'function'
  const result = hasToJSON ? e.toJSON() : {}

  if (!hasToJSON) {
    Object.getOwnPropertyNames(e).forEach((key) => {
      result[key] = e[key]
    })
  }

  if (process.env.NODE_ENV === 'production') {
    delete result.stack
  }

  delete result.hook

  return result
}

export function getDispatcher(emit: string, socketMap: WeakMap<RealTimeConnection, any>, socketKey?: any) {
  return function (event: string, channel: CombinedChannel, context: HookContext, data?: any) {
    debug(`Dispatching '${event}' to ${channel.length} connections`)

    channel.connections.forEach((connection) => {
      // The reference between connection and socket is set in `app.setup`
      const socket = socketKey ? connection[socketKey] : socketMap.get(connection)

      if (socket) {
        const eventName = `${context.path || ''} ${event}`.trim()

        let result = channel.dataFor(connection) || context.dispatch || context.result

        // If we are getting events from an array but try to dispatch individual data
        // try to get the individual item to dispatch from the correct index.
        if (!Array.isArray(data) && Array.isArray(context.result) && Array.isArray(result)) {
          result = result.find((resultData) => isEqual(resultData, data))
        }

        debug(`Dispatching '${eventName}' to Socket ${socket.id} with`, result)

        socket[emit](eventName, result)
      }
    })
  }
}

export async function runMethod(
  app: Application,
  connection: RealTimeConnection,
  _path: string,
  _method: string,
  args: any[]
) {
  const path = typeof _path === 'string' ? _path : null
  const method = typeof _method === 'string' ? _method : null
  const trace = `method '${method}' on service '${path}'`
  const methodArgs = args.slice(0)
  const callback =
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    typeof methodArgs[methodArgs.length - 1] === 'function' ? methodArgs.pop() : function () {}

  debug(`Running ${trace}`, connection, args)

  const handleError = (error: any) => {
    debug(`Error in ${trace}`, error)
    callback(normalizeError(error))
  }

  try {
    const lookup = app.lookup(path)

    // No valid service was found throw a NotFound error
    if (lookup === null) {
      throw new NotFound(path === null ? `Invalid service path` : `Service '${path}' not found`)
    }

    const { service, params: route = {} } = lookup
    const { methods } = getServiceOptions(service)

    // Only service methods are allowed
    if (!methods.includes(method)) {
      throw new MethodNotAllowed(`Method '${method}' not allowed on service '${path}'`)
    }

    const position = paramsPositions[method] !== undefined ? paramsPositions[method] : DEFAULT_PARAMS_POSITION
    const query = Object.assign({}, methodArgs[position])
    // `params` have to be re-mapped to the query and added with the route
    const params = Object.assign({ query, route, connection }, connection)

    // `params` is always the last parameter. Error if we got more arguments.
    if (methodArgs.length > position + 1) {
      throw new BadRequest(`Too many arguments for '${method}' method`)
    }

    methodArgs[position] = params

    const ctx = createContext(service, method)
    const returnedCtx: HookContext = await (service as any)[method](...methodArgs, ctx)
    const result = returnedCtx.dispatch || returnedCtx.result

    debug(`Returned successfully ${trace}`, result)
    callback(null, result)
  } catch (error: any) {
    handleError(error)
  }
}
