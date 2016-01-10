export const methods = [
  'find',
  'get',
  'create',
  'update',
  'patch',
  'remove'
];

export const eventMappings = {
  create: 'created',
  update: 'updated',
  patch: 'patched',
  remove: 'removed'
};

export const events = Object.keys(eventMappings).map(method => eventMappings[method]);

export function stripSlashes(name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}

export function each(obj, callback) {
  if(obj && typeof obj.forEach === 'function') {
    obj.forEach(callback);
  } else if(typeof obj === 'object') {
    Object.keys(obj).forEach(key => callback(obj[key], key));
  }
}
