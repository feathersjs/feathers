import assert from 'assert';
import {
  feathers, HookContext, Application as FeathersApplication
} from '@feathersjs/feathers';
import { memory, Service } from '@feathersjs/memory';

import {
  schema, resolve, Infer, resolveResult
} from '../src';

describe('@feathersjs/schema/hooks', () => {
  const userSchema = schema({
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      id: { type: 'number' },
      email: { type: 'string' },
      password: { type: 'string' }
    }
  } as const);

  const messageSchema = schema({
    type: 'object',
    required: ['text', 'userId'],
    additionalProperties: false,
    properties: {
      text: { type: 'string' },
      userId: { type: 'number' }
    }
  } as const);

  const userResultResolver = resolve({
    properties: {
      password: (value: string, _user: any, context: HookContext<Application>) => {
        return context.params.provider ? undefined : value;
      }
    }
  });

  const messageResultResolver = resolve({
    properties: {
      user: (
        _value: unknown,
        message: Infer<typeof messageSchema>,
        context: HookContext<Application>
      ) => {
        const { userId } = message;

        return context.app.service('users').get(userId, context.params);
      }
    }
  });

  type User = Infer<typeof userSchema>;
  type Message = Infer<typeof messageSchema, typeof messageResultResolver>;
  type ServiceTypes = {
    users: Service<User>,
    messages: Service<Message>
  }
  type Application = FeathersApplication<ServiceTypes>;

  const app = feathers<ServiceTypes>()
    .use('users', memory())
    .use('messages', memory());

  app.service('messages').hooks([
    resolveResult(messageResultResolver)
  ]);

  app.service('users').hooks([
    resolveResult(userResultResolver)
  ]);

  it('resolves the result', async () => {
    const user = await app.service('users').create({
      email: 'hello@feathersjs.com',
      password: 'supersecret'
    });

    const message = await app.service('messages').create({
      text: 'Hi there',
      userId: user.id
    });

    assert.ok(user);
    assert.deepStrictEqual(message, {
      id: 0,
      text: 'Hi there',
      userId: user.id,
      user
    });
  });
});
