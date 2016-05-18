import { setupSocketIOAuthentication, setupPrimusAuthentication } from './sockets';
import {
  exposeConnectMiddleware,
  normalizeAuthToken,
  successfulLogin,
  failedLogin
} from './express';

export default {
  exposeConnectMiddleware,
  normalizeAuthToken,
  successfulLogin,
  failedLogin,
  setupSocketIOAuthentication,
  setupPrimusAuthentication
};
