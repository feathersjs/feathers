/* tslint:disable:no-unused-expression */
import { it, assert, assertEquals, assertStrictEquals } from '../src/testing.ts';
import { _, stripSlashes, isPromise, createSymbol } from '../src/index.ts';

it('stripSlashes', () => {
  assertStrictEquals(stripSlashes('some/thing'), 'some/thing');
  assertStrictEquals(stripSlashes('/some/thing'), 'some/thing');
  assertStrictEquals(stripSlashes('some/thing/'), 'some/thing');
  assertStrictEquals(stripSlashes('/some/thing/'), 'some/thing');
  assertStrictEquals(stripSlashes('//some/thing/'), 'some/thing');
  assertStrictEquals(stripSlashes('//some//thing////'), 'some//thing');
});

it('isPromise', () => {
  assertStrictEquals(isPromise(Promise.resolve()), true);
  assert(isPromise({
    then () {}
  }));
  assertStrictEquals(isPromise(null), false);
});

it('createSymbol', () => {
  assertStrictEquals(typeof createSymbol('a test'), 'symbol');
});

it('isObject', () => {
  assertStrictEquals(_.isObject({}), true);
  assertStrictEquals(_.isObject([]), false);
  assertStrictEquals(_.isObject(null), false);
});

it('isObjectOrArray', () => {
  assertStrictEquals(_.isObjectOrArray({}), true);
  assertStrictEquals(_.isObjectOrArray([]), true);
  assertStrictEquals(_.isObjectOrArray(null), false);
});

it('each', () => {
  _.each({ hi: 'there' }, (value, key) => {
    assertStrictEquals(key, 'hi');
    assertStrictEquals(value, 'there');
  });

  _.each([ 'hi' ], (value, key) => {
    assertStrictEquals(key, 0);
    assertStrictEquals(value, 'hi');
  });

  _.each('moo', () => {
    throw new Error('Should never get here')
  });
});

it('some', () => {
  assert(_.some([ 'a', 'b' ], current => current === 'a'));
  assert(!_.some([ 'a', 'b' ], current => current === 'c'));
});

it('every', () => {
  assert(_.every([ 'a', 'a' ], current => current === 'a'));
  assert(!_.every([ 'a', 'b' ], current => current === 'a'));
});

it('keys', () => {
  const data = { hi: 'there', name: 'David' };
  assertEquals(_.keys(data), [ 'hi', 'name' ]);
});

it('values', () => {
  const data = { hi: 'there', name: 'David' };
  assertEquals(_.values(data), [ 'there', 'David' ]);
});

it('isMatch', () => {
  assert(_.isMatch({
    test: 'me', hi: 'you', more: true
  }, {
    test: 'me', hi: 'you'
  }));

  assert(!_.isMatch({
    test: 'me', hi: 'you', more: true
  }, {
    test: 'me', hi: 'there'
  }));
});

it('isEmpty', () => {
  assert(_.isEmpty({}));
  assert(!_.isEmpty({ name: 'David' }));
});

it('extend', () => {
  assertEquals(_.extend({ hi: 'there' }, { name: 'david' }), {
    hi: 'there',
    name: 'david'
  });
});

it('omit', () => {
  assertEquals(_.omit({
    name: 'David',
    first: 1,
    second: 2
  }, 'first', 'second'), {
    name: 'David'
  });
});

it('pick', () => {
  assertEquals(_.pick({
    name: 'David',
    first: 1,
    second: 2
  }, 'first', 'second'), {
    first: 1,
    second: 2
  });

  assertEquals(_.pick({
    name: 'David',
    first: 1
  }, 'first', 'second'), {
    first: 1
  });
});

it('merge', () => {
  assertEquals(_.merge({ hi: 'there' }, { name: 'david' }), {
    hi: 'there',
    name: 'david'
  });

  assertEquals(_.merge({}, {
    name: 'david',
    nested: { obj: true }
  }), {
    name: 'david',
    nested: { obj: true }
  });

  assertEquals(_.merge({ name: 'david' }, {}), {
    name: 'david'
  });

  assertEquals(_.merge({
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

  assertStrictEquals(_.merge('hello', {}), 'hello');
});
