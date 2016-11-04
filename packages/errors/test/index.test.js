if (!global._babelPolyfill) { require('babel-polyfill'); }

import assert from 'assert';
import { types, errors, convert } from '../src';

describe('feathers-errors', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'object');
    assert.equal(typeof require('../lib').FeathersError, 'function');
  });

  describe('errors.convert', () => {
    it('converts objects to feathers errors', () => {
      const error = convert({
        name: 'BadRequest',
        message: 'Hi',
        expando: 'Me'
      });

      assert.ok(error instanceof errors.BadRequest);
      assert.equal(error.message, 'Hi');
      assert.equal(error.expando, 'Me');
    });

    it('converts other object to error', () => {
      let error = convert({
        message: 'Something went wrong'
      });

      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Something went wrong');

      error = convert('Something went wrong');

      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Something went wrong');
    });
  });

  describe('error types', () => {
    it('Bad Request', () => {
      assert.notEqual(typeof errors.BadRequest, 'undefined', 'has BadRequest');
    });

    it('Not Authenticated', () => {
      assert.notEqual(typeof errors.NotAuthenticated, 'undefined', 'has NotAuthenticated');
    });

    it('Payment Error', () => {
      assert.notEqual(typeof errors.PaymentError, 'undefined', 'has PaymentError');
    });

    it('Forbidden', () => {
      assert.notEqual(typeof errors.Forbidden, 'undefined', 'has Forbidden');
    });

    it('Not Found', () => {
      assert.notEqual(typeof errors.NotFound, 'undefined', 'has NotFound');
    });

    it('Method Not Allowed', () => {
      assert.notEqual(typeof errors.MethodNotAllowed, 'undefined', 'has MethodNotAllowed');
    });

    it('Not Acceptable', () => {
      assert.notEqual(typeof errors.NotAcceptable, 'undefined', 'has NotAcceptable');
    });

    it('Timeout', () => {
      assert.notEqual(typeof errors.Timeout, 'undefined', 'has Timeout');
    });

    it('Conflict', () => {
      assert.notEqual(typeof errors.Conflict, 'undefined', 'has Conflict');
    });

    it('Length Required', () => {
      assert.notEqual(typeof errors.LengthRequired, 'undefined', 'has LengthRequired');
    });

    it('Unprocessable', () => {
      assert.notEqual(typeof errors.Unprocessable, 'undefined', 'has Unprocessable');
    });

    it('Too Many Requests', () => {
      assert.notEqual(typeof errors.TooManyRequests, 'undefined', 'has TooManyRequests');
    });

    it('General Error', () => {
      assert.notEqual(typeof errors.GeneralError, 'undefined', 'has GeneralError');
    });

    it('Not Implemented', () => {
      assert.notEqual(typeof errors.NotImplemented, 'undefined', 'has NotImplemented');
    });

    it('Bad Gateway', () => {
      assert.notEqual(typeof errors.BadGateway, 'undefined', 'has BadGateway');
    });

    it('Unavailable', () => {
      assert.notEqual(typeof errors.Unavailable, 'undefined', 'has Unavailable');
    });

    it('400', () => {
      assert.notEqual(typeof errors[400], 'undefined', 'has BadRequest alias');
    });

    it('401', () => {
      assert.notEqual(typeof errors[401], 'undefined', 'has NotAuthenticated alias');
    });

    it('402', () => {
      assert.notEqual(typeof errors[402], 'undefined', 'has PaymentError alias');
    });

    it('403', () => {
      assert.notEqual(typeof errors[403], 'undefined', 'has Forbidden alias');
    });

    it('404', () => {
      assert.notEqual(typeof errors[404], 'undefined', 'has NotFound alias');
    });

    it('405', () => {
      assert.notEqual(typeof errors[405], 'undefined', 'has MethodNotAllowed alias');
    });

    it('406', () => {
      assert.notEqual(typeof errors[406], 'undefined', 'has NotAcceptable alias');
    });

    it('408', () => {
      assert.notEqual(typeof errors[408], 'undefined', 'has Timeout alias');
    });

    it('409', () => {
      assert.notEqual(typeof errors[409], 'undefined', 'has Conflict alias');
    });

    it('411', () => {
      assert.notEqual(typeof errors[411], 'undefined', 'has LengthRequired alias');
    });

    it('422', () => {
      assert.notEqual(typeof errors[422], 'undefined', 'has Unprocessable alias');
    });

    it('429', () => {
      assert.notEqual(typeof errors[429], 'undefined', 'has TooManyRequests alias');
    });

    it('500', () => {
      assert.notEqual(typeof errors[500], 'undefined', 'has GeneralError alias');
    });

    it('501', () => {
      assert.notEqual(typeof errors[501], 'undefined', 'has NotImplemented alias');
    });

    it('502', () => {
      assert.notEqual(typeof errors[502], 'undefined', 'has BadGateway alias');
    });

    it('503', () => {
      assert.notEqual(typeof errors[503], 'undefined', 'has Unavailable alias');
    });
  });

  it('exposes errors via types for backwards compatibility', () => {
    assert.notEqual(typeof types.BadRequest, 'undefined', 'has BadRequest');
  });

  describe('successful error creation', () => {
    describe('without custom message', () => {
      it('default error', () => {
        var error = new errors.GeneralError();
        assert.equal(error.code, 500);
        assert.equal(error.message, 'Error');
        assert.equal(error.className, 'general-error');
        assert.notEqual(error.stack, undefined);
        assert.equal(error instanceof errors.GeneralError, true);
        assert.equal(error instanceof errors.FeathersError, true);
      });

      it('can wrap an existing error', () => {
        var error = new errors.BadRequest(new Error());
        assert.equal(error.code, 400);
        assert.equal(error.message, 'Error');
      });

      it('with multiple errors', () => {
        var data = {
          errors: {
            email: 'Email Taken',
            password: 'Invalid Password'
          },
          foo: 'bar'
        };

        var error = new errors.BadRequest(data);
        assert.equal(error.code, 400);
        assert.equal(error.message, 'Error');
        assert.deepEqual(error.errors, {email: 'Email Taken', password: 'Invalid Password'});
        assert.deepEqual(error.data, {foo: 'bar'});
      });

      it('with data', () => {
        var data = {
          email: 'Email Taken',
          password: 'Invalid Password'
        };

        var error = new errors.GeneralError(data);
        assert.equal(error.code, 500);
        assert.equal(error.message, 'Error');
        assert.deepEqual(error.data, data);
      });
    });

    describe('with custom message', () => {
      it('contains our message', () => {
        var error = new errors.BadRequest('Invalid Password');
        assert.equal(error.code, 400);
        assert.equal(error.message, 'Invalid Password');
      });

      it('can wrap an existing error', () => {
        var error = new errors.BadRequest(new Error('Invalid Password'));
        assert.equal(error.code, 400);
        assert.equal(error.message, 'Invalid Password');
      });

      it('with data', () => {
        var data = {
          email: 'Email Taken',
          password: 'Invalid Password'
        };

        var error = new errors.GeneralError('Custom Error', data);
        assert.equal(error.code, 500);
        assert.equal(error.message, 'Custom Error');
        assert.deepEqual(error.data, data);
      });

      it('with multiple errors', () => {
        var data = {
          errors: {
            email: 'Email Taken',
            password: 'Invalid Password'
          },
          foo: 'bar'
        };

        var error = new errors.BadRequest(data);
        assert.equal(error.code, 400);
        assert.equal(error.message, 'Error');
        assert.deepEqual(error.errors, {email: 'Email Taken', password: 'Invalid Password'});
        assert.deepEqual(error.data, {foo: 'bar'});
      });
    });

    it('can return JSON', () => {
      var data = {
        errors: {
          email: 'Email Taken',
          password: 'Invalid Password'
        },
        foo: 'bar'
      };

      var expected = '{"name":"GeneralError","message":"Custom Error","code":500,"className":"general-error","data":{"foo":"bar"},"errors":{"email":"Email Taken","password":"Invalid Password"}}';

      var error = new errors.GeneralError('Custom Error', data);
      assert.equal(JSON.stringify(error), expected);
    });

    it('can handle immutable data', () => {
      var data = {
        errors: {
          email: 'Email Taken',
          password: 'Invalid Password'
        },
        foo: 'bar'
      };

      var error = new errors.GeneralError('Custom Error', Object.freeze(data));
      assert.equal(error.data.errors, undefined);
      assert.deepEqual(error.data, {foo: 'bar'});
    });
  });
});
