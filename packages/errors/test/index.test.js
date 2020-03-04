const assert = require('assert');

const errors = require('../lib');
const { convert } = errors;

describe('@feathersjs/errors', () => {
  it('is CommonJS compatible', () => {
    assert.strictEqual(typeof require('../lib'), 'object');
    assert.strictEqual(typeof require('../lib').FeathersError, 'function');
  });

  describe('errors.convert', () => {
    it('converts objects to feathers errors', () => {
      const error = convert({
        name: 'BadRequest',
        message: 'Hi',
        expando: 'Me'
      });

      assert.ok(error instanceof errors.BadRequest);
      assert.strictEqual(error.message, 'Hi');
      assert.strictEqual(error.expando, 'Me');
    });

    it('converts other object to error', () => {
      let error = convert({
        message: 'Something went wrong'
      });

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'Something went wrong');

      error = convert('Something went wrong');

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'Something went wrong');
    });

    it('converts nothing', () =>
      assert.strictEqual(convert(null), null)
    );
  });

  describe('error types', () => {
    it('Bad Request', () => {
      assert.notStrictEqual(typeof errors.BadRequest, 'undefined', 'has BadRequest');
    });

    it('Not Authenticated', () => {
      assert.notStrictEqual(typeof errors.NotAuthenticated, 'undefined', 'has NotAuthenticated');
    });

    it('Payment Error', () => {
      assert.notStrictEqual(typeof errors.PaymentError, 'undefined', 'has PaymentError');
    });

    it('Forbidden', () => {
      assert.notStrictEqual(typeof errors.Forbidden, 'undefined', 'has Forbidden');
    });

    it('Not Found', () => {
      assert.notStrictEqual(typeof errors.NotFound, 'undefined', 'has NotFound');
    });

    it('Method Not Allowed', () => {
      assert.notStrictEqual(typeof errors.MethodNotAllowed, 'undefined', 'has MethodNotAllowed');
    });

    it('Not Acceptable', () => {
      assert.notStrictEqual(typeof errors.NotAcceptable, 'undefined', 'has NotAcceptable');
    });

    it('Timeout', () => {
      assert.notStrictEqual(typeof errors.Timeout, 'undefined', 'has Timeout');
    });

    it('Conflict', () => {
      assert.notStrictEqual(typeof errors.Conflict, 'undefined', 'has Conflict');
    });

    it('Gone', () => {
      assert.notStrictEqual(typeof errors.Gone, 'undefined', 'has Gone');
    });

    it('Length Required', () => {
      assert.notStrictEqual(typeof errors.LengthRequired, 'undefined', 'has LengthRequired');
    });

    it('Unprocessable', () => {
      assert.notStrictEqual(typeof errors.Unprocessable, 'undefined', 'has Unprocessable');
    });

    it('Too Many Requests', () => {
      assert.notStrictEqual(typeof errors.TooManyRequests, 'undefined', 'has TooManyRequests');
    });

    it('General Error', () => {
      assert.notStrictEqual(typeof errors.GeneralError, 'undefined', 'has GeneralError');
    });

    it('Not Implemented', () => {
      assert.notStrictEqual(typeof errors.NotImplemented, 'undefined', 'has NotImplemented');
    });

    it('Bad Gateway', () => {
      assert.notStrictEqual(typeof errors.BadGateway, 'undefined', 'has BadGateway');
    });

    it('Unavailable', () => {
      assert.notStrictEqual(typeof errors.Unavailable, 'undefined', 'has Unavailable');
    });

    it('400', () => {
      assert.notStrictEqual(typeof errors[400], 'undefined', 'has BadRequest alias');
    });

    it('401', () => {
      assert.notStrictEqual(typeof errors[401], 'undefined', 'has NotAuthenticated alias');
    });

    it('402', () => {
      assert.notStrictEqual(typeof errors[402], 'undefined', 'has PaymentError alias');
    });

    it('403', () => {
      assert.notStrictEqual(typeof errors[403], 'undefined', 'has Forbidden alias');
    });

    it('404', () => {
      assert.notStrictEqual(typeof errors[404], 'undefined', 'has NotFound alias');
    });

    it('405', () => {
      assert.notStrictEqual(typeof errors[405], 'undefined', 'has MethodNotAllowed alias');
    });

    it('406', () => {
      assert.notStrictEqual(typeof errors[406], 'undefined', 'has NotAcceptable alias');
    });

    it('408', () => {
      assert.notStrictEqual(typeof errors[408], 'undefined', 'has Timeout alias');
    });

    it('409', () => {
      assert.notStrictEqual(typeof errors[409], 'undefined', 'has Conflict alias');
    });

    it('410', () => {
      assert.notStrictEqual(typeof errors[410], 'undefined', 'has Gone alias');
    });

    it('411', () => {
      assert.notStrictEqual(typeof errors[411], 'undefined', 'has LengthRequired alias');
    });

    it('422', () => {
      assert.notStrictEqual(typeof errors[422], 'undefined', 'has Unprocessable alias');
    });

    it('429', () => {
      assert.notStrictEqual(typeof errors[429], 'undefined', 'has TooManyRequests alias');
    });

    it('500', () => {
      assert.notStrictEqual(typeof errors[500], 'undefined', 'has GeneralError alias');
    });

    it('501', () => {
      assert.notStrictEqual(typeof errors[501], 'undefined', 'has NotImplemented alias');
    });

    it('502', () => {
      assert.notStrictEqual(typeof errors[502], 'undefined', 'has BadGateway alias');
    });

    it('503', () => {
      assert.notStrictEqual(typeof errors[503], 'undefined', 'has Unavailable alias');
    });

    it('instantiates every error', () => {
      Object.keys(errors).forEach(name => {
        if (name === 'convert') {
          return;
        }

        const E = errors[name];

        if (E) {
          // tslint:disable-next-line
          new E('Something went wrong');
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
        assert.strictEqual(error.code, 500);
        assert.strictEqual(error.className, 'general-error');
        assert.strictEqual(error.message, 'Error');
        assert.notStrictEqual(error.stack, undefined);
        assert.strictEqual(error instanceof errors.GeneralError, true);
        assert.strictEqual(error instanceof errors.FeathersError, true);
      });

      it('can wrap an existing error', () => {
        var error = new errors.BadRequest(new Error());
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'Error');
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
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'Error');
        assert.deepStrictEqual(error.errors, { email: 'Email Taken', password: 'Invalid Password' });
        assert.deepStrictEqual(error.data, { foo: 'bar' });
      });

      it('with data', () => {
        var data = {
          email: 'Email Taken',
          password: 'Invalid Password'
        };

        var error = new errors.GeneralError(data);
        assert.strictEqual(error.code, 500);
        assert.strictEqual(error.message, 'Error');
        assert.deepStrictEqual(error.data, data);
      });
    });

    describe('with custom message', () => {
      it('contains our message', () => {
        var error = new errors.BadRequest('Invalid Password');
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'Invalid Password');
      });

      it('can wrap an existing error', () => {
        var error = new errors.BadRequest(new Error('Invalid Password'));
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'Invalid Password');
      });

      it('with data', () => {
        var data = {
          email: 'Email Taken',
          password: 'Invalid Password'
        };

        var error = new errors.GeneralError('Custom Error', data);
        assert.strictEqual(error.code, 500);
        assert.strictEqual(error.message, 'Custom Error');
        assert.deepStrictEqual(error.data, data);
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
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'Error');
        assert.deepStrictEqual(error.errors, { email: 'Email Taken', password: 'Invalid Password' });
        assert.deepStrictEqual(error.data, { foo: 'bar' });
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
      assert.strictEqual(JSON.stringify(error), expected);
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
      assert.strictEqual(error.data.errors, undefined);
      assert.deepStrictEqual(error.data, { foo: 'bar' });
    });

    it('allows arrays as data', () => {
      var data = [
        {
          hello: 'world'
        }
      ];
      data.errors = 'Invalid input';

      var error = new errors.GeneralError('Custom Error', data);
      assert.strictEqual(error.data.errors, undefined);
      assert.ok(Array.isArray(error.data));
      assert.deepStrictEqual(error.data, [{ hello: 'world' }]);
      assert.strictEqual(error.errors, 'Invalid input');
    });

    it('has proper stack trace (#78)', () => {
      try {
        throw new errors.NotFound('Not the error you are looking for');
      } catch (e) {
        const text = 'NotFound: Not the error you are looking for';

        assert.strictEqual(e.stack.indexOf(text), 0);

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
