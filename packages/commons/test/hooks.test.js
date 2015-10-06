import assert from 'assert';

import { noop } from '../src/arguments';
import utils from '../src/hooks';

function hookMaker(name) {
  return function() {
    return utils.hookObject(name, 'test', arguments);
  };
}

describe('hook utilities', () => {
  it('.hookObject', () => {
    // find
    assert.deepEqual(hookMaker('find')({ some: 'thing' }, noop), {
      params: { some: 'thing' },
      method: 'find',
      type: 'test',
      callback: noop
    });

    // get
    assert.deepEqual(hookMaker('get')(1, { some: 'thing' }, noop), {
      id: 1,
      params: { some: 'thing' },
      method: 'get',
      type: 'test',
      callback: noop
    });

    // remove
    assert.deepEqual(hookMaker('remove')(1, { some: 'thing' }, noop), {
      id: 1,
      params: { some: 'thing' },
      method: 'remove',
      type: 'test',
      callback: noop
    });

    // create
    assert.deepEqual(hookMaker('create')({ my: 'data' }, { some: 'thing' }, noop), {
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'create',
      type: 'test',
      callback: noop
    });

    // update
    assert.deepEqual(hookMaker('update')(2, { my: 'data' }, { some: 'thing' }, noop), {
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'update',
      type: 'test',
      callback: noop
    });

    // patch
    assert.deepEqual(hookMaker('patch')(2, { my: 'data' }, { some: 'thing' }, noop), {
      id: 2,
      data: { my: 'data' },
      params: { some: 'thing' },
      method: 'patch',
      type: 'test',
      callback: noop
    });
  });

  it('.makeArguments', () => {
    var args = utils.makeArguments({
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
