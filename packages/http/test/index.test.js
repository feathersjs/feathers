const { it, describe } = require('mocha');
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { Service } = require('@feathersjs/tests/lib/fixture');
// const { crud } = require('@feathersjs/tests/lib/crud');
const axios = require('axios');

const http = require('../src');

describe('@feathersjs/http', () => {
  describe('feathers + http app sanity', () => {
    it('should return raw http server if initialized with empty param', () => {
      const server = http();
      assert.equal(server instanceof require('http').Server, true);
    });

    it('should throw an error if initialized with invalid app', () => {
      assert.throws(() => {
        const app = {};
        http(app);
      }, new Error('@feathersjs/http requires a valid Feathers application instance'));
    });

    it('should return valid feathers app server', () => {
      const app = http(feathers());

      assert.equal(typeof app.use, 'function');
      assert.equal(typeof app.service, 'function');
      assert.equal(typeof app.listen, 'function');
    });

    it('should return proper results for service method calls', done => {
      const app = http(feathers());
      app.use('todo', Service);
      const todoService = app.service('todo');

      todoService.get('dishes', { query: {} }).then(todoItem => {
        assert.deepEqual(todoItem, {
          id: 'dishes',
          description: 'You have to do dishes!'
        });

        done();
      });
    });
  });

  describe('functionality over rest', () => {
    const PORT = 9797;
    let app;
    let server;
    let axiosInstance;

    before(done => {
      app = http(feathers());
      app.use('/', Service);
      app.use('todo', Service);

      axiosInstance = axios.create({
        baseURL: 'http://localhost:' + PORT
      });

      server = app.listen(PORT);
      server.once('listening', () => done());
    });

    it('should return valid result for get', done => {
      axiosInstance.get('/todo/dishes').then(response => {
        assert.equal(response.status, 200);
        const todoItem = response.data;
        assert.deepEqual(todoItem, {
          id: 'dishes',
          description: 'You have to do dishes!'
        });
        done();
      });
    });

    it('should return valid result of find method if id is not passed', done => {
      axiosInstance.get('/todo').then(response => {
        assert.equal(response.status, 200);
        const todoItems = response.data;

        assert.equal(Array.isArray(todoItems), true);

        assert.deepEqual(todoItems, [
          {
            description: 'You have to do something',
            id: 0
          },
          {
            description: 'You have to do laundry',
            id: 1
          }
        ]);
        done();
      });
    });

    // crud('Services', 'todo', PORT);
  });
});
