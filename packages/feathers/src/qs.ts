/**
 * High-performance query string parser and stringifier.
 * Wire-format compatible with qs@6 default options:
 *   - Bracket notation for nesting: a[b][c]=v
 *   - Numeric bracket indices for arrays: a[0]=x&a[1]=y
 *   - All parsed values are strings
 *   - Array index limit of 2000 (indices beyond the limit are silently dropped)
 *   - Nesting depth limit of 5 (deeper segments kept as literal bracket keys)
 *   - Prototype-poisoning keys (__proto__, constructor, prototype) ignored
 *   - Malformed percent-encoding falls back to raw string (not dropped)
 *   - Empty bracket notation a[]=x treated as implicit sequential index
 *   - Parameter count limit of 2000 (pairs beyond the limit are silently dropped)
 *   - Stringify depth limit of 5 (deeper nesting silently stops)
 */

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/** Indices strictly less than this become array elements; >= are silently dropped. */
const ARRAY_INDEX_LIMIT = 2000
/** Maximum bracket nesting depth before remaining segments are kept as literals. */
const DEPTH_LIMIT = 5
/** Maximum number of key=value pairs to parse before silently dropping the rest. */
const PARAMETER_LIMIT = 2000
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

// ---------------------------------------------------------------------------
// Stringify
// ---------------------------------------------------------------------------

type StringifyValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | StringifyValue[]
  | { [key: string]: StringifyValue }
export type StringifyInput = Record<string, StringifyValue> | StringifyValue[]

function stringifyValue(prefix: string, value: StringifyValue, pairs: string[], depth: number): void {
  if (value === undefined || depth > DEPTH_LIMIT) return

  if (value === null) {
    pairs.push(encodeURIComponent(prefix) + '=')
    return
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      stringifyValue(`${prefix}[${i}]`, value[i], pairs, depth + 1)
    }
    return
  }

  if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      stringifyValue(`${prefix}[${key}]`, (value as Record<string, StringifyValue>)[key], pairs, depth + 1)
    }
    return
  }

  pairs.push(encodeURIComponent(prefix) + '=' + encodeURIComponent(String(value)))
}

export function stringify(obj: StringifyInput): string {
  if (!obj || typeof obj !== 'object') return ''

  const pairs: string[] = []

  for (const key of Object.keys(obj)) {
    stringifyValue(key, (obj as Record<string, StringifyValue>)[key], pairs, 1)
  }

  return pairs.join('&')
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/** Hoisted regex for bracket segment extraction — reused across calls. */
const BRACKET_RE = /\[([^\]]*)\]/g

/**
 * Split a bracket-notation key into path segments, respecting depth limit.
 * 'filter[status]'        → ['filter', 'status']
 * 'a[0][b]'               → ['a', '0', 'b']
 * '$limit'                → ['$limit']
 * 'a[b][c][d][e][f][g]'  → ['a', 'b', 'c', 'd', 'e', '[f][g]']  (depth 5)
 */
function splitPath(key: string): string[] {
  const bracket = key.indexOf('[')

  if (bracket === -1) return [key]

  // A key that starts with '[' has an empty root — skip the empty root segment.
  const root = key.slice(0, bracket)
  const rest = key.slice(bracket)

  const segments: string[] = []
  if (root !== '') segments.push(root)

  BRACKET_RE.lastIndex = 0
  let m: RegExpExecArray | null
  let depth = segments.length // root counts as depth 1 if present

  while ((m = BRACKET_RE.exec(rest)) !== null) {
    if (depth >= DEPTH_LIMIT) {
      // Append remaining bracket string as a literal final segment
      segments.push(rest.slice(m.index))
      break
    }
    segments.push(m[1])
    depth++
  }

  // No bracket pairs matched — treat entire key as a literal (e.g., `[=toString`)
  if (segments.length === 0) return [key]

  return segments
}

/**
 * Compact a plain object whose own keys are all non-negative integers
 * strictly less than ARRAY_INDEX_LIMIT into a dense array.
 * Called recursively after the full key tree is built.
 */
function compactArrays(obj: Record<string, any>): any {
  const keys = Object.keys(obj)

  // Recurse into children first
  for (const key of keys) {
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      obj[key] = compactArrays(obj[key])
    }
  }

  if (keys.length === 0) return obj

  // Check if all own keys are non-negative integers
  for (const key of keys) {
    const n = Number(key)
    if (!Number.isInteger(n) || n < 0 || String(n) !== key) return obj
  }

  // Build dense array sorted by numeric index
  const arr: any[] = []
  for (const key of keys.slice().sort((a, b) => Number(a) - Number(b))) {
    arr.push(obj[key])
  }
  return arr
}

/**
 * Set a value at a deep path inside result, creating intermediaries as needed.
 * Empty-string segments (from a[]=x notation) are converted to implicit
 * sequential indices within that parent object.
 */
function isOutOfRange(key: string): boolean {
  const n = Number(key)
  return key !== '' && Number.isInteger(n) && n >= ARRAY_INDEX_LIMIT
}

function setDeep(root: Record<string, any>, keys: string[], value: string): void {
  // Validate all segments before mutating — prevents empty parent shells
  for (const key of keys) {
    if (UNSAFE_KEYS.has(key) || isOutOfRange(key)) return
  }

  let node = root

  for (let i = 0; i < keys.length - 1; i++) {
    let key = keys[i]

    // Empty bracket a[]=x — resolve to next sequential numeric index
    if (key === '') {
      let nextIndex = 0
      while (Object.prototype.hasOwnProperty.call(node, String(nextIndex))) {
        nextIndex++
      }
      key = String(nextIndex)
    }

    if (node[key] === undefined || node[key] === null || typeof node[key] !== 'object') {
      node[key] = {}
    }
    node = node[key]
  }

  let last = keys[keys.length - 1]

  // Empty bracket a[]=x — resolve to next sequential numeric index
  if (last === '') {
    let nextIndex = 0
    while (Object.prototype.hasOwnProperty.call(node, String(nextIndex))) {
      nextIndex++
    }
    last = String(nextIndex)
  }

  if (node[last] === undefined) {
    node[last] = value
  } else if (Array.isArray(node[last])) {
    node[last].push(value)
  } else {
    // Repeated scalar key — promote to array
    node[last] = [node[last], value]
  }
}

/** Decode a URI component, falling back to the raw string on malformed input. */
function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  } catch {
    return s
  }
}

export function parse(str: string): Record<string, any> {
  if (!str) return {}

  const result: Record<string, any> = {}
  let count = 0

  for (const pair of str.split('&')) {
    if (!pair) continue
    if (++count > PARAMETER_LIMIT) break

    // qs@6-compatible: prefer `]=` to split on (handles `=` inside brackets)
    const bracketEq = pair.indexOf(']=')
    const eq = bracketEq === -1 ? pair.indexOf('=') : bracketEq + 1
    const rawKey = eq === -1 ? pair : pair.slice(0, eq)
    const rawVal = eq === -1 ? '' : pair.slice(eq + 1)

    const key = safeDecode(rawKey)
    const val = safeDecode(rawVal)

    if (!key) continue

    const keys = splitPath(key)
    if (keys.some((k) => UNSAFE_KEYS.has(k))) continue

    setDeep(result, keys, val)
  }

  // Compact nested objects into arrays (but not the root — top-level keys are
  // never from bracket notation, matching qs@6 behavior)
  for (const key of Object.keys(result)) {
    if (result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = compactArrays(result[key])
    }
  }

  return result
}
