import { _ } from '@feathersjs/commons'
import { Type, TObject, TSchema, TIntersect } from '@sinclair/typebox'

const ArrayOfKeys = <T extends TObject>(type: T) => {
  const keys = Object.keys(type.properties)
  return Type.Unsafe<(keyof T['properties'])[]>({ type: 'array', items: { type: 'string', enum: keys } })
}

export function SortKeys<T extends TObject>(schema: T) {
  const keys = Object.keys(schema.properties)

  const result = keys.reduce((res, key) => {
    const result = res as any

    result[key] = Type.Unsafe<1 | -1>({ type: 'number', enum: [1, -1] })

    return result
  }, {} as { [K in keyof T['properties']]: { readonly type: 'number'; readonly enum: [1, -1] } })

  return Type.Unsafe<{ [K in keyof T['properties']]?: 1 | -1 }>(result)
}

export const queryProperty = <T extends TSchema>(def: T) => {
  return Type.Union(
    [
      def,
      Type.Object({
        $gt: def,
        $gte: def,
        $lt: def,
        $lte: def,
        $ne: def,
        $in: Type.Array(def),
        $nin: Type.Array(def)
      })
    ],
    { additionalProperties: false }
  )
}

type QueryProperty<T extends TSchema> = ReturnType<typeof queryProperty<T>>

export const queryProperties = <T extends TObject>(type: T) => {
  const properties = Object.keys(type.properties).reduce((res, key) => {
    const result = res as any

    result[key] = queryProperty(type[key])

    return result
  }, {} as { [K in keyof T['properties']]: QueryProperty<T['properties'][K]> })

  const result = {
    type: 'object',
    additionalProperties: false,
    properties
  } as TObject<typeof properties>

  return result
}

export const querySyntax = <T extends TObject | TIntersect>(type: T) => {
  return Type.Intersect([
    Type.Object(
      {
        $limit: Type.Optional(Type.Number({ minimum: 0 })),
        $skip: Type.Optional(Type.Number({ minimum: 0 })),
        $sort: SortKeys(type),
        $select: ArrayOfKeys(type)
      },
      { additionalProperties: false }
    ),
    queryProperties(type)
  ])
}
