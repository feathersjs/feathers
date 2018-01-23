const assert = require('assert');

const errors = require('../lib');
const { convert } = errors;

describe('@feathersjs/errors', () => {
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

    it('converts nothing', () =>
      assert.equal(convert(null), null)
    );
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

    it('instantiates every error', () => {
      Object.keys(errors).forEach(name => {
        if (name === 'convert') {
          return;
        }

        const E = errors[name];

        if (E) {
          new E('Something went wrong'); // eslint-disable-line no-new
        }
      });
    });
  });

  describe('inheritance', () => {
    it('instanceof differentiates between error types', () => {
      const error = new errors.MethodNotAllowed();
      assert.ok(!(error instanceof errors.BadRequest));
    });

    it('follows the prototypical inheritance chain', () => {
      const error = new errors.MethodNotAllowed();
      assert.ok(error instanceof Error);
      assert.ok(error instanceof errors.FeathersError);
    });

    it('has the correct constructors', () => {
      const error = new errors.NotFound();
      assert.ok(error.constructor === errors.NotFound);
      assert.ok(error.constructor.name === 'NotFound');
    });
  });

  describe('successful error creation', () => {
    describe('without custom message', () => {
      it('default error', () => {
        var error = new errors.GeneralError();
        assert.equal(error.code, 500);
        assert.equal(error.className, 'general-error');
        assert.equal(error.message, 'Error');
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

    it('allows arrays as data', () => {
      var data = [
        {
          hello: 'world'
        }
      ];
      data.errors = 'Invalid input';

      var error = new errors.GeneralError('Custom Error', data);
      assert.equal(error.data.errors, undefined);
      assert.ok(Array.isArray(error.data));
      assert.deepEqual(error.data, [{hello: 'world'}]);
      assert.equal(error.errors, 'Invalid input');
    });

    it('has proper stack trace (#78)', () => {
      try {
        throw new errors.NotFound('Not the error you are looking for');
      } catch (e) {
        const text = 'NotFound: Not the error you are looking for';

        assert.equal(e.stack.indexOf(text), 0);

        assert.ok(e.stack.indexOf('index.test.js') !== -1);

        const oldCST = Error.captureStackTrace;

        delete Error.captureStackTrace;

        try {
          throw new errors.NotFound('Not the error you are looking for');
        } catch (e) {
          assert.ok(e);
          Error.captureStackTrace = oldCST;
        }
      }
    });
  });
});
