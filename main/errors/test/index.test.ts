import { it, assert, assertEquals, assertStrictEquals, assertNotStrictEquals } from '../../commons/src/testing.ts'
import * as errors from '../src/index.ts';

const { convert } = errors;

// 'errors.convert'
it('converts objects to feathers errors', () => {
  const error = convert({
    name: 'BadRequest',
    message: 'Hi',
    expando: 'Me'
  });

  assertStrictEquals(error.message, 'Hi');
  assertStrictEquals(error.expando, 'Me');
  assert(error instanceof errors.BadRequest);
});

it('converts other object to error', () => {
  let error = convert({
    message: 'Something went wrong'
  });

  assert(error instanceof Error);
  assertStrictEquals(error.message, 'Something went wrong');

  error = convert('Something went wrong');

  assert(error instanceof Error);
  assertStrictEquals(error.message, 'Something went wrong');
});

it('converts nothing', () =>
  assertEquals(convert(null), null)
);

// 'error types'
it('Bad Request', () => {
  assertNotStrictEquals(typeof errors.BadRequest, 'undefined', 'has BadRequest');
});

it('Not Authenticated', () => {
  assertNotStrictEquals(typeof errors.NotAuthenticated, 'undefined', 'has NotAuthenticated');
});

it('Payment Error', () => {
  assertNotStrictEquals(typeof errors.PaymentError, 'undefined', 'has PaymentError');
});

it('Forbidden', () => {
  assertNotStrictEquals(typeof errors.Forbidden, 'undefined', 'has Forbidden');
});

it('Not Found', () => {
  assertNotStrictEquals(typeof errors.NotFound, 'undefined', 'has NotFound');
});

it('Method Not Allowed', () => {
  assertNotStrictEquals(typeof errors.MethodNotAllowed, 'undefined', 'has MethodNotAllowed');
});

it('Not Acceptable', () => {
  assertNotStrictEquals(typeof errors.NotAcceptable, 'undefined', 'has NotAcceptable');
});

it('Timeout', () => {
  assertNotStrictEquals(typeof errors.Timeout, 'undefined', 'has Timeout');
});

it('Conflict', () => {
  assertNotStrictEquals(typeof errors.Conflict, 'undefined', 'has Conflict');
});

it('Gone', () => {
  assertNotStrictEquals(typeof errors.Gone, 'undefined', 'has Gone');
});

it('Length Required', () => {
  assertNotStrictEquals(typeof errors.LengthRequired, 'undefined', 'has LengthRequired');
});

it('Unprocessable', () => {
  assertNotStrictEquals(typeof errors.Unprocessable, 'undefined', 'has Unprocessable');
});

it('Too Many Requests', () => {
  assertNotStrictEquals(typeof errors.TooManyRequests, 'undefined', 'has TooManyRequests');
});

it('General Error', () => {
  assertNotStrictEquals(typeof errors.GeneralError, 'undefined', 'has GeneralError');
});

it('Not Implemented', () => {
  assertNotStrictEquals(typeof errors.NotImplemented, 'undefined', 'has NotImplemented');
});

it('Bad Gateway', () => {
  assertNotStrictEquals(typeof errors.BadGateway, 'undefined', 'has BadGateway');
});

it('Unavailable', () => {
  assertNotStrictEquals(typeof errors.Unavailable, 'undefined', 'has Unavailable');
});

it('400', () => {
  assertNotStrictEquals(typeof errors.errors[400], 'undefined', 'has BadRequest alias');
});

it('401', () => {
  assertNotStrictEquals(typeof errors.errors[401], 'undefined', 'has NotAuthenticated alias');
});

it('402', () => {
  assertNotStrictEquals(typeof errors.errors[402], 'undefined', 'has PaymentError alias');
});

it('403', () => {
  assertNotStrictEquals(typeof errors.errors[403], 'undefined', 'has Forbidden alias');
});

it('404', () => {
  assertNotStrictEquals(typeof errors.errors[404], 'undefined', 'has NotFound alias');
});

it('405', () => {
  assertNotStrictEquals(typeof errors.errors[405], 'undefined', 'has MethodNotAllowed alias');
});

it('406', () => {
  assertNotStrictEquals(typeof errors.errors[406], 'undefined', 'has NotAcceptable alias');
});

it('408', () => {
  assertNotStrictEquals(typeof errors.errors[408], 'undefined', 'has Timeout alias');
});

it('409', () => {
  assertNotStrictEquals(typeof errors.errors[409], 'undefined', 'has Conflict alias');
});

it('410', () => {
  assertNotStrictEquals(typeof errors.errors[410], 'undefined', 'has Gone alias');
});

it('411', () => {
  assertNotStrictEquals(typeof errors.errors[411], 'undefined', 'has LengthRequired alias');
});

it('422', () => {
  assertNotStrictEquals(typeof errors.errors[422], 'undefined', 'has Unprocessable alias');
});

it('429', () => {
  assertNotStrictEquals(typeof errors.errors[429], 'undefined', 'has TooManyRequests alias');
});

it('500', () => {
  assertNotStrictEquals(typeof errors.errors[500], 'undefined', 'has GeneralError alias');
});

it('501', () => {
  assertNotStrictEquals(typeof errors.errors[501], 'undefined', 'has NotImplemented alias');
});

it('502', () => {
  assertNotStrictEquals(typeof errors.errors[502], 'undefined', 'has BadGateway alias');
});

