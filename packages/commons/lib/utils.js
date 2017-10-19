exports.stripSlashes = function stripSlashes (name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
};

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
    const result = {};
    keys.forEach(key => {
      result[key] = source[key];
    });
    return result;
  },

  merge (target, source) {
    if (_.isObject(target) && _.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (_.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          _.merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }
    return target;
  }
};

exports.specialFilters = {
  $in (key, ins) {
    return current => ins.indexOf(current[key]) !== -1;
  },

  $nin (key, nins) {
    return current => nins.indexOf(current[key]) === -1;
  },

  $lt (key, value) {
    return current => current[key] < value;
  },

  $lte (key, value) {
    return current => current[key] <= value;
  },

  $gt (key, value) {
    return current => current[key] > value;
  },

  $gte (key, value) {
    return current => current[key] >= value;
  },

  $ne (key, value) {
    return current => current[key] !== value;
  }
};

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

exports.matcher = function matcher (originalQuery) {
  const query = _.omit(originalQuery, '$limit', '$skip', '$sort', '$select');

  return function (item) {
    if (query.$or && _.some(query.$or, or => matcher(or)(item))) {
      return true;
    }

    return _.every(query, (value, key) => {
      if (value !== null && typeof value === 'object') {
        return _.every(value, (target, filterType) => {
          if (exports.specialFilters[filterType]) {
            const filter = exports.specialFilters[filterType](key, target);
            return filter(item);
          }

          return false;
        });
      } else if (typeof item[key] !== 'undefined') {
        return item[key] === query[key];
      }

      return false;
    });
  };
};

exports.sorter = function sorter ($sort) {
  return function (first, second) {
    let comparator = 0;
    _.each($sort, (modifier, key) => {
      modifier = parseInt(modifier, 10);

      if (first[key] < second[key]) {
        comparator -= 1 * modifier;
      }

      if (first[key] > second[key]) {
        comparator += 1 * modifier;
      }
    });
    return comparator;
  };
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

exports.isPromise = function isPromise (result) {
  return _.isObject(result) &&
    typeof result.then === 'function';
};
