import { strict as assert } from 'assert';
import { getServiceOptions, Id, defaultServiceMethods, wrapService } from '../src';

describe('Feathers Service utilities', () => {
  describe('getServiceOptions', () => {
    const service = {
      async get (id: Id) {
        return { id };
      },

      async create (data: any) {
        return { data };
      }
    }

    it('with default service', () => {
      const defaults = getServiceOptions(service, {
        events: [ 'created' ]
      });

      assert.deepEqual(defaults, {
        events: [ 'created' ],
        methods: {
          get: defaultServiceMethods.get,
          create: defaultServiceMethods.create
        }
      });
    });

    it('with default overrides', () => {
      const defaults = getServiceOptions(service, {
        methods: {
          create: { external: false }
        }
      });

      assert.deepEqual(defaults, {
        events: [],
        methods: {
          create: {
            ...defaultServiceMethods.create,
            external: false
          }
        }
      });
    });

    it('does not include non-methods', () => {
      const service = {
        get: true,

        async create (data: any) {
          return { data };
        }
      }
      const defaults = getServiceOptions(service, {});

      assert.deepEqual(defaults, {
        events: [],
        methods: {
          create: defaultServiceMethods.create
        }
      });
    });
  });

  describe('wrapService', () => {
    it('errors when service is invalid', () => {
      const service = {
        someMethod () {
          return 'Hi';
        }
      }
      assert.throws(() => wrapService('test', service, {}), {
        message: 'Invalid service object passed for path `test`'
      });
    });
  });
});