it('503', () => {
  assertNotStrictEquals(typeof errors.errors[503], 'undefined', 'has Unavailable alias');
});

it('instantiates every error', () => {
  const index: any = errors.errors;

  Object.keys(index).forEach(name => {
    const E = index[name];

    if (E) {
      // tslint:disable-next-line
      new E('Something went wrong');
    }
  });
});

// 'inheritance'
it('instanceof differentiates between error types', () => {
  const error = new errors.MethodNotAllowed();
  assert(!(error instanceof errors.BadRequest));
});

it('follows the prototypical inheritance chain', () => {
  const error = new errors.MethodNotAllowed();
  assert(error instanceof Error);
  assert(error instanceof errors.FeathersError);
});

it('has the correct constructors', () => {
  const error = new errors.NotFound();
  assert(error.constructor === errors.NotFound);
  assert(error.constructor.name === 'NotFound');
});

// 'successful error creation'
// 'without custom message'
it('default error', () => {
  const error = new errors.GeneralError();
  assertStrictEquals(error.code, 500);
  assertStrictEquals(error.className, 'general-error');
  assertStrictEquals(error.message, 'Error');
  assertStrictEquals(error.data, undefined);
  assertStrictEquals(error.errors, undefined);
  assertNotStrictEquals(error.stack, undefined);
  assertStrictEquals(error instanceof errors.GeneralError, true);
  assertStrictEquals(error instanceof errors.FeathersError, true);
});

it('can wrap an existing error', () => {
  const error = new errors.BadRequest(new Error());
  assertStrictEquals(error.code, 400);
  assertStrictEquals(error.message, 'Error');
});

it('with multiple errors', () => {
  const data = {
    errors: {
      email: 'Email Taken',
      password: 'Invalid Password'
    },
    foo: 'bar'
  };

  const error = new errors.BadRequest(data);
  assertStrictEquals(error.code, 400);
  assertStrictEquals(error.message, 'Error');
  assertEquals(error.errors, { email: 'Email Taken', password: 'Invalid Password' });
  assertEquals(error.data, { foo: 'bar' });
});

it('with data', () => {
  const data = {
    email: 'Email Taken',
    password: 'Invalid Password'
  };

  const error = new errors.GeneralError(data);
  assertStrictEquals(error.code, 500);
  assertStrictEquals(error.message, 'Error');
  assertEquals(error.data, data);
});

// 'with custom message'
it('contains our message', () => {
  const error = new errors.BadRequest('Invalid Password');
  assertStrictEquals(error.code, 400);
  assertStrictEquals(error.message, 'Invalid Password');
});

it('can wrap an existing error', () => {
  const error = new errors.BadRequest(new Error('Invalid Password'));
  assertStrictEquals(error.code, 400);
  assertStrictEquals(error.message, 'Invalid Password');
});

it('with data', () => {
  const data = {
    email: 'Email Taken',
    password: 'Invalid Password'
  };

  const error = new errors.GeneralError('Custom Error', data);
  assertStrictEquals(error.code, 500);
  assertStrictEquals(error.message, 'Custom Error');
  assertEquals(error.data, data);
});

it('with multiple errors', () => {
  const data = {
    errors: {
      email: 'Email Taken',
      password: 'Invalid Password'
    },
    foo: 'bar'
  };

  const error = new errors.BadRequest(data);

  assertStrictEquals(error.code, 400);
  assertStrictEquals(error.message, 'Error');
  assertEquals(error.errors, { email: 'Email Taken', password: 'Invalid Password' });
  assertEquals(error.data, { foo: 'bar' });
});

it('can return JSON', () => {
  const data = {
    errors: {
      email: 'Email Taken',
      password: 'Invalid Password'
    },
    foo: 'bar'
  };

  const expected = '{"name":"GeneralError","message":"Custom Error","code":500,"className":"general-error","data":{"foo":"bar"},"errors":{"email":"Email Taken","password":"Invalid Password"}}';

  const error = new errors.GeneralError('Custom Error', data);
  assertStrictEquals(JSON.stringify(error), expected);
});

it('can handle immutable data', () => {
  const data = {
    errors: {
      email: 'Email Taken',
      password: 'Invalid Password'
    },
    foo: 'bar'
  };

  const error = new errors.GeneralError('Custom Error', Object.freeze(data));
  assertStrictEquals(error.data.errors, undefined);
  assertEquals(error.data, { foo: 'bar' });
});

it('allows arrays as data', () => {
  const data = [
    {
      hello: 'world'
    }
  ];

  const error = new errors.GeneralError('Custom Error', data);
  assertStrictEquals(error.data.errors, undefined);
  assert(Array.isArray(error.data));
  assertEquals(error.data, [{ hello: 'world' }]);
});

it('has proper stack trace (#78)', () => {
  try {
    throw new errors.NotFound('Not the error you are looking for');
  } catch (e: any) {
    const text = 'NotFound: Not the error you are looking for';

    assertStrictEquals(e.stack.indexOf(text), 0);

    assert(e.stack.indexOf('index.test.ts') !== -1);

    const oldCST = Error.captureStackTrace;

    // @ts-ignore suppress
    delete Error.captureStackTrace;

    try {
      throw new errors.NotFound('Not the error you are looking for');
    } catch (e: any) {
      assert(e);
      Error.captureStackTrace = oldCST;
    }
  }
});
