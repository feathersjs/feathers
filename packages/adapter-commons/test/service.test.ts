/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'assert';
import { NotImplemented } from '@feathersjs/errors';
import { AdapterService, InternalServiceMethods } from '../src';
import { Params, Id, NullableId } from '@feathersjs/feathers';

const METHODS: [ 'find', 'get', 'create', 'update', 'patch', 'remove' ] = [ 'find', 'get', 'create', 'update', 'patch', 'remove' ];

describe('@feathersjs/adapter-commons/service', () => {
  class CustomService extends AdapterService {
  }

  describe('errors when method does not exit', () => {
    METHODS.forEach(method => {
      it(`${method}`, () => {
        const service = new CustomService({});

        // @ts-ignore
        return service[method]().then(() => {
          throw new Error('Should never get here');
        }).catch((error: Error) => {
          assert.ok(error instanceof NotImplemented);
          assert.strictEqual(error.message, `Method _${method} not available`);
        });
      });
    });
  });

  describe('works when methods exist', () => {
    class MethodService extends AdapterService implements InternalServiceMethods<any> {
      _find (_params?: Params) {
        return Promise.resolve([]);
      }

      _get (id: Id, _params?: Params) {
        return Promise.resolve({ id });
      }

      _create (data: Partial<any> | Partial<any>[], _params?: Params) {
        return Promise.resolve(data);
      }

      _update (id: NullableId, _data: any, _params?: Params) {
        return Promise.resolve({ id });
      }

      _patch (id: NullableId, _data: any, _params?: Params) {
        return Promise.resolve({ id });
      }

      _remove (id: NullableId, _params?: Params) {
        return Promise.resolve({ id });
      }
    }

    METHODS.forEach(method => {
      it(`${method}`, () => {
        const service = new MethodService({});
        const args = [];

        if (method !== 'find') {
          args.push('test');
        }

        if (method === 'update' || method === 'patch') {
          args.push({});
        }

        // @ts-ignore
        return service[method](...args);
      });
    });

    it('does not allow multi patch', () => {
      const service = new MethodService({});

      return service.patch(null, {})
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not patch multiple entries');
        });
    });

    it('does not allow multi remove', () => {
      const service = new MethodService({});

      return service.remove(null, {})
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not remove multiple entries');
        });
    });

    it('does not allow multi create', () => {
      const service = new MethodService({});

      return service.create([])
        .then(() => assert.ok(false))
        .catch(error => {
          assert.strictEqual(error.name, 'MethodNotAllowed');
          assert.strictEqual(error.message, 'Can not create multiple entries');
        });
    });

    it('multi can be set to true', () => {
      const service = new MethodService({});

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

  it('getOptions', () => {
    const service = new AdapterService({
      multi: true
    });
    const opts = service.getOptions({
      adapter: {
        multi: [ 'create' ],
        paginate: {
          default: 10,
          max: 100
        }
      }
    });

    assert.deepStrictEqual(opts, {
      id: 'id',
      events: [],
      paginate: { default: 10, max: 100 },
      multi: [ 'create' ],
      filters: [],
      allow: []
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
