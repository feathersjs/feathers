export function stripSlashes(name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}

export function each(obj, callback) {
  if(Array.isArray(obj)) {
    obj.forEach(callback);
  } else if(typeof obj === 'object') {
    Object.keys(obj).forEach(key => callback(obj[key], key));
  }
}
