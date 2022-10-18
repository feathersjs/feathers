import { strict as assert } from 'assert'
import { io, Socket } from 'socket.io-client'
import { verify } from '@feathersjs/tests'
import { RealTimeConnection } from '@feathersjs/feathers'

export default (name: string, options: any) => {
  const call = (method: string, ...args: any[]) => {
    return new Promise((resolve, reject) => {
      const { socket } = options
      const emitArgs = [method, name].concat(args)

      socket.emit(...emitArgs, (error: any, result: any) => (error ? reject(error) : resolve(result)))
    })
  }

  const verifyEvent = (done: (err?: any) => void, callback: (data: any) => void) => {
    return function (data: any) {
      try {
        callback(data)
        done()
      } catch (error: any) {
        done(error)
      }
    }
  }

  describe('Basic service events', () => {
    let socket: Socket
    let connection: RealTimeConnection

    before((done) => {
      options.app.once('connection', (conn: RealTimeConnection) => {
        connection = conn

        options.app.channel('default').join(connection)
        options.app.publish(() => options.app.channel('default'))
        done()
      })
      socket = io('http://localhost:7886')
    })

    after((done) => {
      socket.once('disconnect', () => done())
      socket.disconnect()
    })

    it(`${name} created`, (done) => {
      const original = {
        name: 'created event'
      }

      socket.once(
        `${name} created`,
        verifyEvent(done, (data) => verify.create(original, data))
      )

      call('create', original)
    })

    it(`${name} updated`, (done) => {
      const original = {
        name: 'updated event'
      }

      socket.once(
        `${name} updated`,
        verifyEvent(done, (data: any) => verify.update(10, original, data))
      )

      call('update', 10, original)
    })

    it(`${name} patched`, (done) => {
      const original = {
        name: 'patched event'
      }

      socket.once(
        `${name} patched`,
        verifyEvent(done, (data: any) => verify.patch(12, original, data))
      )

      call('patch', 12, original)
    })

    it(`${name} removed`, (done) => {
      socket.once(
        `${name} removed`,
        verifyEvent(done, (data: any) => verify.remove(333, data))
      )

      call('remove', 333)
    })

    it(`${name} custom events`, (done) => {
      const service = options.app.service(name)
      const original = {
        name: 'created event'
      }

      socket.once(
        `${name} log`,
        verifyEvent(done, (data: any) => {
          assert.deepStrictEqual(data, {
            message: 'Custom log event',
            data: original
          })
        })
      )

      service.emit('log', {
        data: original,
        message: 'Custom log event'
      })
    })
  })

  describe('Event channels', () => {
    const eventName = `${name} created`

    let connections: RealTimeConnection[]
    let sockets: any[]

    before((done) => {
      let counter = 0
      const handler = (connection: RealTimeConnection) => {
        counter++

        options.app.channel(connection.channel).join(connection)

        connections.push(connection)

        if (counter === 3) {
          done()
          options.app.removeListener('connection', handler)
        }
      }

      connections = []
      sockets = []

      options.app.on('connection', handler)

      sockets.push(
        io('http://localhost:7886', {
          query: { channel: 'first' }
        }),

        io('http://localhost:7886', {
          query: { channel: 'second' }
        }),

        io('http://localhost:7886', {
          query: { channel: 'second' }
        })
      )
    })

    after(() => {
      sockets.forEach((socket) => socket.disconnect())
    })

    it(`filters '${eventName}' event for a single channel`, (done) => {
      const service = options.app.service(name)
      const [socket, otherSocket] = sockets
      const onError = () => {
        done(new Error('Should not get this event'))
      }

      service.publish('created', (data: any) => options.app.channel(data.room))

      socket.once(eventName, (data: any) => {
        assert.strictEqual(data.room, 'first')
        otherSocket.removeEventListener(eventName, onError)
        done()
      })

      otherSocket.once(eventName, onError)

      service.create({
        text: 'Event dispatching test',
        room: 'first'
      })
    })

    it(`filters '${name} created' event for a channel with multiple connections`, (done) => {
      let counter = 0

      const service = options.app.service(name)
      const [otherSocket, socketOne, socketTwo] = sockets
      const onError = () => {
        done(new Error('Should not get this event'))
      }
      const onEvent = (data: any) => {
        counter++
        assert.strictEqual(data.room, 'second')

        if (++counter === 2) {
          otherSocket.removeEventListener(eventName, onError)
          done()
        }
      }

      service.publish('created', (data: any) => options.app.channel(data.room))

      socketOne.once(eventName, onEvent)
      socketTwo.once(eventName, onEvent)
      otherSocket.once(eventName, onError)

      service.create({
        text: 'Event dispatching test',
        room: 'second'
      })
    })
  })
}
