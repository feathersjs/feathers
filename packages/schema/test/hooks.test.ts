import assert from 'assert';
import { app, MessageResult, UserResult } from './fixture';

describe('@feathersjs/schema/hooks', () => {
  const text = 'Hi there';

  let message: MessageResult;
  let user: UserResult;

  before(async () => {
    user = (await app.service('users').create([{
      email: 'hello@feathersjs.com',
      password: 'supersecret'
    }]))[0];
    message = await app.service('messages').create({
      text,
      userId: user.id
    });
  });

  it('validates data', async () => {
    assert.rejects(() => app.service('users').create({ password: 'failing' }), {
      name: 'BadRequest'
    });
  });

  it('resolves results and handles resolver errors (#2534)', async () => {
    // eslint-disable-next-line
    const { password, ...externalUser } = user;
    const payload = {
      userId: user.id,
      text
    }

    assert.ok(user);
    assert.strictEqual(user.password, 'hashed', 'Resolved data');
    assert.deepStrictEqual(message, {
      id: 0,
      user,
      ...payload
    });

    const messages = await app.service('messages').find({
      provider: 'external'
    });

    assert.deepStrictEqual(messages, [{
      id: 0,
      user: externalUser,
      ...payload
    }]);

    await assert.rejects(() => app.service('messages').find({
      provider: 'external',
      error: true
    }), {
      name: 'BadRequest',
      message: 'Error resolving data',
      code: 400,
      className: 'bad-request',
      data: {
        user: {
          name: 'GeneralError',
          message: 'This is an error',
          code: 500,
          className: 'general-error'
        }
      }
    });
  });

  it('validates and converts the query', async () => {
    const otherUser = await app.service('users').create({
      email: 'helloagain@feathersjs.com',
      password: 'supersecret'
    });

    await app.service('messages').create({
      text,
      userId: otherUser.id
    });

    const messages = await app.service('messages').find({
      query: {
        userId: `${user.id}`
      }
    }) as MessageResult[];

    assert.strictEqual(messages.length, 1);

    const userMessages = await app.service('messages').find({
      user
    }) as MessageResult[];

    assert.strictEqual(userMessages.length, 1);
    assert.strictEqual(userMessages[0].userId, user.id);

    const msg = await app.service('messages').get(userMessages[0].id, {
      query: {
        $resolve: ['user']
      }
    });

    assert.deepStrictEqual(msg, {
      user
    });

    assert.rejects(() => app.service('messages').find({
      query: {
        thing: 'me'
      }
    }), {
      name: 'BadRequest',
      message: 'validation failed',
      code: 400,
      className: 'bad-request',
      data: [
        {
          instancePath: '',
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: 'thing' },
          message: 'must NOT have additional properties'
        }
      ]
    });
  });
});
