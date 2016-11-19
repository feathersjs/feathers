if (!global._babelPolyfill) { require('babel-polyfill'); }

import { expect } from 'chai';
import {
  getArguments,
  stripSlashes,
  hooks,
  _,
  matcher,
  sorter,
  select,
  // lodash methods
  each,
  some,
  every,
  keys,
  values,
  isMatch,
  isEmpty,
  isObject,
  extend,
  omit,
  pick,
  merge
} from '../src/commons';

describe('build', () => {
  it('is commonjs compatible', () => {
    let commons = require('../lib/commons');
    expect(typeof commons).to.equal('object');
    expect(typeof commons.getArguments).to.equal('function');
    expect(typeof commons.stripSlashes).to.equal('function');
    expect(typeof commons.matcher).to.equal('function');
    expect(typeof commons.sorter).to.equal('function');
    expect(typeof commons.select).to.equal('function');
    expect(typeof commons.hooks).to.equal('object');
    expect(typeof commons._).to.equal('object');
  });

  it('is es6 compatible', () => {
    expect(typeof getArguments).to.equal('function');
    expect(typeof stripSlashes).to.equal('function');
    expect(typeof matcher).to.equal('function');
    expect(typeof sorter).to.equal('function');
    expect(typeof select).to.equal('function');
    expect(typeof hooks).to.equal('object');
    expect(typeof _).to.equal('object');
  });

  it('exposes lodash methods top level', () => {
    expect(typeof each).to.equal('function');
    expect(typeof some).to.equal('function');
    expect(typeof every).to.equal('function');
    expect(typeof keys).to.equal('function');
    expect(typeof values).to.equal('function');
    expect(typeof isMatch).to.equal('function');
    expect(typeof isEmpty).to.equal('function');
    expect(typeof isObject).to.equal('function');
    expect(typeof extend).to.equal('function');
    expect(typeof omit).to.equal('function');
    expect(typeof pick).to.equal('function');
    expect(typeof merge).to.equal('function');
  });

  it('exposes lodash methods under _', () => {
    expect(typeof _.each).to.equal('function');
    expect(typeof _.some).to.equal('function');
    expect(typeof _.every).to.equal('function');
    expect(typeof _.keys).to.equal('function');
    expect(typeof _.values).to.equal('function');
    expect(typeof _.isMatch).to.equal('function');
    expect(typeof _.isEmpty).to.equal('function');
    expect(typeof _.isObject).to.equal('function');
    expect(typeof _.extend).to.equal('function');
    expect(typeof _.omit).to.equal('function');
    expect(typeof _.pick).to.equal('function');
    expect(typeof _.merge).to.equal('function');
  });
});
