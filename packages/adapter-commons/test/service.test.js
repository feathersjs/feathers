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
      _find() {
        return Promise.resolve([]);
      }

      _get (id) {
        return Promise.resolve({ id });
      }

      _create(data) {
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

        if(method !== 'find') {
          args.push('test');
        }

        if (method === 'update' || method === 'patch') {
          args.push({});
        }

        return service[method](...args);
      });
    });
  });

  it('getFilters', () => {
    const service = new CustomService();
    const filtered = service.filterQuery({
      query: { $limit: 10, test: 'me' }
    });

    assert.deepStrictEqual(filtered, {
      paginate: {},
      filters: { $limit: 10 },
      query: { test: 'me' }
    });
  });
});
