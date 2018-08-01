// Removes all leading and trailing slashes from a path
exports.stripSlashes = function stripSlashes (name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
};

// A set of lodash-y utility functions that use ES6
const _ = exports._ = {
  each (obj, callback) {
    if (obj && typeof obj.forEach === 'function') {
      obj.forEach(callback);
    } else if (_.isObject(obj)) {
      Object.keys(obj).forEach(key => callback(obj[key], key));
    }
  },

  some (value, callback) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .some(([val, key]) => callback(val, key));
  },

  every (value, callback) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .every(([val, key]) => callback(val, key));
  },

  keys (obj) {
    return Object.keys(obj);
  },

  values (obj) {
    return _.keys(obj).map(key => obj[key]);
  },

  isMatch (obj, item) {
    return _.keys(item).every(key => obj[key] === item[key]);
  },

  isEmpty (obj) {
    return _.keys(obj).length === 0;
  },

  isObject (item) {
    return (typeof item === 'object' && !Array.isArray(item) && item !== null);
  },

  extend (...args) {
    return Object.assign(...args);
  },

  omit (obj, ...keys) {
    const result = _.extend({}, obj);
    keys.forEach(key => delete result[key]);
    return result;
  },

  pick (source, ...keys) {
    return keys.reduce((result, key) => {
      if (source[key] !== undefined) {
        result[key] = source[key];
      }

      return result;
    }, {});
  },

  // Recursively merge the source object into the target object
  merge (target, source) {
    if (_.isObject(target) && _.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (_.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }

          _.merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }
    return target;
  }
};

// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
exports.select = function select (params, ...otherFields) {
  const fields = params && params.query && params.query.$select;

  if (Array.isArray(fields) && otherFields.length) {
    fields.push(...otherFields);
  }

  const convert = result => {
    if (!Array.isArray(fields)) {
      return result;
    }

    return _.pick(result, ...fields);
  };

  return result => {
    if (Array.isArray(result)) {
      return result.map(convert);
    }

    return convert(result);
  };
};

// Duck-checks if an object looks like a promise
exports.isPromise = function isPromise (result) {
  return _.isObject(result) &&
    typeof result.then === 'function';
};

exports.makeUrl = function makeUrl (path, app = {}) {
  const get = typeof app.get === 'function' ? app.get.bind(app) : () => {};
  const env = get('env') || process.env.NODE_ENV;
  const host = get('host') || process.env.HOST_NAME || 'localhost';
  const protocol = (env === 'development' || env === 'test' || (env === undefined)) ? 'http' : 'https';
  const PORT = get('port') || process.env.PORT || 3030;
  const port = (env === 'development' || env === 'test' || (env === undefined)) ? `:${PORT}` : '';

  path = path || '';

  return `${protocol}://${host}${port}/${exports.stripSlashes(path)}`;
};

// Sorting algorithm taken from NeDB (https://github.com/louischatriot/nedb)
// See https://github.com/louischatriot/nedb/blob/e3f0078499aa1005a59d0c2372e425ab789145c1/lib/model.js#L189

exports.compareNSB = function (a, b) {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
};

exports.compareArrays = function (a, b) {
  var i, comp;

  for (i = 0; i < Math.min(a.length, b.length); i += 1) {
    comp = exports.compare(a[i], b[i]);

    if (comp !== 0) { return comp; }
  }

  // Common section was identical, longest one wins
  return exports.compareNSB(a.length, b.length);
};

exports.compare = function (a, b, compareStrings = exports.compareNSB) {
  const { compareNSB, compare, compareArrays } = exports;

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
};

// An in-memory sorting function according to the
// $sort special query parameter
exports.sorter = function ($sort) {
  const criteria = Object.keys($sort).map(key => {
    const direction = $sort[key];

    return { key, direction };
  });

  return function (a, b) {
    let compare;

    for (let i = 0; i < criteria.length; i++) {
      const criterion = criteria[i];

      compare = criterion.direction * exports.compare(a[criterion.key], b[criterion.key]);

      if (compare !== 0) {
        return compare;
      }
    }

    return 0;
  };
};
