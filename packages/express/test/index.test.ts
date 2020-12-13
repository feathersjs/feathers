import { strict as assert } from 'assert';
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import feathers, { HookContext, Id } from '@feathersjs/feathers';

import * as expressify from '../src';

describe('@feathersjs/express', () => {
  const service = {
    async get (id: Id) {
      return { id };
    }
  };

  it('exports .default, .original .rest, .notFound and .errorHandler', () => {
    assert.strictEqual(expressify.original, express);
    assert.strictEqual(typeof expressify.rest, 'function');
    assert.ok(expressify.notFound);
    assert.ok(expressify.errorHandler);
  });

  it('returns an Express application', () => {
    const app = expressify.default(feathers());

    assert.strictEqual(typeof app, 'function');
  });

  it('allows to use an existing Express instance', () => {
    const expressApp = express();
    const app = expressify.default(feathers(), expressApp);

    assert.strictEqual(app, expressApp);
  });

  it('exports `express.rest`', () => {
    assert.ok(typeof expressify.rest === 'function');
  });

  it('returns a plain express app when no app is provided', () => {
    const app = expressify.default();

    assert.strictEqual(typeof app.use, 'function');
    assert.strictEqual(typeof app.service, 'undefined');
    assert.strictEqual(typeof app.services, 'undefined');
  });

  it('errors when app with wrong version is provided', () => {
    try {
      // @ts-ignore
      expressify.default({});
    } catch (e) {
      assert.strictEqual(e.message, '@feathersjs/express requires a valid Feathers application instance');
    }

    try {
      const app = feathers();
      app.version = '2.9.9';

      expressify.default(app);
    } catch (e) {
      assert.strictEqual(e.message, '@feathersjs/express requires an instance of a Feathers application version 3.x or later (got 2.9.9)');
    }

    try {
      const app = feathers();
      delete app.version;

      expressify.default(app);
    } catch (e) {
      assert.strictEqual(e.message, '@feathersjs/express requires an instance of a Feathers application version 3.x or later (got unknown)');
    }
  });

  it('Can use Express sub-apps', () => {
    const app = expressify.default(feathers());
    const child = express();

    app.use('/path', child);
    assert.strictEqual((child as any).parent, app);
  });

  it('Can use express.static', () => {
    const app = expressify.default(feathers());

    app.use('/path', expressify.static(__dirname));
  });

  it('has Feathers functionality', async () => {
    const app = expressify.default(feathers());

    app.use('/myservice', service);

    app.hooks({
      after: {
        get (hook: HookContext) {
          hook.result.fromAppHook = true;
        }
      }
    });

    app.service('myservice').hooks({
      after: {
        get (hook: HookContext) {
          hook.result.fromHook = true;
        }
      }
    });

    const data = await app.service('myservice').get(10);

    assert.deepStrictEqual(data, {
      id: 10,
      fromHook: true,
      fromAppHook: true
    });
  });

  it('can register a service and start an Express server', done => {
    const app = expressify.default(feathers());
    const response = {
      message: 'Hello world'
    };

    app.use('/myservice', service);
    app.use((_req, res) => res.json(response));

    const server = app.listen(8787).on('listening', async () => {
      try {
        const data = await app.service('myservice').get(10);
        assert.deepStrictEqual(data, { id: 10 });

        const res = await await axios.get('http://localhost:8787');
        assert.deepStrictEqual(res.data, response);

        server.close(() => done());
      } catch (error) {
        done(error);
      }
    });
  });

  it('.listen calls .setup', done => {
    const app = expressify.default(feathers());
    let called = false;

    app.use('/myservice', {
      async get (id) {
        return { id };
      },

      setup (appParam, path) {
        try {
          assert.strictEqual(appParam, app);
          assert.strictEqual(path, 'myservice');
          called = true;
        } catch (e) {
          done(e);
        }
      }
    });

    const server = app.listen(8787).on('listening', () => {
      try {
        assert.ok(called);
        server.close(() => done());
      } catch (e) {
        done(e);
      }
    });
  });

  it('passes middleware as options', () => {
    const feathersApp = feathers();
    const app = expressify.default(feathersApp);
    const oldUse = feathersApp.use;
    const a = (_req: Request, _res: Response, next: NextFunction) => next();
    const b = (_req: Request, _res: Response, next: NextFunction) => next();
    const c = (_req: Request, _res: Response, next: NextFunction) => next();
    const service = {
      async get (id: Id) {
        return { id };
      }
    };

    feathersApp.use = function (path, serviceArg, options) {
      assert.strictEqual(path, '/myservice');
      assert.strictEqual(serviceArg, service);
      assert.deepStrictEqual(options.middleware, {
        before: [a, b],
        after: [c]
      });
      return (oldUse as any).apply(this, arguments);
    };

    app.use('/myservice', a, b, service, c);
  });

  it('throws an error for invalid middleware options', () => {
    const feathersApp = feathers();
    const app = expressify.default(feathersApp);
    const service = {
      async get (id: any) {
        return { id };
      }
    };

    try {
      app.use('/myservice', service, 'hi');
    } catch (e) {
      assert.strictEqual(e.message, 'Invalid options passed to app.use');
    }
  });

  it('Works with HTTPS', done => {
    const todoService = {
      async get (name: Id) {
        return {
          id: name,
          description: `You have to do ${name}!`
        };
      }
    };

    const app = expressify.default(feathers())
      .configure(expressify.rest())
      .use('/secureTodos', todoService);

    const httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, '..', '..', 'tests', 'resources', 'privatekey.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', '..', 'tests', 'resources', 'certificate.pem')),
      rejectUnauthorized: false,
      requestCert: false
    }, app).listen(7889);

    app.setup(httpsServer);

    httpsServer.on('listening', function () {
      const instance = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      instance.get('https://localhost:7889/secureTodos/dishes').then(response => {
        assert.ok(response.status === 200, 'Got OK status code');
        assert.strictEqual(response.data.description, 'You have to do dishes!');
        httpsServer.close(() => done());
      }).catch(done);
    });
  });
});
