var assert = require('assert');
var getArguments = require('../lib/arguments');

describe('Argument normalization tests', function() {
  var  params = { test: 'param' };
  var  callback = function() {};

  it('find', function() {
    var normal = [ params, callback ];
    var args = getArguments('find', normal);

    assert.deepEqual(args, normal);

    args = getArguments('find', [ params ]);
    assert.deepEqual(args, [ params, getArguments.noop ]);

    args = getArguments('find', [callback]);
    assert.deepEqual(args, [ {}, callback ]);

    args = getArguments('find', []);
    assert.deepEqual(args, [ {}, getArguments.noop ]);

    try {
      getArguments('find', normal.concat(['too many']));
    } catch(e) {
      assert.equal(e.message, 'Too many arguments for \'find\' service method');
    }
  });

  it('get', function() {
    var normal = [1, params, callback];
    var args = getArguments('get', normal);

    assert.deepEqual(args, normal);

    args = getArguments('get', [2, params]);
    assert.deepEqual(args, [2, params, getArguments.noop]);

    args = getArguments('get', [3, callback]);
    assert.deepEqual(args, [3, {}, callback]);

    args = getArguments('get', [4]);
    assert.deepEqual(args, [4, {}, getArguments.noop]);

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

  it('remove', function() {
    var normal = [1, params, callback];
    var args = getArguments('remove', normal);

    assert.deepEqual(args, normal);

    args = getArguments('remove', [2, params]);
    assert.deepEqual(args, [2, params, getArguments.noop]);

    args = getArguments('remove', [3, callback]);
    assert.deepEqual(args, [3, {}, callback]);

    args = getArguments('remove', [4]);
    assert.deepEqual(args, [4, {}, getArguments.noop]);

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

  it('create', function() {
    var data = { test: 'Data' };
    var normal = [data, params, callback];
    var args = getArguments('create', normal);

    assert.deepEqual(args, normal);

    args = getArguments('create', [data, callback]);
    assert.deepEqual(args, [data, {}, callback]);

    args = getArguments('create', [data, params]);
    assert.deepEqual(args, [data, params, getArguments.noop]);

    args = getArguments('create', [data]);
    assert.deepEqual(args, [data, {}, getArguments.noop]);

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

  it('update', function() {
    var data = { test: 'Data' };
    var normal = [1, data, params, callback];
    var args = getArguments('update', normal);

    assert.deepEqual(args, normal);

    args = getArguments('update', [2, data, callback]);
    assert.deepEqual(args, [2, data, {}, callback]);

    args = getArguments('update', [3, data, params]);
    assert.deepEqual(args, [3, data, params, getArguments.noop]);

    args = getArguments('update', [4, data]);
    assert.deepEqual(args, [4, data, {}, getArguments.noop]);

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

  it('patch', function() {
    var data = { test: 'Data' };
    var normal = [1, data, params, callback];
    var args = getArguments('patch', normal);

    assert.deepEqual(args, normal);

    args = getArguments('patch', [2, data, callback]);
    assert.deepEqual(args, [2, data, {}, callback]);

    args = getArguments('patch', [3, data, params]);
    assert.deepEqual(args, [3, data, params, getArguments.noop]);

    args = getArguments('patch', [4, data]);
    assert.deepEqual(args, [4, data, {}, getArguments.noop]);

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