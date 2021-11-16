import { it, assert, assertEquals, assertStrictEquals, assertThrows } from '../../commons/src/testing.ts'
import { errors } from '../../errors/src/index.ts'
import { objectId } from 'https://deno.land/x/objectid@0.2.0/mod.ts';

import { filterQuery } from '../src/filter-query.ts';

// const { ObjectId } = Bson
const makeLimitQuery = () => ({ $limit: 1 })
const makeSkipQuery = () => ({ $skip: 1 })
const makeSelectQuery = () => ({ $select: 1 })

// describe('@feathersjs/adapter-commons/filterQuery', () => {
// describe('$sort', () => {
it('returns $sort when present in query', () => {
  const originalQuery = { $sort: { name: 1 } };
  const { filters, query } = filterQuery(originalQuery);

  assertStrictEquals(filters.$sort.name, 1);
  assertEquals(query, {});
  assertEquals(originalQuery, {
    $sort: { name: 1 }
  }, 'does not modify original query');
});

it('returns $sort when present in query as an object', () => {
  const { filters, query } = filterQuery({ $sort: { name: { something: 10 } } });

  assertStrictEquals(filters.$sort.name.something, 10);
  assertEquals(query, {});
});

it('converts strings in $sort', () => {
  const { filters, query } = filterQuery({ $sort: { test: '-1' } });

  assertStrictEquals(filters.$sort.test, -1);
  assertEquals(query, {});
});

it('does not convert $sort arrays', () => {
  const $sort = [ [ 'test', '-1' ], [ 'a', '1' ] ];
  const { filters, query } = filterQuery({ $sort });

  assertEquals(filters.$sort, $sort);
  assertEquals(query, {});
});

it('throws an error when special parameter is not known', () => {
  try {
    const query = { $foo: 1 };
    filterQuery(query);
    assert(false, 'Should never get here');
  } catch (error: any) {
    assertStrictEquals(error.name, 'BadRequest');
    assertStrictEquals(error.message, 'Invalid query parameter $foo');
  }
});

it('returns undefined when not present in query', () => {
  const query = { foo: 1 };
  const { filters } = filterQuery(query);

  assertStrictEquals(filters.$sort, undefined);
});

it('returns $limit when present in query', () => {
  const limitQuery = makeLimitQuery()
  const { filters, query } = filterQuery(limitQuery);

  assertStrictEquals(filters.$limit, 1);
  assertEquals(query, {});
});

it('returns undefined when not present in query', () => {
  const query = { foo: 1 };
  const { filters } = filterQuery(query);

  assertStrictEquals(filters.$limit, undefined);
});

it('removes $limit from query when present', () => {
  const limitQuery = makeLimitQuery()
  assertEquals(filterQuery(limitQuery).query, {});
});

it('parses $limit strings into integers (#4)', () => {
  const { filters } = filterQuery({ $limit: '2' });

  assertStrictEquals(filters.$limit, 2);
});

it('allows $limit 0', () => {
  const { filters } = filterQuery({ $limit: 0 }, { default: 10 });

  assertStrictEquals(filters.$limit, 0);
});

// describe('pagination', () => {
it('limits with default pagination', () => {
  const { filters } = filterQuery({}, { paginate: { default: 10 } });

  assertStrictEquals(filters.$limit, 10);
});

it('limits with max pagination', () => {
  const { filters } = filterQuery({ $limit: 20 }, { paginate: { default: 5, max: 10 } });
  const { filters: filtersNeg } = filterQuery({ $limit: -20 }, { paginate: { default: 5, max: 10 } });

  assertStrictEquals(filters.$limit, 10);
  assertStrictEquals(filtersNeg.$limit, 10);
});

it('limits with default pagination when not a number', () => {
  const { filters } = filterQuery({ $limit: 'something' }, { paginate: { default: 5, max: 10 } });

  assertStrictEquals(filters.$limit, 5);
});

