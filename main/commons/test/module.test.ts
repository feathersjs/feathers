import { it, assertStrictEquals } from '../src/testing.ts';
import { _ } from '../src/index.ts';
import * as commons from '../src/index.ts'

it('commons: is commonjs compatible', () => {
  assertStrictEquals(typeof commons, 'object');
  assertStrictEquals(typeof commons.stripSlashes, 'function');
  assertStrictEquals(typeof commons._, 'object');
});

it('commons: exposes lodash methods under _', () => {
  assertStrictEquals(typeof _.each, 'function');
  assertStrictEquals(typeof _.some, 'function');
  assertStrictEquals(typeof _.every, 'function');
  assertStrictEquals(typeof _.keys, 'function');
  assertStrictEquals(typeof _.values, 'function');
  assertStrictEquals(typeof _.isMatch, 'function');
  assertStrictEquals(typeof _.isEmpty, 'function');
  assertStrictEquals(typeof _.isObject, 'function');
  assertStrictEquals(typeof _.extend, 'function');
  assertStrictEquals(typeof _.omit, 'function');
  assertStrictEquals(typeof _.pick, 'function');
  assertStrictEquals(typeof _.merge, 'function');
});
