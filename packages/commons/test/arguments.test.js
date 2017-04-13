/* eslint-disable no-unused-expressions */

if (!global._babelPolyfill) { require('babel-polyfill'); }

import { expect } from 'chai';
import getArguments, { noop } from '../src/arguments';

describe('Argument normalization tests', () => {
  const params = { test: 'param' };
  const callback = function () {};

  it('find', () => {
    let normal = [ params, callback ];
    let args = getArguments('find', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('find', [ params ]);
    expect(args).to.deep.equal([ params, noop ]);

    args = getArguments('find', [callback]);
    expect(args).to.deep.equal([ {}, callback ]);

    args = getArguments('find', []);
    expect(args).to.deep.equal([ {}, noop ]);

    try {
      getArguments('find', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'find\' service method');
    }
  });

  it('get', () => {
    let normal = [1, params, callback];
    let args = getArguments('get', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('get', [2, params]);
    expect(args).to.deep.equal([2, params, noop]);

    args = getArguments('get', [3, callback]);
    expect(args).to.deep.equal([3, {}, callback]);

    args = getArguments('get', [4]);
    expect(args).to.deep.equal([4, {}, noop]);

    try {
      getArguments('get', [callback]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('First parameter for \'get\' can not be a function');
    }

    try {
      getArguments('get', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'get\' service method');
    }
  });

  it('remove', () => {
    let normal = [1, params, callback];
    let args = getArguments('remove', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('remove', [2, params]);
    expect(args).to.deep.equal([2, params, noop]);

    args = getArguments('remove', [3, callback]);
    expect(args).to.deep.equal([3, {}, callback]);

    args = getArguments('remove', [4]);
    expect(args).to.deep.equal([4, {}, noop]);

    try {
      args = getArguments('remove', [callback]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('First parameter for \'remove\' can not be a function');
    }

    try {
      getArguments('remove', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'remove\' service method');
    }
  });

  it('create', () => {
    let data = { test: 'Data' };
    let normal = [data, params, callback];
    let args = getArguments('create', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('create', [data, callback]);
    expect(args).to.deep.equal([data, {}, callback]);

    args = getArguments('create', [data, params]);
    expect(args).to.deep.equal([data, params, noop]);

    args = getArguments('create', [data]);
    expect(args).to.deep.equal([data, {}, noop]);

    try {
      getArguments('create', [callback]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('First parameter for \'create\' must be an object');
    }

    try {
      getArguments('create', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'create\' service method');
    }
  });

  it('update', () => {
    let data = { test: 'Data' };
    let normal = [1, data, params, callback];
    let args = getArguments('update', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('update', [2, data, callback]);
    expect(args).to.deep.equal([2, data, {}, callback]);

    args = getArguments('update', [3, data, params]);
    expect(args).to.deep.equal([3, data, params, noop]);

    args = getArguments('update', [4, data]);
    expect(args).to.deep.equal([4, data, {}, noop]);

    try {
      getArguments('update', [callback]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('First parameter for \'update\' can not be a function');
    }

    try {
      getArguments('update', [5]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('No data provided for \'update\'');
    }

    try {
      getArguments('update', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'update\' service method');
    }
  });

  it('patch', () => {
    let data = { test: 'Data' };
    let normal = [1, data, params, callback];
    let args = getArguments('patch', normal);

    expect(args).to.deep.equal(normal);

    args = getArguments('patch', [2, data, callback]);
    expect(args).to.deep.equal([2, data, {}, callback]);

    args = getArguments('patch', [3, data, params]);
    expect(args).to.deep.equal([3, data, params, noop]);

    args = getArguments('patch', [4, data]);
    expect(args).to.deep.equal([4, data, {}, noop]);

    try {
      getArguments('patch', [callback]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('First parameter for \'patch\' can not be a function');
    }

    try {
      getArguments('patch', [5]);
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('No data provided for \'patch\'');
    }

    try {
      getArguments('patch', normal.concat(['too many']));
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).equal('Too many arguments for \'patch\' service method');
    }
  });
});
