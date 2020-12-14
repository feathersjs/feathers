import { strict as assert } from 'assert';
import axios from 'axios';

import { Server } from 'http';
import feathers, { HookContext, Id, Params } from '@feathersjs/feathers';
// import { BadRequest } from '@feathersjs/errors';
import { Service } from '@feathersjs/tests/src/fixture';
import { crud } from '@feathersjs/tests/src/crud';

import * as express from '../src'
import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '@feathersjs/errors/lib';

const expressify = express.default;
const { rest } = express;

describe('@feathersjs/express/rest provider', () => {
  describe('base functionality', () => {
    it('throws an error if you did not expressify', () => {
      const app = feathers();

      try {
        app.configure(rest());
        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.strictEqual(e.message, '@feathersjs/express/rest needs an Express compatible app. Feathers apps have to wrapped with feathers-express first.');
      }
    });

    it('throws an error for incompatible Feathers version', () => {
      try {
        const app = expressify(feathers());

        app.version = '2.9.9';
        app.configure(rest());

        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.strictEqual(e.message, '@feathersjs/express/rest requires an instance of a Feathers application version 3.x or later (got 2.9.9)');
      }
    });

    it('lets you set the handler manually', async () => {
      const app = expressify(feathers());

      app.configure(rest(function (_req, res) {
        res.format({
          'text/plain' () {
            res.end(`The todo is: ${res.data.description}`);
          }
        });
      })).use('/todo', {
        get (id) {
          return Promise.resolve({
            description: `You have to do ${id}`
          });
        }
      });

      const server = app.listen(4776);

      const res = await axios.get('http://localhost:4776/todo/dishes');

      assert.strictEqual(res.data, 'The todo is: You have to do dishes');
      server.close();
    });

    it('lets you set no handler', async () => {
      const app = expressify(feathers());
      const data = { fromHandler: true };

      app.configure(rest(null))
        .use('/todo', {
          get (id) {
            return Promise.resolve({
              description: `You have to do ${id}`
            });
          }
        })
        .use((_req, res) => res.json(data));

      const server = app.listen(5775);

      const res = await axios.get('http://localhost:5775/todo-handler/dishes')

      assert.deepStrictEqual(res.data, data);

      server.close();
    });
  });

  describe('CRUD', () => {
    let server: Server;
    let app: express.Application;

    before(function () {
      app = expressify(feathers())
        .configure(rest(rest.formatter))
        .use(express.json())
        .use('codes', {
          async get (id) {
            return { id };
          },

          async create (data) {
            return data;
          }
        })
        .use('/', Service)
        .use('todo', Service);

      server = app.listen(4777, () => app.use('tasks', Service));
    });

    after(done => server.close(done));

    crud('Services', 'todo', 4777);
    crud('Root Service', '/', 4777);
    crud('Dynamic Services', 'tasks', 4777);

    describe('res.hook', () => {
      const convertHook = (hook: HookContext) => {
        const result: any = Object.assign({}, hook);

        delete result.self;
        delete result.service;
        delete result.app;
        delete result.error;

        return result;
      };

      it('sets the actual hook object in res.hook', async () => {
        const params = {
          route: {},
          query: { test: 'param' },
          provider: 'rest'
        };

        app.use('/hook', {
          async get (id) {
            return {
              description: `You have to do ${id}`
            };
          }
        }, function (_req, res, next) {
          res.data = convertHook(res.hook);

          next();
        });

        app.service('hook').hooks({
          after (hook: HookContext) {
            (hook as any).addedProperty = true;
          }
        });

        const res = await axios.get('http://localhost:4777/hook/dishes?test=param');
        const paramsWithHeaders = {
          ...params,
          headers: res.data.params.headers
        };

        assert.deepStrictEqual(res.data, {
          id: 'dishes',
          params: paramsWithHeaders,
          arguments: [
            'dishes', paramsWithHeaders
          ],
          type: 'after',
          method: 'get',
          path: 'hook',
          result: { description: 'You have to do dishes' },
          addedProperty: true
        });
      });

      it('can use hook.dispatch', async () => {
        app.use('/hook-dispatch', {
          async get () {
            return {};
          }
        });

        app.service('hook-dispatch').hooks({
          after (hook: HookContext) {
            hook.dispatch = {
              id: hook.id,
              fromDispatch: true
            };
          }
        });

        const res = await axios.get('http://localhost:4777/hook-dispatch/dishes');
        assert.deepStrictEqual(res.data, {
          id: 'dishes',
          fromDispatch: true
        });
      });

      it('allows to set statusCode in a hook', async () => {
        app.use('/hook-status', {
          async get () {
            return {};
          }
        });

        app.service('hook-status').hooks({
          after (hook: HookContext) {
            hook.statusCode = 206;
          }
        });

        const res = await axios.get('http://localhost:4777/hook-status/dishes');

        assert.strictEqual(res.status, 206);
      });

      it('sets the hook object in res.hook on error', async () => {
        const params = {
          route: {},
          query: {},
          provider: 'rest'
        };

        app.use('/hook-error', {
          async get () {
            throw new Error('I blew up');
          }
        }, function (error: Error, _req: Request, res: Response, _next: NextFunction) {
          res.status(500);
          res.json({
            hook: convertHook(res.hook),
            error: {
              message: error.message
            }
          });
        });

        try {
          await axios('http://localhost:4777/hook-error/dishes');
          assert.fail('Should never get here');
        } catch (error) {
          const { data } = error.response;
          const paramsWithHeaders = {
            ...params,
            headers: data.hook.params.headers
          };
          assert.deepStrictEqual(error.response.data, {
            hook: {
              id: 'dishes',
              params: paramsWithHeaders,
              arguments: ['dishes', paramsWithHeaders ],
              type: 'error',
              method: 'get',
              path: 'hook-error',
              original: data.hook.original
            },
            error: { message: 'I blew up' }
          });
        }
      });
    });
  });

  describe('middleware', () => {
    it('sets service parameters and provider type', async () => {
      const service = {
        async get (_id: Id, params: Params) {
          return params;
        }
      };

      const server = expressify(feathers())
        .configure(rest(rest.formatter))
        .use(function (req, _res, next) {
          assert.ok(req.feathers, 'Feathers object initialized');
          req.feathers.test = 'Happy';
          next();
        })
        .use('service', service)
        .listen(4778);

      const res = await axios.get('http://localhost:4778/service/bla?some=param&another=thing');
      const expected = {
        headers: res.data.headers,
        test: 'Happy',
        provider: 'rest',
        route: {},
        query: {
          some: 'param',
          another: 'thing'
        }
      };

      assert.ok(res.status === 200, 'Got OK status code');
      assert.deepStrictEqual(res.data, expected, 'Got params object back');
      server.close();
    });

    it('Lets you configure your own middleware before the handler (#40)', async () => {
      const data = {
        description: 'Do dishes!',
        id: 'dishes'
      };
      const app = expressify(feathers());

      app.use(function defaultContentTypeMiddleware (req, _res, next) {
        req.headers['content-type'] = req.headers['content-type'] || 'application/json';
        next();
      })
        .configure(rest(rest.formatter))
        .use(express.json())
        .use('/todo', {
          create (data) {
            return Promise.resolve(data);
          }
        });

      const server = app.listen(4775);

      const res = await axios({
        url: 'http://localhost:4775/todo',
        method: 'post',
        data,
        headers: {
          'content-type': ''
        }
      });

      assert.deepStrictEqual(res.data, data);
      server.close();
    });

    it('allows middleware before and after a service', async () => {
      const app = expressify(feathers());

      app.configure(rest())
        .use(express.json())
        .use('/todo', function (req, _res, next) {
          req.body.before = ['before first'];
          next();
        }, function (req, _res, next) {
          req.body.before.push('before second');
          next();
        }, {
            create (data) {
              return Promise.resolve(data);
            }
          }, function (_req, res, next) {
            res.data.after = ['after first'];
            next();
          }, function (_req, res, next) {
            res.data.after.push('after second');
            next();
          });

      const server = app.listen(4776);
      const res = await axios.post('http://localhost:4776/todo', { text: 'Do dishes' });

      assert.deepStrictEqual(res.data, {
        text: 'Do dishes',
        before: ['before first', 'before second'],
        after: ['after first', 'after second']
      });

      server.close();
    });

    it('allows middleware arrays before and after a service', async () => {
      const app = expressify(feathers());

      app.configure(rest())
        .use(express.json())
        .use('/todo', [function (req: Request, _res: Response, next: NextFunction) {
          req.body.before = ['before first'];
          next();
        }, function (req: Request, _res: Response, next: NextFunction) {
          req.body.before.push('before second');
          next();
        }], {
          async create (data) {
            return data;
          }
        }, [function (_req: Request, res: Response, next: NextFunction) {
          res.data.after = ['after first'];
          next();
        }], function (_req: Request, res: Response, next: NextFunction) {
          res.data.after.push('after second');
          next();
        });

      const server = app.listen(4776);
      const res = await axios.post('http://localhost:4776/todo', { text: 'Do dishes' });

      assert.deepStrictEqual(res.data, {
        text: 'Do dishes',
        before: ['before first', 'before second'],
        after: ['after first', 'after second']
      });
      server.close();
    });

    it('allows an array of middleware without a service', async () => {
      const app = expressify(feathers());
      const middlewareArray = [
        function (_req: Request, res: Response, next: NextFunction) {
          res.data = ['first'];
          next();
        }, function (_req: Request, res: Response, next: NextFunction) {
          res.data.push('second');
          next();
        }, function (req: Request, res: Response) {
          res.data.push(req.body.text);
          res.status(200).json(res.data);
        }];
      app.configure(rest())
        .use(express.json())
        .use('/array-middleware', middlewareArray);

      const server = app.listen(4776);
      const res = await axios.post('http://localhost:4776/array-middleware', { text: 'Do dishes' });

      assert.deepStrictEqual(res.data, ['first', 'second', 'Do dishes']);
      server.close();
    });

    it('formatter does nothing when there is no res.data', async () => {
      const data = { message: 'It worked' };
      const app = expressify(feathers()).use('/test',
        rest.formatter,
        (_req, res) => res.json(data)
      );

      const server = app.listen(7988);
      const res = await axios.get('http://localhost:7988/test');

      assert.deepStrictEqual(res.data, data);
      server.close();
    });
  });

  describe('HTTP status codes', () => {
    let app: express.Application;
    let server: Server;

    before(function () {
      app = expressify(feathers())
        .configure(rest(rest.formatter))
        .use('todo', {
          async get (id: Id) {
            return {
              description: `You have to do ${id}`
            };
          },

          async patch () {
            throw new Error('Not implemented');
          },

          async find () {
            return null;
          }
        });

      app.use(function (_req, res, next) {
        if (typeof res.data !== 'undefined') {
          next(new Error('Should never get here'));
        } else {
          next();
        }
      });

      // Error handler
      app.use(function (error: Error, _req: Request, res: Response, _next: NextFunction) {
        if (res.statusCode < 400) {
          res.status(500);
        }

        res.json({ message: error.message });
      });

      server = app.listen(4780);
    });

    after(done => server.close(done));

    it('throws a 405 for undefined service methods and sets Allow header (#99)', async () => {
      const res = await axios.get('http://localhost:4780/todo/dishes');

      assert.ok(res.status === 200, 'Got OK status code for .get');
      assert.deepStrictEqual(res.data, {
        description: 'You have to do dishes'
      }, 'Got expected object');

      try {
        await axios.post('http://localhost:4780/todo');
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.response.headers.allow, 'GET,PATCH');
        assert.ok(error.response.status === 405, 'Got 405 for .create');
        assert.deepStrictEqual(error.response.data, {
          message: 'Method `create` is not supported by this endpoint.'
        }, 'Error serialized as expected');
      }
    });

    it('throws a 404 for undefined route', async () => {
      try {
        await axios.get('http://localhost:4780/todo/foo/bar');
        assert.fail('Should never get here');
      } catch (error) {
        assert.ok(error.response.status === 404, 'Got Not Found code');
      }
    });

    it('empty response sets 204 status codes, does not run other middleware (#391)', async () => {
      const res = await axios.get('http://localhost:4780/todo');

      assert.ok(res.status === 204, 'Got empty status code');
    });
  });

  describe('route parameters', () => {
    let server: Server;
    let app: express.Application;

    before(() => {
      app = expressify(feathers())
        .configure(rest())
        .use('/:appId/:id/todo', {
          async get (id: Id, params: Params) {
            if (params.query.error) {
              throw new BadRequest('Not good');
            }

            return {
              id,
              route: params.route
            };
          }
        })
        .use(express.errorHandler());

      server = app.listen(6880);
    });

    after(done => server.close(done));

    it('adds route params as `params.route` and allows id property (#76, #407)', async () => {
      const expected = {
        id: 'dishes',
        route: {
          appId: 'theApp',
          id: 'myId'
        }
      };

      const res = await axios.get(`http://localhost:6880/theApp/myId/todo/${expected.id}`);

      assert.ok(res.status === 200, 'Got OK status code');
      assert.deepStrictEqual(expected, res.data);
    });

    it('properly serializes error for nested routes (#1096)', async () => {
      try {
        await axios.get(`http://localhost:6880/theApp/myId/todo/test?error=true`);
        assert.fail('Should never het here');
      } catch (error) {
        const { response } = error;

        assert.strictEqual(response.status, 400);
        assert.deepStrictEqual(response.data, {
          name: 'BadRequest',
          message: 'Not good',
          code: 400,
          className: 'bad-request'
        });
      }
    });
  });

  describe('Custom methods', () => {
    let server: Server;
    let app: express.Application;

    before(() => {
      app = expressify(feathers())
        .configure(rest())
        .use(express.json())
        .use('/todo', {
          async get (id) {
            return id;
          },
          // httpMethod is usable as a decorator: @httpMethod('POST', '/:__feathersId/custom-path')
          custom: rest.httpMethod('POST')((feathers as any).activateHooks(['id', 'data', 'params'])(
            (id: any, data: any) => {
              return Promise.resolve({
                id,
                data
              });
            }
          )),
          other: rest.httpMethod('PATCH', ':__feathersId/second-method')(
            (feathers as any).activateHooks(['id', 'data', 'params'])(
              (id: any, data: any) => {
                return Promise.resolve({
                  id,
                  data
                });
              }
            )
          )
        });

      server = app.listen(4781);
    });

    after(done => server.close(done));

    it('works with custom methods', async () => {
      const res = await axios.post('http://localhost:4781/todo/42/custom', { text: 'Do dishes' });

      assert.equal(res.headers.allow, 'GET,POST,PATCH');
      assert.deepEqual(res.data, {
        id: '42',
        data: { text: 'Do dishes' }
      });
    });

    it('works with custom methods - with route', async () => {
      const res = await axios.patch('http://localhost:4781/todo/12/second-method', { text: 'Hmm' });

      assert.equal(res.headers.allow, 'GET,POST,PATCH');
      assert.deepEqual(res.data, {
        id: '12',
        data: { text: 'Hmm' }
      });
    });
  });
});
