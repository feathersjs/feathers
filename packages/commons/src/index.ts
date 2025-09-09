// Removes all leading and trailing slashes from a path
export function stripSlashes(name: string) {
  return name.replace(/^(\/+)|(\/+)$/g, '')
}

export type KeyValueCallback<T> = (value: any, key: string) => T

/**
 * If the object is an array, it will iterate over every element.
 * Otherwise, it will iterate over every key in the object.
 */
export function each(obj: Record<string, any> | any[], callback: KeyValueCallback<void>) {
  if (Array.isArray(obj)) {
    obj.forEach(callback as any)
  } else if (isObject(obj)) {
    Object.keys(obj).forEach((key) => callback(obj[key], key))
  }
}

/**
 * Check if some values in the object pass the test implemented by the provided function
 *
 * returns true if some values pass the test, otherwise false
 *
 * returns false if the object is empty
 */
export function some(value: Record<string, any>, callback: KeyValueCallback<boolean>) {
  for (const key in value) {
    if (callback(value[key], key)) {
      return true
    }
  }

  return false
}

/**
 * Check if all values in the object pass the test implemented by the provided function
 *
 * returns true if all values pass the test, otherwise false
 *
 * returns true if the object is empty
 */
export function every(value: any, callback: KeyValueCallback<boolean>) {
  for (const key in value) {
    if (!callback(value[key], key)) {
      return false
    }
  }

  return true
}

/**
 * @deprecated use `Object.keys` instead
 */
export function keys(obj: any) {
  return Object.keys(obj)
}

/**
 * @deprecated use `Object.values` instead
 */
export function values(obj: any) {
  return Object.values(obj)
}

/**
 * Check if values in the source object are equal to the target object
 *
 * Does a shallow comparison
 */
export function isMatch(target: any, source: any) {
  return Object.keys(source).every((key) => target[key] === source[key])
}

/**
 * Check if the object is empty
 */
export function isEmpty(obj: any) {
  return Object.keys(obj).length === 0
}

/**
 * Check if the item is an object and not an array
 */
export function isObject(item: any): item is Record<string, any> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Check if the value is an object or an array
 */
export function isObjectOrArray(value: any): value is Record<string, any> | any[] {
  return value !== null && typeof value === 'object'
}

/**
 * @deprecated use `Object.assign` instead.
 */
export function extend(first: any, ...rest: any[]) {
  return Object.assign(first, ...rest)
}

/**
 * Return a shallow copy of the object with the keys removed
 */
export function omit(obj: any, ...keys: string[]) {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

/**
 * Return a shallow copy of the object with only the keys provided
 */
export function pick(source: any, ...keys: string[]) {
  return keys.reduce((result: { [key: string]: any }, key) => {
    if (source[key] !== undefined) {
      result[key] = source[key]
    }

    return result
  }, {})
}

/**
 * Recursively merge the source object into the target object
 */
export function merge(target: any, source: any) {
  // If either the source or target are not objects, there is nothing to do
  if (!isObject(target) || !isObject(source)) {
    return target
  }

  Object.keys(source).forEach((key) => {
    if (isObject(source[key])) {
      if (!target[key]) {
        Object.assign(target, { [key]: {} })
      }

      merge(target[key], source[key])
    } else {
      Object.assign(target, { [key]: source[key] })
    }
  })

  return target
}

/**
 * Duck-checks if an object looks like a promise
 */
export function isPromise(result: any): result is Promise<any> {
  return isObject(result) && typeof result.then === 'function'
}

export function createSymbol(name: string) {
  return typeof Symbol !== 'undefined' ? Symbol.for(name) : name
}

/**
 * A set of lodash-y utility functions that use ES6
 *
 * @deprecated Don't use `import { _ } from '@feathersjs/commons'`. You're importing a bunch of functions. You probably only need a few.
 * Import them directly instead. For example: `import { merge } from '@feathersjs/commons'`.
 *
 * If you really want to import all functions or do not care about cherry picking, you can use `import * as _ from '@feathersjs/commons'`.
 */
export const _ = {
  each,
  some,
  every,
  keys,
  values,
  isMatch,
  isEmpty,
  isObject,
  isObjectOrArray,
  extend,
  omit,
  pick,
  merge,
  isPromise,
  createSymbol
}

export default _

export * from './debug'

if (typeof module !== 'undefined') {
  module.exports = Object.assign(_, module.exports)
}
