import { EventEmitter } from 'events'
import { createSymbol } from '@feathersjs/commons'
import { ServiceOptions } from './declarations'

export const SERVICE = createSymbol('@feathersjs/service')

export const defaultServiceArguments = {
  find: ['params'],
  get: ['id', 'params'],
  create: ['data', 'params'],
  update: ['id', 'data', 'params'],
  patch: ['id', 'data', 'params'],
  remove: ['id', 'params']
}
export const defaultServiceMethods = ['find', 'get', 'create', 'update', 'patch', 'remove']

export const defaultEventMap = {
  create: 'created',
  update: 'updated',
  patch: 'patched',
  remove: 'removed'
}

export const protectedMethods = Object.keys(Object.prototype)
  .concat(Object.keys(EventEmitter.prototype))
  .concat(['all', 'around', 'before', 'after', 'error', 'hooks', 'setup', 'teardown', 'publish'])

export function getHookMethods(service: any, options: ServiceOptions) {
  const { methods } = options

  return (defaultServiceMethods as any as string[])
    .filter((m) => typeof service[m] === 'function' && !methods.includes(m))
    .concat(methods)
}

export function getServiceOptions(service: any, options: ServiceOptions = {}): ServiceOptions {
  const existingOptions = service[SERVICE]

  if (existingOptions) {
    return existingOptions
  }

  const {
    methods = defaultServiceMethods.filter((method) => typeof service[method] === 'function'),
    events = service.events || []
  } = options
  const { serviceEvents = Object.values(defaultEventMap).concat(events) } = options

  return {
    ...options,
    events,
    methods,
    serviceEvents
  }
}

export function wrapService(location: string, service: any, options: ServiceOptions) {
  // Do nothing if this is already an initialized
  if (service[SERVICE]) {
    return service
  }

  const protoService = Object.create(service)
  const serviceOptions = getServiceOptions(service, options)

  if (Object.keys(serviceOptions.methods).length === 0 && typeof service.setup !== 'function') {
    throw new Error(`Invalid service object passed for path \`${location}\``)
  }

  Object.defineProperty(protoService, SERVICE, {
    value: serviceOptions
  })

  return protoService
}
