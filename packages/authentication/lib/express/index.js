const setCookie = require('./set-cookie');
const successRedirect = require('./success-redirect');
const failureRedirect = require('./failure-redirect');
const authenticate = require('./authenticate');
const exposeHeaders = require('./expose-headers');
const exposeCookies = require('./expose-cookies');
const emitEvents = require('./emit-events');

module.exports = {
  exposeHeaders,
  exposeCookies,
  authenticate,
  setCookie,
  successRedirect,
  failureRedirect,
  emitEvents
};
