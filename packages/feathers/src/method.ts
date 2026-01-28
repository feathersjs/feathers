import type { MethodOptions } from './declarations.js'

/**
 * Symbol used to store method options on service classes and methods.
 */
export const METHOD_OPTIONS = Symbol.for('@feathersjs/feathers/methodOptions')

/**
 * Client-side method configuration - only includes fields needed for HTTP calls.
 */
export type ClientMethodConfig = Pick<MethodOptions, 'args' | 'http' | 'path'>

/**
 * Map of method names to their client configuration.
 */
export type ClientMethodsConfig = Record<string, ClientMethodConfig>

/**
 * Type helper to infer service instance types from a map of service classes.
 * Used for typed client applications.
 *
 * @example
 * ```ts
 * import { type InferServiceTypes } from '@feathersjs/feathers'
 * import { MessageService } from './services/messages.service'
 * import { UserService } from './services/users.service'
 *
 * const services = {
 *   messages: MessageService,
 *   users: UserService
 * }
 *
 * type ServiceTypes = InferServiceTypes<typeof services>
 * // { messages: MessageService, users: UserService }
 * ```
 */
export type InferServiceTypes<T extends Record<string, new (...args: any[]) => any>> = {
  [K in keyof T]: InstanceType<T[K]>
}

/**
 * Retrieves method options from a service class or instance.
 * Checks: decorated methods, static `methods` property, instance `methods` property.
 *
 * @param service The service class or instance
 * @param method The method name
 * @returns The method options or undefined
 */
export function getMethodOptions(service: any, method: string): MethodOptions | undefined {
  // Check for decorator-applied options on the method itself
  const fn = service[method] || service.prototype?.[method]
  if (fn && fn[METHOD_OPTIONS]) {
    return fn[METHOD_OPTIONS]
  }

  // Check static `methods` property on class
  const staticMethods = service.constructor?.methods || service.methods
  if (staticMethods && typeof staticMethods === 'object' && !Array.isArray(staticMethods)) {
    const config = staticMethods[method]
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
export function getAllMethodOptions(service: any): Record<string, MethodOptions> {
  const result: Record<string, MethodOptions> = {}

  // For instances, check the instance methods directly (decorator stores on instance)
  // For classes/prototypes, check the prototype
  const isInstance = service.constructor && service.constructor !== Object && service.constructor !== Function
  const target = isInstance ? service : service.prototype || service

  // Get all method names from the target
  const methodNames = Object.getOwnPropertyNames(target).filter(
    (name) => typeof target[name] === 'function' && name !== 'constructor'
  )

  // Also check prototype if we're looking at an instance
  if (isInstance && service.constructor.prototype) {
    const protoNames = Object.getOwnPropertyNames(service.constructor.prototype).filter(
      (name) => typeof service.constructor.prototype[name] === 'function' && name !== 'constructor'
    )
    for (const name of protoNames) {
      if (!methodNames.includes(name)) {
        methodNames.push(name)
      }
    }
  }

  // Collect from decorated methods - check instance first, then prototype
  for (const name of methodNames) {
    const fn = target[name]
    if (fn && fn[METHOD_OPTIONS]) {
      result[name] = fn[METHOD_OPTIONS]
    }
  }

  // Collect from static `methods` property
  const staticMethods = service.constructor?.methods || service.methods
  if (staticMethods && typeof staticMethods === 'object' && !Array.isArray(staticMethods)) {
    for (const [name, config] of Object.entries(staticMethods)) {
      if (config && typeof config === 'object') {
        result[name] = config as MethodOptions
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
  return (_target: any, context: DecoratorContext) => {
    if (context.kind !== 'method') {
      throw new Error('@method decorator can only be applied to methods')
    }

    // Use the initializer to add metadata to the method
    context.addInitializer(function (this: any) {
      const methodName = String(context.name)
      const fn = this[methodName]
      if (fn) {
        fn[METHOD_OPTIONS] = options
      }
    })
  }
}

/**
 * Extracts client-side method configuration from a service class.
 * Only includes methods with custom paths (standard CRUD methods are handled automatically).
 *
 * @param ServiceClass A service class with @method decorators or static methods property
 * @returns Map of method names to their client configuration
 */
export function getClientMethodConfig(ServiceClass: new (...args: any[]) => any): ClientMethodsConfig {
  const result: ClientMethodsConfig = {}

  // Create a temporary instance to get decorated method options
  // (decorators store options on instance methods via addInitializer)
  let instance: any
  try {
    instance = new ServiceClass()
  } catch {
    // If instantiation fails, fall back to checking static/prototype properties
    instance = null
  }

  // Check for static `methods` property
  const staticMethods = (ServiceClass as any).methods
  if (staticMethods && typeof staticMethods === 'object' && !Array.isArray(staticMethods)) {
    for (const [name, config] of Object.entries(staticMethods)) {
      if (config && typeof config === 'object') {
        const methodConfig = config as MethodOptions
        // Only include methods with custom paths (client needs to know how to call them)
        if (methodConfig.path) {
          result[name] = {
            args: methodConfig.args,
            http: methodConfig.http,
            path: methodConfig.path
          }
        }
      }
    }
  }

  // Check decorated methods on instance
  if (instance) {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
      (name) => typeof instance[name] === 'function' && name !== 'constructor'
    )

    for (const name of methodNames) {
      const fn = instance[name]
      if (fn && fn[METHOD_OPTIONS]) {
        const methodConfig = fn[METHOD_OPTIONS] as MethodOptions
        // Only include methods with custom paths
        if (methodConfig.path) {
          result[name] = {
            args: methodConfig.args,
            http: methodConfig.http,
            path: methodConfig.path
          }
        }
      }
    }
  }

  return result
}

/**
 * Builds client-side method configuration from a map of service classes.
 * This is the main helper for deriving runtime config for the client.
 *
 * @example
 * ```ts
 * // server: src/client.ts
 * import { buildMethodConfig, type InferServiceTypes } from '@feathersjs/feathers'
 * import { MessageService } from './services/messages.service'
 * import { UserService } from './services/users.service'
 *
 * const services = {
 *   messages: MessageService,
 *   users: UserService
 * }
 *
 * export const serviceMethods = buildMethodConfig(services)
 * export type ServiceTypes = InferServiceTypes<typeof services>
 * ```
 *
 * ```ts
 * // client
 * import { feathers, fetchClient } from '@feathersjs/feathers'
 * import { serviceMethods, type ServiceTypes } from 'my-server/client'
 *
 * const connection = fetchClient(fetch, {
 *   baseUrl: 'http://localhost:3030',
 *   methods: serviceMethods
 * })
 *
 * const app = feathers<ServiceTypes>().configure(connection)
 * await app.service('messages').status(123) // GET /messages/123/status
 * ```
 *
 * @param services Map of service names to service classes
 * @returns Map of service names to their method configurations
 */
export function buildMethodConfig<T extends Record<string, new (...args: any[]) => any>>(
  services: T
): { [K in keyof T]: ClientMethodsConfig } {
  const result = {} as { [K in keyof T]: ClientMethodsConfig }

  for (const [name, ServiceClass] of Object.entries(services)) {
    const config = getClientMethodConfig(ServiceClass)
    // Only include services that have custom method configurations
    if (Object.keys(config).length > 0) {
      result[name as keyof T] = config
    }
  }

  return result
}
