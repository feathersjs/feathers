import { ObjectId } from 'mongodb'

export type ObjectIdParam = string | number | ObjectId

export type IdQueryObject<T> = {
  $in?: T[]
  $nin?: T[]
  $ne?: T
}

const toObjectId = (value: ObjectIdParam) => new ObjectId(value as string)

export async function resolveObjectId(value: ObjectIdParam) {
  return toObjectId(value)
}

export async function resolveQueryObjectId(
  value: IdQueryObject<ObjectIdParam>
): Promise<IdQueryObject<ObjectId>>
export async function resolveQueryObjectId(value: ObjectIdParam): Promise<ObjectId>
export async function resolveQueryObjectId(value: ObjectIdParam | IdQueryObject<ObjectIdParam>) {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string' || typeof value === 'number' || value instanceof ObjectId) {
    return toObjectId(value)
  }

  const convertedObject: IdQueryObject<ObjectId> = {}

  if (Array.isArray(value.$in)) {
    convertedObject.$in = value.$in.map(toObjectId)
  }

  if (Array.isArray(value.$nin)) {
    convertedObject.$nin = value.$nin.map(toObjectId)
  }

  if (value.$ne !== undefined) {
    convertedObject.$ne = toObjectId(value.$ne)
  }

  return convertedObject
}

const isObjectId = (value: any): value is ObjectId => {
  if (value == null || typeof value !== 'object') {
    return false
  }

  if (value instanceof ObjectId) {
    return true
  }

  // Another mongodb/bson copy of ObjectId (instanceof fails across duplicates).
  // Reject plain JSON such as `{ _bsontype: 'ObjectId' }`.
  return (
    value._bsontype === 'ObjectId' &&
    value.constructor !== Object &&
    typeof value.toHexString === 'function'
  )
}

export const keywordObjectId = {
  keyword: 'objectid',
  modifying: true,
  compile(schemaVal: boolean) {
    if (!schemaVal) return () => true

    return function (value: any, obj: any) {
      if (isObjectId(value)) {
        return true
      }

      if (typeof value !== 'string') {
        return false
      }

      const { parentData, parentDataProperty } = obj
      try {
        parentData[parentDataProperty] = new ObjectId(value)
        return true
      } catch (error) {
        return false
      }
    }
  }
} as const
