if (!global._babelPolyfill) { require('babel-polyfill'); }

import feathers from 'feathers';
import { expect } from 'chai';
import {
  _,
  specialFilters,
  sorter,
  matcher,
  stripSlashes,
  select,
  makeUrl
} from '../src/utils';

describe('feathers-commons utils', () => {
  it('stripSlashes', () => {
    expect(stripSlashes('some/thing')).to.equal('some/thing');
    expect(stripSlashes('/some/thing')).to.equal('some/thing');
    expect(stripSlashes('some/thing/')).to.equal('some/thing');
    expect(stripSlashes('/some/thing/')).to.equal('some/thing');
    expect(stripSlashes('//some/thing/')).to.equal('some/thing');
    expect(stripSlashes('//some//thing////')).to.equal('some//thing');
  });

  describe('_', () => {
    it('each', () => {
      _.each({ hi: 'there' }, (value, key) => {
        expect(key).to.equal('hi');
        expect(value).to.equal('there');
      });

      _.each([ 'hi' ], (value, key) => {
        expect(key).to.equal(0);
        expect(value).to.equal('hi');
      });
    });

    it('some', () => {
      expect(_.some([ 'a', 'b' ], current => current === 'a')).to.be.ok;
      expect(!_.some([ 'a', 'b' ], current => current === 'c')).to.be.ok;
    });

    it('every', () => {
      expect(_.every([ 'a', 'a' ], current => current === 'a')).to.be.ok;
      expect(!_.every([ 'a', 'b' ], current => current === 'a')).to.be.ok;
    });

    it('keys', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.keys(data)).to.deep.equal([ 'hi', 'name' ]);
    });

    it('values', () => {
      const data = { hi: 'there', name: 'David' };
      expect(_.values(data)).to.deep.equal([ 'there', 'David' ]);
    });

    it('isMatch', () => {
      expect(_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'you'
      })).to.be.ok;

      expect(!_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'there'
      })).to.be.ok;
    });

    it('isEmpty', () => {
      expect(_.isEmpty({})).to.be.ok;
      expect(!_.isEmpty({ name: 'David' })).to.be.ok;
    });

    it('extend', () => {
      expect(_.extend({ hi: 'there' }, { name: 'david' })).to.deep.equal({
        hi: 'there',
        name: 'david'
      });
    });

    it('omit', () => {
      expect(_.omit({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).to.deep.equal({
        name: 'David'
      });
    });

    it('pick', () => {
      expect(_.pick({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second')).to.deep.equal({
        first: 1,
        second: 2
      });
    });
  });

  describe('select', () => {
    it('select', () => {
      const selector = select({
        query: { $select: ['name', 'age'] }
      });

      return Promise.resolve({
        name: 'David',
        age: 3,
        test: 'me'
      })
      .then(selector)
      .then(result => expect(result).to.deep.equal({
        name: 'David',
        age: 3
      }));
    });

    it('select with arrays', () => {
      const selector = select({
        query: { $select: ['name', 'age'] }
      });

      return Promise.resolve([{
        name: 'David',
        age: 3,
        test: 'me'
      }, {
        name: 'D',
        age: 4,
        test: 'you'
      }])
      .then(selector)
      .then(result => expect(result).to.deep.equal([{
        name: 'David',
        age: 3
      }, {
        name: 'D',
        age: 4
      }]));
    });

    it('select with no query', () => {
      const selector = select({});
      const data = {
        name: 'David'
      };

      return Promise.resolve(data)
      .then(selector)
      .then(result => expect(result).to.deep.equal(data));
    });

    it('select with other fields', () => {
      const selector = select({
        query: { $select: [ 'name' ] }
      }, 'id');
      const data = {
        id: 'me',
        name: 'David',
        age: 10
      };

      return Promise.resolve(data)
      .then(selector)
      .then(result => expect(result).to.deep.equal({
        id: 'me',
        name: 'David'
      }));
    });
  });

  describe('specialFilters', () => {
    const filters = specialFilters;

    it('$in', () => {
      const fn = filters.$in('test', ['a', 'b']);

      expect(fn({ test: 'a' })).to.be.ok;
      expect(!fn({ test: 'c' })).to.be.ok;
    });

    it('$nin', () => {
      const fn = filters.$nin('test', ['a', 'b']);

      expect(!fn({ test: 'a' })).to.be.ok;
      expect(fn({ test: 'c' })).to.be.ok;
    });

    it('$lt', () => {
      const fn = filters.$lt('age', 25);

      expect(fn({ age: 24 })).to.be.ok;
      expect(!fn({ age: 25 })).to.be.ok;
      expect(!fn({ age: 26 })).to.be.ok;
    });

    it('$lte', () => {
      const fn = filters.$lte('age', 25);

      expect(fn({ age: 24 })).to.be.ok;
      expect(fn({ age: 25 })).to.be.ok;
      expect(!fn({ age: 26 })).to.be.ok;
    });

    it('$gt', () => {
      const fn = filters.$gt('age', 25);

      expect(!fn({ age: 24 })).to.be.ok;
      expect(!fn({ age: 25 })).to.be.ok;
      expect(fn({ age: 26 })).to.be.ok;
    });

    it('$gte', () => {
      const fn = filters.$gte('age', 25);

      expect(!fn({ age: 24 })).to.be.ok;
      expect(fn({ age: 25 })).to.be.ok;
      expect(fn({ age: 26 })).to.be.ok;
    });

    it('$ne', () => {
      const fn = filters.$ne('test', 'me');

      expect(fn({ test: 'you' })).to.be.ok;
      expect(!fn({ test: 'me' })).to.be.ok;
    });
  });

  describe('sorter', () => {
    it('simple sorter', () => {
      const array = [{
        name: 'David'
      }, {
        name: 'Eric'
      }];

      const sort = sorter({
        name: -1
      });

      expect(array.sort(sort)).to.deep.equal([{
        name: 'Eric'
      }, {
        name: 'David'
      }]);
    });

    it('two property sorter', () => {
      const array = [{
        name: 'David',
        counter: 0
      }, {
        name: 'Eric',
        counter: 1
      }, {
        name: 'David',
        counter: 1
      }, {
        name: 'Eric',
        counter: 0
      }];

      const sort = sorter({
        name: -1,
        counter: 1
      });

      expect(array.sort(sort)).to.deep.equal([
        { name: 'Eric', counter: 0 },
        { name: 'David', counter: 0 },
        { name: 'Eric', counter: 1 },
        { name: 'David', counter: 1 }
      ]);
    });
  });

  describe('matcher', () => {
    it('simple match', () => {
      const matches = matcher({ name: 'Eric' });

      expect(matches({ name: 'Eric' })).to.be.ok;
      expect(!matches({ name: 'David' })).to.be.ok;
    });

    it('does not match $select', () => {
      const matches = matcher({ $select: [ 'name' ] });
      expect(matches({ name: 'Eric' })).to.be.ok;
    });

    it('$or match', () => {
      const matches = matcher({ $or: [{ name: 'Eric' }, { name: 'Marshall' }] });

      expect(matches({ name: 'Eric' })).to.be.ok;
      expect(matches({ name: 'Marshall' })).to.be.ok;
      expect(!matches({ name: 'David' })).to.be.ok;
    });

    it('$or nested match', () => {
      const matches = matcher({
        $or: [
          { name: 'Eric' },
          { age: { $gt: 18, $lt: 32 } }
        ]
      });

      expect(matches({ name: 'Eric' })).to.be.ok;
      expect(matches({ age: 20 })).to.be.ok;
      expect(matches({ name: 'David', age: 30 })).to.be.ok;
      expect(!matches({ name: 'David', age: 64 })).to.be.ok;
    });

    it('special filter matches', () => {
      const matches = matcher({
        counter: { $gt: 10, $lte: 19 },
        name: { $in: ['Eric', 'Marshall'] }
      });

      expect(matches({ name: 'Eric', counter: 12 })).to.be.ok;
      expect(!matches({ name: 'Eric', counter: 10 })).to.be.ok;
      expect(matches({ name: 'Marshall', counter: 19 })).to.be.ok;
    });

    it('special filter and simple matches', () => {
      const matches = matcher({
        counter: 0,
        name: { $in: ['Eric', 'Marshall'] }
      });

      expect(!matches({ name: 'Eric', counter: 1 })).to.be.ok;
      expect(matches({ name: 'Marshall', counter: 0 })).to.be.ok;
    });
  });

  describe('makeUrl', function () {
    let mockApp;

    beforeEach(() => {
      mockApp = { env: 'development' };
      mockApp.get = (value) => {
        switch (value) {
          case 'port':
            return 3030;
          case 'host':
            return 'feathersjs.com';
          case 'env':
            return mockApp.env;
        }
      };
    });

    describe('when in development mode', () => {
      it('returns the correct url', () => {
        const uri = makeUrl('test', mockApp);
        expect(uri).to.equal('http://feathersjs.com:3030/test');
      });
    });

    describe('when in test mode', () => {
      it('returns the correct url', () => {
        mockApp.env = 'test';
        const uri = makeUrl('test', mockApp);
        expect(uri).to.equal('http://feathersjs.com:3030/test');
      });
    });

    describe('when in production mode', () => {
      it('returns the correct url', () => {
        mockApp.env = 'production';
        const uri = makeUrl('test', mockApp);
        expect(uri).to.equal('https://feathersjs.com/test');
      });
    });

    describe('when path is not provided', () => {
      it('returns a default url', () => {
        const uri = makeUrl(null, mockApp);
        expect(uri).to.equal('http://feathersjs.com:3030/');
      });
    });

    describe('when app is not defined', () => {
      it('returns the correct url', () => {
        const uri = makeUrl('test');
        expect(uri).to.equal('http://localhost:3030/test');
      });
    });

    describe('works with an app instance', () => {
      it('returns the correct url', () => {
        const uri = makeUrl('test', feathers());
        expect(uri).to.equal('http://localhost:3030/test');
      });
    });

    it('strips leading slashes on path', () => {
      const uri = makeUrl('/test');
      expect(uri).to.equal('http://localhost:3030/test');
    });

    it('strips trailing slashes on path', () => {
      const uri = makeUrl('test/');
      expect(uri).to.equal('http://localhost:3030/test');
    });

    it('works with query strings', () => {
      const uri = makeUrl('test?admin=true');
      expect(uri).to.equal('http://localhost:3030/test?admin=true');
    });
  });
});