it('limits to 0 when no paginate.default and not a number', () => {
  const { filters } = filterQuery({ $limit: 'something' }, { paginate: { max: 10 } });

  assertStrictEquals(filters.$limit, 0);
});

it('still uses paginate.max when there is no paginate.default (#2104)', () => {
  const { filters } = filterQuery({ $limit: 100 }, { paginate: { max: 10 } });

  assertStrictEquals(filters.$limit, 10);
});

// describe('$skip', () => {
it('returns $skip when present in query', () => {
  const skipQuery = makeSkipQuery()
  const { filters } = filterQuery(skipQuery);

  assertStrictEquals(filters.$skip, 1);
});

it('removes $skip from query when present', () => {
  const skipQuery = makeSkipQuery()
  assertEquals(filterQuery(skipQuery).query, {});
});

it('returns undefined when not present in query', () => {
  const query = { foo: 1 };
  const { filters } = filterQuery(query);

  assertStrictEquals(filters.$skip, undefined);
});

it('parses $skip strings into integers (#4)', () => {
  const { filters } = filterQuery({ $skip: '33' });

  assertStrictEquals(filters.$skip, 33);
});

// describe('$select', () => {
it('returns $select when present in query', () => {
  const selectQuery = makeSelectQuery()
  const { filters } = filterQuery(selectQuery);

  assertStrictEquals(filters.$select, 1);
});

it('removes $select from query when present', () => {
  const selectQuery = makeSelectQuery()
  assertEquals(filterQuery(selectQuery).query, {});
});

it('returns undefined when not present in query', () => {
  const query = { foo: 1 };
  const { filters } = filterQuery(query);

  assertStrictEquals(filters.$select, undefined);
});

it('includes Symbols', () => {
  const TEST = Symbol('testing');
  const original = {
    [TEST]: 'message',
    other: true,
    sub: { [TEST]: 'othermessage' }
  };

  const { query } = filterQuery(original);

  assertEquals(query, {
    [TEST]: 'message',
    other: true,
    sub: { [TEST]: 'othermessage' }
  });
});

it('only converts plain objects', () => {
  const userId = objectId().toString();
  const original = {
    userId
  };

  const { query } = filterQuery(original);

  assertEquals(query, original);
});

// describe('arrays', () => {
it('validates queries in arrays', () => {
  assertThrows(
    () => {
      filterQuery({
        $or: [{ $exists: false }]
      });
    },
    errors.BadRequest,
    'Invalid query parameter $exists'
  );
});

// describe('additional filters', () => {
it('throw error when not set as additionals', () => {
  try {
    filterQuery({ $select: 1, $known: 1 });
    assert(false, 'Should never get here');
  } catch (error: any) {
    assertStrictEquals(error.message, 'Invalid query parameter $known');
  }
});

it('returns default and known additional filters (array)', () => {
  const query = { $select: ['a', 'b'], $known: 1, $unknown: 1 };
  const { filters } = filterQuery(query, { filters: [ '$known', '$unknown' ] });

  assertStrictEquals(filters.$unknown, 1);
  assertStrictEquals(filters.$known, 1);
  assertEquals(filters.$select, [ 'a', 'b' ]);
});

it('returns default and known additional filters (object)', () => {
  const { filters } = filterQuery({
    $known: 1,
    $select: 1
  }, { filters: { $known: (value: any) => value.toString() } });

  assertStrictEquals(filters.$unknown, undefined);
  assertStrictEquals(filters.$known, '1');
  assertStrictEquals(filters.$select, 1);
});

// describe('additional operators', () => {
it('returns query with default and known additional operators', () => {
  const { query } = filterQuery({
    $ne: 1, $known: 1
  }, { operators: [ '$known' ] });

  assertStrictEquals(query.$ne, 1);
  assertStrictEquals(query.$known, 1);
  assertStrictEquals(query.$unknown, undefined);
});
