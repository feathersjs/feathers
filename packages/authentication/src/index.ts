import * as hooks from './hooks';

const { authenticate } = hooks;

export { hooks };
export { authenticate };
export {
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy
} from './core';
export { AuthenticationService } from './service';
export { JWTStrategy } from './jwt';
