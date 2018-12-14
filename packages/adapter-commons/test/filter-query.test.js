const assert = require('assert');
const { filterQuery } = require('../lib');

describe('@feathersjs/adapter-commons/filterQuery', function () {
  describe('$sort', function () {
    it('returns $sort when present in query', function () {
      const originalQuery = { $sort: { name: 1 } };
      const { filters, query } = filterQuery(originalQuery);

      assert.strictEqual(filters.$sort.name, 1);
      assert.deepStrictEqual(query, {});
      assert.deepStrictEqual(originalQuery, {
        $sort: { name: 1 }
      }, 'does not modify original query');
    });

    it('returns $sort when present in query as an object', function () {
      const { filters, query } = filterQuery({ $sort: { name: { something: 10 } } });

      assert.strictEqual(filters.$sort.name.something, 10);
      assert.deepStrictEqual(query, {});
    });

    it('converts strings in $sort', function () {
      const { filters, query } = filterQuery({ $sort: { test: '-1' } });

      assert.strictEqual(filters.$sort.test, -1);
      assert.deepStrictEqual(query, {});
    });

    it('does not convert $sort arrays', function () {
      const $sort = [ [ 'test', '-1' ], [ 'a', '1' ] ];
      const { filters, query } = filterQuery({ $sort });

      assert.strictEqual(filters.$sort, $sort);
      assert.deepStrictEqual(query, {});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$sort, undefined);
    });
  });

  describe('$limit', function () {
    beforeEach(function () {
      this.query = { $limit: 1 };
    });

    it('returns $limit when present in query', function () {
      const { filters, query } = filterQuery(this.query);

      assert.strictEqual(filters.$limit, 1);
      assert.deepStrictEqual(query, {});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$limit, undefined);
    });

    it('removes $limit from query when present', function () {
      assert.deepStrictEqual(filterQuery(this.query).query, {});
    });

    it('parses $limit strings into integers (#4)', function () {
      const { filters } = filterQuery({ $limit: '2' });

      assert.strictEqual(filters.$limit, 2);
    });

    it('allows $limit 0', function () {
      const { filters } = filterQuery({ $limit: 0 }, { default: 10 });

      assert.strictEqual(filters.$limit, 0);
    });

    describe('pagination', function () {
      it('limits with default pagination', function () {
        const { filters } = filterQuery({}, { paginate: { default: 10 } });

        assert.strictEqual(filters.$limit, 10);
      });

      it('limits with max pagination', function () {
        const { filters } = filterQuery({ $limit: 20 }, { paginate: { default: 5, max: 10 } });
        const { filters: filtersNeg } = filterQuery({ $limit: -20 }, { paginate: { default: 5, max: 10 } });

        assert.strictEqual(filters.$limit, 10);
        assert.strictEqual(filtersNeg.$limit, 10);
      });
    });
  });

  describe('$skip', function () {
    beforeEach(function () {
      this.query = { $skip: 1 };
    });

    it('returns $skip when present in query', function () {
      const { filters } = filterQuery(this.query);

      assert.strictEqual(filters.$skip, 1);
    });

    it('removes $skip from query when present', function () {
      assert.deepStrictEqual(filterQuery(this.query).query, {});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$skip, undefined);
    });

    it('parses $skip strings into integers (#4)', function () {
      const { filters } = filterQuery({ $skip: '33' });

      assert.strictEqual(filters.$skip, 33);
    });
  });

  describe('$select', function () {
    beforeEach(function () {
      this.query = { $select: 1 };
    });

    it('returns $select when present in query', function () {
      const { filters } = filterQuery(this.query);

      assert.strictEqual(filters.$select, 1);
    });

    it('removes $select from query when present', function () {
      assert.deepStrictEqual(filterQuery(this.query).query, {});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filterQuery(query);

      assert.strictEqual(filters.$select, undefined);
    });
  });

  describe('additional filters', () => {
    beforeEach(function () {
      this.query = { $select: 1, $known: 1, $unknown: 1 };
    });

    it('returns only default filters when no additionals', function () {
      const { filters } = filterQuery(this.query);

      assert.strictEqual(filters.$unknown, undefined);
      assert.strictEqual(filters.$known, undefined);
      assert.strictEqual(filters.$select, 1);
    });

    it('returns default and known additional filters (array)', function () {
      const { filters } = filterQuery(this.query, { filters: [ '$known' ] });

      assert.strictEqual(filters.$unknown, undefined);
      assert.strictEqual(filters.$known, 1);
      assert.strictEqual(filters.$select, 1);
    });

    it('returns default and known additional filters (object)', function () {
      const { filters } = filterQuery(this.query, { filters: { $known: (value) => value.toString() } });

      assert.strictEqual(filters.$unknown, undefined);
      assert.strictEqual(filters.$known, '1');
      assert.strictEqual(filters.$select, 1);
    });
  });

  describe('additional operators', () => {
    beforeEach(function () {
      this.query = { $ne: 1, $known: 1, $unknown: 1 };
    });

    it('returns query with only default operators when no additionals', function () {
      const { query } = filterQuery(this.query);

      assert.strictEqual(query.$ne, 1);
      assert.strictEqual(query.$known, undefined);
      assert.strictEqual(query.$unknown, undefined);
    });

    it('returns query with default and known additional operators', function () {
      const { query } = filterQuery(this.query, { operators: [ '$known' ] });

      assert.strictEqual(query.$ne, 1);
      assert.strictEqual(query.$known, 1);
      assert.strictEqual(query.$unknown, undefined);
    });

    it('returns query with default and known additional operators (nested)', function () {
      const { query } = filterQuery({ field: this.query }, { operators: [ '$known' ] });

      assert.strictEqual(query.field.$ne, 1);
      assert.strictEqual(query.field.$known, 1);
      assert.strictEqual(query.field.$unknown, undefined);
    });
  });
});
