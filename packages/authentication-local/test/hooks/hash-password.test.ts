import assert from 'assert';
import { Application } from '@feathersjs/feathers';

import { hooks } from '../../src';
import { createApplication, ServiceTypes } from '../fixture';

const { hashPassword } = hooks;

describe('@feathersjs/authentication-local/hooks/hash-password', () => {
  let app: Application<ServiceTypes>;

  beforeEach(() => {
    app = createApplication();
  });

  it('throws error when no field provided', () => {
    try {
      // @ts-ignore
      hashPassword();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'The hashPassword hook requires a field name option');
    }
  });

  it('errors when authentication service does not exist', async () => {
    delete (app as any).services.authentication;

    try {
      await app.service('users').create({
        email: 'dave@hashpassword.com',
        password: 'supersecret'
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message,
        'Could not find an authentication service to hash password'
      );
    }
  });

  it('errors when authentication strategy does not exist', async () => {
    delete app.services.authentication.strategies.local;

    try {
      await app.service('users').create({
        email: 'dave@hashpassword.com',
        password: 'supersecret'
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message,
        'Could not find \'local\' strategy to hash password'
      );
    }
  });

  it('errors when authentication strategy does not exist', async () => {
    const users = app.service('users');

    users.hooks({
      after: {
        create: hashPassword('password')
      }
    });

    try {
      await users.create({
        email: 'dave@hashpassword.com',
        password: 'supersecret'
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message,
        'The \'hashPassword\' hook should only be used as a \'before\' hook'
      );
    }
  });

  it('hashes password on field', async () => {
    const password = 'supersecret';

    const user = await app.service('users').create({
      email: 'dave@hashpassword.com',
      password
    });

    assert.notStrictEqual(user.password, password);
  });

  it('hashes password on array data', async () => {
    const password = 'supersecret';

    const users = await app.service('users').create([{
      email: 'dave@hashpassword.com',
      password
    }, {
      email: 'dave2@hashpassword.com',
      password: 'secret2'
    }]);

    assert.notStrictEqual(users[0].password, password);
    assert.notStrictEqual(users[1].password, 'secret2');
  });

  it('does nothing when field is not present', async () => {
    const user = await app.service('users').create({
      email: 'dave@hashpassword.com'
    });

    assert.strictEqual(user.password, undefined);
  });
});
