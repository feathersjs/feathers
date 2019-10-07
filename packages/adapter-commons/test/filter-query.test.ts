import assert from 'assert';
import { ObjectId } from 'mongodb';
import { filterQuery } from '../src';

describe('@feathersjs/adapter-commons/filterQuery', () => {
  describe('$sort', () => {
    it('returns $sort when present in query', () => {
      const originalQuery = { $sort: { name: 1 } };
      const { filters, query } = filterQuery(originalQuery);

      assert.strictEqual(filters.$sort.name, 1);
      assert.deepStrictEqual(query, {});
      assert.deepStrictEqual(originalQuery, {
        $sort: { name: 1 }
      }, 'does not modify original query');
    });

    it('returns $sort when present in query as an object', () => {
      const { filters, query } = filterQuery({ $sort: { name: { something: 10 } } });

      assert.strictEqual(filters.$sort.name.something, 10);
      assert.deepStrictEqual(query, {});
    });

    it('converts strings in $sort', () => {
      const { filters, query } = filterQuery({ $sort: { test: '-1' } });

      assert.strictEqual(filters.$sort.test, -1);
      assert.deepStrictEqual(query, {});
    });

    it('does not convert $sort arrays', () => {
      const $sort = [ [ 'test', '-1' ], [ 'a', '1' ] ];
      const { filters, query } = filterQuery({ $sort });

      assert.strictEqual(filters.$sort, $sort);
      assert.deepStrictEqual(query, {});
    });

    it('throws an error when special parameter is not known', () => {
      try {
        const query = { $foo: 1 };
        filterQuery(query);
        assert.ok(false, 'Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'BadRequest');
        assert.strictEqual(error.message, 'Invalid query parameter $foo');
      }
    });

    it('returns undefined when not present in query', () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$sort, undefined);
    });
  });

  describe('$limit', () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $limit: 1 };
    });

    it('returns $limit when present in query', () => {
      const { filters, query } = filterQuery(testQuery);

      assert.strictEqual(filters.$limit, 1);
      assert.deepStrictEqual(query, {});
    });

    it('returns undefined when not present in query', () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$limit, undefined);
    });

    it('removes $limit from query when present', () => {
      assert.deepStrictEqual(filterQuery(testQuery).query, {});
    });

    it('parses $limit strings into integers (#4)', () => {
      const { filters } = filterQuery({ $limit: '2' });

      assert.strictEqual(filters.$limit, 2);
    });

    it('allows $limit 0', () => {
      const { filters } = filterQuery({ $limit: 0 }, { default: 10 });

      assert.strictEqual(filters.$limit, 0);
    });

    describe('pagination', () => {
      it('limits with default pagination', () => {
        const { filters } = filterQuery({}, { paginate: { default: 10 } });

        assert.strictEqual(filters.$limit, 10);
      });

      it('limits with max pagination', () => {
        const { filters } = filterQuery({ $limit: 20 }, { paginate: { default: 5, max: 10 } });
        const { filters: filtersNeg } = filterQuery({ $limit: -20 }, { paginate: { default: 5, max: 10 } });

        assert.strictEqual(filters.$limit, 10);
        assert.strictEqual(filtersNeg.$limit, 10);
      });

      it('limits with max pagination when not a number', () => {
        const { filters } = filterQuery({ $limit: 'something' }, { paginate: { default: 5, max: 10 } });

        assert.strictEqual(filters.$limit, 5);
      });
    });
  });

  describe('$skip', () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $skip: 1 };
    });

    it('returns $skip when present in query', () => {
      const { filters } = filterQuery(testQuery);

      assert.strictEqual(filters.$skip, 1);
    });

    it('removes $skip from query when present', () => {
      assert.deepStrictEqual(filterQuery(testQuery).query, {});
    });

    it('returns undefined when not present in query', () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$skip, undefined);
    });

    it('parses $skip strings into integers (#4)', () => {
      const { filters } = filterQuery({ $skip: '33' });

      assert.strictEqual(filters.$skip, 33);
    });
  });

  describe('$select', () => {
    let testQuery: any;

    beforeEach(() => {
      testQuery = { $select: 1 };
    });

    it('returns $select when present in query', () => {
      const { filters } = filterQuery(testQuery);

      assert.strictEqual(filters.$select, 1);
    });

    it('removes $select from query when present', () => {
      assert.deepStrictEqual(filterQuery(testQuery).query, {});
    });

    it('returns undefined when not present in query', () => {
      const query = { foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$select, undefined);
    });

    it('includes Symbols', () => {
      const TEST = Symbol('testing');
      const original = {
        [TEST]: 'message',
        other: true,
        sub: { [TEST]: 'othermessage' }
      };

      const { query } = filterQuery(original);

      assert.deepStrictEqual(query, {
        [TEST]: 'message',
        other: true,
        sub: { [TEST]: 'othermessage' }
      });
    });

    it('only converts plain objects', () => {
      const userId = new ObjectId();
      const original = {
        userId
      };

      const { query } = filterQuery(original);

      assert.deepStrictEqual(query, original);
    });
  });

  describe('additional filters', () => {
    it('throw error when not set as additionals', () => {
      try {
        filterQuery({ $select: 1, $known: 1 });
        assert.ok(false, 'Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, 'Invalid query parameter $known');
      }
    });

    it('returns default and known additional filters (array)', () => {
      const query = { $select: ['a', 'b'], $known: 1, $unknown: 1 };
      const { filters } = filterQuery(query, { filters: [ '$known', '$unknown' ] });

      assert.strictEqual(filters.$unknown, 1);
      assert.strictEqual(filters.$known, 1);
      assert.deepStrictEqual(filters.$select, [ 'a', 'b' ]);
    });

    it('returns default and known additional filters (object)', () => {
      const { filters } = filterQuery({
        $known: 1,
        $select: 1
      }, { filters: { $known: (value: any) => value.toString() } });

      assert.strictEqual(filters.$unknown, undefined);
      assert.strictEqual(filters.$known, '1');
      assert.strictEqual(filters.$select, 1);
    });
  });

  describe('additional operators', () => {
    it('returns query with default and known additional operators', () => {
      const { query } = filterQuery({
        $ne: 1, $known: 1
      }, { operators: [ '$known' ] });

      assert.strictEqual(query.$ne, 1);
      assert.strictEqual(query.$known, 1);
      assert.strictEqual(query.$unknown, undefined);
    });
  });
});
