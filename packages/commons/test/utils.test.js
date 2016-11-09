if (!global._babelPolyfill) { require('babel-polyfill'); }

import assert from 'assert';
import {
  _, specialFilters, sorter, matcher,
  stripSlashes, select, selectMany
} from '../src/utils';

describe('feathers-commons utils', () => {
  it('stripSlashes', () => {
    assert.equal(stripSlashes('some/thing'), 'some/thing');
    assert.equal(stripSlashes('/some/thing'), 'some/thing');
    assert.equal(stripSlashes('some/thing/'), 'some/thing');
    assert.equal(stripSlashes('/some/thing/'), 'some/thing');
    assert.equal(stripSlashes('//some/thing/'), 'some/thing');
    assert.equal(stripSlashes('//some//thing////'), 'some//thing');
  });

  describe('_', () => {
    it('each', () => {
      _.each({ hi: 'there' }, (value, key) => {
        assert.equal(key, 'hi');
        assert.equal(value, 'there');
      });

      _.each([ 'hi' ], (value, key) => {
        assert.equal(key, 0);
        assert.equal(value, 'hi');
      });
    });

    it('some', () => {
      assert.ok(_.some([ 'a', 'b' ], current => current === 'a'));
      assert.ok(!_.some([ 'a', 'b' ], current => current === 'c'));
    });

    it('every', () => {
      assert.ok(_.every([ 'a', 'a' ], current => current === 'a'));
      assert.ok(!_.every([ 'a', 'b' ], current => current === 'a'));
    });

    it('keys', () => {
      const data = { hi: 'there', name: 'David' };

      assert.deepEqual(_.keys(data), [ 'hi', 'name' ]);
    });

    it('values', () => {
      const data = { hi: 'there', name: 'David' };

      assert.deepEqual(_.values(data), [ 'there', 'David' ]);
    });

    it('isMatch', () => {
      assert.ok(_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'you'
      }));

      assert.ok(!_.isMatch({
        test: 'me', hi: 'you', more: true
      }, {
        test: 'me', hi: 'there'
      }));
    });

    it('isEmpty', () => {
      assert.ok(_.isEmpty({}));
      assert.ok(!_.isEmpty({ name: 'David' }));
    });

    it('extend', () => {
      assert.deepEqual(_.extend({ hi: 'there' }, { name: 'david' }), {
        hi: 'there',
        name: 'david'
      });
    });

    it('omit', () => {
      assert.deepEqual(_.omit({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second'), {
        name: 'David'
      });
    });

    it('pick', () => {
      assert.deepEqual(_.pick({
        name: 'David',
        first: 1,
        second: 2
      }, 'first', 'second'), {
        first: 1,
        second: 2
      });
    });
  });

  describe('selecting', () => {
    it('select', () => {
      const selector = select('name', 'age');

      return Promise.resolve({
        name: 'David',
        age: 3,
        test: 'me'
      })
      .then(selector)
      .then(result => assert.deepEqual(result, {
        name: 'David',
        age: 3
      }));
    });

    it('selectMany', () => {
      const selector = selectMany('name', 'age');

      return Promise.resolve([{
        name: 'David',
        age: 3,
        test: 'me'
      }])
      .then(selector)
      .then(result => assert.deepEqual(result, [{
        name: 'David',
        age: 3
      }]));
    });

    it('selectMany paginated', () => {
      const selector = selectMany('name', 'age');

      return Promise.resolve({
        data: [{
          name: 'David',
          age: 3,
          test: 'me'
        }]
      })
      .then(selector)
      .then(result => assert.deepEqual(result, {
        data: [{
          name: 'David',
          age: 3
        }]
      }));
    });
  });

  describe('specialFilters', () => {
    const filters = specialFilters;

    it('$in', () => {
      const fn = filters.$in('test', ['a', 'b']);

      assert.ok(fn({ test: 'a' }));
      assert.ok(!fn({ test: 'c' }));
    });

    it('$nin', () => {
      const fn = filters.$nin('test', ['a', 'b']);

      assert.ok(!fn({ test: 'a' }));
      assert.ok(fn({ test: 'c' }));
    });

    it('$lt', () => {
      const fn = filters.$lt('age', 25);

      assert.ok(fn({ age: 24 }));
      assert.ok(!fn({ age: 25 }));
      assert.ok(!fn({ age: 26 }));
    });

    it('$lte', () => {
      const fn = filters.$lte('age', 25);

      assert.ok(fn({ age: 24 }));
      assert.ok(fn({ age: 25 }));
      assert.ok(!fn({ age: 26 }));
    });

    it('$gt', () => {
      const fn = filters.$gt('age', 25);

      assert.ok(!fn({ age: 24 }));
      assert.ok(!fn({ age: 25 }));
      assert.ok(fn({ age: 26 }));
    });

    it('$gte', () => {
      const fn = filters.$gte('age', 25);

      assert.ok(!fn({ age: 24 }));
      assert.ok(fn({ age: 25 }));
      assert.ok(fn({ age: 26 }));
    });

    it('$ne', () => {
      const fn = filters.$ne('test', 'me');

      assert.ok(fn({ test: 'you' }));
      assert.ok(!fn({ test: 'me' }));
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

      assert.deepEqual(array.sort(sort), [{
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

      assert.deepEqual(array.sort(sort), [
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

      assert.ok(matches({ name: 'Eric' }));
      assert.ok(!matches({ name: 'David' }));
    });

    it('does not match $select', () => {
      const matches = matcher({ $select: [ 'name' ] });

      assert.ok(matches({ name: 'Eric' }));
    });

    it('$or match', () => {
      const matches = matcher({ $or: [{ name: 'Eric' }, { name: 'Marshall' }] });

      assert.ok(matches({ name: 'Eric' }));
      assert.ok(matches({ name: 'Marshall' }));
      assert.ok(!matches({ name: 'David' }));
    });

    it('$or nested match', () => {
      const matches = matcher({
        $or: [
          { name: 'Eric' },
          { age: { $gt: 18, $lt: 32 } }
        ]
      });

      assert.ok(matches({ name: 'Eric' }));
      assert.ok(matches({ age: 20 }));
      assert.ok(matches({
        name: 'David',
        age: 30
      }));
      assert.ok(!matches({
        name: 'David',
        age: 64
      }));
    });

    it('special filter matches', () => {
      const matches = matcher({
        counter: { $gt: 10, $lte: 19 },
        name: { $in: ['Eric', 'Marshall'] }
      });

      assert.ok(matches({ name: 'Eric', counter: 12 }));
      assert.ok(!matches({ name: 'Eric', counter: 10 }));
      assert.ok(matches({ name: 'Marshall', counter: 19 }));
    });

    it('special filter and simple matches', () => {
      const matches = matcher({
        counter: 0,
        name: { $in: ['Eric', 'Marshall'] }
      });

      assert.ok(!matches({ name: 'Eric', counter: 1 }));
      assert.ok(matches({ name: 'Marshall', counter: 0 }));
    });
  });
});
