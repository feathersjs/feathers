import associateCurrentUser from './associate-current-user';
import hashPassword from './hash-password';
import populateUser from './populate-user';
import queryWithCurrentUser from './query-with-current-user';
import restrictToAuthenticated from './restrict-to-authenticated';
import restrictToOwner from './restrict-to-owner';
import restrictToRoles from './restrict-to-roles';
import verifyToken from './verify-token';

let hooks = {
  associateCurrentUser,
  hashPassword,
  populateUser,
  queryWithCurrentUser,
  restrictToAuthenticated,
  restrictToOwner,
  restrictToRoles,
  verifyToken
};

export default hooks;
