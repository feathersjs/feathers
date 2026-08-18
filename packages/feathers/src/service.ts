import { EventEmitter } from 'events'
import { createSymbol } from '@feathersjs/commons'
import { ServiceOptions, MethodDefinition, MethodArgument } from './declarations'

export const SERVICE = createSymbol('@feathersjs/service')

// export const defaultServiceArguments = {
//   find: ['params'],
//   get: ['id', 'params'],
//   create: ['data', 'params'],
//   update: ['id', 'data', 'params'],
//   patch: ['id', 'data', 'params'],
//   remove: ['id', 'params']
// } as Record<string, MethodArgument[]>

export const defaultServiceMethodDefinitions: MethodDefinition[] = [
  {
    key: 'find',
    // args: defaultServiceArguments.find,
    id: false,
    data: false,
    route: '',
    routeMethod: 'GET'
  },
  {
    key: 'get',
    // args: defaultServiceArguments.get,
    id: true,
    data: false,
    route: '',
    routeMethod: 'GET'
  },
  {
    key: 'create',
    // args: defaultServiceArguments.create,
    id: false,
    data: true,
    route: '',
    routeMethod: 'POST',
    eventName: 'created'
  },
  {
    key: 'update',
    // args: defaultServiceArguments.update,
    id: true,
    data: true,
    route: '',
    routeMethod: 'PUT',
    eventName: 'updated'
  },
  {
    key: 'patch',
    // args: defaultServiceArguments.patch,
    id: true,
    data: true,
    route: '',
    routeMethod: 'PATCH',
    eventName: 'patched'
  },
  {
    key: 'remove',
    // args: defaultServiceArguments.remove,
    id: true,
    data: false,
    route: '',
    routeMethod: 'DELETE',
    eventName: 'removed'
  }
]

export const defaultServiceMethods = defaultServiceMethodDefinitions.map((def) => def.key)

export const defaultEventMap = defaultServiceMethodDefinitions
  .filter((def) => !!def.eventName)
  .reduce((result, { key, eventName }) => {
    result[key] = eventName
    return result
  }, {} as Record<string, string>)

export const defaultServiceEvents = Object.values(defaultEventMap)

export const protectedMethods = Object.keys(Object.prototype)
  .concat(Object.keys(EventEmitter.prototype))
  .concat(['all', 'around', 'before', 'after', 'error', 'hooks', 'setup', 'teardown', 'publish'])

export function getHookMethods(service: any, options: ServiceOptions) {
  const { methods } = options

  return defaultServiceMethods
    .filter((m) => typeof service[m] === 'function' && !methods.includes(m))
    .concat(methods.map((m) => (typeof m === 'string' ? m : m.key)))
}

export function getServiceMethodArgs(method: string | MethodDefinition, service?: any) {
  let methodDef = method as MethodDefinition | undefined
  if (typeof method === 'string') {
    if (!service) {
      throw new Error(`Service must be provided if method is a string`)
    }
    const serviceOptions = getServiceOptions(service)
    methodDef = serviceOptions.serviceMethods?.find((def) => def.key === method)
  }
  const args = [methodDef?.id && 'id', (methodDef?.data ?? true) && 'data', 'params']
  return args.filter((arg) => arg) as MethodArgument[]
}

export function getServiceOptions(service: any): ServiceOptions {
  return service[SERVICE]
}

export const normalizeServiceOptions = (service: any, options: ServiceOptions = {}): ServiceOptions => {
  const { events = service.events || [] } = options
  const serviceEvents = options.serviceEvents || defaultServiceEvents.concat(events)

  const serviceMethods = (options.methods || defaultServiceMethodDefinitions)
    .map((def) => {
      if (typeof def === 'string') {
        return (
          defaultServiceMethodDefinitions.find((d) => d.key === def) || {
            key: def,
            id: false,
            data: true,
            route: false
          }
        )
      }
      if (typeof def.key !== 'string') {
        throw new Error(`Invalid method configuration for ${service.name || 'service'} service`)
      }
      const defaultDef = defaultServiceMethodDefinitions.find((d) => d.key === def.key)
      const data = def.data ?? defaultDef?.data ?? true
      return {
        key: def.key,
        id: def.id ?? defaultDef?.id ?? false,
        data,
        route: def.route ?? false,
        routeMethod: def.routeMethod || (data ? 'POST' : 'GET'),
        eventName: def.eventName || defaultEventMap[def.key]
      } as MethodDefinition
    })
    .filter(({ key }) => typeof service[key] === 'function')

  return {
    ...options,
    events,
    methods: serviceMethods.reduce((acc, { key }) => {
      if (!acc.includes(key)) acc.push(key)
      return acc
    }, [] as string[]),
    serviceMethods,
    serviceEvents
  }
}

export function wrapService(location: string, service: any, options: ServiceOptions) {
  // Do nothing if this is already an initialized
  if (service[SERVICE]) {
    return service
  }

  const protoService = Object.create(service)
  const serviceOptions = normalizeServiceOptions(service, options)

  if (
    Object.keys(serviceOptions.methods).length === 0 &&
    ![...defaultServiceMethods, 'setup', 'teardown'].some((method) => typeof service[method] === 'function')
  ) {
    throw new Error(`Invalid service object passed for path \`${location}\``)
  }

  Object.defineProperty(protoService, SERVICE, {
    value: serviceOptions
  })

  return protoService
}
