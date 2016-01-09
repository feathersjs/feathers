import assert from 'assert';
import Proto from 'uberproto';
import mixin from '../../src/mixins/promise';

const create = Proto.create;

describe('Promises/A+ mixin', () => {
  it('Calls a callback when a promise is returned from the original service', done => {
    // A dummy context (this will normally be the application)
    const context = { methods: ['get'] };
    const FixtureService = Proto.extend({
      get: function (id) {
        return Promise.resolve({
          id: id,
          description: `You have to do ${id}`
        });
      }
    });

    mixin.call(context, FixtureService);

    const instance = create.call(FixtureService);
    instance.get('dishes', {}, function (error, data) {
      assert.deepEqual(data, {
        id: 'dishes',
        description: 'You have to do dishes'
      });
      done();
    });
  });

  it('calls back with an error for a failing deferred', done => {
    // A dummy context (this will normally be the application)
    var context = {
      methods: ['get']
    };
    var FixtureService = Proto.extend({
      get: function () {
        return Promise.reject(new Error('Something went wrong'));
      }
    });

    mixin.call(context, FixtureService);

    var instance = create.call(FixtureService);
    instance.get('dishes', {}, function (error) {
      assert.ok(error);
      assert.equal(error.message, 'Something went wrong');
      done();
    });
  });

  it('does not try to call the callback if it does not exist', function(done) {
    // A dummy context (this will normally be the application)
    const context = { methods: ['create'] };
    const FixtureService = Proto.extend({
      create(data) {
        return Promise.resolve(data);
      }
    });
    const original = {
      id: 'laundry',
      description: 'You have to do laundry'
    };

    mixin.call(context, FixtureService);

    const instance = create.call(FixtureService);
    instance.create(original, {}).then(data => {
      assert.deepEqual(data, original);
      done();
    });
  });
});
