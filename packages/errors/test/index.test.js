import assert from 'assert';
import { types, errors } from '../src';

describe('feathers-errors', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'object');
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

    it('Unprocessable', () => {
      assert.notEqual(typeof errors.Unprocessable, 'undefined', 'has Unprocessable');
    });

    it('General Error', () => {
      assert.notEqual(typeof errors.GeneralError, 'undefined', 'has GeneralError');
    });

    it('Not Implemented', () => {
      assert.notEqual(typeof errors.NotImplemented, 'undefined', 'has NotImplemented');
    });

    it('Unavailable', () => {
      assert.notEqual(typeof errors.Unavailable, 'undefined', 'has Unavailable');
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
