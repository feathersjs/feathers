const chai = require('chai');
const filter = require('../lib/filter-query');

const expect = chai.expect;

describe('.filterQuery', function () {
  describe('$sort', function () {
    it('returns $sort when present in query', function () {
      const { filters, query } = filter({ $sort: { name: 1 } });
      expect(filters.$sort.name).to.equal(1);
      expect(query).to.deep.equal({});
    });

    it('returns $sort when present in query as an object', function () {
      const { filters, query } = filter({ $sort: { name: {something: 10} } });
      expect(filters.$sort.name.something).to.equal(10);
      expect(query).to.deep.equal({});
    });

    it('converts strings in $sort', function () {
      const { filters, query } = filter({ $sort: { test: '-1' } });
      expect(filters.$sort.test).to.equal(-1);
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
        const { filters } = filter({}, { default: 10 });
        expect(filters.$limit).to.equal(10);
      });

      it('limits with max pagination', function () {
        const { filters } = filter({ $limit: 20 }, { default: 5, max: 10 });
        const { filters: filtersNeg } = filter({ $limit: -20 }, { default: 5, max: 10 });
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

  describe('$populate', function () {
    beforeEach(function () {
      this.query = { $populate: 1 };
    });

    it('returns $populate when present in query', function () {
      const { filters } = filter(this.query);
      expect(filters.$populate).to.equal(1);
    });

    it('removes $populate from query when present', function () {
      expect(filter(this.query).query).to.deep.equal({});
    });

    it('returns undefined when not present in query', function () {
      const query = { $foo: 1 };
      const { filters } = filter(query);
      expect(filters.$populate).to.equal(undefined);
    });
  });
});
