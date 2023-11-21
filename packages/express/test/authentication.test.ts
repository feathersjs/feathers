/* eslint-disable @typescript-eslint/ban-ts-comment */
import { omit } from 'lodash'
import { strict as assert } from 'assert'
import { default as _axios } from 'axios'
import { feathers } from '@feathersjs/feathers'
import { createApplication } from '@feathersjs/authentication-local/test/fixture'
import { authenticate, AuthenticationResult } from '@feathersjs/authentication'
import * as express from '../src'

const expressify = express.default
const axios = _axios.create({
  baseURL: 'http://localhost:9876/'
})

describe('@feathersjs/express/authentication', () => {
  const email = 'expresstest@authentication.com'
  const password = 'superexpress'

  let app: express.Application
  let user: any
  let authResult: AuthenticationResult

  beforeAll(async () => {
    const expressApp = expressify(feathers()).use(express.json()).configure(express.rest())

    app = createApplication(expressApp as any) as unknown as express.Application

    await app.listen(9876)

    app.use('/dummy', {
      get(id, params) {
        return Promise.resolve({ id, params })
      }
    })

    // @ts-ignore
    app.use('/protected', express.authenticate('jwt'), (req, res) => {
      res.json(req.feathers.user)
    })

    app.use(
      express.errorHandler({
        logger: false
      })
    )

    app.service('dummy').hooks({
      before: [authenticate('jwt')]
    })

    const result = await app.service('users').create({ email, password })

    user = result

    const res = await axios.post<any>('/authentication', {
      strategy: 'local',
      password,
      email
    })

    authResult = res.data
  })

  afterAll(() => app.teardown())

  describe('service authentication', () => {
    it('successful local authentication', () => {
      assert.ok(authResult.accessToken)
      assert.deepStrictEqual(omit(authResult.authentication, 'payload'), {
        strategy: 'local'
      })
      assert.strictEqual(authResult.user.email, email)
      assert.strictEqual(authResult.user.password, undefined)
    })

    it('local authentication with wrong password fails', async () => {
      try {
        await axios.post<any>('/authentication', {
          strategy: 'local',
          password: 'wrong',
          email
        })
        assert.fail('Should never get here')
      } catch (error: any) {
        const { data } = error.response
        assert.strictEqual(data.name, 'NotAuthenticated')
        assert.strictEqual(data.message, 'Invalid login')
      }
    })

    it('authenticating with JWT works but returns same accessToken', async () => {
      const { accessToken } = authResult
      const { data } = await axios.post<any>('/authentication', {
        strategy: 'jwt',
        accessToken
      })

      assert.strictEqual(data.accessToken, accessToken)
      assert.strictEqual(data.authentication.strategy, 'jwt')
      assert.strictEqual(data.authentication.payload.sub, user.id.toString())
      assert.strictEqual(data.user.email, email)
    })

    it('can make a protected request with Authorization header', async () => {
      const { accessToken } = authResult

      const {
        data,
        data: { params }
      } = await axios.get<any>('/dummy/dave', {
        headers: {
          Authorization: accessToken
        }
      })

      assert.strictEqual(data.id, 'dave')
      assert.deepStrictEqual(params.user, user)
      assert.strictEqual(params.authentication.accessToken, accessToken)
    })

    it('errors when there are no authStrategies and parseStrategies', async () => {
      const { accessToken } = authResult
      app.get('authentication').authStrategies = []
      delete app.get('authentication').parseStrategies

      try {
        await axios.get<any>('/dummy/dave', {
          headers: {
            Authorization: accessToken
          }
        })
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.strictEqual(error.response.data.name, 'NotAuthenticated')
        app.get('authentication').authStrategies = ['jwt', 'local']
      }
    })

    it('can make a protected request with Authorization header and bearer scheme', async () => {
      const { accessToken } = authResult

      const {
        data,
        data: { params }
      } = await axios.get<any>('/dummy/dave', {
        headers: {
          Authorization: ` Bearer: ${accessToken}`
        }
      })

      assert.strictEqual(data.id, 'dave')
      assert.deepStrictEqual(params.user, user)
      assert.strictEqual(params.authentication.accessToken, accessToken)
    })
  })

  describe('authenticate middleware', () => {
    it('errors without valid strategies', () => {
      try {
        // @ts-ignore
        authenticate()
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.strictEqual(error.message, 'The authenticate hook needs at least one allowed strategy')
      }
    })

    it('protected endpoint fails when JWT is not present', () => {
      return axios
        .get<any>('/protected')
        .then(() => {
          assert.fail('Should never get here')
        })
        .catch((error) => {
          const { data } = error.response

          assert.strictEqual(data.name, 'NotAuthenticated')
          assert.strictEqual(data.message, 'Not authenticated')
        })
    })

    it.skip('protected endpoint fails with invalid Authorization header', async () => {
      try {
        await axios.get<any>('/protected', {
          headers: {
            Authorization: 'Bearer: something wrong'
          }
        })
        assert.fail('Should never get here')
      } catch (error: any) {
        const { data } = error.response

        assert.strictEqual(data.name, 'NotAuthenticated')
        assert.strictEqual(data.message, 'Not authenticated')
      }
    })

    it('can request protected endpoint with JWT present', async () => {
      const { data } = await axios.get<any>('/protected', {
        headers: {
          Authorization: `Bearer ${authResult.accessToken}`
        }
      })

      assert.strictEqual(data.email, user.email)
      assert.strictEqual(data.id, user.id)
      assert.strictEqual(data.password, user.password)
    })
  })
})
