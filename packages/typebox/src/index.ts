import {
  Type,
  TObject,
  TInteger,
  TOptional,
  TSchema,
  ObjectOptions,
  TIntersect,
  TUnion,
  Static,
  type TRecord
} from '@sinclair/typebox'
import { jsonSchema, Validator, DataValidatorMap, Ajv } from '@feathersjs/schema'

export * from './default-schemas.js'

export type TDataSchemaMap = {
  create: TObject
  update?: TObject
  patch?: TObject
}

// Type definitions for TypeBox compatibility
export interface TypeBoxModule {
  Type: {
    Object: typeof Type.Object
    Array: typeof Type.Array
    String: typeof Type.String
    Number: typeof Type.Number
    Integer: typeof Type.Integer
    Boolean: typeof Type.Boolean
    Union: typeof Type.Union
    Intersect: typeof Type.Intersect
    Optional: typeof Type.Optional
    Partial: typeof Type.Partial
    Unsafe: typeof Type.Unsafe
    Null: typeof Type.Null
  }
}

/**
 * Creates a TypeBox adapter that works with any compatible TypeBox version
 * @param typeBoxModule The TypeBox module to use
 * @returns An adapter object with all TypeBox integration functions
 */
export function createTypeBoxAdapter(typeBoxModule: TypeBoxModule) {
  const { Type: T } = typeBoxModule

  const arrayOfKeys = <T extends TObject>(type: T) => {
    const keys = Object.keys(type.properties)
    return T.Unsafe<(keyof T['properties'])[]>({
      type: 'array',
      maxItems: keys.length,
      items: {
        type: 'string',
        ...(keys.length > 0 ? { enum: keys } : {})
      }
    })
  }

  const queryProperty = <T extends TSchema, X extends { [key: string]: TSchema }>(
    def: T,
    extension: X = {} as X
  ) =>
    T.Optional(
      T.Union([
        def,
        T.Partial(
          T.Intersect(
            [
              T.Object({
                $gt: def,
                $gte: def,
                $lt: def,
                $lte: def,
                $ne: def,
                $in: def.type === 'array' ? def : T.Array(def),
                $nin: def.type === 'array' ? def : T.Array(def)
              }),
              T.Object(extension)
            ],
            { additionalProperties: false }
          )
        )
      ])
    )

  const sortDefinition = <T extends TObject>(schema: T) => {
    const properties = Object.keys(schema.properties).reduce(
      (res, key) => {
        const result = res as any
        result[key] = T.Optional(T.Integer({ minimum: -1, maximum: 1 }))
        return result
      },
      {} as { [K in keyof T['properties']]: TOptional<TInteger> }
    )
    return T.Object(properties, { additionalProperties: false })
  }

  const queryProperties = <
    T extends TObject,
    X extends { [K in keyof T['properties']]?: { [key: string]: TSchema } }
  >(
    definition: T,
    extensions: X = {} as X
  ) => {
    const properties = Object.keys(definition.properties).reduce((res, key) => {
      const result = res as any
      const value = definition.properties[key]
      result[key] = queryProperty(value, extensions[key])
      return result
    }, {} as any)

    return T.Optional(T.Object(properties, { additionalProperties: false }))
  }

  return {
    Type: T,

    /**
     * Returns a compiled validation function for a TypeBox object and AJV validator instance.
     */
    getValidator: <T = any, R = T>(
      schema: TObject | TIntersect | TUnion<TObject[]> | TRecord,
      validator: Ajv
    ): Validator<T, R> => jsonSchema.getValidator(schema as any, validator),

    /**
     * Returns compiled validation functions to validate data for service methods.
     */
    getDataValidator: (def: TObject | TDataSchemaMap, validator: Ajv): DataValidatorMap =>
      jsonSchema.getDataValidator(def as any, validator),

    /**
     * A TypeBox utility that converts an array of provided strings into a string enum.
     */
    StringEnum: <T extends string[]>(allowedValues: [...T], options?: { default: T[number] }) => {
      return T.Unsafe<T[number]>({ type: 'string', enum: allowedValues, ...options })
    },

    /**
     * Creates the `$sort` Feathers query syntax schema for an object schema
     */
    sortDefinition,

    /**
     * Returns the standard Feathers query syntax for a property schema
     */
    queryProperty,

    /**
     * Creates a Feathers query syntax schema for the properties defined in `definition`.
     */
    queryProperties,

    /**
     * Creates a TypeBox schema for the complete Feathers query syntax
     */
    querySyntax: <T extends TObject, X extends { [K in keyof T['properties']]?: { [key: string]: TSchema } }>(
      type: T,
      extensions: X = {} as X,
      options: ObjectOptions = { additionalProperties: false }
    ) => {
      const propertySchema = queryProperties(type, extensions)
      const $or = T.Array(propertySchema)
      const $and = T.Array(T.Union([propertySchema, T.Object({ $or })]))

      return T.Intersect(
        [
          T.Partial(
            T.Object(
              {
                $limit: T.Number({ minimum: 0 }),
                $skip: T.Number({ minimum: 0 }),
                $sort: sortDefinition(type),
                $select: arrayOfKeys(type),
                $and,
                $or
              },
              { additionalProperties: false }
            )
          ),
          propertySchema
        ],
        options
      )
    },

    ObjectIdSchema: () =>
      T.Union([T.String({ objectid: true }), T.Object({}, { additionalProperties: true })])
  }
}

// Default adapter using the peer dependency
const defaultAdapter = createTypeBoxAdapter({ Type })

// Export individual functions for backward compatibility
export const {
  getValidator,
  getDataValidator,
  StringEnum,
  sortDefinition,
  queryProperty,
  queryProperties,
  querySyntax,
  ObjectIdSchema
} = defaultAdapter

// Re-export TypeBox for convenience
export { Type }
export type { Static, TObject, TInteger, TOptional, TSchema, ObjectOptions, TIntersect, TUnion, TRecord }
