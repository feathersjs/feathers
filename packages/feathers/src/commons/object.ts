// Returns true for objects that are not `null` or an array
export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Returns a shallow copy of `source` with only the given keys whose values are not `undefined`
export function pick<T extends object, K extends keyof T>(source: T, ...keys: K[]): Partial<Pick<T, K>> {
  const result: Partial<Pick<T, K>> = {}

  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key]
    }
  }

  return result
}

// Returns a shallow copy of `source` without the given keys
export function omit<T extends object, K extends keyof T>(source: T, ...keys: K[]): Omit<T, K> {
  const result = { ...source }

  for (const key of keys) {
    delete result[key]
  }

  return result
}
