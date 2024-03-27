import { io } from 'socket.io-client'
import assert from 'assert'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio'
import socketioClient from '@feathersjs/socketio-client'

import authClient from '../../src'
import getApp from './fixture'
import commonTests from './commons'
import { AuthenticationResult } from '@feathersjs/authentication/lib'
import getPort from 'get-port'

describe('@feathersjs/authentication-client Socket.io integration', async () => {
  const app = getApp(feathers().configure(socketio()))
  const port = await getPort()
  await app.listen(port)

  afterAll(() => new Promise<void>((resolve) => app.io.close(() => resolve())))

  it('allows to authenticate with handshake headers and sends login event', async () => {
    const user = { email: 'authtest@example.com', password: 'alsosecret' }

    await app.service('users').create(user)

    const { accessToken } = await app.service('authentication').create({
      strategy: 'local',
      ...user
    })

    const socket = io(`http://localhost:${port}`, {
      transports: ['websocket'],
      transportOptions: {
        websocket: {
          extraHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    })
    const authResult: any = await new Promise((resolve) => app.once('login', (res) => resolve(res)))

    assert.strictEqual(authResult.accessToken, accessToken)

    const dummy: any = await new Promise((resolve, reject) => {
      socket.emit('find', 'dummy', {}, (error: Error, page: any) => (error ? reject(error) : resolve(page)))
    })

    assert.strictEqual(dummy.user.email, user.email)
    assert.strictEqual(dummy.authentication.accessToken, accessToken)
    assert.strictEqual(dummy.headers.authorization, `Bearer ${accessToken}`)
  })

  it('reconnects after socket disconnection', async () => {
    const user = { email: 'disconnecttest@example.com', password: 'alsosecret' }
    const socket = io(`http://localhost:${port}`, {
      timeout: 500,
      reconnection: true,
      reconnectionDelay: 100
    })
    const client = feathers().configure(socketioClient(socket)).configure(authClient())

    await app.service('users').create(user)
    await client.authenticate({
      strategy: 'local',
      ...user
    })

    const onLogin = new Promise<AuthenticationResult>((resolve) => app.once('login', (data) => resolve(data)))

    socket.once('disconnect', () => socket.connect())
    socket.disconnect()

    const {
      authentication: { strategy }
    } = await onLogin
    const dummy = await client.service('dummy').find()

    assert.strictEqual(strategy, 'jwt')
    assert.strictEqual(dummy.user.email, user.email)
  })

  commonTests(
    () => app,
    () => {
      return feathers()
        .configure(socketioClient(io(`http://localhost:${port}`)))
        .configure(authClient())
    },
    {
      email: 'socketioauth@feathersjs.com',
      password: 'secretive',
      provider: 'socketio'
    }
  )
})
