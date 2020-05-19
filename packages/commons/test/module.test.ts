import { strict as assert } from 'assert';
import { _ } from '../src';

describe('module', () => {
  it('is commonjs compatible', () => {
    const commons = require('../lib');

    assert.equal(typeof commons, 'object');
    assert.equal(typeof commons.stripSlashes, 'function');
    assert.equal(typeof commons._, 'object');
  });

  it('exposes lodash methods under _', () => {
    assert.equal(typeof _.each, 'function');
    assert.equal(typeof _.some, 'function');
    assert.equal(typeof _.every, 'function');
    assert.equal(typeof _.keys, 'function');
    assert.equal(typeof _.values, 'function');
    assert.equal(typeof _.isMatch, 'function');
    assert.equal(typeof _.isEmpty, 'function');
    assert.equal(typeof _.isObject, 'function');
    assert.equal(typeof _.extend, 'function');
    assert.equal(typeof _.omit, 'function');
    assert.equal(typeof _.pick, 'function');
    assert.equal(typeof _.merge, 'function');
  });
});
