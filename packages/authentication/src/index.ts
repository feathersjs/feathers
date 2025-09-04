export * as hooks from './hooks/index.js'
export { authenticate } from './hooks/index.js'
export {
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy,
  AuthenticationParams,
  ConnectionEvent,
  JwtVerifyOptions
} from './core.js'
export { AuthenticationBaseStrategy } from './strategy.js'
export { AuthenticationService } from './service.js'
export { JWTStrategy } from './jwt.js'
export { authenticationSettingsSchema, AuthenticationConfiguration } from './options.js'
