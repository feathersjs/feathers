const chai = require('chai');
const filter = require('../lib/filter-query');

const expect = chai.expect;

describe('.filterQuery', function () {
  describe('$sort', function () {
    it('returns $sort when present in query', function () {
      const originalQuery = { $sort: { name: 1 } };
      const { filters, query } = filter(originalQuery);

      expect(filters.$sort.name).to.equal(1);
      expect(query).to.deep.equal({});
      expect(originalQuery).to.deep.equal({
        $sort: { name: 1 }
      }, 'does not modify original query');
    });

    it('returns $sort when present in query as an object', function () {
      const { filters, query } = filter({ $sort: { name: { something: 10 } } });
      expect(filters.$sort.name.something).to.equal(10);
      expect(query).to.deep.equal({});
    });

    it('converts strings in $sort', function () {
      const { filters, query } = filter({ $sort: { test: '-1' } });
      expect(filters.$sort.test).to.equal(-1);
      expect(query).to.deep.equal({});
    });

    it('does not convert $sort arrays', function () {
      const $sort = [ [ 'test', '-1' ], [ 'a', '1' ] ];
      const { filters, query } = filter({ $sort });

      expect(filters.$sort).to.deep.equal($sort);
      expect(query).to.deep.equal({});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filter(query);
      expect(filters.$sort).to.equal(undefined);
    });
  });

  describe('$limit', function () {
    beforeEach(function () {
      this.query = { $limit: 1 };
    });

    it('returns $limit when present in query', function () {
      const { filters, query } = filter(this.query);
      expect(filters.$limit).to.equal(1);
      expect(query).to.deep.equal({});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filter(query);
      expect(filters.$limit).to.equal(undefined);
    });

    it('removes $limit from query when present', function () {
      expect(filter(this.query).query).to.deep.equal({});
    });

    it('parses $limit strings into integers (#4)', function () {
      const { filters } = filter({ $limit: '2' });
      expect(filters.$limit).to.equal(2);
    });

    it('allows $limit 0', function () {
      const { filters } = filter({ $limit: 0 }, { default: 10 });
      expect(filters.$limit).to.equal(0);
    });

    describe('pagination', function () {
      it('limits with default pagination', function () {
        const { filters } = filter({}, { paginate: { default: 10 } });
        expect(filters.$limit).to.equal(10);
      });

      it('limits with max pagination', function () {
        const { filters } = filter({ $limit: 20 }, { paginate: { default: 5, max: 10 } });
        const { filters: filtersNeg } = filter({ $limit: -20 }, { paginate: { default: 5, max: 10 } });
        expect(filters.$limit).to.equal(10);
        expect(filtersNeg.$limit).to.equal(10);
      });
    });
  });

  describe('$skip', function () {
    beforeEach(function () {
      this.query = { $skip: 1 };
    });

    it('returns $skip when present in query', function () {
      const { filters } = filter(this.query);
      expect(filters.$skip).to.equal(1);
    });

    it('removes $skip from query when present', function () {
      expect(filter(this.query).query).to.deep.equal({});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filter(query);
      expect(filters.$skip).to.equal(undefined);
    });

    it('parses $skip strings into integers (#4)', function () {
      const { filters } = filter({ $skip: '33' });
      expect(filters.$skip).to.equal(33);
    });
  });

  describe('$select', function () {
    beforeEach(function () {
      this.query = { $select: 1 };
    });

    it('returns $select when present in query', function () {
      const { filters } = filter(this.query);
      expect(filters.$select).to.equal(1);
    });

    it('removes $select from query when present', function () {
      expect(filter(this.query).query).to.deep.equal({});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filter(query);
      expect(filters.$select).to.equal(undefined);
    });
  });

  describe('additional filters', () => {
    beforeEach(function () {
      this.query = { $select: 1, $known: 1, $unknown: 1 };
    });

    it('returns only default filters when no additionals', function () {
      const { filters } = filter(this.query);
      expect(filters).to.include({ $select: 1 }).and.to.not.have.any.keys('$known', '$unknown');
    });

    it('returns default and known additional filters (array)', function () {
      const { filters } = filter(this.query, { filters: [ '$known' ] });
      expect(filters).to.include({ $select: 1, $known: 1 }).and.to.not.have.key('$unknown');
    });

    it('returns default and known additional filters (object)', function () {
      const { filters } = filter(this.query, { filters: { $known: (value) => value.toString() } });
      expect(filters).to.include({ $select: 1, $known: '1' }).and.to.not.have.key('$unknown');
    });
  });

  describe('additional operators', () => {
    beforeEach(function () {
      this.query = { $ne: 1, $known: 1, $unknown: 1 };
    });

    it('returns query with only default operators when no additionals', function () {
      const { query } = filter(this.query);
      expect(query).to.include({ $ne: 1 }).and.to.not.have.any.keys('$known', '$unknown');
    });

    it('returns query with default and known additional operators', function () {
      const { query } = filter(this.query, { operators: [ '$known' ] });
      expect(query).to.eql({ $ne: 1, $known: 1 }).and.to.not.have.key('$unknown');
    });

    it('returns query with default and known additional operators (nested)', function () {
      const { query } = filter({ field: this.query }, { operators: [ '$known' ] });
      expect(query).to.deep.include({ field: { $ne: 1, $known: 1 } }).and.to.not.have.nested.property('field.$unknown');
    });
  });
});
