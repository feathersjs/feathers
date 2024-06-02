// Sorting algorithm taken from NeDB (https://github.com/louischatriot/nedb)
// See https://github.com/louischatriot/nedb/blob/e3f0078499aa1005a59d0c2372e425ab789145c1/lib/model.js#L189

export function compareNSB(a: number | string | boolean, b: number | string | boolean): 0 | 1 | -1 {
  if (a === b) {
    return 0
  }

  return a < b ? -1 : 1
}

export function compareArrays(a: any[], b: any[]): 0 | 1 | -1 {
  for (let i = 0, l = Math.min(a.length, b.length); i < l; i++) {
    const comparison = compare(a[i], b[i])

    if (comparison !== 0) {
      return comparison
    }
  }

  // Common section was identical, longest one wins
  return compareNSB(a.length, b.length)
}

export function compare(
  a: any,
  b: any,
  compareStrings: (a: any, b: any) => 0 | 1 | -1 = compareNSB
): 0 | 1 | -1 {
  if (a === b) {
    return 0
  }

  // null or undefined
  if (a == null) {
    return -1
  }
  if (b == null) {
    return 1
  }

  // detect typeof once
  const typeofA = typeof a
  const typeofB = typeof b

  // Numbers
  if (typeofA === 'number') {
    return typeofB === 'number' ? compareNSB(a, b) : -1
  }
  if (typeofB === 'number') {
    return 1
  }

  // Strings
  if (typeofA === 'string') {
    return typeofB === 'string' ? compareStrings(a, b) : -1
  }
  if (typeofB === 'string') {
    return 1
  }

  // Booleans
  if (typeofA === 'boolean') {
    return typeofB === 'boolean' ? compareNSB(a, b) : -1
  }
  if (typeofB === 'boolean') {
    return 1
  }

  // Dates
  if (a instanceof Date) {
    return b instanceof Date ? compareNSB(a.getTime(), b.getTime()) : -1
  }
  if (b instanceof Date) {
    return 1
  }

  // Arrays (first element is most significant and so on)
  if (Array.isArray(a)) {
    return Array.isArray(b) ? compareArrays(a, b) : -1
  }
  if (Array.isArray(b)) {
    return 1
  }

  // Objects
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()

  for (let i = 0, l = Math.min(aKeys.length, bKeys.length); i < l; i++) {
    const comparison = compare(a[aKeys[i]], b[bKeys[i]])

    if (comparison !== 0) {
      return comparison
    }
  }

  return compareNSB(aKeys.length, bKeys.length)
}

// lodash-y get - probably want to use lodash get instead
const get = (value: any, path: string[]) => path.reduce((value, key) => value[key], value)

// An in-memory sorting function according to the
// $sort special query parameter
export function sorter($sort: { [key: string]: -1 | 1 }) {
  const compares = Object.keys($sort).map((key) => {
    const direction = $sort[key]

    if (!key.includes('.')) {
      return (a: any, b: any) => direction * compare(a[key], b[key])
    } else {
      const path = key.split('.')
      return (a: any, b: any) => direction * compare(get(a, path), get(b, path))
    }
  })

  return function (a: any, b: any) {
    for (const compare of compares) {
      const comparison = compare(a, b)

      if (comparison !== 0) {
        return comparison
      }
    }

    return 0
  }
}
