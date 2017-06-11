import assert from 'assert';
import Proto from 'uberproto';
import normalizer from '../../src/mixins/normalizer';
import mixins from '../../src/mixins';

describe('Argument normalizer mixin', () => {
  it('normalizer mixin is always the last to run', () => {
    const arr = mixins();
    const dummy = function () { };

    assert.equal(arr.length, 4);

    arr.push(dummy);

    assert.equal(arr[arr.length - 1], normalizer, 'Last mixin is still the normalizer');
    assert.equal(arr[arr.length - 2], dummy, 'Dummy got added before last');
  });

  // The normalization is already tests in all variations in `getArguments`
  // so we just so we only test two random samples

  it('normalizes .find without a callback', done => {
    const context = { methods: ['find'] };
    const FixtureService = Proto.extend({
      find (params, callback) {
        assert.ok(typeof callback === 'function');
        assert.equal(params.test, 'Here');
        done();
      }
    });

    normalizer.call(context, FixtureService);

    const instance = Proto.create.call(FixtureService);

    instance.find({ test: 'Here' });
  });

  it('normalizes .update without params and callback', done => {
    const context = { methods: ['update'] };
    const FixtureService = Proto.extend({
      update (id, data, params, callback) {
        assert.equal(id, 1);
        assert.ok(typeof callback === 'function');
        assert.deepEqual(data, { test: 'Here' });
        assert.deepEqual(params, {});
        done();
      }
    });

    normalizer.call(context, FixtureService);

    const instance = Proto.create.call(FixtureService);

    instance.update(1, { test: 'Here' });
  });
});
