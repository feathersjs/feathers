/* eslint-disable @typescript-eslint/no-unused-vars */
import { strict as assert } from 'assert'
import axios, { AxiosRequestConfig } from 'axios'

import { Server } from 'http'
import { Request, Response, NextFunction } from 'express'
import { ApplicationHookMap, feathers, HookContext, Id, Params } from '@feathersjs/feathers'
import { Service, restTests } from '@feathersjs/tests'
import { BadRequest } from '@feathersjs/errors'

import * as express from '../src'

const expressify = express.default
const { rest } = express
const errorHandler = express.errorHandler({
  logger: false
})

describe('@feathersjs/express/rest provider', () => {
  describe('base functionality', () => {
    it('throws an error if you did not expressify', () => {
      const app = feathers()

      try {
        app.configure(rest() as any)
        assert.ok(false, 'Should never get here')
      } catch (e: any) {
        assert.strictEqual(e.message, '@feathersjs/express/rest needs an Express compatible app.')
      }
    })

    it('lets you set the handler manually', async () => {
      const app = expressify(feathers())

      app
        .configure(
          rest(function (_req, res) {
            res.format({
              'text/plain'() {
                res.end(`The todo is: ${res.data.description}`)
              }
            })
          })
        )
        .use('/todo', {
          async get(id: Id) {
            return {
              description: `You have to do ${id}`
            }
          }
        })

      const server = await app.listen(4776)

      const res = await axios.get<any>('http://localhost:4776/todo/dishes')

      assert.strictEqual(res.data, 'The todo is: You have to do dishes')
      server.close()
    })

    it('lets you set no handler', async () => {
      const app = expressify(feathers())
      const data = { fromHandler: true }

      app
        .configure(rest(null))
        .use('/todo', {
          async get(id: Id) {
            return {
              description: `You have to do ${id}`
            }
          }
        })
        .use((_req: Request, res: Response) => res.json(data))

      const server = await app.listen(5775)
      const res = await axios.get<any>('http://localhost:5775/todo-handler/dishes')

      assert.deepStrictEqual(res.data, data)

      server.close()
    })
  })

  describe('CRUD', () => {
    let app: express.Application

    before(async () => {
      app = expressify(feathers())
        .use(express.cors())
        .use(express.json())
        .configure(rest(express.formatter))
        .use('codes', {
          async get(id: Id) {
            return { id }
          },

          async create(data: any) {
            return data
          }
        })
        .use('/', new Service())
        .use('todo', new Service())

      app.hooks({
        setup: [
          async (context, next) => {
            assert.ok(context.app)
            await next()
          }
        ],
        teardown: [
          async (context, next) => {
            assert.ok(context.app)
            await next()
          }
        ]
      } as ApplicationHookMap<express.Application>)

      await app.listen(4777, () => app.use('tasks', new Service()))
    })

    after(() => app.teardown())

    restTests('Services', 'todo', 4777)
    restTests('Root Service', '/', 4777)
    restTests('Dynamic Services', 'tasks', 4777)

    describe('res.hook', () => {
      const convertHook = (hook: HookContext) => {
        const result: any = Object.assign({}, hook)

        delete result.self
        delete result.service
        delete result.app
        delete result.error

        return result
      }

      it('sets the actual hook object in res.hook', async () => {
        const params = {
          route: {},
          query: { test: 'param' },
          provider: 'rest'
        }

        app.use(
          '/hook',
          {
            async get(id) {
              return {
                description: `You have to do ${id}`
              }
            }
          },
          function (_req: Request, res: Response, next: NextFunction) {
            res.data = convertHook(res.hook)

            next()
          }
        )

        app.service('hook').hooks({
          after(hook: HookContext) {
            hook.addedProperty = true
          }
        })

        const res = await axios.get<any>('http://localhost:4777/hook/dishes?test=param')
        const paramsWithHeaders = {
          ...params,
          headers: res.data.params.headers
        }

        assert.deepStrictEqual(res.data, {
          id: 'dishes',
          params: paramsWithHeaders,
          arguments: ['dishes', paramsWithHeaders],
          type: 'around',
          method: 'get',
          path: 'hook',
          http: {},
          event: null,
          result: { description: 'You have to do dishes' },
          addedProperty: true
        })
      })

      it('can use hook.dispatch', async () => {
        app.use('/hook-dispatch', {
          async get() {
            return {}
          }
        })

        app.service('hook-dispatch').hooks({
          after(hook: HookContext) {
            hook.dispatch = {
              id: hook.id,
              fromDispatch: true
            }
          }
        })

        const res = await axios.get<any>('http://localhost:4777/hook-dispatch/dishes')
        assert.deepStrictEqual(res.data, {
          id: 'dishes',
          fromDispatch: true
        })
      })

      it('allows to set statusCode in a hook', async () => {
        app.use('/hook-status', {
          async get() {
            return {}
          }
        })

        app.service('hook-status').hooks({
          after(hook: HookContext) {
            hook.http.status = 206
          }
        })

        const res = await axios.get<any>('http://localhost:4777/hook-status/dishes')

        assert.strictEqual(res.status, 206)
      })

      it('allows to set response headers in a hook', async () => {
        app.use('/hook-headers', {
          async get() {
            return {}
          }
        })

        app.service('hook-headers').hooks({
          after(hook: HookContext) {
            hook.http.headers = { foo: 'first', bar: ['second', 'third'] }
          }
        })

        const res = await axios.get<any>('http://localhost:4777/hook-headers/dishes')

        assert.strictEqual(res.headers.foo, 'first')
        assert.strictEqual(res.headers.bar, 'second, third')
      })

      it('sets the hook object in res.hook on error', async () => {
        const params = {
          route: {},
          query: {},
          provider: 'rest'
        }

        app.use('/hook-error', {
          async get() {
            throw new Error('I blew up')
          }
        })
        app.use(function (error: Error, _req: Request, res: Response, _next: NextFunction) {
          res.status(500)
          res.json({
            hook: convertHook(res.hook),
            error: {
              message: error.message
            }
          })
        })

        try {
          await axios('http://localhost:4777/hook-error/dishes')
          assert.fail('Should never get here')
        } catch (error: any) {
          const { data } = error.response
          const paramsWithHeaders = {
            ...params,
            headers: data.hook.params.headers
          }
          assert.deepStrictEqual(error.response.data, {
            hook: {
              id: 'dishes',
              params: paramsWithHeaders,
              arguments: ['dishes', paramsWithHeaders],
              type: 'around',
              event: null,
              method: 'get',
              path: 'hook-error',
              http: {}
            },
            error: { message: 'I blew up' }
          })
        }
      })
    })
  })

  describe('middleware', () => {
    it('sets service parameters and provider type', async () => {
      const service = {
        async get(_id: Id, params: Params) {
          return params
        }
      }

      const app = expressify(feathers())
        .use(function (req: Request, _res: Response, next: NextFunction) {
          req.feathers.test = 'Happy'
          next()
        })
        .configure(rest(express.formatter))
        .use('service', service)
      const server = await app.listen(4778)

      const res = await axios.get<any>('http://localhost:4778/service/bla?some=param&another=thing')
      const expected = {
        headers: res.data.headers,
        test: 'Happy',
        provider: 'rest',
        route: {},
        query: {
          some: 'param',
          another: 'thing'
        }
      }

      assert.ok(res.status === 200, 'Got OK status code')
      assert.deepStrictEqual(res.data, expected, 'Got params object back')
      server.close()
    })

    it('Lets you configure your own middleware before the handler (#40)', async () => {
      const data = {
        description: 'Do dishes!',
        id: 'dishes'
      }
      const app = expressify(feathers())

      app
        .use(function defaultContentTypeMiddleware(req, _res, next) {
          req.headers['content-type'] = req.headers['content-type'] || 'application/json'
          next()
        })
        .use(express.json())
        .configure(rest(express.formatter))
        .use('/todo', {
          async create(data: any) {
            return data
          }
        })

      const server = await app.listen(4775)
      const res = await axios({
        url: 'http://localhost:4775/todo',
        method: 'post',
        data,
        headers: {
          'content-type': ''
        }
      })

      assert.deepStrictEqual(res.data, data)
      server.close()
    })

    it('allows middleware before and after a service', async () => {
      const app = expressify(feathers())

      app
        .use(express.json())
        .configure(rest())
        .use(
          '/todo',
          function (req, _res, next) {
            req.body.before = ['before first']
            next()
          },
          function (req, _res, next) {
            req.body.before.push('before second')
            next()
          },
          {
            async create(data: any) {
              return data
            }
          },
          function (_req, res, next) {
            res.data.after = ['after first']
            next()
          },
          function (_req, res, next) {
            res.data.after.push('after second')
            next()
          }
        )

      const server = await app.listen(4776)
      const res = await axios.post<any>('http://localhost:4776/todo', {
        text: 'Do dishes'
      })

      assert.deepStrictEqual(res.data, {
        text: 'Do dishes',
        before: ['before first', 'before second'],
        after: ['after first', 'after second']
      })

      server.close()
    })

    it('allows middleware arrays before and after a service', async () => {
      const app = expressify(feathers())

      app.use(express.json())
      app.configure(rest())
      app.use(
        '/todo',
        [
          function (req: Request, _res: Response, next: NextFunction) {
            req.body.before = ['before first']
            next()
          },
          function (req: Request, _res: Response, next: NextFunction) {
            req.body.before.push('before second')
            next()
          }
        ],
        {
          async create(data) {
            return data
          }
        },
        [
          function (_req: Request, res: Response, next: NextFunction) {
            res.data.after = ['after first']
            next()
          }
        ],
        function (_req: Request, res: Response, next: NextFunction) {
          res.data.after.push('after second')
          next()
        }
      )

      const server = await app.listen(4776)
      const res = await axios.post<any>('http://localhost:4776/todo', {
        text: 'Do dishes'
      })

      assert.deepStrictEqual(res.data, {
        text: 'Do dishes',
        before: ['before first', 'before second'],
        after: ['after first', 'after second']
      })
      server.close()
    })

    it('allows an array of middleware without a service', async () => {
      const app = expressify(feathers())
      const middlewareArray = [
        function (_req: Request, res: Response, next: NextFunction) {
          res.data = ['first']
          next()
        },
        function (_req: Request, res: Response, next: NextFunction) {
          res.data.push('second')
          next()
        },
        function (req: Request, res: Response) {
          res.data.push(req.body.text)
          res.status(200).json(res.data)
        }
      ]
      app.use(express.json()).configure(rest()).use('/array-middleware', middlewareArray)

      const server = await app.listen(4776)
      const res = await axios.post<any>('http://localhost:4776/array-middleware', {
        text: 'Do dishes'
      })

      assert.deepStrictEqual(res.data, ['first', 'second', 'Do dishes'])
      server.close()
    })

    it('formatter does nothing when there is no res.data', async () => {
      const data = { message: 'It worked' }
      const app = expressify(feathers()).use('/test', express.formatter, (_req: Request, res: Response) =>
        res.json(data)
      )

      const server = await app.listen(7988)
      const res = await axios.get<any>('http://localhost:7988/test')

      assert.deepStrictEqual(res.data, data)
      server.close()
    })
  })

  describe('HTTP status codes', () => {
    let app: express.Application
    let server: Server

    before(async () => {
      app = expressify(feathers())
        .configure(rest(express.formatter))
        .use('todo', {
          async get(id: Id) {
            return {
              description: `You have to do ${id}`
            }
          },

          async patch() {
            throw new Error('Not implemented')
          },

          async find() {
            return null
          }
        })

      app.use(function (_req, res, next) {
        if (typeof res.data !== 'undefined') {
          next(new Error('Should never get here'))
        } else {
          next()
        }
      })

      // Error handler
      app.use(function (error: Error, _req: Request, res: Response, _next: NextFunction) {
        if (res.statusCode < 400) {
          res.status(500)
        }

        res.json({ message: error.message })
      })

      server = await app.listen(4780)
    })

    after((done) => server.close(done))

    it('throws a 405 for undefined service methods (#99)', async () => {
      const res = await axios.get<any>('http://localhost:4780/todo/dishes')

      assert.ok(res.status === 200, 'Got OK status code for .get')
      assert.deepStrictEqual(
        res.data,
        {
          description: 'You have to do dishes'
        },
        'Got expected object'
      )

      try {
        await axios.post<any>('http://localhost:4780/todo')
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.ok(error.response.status === 405, 'Got 405 for .create')
        assert.deepStrictEqual(
          error.response.data,
          {
            message: 'Method `create` is not supported by this endpoint.'
          },
          'Error serialized as expected'
        )
      }
    })

    it('throws a 404 for undefined route', async () => {
      try {
        await axios.get<any>('http://localhost:4780/todo/foo/bar')
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.ok(error.response.status === 404, 'Got Not Found code')
      }
    })

    it('empty response sets 204 status codes, does not run other middleware (#391)', async () => {
      const res = await axios.get<any>('http://localhost:4780/todo')

      assert.ok(res.status === 204, 'Got empty status code')
    })
  })

  describe('route parameters', () => {
    let server: Server
    let app: express.Application

    before(async () => {
      app = expressify(feathers())
        .configure(rest())
        .use('/:appId/:id/todo', {
          async get(id: Id, params: Params) {
            if (params.query.error) {
              throw new BadRequest('Not good')
            }

            return {
              id,
              route: params.route
            }
          }
        })
        .use(errorHandler)

      server = await app.listen(6880)
    })

    after((done) => server.close(done))

    it('adds route params as `params.route` and allows id property (#76, #407)', async () => {
      const expected = {
        id: 'dishes',
        route: {
          appId: 'theApp',
          id: 'myId'
        }
      }

      const res = await axios.get<any>(`http://localhost:6880/theApp/myId/todo/${expected.id}`)

      assert.ok(res.status === 200, 'Got OK status code')
      assert.deepStrictEqual(expected, res.data)
    })

    it('properly serializes error for nested routes (#1096)', async () => {
      try {
        await axios.get<any>('http://localhost:6880/theApp/myId/todo/test?error=true')
        assert.fail('Should never het here')
      } catch (error: any) {
        const { response } = error

        assert.strictEqual(response.status, 400)
        assert.deepStrictEqual(response.data, {
          name: 'BadRequest',
          message: 'Not good',
          code: 400,
          className: 'bad-request'
        })
      }
    })
  })

  describe('Custom methods', () => {
    let server: Server
    let app: express.Application

    before(async () => {
      app = expressify(feathers())
        .use(express.json())
        .configure(rest())
        .use('/todo', new Service(), {
          methods: ['find', 'customMethod']
        })
        .use(errorHandler)

      server = await app.listen(4781)
    })

    after((done) => server.close(done))

    it('calls .customMethod with X-Service-Method header', async () => {
      const payload = { text: 'Do dishes' }
      const res = await axios.post<any>('http://localhost:4781/todo', payload, {
        headers: {
          'X-Service-Method': 'customMethod'
        }
      })

      assert.deepEqual(res.data, {
        data: payload,
        method: 'customMethod',
        provider: 'rest'
      })
    })

    it('throws MethodNotImplement for .setup, non option and default methods', async () => {
      const options: AxiosRequestConfig = {
        method: 'POST',
        url: 'http://localhost:4781/todo',
        data: { text: 'Do dishes' }
      }
      const testMethod = (name: string) => {
        return assert.rejects(
          () =>
            axios({
              ...options,
              headers: {
                'X-Service-Method': name
              }
            }),
          (error: any) => {
            assert.deepEqual(error.response.data, {
              name: 'MethodNotAllowed',
              message: `Method \`${name}\` is not supported by this endpoint.`,
              code: 405,
              className: 'method-not-allowed'
            })

            return true
          }
        )
      }

      await testMethod('setup')
      await testMethod('internalMethod')
      await testMethod('nonExisting')
      await testMethod('create')
      await testMethod('find')
    })
  })
})
