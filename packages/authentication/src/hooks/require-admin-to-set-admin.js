/**
 * If the user is not an admin, remove any admin attribute.  This prevents
 * unauthorized users from setting other users up as administrators.
 * This typically would be used on a user-type service.
 *
 * create, update, patch
 */
const defaults = { adminField: 'admin' };

export default function requireAdminToSetAdmin(adminField = 'admin'){
  options = Object.assign({}, defaults, options);

  return function(hook){
    if (hook.params.user && !hook.params.user[options.adminField] && hook.params.provider) {
      delete hook.data[adminField];
    }
  };
}
