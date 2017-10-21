const assert = require('assert');

const express = require('express');
const feathers = require('@feathersjs/feathers');
const axios = require('axios');

const expressify = require('../lib');

describe('@feathersjs/express', () => {
  const service = {
    get (id) {
      return Promise.resolve({ id });
    }
  };

  it('returns an Express application', () => {
    const app = expressify(feathers());

    assert.equal(typeof app, 'function');
  });

  it('errors when not app is provided', () => {
    try {
      expressify();
    } catch (e) {
      assert.equal(e.message, '@feathersjs/express requires a valid Feathers application instance');
    }

    try {
      const app = feathers();
      app.version = '2.9.9';

      expressify(app);
    } catch (e) {
      assert.equal(e.message, '@feathersjs/express requires an instance of a Feathers application version 3.x or later (got 2.9.9)');
    }

    try {
      const app = feathers();
      delete app.version;

      expressify(app);
    } catch (e) {
      assert.equal(e.message, '@feathersjs/express requires an instance of a Feathers application version 3.x or later (got unknown)');
    }
  });

  it('Can use Express sub-apps', () => {
    const app = expressify(feathers());
    const child = express();

    app.use('/path', child);
    assert.equal(child.parent, app);
  });

  it('Can use express.static', () => {
    const app = expressify(feathers());

    app.use('/path', expressify.static(__dirname));
  });

  it('has Feathers functionality', () => {
    const app = expressify(feathers());

    app.use('/myservice', service);

    app.hooks({
      after: {
        get (hook) {
          hook.result.fromAppHook = true;
        }
      }
    });

    app.service('myservice').hooks({
      after: {
        get (hook) {
          hook.result.fromHook = true;
        }
      }
    });

    return app.service('myservice').get(10)
      .then(data => assert.deepEqual(data, {
        id: 10,
        fromHook: true,
        fromAppHook: true
      }));
  });

  it('can register a service and start an Express server', done => {
    const app = expressify(feathers());
    const response = {
      message: 'Hello world'
    };

    app.use('/myservice', service);
    app.use((req, res) => res.json(response));

    const server = app.listen(8787).on('listening', () => {
      app.service('myservice').get(10)
        .then(data => assert.deepEqual(data, { id: 10 }))
        .then(() => axios.get('http://localhost:8787'))
        .then(res => assert.deepEqual(res.data, response))
        .then(() => server.close(() => done()))
        .catch(done);
    });
  });

  it('.listen calls .setup', done => {
    const app = expressify(feathers());
    let called = false;

    app.use('/myservice', {
      get (id) {
        return Promise.resolve({ id });
      },

      setup (appParam, path) {
        try {
          assert.equal(appParam, app);
          assert.equal(path, 'myservice');
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
    const app = expressify(feathersApp);
    const oldUse = feathersApp.use;
    const a = (req, res, next) => next();
    const b = (req, res, next) => next();
    const c = (req, res, next) => next();
    const service = {
      get (id) {
        return Promise.resolve({ id });
      }
    };

    feathersApp.use = function (path, serviceArg, options) {
      assert.equal(path, '/myservice');
      assert.equal(serviceArg, service);
      assert.deepEqual(options.middleware, {
        before: [a, b],
        after: [c]
      });
      return oldUse.apply(this, arguments);
    };

    app.use('/myservice', a, b, service, c);
  });

  it('throws an error for invalid middleware options', () => {
    const feathersApp = feathers();
    const app = expressify(feathersApp);
    const service = {
      get (id) {
        return Promise.resolve({ id });
      }
    };

    try {
      app.use('/myservice', service, 'hi');
    } catch (e) {
      assert.equal(e.message, 'Invalid options passed to app.use');
    }
  });
});
