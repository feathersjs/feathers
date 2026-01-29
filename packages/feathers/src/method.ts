import type { MethodOptions } from './declarations.js'

/**
 * Symbol used to store method options on service classes and methods.
 */
export const METHOD_OPTIONS = Symbol.for('@feathersjs/feathers/methodOptions')

/**
 * A function that may have method options attached.
 */
type MethodWithOptions = ((...args: unknown[]) => unknown) & {
  [METHOD_OPTIONS]?: MethodOptions
}

/**
 * A constructor function type.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Constructor = Function

/**
 * A service instance or class that may have methods with options.
 */
interface ServiceWithMethods {
  constructor?: Constructor & {
    methods?: Record<string, MethodOptions | boolean>
    prototype?: Record<string, unknown>
  }
  methods?: Record<string, MethodOptions | boolean>
  prototype?: Record<string, unknown>
}

/**
 * Client-side method configuration - only includes fields needed for HTTP calls.
 */
export type ClientMethodConfig = Pick<MethodOptions, 'args' | 'http' | 'path'>

/**
 * Map of method names to their client configuration.
 */
export type ClientMethodsConfig = Record<string, ClientMethodConfig>

/**
 * Map of service names to their method configurations.
 * Used for client-side configuration.
 */
export type ServiceMethodsConfig = Record<string, ClientMethodsConfig>

/**
 * Prepares service method configurations for the client.
 * Filters out internal methods (external: false) and methods without paths,
 * and strips server-only properties (external, event).
 *
 * @example
 * ```ts
 * // server: src/client.ts
 * import { clientMethods } from '@feathersjs/feathers'
 * import { MessageService } from './services/messages.service'
 * import { UserService } from './services/users.service'
 *
 * export const serviceMethods = clientMethods({
 *   messages: MessageService.methods,
 *   users: UserService.methods
 * })
 *
 * export type ServiceTypes = {
 *   messages: MessageService
 *   users: UserService
 * }
 * ```
 *
 * ```ts
 * // client
 * import { feathers, fetchClient } from '@feathersjs/feathers'
 * import { serviceMethods, type ServiceTypes } from 'my-server/client'
 *
 * const app = feathers<ServiceTypes>()
 *   .configure(fetchClient(fetch, {
 *     baseUrl: 'http://localhost:3030',
 *     methods: serviceMethods
 *   }))
 *
 * await app.service('messages').status('123') // GET /messages/123/status
 * ```
 *
 * @param services Map of service names to their method configurations
 * @returns Filtered map suitable for client use
 */
export function clientMethods(
  services: Record<string, Record<string, MethodOptions | boolean> | undefined>
): ServiceMethodsConfig {
  const result: ServiceMethodsConfig = {}

  for (const [serviceName, methods] of Object.entries(services)) {
    if (!methods) continue

    const filtered: ClientMethodsConfig = {}

    for (const [methodName, config] of Object.entries(methods)) {
      // Skip boolean configs and methods without paths
      if (!config || typeof config === 'boolean') continue

      // Skip internal-only methods
      if (config.external === false) continue

      // Only include methods with custom paths (standard CRUD is handled automatically)
      if (config.path) {
        filtered[methodName] = {
          args: config.args,
          http: config.http,
          path: config.path
        }
      }
    }

    if (Object.keys(filtered).length > 0) {
      result[serviceName] = filtered
    }
  }

  return result
}

/**
 * Retrieves method options from a service class or instance.
 * Checks: decorated methods, static `methods` property, instance `methods` property.
 *
 * @param service The service class or instance
 * @param methodName The method name
 * @returns The method options or undefined
 */
export function getMethodOptions(service: object, methodName: string): MethodOptions | undefined {
  const svc = service as ServiceWithMethods
  // Check for decorator-applied options on the method itself
  const fn = ((svc as Record<string, unknown>)[methodName] || svc.prototype?.[methodName]) as
    | MethodWithOptions
    | undefined
  if (fn && fn[METHOD_OPTIONS]) {
    return fn[METHOD_OPTIONS]
  }

  // Check static `methods` property on class
  const staticMethods = svc.constructor?.methods || svc.methods
  if (staticMethods && typeof staticMethods === 'object' && !Array.isArray(staticMethods)) {
    const config = staticMethods[methodName]
    if (config && typeof config === 'object') {
      return config
    }
  }

  return undefined
}

/**
 * Collects all method options from a service class or instance.
 * Returns a map of method names to their options.
 *
 * @param service The service class or instance
 * @returns Map of method names to MethodOptions
 */
export function getAllMethodOptions(service: object): Record<string, MethodOptions> {
  const svc = service as ServiceWithMethods
  const result: Record<string, MethodOptions> = {}

  // For instances, check the instance methods directly (decorator stores on instance)
  // For classes/prototypes, check the prototype
  const ctor = svc.constructor as Constructor | undefined
  const isInstance = ctor && ctor !== Object && ctor !== Function
  const target = (isInstance ? svc : svc.prototype || svc) as Record<string, unknown>

  // Get all method names from the target
  const methodNames = Object.getOwnPropertyNames(target).filter(
    (name) => typeof target[name] === 'function' && name !== 'constructor'
  )

  // Also check prototype if we're looking at an instance
  if (isInstance && svc.constructor?.prototype) {
    const proto = svc.constructor.prototype as Record<string, unknown>
    const protoNames = Object.getOwnPropertyNames(proto).filter(
      (name) => typeof proto[name] === 'function' && name !== 'constructor'
    )
    for (const name of protoNames) {
      if (!methodNames.includes(name)) {
        methodNames.push(name)
      }
    }
  }

  // Collect from decorated methods - check instance first, then prototype
  for (const name of methodNames) {
    const fn = target[name] as MethodWithOptions | undefined
    if (fn && fn[METHOD_OPTIONS]) {
      result[name] = fn[METHOD_OPTIONS]
    }
  }

  // Collect from static `methods` property
  const staticMethods = svc.constructor?.methods || svc.methods
  if (staticMethods && typeof staticMethods === 'object' && !Array.isArray(staticMethods)) {
    for (const [name, config] of Object.entries(staticMethods)) {
      if (config && typeof config === 'object') {
        result[name] = config
      }
    }
  }

  return result
}

/**
 * Decorator to configure a service method.
 *
 * @example
 * ```ts
 * class MessageService {
 *   @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
 *   async status(id: Id, params: Params) {
 *     return { status: 'active' }
 *   }
 * }
 * ```
 *
 * @param options Method configuration options
 */
export function method(options: MethodOptions = {}) {
  return (_target: unknown, context: DecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error('@method decorator can only be applied to methods')
    }

    // Use the initializer to add metadata to the method
    context.addInitializer(function () {
      const self = this as Record<string, MethodWithOptions>
      const methodName = String(context.name)
      const fn = self[methodName]
      if (fn) {
        fn[METHOD_OPTIONS] = options
      }
    })
  }
}
