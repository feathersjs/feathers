import { hooks } from 'feathers-commons';

export const eventMappings = {
  create: 'created',
  update: 'updated',
  patch: 'patched',
  remove: 'removed'
};

export const events = Object.keys(eventMappings)
  .map(method => eventMappings[method]);

export function convertFilterData(obj) {
  return hooks.convertHookData(obj);
}

export function promisify(method, context, ... args) {
  return new Promise((resolve, reject) => {
    method.apply(context, args.concat(function(error, result) {
      if(error) {
        return reject(error);
      }

      resolve(result);
    }));
  });
}

export function errorObject(e) {
  let result = {};

  Object.getOwnPropertyNames(e).forEach(key => result[key] = e[key]);

  if(process.env.NODE_ENV === 'production') {
    delete result.stack;
  }

  delete result.hook;

  return result;
}
