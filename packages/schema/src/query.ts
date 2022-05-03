import { JSONSchema } from 'json-schema-to-ts';

export type PropertyQuery<D extends JSONSchema> = {
  anyOf: [
    D,
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        $gt: D,
        $gte: D,
        $lt: D,
        $lte: D,
        $ne: D,
        $in: {
          type: 'array',
          items: D
        },
        $nin: {
          type: 'array',
          items: D
        }
      }
    }
  ]
}

export const queryProperty = <T extends JSONSchema> (definition: T) => ({
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
} as const);

export const queryProperties = <T extends { [key: string]: JSONSchema }> (definition: T) =>
  Object.keys(definition).reduce((res, key) => {
    (res as any)[key] = queryProperty(definition[key])

    return res
  }, {} as { [K in keyof T]: PropertyQuery<T[K]> })

export const querySyntax = <T extends { [key: string]: JSONSchema }> (definition: T) => ({
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
      (res as any)[key] = {
        type: 'number',
        enum: [1, -1]
      }

      return res
    }, {} as { [K in keyof T]: { readonly type: 'number', readonly enum: [1, -1] } })
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
