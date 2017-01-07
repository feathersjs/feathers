import assert from 'assert';
import { convertFilterData, promisify, normalizeError, normalizeArgs } from '../src/utils';

describe('utils', () => {
  it('convertFilterData', () => {
    const fn = function () {};

    assert.deepEqual(convertFilterData(fn), {
      all: [fn]
    });

    assert.deepEqual(convertFilterData({
      test: fn
    }), {
      test: [fn]
    });

    assert.deepEqual(convertFilterData({
      testing: [fn, fn]
    }), {
      testing: [fn, fn]
    });
  });

  it('promisify', done => {
    const context = {};
    const message = 'a can not be null';
    const fn = function (a, b, callback) {
      assert.equal(this, context);
      if (a === null) {
        return callback(new Error(message));
      }
      callback(null, a + b);
    };

    promisify(fn, context, 1, 2).then(result => {
      assert.equal(result, 3);
      promisify(fn, context, null, null).catch(error => {
        assert.equal(error.message, message);
        done();
      });
    });
  });

  it('normalizeError', () => {
    const e = new Error('Testing');
    e.hook = 'test';
    e.expando = true;

    const obj = normalizeError(e);

    assert.ok(typeof obj === 'object');
    assert.ok(!(obj instanceof Error));
    assert.ok(typeof obj.hook === 'undefined');
    assert.equal(obj.message, 'Testing');
    assert.equal(obj.expando, true);
  });

  it('normalizeArgs', () => {
    const usualArgs = [ undefined, { test: true }, function () { } ];
    const packedArgs = [ [ undefined, { test: true } ], function () { } ];
    const usualArgsWithArray = [ [ undefined, { test: true } ], {}, function () { } ];

    const normalizedUsualArgs = normalizeArgs(usualArgs);
    const normalizedPackedArgs = normalizeArgs(packedArgs);
    const normalizedUsualArgsWithArray = normalizeArgs(usualArgsWithArray);

    assert.equal(usualArgs[0], normalizedUsualArgs[0]);
    assert.deepEqual(usualArgs[1], normalizedUsualArgs[1]);
    assert.equal(normalizedUsualArgs.length, 3);

    assert.equal(usualArgs[0], normalizedPackedArgs[0]);
    assert.deepEqual(usualArgs[1], normalizedPackedArgs[1]);
    assert.equal(normalizedPackedArgs.length, 3);

    assert.equal(normalizedUsualArgsWithArray.length, 3);
  });
});
