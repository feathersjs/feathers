/* eslint-disable @typescript-eslint/no-unused-vars */
import { it, assert, assertEquals, assertStrictEquals } from '../../commons/src/index.ts'
import { NotImplemented } from '../../errors/src/index.ts';
import { AdapterService, InternalServiceMethods } from '../src/index.ts';
import { Params, Id, NullableId } from '../../feathers/src/declarations.ts';

const METHODS = [ 'find', 'get', 'create', 'update', 'patch', 'remove' ];

// describe('@feathersjs/adapter-commons/service', () => {
class CustomService extends AdapterService {
}

// describe('errors when method does not exit', () => {
METHODS.forEach(method => {
  it(`Undeclared Extended Methods: ${method}`, () => {
    const service = new CustomService({});

    // @ts-ignore suppress
    return service[method]()
      .then(() => {
        throw new Error('Should never get here');
      }).catch((error: Error) => {
        assert(error instanceof NotImplemented);
        assertStrictEquals(error.message, `Method _${method} not available`);
      });
  });
});

// // describe('works when methods exist', () => {
class MethodService extends AdapterService implements InternalServiceMethods {
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
  it(`Internal Methods: ${method}`, () => {
    const service = new MethodService({});
    const args = [];

    if (method !== 'find') {
      args.push('test');
    }

    if (method === 'update' || method === 'patch') {
      args.push({});
    }

    // @ts-ignore suppress
    return service[method](...args);
  });
});

it('does not allow multi patch', () => {
  const service = new MethodService({});

  return service.patch(null, {})
    .then(() => assert(false))
    .catch(error => {
      assertStrictEquals(error.name, 'MethodNotAllowed');
      assertStrictEquals(error.message, 'Can not patch multiple entries');
    });
});

it('does not allow multi remove', () => {
  const service = new MethodService({});

  return service.remove(null, {})
    .then(() => assert(false))
    .catch(error => {
      assertStrictEquals(error.name, 'MethodNotAllowed');
      assertStrictEquals(error.message, 'Can not remove multiple entries');
    });
});

it('does not allow multi create', () => {
  const service = new MethodService({});

  return service.create([])
    .then(() => assert(false))
    .catch(error => {
      assertStrictEquals(error.name, 'MethodNotAllowed');
      assertStrictEquals(error.message, 'Can not create multiple entries');
    });
});

it('multi can be set to true', () => {
  const service = new MethodService({});

  service.options.multi = true;

  return service.create([])
    .then(() => assert(true));
});

it('filterQuery', () => {
  const service = new CustomService({
    whitelist: [ '$something' ]
  });
  const filtered = service.filterQuery({
    query: { $limit: 10, test: 'me' }
  });

  assertEquals(filtered, {
    paginate: {},
    filters: { $limit: 10 },
    query: { test: 'me' }
  });

  const withWhitelisted = service.filterQuery({
    query: { $limit: 10, $something: 'else' }
  });

  assertEquals(withWhitelisted, {
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

  assertEquals(opts, {
    id: 'id',
    events: [],
    paginate: { default: 10, max: 100 },
    multi: [ 'create' ],
    filters: [],
    allow: []
  });
});

// 'allowsMulti with true'
const allowsMultiWithTrueService = new AdapterService({multi: true});

it('allowsMulti with true: returns true for multiple methods', () => {
  assertStrictEquals(allowsMultiWithTrueService.allowsMulti('patch'), true);
});

it('allowsMulti with true: returns false for always non-multiple methods', () => {
  assertStrictEquals(allowsMultiWithTrueService.allowsMulti('update'), false);
});

it('allowsMulti with true: returns true for unknown methods', () => {
  assertStrictEquals(allowsMultiWithTrueService.allowsMulti('other'), true);
});

// 'allowsMulti with false'
const multiWithFalseService = new AdapterService({multi: false});

it('allowsMulti with false: returns false for multiple methods', () => {
  assertStrictEquals(multiWithFalseService.allowsMulti('remove'), false);
});

it('allowsMulti with false: returns true for always multiple methods', () => {
  assertStrictEquals(multiWithFalseService.allowsMulti('find'), true);
});

it('allowsMulti with false: returns false for unknown methods', () => {
  assertStrictEquals(multiWithFalseService.allowsMulti('other'), false);
});

// 'allowsMulti with array'
const multiArrayService = new AdapterService({multi: ['create', 'get', 'other']});

it('allowsMulti with array: returns true for specified multiple methods', () => {
  assertStrictEquals(multiArrayService.allowsMulti('create'), true);
});

it('allowsMulti with array: returns false for non-specified multiple methods', () => {
  assertStrictEquals(multiArrayService.allowsMulti('patch'), false);
});

it('allowsMulti with array: returns false for specified always multiple methods', () => {
  assertStrictEquals(multiArrayService.allowsMulti('get'), false);
});

it('allowsMulti with array: returns true for specified unknown methods', () => {
  assertStrictEquals(multiArrayService.allowsMulti('other'), true);
});

it('allowsMulti with array: returns false for non-specified unknown methods', () => {
  assertStrictEquals(multiArrayService.allowsMulti('another'), false);
});
