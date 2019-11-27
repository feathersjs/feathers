import * as hooks from './hooks';

const { authenticate } = hooks;

export { hooks };
export { authenticate };
export {
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy,
  ConnectionEvent
} from './core';
export { AuthenticationBaseStrategy } from './strategy';
export { AuthenticationService } from './service';
export { JWTStrategy } from './jwt';
