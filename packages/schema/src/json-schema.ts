import { _ } from '@feathersjs/commons'
import { JSONSchema } from 'json-schema-to-ts'
import { JSONSchemaDefinition, Ajv, Validator } from './schema'

export type DataSchemaMap = {
  create: JSONSchemaDefinition
  update?: JSONSchemaDefinition
  patch?: JSONSchemaDefinition
}

export type DataValidatorMap = {
  create: Validator
  update: Validator
  patch: Validator
}

/**
 * Returns a compiled validation function for a schema and AJV validator instance.
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
export const getValidator = <T = any, R = T>(schema: JSONSchemaDefinition, validator: Ajv): Validator<T, R> =>
  validator.compile({
    $async: true,
    ...(schema as any)
  }) as any as Validator<T, R>

/**
 * Returns compiled validation functions to validate data for the `create`, `update` and `patch`
 * service methods. If not passed explicitly, the `update` validator will be the same as the `create`
 * and `patch` will be the `create` validator with no required fields.
 *
 * @param def Either general JSON schema definition or a mapping of `create`, `update` and `patch`
 * to their respecitve JSON schema
 * @param validator The Ajv instance to use as the validator
 * @returns A map of validator functions
 */
export const getDataValidator = (
  def: JSONSchemaDefinition | DataSchemaMap,
  validator: Ajv
): DataValidatorMap => {
  const schema = ((def as any).create ? def : { create: def }) as DataSchemaMap

  return {
    create: getValidator(schema.create, validator),
    update: getValidator(
      schema.update || {
        ...(schema.create as any),
        $id: `${schema.create.$id}Update`
      },
      validator
    ),
    patch: getValidator(
      schema.patch || {
        ...(schema.create as any),
        $id: `${schema.create.$id}Patch`,
        required: []
      },
      validator
    )
  }
}

export type PropertyQuery<D extends JSONSchema> = {
  anyOf: [
    D,
    {
      type: 'object'
      additionalProperties: false
      properties: {
        $gt: D
        $gte: D
        $lt: D
        $lte: D
        $ne: D
        $in: {
          type: 'array'
          items: D
        }
        $nin: {
          type: 'array'
          items: D
        }
      }
    }
  ]
}

/**
 * Create a Feathers query syntax compatible JSON schema definition for a property definition.
 *
 * @param def The property definition (e.g. `{ type: 'string' }`)
 * @returns A JSON schema definition for the Feathers query syntax for this property.
 */
export const queryProperty = <T extends JSONSchema>(def: T) => {
  const definition = _.omit(def, 'default')
  return {
    anyOf: [
      definition,
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          $gt: definition,
          $gte: definition,
          $lt: definition,
          $lte: definition,
          $ne: definition,
          $in: {
            type: 'array',
            items: definition
          },
          $nin: {
            type: 'array',
            items: definition
          }
        }
      }
    ]
  } as const
}

/**
 * Creates Feathers a query syntax compatible JSON schema for multiple properties.
 *
 * @param definitions A map of property definitions
 * @returns The JSON schema definition for the Feathers query syntax for multiple properties
 */
export const queryProperties = <T extends { [key: string]: JSONSchema }>(definitions: T) =>
  Object.keys(definitions).reduce((res, key) => {
    const result = res as any
    const definition = definitions[key]

    result[key] = queryProperty(definition)

    return result
  }, {} as { [K in keyof T]: PropertyQuery<T[K]> })

/**
 * Creates a JSON schema for the complete Feathers query syntax including `$limit`, $skip`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param definition The property definitions to create the query syntax schema for
 * @returns A JSON schema for the complete query syntax
 */
export const querySyntax = <T extends { [key: string]: any }>(definition: T) =>
  ({
    $limit: {
      type: 'number',
      minimum: 0
    },
    $skip: {
      type: 'number',
      minimum: 0
    },
    $sort: {
      type: 'object',
      properties: Object.keys(definition).reduce((res, key) => {
        const result = res as any

        result[key] = {
          type: 'number',
          enum: [1, -1]
        }

        return result
      }, {} as { [K in keyof T]: { readonly type: 'number'; readonly enum: [1, -1] } })
    },
    $select: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.keys(definition) as any as (keyof T)[]
      }
    },
    ...queryProperties(definition)
  } as const)
