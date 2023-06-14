export * as hooks from './hooks'
export { authenticate } from './hooks'
export {
  AuthenticationBase,
  AuthenticationRequest,
  AuthenticationResult,
  AuthenticationStrategy,
  AuthenticationParams,
  ConnectionEvent,
  JwtVerifyOptions
} from './core'
export { AuthenticationBaseStrategy } from './strategy'
export { AuthenticationService } from './service'
export { JWTStrategy } from './jwt'
export { authenticationSettingsSchema, AuthenticationConfiguration } from './options'
