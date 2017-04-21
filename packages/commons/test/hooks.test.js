import { expect } from 'chai';

import { noop } from '../src/arguments';
import utils from '../src/hooks';

if (!global._babelPolyfill) { require('babel-polyfill'); }

describe('hook utilities', () => {
  it('.hookObject', () => {
    let hookObject = utils.hookObject('find', 'test', [
      { some: 'thing' }, noop
    ]);
    // find
    expect(hookObject).to.deep.equal({
      params: { some: 'thing' },
      method: 'find',
      type: 'test',
      callback: noop
    });

    const dummyApp = function () {};

    hookObject = utils.hookObject('find', 'test', [
        { some: 'thing' }, noop
    ], dummyApp);

    expect(hookObject).to.deep.equal({
      params: { some: 'thing' },
      method: 'find',
      type: 'test',
      callback: noop,
      app: dummyApp
    });

    hookObject = utils.hookObject('find', 'test', [
        { some: 'thing' }, noop
    ], { test: 'me', other: true });

    expect(hookObject).to.deep.equal({
      params: { some: 'thing' },
      method: 'find',
      type: 'test',
      callback: noop,
      test: 'me',
      other: true
    });

    // get
    hookObject = utils.hookObject('get', 'test', [
      1, { some: 'thing' }, noop
    ]);

    expect(hookObject).to.deep.equal({
      id: 1,
      params: { some: 'thing' },
      method: 'get',
      type: 'test',
      callback: noop
    });

    // remove
    hookObject = utils.hookObject('remove', 'test', [
      1, { some: 'thing' }, noop
    ]);

    expect(hookObject).to.deep.equal({
      id: 1,
      params: { some: 'thing' },
      method: 'remove',
      type: 'test',
      callback: noop
    });

    // create
    hookObject = utils.hookObject('create', 'test', [
      { my: 'data' }, { some: 'thing' }, noop
    ]);

    expect(hookObject).to.deep.equal({
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'create',
      type: 'test',
      callback: noop
    });

    // update
    hookObject = utils.hookObject('update', 'test', [
      2, { my: 'data' }, { some: 'thing' }, noop
    ]);

    expect(hookObject).to.deep.equal({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      type: 'test',
      callback: noop
    });

    // patch
    hookObject = utils.hookObject('patch', 'test', [
      2, { my: 'data' }, { some: 'thing' }, noop
    ]);

    expect(hookObject).to.deep.equal({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'patch',
      type: 'test',
      callback: noop
    });
  });

  it('.makeArguments', () => {
    let args = utils.makeArguments({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      callback: noop
    });

    expect(args).to.deep.equal([2, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 0,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      callback: noop
    });

    expect(args).to.deep.equal([0, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      params: { some: 'thing' },
      method: 'find',
      callback: noop
    });

    expect(args).to.deep.equal([
      { some: 'thing' },
      noop
    ]);
  });

  it('.defaultMakeArguments', () => {
    let args = utils.makeArguments({
      params: { some: 'thing' },
      method: 'something',
      data: { test: 'me' },
      callback: noop
    });

    expect(args).to.deep.equal([
      { test: 'me' },
      { some: 'thing' },
      noop
    ]);

    args = utils.makeArguments({
      id: 'testing',
      method: 'something',
      callback: noop
    });

    expect(args).to.deep.equal([
      'testing', {}, noop
    ]);
  });

  it('.makeArguments makes correct argument list for known methods', () => {
    let args = utils.makeArguments({
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      callback: noop
    });

    expect(args).to.deep.equal([undefined, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'remove',
      callback: noop
    });

    expect(args).to.deep.equal([2, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'create',
      callback: noop
    });

    expect(args).to.deep.equal([{ my: 'data' }, { some: 'thing' }, noop]);
  });

  it('.convertHookData', () => {
    expect(utils.convertHookData('test')).to.deep.equal({
      all: [ 'test' ]
    });

    expect(utils.convertHookData([ 'test', 'me' ])).to.deep.equal({
      all: [ 'test', 'me' ]
    });

    expect(utils.convertHookData({
      all: 'thing',
      other: 'value',
      hi: [ 'foo', 'bar' ]
    }))
    .to.deep.equal({
      all: [ 'thing' ],
      other: [ 'value' ],
      hi: [ 'foo', 'bar' ]
    });
  });
});
