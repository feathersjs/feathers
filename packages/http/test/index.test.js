const { it, describe } = require('mocha');
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { Service } = require('@feathersjs/tests/lib/fixture');
const { crud } = require('@feathersjs/tests/lib/crud');

const http = require('../src');

describe('@feathersjs/http', () => {

  describe('sanity', () => {
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
  });


  describe('functionality', () => {
    const PORT = 9797;
    let app;
    let server;

    before((done) => {
      app = http(feathers());
      app.use('/', Service);
      app.use('todo', Service);

      server = app.listen(PORT);
      server.once('listening', () => done());
    });


    it('should return proper results for service method calls', async () => {
      const todoService = app.service('todo');
      const todo = await todoService.get('dishes', { query : {} });
      
      assert.deepEqual(todo, {
        id: 'dishes',
        description: 'You have to do dishes!'
      });
    });

  }); 


});