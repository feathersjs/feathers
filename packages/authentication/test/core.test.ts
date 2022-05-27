/* eslint-disable @typescript-eslint/ban-ts-comment */
import assert from 'assert'
import { feathers, Application } from '@feathersjs/feathers'
import jwt from 'jsonwebtoken'
import { Infer, schema } from '@feathersjs/schema'

import { AuthenticationBase, AuthenticationRequest } from '../src/core'
import { authenticationSettingsSchema } from '../src/options'
import { Strategy1, Strategy2, MockRequest } from './fixtures'
import { ServerResponse } from 'http'

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

describe('authentication/core', () => {
  let app: Application
  let auth: AuthenticationBase

  beforeEach(() => {
    app = feathers()
    auth = new AuthenticationBase(app, 'authentication', {
      entity: 'user',
      service: 'users',
      secret: 'supersecret',
      first: { hello: 'test' }
    })

    auth.register('first', new Strategy1())
    auth.register('second', new Strategy2())
    auth.register('dummy', {
      async authenticate(data: AuthenticationRequest) {
        return data
      }
    })
  })

  describe('configuration', () => {
    it('infers configuration from settings schema', async () => {
      const settingsSchema = schema({
        $id: 'AuthSettingsSchema',
        ...authenticationSettingsSchema
      } as const)
      type Settings = Infer<typeof settingsSchema>
      const config: Settings = {
        entity: 'user',
        secret: 'supersecret',
        authStrategies: ['some', 'thing']
      }

      await settingsSchema.validate(config)
    })

    it('throws an error when app is not provided', () => {
      try {
        // @ts-ignore
        const otherAuth = new AuthenticationBase()
        assert.fail('Should never get here')
        assert.ok(otherAuth)
      } catch (error: any) {
        assert.strictEqual(error.message, 'An application instance has to be passed to the authentication service')
      }
    })

    it('sets defaults', () => {
      // Getting configuration twice returns a copy
      assert.notStrictEqual(auth.configuration, auth.configuration)
      assert.strictEqual(auth.configuration.entity, 'user')
    })

    it('allows to override jwtOptions, does not merge', () => {
      const { jwtOptions } = auth.configuration
      const auth2options = {
        jwtOptions: {
          expiresIn: '1w'
        }
      }

      app.set('auth2', auth2options)

      const auth2 = new AuthenticationBase(app, 'auth2')

      assert.ok(jwtOptions)
      assert.strictEqual(jwtOptions.expiresIn, '1d')
      assert.strictEqual(jwtOptions.issuer, 'feathers')

      assert.deepStrictEqual(auth2.configuration.jwtOptions, auth2options.jwtOptions)
    })

    it('sets configKey and defaultAuthentication', () => {
      assert.strictEqual(app.get('defaultAuthentication'), 'authentication')
    })

    it('uses default configKey', () => {
      const otherApp = feathers()
      const otherAuth = new AuthenticationBase(otherApp)

      assert.ok(otherAuth)
      assert.strictEqual(otherApp.get('defaultAuthentication'), 'authentication')
      assert.deepStrictEqual(otherApp.get('authentication'), {})
    })
  })

  describe('strategies', () => {
    it('strategyNames', () => {
      assert.deepStrictEqual(auth.strategyNames, ['first', 'second', 'dummy'])
    })

    it('getStrategies', () => {
      const first = auth.getStrategies('first')
      const invalid = auth.getStrategies('first', 'invalid', 'second')

      assert.strictEqual(first.length, 1)
      assert.strictEqual(invalid.length, 2, 'Filtered out invalid strategies')
    })

    it('getStrategy', () => {
      const first = auth.getStrategy('first')

      assert.ok(first)
    })

    it('calls setName, setApplication and setAuthentication if available', () => {
      const [first] = auth.getStrategies('first') as [Strategy1]

      assert.strictEqual(first.name, 'first')
      assert.strictEqual(first.app, app)
      assert.strictEqual(first.authentication, auth)
    })

    it('strategy configuration getter', () => {
      const [first] = auth.getStrategies('first') as [Strategy1]

      assert.deepStrictEqual(first.configuration, { hello: 'test' })
    })

    it('strategy configuration getter', () => {
      const [first] = auth.getStrategies('first') as [Strategy1]
      const oldService = auth.configuration.service

      delete auth.configuration.service

      assert.strictEqual(first.entityService, null)

      auth.configuration.service = oldService
    })
  })

  describe('authenticate', () => {
    describe('with strategy set in params', () => {
      it('returns first success', async () => {
        const result = await auth.authenticate(
          {
            strategy: 'first',
            username: 'David'
          },
          {},
          'first',
          'second'
        )

        assert.deepStrictEqual(result, Strategy1.result)
      })

      it('returns error when failed', async () => {
        try {
          await auth.authenticate(
            {
              strategy: 'first',
              username: 'Steve'
            },
            {},
            'first',
            'second'
          )
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(error.message, 'Invalid Dave')
        }
      })

      it('returns second success', async () => {
        const authentication = {
          strategy: 'second',
          v2: true,
          password: 'supersecret'
        }

        const result = await auth.authenticate(authentication, {}, 'first', 'second')

        assert.deepStrictEqual(
          result,
          Object.assign({}, Strategy2.result, {
            authentication,
            params: { authenticated: true }
          })
        )
      })

      it('passes params', async () => {
        const params = {
          some: 'thing'
        }
        const authentication = {
          strategy: 'second',
          v2: true,
          password: 'supersecret'
        }

        const result = await auth.authenticate(authentication, params, 'first', 'second')

        assert.deepStrictEqual(
          result,
          Object.assign(
            {
              params: Object.assign(params, {
                authenticated: true
              }),
              authentication
            },
            Strategy2.result
          )
        )
      })

      it('throws error when allowed and passed strategy does not match', async () => {
        try {
          await auth.authenticate(
            {
              strategy: 'first',
              username: 'Dummy'
            },
            {},
            'second'
          )
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(
            error.message,
            'Invalid authentication information (strategy not allowed in authStrategies)'
          )
        }
      })

      it('throws error when strategy is not set', async () => {
        try {
          await auth.authenticate(
            {
              username: 'Dummy'
            },
            {},
            'second'
          )
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.message, 'Invalid authentication information (no `strategy` set)')
        }
      })
    })
  })

  describe('parse', () => {
    const res = {} as ServerResponse

    it('returns null when no names are given', async () => {
      const req = {} as MockRequest

      assert.strictEqual(await auth.parse(req, res), null)
    })

    it('successfully parses a request (first)', async () => {
      const req = { isDave: true } as MockRequest

      const result = await auth.parse(req, res, 'first', 'second')

      assert.deepStrictEqual(result, Strategy1.result)
    })

    it('successfully parses a request (second)', async () => {
      const req = { isV2: true } as MockRequest

      const result = await auth.parse(req, res, 'first', 'second')

      assert.deepStrictEqual(result, Strategy2.result)
    })

    it('null when no success', async () => {
      const req = {} as MockRequest

      const result = await auth.parse(req, res, 'first', 'second')

      assert.strictEqual(result, null)
    })
  })

  describe('jwt', () => {
    const message = 'Some payload'

    describe('createAccessToken', () => {
      // it('errors with no payload', () => {
      //   try {
      //     // @ts-ignore
      //     await auth.createAccessToken();
      //     assert.fail('Should never get here');
      //   } catch (error: any) {
      //     assert.strictEqual(error.message, 'payload is required');
      //   }
      // });

      it('with default options', async () => {
        const msg = 'Some payload'

        const accessToken = await auth.createAccessToken({ message: msg })
        const decoded = jwt.decode(accessToken)
        const settings = auth.configuration.jwtOptions

        if (decoded === null || typeof decoded === 'string') {
          throw new Error('Not encoded properly')
        }

        assert.ok(typeof accessToken === 'string')
        assert.strictEqual(decoded.message, msg, 'Set payload')
        assert.ok(UUID.test(decoded.jti), 'Set `jti` to default UUID')
        assert.strictEqual(decoded.aud, settings.audience)
        assert.strictEqual(decoded.iss, settings.issuer)
      })

      it('with default and overriden options', async () => {
        const overrides = {
          issuer: 'someoneelse',
          audience: 'people',
          jwtid: 'something'
        }

        const accessToken = await auth.createAccessToken({ message }, overrides)

        assert.ok(typeof accessToken === 'string')

        const decoded = jwt.decode(accessToken)

        if (decoded === null || typeof decoded === 'string') {
          throw new Error('Not encoded properly')
        }

        assert.strictEqual(decoded.message, message, 'Set payload')
        assert.strictEqual(decoded.jti, 'something')
        assert.strictEqual(decoded.aud, overrides.audience)
        assert.strictEqual(decoded.iss, overrides.issuer)
      })

      it('errors with invalid options', async () => {
        const overrides = {
          algorithm: 'fdjsklfsndkl'
        }

        try {
          // @ts-ignore
          await auth.createAccessToken({}, overrides)
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.message, '"algorithm" must be a valid string enum value')
        }
      })
    })

    describe('verifyAccessToken', () => {
      let validToken: string
      let expiredToken: string

      beforeEach(async () => {
        validToken = await auth.createAccessToken({ message })
        expiredToken = await auth.createAccessToken(
          {},
          {
            expiresIn: '1ms'
          }
        )
      })

      it('returns payload when token is valid', async () => {
        const payload = await auth.verifyAccessToken(validToken)

        assert.strictEqual(payload.message, message)
      })

      it('errors when custom algorithm property does not match', async () => {
        try {
          await auth.verifyAccessToken(validToken, {
            algorithm: ['HS512']
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.message, 'invalid algorithm')
        }
      })

      it('errors when algorithms property does not match', async () => {
        try {
          await auth.verifyAccessToken(validToken, {
            algorithms: ['HS512']
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.message, 'invalid algorithm')
        }
      })

      it('errors when secret is different', async () => {
        try {
          await auth.verifyAccessToken(validToken, {}, 'fdjskl')

          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.message, 'invalid signature')
        }
      })

      it('errors when other custom options do not match', async () => {
        try {
          await auth.verifyAccessToken(validToken, { issuer: 'someonelse' })

          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.ok(/jwt issuer invalid/.test(error.message))
        }
      })

      it('errors when token is expired', async () => {
        try {
          await auth.verifyAccessToken(expiredToken)
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(error.message, 'jwt expired')
          assert.strictEqual(error.data.name, 'TokenExpiredError')
          assert.ok(error.data.expiredAt)
        }
      })
    })
  })
})
