import assert from 'assert';
import { feathers, Feathers, getServiceOptions, Id, version } from '../src'

describe('Feathers application', () => {
  it('initializes', () => {
    const app = feathers();

    assert.ok(app instanceof Feathers);
  });

  it('sets the version on main and app instance', () => {
    const app = feathers();

    assert.ok(version > '5.0.0');
    assert.ok(app.version > '5.0.0');
  });

  it('is an event emitter', done => {
    const app = feathers();
    const original = { hello: 'world' };

    app.on('test', (data: any) => {
      assert.deepStrictEqual(original, data);
      done();
    });

    app.emit('test', original);
  });

  it('uses .defaultService if available', async () => {
    const app = feathers();

    assert.throws(() => app.service('/todos/'), {
      message: 'Can not find service \'todos\''
    });

    app.defaultService = function (location: string) {
      assert.strictEqual(location, 'todos');
      return {
        async get (id: string) {
          return {
            id, description: `You have to do ${id}!`
          };
        }
      };
    };

    const data = await app.service('/todos/').get('dishes');

    assert.deepStrictEqual(data, {
      id: 'dishes',
      description: 'You have to do dishes!'
    });
  });

  it('additionally passes `app` as .configure parameter (#558)', done => {
    feathers().configure(function (app) {
      assert.strictEqual(this, app);
      done();
    });
  });

  describe('Services', () => {
    it('calling .use with invalid path throws', () => {
      const app = feathers();

      assert.throws(() => app.use(null, {}), {
        message: '\'null\' is not a valid service path.'
      });

      // @ts-ignore
      assert.throws(() => app.use({}, {}), {
        message: '\'[object Object]\' is not a valid service path.'
      });
    });

    it('calling .use with a non service object throws', () => {
      const app = feathers();

      // @ts-ignore
      assert.throws(() => app.use('/bla', function () {}), {
        message: 'Invalid service object passed for path `bla`'
      })
    });

    it('registers and wraps a new service', async () => {
      const dummyService = {
        async setup (this: any, _app: any, path: string) {
          this.path = path;
        },

        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.strictEqual(Object.getPrototypeOf(wrappedService), dummyService, 'Object points to original service prototype');

      const data = await wrappedService.create({
        message: 'Test message'
      });

      assert.strictEqual(data.message, 'Test message');
    });

    it('can not register custom methods on a protected methods', async () => {
      const dummyService = {
        async create (data: any) {
          return data;
        },
        async removeListener (data: any) {
          return data;
        },
        async setup () {}
      };

      assert.throws(() => feathers().use('/dummy', dummyService, {
        methods: ['create', 'removeListener']
      }), {
        message: '\'removeListener\' on service \'dummy\' is not allowed as a custom method name'
      });
      assert.throws(() => feathers().use('/dummy', dummyService, {
        methods: ['create', 'setup']
      }), {
        message: '\'setup\' on service \'dummy\' is not allowed as a custom method name'
      });
    });

    it('can use a root level service', async () => {
      const app = feathers().use('/', {
        async get (id: string) {
          return { id };
        }
      });

      const result = await app.service('/').get('test');

      assert.deepStrictEqual(result, { id: 'test' });
    });

    it('services can be re-used (#566)', done => {
      const app1 = feathers();
      const app2 = feathers();

      app2.use('/dummy', {
        async create (data: any) {
          return data;
        }
      });

      const dummy = app2.service('dummy');

      dummy.hooks({
        before: {
          create: [hook => {
            hook.data.fromHook = true;
          }]
        }
      });

      dummy.on('created', (data: any) => {
        assert.deepStrictEqual(data, {
          message: 'Hi',
          fromHook: true
        });
        done();
      });

      app1.use('/testing', app2.service('dummy'));

      app1.service('testing').create({ message: 'Hi' });
    });

    it('async hooks run before legacy hooks', async () => {
      const app = feathers();

      app.use('/dummy', {
        async  create (data: any) {
          return data;
        }
      });

      const dummy = app.service('dummy');

      dummy.hooks({
        before: {
          create (ctx) {
            ctx.data.order.push('before');
          }
        }
      });

      dummy.hooks([async (ctx: any, next: any) => {
        ctx.data.order = [ 'async' ];
        await next();
      }]);
      
      const result = await dummy.create({
        message: 'hi'
      });
      
      assert.deepStrictEqual(result, {
        message: 'hi',
        order: ['async', 'before']
      });
    });

    it('services conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        [TEST]: true,

        async setup (this: any, _app: any, path: string) {
          this.path = path;
        },

        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok((wrappedService as any)[TEST]);
    });

    it('methods conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        async setup (this: any, _app: any, path: string) {
          this.path = path;
        },

        async create (data: any) {
          return data;
        }
      };

      (dummyService.create as any)[TEST] = true;

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok((wrappedService.create as any)[TEST]);
    });
  });

  describe('Express app options compatibility', function () {
    describe('.set()', () => {
      it('should set a value', () => {
        const app = feathers();
        app.set('foo', 'bar');
        assert.strictEqual(app.get('foo'), 'bar');
      });

      it('should return the app', () => {
        const app = feathers();
        assert.strictEqual(app.set('foo', 'bar'), app);
      });

      it('should return the app when undefined', () => {
        const app = feathers();
        assert.strictEqual(app.set('foo', undefined), app);
      });
    });

    describe('.get()', () => {
      it('should return undefined when unset', () => {
        const app = feathers();
        assert.strictEqual(app.get('foo'), undefined);
      });

      it('should otherwise return the value', () => {
        const app = feathers();
        app.set('foo', 'bar');
        assert.strictEqual(app.get('foo'), 'bar');
      });
    });
  });

  describe('.setup', () => {
    it('app.setup calls .setup on all services', async () => {
      const app = feathers();
      let setupCount = 0;

      app.use('/dummy', {
        async setup (appRef: any, path: any) {
          setupCount++;
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy');
        }
      });

      app.use('/simple', {
        get (id: string) {
          return Promise.resolve({ id });
        }
      });

      app.use('/dummy2', {
        async setup (appRef: any, path: any) {
          setupCount++;
          assert.strictEqual(appRef, app);
          assert.strictEqual(path, 'dummy2');
        }
      });

      await app.setup();

      assert.ok((app as any)._isSetup);
      assert.strictEqual(setupCount, 2);
    });

    it('registering a service after app.setup will be set up', done => {
      const app = feathers();

      app.setup().then(() => {
        app.use('/dummy', {
          async setup (appRef: any, path: any) {
            assert.ok((app as any)._isSetup);
            assert.strictEqual(appRef, app);
            assert.strictEqual(path, 'dummy');
            done();
          }
        });
      });
    });
  });

  describe('mixins', () => {
    class Dummy {
      dummy = true;
      async get (id: Id) {
        return { id };
      }
    }

    it('are getting called with a service and default options', () => {
      const app = feathers();
      let mixinRan = false;

      app.mixins.push(function (service: any, location: any, options: any) {
        assert.ok(service.dummy);
        assert.strictEqual(location, 'dummy');
        assert.deepStrictEqual(options, getServiceOptions(new Dummy()));
        mixinRan = true;
      });

      app.use('/dummy', new Dummy());

      assert.ok(mixinRan);

      app.setup();
    });

    it('are getting called with a service and service options', () => {
      const app = feathers();
      const opts = { events: ['bla'] };

      let mixinRan = false;

      app.mixins.push(function (service: any, location: any, options: any) {
        assert.ok(service.dummy);
        assert.strictEqual(location, 'dummy');
        assert.deepStrictEqual(options, getServiceOptions(new Dummy(), opts));
        mixinRan = true;
      });

      app.use('/dummy', new Dummy(), opts);

      assert.ok(mixinRan);

      app.setup();
    });
  });

  describe('sub apps', () => {
    it('re-registers sub-app services with prefix', done => {
      const app = feathers();
      const subApp = feathers();

      subApp.use('/service1', {
        async get (id: string) {
          return {
            id, name: 'service1'
          };
        }
      }).use('/service2', {
        async get (id: string) {
          return {
            id, name: 'service2'
          };
        },

        async create (data: any) {
          return data;
        }
      });

      app.use('/api/', subApp);

      app.service('/api/service2').once('created', (data: any) => {
        assert.deepStrictEqual(data, {
          message: 'This is a test'
        });

        subApp.service('service2').once('created', (data: any) => {
          assert.deepStrictEqual(data, {
            message: 'This is another test'
          });

          done();
        });

        app.service('api/service2').create({
          message: 'This is another test'
        });
      });

      (async () => {
        let data = await app.service('/api/service1').get(10);
        assert.strictEqual(data.name, 'service1');

        data = await app.service('/api/service2').get(1);
        assert.strictEqual(data.name, 'service2');

        await subApp.service('service2').create({
          message: 'This is a test'
        });
      })();
    });
  });
});
