import assert from 'assert';
import { EventEmitter } from 'events';
import feathers, { Application } from '@feathersjs/feathers';
import _ from 'lodash';
import { socket as commons, SocketOptions } from '../../src/socket';

describe('@feathersjs/transport-commons', () => {
  let provider: EventEmitter;
  let options: SocketOptions;
  let app: Application;
  let connection: any;

  beforeEach(() => {
    connection = { testing: true };
    provider = new EventEmitter();

    options = {
      emit: 'emit',
      done: Promise.resolve(provider),
      socketMap: new WeakMap(),
      getParams () {
        return connection;
      }
    };
    app = feathers()
      .configure(commons(options))
      .use('/myservice', {
        get (id, params) {
          if (!_.isPlainObject(params.query)) {
            throw new Error('Should be a plain object');
          }

          return Promise.resolve({ id, params });
        },

        create (data, params) {
          return Promise.resolve(Object.assign({ params }, data));
        }
      });

    return options.done;
  });

  it('`connection` event', done => {
    const socket = new EventEmitter();

    app.once('connection', data => {
      assert.strictEqual(connection, data);
      done();
    });

    provider.emit('connection', socket);
  });

  describe('method name based socket events', () => {
    it('.get without params', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('get', 'myservice', 10, (error: any, result: any) => {
        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, {
            id: 10,
            params: Object.assign({
              query: {},
              route: {},
              connection
            }, connection)
          });
          done();
        } catch (e: any) {
          done(e);
        }
      });
    });

    it('.get with invalid service name and arguments', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('get', null, (error: any) => {
        assert.strictEqual(error.name, 'NotFound');
        assert.strictEqual(error.message, `Service 'null' not found`);
        done();
      });
    });

    it('.create with params', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      provider.emit('connection', socket);

      socket.emit('create', 'myservice', data, {
        fromQuery: true
      }, (error: any, result: any) => {
        try {
          const params = Object.assign({
            query: { fromQuery: true },
            route: {},
            connection
          }, connection);

          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e: any) {
          done(e);
        }
      });
    });
  });

  describe('legacy method socket event format', () => {
    it('legacy `authenticate`', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      app.set('defaultAuthentication', 'myservice');
      provider.emit('connection', socket);

      socket.emit('authenticate', data, (error: any, result: any) => {
        try {
          const params = Object.assign({
            query: {},
            route: {},
            connection
          }, connection);

          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e: any) {
          done(e);
        }
      });
    });

    it('.get without params', done => {
      const socket = new EventEmitter();

      provider.emit('connection', socket);

      socket.emit('myservice::get', 10, (error: any, result: any) => {
        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, {
            id: 10,
            params: Object.assign({
              connection,
              query: {},
              route: {}
            }, connection)
          });
          app.emit('disconnect', socket);
        } catch (e: any) {
          done(e);
        }
      });

      app.once('disconnect', () => done());
    });

    it('queries are always plain objects', done => {
      const socket = new EventEmitter();
      const callback = (error: any, result: any) => {
        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, {
            id: 10,
            params: Object.assign({
              connection,
              query: {},
              route: {}
            }, connection)
          });
          done();
        } catch (e: any) {
          done(e);
        }
      };

      provider.emit('connection', socket);

      socket.emit('myservice::get', 10, {
        __proto__: []
      }, callback);
    });

    it('.create with params', done => {
      const socket = new EventEmitter();
      const data = {
        test: 'data'
      };

      provider.emit('connection', socket);

      socket.emit('myservice::create', data, {
        fromQuery: true
      }, (error: any, result: any) => {
        const params = Object.assign({
          query: { fromQuery: true },
          route: {},
          connection
        }, connection);

        try {
          assert.ok(!error);
          assert.deepStrictEqual(result, Object.assign({ params }, data));
          done();
        } catch (e: any) {
          done(e);
        }
      });
    });
  });
});
