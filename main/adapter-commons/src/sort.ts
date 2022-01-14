// Sorting algorithm taken from NeDB (https://github.com/louischatriot/nedb)
// See https://github.com/louischatriot/nedb/blob/e3f0078499aa1005a59d0c2372e425ab789145c1/lib/model.js#L189

function compareNSB (a: any, b: any): 0 | 1 | -1 {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}

function compareArrays (a: any, b: any) {
  let i;
  let comp;

  for (i = 0; i < Math.min(a.length, b.length); i += 1) {
    comp = compare(a[i], b[i]);

    if (comp !== 0) { return comp; }
  }

  // Common section was identical, longest one wins
  return compareNSB(a.length, b.length);
}

function compare (a: any, b: any, compareStrings: any = compareNSB): any {
  // undefined
  if (a === undefined) { return b === undefined ? 0 : -1; }
  if (b === undefined) { return a === undefined ? 0 : 1; }

  // null
  if (a === null) { return b === null ? 0 : -1; }
  if (b === null) { return a === null ? 0 : 1; }

  // Numbers
  if (typeof a === 'number') { return typeof b === 'number' ? compareNSB(a, b) : -1; }
  if (typeof b === 'number') { return typeof a === 'number' ? compareNSB(a, b) : 1; }

  // Strings
  if (typeof a === 'string') { return typeof b === 'string' ? compareStrings(a, b) : -1; }
  if (typeof b === 'string') { return typeof a === 'string' ? compareStrings(a, b) : 1; }

  // Booleans
  if (typeof a === 'boolean') { return typeof b === 'boolean' ? compareNSB(a, b) : -1; }
  if (typeof b === 'boolean') { return typeof a === 'boolean' ? compareNSB(a, b) : 1; }

  // Dates
  if (a instanceof Date) { return b instanceof Date ? compareNSB(a.getTime(), b.getTime()) : -1; }
  if (b instanceof Date) { return a instanceof Date ? compareNSB(a.getTime(), b.getTime()) : 1; }

  // Arrays (first element is most significant and so on)
  if (Array.isArray(a)) { return Array.isArray(b) ? compareArrays(a, b) : -1; }
  if (Array.isArray(b)) { return Array.isArray(a) ? compareArrays(a, b) : 1; }

  // Objects
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  let comp = 0;

  for (let i = 0; i < Math.min(aKeys.length, bKeys.length); i += 1) {
    comp = compare(a[aKeys[i]], b[bKeys[i]]);

    if (comp !== 0) { return comp; }
  }

  return compareNSB(aKeys.length, bKeys.length);
}

// An in-memory sorting function according to the
// $sort special query parameter
export function sorter ($sort: any) {
  let sortLevels = 0; // > 0 if $sort has tags with '.' i.e. '{a: 1, b: -1, "c.x.z": 1}'

  const getVal = (a: any, sortKeys: any[]) => {
    const keys = sortKeys.map(key => key);
    let val = a;
    do {
      const key = keys.shift();
      val = val[key];
    } while (keys.length);

    return val;
  };

  const criteria = Object.keys($sort).map(key => {
    const direction = $sort[key];
    const keys = key.split('.');
    sortLevels += (keys.length > 1) ? 1 : 0;

    return { keys, direction };
  });

  return function (a: any, b: any) {
    let compared;

    for (const criterion of criteria) {
    if (sortLevels) {
      compared = criterion.direction * compare(getVal(a, criterion.keys), getVal(b, criterion.keys));
    } else {
      compared = criterion.direction * compare(a[criterion.keys[0]], b[criterion.keys[0]]);
    }

      if (compared !== 0) {
        return compared;
      }
    }

    return 0;
  };
}

export { compareNSB, compareArrays, compare }