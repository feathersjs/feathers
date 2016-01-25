/**
 * If the user is not an admin, remove any admin attribute.  This prevents
 * unauthorized users from setting other users up as administrators.
 * This typically would be used on a user-type service.
 *
 * create, update, patch
 */
export default function requireAdminToSetAdmin(adminField = 'admin'){
  return function(hook){
    if (hook.params.user && !hook.params.user[adminField]) {
      delete hook.data[adminField];
    }
  };
}
