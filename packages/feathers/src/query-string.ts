import type { Query } from './declarations.js'

const isStringifiable = (value: unknown): value is string | number | boolean =>
  value !== undefined && value !== null && typeof value !== 'object'

export function stringify(query: Query): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isStringifiable(item)) {
          params.append(key, String(item))
        }
      }
    } else if (isStringifiable(value)) {
      params.set(key, String(value))
    }
  }

  return params.toString()
}

export function parse(query: string): Query {
  const params = new URLSearchParams(query)
  const result: Query = {}

  for (const key of params.keys()) {
    const values = params.getAll(key)
    result[key] = values.length === 1 ? values[0] : values
  }

  return result
}
