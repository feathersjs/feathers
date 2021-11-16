export * as hooks from './hooks';
export { authenticate } from './hooks';
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
