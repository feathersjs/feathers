import assert from 'assert';
import path from 'path';
import fs from 'fs';
import Proto from 'uberproto';
import io from 'socket.io-client';
import request from 'request';
import https from 'https';
import rest from 'feathers-rest';
import socketio from 'feathers-socketio';
import feathers from '../src/';

describe('Feathers application', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib/feathers'), 'function');
  });

  it('Express application should use express apps.', () => {
    const app = feathers();
    const child = feathers();

    app.use('/path', child);
    assert.equal(child.parent, app);
  });

  it('Register services and look them up with and without leading and trailing slashes.', () => {
    const dummyService = {
      find() {
        // No need to implement this
      }
    };

    const app = feathers().use('/dummy/service/', dummyService);

    app.listen(8012, () => app.use('/another/dummy/service/', dummyService));

    assert.ok(typeof app.service('dummy/service').find === 'function', 'Could look up without slashes');
    assert.ok(typeof app.service('/dummy/service').find === 'function', 'Could look up with leading slash');
    assert.ok(typeof app.service('dummy/service/').find === 'function', 'Could look up with trailing slash');

    app.on('listening', function () {
      assert.ok(typeof app.service('another/dummy/service').find === 'function', 'Could look up without slashes');
      assert.ok(typeof app.service('/another/dummy/service').find === 'function', 'Could look up with leading slash');
      assert.ok(typeof app.service('another/dummy/service/').find === 'function', 'Could look up with trailing slash');
    });
  });

  it('uses .defaultService if available', done => {
    const app = feathers();

    assert.ok(!app.service('/todos/'));

    app.defaultService = function(path) {
      assert.equal(path, 'todos');
      return {
        get(id) {
          return Promise.resolve({
            id, description: `You have to do ${id}!`
          });
        }
      };
    };

    app.service('/todos/').get('dishes').then(data => {
      assert.deepEqual(data, {
        id: 'dishes',
        description: 'You have to do dishes!'
      });
      done();
    });
  });

  it('Registers a service, wraps it, runs service.setup(), and adds the event and Promise mixin', done => {
    const dummyService = {
      setup(app, path){
        this.path = path;
      },

      create(data) {
        return Promise.resolve(data);
      }
    };

    const app = feathers().use('/dummy', dummyService);
    const wrappedService = app.service('dummy');
    const server = app.listen(7887, function(){
      app.use('/dumdum', dummyService);
      const dynamicService = app.service('dumdum');

      assert.ok(wrappedService.path === 'dummy', 'Wrapped service setup method ran.');
      assert.ok(dynamicService.path === 'dumdum', 'Dynamic service setup method ran.');
    });

    assert.ok(Proto.isPrototypeOf(wrappedService), 'Service got wrapped as Uberproto object');
    assert.ok(typeof wrappedService.on === 'function', 'Wrapped service is an event emitter');

    wrappedService.on('created', function (data) {
      assert.equal(data.message, 'Test message', 'Got created event with test message');
      server.close(done);
    });

    wrappedService.create({
      message: 'Test message'
    }).then(data =>
      assert.equal(data.message, 'Test message', 'Got created event with test message'));
  });

  it('Initializes REST and SocketIO providers.', function (done) {
    const todoService = {
      get(name, params, callback) {
        callback(null, {
          id: name,
          description: `You have to do ${name}!`
        });
      }
    };

    const app = feathers()
      .configure(rest())
      .configure(socketio())
      .use('/todo', todoService);
    const server = app.listen(6999).on('listening', () => {
      const socket = io.connect('http://localhost:6999');

      request('http://localhost:6999/todo/dishes', (error, response, body) => {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        const data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        socket.emit('todo::get', 'laundry', {}, function (error, data) {
          assert.equal(data.description, 'You have to do laundry!');

          socket.disconnect();
          server.close(done);
        });
      });
    });
  });

  it('Uses custom middleware. (#21)', done => {
    const todoService = {
      get(name, params) {
        return Promise.resolve({
          id: name,
          description: `You have to do ${name}!`,
          preService: params.preService
        });
      }
    };

    const app = feathers()
      .configure(rest())
      .use('/todo', function (req, res, next) {
        req.feathers.preService = 'pre-service middleware';
        next();
      }, todoService, function (req, res, next) {
        res.set('post-service', res.data.id);
        next();
      })
      .use('/otherTodo', todoService);

    const server = app.listen(6995).on('listening', () => {
      request('http://localhost:6995/todo/dishes', (error, response, body) => {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        const data = JSON.parse(body);
        assert.equal(data.preService, 'pre-service middleware', 'Pre-service middleware updated response');
        assert.equal(response.headers['post-service'], 'dishes', 'Post-service middleware updated response');

        request('http://localhost:6995/otherTodo/dishes', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          const data = JSON.parse(body);
          assert.ok(!data.preService && !response.headers['post-service'], 'Custom middleware not run for different service.');
          server.close(done);
        });
      });
    });
  });

  it('REST and SocketIO with SSL server (#25)', done => {
    // For more info on Request HTTPS settings see https://github.com/mikeal/request/issues/418
    // This needs to be set so that the SocektIO client can connect
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const todoService = {
      get(name, params, callback) {
        callback(null, {
          id: name,
          description: `You have to do ${name}!`
        });
      }
    };

    const app = feathers()
      .configure(rest())
      .configure(socketio()).use('/secureTodos', todoService);

    const httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'resources', 'privatekey.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'resources', 'certificate.pem')),
      rejectUnauthorized: false,
      requestCert: false
    }, app).listen(7889);

    app.setup(httpsServer);

    httpsServer.on('listening', function () {
      const socket = io('https://localhost:7889', {
        secure: true,
        port: 7889,
        rejectUnauthorized: false
      });

      request({
        url: 'https://localhost:7889/secureTodos/dishes',
        strictSSL: false,
        rejectUnhauthorized: false
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        const data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        socket.emit('secureTodos::get', 'laundry', {}, function (error, data) {
          assert.equal(data.description, 'You have to do laundry!');

          socket.disconnect();
          httpsServer.close();
          done();
        });
      });
    });
  });

  it('Returns the value of a promise. (#41)', function (done) {
    let original = {};
    const todoService = {
      get(name) {
        original = {
          id: name,
          q: true,
          description: `You have to do ${name }!`
        };
        return Promise.resolve(original);
      }
    };

    const app = feathers()
      .configure(rest())
      .use('/todo', todoService);

    const server = app.listen(6880).on('listening', function () {
      request('http://localhost:6880/todo/dishes', (error, response, body) => {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        assert.deepEqual(original, JSON.parse(body));
        server.close(done);
      });
    });
  });

  it('Calls _setup in order to set up custom routes with higher priority. (#86)', done => {
    const todoService = {
      get(name) {
        return Promise.resolve({
          id: name,
          q: true,
          description: `You have to do ${name}!`
        });
      },

      _setup(app, path) {
        app.get(`/${path}/count`, function(req, res) {
          res.json({ counter: 10 });
        });
      }
    };

    const app = feathers()
      .configure(rest())
      .use('/todo', todoService);

    const server = app.listen(8999).on('listening', function () {
      request('http://localhost:8999/todo/dishes', (error, response, body) => {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        const data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        request('http://localhost:8999/todo/count', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          const data = JSON.parse(body);
          assert.equal(data.counter, 10);
          server.close(done);
        });
      });
    });
  });

  it('mixins are unique to one application', function() {
    const app = feathers();
    app.mixins.push(function() {});
    assert.equal(app.mixins.length, 4);

    const otherApp = feathers();
    otherApp.mixins.push(function() {});
    assert.equal(otherApp.mixins.length, 4);
  });

  it('initializes a service with only a setup method (#285)', done => {
    const app = feathers();

    app.use('/setup-only', {
      setup(_app, path) {
        assert.equal(_app, app);
        assert.equal(path, 'setup-only');
        done();
      }
    });

    app.setup();
  });

  it('Event punching happens after normalization (#150)', done => {
    const todoService = {
      create(data) {
        return Promise.resolve(data);
      }
    };

    const app = feathers()
      .configure(rest())
      .use('/todo', todoService);

    const server = app.listen(7001).on('listening', function () {
      app.service('todo').create({
        test: 'item'
      });

      server.close(done);
    });
  });
});
