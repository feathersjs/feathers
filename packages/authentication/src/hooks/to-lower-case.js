
/**
 * toLowerCase runs toLowerCase on the provided field, if it has a toLowerCase function. It
 * looks for the key on the data object for before hooks and the result object for
 * the after hooks.
 */
export default function toLowercase(fieldName) {
  if (!fieldName) {
    throw new Error('You must provide the name of the field to use in the toLowerCase hook.');
  }
  return function(hook){
    let location = hook.type === 'before' ? 'data' : 'params';
    // Allow user to view records without a userId.
    if (hook[location][fieldName] && hook[location][fieldName].toLowercase) {
      hook[location][fieldName] = hook[location][fieldName].toLowerCase();
    }
  };
}
