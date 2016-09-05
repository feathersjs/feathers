if(!global._babelPolyfill) { require('babel-polyfill'); }

import assert from 'assert';
import * as utils from '../src/utils';

describe('feathers-commons utils', () => {
  it('stripSlashes', () => {
    assert.equal(utils.stripSlashes('some/thing'), 'some/thing');
    assert.equal(utils.stripSlashes('/some/thing'), 'some/thing');
    assert.equal(utils.stripSlashes('some/thing/'), 'some/thing');
    assert.equal(utils.stripSlashes('/some/thing/'), 'some/thing');
    assert.equal(utils.stripSlashes('//some/thing/'), 'some/thing');
    assert.equal(utils.stripSlashes('//some//thing////'), 'some//thing');
  });

  describe('specialFilters', () => {
    const filters = utils.specialFilters;

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

      const sorter = utils.sorter({
        name: -1
      });

      assert.deepEqual(array.sort(sorter), [{
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

      const sorter = utils.sorter({
        name: -1,
        counter: 1
      });

      assert.deepEqual(array.sort(sorter), [
        { name: 'Eric', counter: 0 },
        { name: 'David', counter: 0 },
        { name: 'Eric', counter: 1 },
        { name: 'David', counter: 1 }
      ]);
    });
  });

  describe('matcher', () => {
    it('simple match', () => {
      const matches = utils.matcher({ name: 'Eric' });

      assert.ok(matches({ name: 'Eric' }));
      assert.ok(!matches({ name: 'David' }));
    });

    it('$or match', () => {
      const matches = utils.matcher({ $or: [{ name: 'Eric' }, { name: 'Marshall' }] });

      assert.ok(matches({ name: 'Eric' }));
      assert.ok(matches({ name: 'Marshall' }));
      assert.ok(!matches({ name: 'David' }));
    });

    it('$or nested match', () => {
      const matches = utils.matcher({
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
      const matches = utils.matcher({
        counter: { $gt: 10, $lte: 19 },
        name: { $in: ['Eric', 'Marshall'] }
      });

      assert.ok(matches({ name: 'Eric', counter: 12 }));
      assert.ok(!matches({ name: 'Eric', counter: 10 }));
      assert.ok(matches({ name: 'Marshall', counter: 19 }));
    });

    it('special filter and simple matches', () => {
      const matches = utils.matcher({
        counter: 0,
        name: { $in: ['Eric', 'Marshall'] }
      });

      assert.ok(!matches({ name: 'Eric', counter: 1 }));
      assert.ok(matches({ name: 'Marshall', counter: 0 }));
    });
  });
});
