/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { strict as assert } from 'assert'
import express, { Request, Response, NextFunction, Application } from 'express'
import axios from 'axios'
import fs from 'fs'
import { join } from 'path'
import { BadRequest, NotAcceptable, NotAuthenticated, NotFound, PaymentError } from '@feathersjs/errors'
import getPort from 'get-port'

import { errorHandler } from '../src'
import { Server } from 'http'

const content = '<html><head></head><body>Error</body></html>'

const htmlHandler = function (_error: Error, _req: Request, res: Response, _next: NextFunction) {
  res.send(content)
}

const jsonHandler = function (error: Error, _req: Request, res: Response, _next: NextFunction) {
  res.json(error)
}

describe('error-handler', () => {
  describe('supports catch-all custom handlers', async () => {
    let app: Application
    let server: Server
    const port = await getPort()

    beforeAll(() => {
      app = express()
        .get('/error', function (_req: Request, _res: Response, next: NextFunction) {
          next(new Error('Something went wrong'))
        })
        .use(
          errorHandler({
            html: htmlHandler,
            json: jsonHandler
          })
        )

      server = app.listen(port)
    })

    afterAll(
      () =>
        new Promise<void>((resolve) => {
          server.close(() => resolve())
        })
    )

    describe('JSON handler', () => {
      it('can send a custom response', async () => {
        const options = {
          url: `http://localhost:${port}/error`,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }

        try {
          await axios(options)
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error'
          })
        }
      })
    })
  })

  describe('supports error-code specific custom handlers', () => {
    describe('HTML handler', () => {
      const req = {
        headers: { 'content-type': 'text/html' }
      }
      const makeRes = (errCode: number, props?: any) => {
        return Object.assign(
          {
            set() {},
            status(code: number) {
              assert.equal(code, errCode)
            }
          },
          props
        )
      }

      it('if the value is a string, calls res.sendFile', () =>
        new Promise<void>((resolve) => {
          const err = new NotAuthenticated()
          const middleware = errorHandler({
            logger: null,
            html: { 401: 'path/to/401.html' }
          })
          const res = makeRes(401, {
            sendFile(f: any) {
              assert.equal(f, 'path/to/401.html')
              resolve()
            }
          })
          ;(middleware as any)(err, req, res)
        }))

      it('if the value is a function, calls as middleware ', () =>
        new Promise<void>((resolve) => {
          const err = new PaymentError()
          const res = makeRes(402)
          const middleware = errorHandler({
            logger: null,
            html: {
              402: (_err: any, _req: any, _res: any) => {
                assert.equal(_err, err)
                assert.equal(_req, req)
                assert.equal(_res, res)
                resolve()
              }
            }
          })
          ;(middleware as any)(err, req, res)
        }))

      it('falls back to default if error code config is available', () =>
        new Promise<void>((resolve) => {
          const err = new NotAcceptable()
          const res = makeRes(406)
          const middleware = errorHandler({
            logger: null,
            html: {
              default: (_err: any, _req: any, _res: any) => {
                assert.equal(_err, err)
                assert.equal(_req, req)
                assert.equal(_res, res)
                resolve()
              }
            }
          })
          ;(middleware as any)(err, req, res)
        }))
    })

    describe('JSON handler', () => {
      const req = {
        headers: { 'content-type': 'application/json' }
      }
      const makeRes = (errCode: number, props?: any) => {
        return Object.assign(
          {
            set() {},
            status(code: number) {
              assert.equal(code, errCode)
            }
          },
          props
        )
      }

      it('calls res.json by default', () =>
        new Promise<void>((resolve) => {
          const err = new NotAuthenticated()
          const middleware = errorHandler({
            logger: null,
            json: {}
          })
          const res = makeRes(401, {
            json(obj: any) {
              assert.deepEqual(obj, err.toJSON())
              resolve()
            }
          })
          ;(middleware as any)(err, req, res)
        }))

      it('if the value is a function, calls as middleware ', () =>
        new Promise<void>((resolve) => {
          const err = new PaymentError()
          const res = makeRes(402)
          const middleware = errorHandler({
            logger: null,
            json: {
              402: (_err: any, _req: any, _res: any) => {
                assert.equal(_err, err)
                assert.equal(_req, req)
                assert.equal(_res, res)
                resolve()
              }
            }
          })
          ;(middleware as any)(err, req, res)
        }))

      it('falls back to default if error code config is available', () =>
        new Promise<void>((resolve) => {
          const err = new NotAcceptable()
          const res = makeRes(406)
          const middleware = errorHandler({
            logger: null,
            json: {
              default: (_err: any, _req: any, _res: any) => {
                assert.equal(_err, err)
                assert.equal(_req, req)
                assert.equal(_res, res)
                resolve()
              }
            }
          })
          ;(middleware as any)(err, req, res)
        }))
    })
  })

  describe('use as app error handler', async () => {
    let app: Application
    let server: Server
    const port = await getPort()

    beforeAll(async () => {
      app = express()
        .get('/error', function (_req: Request, _res: Response, next: NextFunction) {
          next(new Error('Something went wrong'))
        })
        .get('/string-error', function (_req: Request, _res: Response, next: NextFunction) {
          const e: any = new Error('Something was not found')
          e.code = '404'

          next(e)
        })
        .get('/bad-request', function (_req: Request, _res: Response, next: NextFunction) {
          next(
            new BadRequest({
              message: 'Invalid Password',
              errors: [
                {
                  path: 'password',
                  value: null,
                  message: "'password' cannot be 'null'"
                }
              ]
            })
          )
        })
        .use(function (_req: Request, _res: Response, next: NextFunction) {
          next(new NotFound('File not found'))
        })
        .use(
          errorHandler({
            logger: null
          })
        )

      server = app.listen(port)
    })

    afterAll(
      () =>
        new Promise<void>((resolve) => {
          server.close(() => resolve())
        })
    )

    describe('converts an non-feathers error', () => {
      it('is an instance of GeneralError', async () => {
        try {
          await axios({
            url: `http://localhost:${port}/error`,
            responseType: 'json'
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.equal(error.response.status, 500)
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error'
          })
        }
      })
    })

    describe('text/html format', () => {
      it('serves a 404.html', () =>
        new Promise<void>((resolve) => {
          fs.readFile(join(__dirname, '..', 'public', '404.html'), async function (_err, html) {
            try {
              await axios({
                url: `http://localhost:${port}/path/to/nowhere`,
                headers: {
                  'Content-Type': 'text/html',
                  Accept: 'text/html'
                }
              })
              assert.fail('Should never get here')
            } catch (error: any) {
              assert.equal(error.response.status, 404)
              assert.equal(error.response.data, html.toString())
              resolve()
            }
          })
        }))

      it('serves a 500.html', () =>
        new Promise<void>((resolve) => {
          fs.readFile(join(__dirname, '..', 'public', 'default.html'), async function (_err, html) {
            try {
              await axios({
                url: `http://localhost:${port}/error`,
                headers: {
                  'Content-Type': 'text/html',
                  Accept: 'text/html'
                }
              })
              assert.fail('Should never get here')
            } catch (error: any) {
              assert.equal(error.response.status, 500)
              assert.equal(error.response.data, html.toString())
              resolve()
            }
          })
        }))
    })

    describe('application/json format', () => {
      it('500', async () => {
        try {
          await axios({
            url: `http://localhost:${port}/error`,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.equal(error.response.status, 500)
          assert.deepEqual(error.response.data, {
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error'
          })
        }
      })

      it('404', async () => {
        try {
          await axios({
            url: `http://localhost:${port}/path/to/nowhere`,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.equal(error.response.status, 404)
          assert.deepEqual(error.response.data, {
            name: 'NotFound',
            message: 'File not found',
            code: 404,
            className: 'not-found'
          })
        }
      })

      it('400', async () => {
        try {
          await axios({
            url: `http://localhost:${port}/bad-request`,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            }
          })
          assert.fail('Should never get here')
        } catch (error: any) {
          assert.equal(error.response.status, 400)
          assert.deepEqual(error.response.data, {
            name: 'BadRequest',
            message: 'Invalid Password',
            code: 400,
            className: 'bad-request',
            data: {},
            errors: [
              {
                path: 'password',
                value: null,
                message: "'password' cannot be 'null'"
              }
            ]
          })
        }
      })
    })

    it('returns JSON by default', async () => {
      try {
        await axios(`http://localhost:${port}/bad-request`)
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.equal(error.response.status, 400)
        assert.deepEqual(error.response.data, {
          name: 'BadRequest',
          message: 'Invalid Password',
          code: 400,
          className: 'bad-request',
          data: {},
          errors: [
            {
              path: 'password',
              value: null,
              message: "'password' cannot be 'null'"
            }
          ]
        })
      }
    })
  })
})
