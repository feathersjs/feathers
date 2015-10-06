import assert from 'assert';
import getArguments from '../src/arguments';
import { noop } from '../src/arguments';

describe('Argument normalization tests', () => {
  const params = { test: 'param' };
  const callback = function() {};

  it('find', () => {
    let normal = [ params, callback ];
    let args = getArguments('find', normal);

    assert.deepEqual(args, normal);

    args = getArguments('find', [ params ]);
    assert.deepEqual(args, [ params, noop ]);

    args = getArguments('find', [callback]);
    assert.deepEqual(args, [ {}, callback ]);

    args = getArguments('find', []);
    assert.deepEqual(args, [ {}, noop ]);

    try {
      getArguments('find', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'find\' service method');
    }
  });

  it('get', () => {
    let normal = [1, params, callback];
    let args = getArguments('get', normal);

    assert.deepEqual(args, normal);

    args = getArguments('get', [2, params]);
    assert.deepEqual(args, [2, params, noop]);

    args = getArguments('get', [3, callback]);
    assert.deepEqual(args, [3, {}, callback]);

    args = getArguments('get', [4]);
    assert.deepEqual(args, [4, {}, noop]);

    try {
      getArguments('get', [callback]);
    } catch(e) {
      assert.equal(e.message, 'First parameter for \'get\' can not be a function');
    }

    try {
      getArguments('get', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'get\' service method');
    }
  });

  it('remove', () => {
    let normal = [1, params, callback];
    let args = getArguments('remove', normal);

    assert.deepEqual(args, normal);

    args = getArguments('remove', [2, params]);
    assert.deepEqual(args, [2, params, noop]);

    args = getArguments('remove', [3, callback]);
    assert.deepEqual(args, [3, {}, callback]);

    args = getArguments('remove', [4]);
    assert.deepEqual(args, [4, {}, noop]);

    try {
      args = getArguments('remove', [callback]);
    } catch(e) {
      assert.equal(e.message, 'First parameter for \'remove\' can not be a function');
    }

    try {
      getArguments('remove', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'remove\' service method');
    }
  });

  it('create', () => {
    let data = { test: 'Data' };
    let normal = [data, params, callback];
    let args = getArguments('create', normal);

    assert.deepEqual(args, normal);

    args = getArguments('create', [data, callback]);
    assert.deepEqual(args, [data, {}, callback]);

    args = getArguments('create', [data, params]);
    assert.deepEqual(args, [data, params, noop]);

    args = getArguments('create', [data]);
    assert.deepEqual(args, [data, {}, noop]);

    try {
      getArguments('create', [callback]);
    } catch(e) {
      assert.equal(e.message, 'First parameter for \'create\' must be an object');
    }

    try {
      getArguments('create', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'create\' service method');
    }
  });

  it('update', () => {
    let data = { test: 'Data' };
    let normal = [1, data, params, callback];
    let args = getArguments('update', normal);

    assert.deepEqual(args, normal);

    args = getArguments('update', [2, data, callback]);
    assert.deepEqual(args, [2, data, {}, callback]);

    args = getArguments('update', [3, data, params]);
    assert.deepEqual(args, [3, data, params, noop]);

    args = getArguments('update', [4, data]);
    assert.deepEqual(args, [4, data, {}, noop]);

    try {
      getArguments('update', [callback]);
    } catch(e) {
      assert.equal(e.message, 'First parameter for \'update\' can not be a function');
    }

    try {
      getArguments('update', [5]);
    } catch(e) {
      assert.equal(e.message, 'No data provided for \'update\'');
    }

    try {
      getArguments('update', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'update\' service method');
    }
  });

  it('patch', () => {
    let data = { test: 'Data' };
    let normal = [1, data, params, callback];
    let args = getArguments('patch', normal);

    assert.deepEqual(args, normal);

    args = getArguments('patch', [2, data, callback]);
    assert.deepEqual(args, [2, data, {}, callback]);

    args = getArguments('patch', [3, data, params]);
    assert.deepEqual(args, [3, data, params, noop]);

    args = getArguments('patch', [4, data]);
    assert.deepEqual(args, [4, data, {}, noop]);

    try {
      getArguments('patch', [callback]);
    } catch(e) {
      assert.equal(e.message, 'First parameter for \'patch\' can not be a function');
    }

    try {
      getArguments('patch', [5]);
    } catch(e) {
      assert.equal(e.message, 'No data provided for \'patch\'');
    }

    try {
      getArguments('patch', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'patch\' service method');
    }
  });
});
