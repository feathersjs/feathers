import { EventEmitter } from 'events'
import { createSymbol } from './commons.js'
import {
  MethodOptions,
  ServiceOptions,
  NormalizedServiceOptions,
  MethodsConfig,
  MethodConfig
} from './declarations.js'
import { getMethodOptions, getAllMethodOptions } from './method.js'

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

/**
 * Default method options for standard service methods.
 */
export const defaultMethodOptions: Record<string, MethodOptions> = {
  find: { args: ['params'], http: 'GET', external: true },
  get: { args: ['id', 'params'], http: 'GET', external: true },
  create: { args: ['data', 'params'], http: 'POST', external: true, event: 'created' },
  update: { args: ['id', 'data', 'params'], http: 'PUT', external: true, event: 'updated' },
  patch: { args: ['id', 'data', 'params'], http: 'PATCH', external: true, event: 'patched' },
  remove: { args: ['id', 'params'], http: 'DELETE', external: true, event: 'removed' }
}

/**
 * Default method options for custom methods.
 */
export const defaultCustomMethodOptions: MethodOptions = {
  args: ['data', 'params'],
  http: 'POST',
  external: true
}

export const defaultEventMap = {
  create: 'created',
  update: 'updated',
  patch: 'patched',
  remove: 'removed'
}

export const defaultServiceEvents = Object.values(defaultEventMap)

export const protectedMethods = Object.keys(Object.prototype)
  .concat(Object.keys(EventEmitter.prototype))
  .concat([
    'all',
    'around',
    'before',
    'after',
    'error',
    'hooks',
    'setup',
    'teardown',
    'publish',
    'registerPublisher'
  ])

export const protectedProperties = protectedMethods.concat(['service', 'events', 'id'])

export function getHookMethods(service: any, options: NormalizedServiceOptions) {
  const { methods } = options

  return (defaultServiceMethods as string[])
    .filter((m) => typeof service[m] === 'function' && !methods.includes(m))
    .concat(methods)
}

export function getServiceOptions(service: any): NormalizedServiceOptions {
  return service[SERVICE]
}

/**
 * Checks if a methods config is an array (backwards compatible) or object (new format).
 */
function isMethodsArray(methods: any): methods is string[] | readonly string[] {
  return Array.isArray(methods)
}

/**
 * Normalizes the method options for a single method by merging all config sources.
 *
 * Precedence order (highest to lowest):
 * 1. app.use() options
 * 2. @method decorator on the method
 * 3. Static `methods` property on service class
 * 4. Default standard method config (find, get, create, etc.)
 * 5. Default custom method config
 *
 * @param service The service instance
 * @param methodName The method name
 * @param useOptions The method config from app.use() options (if any)
 * @returns Normalized MethodOptions
 */
export function normalizeMethodConfig(
  service: any,
  methodName: string,
  useOptions?: MethodConfig
): MethodOptions {
  // Start with defaults based on whether it's a standard method
  const isStandardMethod = defaultServiceMethods.includes(methodName)
  const defaults = isStandardMethod ? defaultMethodOptions[methodName] : defaultCustomMethodOptions

  // Get decorator/static options from the service
  const decoratorOptions = getMethodOptions(service, methodName)

  // Merge in order of precedence (later overrides earlier)
  let result: MethodOptions = { ...defaults }

  // Apply decorator/static options
  if (decoratorOptions) {
    result = { ...result, ...decoratorOptions }
  }

  // Apply app.use() options (highest priority)
  if (useOptions !== undefined && useOptions !== true) {
    if (useOptions === false) {
      // false means disabled - but this shouldn't happen in normalizeMethodConfig
      // as we filter these out before calling
      result = { ...result, external: false }
    } else if (typeof useOptions === 'object') {
      result = { ...result, ...useOptions }
    }
  }

  return result
}

/**
 * Normalizes all method options for a service.
 *
 * @param service The service instance
 * @param methodsOption The methods option from app.use() (can be array or object)
 * @returns Record of method names to their normalized MethodOptions
 */
export function normalizeAllMethodOptions(
  service: any,
  methodsOption?: string[] | readonly string[] | MethodsConfig
): Record<string, MethodOptions> {
  const result: Record<string, MethodOptions> = {}

  // Determine which methods are available
  let methodNames: string[]

  if (isMethodsArray(methodsOption)) {
    // Backwards compatible: array of method names
    methodNames = [...methodsOption]
  } else if (methodsOption && typeof methodsOption === 'object') {
    // New format: object with method configs
    // Include all keys that are not explicitly false
    methodNames = Object.keys(methodsOption).filter((name) => methodsOption[name] !== false)
  } else {
    // No option provided: use standard methods that exist on the service
    // plus any decorated custom methods
    methodNames = defaultServiceMethods.filter((m) => typeof service[m] === 'function')

    // Add decorated custom methods
    const decoratedMethods = getAllMethodOptions(service)
    for (const name of Object.keys(decoratedMethods)) {
      if (!methodNames.includes(name) && typeof service[name] === 'function') {
        methodNames.push(name)
      }
    }
  }

  // Normalize each method
  for (const methodName of methodNames) {
    const useConfig = isMethodsArray(methodsOption) ? true : methodsOption?.[methodName]
    result[methodName] = normalizeMethodConfig(service, methodName, useConfig)
  }

  return result
}

export const normalizeServiceOptions = (
  service: any,
  options: ServiceOptions = {}
): NormalizedServiceOptions => {
  const { methods: methodsOption, events = service.events || [] } = options

  // Normalize method options
  const methodOptions = normalizeAllMethodOptions(service, methodsOption)

  // Extract method names for backwards compatibility
  const methods = Object.keys(methodOptions)

  const serviceEvents = options.serviceEvents || defaultServiceEvents.concat(events)

  return {
    ...options,
    events,
    methods,
    serviceEvents,
    methodOptions
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
