import merge from 'lodash/merge'
import jsonwebtoken, { SignOptions, Secret, VerifyOptions, Algorithm } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { NotAuthenticated } from '@feathersjs/errors'
import { createDebug } from '@feathersjs/commons'
import { Application, Params } from '@feathersjs/feathers'
import { IncomingMessage, ServerResponse } from 'http'
import { AuthenticationConfiguration, defaultOptions } from './options'

const debug = createDebug('@feathersjs/authentication/base')

export interface AuthenticationResult {
  [key: string]: any
}

export interface AuthenticationRequest {
  strategy?: string
  [key: string]: any
}

export interface AuthenticationParams extends Params {
  payload?: { [key: string]: any }
  jwtOptions?: SignOptions
  authStrategies?: string[]
  secret?: string
  [key: string]: any
}

export type ConnectionEvent = 'login' | 'logout' | 'disconnect'

export interface AuthenticationStrategy {
  /**
   * Implement this method to get access to the AuthenticationService
   *
   * @param auth The AuthenticationService
   */
  setAuthentication?(auth: AuthenticationBase): void
  /**
   * Implement this method to get access to the Feathers application
   *
   * @param app The Feathers application instance
   */
  setApplication?(app: Application): void
  /**
   * Implement this method to get access to the strategy name
   *
   * @param name The name of the strategy
   */
  setName?(name: string): void
  /**
   * Implement this method to verify the current configuration
   * and throw an error if it is invalid.
   */
  verifyConfiguration?(): void
  /**
   * Implement this method to setup this strategy
   * @param auth The AuthenticationService
   * @param name The name of the strategy
   */
  setup?(auth: AuthenticationBase, name: string): Promise<void>
  /**
   * Authenticate an authentication request with this strategy.
   * Should throw an error if the strategy did not succeed.
   *
   * @param authentication The authentication request
   * @param params The service call parameters
   */
  authenticate?(
    authentication: AuthenticationRequest,
    params: AuthenticationParams
  ): Promise<AuthenticationResult>
  /**
   * Update a real-time connection according to this strategy.
   *
   * @param connection The real-time connection
   * @param context The hook context
   */
  handleConnection?(event: ConnectionEvent, connection: any, authResult?: AuthenticationResult): Promise<void>
  /**
   * Parse a basic HTTP request and response for authentication request information.
   *
   * @param req The HTTP request
   * @param res The HTTP response
   */
  parse?(req: IncomingMessage, res: ServerResponse): Promise<AuthenticationRequest | null>
}

export interface JwtVerifyOptions extends VerifyOptions {
  algorithm?: string | string[]
}

/**
 * A base class for managing authentication strategies and creating and verifying JWTs
 */
export class AuthenticationBase {
  app: Application
  strategies: { [key: string]: AuthenticationStrategy }
  configKey: string
  isReady: boolean

  /**
   * Create a new authentication service.
   *
   * @param app The Feathers application instance
   * @param configKey The configuration key name in `app.get` (default: `authentication`)
   * @param options Optional initial options
   */
  constructor(app: Application, configKey = 'authentication', options = {}) {
    if (!app || typeof app.use !== 'function') {
      throw new Error('An application instance has to be passed to the authentication service')
    }

    this.app = app
    this.strategies = {}
    this.configKey = configKey
    this.isReady = false

    app.set('defaultAuthentication', app.get('defaultAuthentication') || configKey)
    app.set(configKey, merge({}, app.get(configKey), options))
  }

  /**
   * Return the current configuration from the application
   */
  get configuration(): AuthenticationConfiguration {
    // Always returns a copy of the authentication configuration
    return Object.assign({}, defaultOptions, this.app.get(this.configKey))
  }

  /**
   * A list of all registered strategy names
   */
  get strategyNames() {
    return Object.keys(this.strategies)
  }

  /**
   * Register a new authentication strategy under a given name.
   *
   * @param name The name to register the strategy under
   * @param strategy The authentication strategy instance
   */
  register(name: string, strategy: AuthenticationStrategy) {
    // Call the functions a strategy can implement
    if (typeof strategy.setName === 'function') {
      strategy.setName(name)
    }

    if (typeof strategy.setApplication === 'function') {
      strategy.setApplication(this.app)
    }

    if (typeof strategy.setAuthentication === 'function') {
      strategy.setAuthentication(this)
    }

    if (typeof strategy.verifyConfiguration === 'function') {
      strategy.verifyConfiguration()
    }

    // Register strategy as name
    this.strategies[name] = strategy

    if (this.isReady) {
      strategy.setup?.(this, name)
    }
  }

