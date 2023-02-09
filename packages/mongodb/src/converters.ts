import { ObjectId } from 'mongodb'

export type ObjectIdParam = string | number | ObjectId

export type IdQueryObject<T> = {
  $in?: T[]
  $nin?: T[]
  $ne?: T
}

const toObjectId = (value: ObjectIdParam) => new ObjectId(value)

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

export const keywordObjectId = {
  keyword: 'objectid',
  type: 'string',
  modifying: true,
  compile(schemaVal: boolean) {
    if (!schemaVal) return () => true

    return function (value: string, obj: any) {
      const { parentData, parentDataProperty } = obj
      try {
        parentData[parentDataProperty] = new ObjectId(value)
        return true
      } catch (error) {
        throw new Error(`invalid objectid for property "${parentDataProperty}"`)
      }
    }
  }
} as const
