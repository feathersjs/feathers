
/**
 * toLowerCase runs toLowerCase on the provided field, if it has a toLowerCase function. It
 * looks for the key on the data object for before hooks and the result object for
 * the after hooks.
 */
export default function toLowercase(options = {}) {
  const fieldName = options.fieldName;
  
  if (!fieldName) {
    throw new Error('You must provide the name of the field to use in the toLowerCase hook.');
  }

  function convert(obj){
    if (obj[fieldName] && obj[fieldName].toLowercase) {
      obj[fieldName] = obj[fieldName].toLowerCase();
    }
  }

  return function(hook){
    let location = hook.type === 'before' ? 'data' : 'result';

    // Handle arrays.
    if (Array.isArray(hook[location])) {
      hook[location].forEach(item => {
        convert(item);
      });

    // Handle Single Objects.
    } else {
      convert(hook[location]);
    }
  };
}
