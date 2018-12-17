const assert = require('assert');
const { NotImplemented } = require('@feathersjs/errors');
const { AdapterService } = require('../lib');
const METHODS = [ 'find', 'get', 'create', 'update', 'patch', 'remove' ];

describe('@feathersjs/adapter-commons/service', () => {
  class CustomService extends AdapterService {
  }

  describe('errors when method does not exit', () => {
    METHODS.forEach(method => {
      it(`${method}`, () => {
        const service = new CustomService();

        return service[method]().then(() => {
          throw new Error('Should never get here');
        }).catch(error => {
          assert.ok(error instanceof NotImplemented);
          assert.strictEqual(error.message, `Method _${method} not available`);
        });
      });
    });
  });

  describe('works when methods exist', () => {
    class MethodService extends AdapterService {
      _find () {
        return Promise.resolve([]);
      }

      _get (id) {
        return Promise.resolve({ id });
      }

      _create (data) {
        return Promise.resolve(data);
      }

      _update (id) {
        return Promise.resolve({ id });
      }

      _patch (id) {
        return Promise.resolve({ id });
      }

      _remove (id) {
        return Promise.resolve({ id });
      }
    }

    METHODS.forEach(method => {
      it(`${method}`, () => {
        const service = new MethodService();
        const args = [];

        if (method !== 'find') {
          args.push('test');
        }

        if (method === 'update' || method === 'patch') {
          args.push({});
        }

        return service[method](...args);
      });
    });

    it('does not allow multi patch', () => {
      const service = new MethodService();

      return service.patch(null, {})
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not patch multiple entries');
        });
    });

    it('does not allow multi remove', () => {
      const service = new MethodService();

      return service.remove(null, {})
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not remove multiple entries');
        });
    });

    it('does not allow multi create', () => {
      const service = new MethodService();

      return service.create([])
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not create multiple entries');
        });
    });
  });

  it('filterQuery', () => {
    const service = new CustomService({
      whitelist: [ '$something' ]
    });
    const filtered = service.filterQuery({
      query: { $limit: 10, test: 'me' }
    });

    assert.deepStrictEqual(filtered, {
      paginate: {},
      filters: { $limit: 10 },
      query: { test: 'me' }
    });

    const withWhitelisted = service.filterQuery({
      query: { $limit: 10, $something: 'else' }
    });
    
    assert.deepStrictEqual(withWhitelisted, {
      paginate: {},
      filters: { $limit: 10 },
      query: { $something: 'else' }
    });
  });
});
