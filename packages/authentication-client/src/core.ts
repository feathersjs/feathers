import { NotAuthenticated, FeathersError } from '@feathersjs/errors'
import { Application, Params } from '@feathersjs/feathers'
import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'
import { Storage, StorageWrapper } from './storage'

class OauthError extends FeathersError {
  constructor(message: string, data?: any) {
    super(message, 'OauthError', 401, 'oauth-error', data)
  }
}

const getMatch = (location: Location, key: string): [string, RegExp] => {
  const regex = new RegExp(`(?:\&?)${key}=([^&]*)`)
  const match = location.hash ? location.hash.match(regex) : null

  if (match !== null) {
    const [, value] = match

    return [value, regex]
  }

  return [null, regex]
}

export type ClientConstructor = new (
  app: Application,
  options: AuthenticationClientOptions
) => AuthenticationClient

export interface AuthenticationClientOptions {
  storage: Storage
  header: string
  scheme: string
  storageKey: string
  locationKey: string
  locationErrorKey: string
  jwtStrategy: string
  path: string
  Authentication: ClientConstructor
}

export class AuthenticationClient {
  app: Application
  authenticated: boolean
  options: AuthenticationClientOptions

  constructor(app: Application, options: AuthenticationClientOptions) {
    const socket = app.io
    const storage = new StorageWrapper(app.get('storage') || options.storage)

    this.app = app
    this.options = options
    this.authenticated = false
    this.app.set('storage', storage)

    if (socket) {
      this.handleSocket(socket)
    }
  }

  get service() {
    return this.app.service(this.options.path)
  }

  get storage() {
    return this.app.get('storage') as Storage
  }

  handleSocket(socket: any) {
    // When the socket disconnects and we are still authenticated, try to reauthenticate right away
    // the websocket connection will handle timeouts and retries
    socket.on('disconnect', () => {
      if (this.authenticated) {
        this.reAuthenticate(true)
      }
    })
  }

  /**
   * Parse the access token or authentication error from the window location hash. Will remove it from the hash
   * if found.
   *
   * @param location The window location
   * @returns The access token if available, will throw an error if found, otherwise null
   */
  getFromLocation(location: Location) {
    const [accessToken, tokenRegex] = getMatch(location, this.options.locationKey)

    if (accessToken !== null) {
      location.hash = location.hash.replace(tokenRegex, '')

      return Promise.resolve(accessToken)
    }

    const [message, errorRegex] = getMatch(location, this.options.locationErrorKey)

    if (message !== null) {
      location.hash = location.hash.replace(errorRegex, '')

      return Promise.reject(new OauthError(decodeURIComponent(message)))
    }

    return Promise.resolve(null)
  }

  /**
   * Set the access token in storage.
   *
   * @param accessToken The access token to set
   * @returns
   */
  setAccessToken(accessToken: string) {
    return this.storage.setItem(this.options.storageKey, accessToken)
  }

  /**
   * Returns the access token from storage or the window location hash.
   *
   * @returns The access token from storage or location hash
   */
  getAccessToken(): Promise<string | null> {
    return this.storage.getItem(this.options.storageKey).then((accessToken: string) => {
      if (!accessToken && typeof window !== 'undefined' && window.location) {
        return this.getFromLocation(window.location)
      }

      return accessToken || null
    })
  }

  /**
   * Remove the access token from storage
   * @returns The removed access token
   */
  removeAccessToken() {
    return this.storage.removeItem(this.options.storageKey)
  }

  /**
   * Reset the internal authentication state. Usually not necessary to call directly.
   *
   * @returns null
   */
  reset() {
    this.app.set('authentication', null)
    this.authenticated = false

    return Promise.resolve(null)
  }

  handleError(error: FeathersError, type: 'authenticate' | 'logout') {
    // For NotAuthenticated, PaymentError, Forbidden, NotFound, MethodNotAllowed, NotAcceptable
    // errors, remove the access token
    if (error.code > 400 && error.code < 408) {
      const promise = this.removeAccessToken().then(() => this.reset())

      return type === 'logout' ? promise : promise.then(() => Promise.reject(error))
    }

    return this.reset().then(() => Promise.reject(error))
  }

  /**
   * Try to reauthenticate using the token from storage. Will do nothing if already authenticated unless
   * `force` is true.
   *
   * @param force force reauthentication with the server
   * @param strategy The name of the strategy to use. Defaults to `options.jwtStrategy`
   * @param authParams Additional authentication parameters
   * @returns The reauthentication result
   */
  reAuthenticate(force = false, strategy?: string, authParams?: Params): Promise<AuthenticationResult> {
    // Either returns the authentication state or
    // tries to re-authenticate with the stored JWT and strategy
    let authPromise = this.app.get('authentication')

    if (!authPromise || force === true) {
      authPromise = this.getAccessToken().then((accessToken) => {
        if (!accessToken) {
          return this.handleError(new NotAuthenticated('No accessToken found in storage'), 'authenticate')
        }

        return this.authenticate(
          {
            strategy: strategy || this.options.jwtStrategy,
            accessToken
          },
          authParams
        )
      })
      this.app.set('authentication', authPromise)
    }

    return authPromise
  }

  /**
   * Authenticate using a specific strategy and data.
   *
   * @param authentication The authentication data
   * @param params Additional parameters
   * @returns The authentication result
   */
  authenticate(authentication?: AuthenticationRequest, params?: Params): Promise<AuthenticationResult> {
    if (!authentication) {
      return this.reAuthenticate()
    }

    const promise = this.service
      .create(authentication, params)
      .then((authResult: AuthenticationResult) => {
        const { accessToken } = authResult

        this.authenticated = true
        this.app.emit('login', authResult)
        this.app.emit('authenticated', authResult)

        return this.setAccessToken(accessToken).then(() => authResult)
      })
      .catch((error: FeathersError) => this.handleError(error, 'authenticate'))

    this.app.set('authentication', promise)

    return promise
  }

  /**
   * Log out the current user and remove their token. Will do nothing
   * if not authenticated.
   *
   * @returns The log out result.
   */
  logout(): Promise<AuthenticationResult | null> {
    return Promise.resolve(this.app.get('authentication'))
      .then(() =>
        this.service.remove(null).then((authResult: AuthenticationResult) =>
          this.removeAccessToken()
            .then(() => this.reset())
            .then(() => {
              this.app.emit('logout', authResult)

              return authResult
            })
        )
      )
      .catch((error: FeathersError) => this.handleError(error, 'logout'))
  }
}
