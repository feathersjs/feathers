export * as hooks from './hooks/index.ts';
export { authenticate } from './hooks/index.ts';
export { AuthenticationBase, } from './core.ts';
export type {
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy,
  ConnectionEvent
} from './core.ts';
export { AuthenticationBaseStrategy } from './strategy.ts';
export { AuthenticationService } from './service.ts';
export { JWTStrategy } from './jwt.ts';
