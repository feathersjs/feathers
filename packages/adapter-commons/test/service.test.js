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

    it('multi can be set to true', () => {
      const service = new MethodService();

      service.options.multi = true;

      return service.create([])
        .then(() => assert.ok(true));
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

  it('allowsMulti', () => {
    context('with true', () => {
      const service = new AdapterService({multi: true});

      it('does return true for multible methodes', () => {
        assert.equal(service.allowsMulti('patch'), true);
      });

      it('does return false for always non-multible methodes', () => {
        assert.equal(service.allowsMulti('update'), false);
      });

      it('does return true for unknown methods', () => {
        assert.equal(service.allowsMulti('other'), true);
      });
    });

    context('with false', () => {
      const service = new AdapterService({multi: false});

      it('does return false for multible methodes', () => {
        assert.equal(service.allowsMulti('remove'), false);
      });

      it('does return true for always multible methodes', () => {
        assert.equal(service.allowsMulti('find'), true);
      });

      it('does return false for unknown methods', () => {
        assert.equal(service.allowsMulti('other'), false);
      });
    });

    context('with array', () => {
      const service = new AdapterService({multi: ['create', 'get', 'other']});

      it('does return true for specified multible methodes', () => {
        assert.equal(service.allowsMulti('create'), true);
      });

      it('does return false for non-specified multible methodes', () => {
        assert.equal(service.allowsMulti('patch'), false);
      });

      it('does return false for specified always multible methodes', () => {
        assert.equal(service.allowsMulti('get'), false);
      });

      it('does return true for specified unknown methodes', () => {
        assert.equal(service.allowsMulti('other'), true);
      });

      it('does return false for non-specified unknown methodes', () => {
        assert.equal(service.allowsMulti('another'), false);
      });
    });
  });
});
