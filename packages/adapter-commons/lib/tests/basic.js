const assert = require('assert');

module.exports = (test, app, errors, serviceName, idProp) => {
  describe('Basic Functionality', () => {
    let service;

    beforeEach(() => {
      service = app.service(serviceName);
    });

    it('service.id', () => {
      assert.strictEqual(service.id, idProp,
        'id property is set to expected name'
      );
    });

    test('service.options', () => {
      assert.ok(service.options, 'Options are available in service.options');
    });

    test('service.events', () => {
      assert.ok(service.events.includes('testing'),
        'service.events is set and includes "testing"'
      );
    });

    describe('Raw Methods', () => {
      test('._get', () => {
        assert.strictEqual(typeof service._get, 'function');
      });

      test('._find', () => {
        assert.strictEqual(typeof service._find, 'function');
      });

      test('._create', () => {
        assert.strictEqual(typeof service._create, 'function');
      });

      test('._update', () => {
        assert.strictEqual(typeof service._update, 'function');
      });

      test('._patch', () => {
        assert.strictEqual(typeof service._patch, 'function');
      });

      test('._remove', () => {
        assert.strictEqual(typeof service._remove, 'function');
      });
    });
  });
};
