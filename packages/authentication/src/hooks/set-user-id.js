/**
 * Add the user's id to the incoming data.
 * @param {String} sourceProp - The key name on the params.user * where the
 * user's id will be found. Default is '_id'.
 * @param (String} destProp - The key name on the hook.data where the user's id
 * will be set. The default is `userId`.
 *
 * before
 * all, find, get, create, update, patch, remove
 */
export default function setUserId(sourceProp = '_id', destProp = 'userId'){
  return function(hook) {

    function setId(obj){
      obj[destProp] = hook.params.user[sourceProp];
    }

    if (hook.params.user) {

      // Handle arrays.
      if (Array.isArray(hook.data)) {
        hook.data.forEach(item => {
          setId(item);
        });

      // Handle single objects.
      } else {
        setId(hook.data);
      }

    }

  };
}
