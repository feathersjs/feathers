import assert from 'assert';
import { EventEmitter } from 'events';

import { feathers } from '../src';

describe('Service events', () => {
  it('app is an event emitter', done => {
    const app = feathers();

    assert.strictEqual(typeof app.on, 'function');

    app.on('test', (data: any) => {
      assert.deepStrictEqual(data, { message: 'app' });
      done();
    });
    app.emit('test', { message: 'app' });
  });

  it('works with service that is already an EventEmitter', done => {
    const app = feathers();
    const service: any = new EventEmitter();

    service.create = function (data: any) {
      return Promise.resolve(data);
    };

    service.on('created', (data: any) => {
      assert.deepStrictEqual(data, {
        message: 'testing'
      });
      done();
    });

    app.use('/emitter', service);

    app.service('emitter').create({
      message: 'testing'
    });
  });

  describe('emits event data on a service', () => {
    it('.create and created', done => {
      const app = feathers().use('/creator', {
        create (data: any) {
          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');

      service.on('created', (data: any) => {
        assert.deepStrictEqual(data, { message: 'Hello' });
        done();
      });

      service.create({ message: 'Hello' });
    });

    it('allows to skip event emitting', done => {
      const app = feathers().use('/creator', {
        create (data: any) {
          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');

      service.hooks({
        before: {
          create (context: any) {
            context.event = null;

            return context;
          }
        }
      });

      service.on('created', (_data: any) => {
        done(new Error('Should never get here'));
      });

      service.create({ message: 'Hello' }).then(() => done());
    });

    it('.update and updated', done => {
      const app = feathers().use('/creator', {
        update (id: any, data: any) {
          return Promise.resolve(Object.assign({ id }, data));
        }
      });

      const service = app.service('creator');

      service.on('updated', (data: any) => {
        assert.deepStrictEqual(data, { id: 10, message: 'Hello' });
        done();
      });

      service.update(10, { message: 'Hello' });
    });

    it('.patch and patched', done => {
      const app = feathers().use('/creator', {
        patch (id: any, data: any) {
          return Promise.resolve(Object.assign({ id }, data));
        }
      });

      const service = app.service('creator');

      service.on('patched', (data: any) => {
        assert.deepStrictEqual(data, { id: 12, message: 'Hello' });
        done();
      });

      service.patch(12, { message: 'Hello' });
    });

    it('.remove and removed', done => {
      const app = feathers().use('/creator', {
        remove (id: any) {
          return Promise.resolve({ id });
        }
      });

      const service = app.service('creator');

      service.on('removed', (data: any) => {
        assert.deepStrictEqual(data, { id: 22 });
        done();
      });

      service.remove(22);
    });
  });

  describe('emits event data arrays on a service', () => {
    it('.create and created with array', done => {
      const app = feathers().use('/creator', {
        create (data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map(current => this.create(current)));
          }

          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');
      const createItems = [
        { message: 'Hello 0' },
        { message: 'Hello 1' }
      ];

      Promise.all(createItems.map((element, index) => {
        return new Promise((resolve) => {
          service.on('created', (data: any) => {
            if (data.message === element.message) {
              assert.deepStrictEqual(data, { message: `Hello ${index}` });
              resolve();
            }
          });
        });
      })).then(() => done()).catch(done);

      service.create(createItems);
    });

    it('.update and updated with array', done => {
      const app = feathers().use('/creator', {
        update (id: any, data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current, index) => this.update(index, current)));
          }
          return Promise.resolve(Object.assign({ id }, data));
        }
      });

      const service = app.service('creator');
      const updateItems = [
        { message: 'Hello 0' },
        { message: 'Hello 1' }
      ];

      Promise.all(updateItems.map((element, index) => {
        return new Promise((resolve) => {
          service.on('updated', (data: any) => {
            if (data.message === element.message) {
              assert.deepStrictEqual(data, { id: index, message: `Hello ${index}` });
              resolve();
            }
          });
        });
      })).then(() => done()).catch(done);

      service.update(null, updateItems);
    });

    it('.patch and patched with array', done => {
      const app = feathers().use('/creator', {
        patch (id: any, data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current, index) => this.patch(index, current)));
          }
          return Promise.resolve(Object.assign({ id }, data));
        }
      });

      const service = app.service('creator');
      const patchItems = [
        { message: 'Hello 0' },
        { message: 'Hello 1' }
      ];

      Promise.all(patchItems.map((element, index) => {
        return new Promise((resolve) => {
          service.on('patched', (data: any) => {
            if (data.message === element.message) {
              assert.deepStrictEqual(data, { id: index, message: `Hello ${index}` });
              resolve();
            }
          });
        });
      })).then(() => done()).catch(done);

      service.patch(null, patchItems);
    });

    it('.remove and removed with array', done => {
      const app = feathers().use('/creator', {
        remove (id: any, data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current, index) => this.remove(index, current)));
          }
          return Promise.resolve(Object.assign({ id }, data));
        }
      });

      const service = app.service('creator');
      const removeItems = [
        { message: 'Hello 0' },
        { message: 'Hello 1' }
      ];

      Promise.all(removeItems.map((element, index) => {
        return new Promise((resolve) => {
          service.on('removed', (data: any) => {
            if (data.message === element.message) {
              assert.deepStrictEqual(data, { id: index, message: `Hello ${index}` });
              resolve();
            }
          });
        });
      })).then(() => done()).catch(done);

      service.remove(null, removeItems);
    });
  });

  describe('event format', () => {
    it('also emits the actual hook object', done => {
      const app = feathers().use('/creator', {
        create (data: any) {
          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');

      service.hooks({
        after (hook: any) {
          hook.changed = true;
        }
      });

      service.on('created', (data: any, hook: any) => {
        assert.deepStrictEqual(data, { message: 'Hi' });
        assert.ok(hook.changed);
        assert.strictEqual(hook.service, service);
        assert.strictEqual(hook.method, 'create');
        assert.strictEqual(hook.type, 'after');
        done();
      });

      service.create({ message: 'Hi' });
    });

    it('events indicated by the service are not sent automatically', done => {
      const app = feathers().use('/creator', {
        events: ['created'],
        create (data: any) {
          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');

      service.on('created', (data: any) => {
        assert.deepStrictEqual(data, { message: 'custom event' });
        done();
      });

      service.create({ message: 'hello' })
        .then(() => service.emit('created', { message: 'custom event' }));
    });
  });
});
