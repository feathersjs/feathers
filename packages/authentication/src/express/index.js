import setCookie from './set-cookie';
import successRedirect from './success-redirect';
import failureRedirect from './failure-redirect';
import authenticate from './authenticate';
import exposeHeaders from './expose-headers';
import exposeCookies from './expose-cookies';
import emitEvents from './emit-events';

export default {
  exposeHeaders,
  exposeCookies,
  authenticate,
  setCookie,
  successRedirect,
  failureRedirect,
  emitEvents
};
