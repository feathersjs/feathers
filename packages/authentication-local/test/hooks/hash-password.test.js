const assert = require('assert');

const getApp = require('../fixture');
const { hashPassword } = require('../../lib');

describe('@feathersjs/authentication-local/hooks/hash-password', () => {
  let app;

  beforeEach(() => {
    app = getApp();
  });

  it('throws error when no field provided', () => {
    try {
      hashPassword();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'The hashPassword hook requires a field name option');
    }
  });

  it('errors when authentication service does not exist', () => {
    delete app.services.authentication;

    return app.service('users').create({
      email: 'dave@hashpassword.com',
      password: 'supersecret'
    }).then(() => assert.fail('Should never get here')).catch(error => {
      assert.strictEqual(error.message,
        `Could not find 'authentication' service to hash password`
      );
    });
  });

  it('errors when authentication strategy does not exist', () => {
    delete app.services.authentication.strategies.local;

    return app.service('users').create({
      email: 'dave@hashpassword.com',
      password: 'supersecret'
    }).then(() => assert.fail('Should never get here')).catch(error => {
      assert.strictEqual(error.message,
        `Could not find 'local' strategy to hash password`
      );
    });
  });

  it('errors when authentication strategy does not exist', () => {
    const users = app.service('users');

    users.hooks({
      after: {
        create: hashPassword('password')
      }
    });

    return users.create({
      email: 'dave@hashpassword.com',
      password: 'supersecret'
    }).then(() => assert.fail('Should never get here')).catch(error => {
      assert.strictEqual(error.message,
        `The 'hashPassword' hook should only be used as a 'before' hook`
      );
    });
  });

  it('hashes password on field', () => {
    const password = 'supersecret';

    return app.service('users').create({
      email: 'dave@hashpassword.com',
      password
    }).then(user => {
      assert.notStrictEqual(user.password, password);
    });
  });

  it('does nothing when field is not present', () => {
    return app.service('users').create({
      email: 'dave@hashpassword.com'
    }).then(user => {
      assert.strictEqual(user.password, undefined);
    });
  });
});
