import assert from 'assert';
import Proto from 'uberproto';
import { EventEmitter } from 'events';
import mixinEvent from '../../src/mixins/event';

const create = Proto.create;

describe('Event mixin', () => {
  it('initializes', () => {
    const FixtureService = Proto.extend({
      setup(arg) {
        return `Original setup: ${arg}`;
      }
    });

    mixinEvent(FixtureService);

    assert.equal(typeof FixtureService.setup, 'function');
    assert.equal(typeof FixtureService.on, 'function');
    assert.equal(typeof FixtureService.emit, 'function');

    const instance = create.call(FixtureService);
    assert.equal('Original setup: Test', instance.setup('Test'));
    assert.ok(instance._rubberDuck instanceof EventEmitter);

    const existingMethodsService = {
      setup(arg) {
        return `Original setup from object: ${arg}`;
      }
    };

    Proto.mixin(EventEmitter.prototype, existingMethodsService);

    assert.equal('Original setup from object: Test', existingMethodsService.setup('Test'));
    assert.equal(typeof existingMethodsService.on, 'function');
  });

  it('serviceError', function (done) {
    var FixtureService = Proto.extend({
      create(data, params, cb) {
        cb(new Error('Something went wrong'));
      }
    });

    const instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('serviceError', function (error) {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Something went wrong');
      done();
    });

    instance.create({ name: 'Tester' }, {},
      error => assert.ok(error instanceof Error));
  });

  it('created', done => {
    const FixtureService = Proto.extend({
      create: function (data, params, callback) {
        callback(null, {
          id: 10,
          name: data.name
        });
      }
    });

    const instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('created', function (data, args) {
      assert.equal(data.id, 10);
      assert.equal(data.name, 'Tester');
      assert.equal(args.data.name, 'Tester');
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.create({
      name: 'Tester'
    }, {
      custom: 'value'
    }, (error, data) => assert.equal(data.id, 10));
  });

  it('updated', done => {
    const FixtureService = Proto.extend({
      update(id, data, params, cb) {
        setTimeout(function () {
          cb(null, {
            id: id,
            name: data.name
          });
        }, 20);
      }
    });

    const instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('updated', function (data, args) {
      assert.equal(data.id, 12);
      assert.equal(data.name, 'Updated tester');
      assert.equal(args.id, 12);
      assert.equal(args.data.name, 'Updated tester');
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.update(12, {
      name: 'Updated tester'
    }, {
      custom: 'value'
    }, function (error, data) {
      assert.equal(data.id, 12);
    });
  });

  it('removed', done => {
    const FixtureService = Proto.extend({
      remove(id, params, cb) {
        setTimeout(function () {
          cb(null, {
            id: id
          });
        }, 20);
      }
    });

    const instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('removed', function (data, args) {
      assert.equal(data.id, 27);
      assert.equal(args.id, 27);
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.remove(27, {
      custom: 'value'
    }, function (error, data) {
      assert.equal(data.id, 27);
    });
  });

  it('array event data emits multiple event', done => {
    const fixture = [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ];
    const FixtureService = Proto.extend({
      create(data, params, cb) {
        setTimeout(function () {
          cb(null, fixture);
        }, 20);
      }
    });

    const instance = create.call(FixtureService);
    let counter = 0;

    mixinEvent(instance);

    instance.on('created', function (data) {
      assert.equal(data.id, counter);
      counter++;
      if(counter === fixture.length) {
        done();
      }
    });

    instance.create({}, {}, function () {});
  });

  it('does not punch when service has an events list (#118)', done => {
    const FixtureService = Proto.extend({
      events: [ 'created' ],
      create(data, params, cb) {
        setTimeout(function () {
          cb(null, {
            id: 10,
            name: data.name
          });
        }, 20);
      }
    });

    FixtureService.mixin(EventEmitter.prototype);

    const instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('created', function (data) {
      assert.deepEqual(data, { custom: 'event' });
      done();
    });

    instance.create({
      name: 'Tester'
    }, {}, function (error, data) {
      assert.equal(data.id, 10);
      instance.emit('created', { custom: 'event' });
    });
  });

  it('sets hook.app', done => {
      const FixtureService = Proto.extend({
          update(id, data, params, cb) {
              setTimeout(function () {
                  cb(null, {
                      id: id,
                      name: data.name
                  });
              }, 20);
          }
      });

      const instance = create.call(FixtureService);
      const dummyApp = { isApp: true };

      mixinEvent.call(dummyApp, instance);

      instance.on('updated', function (data, hook) {
          assert.deepEqual(hook.app, dummyApp);
          done();
      });

      instance.update(12, { name: 'Updated tester' }, {}, function () {});
  });
});
