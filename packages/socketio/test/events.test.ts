import { strict as assert } from 'assert'
import { io, Socket } from 'socket.io-client'
import { verify } from '@feathersjs/tests-vitest'
import { Id, RealTimeConnection } from '@feathersjs/feathers'
import mockApp from './mock-app'

describe('@feathersjs/socketio/events', async () => {
  const { app, socket, port, close } = await mockApp()

  afterAll(async () => {
    await close()
  })

  function call(method: string, servicePath: string, id: Id): Promise<any>
  function call(method: string, servicePath: string, data: Record<string, any>): Promise<any>
  function call(method: string, servicePath: string, id: Id, data: Record<string, any>): Promise<any>
  function call(method: string, servicePath: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const emitArgs = [method, servicePath].concat(args)

      socket.emit(...emitArgs, (error: any, result: any) => (error ? reject(error) : resolve(result)))
    })
  }

  const verifyEvent = (callback: (data: any) => void, resolve: () => void, reject: (err: any) => void) => {
    return function (data: any) {
      try {
        callback(data)
        resolve()
      } catch (error: any) {
        reject?.(error)
      }
    }
  }

  describe('Basic service events', () => {
    ;['todo', 'tasks'].forEach((name) => {
      it(`${name} created`, () =>
        new Promise<void>((resolve, reject) => {
          const original = {
            name: 'created event'
          }

          socket.once(
            `${name} created`,
            verifyEvent((data) => verify.create(original, data), resolve, reject)
          )

          call('create', name, original)
        }))

      it(`${name} updated`, () =>
        new Promise<void>((resolve, reject) => {
          const original = {
            name: 'updated event'
          }

          socket.once(
            `${name} updated`,
            verifyEvent((data: any) => verify.update(10, original, data), resolve, reject)
          )

          call('update', name, 10, original)
        }))

      it(`${name} patched`, () =>
        new Promise<void>((resolve, reject) => {
          const original = {
            name: 'patched event'
          }

          socket.once(
            `${name} patched`,
            verifyEvent((data: any) => verify.patch(12, original, data), resolve, reject)
          )

          call('patch', name, 12, original)
        }))

      it(`${name} removed`, () =>
        new Promise<void>((resolve, reject) => {
          socket.once(
            `${name} removed`,
            verifyEvent((data: any) => verify.remove(333, data), resolve, reject)
          )

          call('remove', name, 333)
        }))

      it(`${name} custom events`, () =>
        new Promise<void>((resolve, reject) => {
          const service = app.service(name)
          const original = {
            name: 'created event'
          }

          socket.once(
            `${name} log`,
            verifyEvent(
              (data: any) => {
                assert.deepStrictEqual(data, {
                  message: 'Custom log event',
                  data: original
                })
              },
              resolve,
              reject
            )
          )

          service.emit('log', {
            data: original,
            message: 'Custom log event'
          })
        }))
    })
  })

  describe('Event channels', () => {
    let connections: RealTimeConnection[]
    let sockets: Socket[]

    beforeAll(
      () =>
        new Promise<void>((resolve) => {
          let counter = 0
          const handler = (connection: RealTimeConnection) => {
            counter++

            app.channel(connection.channel).join(connection)

            connections.push(connection)

            if (counter === 3) {
              resolve()
              app.removeListener('connection', handler)
            }
          }

          connections = []
          sockets = []

          app.on('connection', handler)

          sockets.push(
            io(`http://localhost:${port}`, {
              query: { channel: 'first' }
            }),

            io(`http://localhost:${port}`, {
              query: { channel: 'second' }
            }),

            io(`http://localhost:${port}`, {
              query: { channel: 'second' }
            })
          )
        })
    )

    afterAll(() => {
      sockets.forEach((socket) => socket.disconnect())
    })
    ;['todo', 'tasks'].forEach((name) => {
      const eventName = `${name} created`

      it(`filters '${eventName}' event for a single channel`, () =>
        new Promise<void>((resolve, reject) => {
          const service = app.service(name)
          const [socket, otherSocket] = sockets
          const onError = () => {
            reject(new Error('Should not get this event'))
          }

          service.publish('created', (data: any) => app.channel(data.room))

          socket.once(eventName, (data: any) => {
            assert.strictEqual(data.room, 'first')
            otherSocket.removeEventListener(eventName, onError)
            resolve()
          })

          otherSocket.once(eventName, onError)

          service.create({
            text: 'Event dispatching test',
            room: 'first'
          })
        }))

      it(`filters '${name} created' event for a channel with multiple connections`, () =>
        new Promise<void>((resolve, reject) => {
          let counter = 0

          const service = app.service(name)
          const [otherSocket, socketOne, socketTwo] = sockets
          const onError = () => {
            reject(new Error('Should not get this event'))
          }
          const onEvent = (data: any) => {
            counter++
            assert.strictEqual(data.room, 'second')

            if (++counter === 2) {
              otherSocket.removeEventListener(eventName, onError)
              resolve()
            }
          }

          service.publish('created', (data: any) => app.channel(data.room))

          socketOne.once(eventName, onEvent)
          socketTwo.once(eventName, onEvent)
          otherSocket.once(eventName, onError)

          service.create({
            text: 'Event dispatching test',
            room: 'second'
          })
        }))
    })
  })
})