  /**
   * Get the registered authentication strategies for a list of names.
   *
   * @param names The list or strategy names
   */
  getStrategies(...names: string[]) {
    return names.map((name) => this.strategies[name]).filter((current) => !!current)
  }

  /**
   * Returns a single strategy by name
   *
   * @param name The strategy name
   * @returns The authentication strategy or undefined
   */
  getStrategy(name: string) {
    return this.strategies[name]
  }

  /**
   * Create a new access token with payload and options.
   *
   * @param payload The JWT payload
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  async createAccessToken(
    payload: string | Buffer | object,
    optsOverride?: SignOptions,
    secretOverride?: Secret
  ) {
    const { secret, jwtOptions } = this.configuration
    // Use configuration by default but allow overriding the secret
    const jwtSecret = secretOverride || secret
    // Default jwt options merged with additional options
    const options = merge({}, jwtOptions, optsOverride)

    if (!options.jwtid) {
      // Generate a UUID as JWT ID by default
      options.jwtid = uuidv4()
    }

    return jsonwebtoken.sign(payload, jwtSecret, options)
  }

  /**
   * Verifies an access token.
   *
   * @param accessToken The token to verify
   * @param optsOverride The options to extend the defaults (`configuration.jwtOptions`) with
   * @param secretOverride Use a different secret instead
   */
  async verifyAccessToken(accessToken: string, optsOverride?: JwtVerifyOptions, secretOverride?: Secret) {
    const { secret, jwtOptions } = this.configuration
    const jwtSecret = secretOverride || secret
    const options = merge({}, jwtOptions, optsOverride)
    const { algorithm } = options

    // Normalize the `algorithm` setting into the algorithms array
    if (algorithm && !options.algorithms) {
      options.algorithms = (Array.isArray(algorithm) ? algorithm : [algorithm]) as Algorithm[]
      delete options.algorithm
    }

    try {
      const verified = jsonwebtoken.verify(accessToken, jwtSecret, options)

      return verified as any
    } catch (error: any) {
      throw new NotAuthenticated(error.message, error)
    }
  }

  /**
   * Authenticate a given authentication request against a list of strategies.
   *
   * @param authentication The authentication request
   * @param params Service call parameters
   * @param allowed A list of allowed strategy names
   */
  async authenticate(
    authentication: AuthenticationRequest,
    params: AuthenticationParams,
    ...allowed: string[]
  ) {
    const { strategy } = authentication || {}
    const [authStrategy] = this.getStrategies(strategy)
    const strategyAllowed = allowed.includes(strategy)

    debug('Running authenticate for strategy', strategy, allowed)

    if (!authentication || !authStrategy || !strategyAllowed) {
      const additionalInfo =
        (!strategy && ' (no `strategy` set)') ||
        (!strategyAllowed && ' (strategy not allowed in authStrategies)') ||
        ''

      // If there are no valid strategies or `authentication` is not an object
      throw new NotAuthenticated('Invalid authentication information' + additionalInfo)
    }

    return authStrategy.authenticate(authentication, {
      ...params,
      authenticated: true
    })
  }

  async handleConnection(event: ConnectionEvent, connection: any, authResult?: AuthenticationResult) {
    const strategies = this.getStrategies(...Object.keys(this.strategies)).filter(
      (current) => typeof current.handleConnection === 'function'
    )

    for (const strategy of strategies) {
      await strategy.handleConnection(event, connection, authResult)
    }
  }

  /**
   * Parse an HTTP request and response for authentication request information.
   *
   * @param req The HTTP request
   * @param res The HTTP response
   * @param names A list of strategies to use
   */
  async parse(req: IncomingMessage, res: ServerResponse, ...names: string[]) {
    const strategies = this.getStrategies(...names).filter((current) => typeof current.parse === 'function')

    debug('Strategies parsing HTTP header for authentication information', names)

    for (const authStrategy of strategies) {
      const value = await authStrategy.parse(req, res)

      if (value !== null) {
        return value
      }
    }

    return null
  }

  async setup() {
    this.isReady = true

    for (const name of Object.keys(this.strategies)) {
      const strategy = this.strategies[name]

      await strategy.setup?.(this, name)
    }
  }
}
