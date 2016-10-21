if(!global._babelPolyfill) { require('babel-polyfill'); }

import assert from 'assert';

import { noop } from '../src/arguments';
import utils from '../src/hooks';

describe('hook utilities', () => {
  it('.hookObject', () => {
    let hookObject = utils.hookObject('find', 'test', [
      { some: 'thing' }, noop
    ]);
    // find
    assert.deepEqual(hookObject, {
      params: { some: 'thing' },
      method: 'find',
      type: 'test',
      callback: noop
    });

    const dummyApp = { test: true };

    hookObject = utils.hookObject('find', 'test', [
        { some: 'thing' }, noop
    ], dummyApp);

    assert.deepEqual(hookObject, {
        params: { some: 'thing' },
        method: 'find',
        type: 'test',
        callback: noop,
        app: dummyApp
      }
    );

    // get
    hookObject = utils.hookObject('get', 'test', [
      1, { some: 'thing' }, noop
    ]);

    assert.deepEqual(hookObject, {
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

    assert.deepEqual(hookObject, {
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

    assert.deepEqual(hookObject, {
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

    assert.deepEqual(hookObject, {
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      type: 'test',
      callback: noop
    });

    // patch
    hookObject = utils.hookObject('patch','test', [
      2, { my: 'data' }, { some: 'thing' }, noop
    ]);

    assert.deepEqual(hookObject, {
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

    assert.deepEqual(args, [2, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 0,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      callback: noop
    });

    assert.deepEqual(args, [0, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      params: { some: 'thing' },
      method: 'find',
      callback: noop
    });

    assert.deepEqual(args, [
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

    assert.deepEqual(args, [
      { test: 'me' },
      { some: 'thing' },
      noop
    ]);

    args = utils.makeArguments({
      id: 'testing',
      method: 'something',
      callback: noop
    });

    assert.deepEqual(args, [
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

    assert.deepEqual(args, [undefined, { my: 'data' }, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'remove',
      callback: noop
    });

    assert.deepEqual(args, [2, { some: 'thing' }, noop]);

    args = utils.makeArguments({
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'create',
      callback: noop
    });

    assert.deepEqual(args, [{ my: 'data' }, { some: 'thing' }, noop]);
  });

  it('.convertHookData', () => {
    assert.deepEqual(utils.convertHookData('test'), {
      all: [ 'test' ]
    });

    assert.deepEqual(utils.convertHookData([ 'test', 'me' ]), {
      all: [ 'test', 'me' ]
    });

    assert.deepEqual(utils.convertHookData({
      all: 'thing',
      other: 'value',
      hi: [ 'foo', 'bar' ]
    }), {
      all: [ 'thing' ],
      other: [ 'value' ],
      hi: [ 'foo', 'bar' ]
    });
  });
});
