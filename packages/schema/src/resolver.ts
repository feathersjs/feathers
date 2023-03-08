import { BadRequest } from '@feathersjs/errors'
import { Schema } from './schema'

export type PropertyResolver<T, V, C> = ((
  value: V | undefined,
  obj: T,
  context: C,
  status: ResolverStatus<T, C>
) => Promise<V | undefined>) & { [IS_VIRTUAL]?: boolean }

export type VirtualResolver<T, V, C> = (
  obj: T,
  context: C,
  status: ResolverStatus<T, C>
) => Promise<V | undefined>

export const IS_VIRTUAL = Symbol.for('@feathersjs/schema/virtual')

/**
 * Create a resolver for a virtual property. A virtual property is a property that
 * is computed and never has an initial value.
 *
 * @param virtualResolver The virtual resolver function
 * @returns The property resolver function
 */
export const virtual = <T, V, C>(virtualResolver: VirtualResolver<T, V, C>) => {
  const propertyResolver: PropertyResolver<T, V, C> = async (_value, obj, context, status) =>
    virtualResolver(obj, context, status)

  propertyResolver[IS_VIRTUAL] = true

  return propertyResolver
}

export type PropertyResolverMap<T, C> = {
  [key in keyof T]?: PropertyResolver<T, T[key], C> | ReturnType<typeof virtual<T, T[key], C>>
}

export type ResolverConverter<T, C> = (
  obj: any,
  context: C,
  status: ResolverStatus<T, C>
) => Promise<T | undefined>

export interface ResolverOptions<T, C> {
  schema?: Schema<T>
  /**
   * A converter function that is run before property resolvers
   * to transform the initial data into a different format.
   */
  converter?: ResolverConverter<T, C>
}

export interface ResolverConfig<T, C> extends ResolverOptions<T, C> {
  /**
   * @deprecated Use the `validateData` and `validateQuery` hooks explicitly instead
   */
  validate?: 'before' | 'after' | false
  /**
   * The properties to resolve
   */
  properties: PropertyResolverMap<T, C>
}

export interface ResolverStatus<T, C> {
  path: string[]
  originalContext?: C
  properties?: (keyof T)[]
  stack: PropertyResolver<T, any, C>[]
}

export class Resolver<T, C> {
  readonly _type!: T
  public propertyNames: (keyof T)[]
  public virtualNames: (keyof T)[]

  constructor(public readonly options: ResolverConfig<T, C>) {
    this.propertyNames = Object.keys(options.properties) as any as (keyof T)[]
    this.virtualNames = this.propertyNames.filter((name) => options.properties[name][IS_VIRTUAL])
  }

  /**
   * Resolve a single property
   *
   * @param name The name of the property
   * @param data The current data
   * @param context The current resolver context
   * @param status The current resolver status
   * @returns The resolver property
   */
  async resolveProperty<D, K extends keyof T>(
    name: K,
    data: D,
    context: C,
    status: Partial<ResolverStatus<T, C>> = {}
  ): Promise<T[K]> {
    const resolver = this.options.properties[name]
    const value = (data as any)[name]
    const { path = [], stack = [] } = status || {}

    // This prevents circular dependencies
    if (stack.includes(resolver)) {
      return undefined
    }

    const resolverStatus = {
      ...status,
      path: [...path, name as string],
      stack: [...stack, resolver]
    }

    return resolver(value, data as any, context, resolverStatus)
  }

  async convert<D>(data: D, context: C, status?: Partial<ResolverStatus<T, C>>) {
    if (this.options.converter) {
      const { path = [], stack = [] } = status || {}

      return this.options.converter(data, context, { ...status, path, stack })
    }

    return data
  }

  async resolve<D>(_data: D, context: C, status?: Partial<ResolverStatus<T, C>>): Promise<T> {
    const { properties: resolvers, schema, validate } = this.options
    const payload = await this.convert(_data, context, status)

    if (!Array.isArray(status?.properties) && this.propertyNames.length === 0) {
      return payload as T
    }

    const data = schema && validate === 'before' ? await schema.validate(payload) : payload
    const propertyList = (
      Array.isArray(status?.properties)
        ? status?.properties
        : // By default get all data and resolver keys but remove duplicates
          [...new Set(Object.keys(data).concat(this.propertyNames as string[]))]
    ) as (keyof T)[]

    const result: any = {}
    const errors: any = {}
    let hasErrors = false

    // Not the most elegant but better performance
    await Promise.all(
      propertyList.map(async (name) => {
        const value = (data as any)[name]

        if (resolvers[name]) {
          try {
            const resolved = await this.resolveProperty(name, data, context, status)

            if (resolved !== undefined) {
              result[name] = resolved
            }
          } catch (error: any) {
            // TODO add error stacks
            const convertedError =
              typeof error.toJSON === 'function' ? error.toJSON() : { message: error.message || error }

            errors[name] = convertedError
            hasErrors = true
          }
        } else if (value !== undefined) {
          result[name] = value
        }
      })
    )

    if (hasErrors) {
      const propertyName = status?.properties ? ` ${status.properties.join('.')}` : ''

      throw new BadRequest('Error resolving data' + (propertyName ? ` ${propertyName}` : ''), errors)
    }

    return schema && validate === 'after' ? await schema.validate(result) : result
  }
}

/**
 * Create a new resolver with `<DataType, ContextType>`.
 *
 * @param options The configuration for the returned resolver
 * @returns A new resolver instance
 */
export function resolve<T, C>(
  properties: PropertyResolverMap<T, C>,
  options?: ResolverOptions<T, C>
): Resolver<T, C>
export function resolve<T, C>(options: ResolverConfig<T, C>): Resolver<T, C>
export function resolve<T, C>(
  properties: PropertyResolverMap<T, C> | ResolverConfig<T, C>,
  options?: ResolverOptions<T, C>
) {
  const settings = (
    (properties as ResolverConfig<T, C>).properties ? properties : { properties, ...options }
  ) as ResolverConfig<T, C>

  return new Resolver<T, C>(settings)
}
