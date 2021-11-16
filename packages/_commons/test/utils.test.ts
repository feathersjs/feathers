/* tslint:disable:no-unused-expression */
import { strict as assert } from 'assert';
import { _, stripSlashes, isPromise, createSymbol } from '../src';

describe('@feathersjs/commons utils', () => {
  it('stripSlashes', () => {
    assert.equal(stripSlashes('some/thing'), 'some/thing');
    assert.equal(stripSlashes('/some/thing'), 'some/thing');
    assert.equal(stripSlashes('some/thing/'), 'some/thing');
    assert.equal(stripSlashes('/some/thing/'), 'some/thing');
    assert.equal(stripSlashes('//some/thing/'), 'some/thing');
    assert.equal(stripSlashes('//some//thing////'), 'some//thing');
  });

  it('isPromise', () => {
    assert.equal(isPromise(Promise.resolve()), true);
    assert.ok(isPromise({
      then () {}
    }));
    assert.equal(isPromise(null), false);
  });

  it('createSymbol', () => {
    assert.equal(typeof createSymbol('a test'), 'symbol');
  });

  describe('_', () => {
    it('isObject', () => {
      assert.equal(_.isObject({}), true);
      assert.equal(_.isObject([]), false);
      assert.equal(_.isObject(null), false);
    });

    it('isObjectOrArray', () => {
      assert.equal(_.isObjectOrArray({}), true);
      assert.equal(_.isObjectOrArray([]), true);
      assert.equal(_.isObjectOrArray(null), false);
    });

    it('each', () => {
      _.each({ hi: 'there' }, (value, key) => {
        assert.equal(key, 'hi');
        assert.equal(value, 'there');
      });

      _.each([ 'hi' ], (value, key) => {
        assert.equal(key, 0);
        assert.equal(value, 'hi');
      });

      _.each('moo', () => assert.fail('Should never get here'));
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

      assert.deepEqual(_.pick({
        name: 'David',
        first: 1
      }, 'first', 'second'), {
        first: 1
      });
    });

    it('merge', () => {
      assert.deepEqual(_.merge({ hi: 'there' }, { name: 'david' }), {
        hi: 'there',
        name: 'david'
      });

      assert.deepEqual(_.merge({}, {
        name: 'david',
        nested: { obj: true }
      }), {
        name: 'david',
        nested: { obj: true }
      });

      assert.deepEqual(_.merge({ name: 'david' }, {}), {
        name: 'david'
      });

      assert.deepEqual(_.merge({
        hi: 'there',
        my: {
          name: { is: 'david' },
          number: { is: 1 }
        }
      }, { my: { name: { is: 'eric' } } }), {
        hi: 'there',
        my: {
          number: { is: 1 },
          name: { is: 'eric' }
        }
      });

      assert.equal(_.merge('hello', {}), 'hello');
    });
  });
});
