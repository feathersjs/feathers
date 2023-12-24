import {
  Type,
  TObject,
  TInteger,
  TOptional,
  TSchema,
  ObjectOptions,
  TIntersect,
  TUnion
} from '@sinclair/typebox'
import { jsonSchema, Validator, DataValidatorMap, Ajv } from '@feathersjs/schema'

export * from '@sinclair/typebox'
export * from './default-schemas'

export type TDataSchemaMap = {
  create: TObject
  update?: TObject
  patch?: TObject
}

/**
 * Returns a compiled validation function for a TypeBox object and AJV validator instance.
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
export const getValidator = <T = any, R = T>(
  schema: TObject | TIntersect | TUnion<TObject[]>,
  validator: Ajv
): Validator<T, R> => jsonSchema.getValidator(schema as any, validator)

/**
 * Returns compiled validation functions to validate data for the `create`, `update` and `patch`
 * service methods. If not passed explicitly, the `update` validator will be the same as the `create`
 * and `patch` will be the `create` validator with no required fields.
 *
 * @param def Either general TypeBox object definition or a mapping of `create`, `update` and `patch`
 * to their respective type object
 * @param validator The Ajv instance to use as the validator
 * @returns A map of validator functions
 */
export const getDataValidator = (def: TObject | TDataSchemaMap, validator: Ajv): DataValidatorMap =>
  jsonSchema.getDataValidator(def as any, validator)

/**
 * A TypeBox utility that converts an array of provided strings into a string enum.
 * @param allowedValues array of strings for the enum
 * @returns TypeBox.Type
 */
export function StringEnum<T extends string[]>(allowedValues: [...T], options?: { default: T[number] }) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: allowedValues, ...options })
}

const arrayOfKeys = <T extends TObject>(type: T) => {
  const keys = Object.keys(type.properties)
  return Type.Unsafe<(keyof T['properties'])[]>({
    type: 'array',
    maxItems: keys.length,
    items: {
      type: 'string',
      ...(keys.length > 0 ? { enum: keys } : {})
    }
  })
}

/**
 * Creates the `$sort` Feathers query syntax schema for an object schema
 *
 * @param schema The TypeBox object schema
 * @returns The `$sort` syntax schema
 */
export function sortDefinition<T extends TObject>(schema: T) {
  const properties = Object.keys(schema.properties).reduce(
    (res, key) => {
      const result = res as any

      result[key] = Type.Optional(Type.Integer({ minimum: -1, maximum: 1 }))

      return result
    },
    {} as { [K in keyof T['properties']]: TOptional<TInteger> }
  )

  return Type.Object(properties, { additionalProperties: false })
}

/**
 * Returns the standard Feathers query syntax for a property schema,
 * including operators like `$gt`, `$lt` etc. for a single property
 *
 * @param def The property definition
 * @param extension Additional properties to add to the property query
 * @returns The Feathers query syntax schema
 */
export const queryProperty = <T extends TSchema, X extends { [key: string]: TSchema }>(
  def: T,
  extension: X = {} as X
) =>
  Type.Optional(
    Type.Union([
      def,
      Type.Partial(
        Type.Intersect(
          [
            Type.Object({
              $gt: def,
              $gte: def,
              $lt: def,
              $lte: def,
              $ne: def,
              $in: def.type === 'array' ? def : Type.Array(def),
              $nin: def.type === 'array' ? def : Type.Array(def)
            }),
            Type.Object(extension)
          ],
          { additionalProperties: false }
        )
      )
    ])
  )

type QueryProperty<T extends TSchema, X extends { [key: string]: TSchema }> = ReturnType<
  typeof queryProperty<T, X>
>

/**
 * Creates a Feathers query syntax schema for the properties defined in `definition`.
 *
 * @param definition The properties to create the Feathers query syntax schema for
 * @param extensions Additional properties to add to a property query
 * @returns The Feathers query syntax schema
 */
export const queryProperties = <
  T extends TObject,
  X extends { [K in keyof T['properties']]?: { [key: string]: TSchema } }
>(
  definition: T,
  extensions: X = {} as X
) => {
  const properties = Object.keys(definition.properties).reduce(
    (res, key) => {
      const result = res as any
      const value = definition.properties[key]

      result[key] = queryProperty(value, extensions[key])

      return result
    },
    {} as { [K in keyof T['properties']]: QueryProperty<T['properties'][K], X[K]> }
  )

  return Type.Optional(Type.Object(properties, { additionalProperties: false }))
}

/**
 * Creates a TypeBox schema for the complete Feathers query syntax including `$limit`, $skip`, `$or`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param type The properties to create the query syntax for
 * @param extensions Additional properties to add to the query syntax
 * @param options Options for the TypeBox object schema
 * @returns A TypeBox object representing the complete Feathers query syntax for the given properties
 */
export const querySyntax = <
  T extends TObject,
  X extends { [K in keyof T['properties']]?: { [key: string]: TSchema } }
>(
  type: T,
  extensions: X = {} as X,
  options: ObjectOptions = { additionalProperties: false }
) => {
  const propertySchema = queryProperties(type, extensions)
  const $or = Type.Array(propertySchema)
  const $and = Type.Array(Type.Union([propertySchema, Type.Object({ $or })]))

  return Type.Intersect(
    [
      Type.Partial(
        Type.Object(
          {
            $limit: Type.Number({ minimum: 0 }),
            $skip: Type.Number({ minimum: 0 }),
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
}

export const ObjectIdSchema = () =>
  Type.Union([Type.String({ objectid: true }), Type.Object({}, { additionalProperties: false })])
