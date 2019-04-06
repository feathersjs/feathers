// Removes all leading and trailing slashes from a path
export function stripSlashes (name: string) {
  return name.replace(/^(\/+)|(\/+)$/g, '');
}

export type KeyValueCallback<T> = (value: any, key: string) => T;

// A set of lodash-y utility functions that use ES6
export const _ = {
  each (obj: any, callback: KeyValueCallback<void>) {
    if (obj && typeof obj.forEach === 'function') {
      obj.forEach(callback);
    } else if (_.isObject(obj)) {
      Object.keys(obj).forEach(key => callback(obj[key], key));
    }
  },

  some (value: any, callback: KeyValueCallback<boolean>) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .some(([val, key]) => callback(val, key));
  },

  every (value: any, callback: KeyValueCallback<boolean>) {
    return Object.keys(value)
      .map(key => [ value[key], key ])
      .every(([val, key]) => callback(val, key));
  },

  keys (obj: any) {
    return Object.keys(obj);
  },

  values (obj: any) {
    return _.keys(obj).map(key => obj[key]);
  },

  isMatch (obj: any, item: any) {
    return _.keys(item).every(key => obj[key] === item[key]);
  },

  isEmpty (obj: any) {
    return _.keys(obj).length === 0;
  },

  isObject (item: any) {
    return (typeof item === 'object' && !Array.isArray(item) && item !== null);
  },

  isObjectOrArray (value: any) {
    return typeof value === 'object' && value !== null;
  },

  extend (first: any, ...rest: any[]) {
    return Object.assign(first, ...rest);
  },

  omit (obj: any, ...keys: string[]) {
    const result = _.extend({}, obj);
    keys.forEach(key => delete result[key]);
    return result;
  },

  pick (source: any, ...keys: string[]) {
    return keys.reduce((result: { [key: string]: any }, key) => {
      if (source[key] !== undefined) {
        result[key] = source[key];
      }

      return result;
    }, {});
  },

  // Recursively merge the source object into the target object
  merge (target: any, source: any) {
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

// Duck-checks if an object looks like a promise
export function isPromise (result: any) {
  return _.isObject(result) &&
    typeof result.then === 'function';
}

export function makeUrl (path: string, app: any = {}) {
  const get = typeof app.get === 'function' ? app.get.bind(app) : () => {};
  const env = get('env') || process.env.NODE_ENV;
  const host = get('host') || process.env.HOST_NAME || 'localhost';
  const protocol = (env === 'development' || env === 'test' || (env === undefined)) ? 'http' : 'https';
  const PORT = get('port') || process.env.PORT || 3030;
  const port = (env === 'development' || env === 'test' || (env === undefined)) ? `:${PORT}` : '';

  path = path || '';

  return `${protocol}://${host}${port}/${exports.stripSlashes(path)}`;
}

export function createSymbol (name: string) {
  return typeof Symbol !== 'undefined' ? Symbol(name) : name;
}
