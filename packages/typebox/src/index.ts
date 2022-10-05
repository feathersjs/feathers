import { Type, TObject, TInteger, TOptional, TSchema, TIntersect } from '@sinclair/typebox'

export * from '@sinclair/typebox'
export * from './default-schemas'

const arrayOfKeys = <T extends TObject>(type: T) => {
  const keys = Object.keys(type.properties)
  return Type.Unsafe<(keyof T['properties'])[]>({ type: 'array', items: { type: 'string', enum: keys } })
}

export function sortDefinition<T extends TObject>(schema: T) {
  const properties = Object.keys(schema.properties).reduce((res, key) => {
    const result = res as any

    result[key] = Type.Optional(Type.Integer({ minimum: -1, maximum: 1 }))

    return result
  }, {} as { [K in keyof T['properties']]: TOptional<TInteger> })

  return {
    type: 'object',
    additionalProperties: false,
    properties
  } as TObject<typeof properties>
}

export const queryProperty = <T extends TSchema>(def: T) => {
  return Type.Optional(
    Type.Union([
      def,
      Type.Object({
        $gt: Type.Optional(def),
        $gte: Type.Optional(def),
        $lt: Type.Optional(def),
        $lte: Type.Optional(def),
        $ne: Type.Optional(def),
        $in: Type.Optional(Type.Array(def)),
        $nin: Type.Optional(Type.Array(def))
      })
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

  return {
    type: 'object',
    additionalProperties: false,
    properties
  } as TObject<typeof properties>
}

export const querySyntax = <T extends TObject | TIntersect>(type: T) => {
  return Type.Intersect([
    Type.Object(
      {
        $limit: Type.Optional(Type.Number({ minimum: 0 })),
        $skip: Type.Optional(Type.Number({ minimum: 0 })),
        $sort: Type.Optional(sortDefinition(type)),
        $select: Type.Optional(arrayOfKeys(type))
      },
      { additionalProperties: false }
    ),
    queryProperties(type)
  ])
}
