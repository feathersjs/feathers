import associateCurrentUser from './associate-current-user';
import hashPassword from './hash-password';
import populateUser from './populate-user';
import queryWithCurrentUser from './query-with-current-user';
import restrictToAuthenticated from './restrict-to-authenticated';
import restrictToOwner from './restrict-to-owner';
import restrictToRoles from './restrict-to-roles';
import verifyToken from './verify-token';
import verifyOrRestrict from './verify-or-restrict';
import populateOrRestrict from './populate-or-restrict';
import hasRoleOrRestrict from './has-role-or-restrict';

let hooks = {
  associateCurrentUser,
  hashPassword,
  populateUser,
  queryWithCurrentUser,
  restrictToAuthenticated,
  restrictToOwner,
  restrictToRoles,
  verifyToken,
  verifyOrRestrict,
  populateOrRestrict,
  hasRoleOrRestrict
};

export default hooks;
