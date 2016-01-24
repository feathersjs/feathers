import hashPassword from './hash-password';
import queryWithUserId from './query-with-user-id';
import requireAdminToSetAdmin from './require-admin-to-set-admin';
import requireAuth from './require-auth';
import restrictToSelf from './restrict-to-self';
import setUserId from './set-user-id';
import toLowerCase from './to-lower-case';

let hooks = {
  hashPassword,
  queryWithUserId,
  requireAdminToSetAdmin,
  requireAuth,
  restrictToSelf,
  setUserId,
  toLowerCase
};

export default hooks;
