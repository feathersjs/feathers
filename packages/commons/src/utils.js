export function stripSlashes (name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}

export function each (obj, callback) {
  if (obj && typeof obj.forEach === 'function') {
    obj.forEach(callback);
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => callback(obj[key], key));
  }
}

export const _ = {
  each,

  some (value, callback) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .some(current => callback(...current));
  },

  every (value, callback) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .every(current => callback(...current));
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
  }
};

export const specialFilters = {
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

export function select (...fields) {
  return result => _.pick(result, ...fields);
}

export function selectMany (...fields) {
  const selector = select(...fields);

  return function (result) {
    if (Array.isArray(result)) {
      return result.map(selector);
    }

    if (result.data) {
      result.data = result.data.map(selector);
    }

    return result;
  };
}

export function matcher (originalQuery) {
  const query = _.omit(originalQuery, '$limit', '$skip', '$sort', '$select');

  return function (item) {
    if (query.$or && _.some(query.$or, or => matcher(or)(item))) {
      return true;
    }

    return _.every(query, (value, key) => {
      if (typeof value === 'object') {
        return _.every(value, (target, filterType) => {
          if (specialFilters[filterType]) {
            const filter = specialFilters[filterType](key, target);
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
}

export function sorter ($sort) {
  return function (first, second) {
    let comparator = 0;
    each($sort, (modifier, key) => {
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
}
