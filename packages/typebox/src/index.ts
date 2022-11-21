import { Type, TObject, TInteger, TOptional, TSchema, TIntersect } from '@sinclair/typebox'
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
export const getValidator = <T = any, R = T>(schema: TObject, validator: Ajv): Validator<T, R> =>
  jsonSchema.getValidator(schema as any, validator)

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
export function StringEnum<T extends string[]>(allowedValues: [...T]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: allowedValues })
}

const arrayOfKeys = <T extends TObject>(type: T) => {
  const keys = Object.keys(type.properties)
  return Type.Unsafe<(keyof T['properties'])[]>({ type: 'array', items: { type: 'string', enum: keys } })
}

/**
 * Creates the `$sort` Feathers query syntax schema for an object schema
 *
 * @param schema The TypeBox object schema
 * @returns The `$sort` syntax schema
 */
export function sortDefinition<T extends TObject>(schema: T) {
  const properties = Object.keys(schema.properties).reduce((res, key) => {
    const result = res as any

    result[key] = Type.Optional(Type.Integer({ minimum: -1, maximum: 1 }))

    return result
  }, {} as { [K in keyof T['properties']]: TOptional<TInteger> })

  return Type.Object(properties, { additionalProperties: false })
}

/**
 * Returns the Feathers query syntax including operators like `$gt`, `$lt` etc. for a single proeprty
 *
 * @param def The property definition
 * @returns The Feathers query syntax schema
 */
export const queryProperty = <T extends TSchema>(def: T) => {
  return Type.Optional(
    Type.Union([
      def,
      Type.Partial(
        Type.Object({
          $gt: def,
          $gte: def,
          $lt: def,
          $lte: def,
          $ne: def,
          $in: Type.Array(def),
          $nin: Type.Array(def)
        })
      )
    ])
  )
}

type QueryProperty<T extends TSchema> = ReturnType<typeof queryProperty<T>>

export const queryProperties = <T extends TObject>(type: T) => {
  const properties = Object.keys(type.properties).reduce((res, key) => {
    const result = res as any

    result[key] = queryProperty(type.properties[key])

    return result
  }, {} as { [K in keyof T['properties']]: QueryProperty<T['properties'][K]> })

  return Type.Object(properties, { additionalProperties: false })
}

/**
 * Creates a TypeBox schema for the complete Feathers query syntax including `$limit`, $skip`, `$or`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param type The properties to create the query syntax for
 * @returns A TypeBox object representing the complete Feathers query syntax for the given properties
 */
export const querySyntax = <T extends TObject | TIntersect>(type: T) => {
  const propertySchema = queryProperties(type)

  return Type.Intersect(
    [
      Type.Partial(
        Type.Object(
          {
            $limit: Type.Number({ minimum: 0 }),
            $skip: Type.Number({ minimum: 0 }),
            $sort: sortDefinition(type),
            $select: arrayOfKeys(type),
            $or: Type.Array(propertySchema)
          },
          { additionalProperties: false }
        )
      ),
      propertySchema
    ],
    { additionalProperties: false }
  )
}
